// controllers/userController.js
import User from '../models/User.js';
import Site from '../models/Site.js';
import Supplier from '../models/Supplier.js';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyName: user.companyName,
            description: user.description,
            address: user.address,
            phone: user.phone,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }

        // Update new supplier fields
        if (user.role === 'fournisseur') {
            user.companyName = req.body.companyName || user.companyName;
            user.description = req.body.description || user.description;
            user.address = req.body.address || user.address;
            user.phone = req.body.phone || user.phone;
        }

        const updatedUser = await user.save();

        res.json({
             _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            companyName: updatedUser.companyName,
            description: updatedUser.description,
            address: updatedUser.address,
            phone: updatedUser.phone,
        });

    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

/**
 * @desc    Get all suppliers (users with role 'fournisseur')
 * @route   GET /api/users/suppliers
 * @access  Private
 * @note    Si l'utilisateur a un siteId, filtre les fournisseurs par zone de livraison
 */
export const getSuppliers = async (req, res) => {
    try {
        let suppliers = await User.find({ role: 'fournisseur' })
            .select('_id name email businessName phone establishmentType createdAt supplierId')
            .sort({ createdAt: -1 });

        console.log(`✅ [userController.getSuppliers] ${suppliers.length} fournisseurs (Users) trouvés`);

        // Si l'utilisateur a un siteId, filtrer par zone de livraison
        if (req.user.siteId) {
            try {
                // Récupérer le site pour obtenir sa ville
                const site = await Site.findById(req.user.siteId).select('address siteName');
                console.log(`🔍 Site trouvé:`, {
                    siteId: req.user.siteId,
                    siteName: site?.siteName,
                    hasAddress: !!site?.address,
                    city: site?.address?.city,
                    postalCode: site?.address?.postalCode
                });
                
                if (site && site.address && site.address.city) {
                    const siteCity = site.address.city.trim();
                    const sitePostalCode = site.address.postalCode ? site.address.postalCode.trim() : null;
                    
                    console.log(`🔍 Filtrage des fournisseurs pour le site "${site.siteName}": ${siteCity}${sitePostalCode ? ` (${sitePostalCode})` : ''}`);

                    // Fonction pour normaliser le nom de ville (gérer les accents et variations)
                    // Utiliser la même logique que dans productController.js
                    const cityMappings = {
                        'bruxelles': ['brussels', 'bruxelles', 'brussel'],
                        'brussels': ['brussels', 'bruxelles', 'brussel'],
                        'brussel': ['brussels', 'bruxelles', 'brussel'],
                        'anvers': ['antwerp', 'anvers', 'antwerpen'],
                        'antwerp': ['antwerp', 'anvers', 'antwerpen'],
                        'antwerpen': ['antwerp', 'anvers', 'antwerpen'],
                        'gand': ['ghent', 'gand', 'gent'],
                        'ghent': ['ghent', 'gand', 'gent'],
                        'gent': ['ghent', 'gand', 'gent'],
                        'liege': ['liege', 'luik'],
                        'luik': ['liege', 'luik'],
                        'charleroi': ['charleroi'],
                        'namur': ['namur', 'namen'],
                        'namen': ['namur', 'namen']
                    };
                    
                    const normalizeCity = (city) => {
                        if (!city) return [];
                        const normalized = city.toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
                            .trim();
                        const variants = cityMappings[normalized] || [normalized];
                        // Ajouter aussi la version originale
                        variants.push(city.toLowerCase().trim());
                        return [...new Set(variants)]; // Supprimer les doublons
                    };
                    
                    console.log(`📊 Variantes de la ville du site "${siteCity}":`, normalizeCity(siteCity));

                    // Récupérer tous les Suppliers avec leurs zones de livraison
                    const allSuppliers = await Supplier.find({})
                        .select('_id createdBy deliveryZones name')
                        .populate('createdBy', '_id');

                    console.log(`📦 ${allSuppliers.length} Supplier(s) trouvé(s) dans la base de données`);
                    allSuppliers.forEach(s => {
                        console.log(`   - ${s.name} (${s._id}): ${s.deliveryZones?.length || 0} zone(s) de livraison`);
                        if (s.deliveryZones && s.deliveryZones.length > 0) {
                            s.deliveryZones.forEach(z => {
                                console.log(`     • ${z.city || 'N/A'} ${z.postalCode || ''}`);
                            });
                        }
                    });

                    // Créer un map pour associer User._id -> Supplier
                    const userToSupplierMap = new Map();
                    allSuppliers.forEach(supplier => {
                        if (supplier.createdBy) {
                            userToSupplierMap.set(supplier.createdBy._id.toString(), supplier);
                        }
                    });
                    
                    console.log(`📊 ${userToSupplierMap.size} association(s) User -> Supplier créée(s)`);

                    // Filtrer les fournisseurs qui livrent dans la ville du site
                    const filteredSuppliers = suppliers.filter(user => {
                        // Trouver le Supplier associé à ce User
                        let supplier = null;
                        
                        // 1. Chercher via supplierId dans User
                        if (user.supplierId) {
                            supplier = allSuppliers.find(s => s._id.toString() === user.supplierId.toString());
                        }
                        
                        // 2. Si pas trouvé, chercher via createdBy
                        if (!supplier) {
                            supplier = userToSupplierMap.get(user._id.toString());
                        }
                        
                        // Si aucun Supplier trouvé, EXCLURE le fournisseur (pas de zones définies = pas de livraison)
                        if (!supplier) {
                            console.log(`❌ User ${user._id} n'a pas de Supplier associé, EXCLUSION`);
                            return false;
                        }
                        
                        // Si le Supplier n'a pas de zones de livraison définies, EXCLURE (pas de livraison définie)
                        if (!supplier.deliveryZones || supplier.deliveryZones.length === 0) {
                            console.log(`❌ Supplier ${supplier._id} (${supplier.name}) n'a pas de zones de livraison, EXCLUSION`);
                            return false;
                        }
                        
                        // Vérifier si le Supplier livre dans la ville du site
                        const deliversToSite = supplier.deliveryZones.some(zone => {
                            // Vérifier par code postal si disponible (priorité)
                            if (sitePostalCode && zone.postalCode && zone.postalCode.trim()) {
                                const matches = zone.postalCode.trim() === sitePostalCode;
                                if (matches) {
                                    console.log(`✅ Match par code postal: ${zone.postalCode} = ${sitePostalCode}`);
                                }
                                return matches;
                            }
                            
                            // Vérifier par ville
                            if (zone.city && zone.city.trim()) {
                                const zoneCityNormalized = normalizeCity(zone.city);
                                const siteCityNormalized = normalizeCity(siteCity);
                                
                                // Vérifier si une des variantes de la ville du site correspond EXACTEMENT à une des variantes de la zone
                                // Utiliser une correspondance exacte pour éviter les faux positifs
                                const matches = siteCityNormalized.some(siteCityVar => 
                                    zoneCityNormalized.some(zoneCityVar => 
                                        zoneCityVar === siteCityVar
                                    )
                                );
                                
                                if (matches) {
                                    console.log(`✅ Match par ville (exact): "${zone.city}" = "${siteCity}"`);
                                } else {
                                    console.log(`❌ Pas de match: zone="${zone.city}" (variantes: ${zoneCityNormalized.join(', ')}) vs site="${siteCity}" (variantes: ${siteCityNormalized.join(', ')})`);
                                }
                                return matches;
                            }
                            
                            return false;
                        });
                        
                        if (!deliversToSite) {
                            console.log(`❌ Supplier ${supplier._id} (${supplier.name}) ne livre pas dans ${siteCity}`);
                        }
                        
                        return deliversToSite;
                    });

                    const totalBeforeFilter = suppliers.length;
                    suppliers = filteredSuppliers;
                    console.log(`✅ ${suppliers.length} fournisseur(s) livrent dans ${siteCity}${sitePostalCode ? ` (${sitePostalCode})` : ''} sur ${totalBeforeFilter} total`);
                } else {
                    console.log('⚠️ Site sans ville définie - FILTRAGE DÉSACTIVÉ');
                    console.log('   Pour activer le filtrage par zone de livraison, veuillez définir une ville dans les paramètres du site.');
                    console.log('   Tous les fournisseurs sont retournés par défaut.');
                }
            } catch (siteError) {
                console.error('⚠️ Erreur lors de la récupération du site pour filtrage:', siteError);
                // En cas d'erreur, retourner tous les fournisseurs
            }
        } else {
            console.log('ℹ️ Utilisateur sans siteId, tous les fournisseurs retournés');
        }

        console.log(`✅ [userController.getSuppliers] ${suppliers.length} fournisseurs (Users) retournés`);

        res.json({
            success: true,
            count: suppliers.length,
            data: suppliers
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des fournisseurs'
        });
    }
};
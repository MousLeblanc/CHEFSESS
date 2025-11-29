import mongoose from 'mongoose';
import crypto from 'crypto';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Site from '../models/Site.js';
import notificationService from '../services/notificationService.js';

// ✅ Créer un produit (fournisseur)
export const createProduct = async (req, res) => {
  try {
    console.log('\n📦 ===== CREATE PRODUCT (NOUVEAU PRODUIT) =====');
    console.log('📦 Méthode HTTP: POST');
    console.log('👤 User ID:', req.user._id);
    console.log('👤 User role:', req.user.role);
    console.log('👤 User roles:', req.user.roles);
    console.log('👤 User supplierId:', req.user.supplierId);
    console.log('📦 Body reçu:', JSON.stringify(req.body, null, 2));
    
    // Vérifier que l'utilisateur est un fournisseur (logique flexible comme le middleware)
    const isSupplier = 
      req.user.role === 'fournisseur' || 
      req.user.role === 'SUPPLIER' ||
      (req.user.roles && Array.isArray(req.user.roles) && req.user.roles.some(r => 
        r === 'fournisseur' || r === 'SUPPLIER' || r === 'supplier'
      )) ||
      req.user.supplierId;
    
    if (!isSupplier) {
      console.log('❌ Accès refusé - Utilisateur n\'est pas un fournisseur');
      return res.status(403).json({ 
        success: false,
        message: 'Seuls les fournisseurs peuvent ajouter des produits' 
      });
    }
    
    console.log('✅ Vérification fournisseur réussie');

    // Créer le produit avec le supplier = ID du user fournisseur
    console.log('📦 [createProduct] Données reçues:', JSON.stringify(req.body, null, 2));
    console.log('📦 [createProduct] User _id:', req.user._id);
    console.log('📦 [createProduct] User groupId:', req.user.groupId);
    
    const productData = {
      ...req.body,
      supplier: req.user._id,  // L'ID du User fournisseur connecté (utiliser _id au lieu de id)
      // Code-barres
      barcode: req.body.barcode || null,
      // Image du produit (depuis code-barres)
      imageUrl: req.body.imageUrl || null,
      // Informations de traçabilité (AFSCA)
      traceability: req.body.traceability || {},
      // S'assurer que superPromo et toSave sont bien structurés
      superPromo: req.body.superPromo || {
        active: false,
        promoPrice: null,
        promoQuantity: null,
        endDate: null
      },
      toSave: req.body.toSave || {
        active: false,
        savePrice: null,
        saveQuantity: null,
        expirationDate: null
      }
    };

    // Nettoyer les données si les promotions ne sont pas actives
    // Attention: vérifier si active existe et est true (peut être string "true" ou booléen true)
    if (!productData.superPromo || (!productData.superPromo.active && productData.superPromo.active !== true)) {
      productData.superPromo = { active: false };
    } else {
      // S'assurer que active est un booléen
      productData.superPromo.active = productData.superPromo.active === true || productData.superPromo.active === 'true';
    }
    // Vérifier toSave - la condition doit être plus précise
    // Convertir saveProduct en booléen si nécessaire (peut être string "true" ou booléen)
    const saveProductIsTrue = productData.saveProduct === true || productData.saveProduct === 'true';
    console.log('📦 [createProduct] Conversion saveProduct:', {
      saveProduct: productData.saveProduct,
      saveProductType: typeof productData.saveProduct,
      saveProductIsTrue: saveProductIsTrue,
      toSaveExists: !!productData.toSave,
      toSaveActive: productData.toSave?.active,
      toSaveActiveType: typeof productData.toSave?.active
    });
    
    // Si saveProduct est true (ancien champ) mais toSave n'est pas défini ou inactive, créer toSave
    if (saveProductIsTrue && (!productData.toSave || !productData.toSave.active || productData.toSave.active === false)) {
      console.log('📦 [createProduct] Conversion de saveProduct:true en toSave: {active: true}');
      productData.toSave = {
        active: true,
        savePrice: productData.toSave?.savePrice || null,
        saveQuantity: productData.toSave?.saveQuantity || null,
        expirationDate: productData.toSave?.expirationDate || null
      };
    } else if (!productData.toSave) {
      productData.toSave = { active: false };
    } else if (productData.toSave.active === true || productData.toSave.active === 'true') {
      // S'assurer que active est un booléen true
      productData.toSave.active = true;
      // S'assurer que les autres champs sont présents même si null
      if (!productData.toSave.hasOwnProperty('savePrice')) productData.toSave.savePrice = productData.toSave.savePrice || null;
      if (!productData.toSave.hasOwnProperty('saveQuantity')) productData.toSave.saveQuantity = productData.toSave.saveQuantity || null;
      if (!productData.toSave.hasOwnProperty('expirationDate')) productData.toSave.expirationDate = productData.toSave.expirationDate || null;
    } else {
      // Si active n'est pas true, on le met à false
      productData.toSave = { active: false };
    }
    
    console.log('📦 [createProduct] Données nettoyées - superPromo:', JSON.stringify(productData.superPromo));
    console.log('📦 [createProduct] Données nettoyées - toSave:', JSON.stringify(productData.toSave));
    console.log('📦 [createProduct] Vérification avant création:');
    console.log('   - superPromo.active:', productData.superPromo?.active, '(type:', typeof productData.superPromo?.active, ')');
    console.log('   - toSave.active:', productData.toSave?.active, '(type:', typeof productData.toSave?.active, ')');

    const product = await Product.create(productData);
    
    console.log('✅ Produit créé:', product.name, 'par', req.user._id);
    console.log('📦 Produit créé - superPromo:', JSON.stringify(product.superPromo));
    console.log('📦 Produit créé - toSave:', JSON.stringify(product.toSave));
    console.log('📦 Produit créé - Vérification après création:');
    console.log('   - product.superPromo?.active:', product.superPromo?.active, '(type:', typeof product.superPromo?.active, ')');
    console.log('   - product.toSave?.active:', product.toSave?.active, '(type:', typeof product.toSave?.active, ')');

    // Notifier les sites dans les zones de livraison si super promo ou produit à sauver
    // Pour un NOUVEAU produit, TOUJOURS notifier si les promotions sont actives
    // Vérifier explicitement que active est true
    const hasSuperPromo = product.superPromo && product.superPromo.active === true;
    const hasToSave = product.toSave && product.toSave.active === true;
    
    console.log(`🔔 Vérification notification (NOUVEAU PRODUIT):`);
    console.log(`   - hasSuperPromo: ${hasSuperPromo} (product.superPromo?.active = ${product.superPromo?.active})`);
    console.log(`   - hasToSave: ${hasToSave} (product.toSave?.active = ${product.toSave?.active})`);
    console.log(`   - req.user._id: ${req.user._id}`);
    console.log(`   - req.user.role: ${req.user.role}`);
    console.log(`   - Type: NOUVEAU PRODUIT - Les notifications seront envoyées si promotions actives`);
    
    if (hasSuperPromo || hasToSave) {
      try {
        // Récupérer les infos du fournisseur et ses zones de livraison
        // Utiliser req.user._id au lieu de req.user.id
        const supplierUser = await User.findById(req.user._id).populate('supplierId');
        let supplier = supplierUser?.supplierId;
        
        // Si pas trouvé via supplierId, chercher via createdBy
        if (!supplier) {
          supplier = await Supplier.findOne({ createdBy: req.user._id });
        }
        
        // Si toujours pas trouvé, chercher par email ou nom
        if (!supplier && supplierUser) {
          supplier = await Supplier.findOne({ 
            $or: [
              { email: supplierUser.email },
              { name: supplierUser.businessName || supplierUser.name }
            ]
          });
        }
        
        console.log(`🔔 Recherche des sites dans les zones de livraison du fournisseur...`);
        console.log(`🔔 Fournisseur User: ${supplierUser?.businessName || supplierUser?.name || 'N/A'} (${req.user._id})`);
        console.log(`🔔 Supplier trouvé:`, supplier ? {
          _id: supplier._id,
          name: supplier.name,
          deliveryZonesCount: supplier.deliveryZones?.length || 0,
          deliveryZones: supplier.deliveryZones
        } : 'AUCUN');
        
        if (!supplier) {
          console.log('⚠️ Aucun Supplier trouvé pour ce fournisseur');
          console.log('   Les notifications ne seront pas envoyées. Le fournisseur doit avoir un Supplier enregistré.');
        } else if (!supplier.deliveryZones || supplier.deliveryZones.length === 0) {
          console.log('⚠️ Le fournisseur n\'a pas défini de zones de livraison');
          console.log(`   Supplier ID: ${supplier._id}`);
          console.log(`   DeliveryZones: ${JSON.stringify(supplier.deliveryZones)}`);
          console.log('   Les notifications ne seront pas envoyées. Le fournisseur doit définir ses zones de livraison.');
        } else {
          console.log(`🔔 Zones de livraison: ${supplier.deliveryZones.length} zone(s)`);
          supplier.deliveryZones.forEach(zone => {
            console.log(`   - ${zone.city || 'Ville'} ${zone.postalCode || ''}`);
          });
          
          // Mapping des villes pour gérer les traductions (français/néerlandais/anglais)
          const cityMappings = {
            'bruxelles': ['brussels', 'brussel', 'bruxelles'],
            'brussels': ['bruxelles', 'brussel', 'brussels'],
            'brussel': ['bruxelles', 'brussels', 'brussel'],
            'anvers': ['antwerp', 'antwerpen', 'anvers'],
            'antwerp': ['anvers', 'antwerpen', 'antwerp'],
            'antwerpen': ['anvers', 'antwerp', 'antwerpen']
          };
          
          // Fonction pour normaliser le nom de ville
          const normalizeCity = (city) => {
            if (!city) return null;
            const normalized = city.trim().toLowerCase();
            return cityMappings[normalized] ? cityMappings[normalized] : [normalized];
          };
          
          // Construire la requête pour trouver les sites dans les zones de livraison
          const deliveryQueries = supplier.deliveryZones.map(zone => {
            if (zone.postalCode && zone.postalCode.trim()) {
              // Si code postal spécifié, chercher par code postal exact
              return { 'address.postalCode': zone.postalCode.trim() };
            } else if (zone.city && zone.city.trim()) {
              // Chercher par ville avec support des traductions
              const cityVariants = normalizeCity(zone.city);
              const cityPatterns = cityVariants.map(city => {
                // Échapper les caractères spéciaux pour regex
                return city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              });
              // Créer une regex qui matche n'importe quelle variante
              const combinedPattern = cityPatterns.join('|');
              return { 'address.city': new RegExp(combinedPattern, 'i') };
            }
            return null;
          }).filter(q => q !== null);
          
          console.log(`🔔 Requêtes de livraison construites: ${deliveryQueries.length}`);
          deliveryQueries.forEach((q, idx) => {
            // Convertir les RegExp en string pour l'affichage
            const queryStr = {};
            Object.keys(q).forEach(key => {
              if (q[key] instanceof RegExp) {
                queryStr[key] = q[key].toString();
              } else {
                queryStr[key] = q[key];
              }
            });
            console.log(`   Requête ${idx + 1}:`, queryStr);
          });
          
          if (deliveryQueries.length === 0) {
            console.log('⚠️ Aucune zone de livraison valide trouvée');
          } else {
            // Trouver les sites dans les zones de livraison
            const sitesInZones = await Site.find({
              $or: deliveryQueries,
              isActive: true
            }).select('_id siteName address managers');
            
            console.log(`🔔 ${sitesInZones.length} site(s) trouvé(s) dans les zones de livraison`);
            console.log(`🔍 Détails des sites trouvés:`, sitesInZones.map(s => ({
              name: s.siteName,
              city: s.address?.city,
              postalCode: s.address?.postalCode,
              fullAddress: s.address
            })));
            
            // Si aucun site trouvé, vérifier tous les sites actifs pour diagnostiquer
            if (sitesInZones.length === 0) {
              console.log('⚠️ Aucun site trouvé - Vérification de tous les sites actifs...');
              const allActiveSites = await Site.find({ isActive: true }).select('_id siteName address');
              console.log(`📊 Total de ${allActiveSites.length} site(s) actif(s) dans la base:`);
              allActiveSites.forEach(s => {
                console.log(`   - ${s.siteName}: ${s.address?.city || 'SANS VILLE'} ${s.address?.postalCode || 'SANS CODE POSTAL'}`);
              });
            }
            
            if (sitesInZones.length > 0) {
              // Recherche des utilisateurs via deux méthodes :
              // 1. Utilisateurs avec siteId direct
              // 2. Managers des sites (via Site.managers)
              const siteIds = sitesInZones.map(s => s._id);
              
              console.log(`🔍 Recherche des utilisateurs pour ${siteIds.length} site(s):`, siteIds.map(id => id.toString()));
              
              // Méthode 1: Utilisateurs avec siteId direct (chercher avec ObjectId ET string)
              // Inclure aussi les utilisateurs avec isActive undefined/null (anciens utilisateurs)
              const siteIdsAsStrings = siteIds.map(id => id.toString());
              const usersBySiteId = await User.find({
                $or: [
                  { isActive: true },
                  { isActive: { $exists: false } },
                  { isActive: null }
                ],
                $and: [
                  {
                    $or: [
                      { siteId: { $in: siteIds } },
                      { siteId: { $in: siteIdsAsStrings } }
                    ]
                  }
                ]
              }).select('_id name email role siteId roles groupId');
              
              console.log(`   📍 ${usersBySiteId.length} utilisateur(s) trouvé(s) via siteId direct`);
              
              // Logs détaillés pour debug
              usersBySiteId.forEach(u => {
                const site = sitesInZones.find(s => {
                  const siteIdStr = s._id.toString();
                  const userSiteIdStr = u.siteId ? (typeof u.siteId === 'object' ? u.siteId.toString() : u.siteId) : null;
                  return siteIdStr === userSiteIdStr;
                });
                console.log(`      - ${u.name || u.email} (${u._id}) - Site: ${site?.siteName || 'N/A'} - siteId: ${u.siteId} - Email: ${u.email}`);
              });
              
              // Méthode 2: Managers des sites (via Site.managers)
              const sitesWithManagers = await Site.find({
                _id: { $in: siteIds },
                managers: { $exists: true, $ne: [] }
              }).populate('managers', '_id name email role siteId roles isActive').select('_id siteName managers');
              
              const managerUserIds = new Set();
              sitesWithManagers.forEach(site => {
                if (site.managers && Array.isArray(site.managers)) {
                  site.managers.forEach(manager => {
                    if (manager && manager.isActive !== false) {
                      managerUserIds.add(manager._id.toString());
                    }
                  });
                }
              });
              
              console.log(`   👥 ${managerUserIds.size} manager(s) trouvé(s) via Site.managers`);
              
              // Récupérer les managers complets
              const managers = managerUserIds.size > 0 
                ? await User.find({
                    _id: { $in: Array.from(managerUserIds).map(id => new mongoose.Types.ObjectId(id)) },
                    isActive: true
                  }).select('_id name email role siteId roles')
                : [];
              
              // Combiner les deux listes (éviter les doublons)
              const allUserIds = new Set();
              const users = [];
              
              [...usersBySiteId, ...managers].forEach(u => {
                const userId = u._id.toString();
                if (!allUserIds.has(userId)) {
                  allUserIds.add(userId);
                  users.push(u);
                }
              });
              
              console.log(`🔔 ${users.length} utilisateur(s) unique(s) trouvé(s) pour les sites dans les zones de livraison`);
              
              // Logs détaillés pour chaque utilisateur trouvé
              users.forEach(u => {
                const site = sitesInZones.find(s => s._id.toString() === u.siteId?.toString());
                console.log(`   - ${u.name || u.email} (${u._id}) - Site: ${site?.siteName || 'N/A'} - Role: ${u.role} - Roles: ${u.roles?.join(', ') || 'N/A'}`);
              });
              
              if (users.length > 0) {
                const userIds = users.map(u => u._id);
                const promotionType = hasSuperPromo ? 'super_promo' : 'to_save';
                
                console.log(`🔔 Type de promotion: ${promotionType}`);
                
                // Utiliser le Supplier trouvé ou le User comme fallback
                // IMPORTANT: Toujours utiliser l'ID du User fournisseur (req.user._id) car les produits sont liés au User
                const supplierForNotification = {
                  _id: req.user._id, // Toujours utiliser l'ID du User fournisseur
                  businessName: supplier?.businessName || supplier?.name || supplierUser?.businessName || supplierUser?.name || 'Fournisseur',
                  name: supplier?.name || supplier?.businessName || supplierUser?.name || supplierUser?.businessName || 'Fournisseur'
                };
                
                console.log('🔔 [Notification] supplierForNotification:', {
                  _id: supplierForNotification._id,
                  businessName: supplierForNotification.businessName,
                  name: supplierForNotification.name
                });
                
                const sentCount = notificationService.notifyProductPromotionToUsers(
                  userIds,
                  product,
                  promotionType,
                  supplierForNotification
                );
                
                console.log(`✅ ${sentCount} notification(s) envoyée(s) avec succès`);
              } else {
                console.log('⚠️ Aucun gestionnaire de site trouvé pour notifier');
              }
            } else {
              console.log('⚠️ Aucun site trouvé dans les zones de livraison du fournisseur');
            }
          }
        }
      } catch (notifError) {
        console.error('❌ Erreur lors de l\'envoi des notifications:', notifError);
        console.error('   Stack:', notifError.stack);
        // Ne pas faire échouer la création du produit si la notification échoue
      }
    } else {
      console.log('⚠️ Notification non envoyée pour ce NOUVEAU PRODUIT:');
      if (!hasSuperPromo && !hasToSave) {
        console.log('   - Aucune promotion active (superPromo ou toSave)');
        console.log('   - product.superPromo:', JSON.stringify(product.superPromo));
        console.log('   - product.toSave:', JSON.stringify(product.toSave));
      } else {
        console.log('   - PROBLÈME: Les promotions semblent actives mais la condition n\'est pas remplie');
        console.log('   - hasSuperPromo:', hasSuperPromo, '| product.superPromo?.active:', product.superPromo?.active);
        console.log('   - hasToSave:', hasToSave, '| product.toSave?.active:', product.toSave?.active);
      }
    }

    // Vérifier que le produit a bien toSave dans la réponse
    console.log('📦 [createProduct] Produit final avant réponse:', {
      name: product.name,
      saveProduct: product.saveProduct,
      toSave: product.toSave,
      toSaveActive: product.toSave?.active
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Produit ajouté avec succès',
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Voir MES produits (fournisseur connecté)
export const getMyProducts = async (req, res) => {
  try {
    console.log('📦 [getMyProducts] User:', req.user.id, 'Role:', req.user.role);
    
    const products = await Product.find({ supplier: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${products.length} produits trouvés pour fournisseur ${req.user.id}`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Voir tous les produits (pour les acheteurs/sites)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .populate('supplier', 'name email businessName phone')
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${products.length} produits actifs trouvés`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération tous produits:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Obtenir un produit par ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findById(productId)
      .populate('supplier', 'name businessName email address');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// ✅ Voir les produits d'un fournisseur spécifique
export const getProductsBySupplier = async (req, res) => {
  try {
    const supplierId = req.params.supplierId;
    
    console.log('\n🔍 ===== GET PRODUCTS BY SUPPLIER =====');
    console.log('🔍 supplierId reçu:', supplierId);
    console.log('🔍 Type de supplierId:', typeof supplierId);
    
    let products = [];
    let userId = null;
    
    // Méthode 1: Essayer directement avec le supplierId (si c'est un User ID)
    products = await Product.find({ 
      supplier: supplierId,
      active: true 
    }).sort({ createdAt: -1 });
    
    console.log(`🔍 Méthode 1 - Produits trouvés avec supplierId direct: ${products.length}`);
    
    // Méthode 2: Si aucun produit, chercher via Supplier model
    if (products.length === 0) {
      console.log('🔍 Méthode 2 - Recherche via Supplier model...');
      const supplier = await Supplier.findById(supplierId);
      
      if (supplier) {
        console.log('✅ Supplier trouvé:', {
          _id: supplier._id.toString(),
          name: supplier.name,
          createdBy: supplier.createdBy ? supplier.createdBy.toString() : 'N/A',
          productsCount: supplier.products?.length || 0
        });
        
        // D'abord, vérifier si le Supplier a des produits dans son tableau products
        if (supplier.products && supplier.products.length > 0) {
          console.log(`📦 Supplier a ${supplier.products.length} produit(s) dans Supplier.products`);
          
          // Convertir les produits du Supplier en format compatible avec Product
          products = supplier.products
            .filter(p => p.name && p.category && p.unit && p.price !== undefined) // Filtrer les produits valides
            .map((p, index) => {
              // Générer un ID unique basé sur le nom et l'index pour éviter les doublons
              // Utiliser un ObjectId valide basé sur un hash
              const uniqueId = `${supplier._id.toString()}-${index}-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
              const hash = crypto.createHash('md5').update(uniqueId).digest('hex');
              // Prendre les 24 premiers caractères du hash pour créer un ObjectId valide
              const objectIdString = hash.substring(0, 24);
              
              // Calculer le prix avec promotion si active
              let finalPrice = p.price;
              let promoPrice = null;
              if (p.promotion?.active && p.promotion.discountPercent) {
                promoPrice = p.price * (1 - p.promotion.discountPercent / 100);
                finalPrice = promoPrice;
              }
              
              // Normaliser l'unité (Supplier utilise 'L' mais Product peut utiliser 'litre')
              let normalizedUnit = p.unit;
              if (p.unit === 'L') {
                normalizedUnit = 'litre';
              } else if (p.unit === 'ml') {
                normalizedUnit = 'ml';
              } else if (p.unit === 'g') {
                normalizedUnit = 'g';
              }
              
              // Créer un objet simple (pas un document Mongoose) pour la sérialisation JSON
              const productObj = {
                _id: objectIdString, // ID string pour la sérialisation JSON
                name: p.name,
                category: p.category,
                unit: normalizedUnit,
                price: Number(p.price),
                stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0,
                stockAlert: Math.floor((p.stock || 0) * 0.2), // Calculer un seuil d'alerte
                active: true,
                supplier: supplier.createdBy ? supplier.createdBy.toString() : supplierId.toString(),
                description: `Produit de ${supplier.name}`,
                createdAt: supplier.createdAt || new Date(),
                // Champs requis par Product model
                deliveryTime: 3, // Délai de livraison par défaut (3 jours)
                minOrder: 1, // Commande minimum par défaut (1 unité)
                // Gérer les promotions si présentes
                promo: p.promotion?.active ? Number(p.promotion.discountPercent) : 0,
                superPromo: p.promotion?.active && promoPrice ? {
                  active: true,
                  promoPrice: Number(promoPrice),
                  promoQuantity: null,
                  endDate: p.promotion.endDate || null
                } : { active: false },
                toSave: { active: false },
                // Ajouter un flag pour indiquer que c'est un produit du Supplier
                fromSupplierCatalog: true
              };
              
              return productObj;
            });
          
          console.log(`✅ ${products.length} produit(s) converti(s) depuis Supplier.products`);
        }
        
        // Si toujours pas de produits, chercher via createdBy dans Product
        if (products.length === 0 && supplier.createdBy) {
          // Convertir createdBy en ObjectId si nécessaire
          userId = typeof supplier.createdBy === 'string' 
            ? new mongoose.Types.ObjectId(supplier.createdBy)
            : supplier.createdBy;
          
          console.log('🔍 Recherche produits avec userId (createdBy):', userId.toString());
          products = await Product.find({ 
            supplier: userId,
            active: true 
          }).sort({ createdAt: -1 });
          console.log(`✅ Produits trouvés via createdBy: ${products.length}`);
        } else if (products.length === 0) {
          console.log('⚠️ Supplier trouvé mais createdBy est vide et pas de produits dans Supplier.products');
        }
      } else {
        console.log('⚠️ Aucun Supplier trouvé avec ID:', supplierId);
      }
    } else {
      userId = supplierId;
      console.log('✅ Produits trouvés directement, supplierId est un User ID');
    }
    
    // Méthode 3: Si toujours rien, chercher un User avec supplierId OU si supplierId est un User ID
    if (products.length === 0 && !userId) {
      console.log('🔍 Méthode 3 - Recherche User avec supplierId...');
      
      // D'abord, vérifier si supplierId est un User ID
      const userById = await User.findById(supplierId);
      if (userById) {
        console.log('✅ User trouvé directement avec supplierId (c\'est un User ID):', userById._id.toString());
        userId = userById._id;
        
        // Si le User a un supplierId, chercher le Supplier
        if (userById.supplierId) {
          const supplierFromUser = await Supplier.findById(userById.supplierId);
          if (supplierFromUser && supplierFromUser.products && supplierFromUser.products.length > 0) {
            console.log(`📦 Supplier trouvé via User.supplierId: ${supplierFromUser.name}`);
            console.log(`   Produits dans Supplier.products: ${supplierFromUser.products.length}`);
            
            // Convertir les produits du Supplier
            products = supplierFromUser.products
              .filter(p => p.name && p.category && p.unit && p.price !== undefined)
              .map((p, index) => {
                const uniqueId = `${supplierFromUser._id.toString()}-${index}-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
                const hash = crypto.createHash('md5').update(uniqueId).digest('hex');
                const objectIdString = hash.substring(0, 24);
                
                let normalizedUnit = p.unit;
                if (p.unit === 'L') normalizedUnit = 'litre';
                
                return {
                  _id: objectIdString,
                  name: p.name,
                  category: p.category,
                  unit: normalizedUnit,
                  price: Number(p.price),
                  stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0,
                  stockAlert: Math.floor((p.stock || 0) * 0.2),
                  active: true,
                  supplier: userById._id.toString(),
                  description: `Produit de ${supplierFromUser.name}`,
                  createdAt: supplierFromUser.createdAt || new Date(),
                  deliveryTime: 3,
                  minOrder: 1,
                  promo: p.promotion?.active ? Number(p.promotion.discountPercent) : 0,
                  superPromo: { active: false },
                  toSave: { active: false },
                  fromSupplierCatalog: true
                };
              });
            console.log(`✅ ${products.length} produit(s) converti(s) depuis Supplier.products`);
          }
        }
        
        // Si toujours pas de produits, chercher dans Product model
        if (products.length === 0) {
          products = await Product.find({ 
            supplier: userId,
            active: true 
          }).sort({ createdAt: -1 });
          console.log(`✅ Produits trouvés via User._id dans Product model: ${products.length}`);
        }
      } else {
        // Si pas trouvé comme User ID, chercher un User avec supplierId
        const user = await User.findOne({ supplierId: supplierId });
        if (user) {
          console.log('✅ User trouvé via supplierId:', user._id.toString());
          userId = user._id;
          products = await Product.find({ 
            supplier: userId,
            active: true 
          }).sort({ createdAt: -1 });
          console.log(`✅ Produits trouvés via User._id: ${products.length}`);
        } else {
          console.log('⚠️ Aucun User trouvé avec supplierId:', supplierId);
        }
      }
    }
    
    console.log(`\n✅ RÉSULTAT FINAL: ${products.length} produit(s) trouvé(s) pour supplierId ${supplierId}`);
    if (userId) {
      console.log(`   User ID utilisé: ${userId.toString()}`);
    }
    
    // Log pour vérifier les promotions et le format des produits
    if (products.length > 0) {
      console.log(`📊 Exemple de produit converti:`, JSON.stringify(products[0], null, 2));
      products.forEach(product => {
        if (product.superPromo?.active || product.toSave?.active) {
          console.log(`📊 Produit avec promotion: ${product.name}`, {
            superPromo: product.superPromo,
            toSave: product.toSave
          });
        }
      });
    } else {
      console.log(`⚠️  AUCUN PRODUIT TROUVÉ pour supplierId: ${supplierId}`);
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits fournisseur:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Modifier un produit (fournisseur)
export const updateProduct = async (req, res) => {
  try {
  const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Produit non trouvé' 
      });
    }

    // Vérifier que le produit appartient au fournisseur connecté
    // Le produit peut appartenir soit à req.user._id, soit à req.user.supplierId
    console.log('🔍 Vérification de propriété:');
    console.log('   Product supplier:', product.supplier.toString());
    console.log('   User _id:', req.user._id.toString());
    console.log('   User supplierId:', req.user.supplierId?.toString());
    
    const isOwner = product.supplier.toString() === req.user._id.toString() ||
                     (req.user.supplierId && product.supplier.toString() === req.user.supplierId.toString());
    
    if (!isOwner) {
      console.log('❌ Accès refusé - Produit n\'appartient pas au fournisseur');
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à modifier ce produit' 
      });
    }
    
    console.log('✅ Vérification de propriété réussie');

    // Sauvegarder l'état AVANT la mise à jour pour détecter les nouvelles promotions
    const hadSuperPromo = product.superPromo?.active === true;
    const hadToSave = product.toSave?.active === true;
    
    console.log('📦 État AVANT modification:');
    console.log('   - hadSuperPromo:', hadSuperPromo, '(product.superPromo?.active:', product.superPromo?.active, ')');
    console.log('   - hadToSave:', hadToSave, '(product.toSave?.active:', product.toSave?.active, ')');
    console.log('📦 Données reçues dans req.body:');
    console.log('   - req.body.superPromo?.active:', req.body.superPromo?.active);
    console.log('   - req.body.toSave?.active:', req.body.toSave?.active);
    
    // Mettre à jour le produit
    // Gérer superPromo et toSave
    if (req.body.superPromo) {
      if (req.body.superPromo.active === true || req.body.superPromo.active === 'true') {
        product.superPromo = {
          active: true,
          promoPrice: req.body.superPromo.promoPrice || null,
          promoQuantity: req.body.superPromo.promoQuantity || null,
          endDate: req.body.superPromo.endDate || null
        };
      } else {
        product.superPromo = { active: false };
      }
    }
    
    if (req.body.toSave) {
      if (req.body.toSave.active === true || req.body.toSave.active === 'true') {
        product.toSave = {
          active: true,
          savePrice: req.body.toSave.savePrice || null,
          saveQuantity: req.body.toSave.saveQuantity || null,
          expirationDate: req.body.toSave.expirationDate || null
        };
      } else {
        product.toSave = { active: false };
      }
    }
    
    // Mettre à jour les autres champs (sauf superPromo et toSave qui sont déjà gérés)
    const { superPromo, toSave, traceability, barcode, imageUrl, ...otherFields } = req.body;
    Object.assign(product, otherFields);
    
    // Mettre à jour le code-barres
    if (barcode !== undefined) {
      product.barcode = barcode || null;
    }
    
    // Mettre à jour l'image
    if (imageUrl !== undefined) {
      product.imageUrl = imageUrl || null;
    }
    
    // Mettre à jour les informations de traçabilité
    if (traceability) {
      product.traceability = {
        countryOfOrigin: traceability.countryOfOrigin || product.traceability?.countryOfOrigin || '',
        batchNumber: traceability.batchNumber || product.traceability?.batchNumber || '',
        traceabilityNumber: traceability.traceabilityNumber || product.traceability?.traceabilityNumber || '',
        healthStamp: traceability.healthStamp || product.traceability?.healthStamp || '',
        commercialPresentation: traceability.commercialPresentation || product.traceability?.commercialPresentation || '',
        category: traceability.category || product.traceability?.category || '',
        class: traceability.class || product.traceability?.class || '',
        qualityLabel: traceability.qualityLabel || product.traceability?.qualityLabel || { hasLabel: false, labelType: '' },
        productionDate: traceability.productionDate ? new Date(traceability.productionDate) : (product.traceability?.productionDate || null),
        useByDate: traceability.useByDate ? new Date(traceability.useByDate) : (product.traceability?.useByDate || null),
        bestBeforeDate: traceability.bestBeforeDate ? new Date(traceability.bestBeforeDate) : (product.traceability?.bestBeforeDate || null)
      };
    }
    
    // Conserver les superPromo et toSave déjà traités
    // (ils sont déjà mis à jour dans les blocs if précédents)
    
  await product.save();

    console.log('✅ Produit modifié:', product.name);
    console.log('📦 Produit modifié - superPromo:', JSON.stringify(product.superPromo));
    console.log('📦 Produit modifié - toSave:', JSON.stringify(product.toSave));
    console.log('📦 État APRÈS modification:');
    console.log('   - product.superPromo?.active:', product.superPromo?.active);
    console.log('   - product.toSave?.active:', product.toSave?.active);

    // Notifier si une nouvelle promotion a été activée
    // Vérifier explicitement que les promotions sont maintenant actives ET qu'elles ne l'étaient pas avant
    const nowHasSuperPromo = product.superPromo?.active === true;
    const nowHasToSave = product.toSave?.active === true;
    
    const superPromoActivated = nowHasSuperPromo && !hadSuperPromo;
    const toSaveActivated = nowHasToSave && !hadToSave;
    
    console.log(`🔔 Vérification notification:`);
    console.log(`   - hadSuperPromo: ${hadSuperPromo}, nowHasSuperPromo: ${nowHasSuperPromo}, superPromoActivated: ${superPromoActivated}`);
    console.log(`   - hadToSave: ${hadToSave}, nowHasToSave: ${nowHasToSave}, toSaveActivated: ${toSaveActivated}`);
    
    // Vérifier si les promotions sont actives maintenant (même si elles l'étaient déjà)
    // Si les promotions sont actives ET que le fournisseur a des zones de livraison,
    // on peut envoyer une notification pour informer les sites
    const shouldNotify = (nowHasSuperPromo || nowHasToSave);
    
    console.log(`🔔 Décision de notification: shouldNotify=${shouldNotify} (promotions actives maintenant)`);

    if (superPromoActivated || toSaveActivated || shouldNotify) {
      // Si c'est une nouvelle activation, utiliser le type spécifique
      // Sinon, notifier quand même si les promotions sont actives (pour les cas où elles étaient déjà actives)
      const promotionType = superPromoActivated || (nowHasSuperPromo && !hadSuperPromo) ? 'super_promo' : 
                           (toSaveActivated || (nowHasToSave && !hadToSave) ? 'to_save' : 
                           (nowHasSuperPromo ? 'super_promo' : 'to_save'));
      
      console.log(`🔔 Type de promotion pour notification: ${promotionType}`);
      try {
        // Récupérer les infos du fournisseur et ses zones de livraison
        // Utiliser req.user._id au lieu de req.user.id
        const supplierUser = await User.findById(req.user._id).populate('supplierId');
        let supplier = supplierUser?.supplierId;
        
        // Si pas trouvé via supplierId, chercher via createdBy
        if (!supplier) {
          supplier = await Supplier.findOne({ createdBy: req.user._id });
        }
        
        // Si toujours pas trouvé, chercher par email ou nom
        if (!supplier && supplierUser) {
          supplier = await Supplier.findOne({ 
            $or: [
              { email: supplierUser.email },
              { name: supplierUser.businessName || supplierUser.name }
            ]
          });
        }
        
        console.log(`🔔 Recherche des sites dans les zones de livraison du fournisseur...`);
        console.log(`🔔 Fournisseur User: ${supplierUser?.businessName || supplierUser?.name || 'N/A'} (${req.user._id})`);
        console.log(`🔔 Supplier trouvé:`, supplier ? {
          _id: supplier._id,
          name: supplier.name,
          deliveryZonesCount: supplier.deliveryZones?.length || 0,
          deliveryZones: supplier.deliveryZones
        } : 'AUCUN');
        
        if (!supplier) {
          console.log('⚠️ Aucun Supplier trouvé pour ce fournisseur');
          console.log('   Les notifications ne seront pas envoyées. Le fournisseur doit avoir un Supplier enregistré.');
        } else if (!supplier.deliveryZones || supplier.deliveryZones.length === 0) {
          console.log('⚠️ Le fournisseur n\'a pas défini de zones de livraison');
          console.log(`   Supplier ID: ${supplier._id}`);
          console.log(`   DeliveryZones: ${JSON.stringify(supplier.deliveryZones)}`);
          console.log('   Les notifications ne seront pas envoyées. Le fournisseur doit définir ses zones de livraison.');
        } else {
          console.log(`🔔 Zones de livraison: ${supplier.deliveryZones.length} zone(s)`);
          supplier.deliveryZones.forEach(zone => {
            console.log(`   - ${zone.city || 'Ville'} ${zone.postalCode || ''}`);
          });
          
          // Mapping des villes pour gérer les traductions (français/néerlandais/anglais)
          const cityMappings = {
            'bruxelles': ['brussels', 'brussel', 'bruxelles'],
            'brussels': ['bruxelles', 'brussel', 'brussels'],
            'brussel': ['bruxelles', 'brussels', 'brussel'],
            'anvers': ['antwerp', 'antwerpen', 'anvers'],
            'antwerp': ['anvers', 'antwerpen', 'antwerp'],
            'antwerpen': ['anvers', 'antwerp', 'antwerpen']
          };
          
          // Fonction pour normaliser le nom de ville
          const normalizeCity = (city) => {
            if (!city) return null;
            const normalized = city.trim().toLowerCase();
            return cityMappings[normalized] ? cityMappings[normalized] : [normalized];
          };
          
          // Construire la requête pour trouver les sites dans les zones de livraison
          const deliveryQueries = supplier.deliveryZones.map(zone => {
            if (zone.postalCode && zone.postalCode.trim()) {
              // Si code postal spécifié, chercher par code postal exact
              return { 'address.postalCode': zone.postalCode.trim() };
            } else if (zone.city && zone.city.trim()) {
              // Chercher par ville avec support des traductions
              const cityVariants = normalizeCity(zone.city);
              const cityPatterns = cityVariants.map(city => {
                // Échapper les caractères spéciaux pour regex
                return city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              });
              // Créer une regex qui matche n'importe quelle variante
              const combinedPattern = cityPatterns.join('|');
              return { 'address.city': new RegExp(combinedPattern, 'i') };
            }
            return null;
          }).filter(q => q !== null);
          
          console.log(`🔔 Requêtes de livraison construites: ${deliveryQueries.length}`);
          deliveryQueries.forEach((q, idx) => {
            // Convertir les RegExp en string pour l'affichage
            const queryStr = {};
            Object.keys(q).forEach(key => {
              if (q[key] instanceof RegExp) {
                queryStr[key] = q[key].toString();
              } else {
                queryStr[key] = q[key];
              }
            });
            console.log(`   Requête ${idx + 1}:`, queryStr);
          });
          
          if (deliveryQueries.length === 0) {
            console.log('⚠️ Aucune zone de livraison valide trouvée');
          } else {
            // Trouver les sites dans les zones de livraison
            const sitesInZones = await Site.find({
              $or: deliveryQueries,
              isActive: true
            }).select('_id siteName address managers');
            
            console.log(`🔔 ${sitesInZones.length} site(s) trouvé(s) dans les zones de livraison`);
            console.log(`🔍 Détails des sites trouvés:`, sitesInZones.map(s => ({
              name: s.siteName,
              city: s.address?.city,
              postalCode: s.address?.postalCode,
              fullAddress: s.address
            })));
            
            // Si aucun site trouvé, vérifier tous les sites actifs pour diagnostiquer
            if (sitesInZones.length === 0) {
              console.log('⚠️ Aucun site trouvé - Vérification de tous les sites actifs...');
              const allActiveSites = await Site.find({ isActive: true }).select('_id siteName address');
              console.log(`📊 Total de ${allActiveSites.length} site(s) actif(s) dans la base:`);
              allActiveSites.forEach(s => {
                console.log(`   - ${s.siteName}: ${s.address?.city || 'SANS VILLE'} ${s.address?.postalCode || 'SANS CODE POSTAL'}`);
              });
            }
            
            if (sitesInZones.length > 0) {
              // Recherche des utilisateurs via deux méthodes :
              // 1. Utilisateurs avec siteId direct
              // 2. Managers des sites (via Site.managers)
              const siteIds = sitesInZones.map(s => s._id);
              
              console.log(`🔍 Recherche des utilisateurs pour ${siteIds.length} site(s):`, siteIds.map(id => id.toString()));
              
              // Méthode 1: Utilisateurs avec siteId direct (chercher avec ObjectId ET string)
              // Inclure aussi les utilisateurs avec isActive undefined/null (anciens utilisateurs)
              const siteIdsAsStrings = siteIds.map(id => id.toString());
              const usersBySiteId = await User.find({
                $or: [
                  { isActive: true },
                  { isActive: { $exists: false } },
                  { isActive: null }
                ],
                $and: [
                  {
                    $or: [
                      { siteId: { $in: siteIds } },
                      { siteId: { $in: siteIdsAsStrings } }
                    ]
                  }
                ]
              }).select('_id name email role siteId roles groupId');
              
              console.log(`   📍 ${usersBySiteId.length} utilisateur(s) trouvé(s) via siteId direct`);
              
              // Logs détaillés pour debug
              usersBySiteId.forEach(u => {
                const site = sitesInZones.find(s => {
                  const siteIdStr = s._id.toString();
                  const userSiteIdStr = u.siteId ? (typeof u.siteId === 'object' ? u.siteId.toString() : u.siteId) : null;
                  return siteIdStr === userSiteIdStr;
                });
                console.log(`      - ${u.name || u.email} (${u._id}) - Site: ${site?.siteName || 'N/A'} - siteId: ${u.siteId} - Email: ${u.email}`);
              });
              
              // Méthode 2: Managers des sites (via Site.managers)
              const sitesWithManagers = await Site.find({
                _id: { $in: siteIds },
                managers: { $exists: true, $ne: [] }
              }).populate('managers', '_id name email role siteId roles isActive').select('_id siteName managers');
              
              const managerUserIds = new Set();
              sitesWithManagers.forEach(site => {
                if (site.managers && Array.isArray(site.managers)) {
                  site.managers.forEach(manager => {
                    if (manager && manager.isActive !== false) {
                      managerUserIds.add(manager._id.toString());
                    }
                  });
                }
              });
              
              console.log(`   👥 ${managerUserIds.size} manager(s) trouvé(s) via Site.managers`);
              
              // Récupérer les managers complets
              const managers = managerUserIds.size > 0 
                ? await User.find({
                    _id: { $in: Array.from(managerUserIds).map(id => new mongoose.Types.ObjectId(id)) },
                    isActive: true
                  }).select('_id name email role siteId roles')
                : [];
              
              // Combiner les deux listes (éviter les doublons)
              const allUserIds = new Set();
              const users = [];
              
              [...usersBySiteId, ...managers].forEach(u => {
                const userId = u._id.toString();
                if (!allUserIds.has(userId)) {
                  allUserIds.add(userId);
                  users.push(u);
                }
              });
              
              console.log(`🔔 ${users.length} utilisateur(s) unique(s) trouvé(s) pour les sites dans les zones de livraison`);
              
              // Logs détaillés pour chaque utilisateur trouvé
              users.forEach(u => {
                const site = sitesInZones.find(s => s._id.toString() === u.siteId?.toString());
                console.log(`   - ${u.name || u.email} (${u._id}) - Site: ${site?.siteName || 'N/A'} - Role: ${u.role} - Roles: ${u.roles?.join(', ') || 'N/A'}`);
              });
              
              if (users.length > 0) {
                const userIds = users.map(u => u._id);
                
                // Déterminer le type de promotion à notifier
                // Priorité: nouvelle activation > promotion actuelle
                let promotionType;
                if (superPromoActivated || (nowHasSuperPromo && !hadSuperPromo)) {
                  promotionType = 'super_promo';
                } else if (toSaveActivated || (nowHasToSave && !hadToSave)) {
                  promotionType = 'to_save';
                } else if (nowHasSuperPromo) {
                  promotionType = 'super_promo';
                } else if (nowHasToSave) {
                  promotionType = 'to_save';
                } else {
                  promotionType = 'super_promo'; // Par défaut
                }
                
                console.log(`🔔 Type de promotion: ${promotionType}`);
                
                // Utiliser le Supplier trouvé ou le User comme fallback
                // IMPORTANT: Toujours utiliser l'ID du User fournisseur (req.user._id) car les produits sont liés au User
                const supplierForNotification = {
                  _id: req.user._id, // Toujours utiliser l'ID du User fournisseur
                  businessName: supplier?.businessName || supplier?.name || supplierUser?.businessName || supplierUser?.name || 'Fournisseur',
                  name: supplier?.name || supplier?.businessName || supplierUser?.name || supplierUser?.businessName || 'Fournisseur'
                };
                
                console.log('🔔 [Notification] supplierForNotification:', {
                  _id: supplierForNotification._id,
                  businessName: supplierForNotification.businessName,
                  name: supplierForNotification.name
                });
                
                const sentCount = notificationService.notifyProductPromotionToUsers(
                  userIds,
                  product,
                  promotionType,
                  supplierForNotification
                );
                
                console.log(`✅ ${sentCount} notification(s) envoyée(s) avec succès`);
              } else {
                console.log('⚠️ Aucun gestionnaire de site trouvé pour notifier');
              }
            } else {
              console.log('⚠️ Aucun site trouvé dans les zones de livraison du fournisseur');
            }
          }
        }
      } catch (notifError) {
        console.error('❌ Erreur lors de l\'envoi des notifications:', notifError);
        console.error('   Stack:', notifError.stack);
        // Ne pas faire échouer la modification du produit si la notification échoue
      }
    } else {
      console.log('⚠️ Notification non envoyée:');
      if (!superPromoActivated && !toSaveActivated) {
        console.log('   - Aucune nouvelle promotion activée (était déjà active ou non activée)');
      }
    }

    res.json({ 
      success: true, 
      message: 'Produit modifié avec succès',
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur modification produit:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Supprimer un produit (fournisseur)
export const deleteProduct = async (req, res) => {
  try {
  const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Produit non trouvé' 
      });
    }

    // Vérifier que le produit appartient au fournisseur connecté
    if (product.supplier.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à supprimer ce produit' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    console.log('✅ Produit supprimé:', product.name);

    res.json({ 
      success: true, 
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export default {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductsBySupplier,
  updateProduct,
  deleteProduct
};

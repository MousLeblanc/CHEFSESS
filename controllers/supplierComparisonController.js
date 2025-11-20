import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Site from '../models/Site.js';
import Supplier from '../models/Supplier.js';
import SupplierRating from '../models/SupplierRating.js';

/**
 * Comparer les produits similaires entre fournisseurs disponibles pour un site
 * Utilise une analyse de similarité pour regrouper les produits
 */
export const compareSuppliersProducts = asyncHandler(async (req, res) => {
  try {
    const siteId = req.user.siteId || req.query.siteId;
    
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID requis'
      });
    }

    // Récupérer les informations du site
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site non trouvé'
      });
    }

    // Récupérer tous les produits de tous les fournisseurs
    const allProducts = await Product.find({ active: true })
      .populate('supplier', 'businessName name email address supplierId')
      .lean();

    // Récupérer tous les Suppliers avec leurs zones de livraison
    const allSuppliers = await Supplier.find({})
      .select('_id createdBy deliveryZones name')
      .lean();

    console.log(`📦 [compareSuppliersProducts] ${allSuppliers.length} Supplier(s) trouvé(s) dans la base de données`);
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
        userToSupplierMap.set(supplier.createdBy.toString(), supplier);
      }
    });

    console.log(`📊 [compareSuppliersProducts] ${userToSupplierMap.size} association(s) User -> Supplier créée(s)`);

    // Grouper les produits par similarité (nom, catégorie, unité)
    const productGroups = groupSimilarProducts(allProducts);

    // Pour chaque groupe, comparer les prix et ajouter les informations des fournisseurs
    const comparisons = await Promise.all(
      productGroups.map(async (group) => {
        const suppliers = [];
        
        for (const product of group.products) {
          // Récupérer le Supplier associé au User fournisseur
          const supplierUser = product.supplier;
          if (!supplierUser) {
            continue;
          }

          // Trouver le Supplier via createdBy ou supplierId
          let supplier = null;
          if (supplierUser.supplierId) {
            supplier = allSuppliers.find(s => s._id.toString() === supplierUser.supplierId.toString());
          }
          if (!supplier) {
            supplier = userToSupplierMap.get(supplierUser._id.toString());
          }

          // Si aucun Supplier trouvé ou pas de zones de livraison, exclure
          if (!supplier) {
            console.log(`❌ [compareSuppliersProducts] Pas de Supplier trouvé pour User ${supplierUser._id} (${supplierUser.businessName || supplierUser.name})`);
            continue;
          }

          if (!supplier.deliveryZones || supplier.deliveryZones.length === 0) {
            console.log(`❌ [compareSuppliersProducts] Supplier ${supplier.name} n'a pas de zones de livraison`);
            continue;
          }

          // Vérifier si le fournisseur peut livrer à ce site
          const canDeliver = canDeliverToSite(supplier, site);
          if (!canDeliver) {
            console.log(`❌ [compareSuppliersProducts] Supplier ${supplier.name} ne livre pas à ${site.address?.city || 'N/A'}`);
            continue;
          }

          console.log(`✅ [compareSuppliersProducts] Supplier ${supplier.name} peut livrer à ${site.address?.city || 'N/A'}`);

          // Récupérer les notes moyennes du fournisseur
          const supplierId = typeof product.supplier._id === 'object' ? product.supplier._id : product.supplier._id;
          const ratings = await SupplierRating.getAverageRating(supplierId);

          // Calculer le prix final (avec promotions)
          const finalPrice = calculateFinalPrice(product);

          suppliers.push({
            supplierId: product.supplier._id,
            supplierName: product.supplier.businessName || product.supplier.name || 'Fournisseur',
            productId: product._id,
            productName: product.name,
            category: product.category,
            unit: product.unit,
            basePrice: product.price,
            finalPrice: finalPrice,
            promo: product.promo || 0,
            hasSuperPromo: product.superPromo?.active || false,
            hasToSave: product.toSave?.active || false,
            deliveryTime: product.deliveryTime,
            minOrder: product.minOrder,
            stock: product.stock,
            rating: ratings.averageRating,
            ratingCount: ratings.count,
            priceRating: ratings.priceAvg,
            deliveryRating: ratings.deliveryAvg,
            qualityRating: ratings.qualityAvg
          });
        }

        // Trier par prix final (du moins cher au plus cher)
        suppliers.sort((a, b) => a.finalPrice - b.finalPrice);

        if (suppliers.length > 0) {
          console.log(`📦 [compareSuppliersProducts] Produit "${group.name}": ${suppliers.length} fournisseur(s) - ${suppliers.map(s => s.supplierName).join(', ')}`);
        }

        return {
          productName: group.name,
          category: group.category,
          unit: group.unit,
          suppliers: suppliers,
          bestPrice: suppliers.length > 0 ? suppliers[0].finalPrice : null,
          priceRange: suppliers.length > 0 ? {
            min: suppliers[0].finalPrice,
            max: suppliers[suppliers.length - 1].finalPrice,
            difference: suppliers[suppliers.length - 1].finalPrice - suppliers[0].finalPrice,
            differencePercent: suppliers.length > 1 ? 
              ((suppliers[suppliers.length - 1].finalPrice - suppliers[0].finalPrice) / suppliers[0].finalPrice * 100).toFixed(1) : 0
          } : null
        };
      })
    );

    // Filtrer les groupes qui ont au moins 2 fournisseurs
    const validComparisons = comparisons.filter(c => c.suppliers.length >= 2);

    console.log(`\n📊 [compareSuppliersProducts] Résumé final:`);
    console.log(`   - Groupes de produits: ${productGroups.length}`);
    console.log(`   - Comparaisons valides (≥2 fournisseurs): ${validComparisons.length}`);
    validComparisons.forEach(comp => {
      console.log(`   - ${comp.productName}: ${comp.suppliers.length} fournisseur(s) - ${comp.suppliers.map(s => s.supplierName).join(', ')}`);
    });

    res.json({
      success: true,
      data: validComparisons,
      site: {
        id: site._id,
        name: site.siteName
      }
    });
  } catch (error) {
    console.error('Erreur lors de la comparaison des fournisseurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la comparaison des fournisseurs',
      error: error.message
    });
  }
});

/**
 * Grouper les produits similaires par nom, catégorie et unité
 */
function groupSimilarProducts(products) {
  const groups = new Map();

  products.forEach(product => {
    // Normaliser le nom du produit pour la comparaison
    const normalizedName = normalizeProductName(product.name);
    const key = `${normalizedName}_${product.category}_${product.unit}`;

    if (!groups.has(key)) {
      groups.set(key, {
        name: product.name, // Garder le nom original le plus commun
        category: product.category,
        unit: product.unit,
        products: []
      });
    }

    groups.get(key).products.push(product);
  });

  return Array.from(groups.values());
}

/**
 * Normaliser le nom d'un produit pour la comparaison
 */
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s]/g, '') // Supprimer les caractères spéciaux
    .trim()
    .replace(/\s+/g, ' '); // Normaliser les espaces
}

/**
 * Vérifier si un fournisseur peut livrer à un site
 */
function canDeliverToSite(supplier, site) {
  // Si le fournisseur n'a pas de zones de livraison définies, il ne peut pas livrer
  if (!supplier.deliveryZones || supplier.deliveryZones.length === 0) {
    return false;
  }

  // Mapping des villes avec leurs variantes (français/néerlandais)
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
    'namen': ['namur', 'namen'],
    'nieuwpoort': ['nieuwpoort', 'nieuport'],
    'nieuport': ['nieuwpoort', 'nieuport']
  };

  // Fonction pour normaliser une ville et obtenir ses variantes
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

  const siteCity = site.address?.city || '';
  const sitePostalCode = site.address?.postalCode || '';

  console.log(`🔍 [canDeliverToSite] Vérification pour le site: ${siteCity} (${sitePostalCode})`);
  console.log(`🔍 [canDeliverToSite] Supplier: ${supplier.name}, zones: ${supplier.deliveryZones.length}`);

  // Vérifier si une zone de livraison correspond
  const hasMatch = supplier.deliveryZones.some(zone => {
    // Vérifier par code postal si disponible (priorité)
    if (sitePostalCode && zone.postalCode && zone.postalCode.trim()) {
      const matches = zone.postalCode.trim() === sitePostalCode;
      if (matches) {
        console.log(`✅ [canDeliverToSite] Match par code postal: ${zone.postalCode} = ${sitePostalCode}`);
      }
      return matches;
    }
    
    // Vérifier par ville avec support des variantes
    if (zone.city && zone.city.trim() && siteCity) {
      const zoneCityVariants = normalizeCity(zone.city);
      const siteCityVariants = normalizeCity(siteCity);
      
      // Vérifier si une des variantes de la ville du site correspond EXACTEMENT à une des variantes de la zone
      const matches = siteCityVariants.some(siteCityVar => 
        zoneCityVariants.some(zoneCityVar => 
          zoneCityVar === siteCityVar
        )
      );
      
      if (matches) {
        console.log(`✅ [canDeliverToSite] Match par ville: "${zone.city}" = "${siteCity}"`);
      } else {
        console.log(`❌ [canDeliverToSite] Pas de match: zone="${zone.city}" (variantes: ${zoneCityVariants.join(', ')}) vs site="${siteCity}" (variantes: ${siteCityVariants.join(', ')})`);
      }
      return matches;
    }
    
    return false;
  });

  if (!hasMatch) {
    console.log(`❌ [canDeliverToSite] Aucune zone de livraison ne correspond pour ${supplier.name}`);
  }

  return hasMatch;
}

/**
 * Calculer le prix final d'un produit (avec promotions)
 */
function calculateFinalPrice(product) {
  let price = product.price;

  // Super promo (priorité)
  if (product.superPromo?.active && product.superPromo.promoPrice) {
    return product.superPromo.promoPrice;
  }

  // Produit à sauver
  if (product.toSave?.active && product.toSave.savePrice) {
    return product.toSave.savePrice;
  }

  // Promotion normale
  if (product.promo && product.promo > 0) {
    return price * (1 - product.promo / 100);
  }

  return price;
}


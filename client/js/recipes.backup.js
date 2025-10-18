//recipes mongodb - Compatible avec le système de génération intelligente de menus

export default [

    // Recette 1 : Œuf dur mayonnaise
    {
        title: "Œuf Mayo Classique et Fraîcheur",
        description: "Un grand classique de la cuisine française, simple et délicieux, parfait en entrée.",
        servings: 4,
        prepTime: 5,
        cookTime: 10,
        ingredients: [
            { item: "Œufs", quantity: 4, unit: "pièces" },
            { item: "Mayonnaise (maison ou commerce)", quantity: 100, unit: "g" },
            { item: "Ciboulette ou persil haché", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Sel", quantity: 1, unit: "pincée" },
            { item: "Poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Plonger les œufs dans une casserole d’eau bouillante et les cuire pendant 10 minutes.",
            "Égoutter les œufs et les passer immédiatement sous l’eau froide pour stopper la cuisson.",
            "Écaler les œufs (enlever la coquille).",
            "Couper les œufs en deux dans le sens de la longueur.",
            "Déposer une belle cuillère de mayonnaise sur chaque moitié d'œuf.",
            "Assaisonner avec sel et poivre, puis parsemer de ciboulette ou persil haché."
        ],
        nutrition: { calories: 300, proteins: 12, carbs: 2, fats: 28 }, // Estimation pour 2 moitiés d'œuf
        tags: ["entrée", "classique", "œuf", "froid"]
    },

    // Recette 2 : Sauce provençale
    {
        title: "Sauce Provençale Tomate et Herbes",
        description: "Une sauce méditerranéenne savoureuse à base de tomates, ail et herbes de Provence, parfaite pour accompagner viandes, poissons et pâtes.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Tomates fraîches ou concassées", quantity: 500, unit: "g" },
            { item: "Gousses d’ail", quantity: 2, unit: "pièces" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Vin blanc", quantity: 10, unit: "cl", optional: true },
            { item: "Herbes de Provence", quantity: 1, unit: "c. à café" },
            { item: "Sel", quantity: 1, unit: "pincée" },
            { item: "Poivre", quantity: 1, unit: "pincée" },
            { item: "Sucre", quantity: 1, unit: "pincée", optional: true },
            { item: "Basilic frais", quantity: 1, unit: "poignée", optional: true }
        ],
        instructions: [
            "Si tomates fraîches : ébouillanter 30 sec, peler et couper en dés.",
            "Chauffer l’huile d’olive, faire revenir l’oignon émincé jusqu’à transparence.",
            "Ajouter l’ail haché, cuire 1 minute.",
            "Ajouter les tomates et le concentré de tomate.",
            "Verser le vin blanc si utilisé, assaisonner avec herbes, sel, poivre et sucre.",
            "Laisser mijoter à feu doux 20 à 30 minutes en remuant de temps en temps.",
            "Ajouter le basilic frais en fin de cuisson."
        ],
        tags: ["sauce", "méditerranéenne", "tomate", "végétarien"]
    },
    
    // Recette 3 : Ratatouille
    {
        title: "Ratatouille Classique Provençale",
        description: "Un plat emblématique du sud de la France, mélange de légumes du soleil mijotés à l'huile d'olive et aux herbes aromatiques, parfait en accompagnement.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Aubergine", quantity: 1, unit: "pièce" },
            { item: "Courgette", quantity: 1, unit: "pièce" },
            { item: "Poivron (rouge ou jaune)", quantity: 1, unit: "pièce" },
            { item: "Tomates", quantity: 2, unit: "pièces" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Gousses d’ail", quantity: 2, unit: "pièces" },
            { item: "Huile d’olive", quantity: 3, unit: "c. à soupe" },
            { item: "Herbes de Provence", quantity: 1, unit: "c. à café" },
            { item: "Sel", quantity: 1, unit: "pincée" },
            { item: "Poivre", quantity: 1, unit: "pincée" },
            { item: "Basilic frais", quantity: 1, unit: "poignée", optional: true }
        ],
        instructions: [
            "Couper l’aubergine, la courgette et le poivron en dés. Peler et épépiner les tomates, puis les couper en morceaux. Émincer l’oignon et hacher l’ail.",
            "Faire chauffer 2 c. à soupe d’huile d’olive. Faire revenir l’oignon et l’ail à feu doux jusqu’à ce qu’ils deviennent translucides.",
            "Ajouter le poivron et faire revenir pendant 5 minutes.",
            "Ajouter l’aubergine et la courgette, puis laisser cuire encore 5 minutes en remuant régulièrement.",
            "Ajouter enfin les tomates, les herbes de Provence, le sel et le poivre.",
            "Couvrir et laisser mijoter à feu doux 30 à 40 minutes, en remuant de temps en temps."
        ],
        tags: ["accompagnement", "légumes", "provençal", "végétarien"]
    },
    
    // Recette 4 : Tartelettes ananas
    {
        title: "Tartelettes Exotiques à l'Ananas et Crème Pâtissière",
        description: "Un dessert fruité et gourmand avec une base croustillante et une garniture crémeuse aux morceaux d'ananas, rehaussée d'une touche de rhum.",
        servings: 6,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Pâte sablée ou feuilletée", quantity: 1, unit: "rouleau" },
            { item: "Ananas au sirop (ou frais)", quantity: 1, unit: "boîte ou pièce" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Sucre", quantity: 100, unit: "g" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Maïzena", quantity: 1, unit: "c. à soupe" },
            { item: "Rhum", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Sucre vanillé", quantity: 1, unit: "sachet" },
            { item: "Amandes effilées", quantity: 1, unit: "poignée", optional: true }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Découper la pâte pour foncer 6 moules à tartelettes. Piquer le fond et précuire 10 minutes.",
            "Préparer l’appareil : fouetter les œufs avec le sucre et le sucre vanillé.",
            "Ajouter la crème liquide, la Maïzena et le rhum (si utilisé), bien mélanger.",
            "Disposer les tranches d’ananas égouttées sur les fonds de tartelettes.",
            "Verser l’appareil à tarte par-dessus, parsemer d’amandes effilées.",
            "Enfourner à 180°C pendant 20 à 25 minutes jusqu’à ce que la garniture soit dorée."
        ],
        tags: ["dessert", "fruit", "pâtisserie", "exotique"]
    },

    // Recette 5 : Stoemp aux saucisses de volaille (Carottes)
    {
        title: "Stoemp Carottes et Saucisses de Volaille",
        description: "Une version légère et savoureuse du plat traditionnel belge : purée onctueuse de carottes et pommes de terre, servie avec des saucisses dorées.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre (chair tendre)", quantity: 800, unit: "g" },
            { item: "Carottes", quantity: 300, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Lait", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Saucisses de volaille", quantity: 4, unit: "pièces" },
            { item: "Huile d’olive ou beurre", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Éplucher et couper les pommes de terre et les carottes. Les cuire à l’eau bouillante salée pendant 20 minutes.",
            "Émincer l’oignon et le faire revenir avec un peu de beurre jusqu’à ce qu’il soit doré.",
            "Égoutter les légumes et les écraser au presse-purée. Ajouter le lait chaud, le beurre et les oignons. Mélanger.",
            "Assaisonner le stoemp avec sel, poivre et muscade.",
            "Faire dorer les saucisses de volaille 5 à 7 minutes de chaque côté à la poêle avec l’huile ou le beurre."
        ],
        tags: ["plat complet", "belge", "saucisses", "légumes"]
    },

    // Recette 6 : Stoemp aux poireaux
    {
        title: "Stoemp Fondant aux Poireaux et Saucisses de Volaille",
        description: "Une purée belge classique, délicieusement fondante grâce aux poireaux, idéale pour accompagner les saucisses de volaille.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Pommes de terre (chair tendre)", quantity: 800, unit: "g" },
            { item: "Poireaux", quantity: 2, unit: "gros" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Lait", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Saucisses de volaille", quantity: 4, unit: "pièces" },
            { item: "Huile d’olive ou beurre", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre à l’eau salée pendant 20 minutes.",
            "Émincer l’oignon et les poireaux (rincés).",
            "Faire revenir l’oignon 3 minutes, puis ajouter les poireaux. Cuire à feu doux 10 minutes jusqu’à ce qu’ils soient fondants.",
            "Égoutter les pommes de terre, les écraser. Incorporer le lait chaud, le beurre et les poireaux fondus. Mélanger.",
            "Assaisonner le stoemp avec sel, poivre et muscade.",
            "Faire dorer les saucisses de volaille 5 à 7 minutes de chaque côté à la poêle."
        ],
        tags: ["plat complet", "belge", "poireaux", "saucisses"]
    },

    // Recette 7 : Sauce Moutarde (pour Stoemp)
    {
        title: "Sauce Moutarde Crémeuse (pour Stoemp)",
        description: "Une sauce rapide et savoureuse à base de moutarde et crème fraîche, pour accompagner idéalement les saucisses et le stoemp.",
        servings: 4,
        prepTime: 2,
        cookTime: 3,
        ingredients: [
            { item: "Crème fraîche", quantity: 20, unit: "cl" },
            { item: "Moutarde (classique ou à l'ancienne)", quantity: 1, unit: "c. à soupe" },
            { item: "Sel", quantity: 1, unit: "pincée" },
            { item: "Poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire chauffer la crème dans une petite casserole à feu doux.",
            "Ajouter la moutarde et mélanger bien.",
            "Assaisonner avec sel et poivre.",
            "Laisser mijoter 2-3 minutes avant de servir."
        ],
        tags: ["sauce", "crémeuse", "moutarde", "express"]
    },
    
    // Recette 8 : Sauce au Vin Blanc et Échalotes (pour Stoemp)
    {
        title: "Sauce au Vin Blanc et Échalotes (pour Stoemp)",
        description: "Une sauce raffinée et acidulée pour rehausser le goût des saucisses et du stoemp.",
        servings: 4,
        prepTime: 5,
        cookTime: 5,
        ingredients: [
            { item: "Échalote émincée", quantity: 1, unit: "pièce" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Crème fraîche", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 1, unit: "c. à soupe" },
            { item: "Sel", quantity: 1, unit: "pincée" },
            { item: "Poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire revenir l’échalote avec le beurre à feu doux.",
            "Déglacer avec le vin blanc et laisser réduire de moitié.",
            "Ajouter la crème et laisser épaissir 2-3 minutes.",
            "Assaisonner et servir chaud."
        ],
        tags: ["sauce", "vin", "échalotes", "raffiné"]
    },
    
    // Recette 9 : Sauce au Jus de Cuisson des Saucisses (pour Stoemp)
    {
        title: "Sauce au Jus de Cuisson (simple et savoureuse)",
        description: "Une sauce rapide à base des sucs de cuisson des saucisses, parfaite pour napper le stoemp.",
        servings: 4,
        prepTime: 2,
        cookTime: 5,
        ingredients: [
            { item: "Jus de cuisson des saucisses", quantity: 1, unit: "fond de poêle" },
            { item: "Eau ou bouillon", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 1, unit: "c. à soupe" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Après cuisson des saucisses, déglacer la poêle avec un peu d’eau ou de bouillon.",
            "Ajouter le beurre et la farine (beurre manié), puis mélanger bien.",
            "Laisser épaissir à feu doux et servir."
        ],
        tags: ["sauce", "jus de cuisson", "express"]
    },

    // Recette 10 : Croûte aux Fruits (Crème Pâtissière et Pâte Sablée)
    {
        title: "Croûte aux Fruits Frais et Crème Pâtissière",
        description: "Une pâtisserie classique composée d'une pâte sablée croustillante et d'une crème onctueuse, garnie de fruits frais de saison.",
        servings: 6,
        prepTime: 40,
        cookTime: 35,
        ingredients: [
            { item: "Farine", quantity: 250, unit: "g" },
            { item: "Beurre froid", quantity: 125, unit: "g" },
            { item: "Sucre (pour la pâte)", quantity: 80, unit: "g" },
            { item: "Œuf (pour la pâte)", quantity: 1, unit: "pièce" },
            { item: "Lait (pour la crème)", quantity: 25, unit: "cl" },
            { item: "Jaunes d'œufs (pour la crème)", quantity: 2, unit: "pièces" },
            { item: "Sucre (pour la crème)", quantity: 50, unit: "g" },
            { item: "Maïzena", quantity: 20, unit: "g" },
            { item: "Sucre vanillé", quantity: 1, unit: "sachet" },
            { item: "Fruits frais (au choix)", quantity: 300, unit: "g" },
            { item: "Gelée d'abricot (pour la brillance)", quantity: 1, unit: "c. à soupe", optional: true }
        ],
        instructions: [
            "Préparer la pâte sablée : sabler farine, beurre, sucre et sel, puis incorporer l'œuf. Laisser reposer au frais 30 min.",
            "Foncer le moule, piquer le fond et cuire à blanc 15 à 20 min à 180°C.",
            "Préparer la crème pâtissière : faire chauffer le lait. Fouetter les jaunes d'œufs avec le sucre et la Maïzena. Verser le lait chaud, remettre à feu doux et faire épaissir en remuant constamment. Laisser refroidir.",
            "Montage : étaler la crème pâtissière refroidie sur le fond de tarte. Disposer harmonieusement les fruits coupés.",
            "Faire chauffer légèrement la gelée d'abricot et badigeonner les fruits pour les faire briller."
        ],
        tags: ["dessert", "pâtisserie", "crème", "fruit"]
    },
    
    // Recette 11 : Américain préparé (Steak Tartare Belge)
    {
        title: "Américain Préparé (Steak Tartare Belge)",
        description: "Spécialité belge de viande de bœuf crue ultra-fraîche, finement hachée et assaisonnée de condiments, souvent servi avec frites et salade.",
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        ingredients: [
            { item: "Viande de bœuf hachée (ultra-fraîche)", quantity: 500, unit: "g" },
            { item: "Jaunes d’œufs", quantity: 2, unit: "pièces" },
            { item: "Moutarde", quantity: 1, unit: "c. à soupe" },
            { item: "Ketchup", quantity: 1, unit: "c. à soupe" },
            { item: "Sauce Worcestershire", quantity: 1, unit: "c. à soupe" },
            { item: "Câpres hachées", quantity: 1, unit: "c. à café", optional: true },
            { item: "Échalotes finement hachées", quantity: 1, unit: "c. à soupe" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" },
            { item: "Tabasco", quantity: 2, unit: "gouttes", optional: true },
            { item: "Sel et poivre", quantity: 1, unit: "pincée" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" }
        ],
        instructions: [
            "Placer la viande hachée ultra-fraîche dans un grand bol.",
            "Ajouter la moutarde, le ketchup, la sauce Worcestershire, les câpres, les échalotes et le persil.",
            "Assaisonner avec sel, poivre et Tabasco selon votre goût.",
            "Mélanger délicatement pour lier l’assaisonnement à la viande.",
            "Incorporer les jaunes d’œufs et mélanger délicatement.",
            "Servir l’Américain préparé bien frais, en forme de dôme, accompagné de frites ou de pain."
        ],
        tags: ["plat principal", "viande", "cru", "belge"]
    },

    // Recette 12 : Velouté champignons
    {
        title: "Velouté de Champignons Onctueux à la Crème",
        description: "Une soupe riche et savoureuse, parfaite pour une entrée légère et réconfortante, avec une touche de crème fraîche.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Champignons de Paris", quantity: 500, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Gousse d’ail", quantity: 1, unit: "pièce" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Bouillon de volaille", quantity: 75, unit: "cl" },
            { item: "Crème fraîche", quantity: 10, unit: "cl" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" },
            { item: "Persil ou ciboulette", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Émincer l’oignon et l’ail. Nettoyer et couper les champignons en morceaux.",
            "Faire fondre le beurre. Ajouter l’oignon et l’ail, cuire 2-3 minutes.",
            "Ajouter les champignons, faire dorer 5 minutes. Saupoudrer de farine, mélanger et cuire 1 minute.",
            "Verser le bouillon chaud, laisser mijoter 15 minutes.",
            "Mixer jusqu’à obtenir une texture lisse. Ajouter la crème fraîche, saler, poivrer et mélanger bien."
        ],
        nutrition: { calories: 200, proteins: 8, carbs: 12, fats: 14 }, // Estimation
        tags: ["soupe", "entrée", "champignons", "crémeux"]
    },

    // RECETTES CLASSIQUES & BELGES (ŒUFS, STOEMP, TARTARE, QUICHE)

    {
        title: "Œuf Mayo Classique et Fraîcheur",
        description: "Un grand classique de la cuisine française, simple et délicieux, parfait en entrée.",
        servings: 4,
        prepTime: 5,
        cookTime: 10,
        ingredients: [
            { item: "Œufs", quantity: 4, unit: "pièces" },
            { item: "Mayonnaise (maison ou commerce)", quantity: 100, unit: "g" },
            { item: "Ciboulette ou persil haché", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Sel", quantity: 1, unit: "pincée" },
            { item: "Poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Plonger les œufs dans une casserole d’eau bouillante et les cuire pendant 10 minutes.",
            "Égoutter les œufs et les passer immédiatement sous l’eau froide pour stopper la cuisson.",
            "Écaler les œufs (enlever la coquille). Couper les œufs en deux dans le sens de la longueur.",
            "Déposer une belle cuillère de mayonnaise sur chaque moitié d'œuf.",
            "Assaisonner avec sel et poivre, puis parsemer de ciboulette ou persil haché."
        ],
        nutrition: { calories: 300, proteins: 12, carbs: 2, fats: 28 }, // Estimation
        tags: ["entrée", "classique", "œuf", "froid"]
    },
    {
        title: "Stoemp Carottes et Pommes de Terre",
        description: "Version légère du plat traditionnel belge : purée onctueuse de carottes et pommes de terre, souvent servie avec des saucisses.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre (chair tendre)", quantity: 800, unit: "g" },
            { item: "Carottes", quantity: 300, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Lait chaud", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Saucisses de volaille (pour accompagnement)", quantity: 4, unit: "pièces", optional: true },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Éplucher et couper les pommes de terre et les carottes. Les cuire à l’eau bouillante salée pendant 20 minutes.",
            "Émincer l’oignon et le faire revenir dans un peu de beurre jusqu’à transparence.",
            "Égoutter les légumes et les écraser. Ajouter le lait chaud, le beurre et les oignons fondus. Mélanger.",
            "Assaisonner avec sel, poivre et muscade. Servir chaud."
        ],
        nutrition: { calories: 250, proteins: 5, carbs: 35, fats: 10 }, // Sans saucisses
        tags: ["plat complet", "belge", "légumes", "accompagnement"]
    },
    {
        title: "Stoemp Fondant aux Poireaux",
        description: "Variante délicieuse du stoemp classique, à base de poireaux fondants pour une texture onctueuse.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Pommes de terre (chair tendre)", quantity: 800, unit: "g" },
            { item: "Poireaux", quantity: 2, unit: "gros" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Lait chaud", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre à l’eau salée (20 min).",
            "Émincer l’oignon et les poireaux (rincés). Faire fondre l’oignon 3 min, ajouter les poireaux et cuire 10 minutes à feu doux jusqu’à ce qu’ils soient fondants.",
            "Égoutter les pommes de terre, les écraser. Incorporer le lait chaud, le beurre et les poireaux fondus.",
            "Assaisonner avec sel, poivre et muscade."
        ],
        nutrition: { calories: 240, proteins: 5, carbs: 32, fats: 10 },
        tags: ["plat complet", "belge", "légumes", "accompagnement"]
    },
    {
        title: "Américain Préparé (Steak Tartare Belge)",
        description: "Spécialité belge de viande de bœuf crue ultra-fraîche, assaisonnée de condiments, idéale avec des frites.",
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        ingredients: [
            { item: "Viande de bœuf hachée (ultra-fraîche)", quantity: 500, unit: "g" },
            { item: "Jaunes d’œufs", quantity: 2, unit: "pièces" },
            { item: "Moutarde", quantity: 1, unit: "c. à soupe" },
            { item: "Ketchup", quantity: 1, unit: "c. à soupe" },
            { item: "Sauce Worcestershire", quantity: 1, unit: "c. à soupe" },
            { item: "Échalotes finement hachées", quantity: 1, unit: "c. à soupe" },
            { item: "Persil frisé haché", quantity: 1, unit: "c. à soupe" },
            { item: "Câpres hachées", quantity: 1, unit: "c. à café", optional: true },
            { item: "Tabasco", quantity: 2, unit: "gouttes", optional: true },
            { item: "Sel et poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Placer la viande hachée dans un grand bol. S'assurer qu'elle est ultra-fraîche.",
            "Ajouter tous les condiments (moutarde, ketchup, Worcestershire, échalotes, persil, câpres).",
            "Assaisonner avec sel, poivre et Tabasco selon votre goût.",
            "Mélanger délicatement pour lier l’assaisonnement à la viande.",
            "Incorporer les jaunes d’œufs et mélanger délicatement.",
            "Servir l’Américain préparé bien frais, en forme de dôme."
        ],
        nutrition: { calories: 350, proteins: 35, carbs: 5, fats: 20 },
        tags: ["plat principal", "viande", "cru", "belge"]
    },
    {
        title: "Quiche Lorraine Traditionnelle",
        description: "Une tarte salée classique et savoureuse à base de pâte brisée, de lardons fumés et d’un appareil riche en crème et œufs.",
        servings: 6,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Pâte brisée", quantity: 1, unit: "rouleau" },
            { item: "Lardons fumés", quantity: 200, unit: "g" },
            { item: "Œufs", quantity: 3, unit: "pièces" },
            { item: "Crème fraîche épaisse", quantity: 25, unit: "cl" },
            { item: "Lait", quantity: 10, unit: "cl" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" },
            { item: "Gruyère râpé", quantity: 50, unit: "g", optional: true }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Foncer le moule avec la pâte et la précuire à blanc 10 minutes.",
            "Faire revenir les lardons à la poêle 5 minutes sans matière grasse. Égoutter.",
            "Battre les œufs avec la crème et le lait. Assaisonner avec sel, poivre et muscade.",
            "Répartir les lardons sur le fond de tarte précuit. Verser l’appareil.",
            "Enfourner à 180°C pendant 30 à 35 minutes jusqu’à ce que la quiche soit dorée."
        ],
        nutrition: { calories: 400, proteins: 15, carbs: 20, fats: 30 },
        tags: ["plat principal", "tarte salée", "classique", "lorraine"]
    },
    
    // RECETTES POISSONS & FRUITS DE MER (RAIE, DORADE, SAUMON, SOLE)

    {
        title: "Aile de Raie au Beurre Noir et Câpres",
        description: "Un plat classique, élégant et fin, où la raie pochée est sublimée par un beurre noisette acidulé aux câpres.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Ailes de raie", quantity: 600, unit: "g" },
            { item: "Bouillon de légumes", quantity: 1, unit: "L" },
            { item: "Beurre", quantity: 80, unit: "g" },
            { item: "Vinaigre de vin", quantity: 2, unit: "c. à soupe" },
            { item: "Câpres", quantity: 1, unit: "c. à soupe" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Plonger les ailes de raie dans le bouillon frémissant (non bouillant) et cuire 10 à 12 minutes. Égoutter et réserver au chaud.",
            "Préparer le beurre noir : faire fondre le beurre à feu moyen jusqu’à couleur noisette foncée (pas brûlée).",
            "Hors du feu, ajouter le vinaigre (attention aux projections), les câpres, le persil et le jus de citron.",
            "Napper la raie avec le beurre noir au moment de servir."
        ],
        nutrition: { calories: 380, proteins: 35, carbs: 2, fats: 25 },
        tags: ["plat principal", "poisson", "classique"]
    },
    {
        title: "Filet de Dauraude en Papillote, Citron et Herbes",
        description: "Cuisson douce et saine, qui préserve le moelleux du poisson et l'infuse des arômes du citron et du thym.",
        servings: 4,
        prepTime: 15,
        cookTime: 18,
        ingredients: [
            { item: "Filets de daurade", quantity: 600, unit: "g" },
            { item: "Courgette (julienne)", quantity: 1, unit: "pièce" },
            { item: "Carotte (julienne)", quantity: 1, unit: "pièce" },
            { item: "Poireau (émincé)", quantity: 1, unit: "pièce" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Huile d’olive", quantity: 4, unit: "c. à soupe" },
            { item: "Thym frais ou romarin", quantity: 4, unit: "brins" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 180°C.",
            "Découper 4 feuilles de papier cuisson. Répartir les légumes en julienne au centre.",
            "Poser le filet de daurade sur les légumes. Saler, poivrer.",
            "Arroser d’huile d’olive et de jus de citron, ajouter les herbes.",
            "Fermer les papillotes hermétiquement et enfourner pour 15 à 18 minutes."
        ],
        nutrition: { calories: 320, proteins: 30, carbs: 10, fats: 18 },
        tags: ["plat principal", "poisson", "sain"]
    },
    {
        title: "Tagliatelles au Saumon Fumé et à la Crème Citronnée",
        description: "Un plat de pâtes crémeux et frais, où le saumon fumé et l'aneth se marient à merveille avec la douceur du citron.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Tagliatelles fraîches ou sèches", quantity: 400, unit: "g" },
            { item: "Saumon fumé (en lanières)", quantity: 150, unit: "g" },
            { item: "Crème liquide entière", quantity: 20, unit: "cl" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Zeste de citron", quantity: 1, unit: "c. à café" },
            { item: "Aneth ou ciboulette fraîche", quantity: 1, unit: "c. à soupe" },
            { item: "Oignon doux ou échalote", quantity: 1, unit: "pièce", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les tagliatelles. Égoutter en gardant un peu d’eau de cuisson.",
            "Dans une poêle, faire revenir l’oignon ou l'échalote dans un peu d'huile d'olive (facultatif).",
            "Ajouter la crème, le jus et le zeste de citron. Laisser frémir 2 min.",
            "Hors du feu, ajouter les lanières de saumon fumé et l’aneth.",
            "Ajouter les pâtes et mélanger délicatement. Servir aussitôt."
        ],
        nutrition: { calories: 550, proteins: 25, carbs: 45, fats: 30 },
        tags: ["plat principal", "pâtes", "poisson"]
    },
    {
        title: "Sole Meunière au Four et Beurre Noisette",
        description: "Cuisson de la sole au four pour une chair nacrée et tendre, relevée d'une sauce classique au beurre noisette, citron et persil.",
        servings: 4,
        prepTime: 15,
        cookTime: 15,
        ingredients: [
            { item: "Soles entières (vidées et pelées)", quantity: 4, unit: "pièces" },
            { item: "Farine", quantity: 60, unit: "g" },
            { item: "Beurre", quantity: 80, unit: "g" },
            { item: "Jus de citron frais", quantity: 1, unit: "pièce" },
            { item: "Persil frais haché", quantity: 2, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 200°C (Air Chaud).",
            "Sécher et saler les soles. Les passer dans la farine et tapoter pour retirer l’excédent.",
            "Déposer les soles sur une plaque de cuisson recouverte de papier huilé. Parsemer de petits morceaux de beurre.",
            "Cuire 12 à 15 minutes au four (ou jusqu'à 54°C à cœur si sonde).",
            "Préparer le beurre meunière : faire fondre le reste du beurre jusqu’à couleur noisette, retirer du feu et ajouter le jus de citron et le persil.",
            "Napper les soles avec le beurre meunière au moment de servir."
        ],
        nutrition: { calories: 360, proteins: 35, carbs: 10, fats: 20 },
        tags: ["plat principal", "poisson", "classique"]
    },

    // RECETTES VOLAILLE & VIANDE (DINDE, POULET, ENTRECÔTE, HACHIS)

    {
        title: "Rôti de Dinde Moelleux, Sauce Moutarde Crémée",
        description: "Rôti de dinde cuit à basse température pour une chair juteuse, accompagné d’une sauce moutarde crémeuse classique.",
        servings: 4,
        prepTime: 15,
        cookTime: 75, // 65 min de cuisson + 10 min de repos
        ingredients: [
            { item: "Rôti de dinde ficelé", quantity: 1.2, unit: "kg" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Romarin et thym", quantity: 2, unit: "brins" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" },
            { item: "Crème fraîche liquide", quantity: 15, unit: "cl" },
            { item: "Moutarde à l’ancienne", quantity: 1, unit: "c. à soupe" },
            { item: "Fond de volaille", quantity: 5, unit: "cl" }
        ],
        instructions: [
            "Préchauffer le four à 160°C. Assaisonner le rôti et le badigeonner d’huile/beurre.",
            "Cuire couvert (papier alu + papier cuisson) 60 min. Enlever l’alu et cuire 15 min à 190°C pour dorer (jusqu’à 72°C à cœur).",
            "Laisser reposer 10 min sous alu avant de trancher.",
            "Préparer la sauce : faire chauffer la crème, le fond de volaille et la moutarde, laisser mijoter 5 min. Servir chaud."
        ],
        nutrition: { calories: 350, proteins: 35, carbs: 5, fats: 20 },
        tags: ["plat principal", "volaille", "rôti"]
    },
    {
        title: "Entrecôte de Bœuf Grillée, Jus Corsé au Romarin",
        description: "Une entrecôte saisie à la perfection, servie avec son jus de cuisson réduit, parfumé au romarin frais, pour un plat riche en saveurs.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Entrecôtes de bœuf", quantity: 800, unit: "g" },
            { item: "Huile neutre", quantity: 2, unit: "c. à soupe" },
            { item: "Romarin frais", quantity: 2, unit: "brins" },
            { item: "Fond de veau (réduit)", quantity: 20, unit: "cl" },
            { item: "Vin rouge (ou fond brun)", quantity: 10, unit: "cl", optional: true },
            { item: "Échalotes ciselées", quantity: 2, unit: "pièces" },
            { item: "Beurre froid", quantity: 1, unit: "c. à soupe" },
            { item: "Fleur de sel, poivre noir", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Sortir la viande 30 min avant cuisson. Assaisonner.",
            "Saisir les entrecôtes dans l’huile très chaude 2 à 3 min par face pour une cuisson saignante. Réserver sous alu.",
            "Dans la même poêle, faire suer les échalotes. Déglacer au vin rouge ou fond brun, gratter les sucs.",
            "Ajouter le fond de veau et le romarin. Laisser réduire à feu moyen jusqu’à un jus nappant.",
            "Hors du feu, monter le jus au beurre froid pour lier. Servir aussitôt sur la viande."
        ],
        nutrition: { calories: 650, proteins: 40, carbs: 5, fats: 45 },
        tags: ["plat principal", "viande", "gastronomique"]
    },
    {
        title: "Cuisse de Poulet Rôtie et Croustillante",
        description: "Cuisse de poulet rôtie au four avec une peau croustillante et une chair juteuse, parfumée au romarin et à l'ail.",
        servings: 4,
        prepTime: 10,
        cookTime: 40,
        ingredients: [
            { item: "Cuisses de poulet", quantity: 4, unit: "pièces" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" },
            { item: "Ail", quantity: 2, unit: "gousses" },
            { item: "Romarin et thym", quantity: 2, unit: "brins" },
            { item: "Paprika", quantity: 1, unit: "c. à café", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 200°C.",
            "Frotter les cuisses de poulet avec l’huile d’olive, sel, poivre et épices. Disposer l’ail écrasé et les herbes autour.",
            "Placer les cuisses sur une plaque, peau vers le haut.",
            "Rôtir 35 à 40 min, en arrosant à mi-cuisson (température à cœur : 82°C).",
            "Terminer sous le grill 3-5 min pour une peau extra croustillante."
        ],
        nutrition: { calories: 400, proteins: 30, carbs: 2, fats: 30 },
        tags: ["plat principal", "volaille", "rôti"]
    },
    {
        title: "Bolognaise Classique Douce (pour enfants)",
        description: "Sauce à la viande mijotée, adaptée pour les enfants avec une base de légumes fondants et une touche de lait pour adoucir l'acidité de la tomate.",
        servings: 4,
        prepTime: 15,
        cookTime: 40,
        ingredients: [
            { item: "Viande hachée (bœuf ou dinde)", quantity: 400, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Carotte râpée", quantity: 1, unit: "pièce" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Ail", quantity: 1, unit: "gousse" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à soupe" },
            { item: "Lait entier", quantity: 10, unit: "cl" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" },
            { item: "Origan ou thym séché", quantity: 1, unit: "pincée" },
            { item: "Sel, poivre doux", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Émincer l'oignon, râper la carotte. Les faire revenir dans l'huile d'olive 5 min.",
            "Ajouter la viande hachée, saisir jusqu’à coloration.",
            "Ajouter tomates concassées, concentré, ail écrasé. Assaisonner et ajouter les herbes.",
            "Couvrir et laisser mijoter 30 à 40 minutes à feu doux.",
            "En fin de cuisson, ajouter le lait, mélanger et servir sur des spaghetti ou des coquillettes."
        ],
        nutrition: { calories: 450, proteins: 30, carbs: 25, fats: 25 },
        tags: ["plat principal", "viande", "enfant"]
    },
    
    // RECETTES PÂTES & CÉRÉALES (GNOCCHI, RIZ, PÂTES VÉGÉTARIENNES)

    {
        title: "Gnocchi au Gorgonzola Crémeux et Noix",
        description: "Gnocchis moelleux nappés d’une sauce au gorgonzola doux et onctueux, parsemés de noix croquantes pour un contraste parfait.",
        servings: 4,
        prepTime: 10,
        cookTime: 10,
        ingredients: [
            { item: "Gnocchi frais (pommes de terre)", quantity: 500, unit: "g" },
            { item: "Gorgonzola doux", quantity: 120, unit: "g" },
            { item: "Crème fraîche liquide ou épaisse", quantity: 10, unit: "cl" },
            { item: "Cerseaux de noix", quantity: 50, unit: "g" },
            { item: "Poivre noir, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire fondre le gorgonzola dans la crème à feu doux, en remuant.",
            "Assaisonner de poivre et muscade (le fromage est déjà salé).",
            "Cuire les gnocchis dans l’eau bouillante salée jusqu’à ce qu’ils remontent à la surface (environ 2 min).",
            "Égoutter, ajouter à la sauce gorgonzola et mélanger délicatement.",
            "Ajouter les noix concassées et servir immédiatement."
        ],
        nutrition: { calories: 480, proteins: 15, carbs: 45, fats: 25 },
        tags: ["plat principal", "pâtes", "végétarien", "crémeux"]
    },
    {
        title: "Spaghetti Primavera aux Légumes Croquants",
        description: "Spaghetti al dente servis dans une sauce légère à l'huile d'olive et à l'ail, avec des légumes de saison croquants (sans sauce tomate).",
        servings: 4,
        prepTime: 15,
        cookTime: 15,
        ingredients: [
            { item: "Spaghetti", quantity: 350, unit: "g" },
            { item: "Courgette", quantity: 1, unit: "pièce" },
            { item: "Carotte", quantity: 1, unit: "pièce" },
            { item: "Poivron rouge", quantity: 1, unit: "pièce" },
            { item: "Petits pois (frais ou surgelés)", quantity: 100, unit: "g" },
            { item: "Ail", quantity: 1, unit: "gousse" },
            { item: "Huile d’olive", quantity: 3, unit: "c. à soupe" },
            { item: "Basilic ou persil frais", quantity: 1, unit: "poignée" },
            { item: "Parmesan râpé", quantity: 40, unit: "g", optional: true }
        ],
        instructions: [
            "Cuire les spaghetti. Réserver une louche d’eau de cuisson.",
            "Couper les légumes en dés ou julienne. Faire revenir l’ail dans l’huile d’olive, ajouter les légumes et cuire 5-6 min (ils doivent rester croquants).",
            "Ajouter les pâtes, un peu d’eau de cuisson pour lier, et mélanger à feu doux.",
            "Saler, poivrer et parsemer de basilic frais. Servir avec du parmesan."
        ],
        nutrition: { calories: 460, proteins: 15, carbs: 70, fats: 12 },
        tags: ["plat principal", "pâtes", "végétarien", "léger"]
    },
    {
        title: "Riz Sauté aux Légumes (style cantonais doux)",
        description: "Riz sauté aux petits dés de légumes et œuf brouillé, assaisonné d’une sauce soja douce pour un plat asiatique léger et complet.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Riz cuit (idéalement froid)", quantity: 500, unit: "g" },
            { item: "Carottes", quantity: 100, unit: "g" },
            { item: "Courgettes", quantity: 100, unit: "g" },
            { item: "Petits pois (surgelés)", quantity: 100, unit: "g" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Sauce soja douce", quantity: 2, unit: "c. à soupe" },
            { item: "Huile végétale", quantity: 3, unit: "c. à soupe" },
            { item: "Oignon", quantity: 1, unit: "pièce", optional: true }
        ],
        instructions: [
            "Couper les légumes en petits dés. Faire dorer l’oignon (facultatif).",
            "Faire sauter les légumes dans un wok ou une grande poêle 5-7 minutes.",
            "Ajouter le riz froid, bien séparer les grains et faire sauter 2-3 minutes.",
            "Ajouter la sauce soja. Assaisonner.",
            "Faire cuire les œufs brouillés à part et les mélanger au riz avant de servir."
        ],
        nutrition: { calories: 400, proteins: 15, carbs: 60, fats: 10 },
        tags: ["plat principal", "riz", "asiatique"]
    },
    {
        title: "Penne au Tofu Fumé et Sauce Tomate",
        description: "Alternative végétarienne aux pâtes à la viande, avec des dés de tofu fumé poêlés qui apportent texture et saveur umami à une sauce tomate maison.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Penne", quantity: 400, unit: "g" },
            { item: "Tofu fumé", quantity: 200, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Ail", quantity: 1, unit: "gousse" },
            { item: "Basilic frais", quantity: 1, unit: "poignée" },
            { item: "Huile d’olive", quantity: 3, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les penne. Réserver de l’eau de cuisson.",
            "Couper le tofu en dés et le faire dorer dans l’huile d’olive 5 min. Réserver.",
            "Faire revenir l’oignon et l’ail. Ajouter les tomates concassées, le basilic, assaisonner et laisser mijoter 10 min.",
            "Ajouter le tofu doré à la sauce. Incorporer les pâtes et un peu d’eau de cuisson pour lier. Servir chaud."
        ],
        nutrition: { calories: 500, proteins: 22, carbs: 65, fats: 18 },
        tags: ["plat principal", "végétarien", "pâtes"]
    },
    {
        title: "Nouilles Sautées aux Légumes Croquants",
        description: "Nouilles de blé ou aux œufs sautées au wok avec des légumes colorés, assaisonnées d'une sauce soja douce.",
        servings: 4,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Nouilles (de blé ou aux œufs)", quantity: 300, unit: "g" },
            { item: "Carotte (julienne)", quantity: 2, unit: "pièces" },
            { item: "Courgette (julienne)", quantity: 1, unit: "pièce" },
            { item: "Poivron (lanières)", quantity: 1, unit: "pièce" },
            { item: "Oignon (lamelles)", quantity: 1, unit: "pièce" },
            { item: "Brocolis (fleurons)", quantity: 150, unit: "g" },
            { item: "Huile neutre", quantity: 3, unit: "c. à soupe" },
            { item: "Sauce soja douce", quantity: 4, unit: "c. à soupe" },
            { item: "Gingembre frais râpé", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Cuire et égoutter les nouilles, les rincer à l'eau froide pour éviter qu'elles ne collent.",
            "Blanchir les brocolis 2-3 min. Couper les autres légumes en julienne.",
            "Chauffer le wok avec l’huile à feu vif. Ajouter oignon et légumes, sauter 5-6 min pour qu'ils restent croquants.",
            "Ajouter les nouilles et la sauce soja. Mélanger énergiquement et servir aussitôt."
        ],
        nutrition: { calories: 420, proteins: 15, carbs: 60, fats: 15 },
        tags: ["plat principal", "asiatique", "végétarien"]
    },

    // RECETTES ACCOMPAGNEMENTS (RATATOUILLE, GRATIN, PURÉES, RIZ)

    {
        title: "Ratatouille Classique Provençale",
        description: "Mélange emblématique de légumes du soleil mijotés à l'huile d'olive et aux herbes aromatiques, parfait en accompagnement.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Aubergine", quantity: 1, unit: "pièce" },
            { item: "Courgette", quantity: 1, unit: "pièce" },
            { item: "Poivron (rouge ou jaune)", quantity: 1, unit: "pièce" },
            { item: "Tomates (pelées et épépinées)", quantity: 2, unit: "pièces" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Gousses d’ail", quantity: 2, unit: "pièces" },
            { item: "Huile d’olive", quantity: 3, unit: "c. à soupe" },
            { item: "Herbes de Provence", quantity: 1, unit: "c. à café" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Couper tous les légumes en dés. Émincer l’oignon et hacher l’ail.",
            "Faire chauffer l’huile d’olive. Faire revenir l’oignon et l’ail.",
            "Ajouter le poivron (5 min), puis l’aubergine et la courgette (5 min).",
            "Ajouter les tomates, les herbes, le sel et le poivre.",
            "Couvrir et laisser mijoter à feu doux 30 à 40 minutes, en remuant de temps en temps."
        ],
        nutrition: { calories: 150, proteins: 4, carbs: 15, fats: 10 },
        tags: ["accompagnement", "légumes", "provençal", "végétarien"]
    },
    {
        title: "Rôti de Légumes Méditerranéens au Four",
        description: "Mélange de légumes racines et de saison rôtis à l'huile d'olive et aux herbes, idéal pour accompagner une viande grillée.",
        servings: 4,
        prepTime: 15,
        cookTime: 35,
        ingredients: [
            { item: "Pommes de terre grenaille", quantity: 600, unit: "g" },
            { item: "Carottes", quantity: 3, unit: "pièces" },
            { item: "Courgettes", quantity: 2, unit: "pièces" },
            { item: "Poivrons rouges", quantity: 1, unit: "pièce" },
            { item: "Oignons rouges", quantity: 2, unit: "pièces" },
            { item: "Champignons de Paris", quantity: 200, unit: "g" },
            { item: "Ail", quantity: 3, unit: "gousses" },
            { item: "Huile d’olive", quantity: 4, unit: "c. à soupe" },
            { item: "Herbes de Provence", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 200°C. Couper tous les légumes en morceaux de taille homogène.",
            "Mélanger les légumes avec l’huile d’olive, les herbes, l'ail en chemise, le sel et le poivre.",
            "Étaler sur une plaque de cuisson en une seule couche.",
            "Enfourner 35 à 40 minutes, en remuant à mi-cuisson, jusqu’à ce que les légumes soient dorés et tendres."
        ],
        nutrition: { calories: 250, proteins: 5, carbs: 30, fats: 12 },
        tags: ["accompagnement", "légumes", "rôti"]
    },
    {
        title: "Gratin Dauphinois Classique",
        description: "Pommes de terre coupées finement et cuites dans une crème parfumée à l’ail et à la muscade pour un accompagnement fondant.",
        servings: 4,
        prepTime: 15,
        cookTime: 70,
        ingredients: [
            { item: "Pommes de terre (chair ferme)", quantity: 1, unit: "kg" },
            { item: "Crème liquide entière", quantity: 40, unit: "cl" },
            { item: "Lait entier", quantity: 20, unit: "cl" },
            { item: "Gousse d’ail", quantity: 1, unit: "pièce" },
            { item: "Noix de muscade râpée", quantity: 1, unit: "pincée" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Préchauffer le four à 160°C. Couper les pommes de terre en fines rondelles (2-3 mm).",
            "Frotter un plat à gratin avec l’ail, puis le beurrer.",
            "Faire frémir la crème et le lait avec l’ail, la muscade, le sel et le poivre.",
            "Disposer les rondelles de pommes de terre en couches dans le plat.",
            "Verser le mélange lait/crème. Enfourner pour 60 à 70 min, jusqu’à ce que ce soit doré et fondant."
        ],
        nutrition: { calories: 450, proteins: 8, carbs: 35, fats: 30 },
        tags: ["accompagnement", "classique", "gratin"]
    },
    
    // RECETTES SAUCES & CRÈMES (POIVRE, MOUTARDE, CHAMPIGNONS)

    {
        title: "Sauce au Poivre Noir Corsée (sans échalote)",
        description: "Une sauce riche et relevée, idéale pour accompagner les viandes, à base de fond de veau, de cognac et de crème épaisse.",
        servings: 2,
        prepTime: 5,
        cookTime: 10,
        ingredients: [
            { item: "Poivre noir en grains (concassé)", quantity: 1, unit: "c. à soupe" },
            { item: "Beurre", quantity: 10, unit: "g" },
            { item: "Cognac ou Brandy", quantity: 2, unit: "cl", optional: true },
            { item: "Fond de veau (réduit)", quantity: 5, unit: "cl" },
            { item: "Crème fraîche épaisse", quantity: 20, unit: "cl" },
            { item: "Sel fin", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire fondre le beurre, ajouter le poivre concassé et le faire torréfier 30 sec.",
            "Déglacer avec le cognac (ou bouillon) et laisser réduire presque à sec.",
            "Ajouter le fond de veau, laisser réduire 1 à 2 min.",
            "Incorporer la crème épaisse et laisser mijoter 3-4 min à feu doux jusqu’à consistance nappante.",
            "Ajuster le sel si besoin."
        ],
        nutrition: { calories: 350, proteins: 5, carbs: 10, fats: 30 },
        tags: ["sauce", "viande", "crémeuse"]
    },
    {
        title: "Sauce Moutarde Crémeuse (pour Dinde/Poulet)",
        description: "Une sauce rapide et onctueuse à base de moutarde à l'ancienne et de crème, parfaite pour les volailles.",
        servings: 4,
        prepTime: 5,
        cookTime: 10,
        ingredients: [
            { item: "Échalotes (ou oignon)", quantity: 1, unit: "pièce", optional: true },
            { item: "Beurre ou huile", quantity: 1, unit: "c. à soupe" },
            { item: "Moutarde à l’ancienne", quantity: 1, unit: "c. à soupe" },
            { item: "Crème fraîche liquide", quantity: 15, unit: "cl" },
            { item: "Fond de volaille", quantity: 5, unit: "cl" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire revenir l’échalote ciselée dans le beurre ou l'huile.",
            "Ajouter la moutarde et bien mélanger.",
            "Verser la crème et le fond de volaille, porter à frémissement sans bouillir.",
            "Laisser mijoter 5 minutes à feu doux, ajuster l’assaisonnement."
        ],
        nutrition: { calories: 200, proteins: 3, carbs: 5, fats: 18 },
        tags: ["sauce", "volaille", "crémeuse"]
    },
    {
        title: "Sauce aux Champignons Crémeuse",
        description: "Sauce classique et polyvalente, riche en champignons, liée à la crème et au bouillon de volaille.",
        servings: 4,
        prepTime: 10,
        cookTime: 10,
        ingredients: [
            { item: "Champignons de Paris (émincés)", quantity: 250, unit: "g" },
            { item: "Échalote", quantity: 1, unit: "pièce" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Crème fraîche liquide", quantity: 15, unit: "cl" },
            { item: "Bouillon de volaille", quantity: 10, unit: "cl" },
            { item: "Persil frais haché", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire suer l’échalote hachée dans le beurre. Ajouter les champignons et les faire dorer 5-6 min.",
            "Ajouter le bouillon, laisser réduire 2-3 min.",
            "Incorporer la crème et laisser mijoter 3-4 min jusqu’à consistance nappante.",
            "Assaisonner, ajouter le persil frais."
        ],
        nutrition: { calories: 180, proteins: 5, carbs: 6, fats: 15 },
        tags: ["sauce", "crémeuse", "légumes"]
    },
    
    // RECETTES VÉGÉTARIENNES (SOUPE, SALADE, DESSERT)

    {
        title: "Velouté de Champignons Onctueux",
        description: "Une soupe riche et savoureuse, parfaite en entrée, avec une touche de crème fraîche et d'ail.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Champignons de Paris", quantity: 500, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Gousse d’ail", quantity: 1, unit: "pièce" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Bouillon de volaille ou légumes", quantity: 75, unit: "cl" },
            { item: "Crème fraîche", quantity: 10, unit: "cl" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Émincer l’oignon et l’ail. Nettoyer et couper les champignons. Faire fondre le beurre.",
            "Faire revenir l’oignon et l’ail (2-3 min). Ajouter les champignons et dorer 5 minutes.",
            "Saupoudrer de farine, cuire 1 minute, puis verser le bouillon chaud. Laisser mijoter 15 minutes.",
            "Mixer jusqu’à obtenir une texture lisse. Ajouter la crème fraîche, saler, poivrer."
        ],
        nutrition: { calories: 200, proteins: 8, carbs: 12, fats: 14 },
        tags: ["soupe", "entrée", "végétarien"]
    },
    {
        title: "Salade de Chou-rave, Carottes et Pommes",
        description: "Salade fraîche et croquante, légèrement sucrée, idéale en entrée ou en accompagnement.",
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        ingredients: [
            { item: "Chou-rave", quantity: 1, unit: "pièce" },
            { item: "Carottes", quantity: 2, unit: "pièces" },
            { item: "Pomme (Granny Smith ou Pink Lady)", quantity: 1, unit: "pièce" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" },
            { item: "Moutarde douce", quantity: 1, unit: "c. à café" },
            { item: "Miel ou sirop d’érable", quantity: 1, unit: "c. à café", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Râper grossièrement le chou-rave, les carottes et la pomme.",
            "Arroser immédiatement du jus de citron pour éviter l’oxydation.",
            "Préparer la vinaigrette : mélanger l’huile, la moutarde, le miel (si utilisé), sel et poivre.",
            "Mélanger les légumes et la vinaigrette. Laisser reposer 15 minutes au frais avant de servir."
        ],
        nutrition: { calories: 150, proteins: 3, carbs: 25, fats: 5 },
        tags: ["entrée", "salade", "végétarien"]
    },
    {
        title: "Crème de Millet au Lait et Vanille",
        description: "Un dessert onctueux à base de millet décortiqué, parfumé à la vanille, rappelant le riz au lait mais naturellement sans gluten.",
        servings: 4,
        prepTime: 5,
        cookTime: 30,
        ingredients: [
            { item: "Millet décortiqué", quantity: 100, unit: "g" },
            { item: "Lait entier (ou boisson végétale)", quantity: 50, unit: "cl" },
            { item: "Sucre de canne ou cassonade", quantity: 50, unit: "g" },
            { item: "Vanille (gousse ou extrait)", quantity: 1, unit: "c. à café" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Rincer le millet. Faire chauffer le lait avec la vanille et le sel.",
            "Dès que le lait frémit, ajouter le millet.",
            "Cuire 25 à 30 min à feu doux, en remuant régulièrement pour que ça n’attache pas.",
            "Ajouter le sucre en fin de cuisson. Servir tiède ou froid, nature ou avec de la cannelle."
        ],
        nutrition: { calories: 350, proteins: 10, carbs: 55, fats: 10 },
        tags: ["dessert", "végétarien", "sans gluten"]
    },

    // RECETTES DESSERTS & ENTREES COMPLÉMENTAIRES
    
    {
        title: "Tartelettes Exotiques à l'Ananas",
        description: "Dessert fruité et gourmand avec une base croustillante et une garniture crémeuse aux morceaux d'ananas.",
        servings: 6,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Pâte sablée ou feuilletée", quantity: 1, unit: "rouleau" },
            { item: "Ananas (tranches)", quantity: 1, unit: "boîte ou pièce" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Sucre", quantity: 100, unit: "g" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Maïzena", quantity: 1, unit: "c. à soupe" },
            { item: "Rhum", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Sucre vanillé", quantity: 1, unit: "sachet" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Foncer 6 moules à tartelettes et précuire 10 min.",
            "Fouetter les œufs avec le sucre, la crème et la Maïzena.",
            "Disposer les ananas égouttés sur les fonds de tarte. Verser l’appareil.",
            "Enfourner à 180°C pendant 20 à 25 minutes."
        ],
        nutrition: { calories: 350, proteins: 5, carbs: 45, fats: 15 },
        tags: ["dessert", "fruit", "pâtisserie"]
    },
    {
        title: "Cake à l’Orange Moelleux et Parfumé",
        description: "Un cake gourmand, très moelleux, imbibé et parfumé aux zestes et jus d'oranges fraîches.",
        servings: 8,
        prepTime: 20,
        cookTime: 45,
        ingredients: [
            { item: "Farine", quantity: 200, unit: "g" },
            { item: "Sucre", quantity: 150, unit: "g" },
            { item: "Œufs", quantity: 3, unit: "pièces" },
            { item: "Beurre fondu", quantity: 100, unit: "g" },
            { item: "Levure chimique", quantity: 1, unit: "sachet" },
            { item: "Zeste de 2 oranges non traitées", quantity: 1, unit: "c. à soupe" },
            { item: "Jus de 2 oranges", quantity: 10, unit: "cl" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Battre les œufs avec le sucre jusqu’à blanchiment.",
            "Ajouter le beurre fondu, le zeste et le jus d’orange.",
            "Incorporer la farine et la levure tamisées.",
            "Verser dans un moule beurré. Enfourner 40 à 45 min. Laisser tiédir avant de démouler."
        ],
        nutrition: { calories: 300, proteins: 5, carbs: 40, fats: 15 },
        tags: ["dessert", "goûter", "agrume"]
    },
    {
        title: "Pêches au Thon (version fraîche et estivale)",
        description: "Entrée sucrée-salée classique, où des demi-pêches fraîches (légèrement pochées ou rôties) sont garnies d'une farce au thon et mayonnaise.",
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        ingredients: [
            { item: "Pêches fraîches bien mûres", quantity: 4, unit: "pièces" },
            { item: "Thon au naturel (égoutté)", quantity: 150, unit: "g" },
            { item: "Mayonnaise (maison ou commerce)", quantity: 4, unit: "c. à soupe" },
            { item: "Jus de citron", quantity: 1, unit: "c. à café" },
            { item: "Moutarde douce", quantity: 0.5, unit: "c. à café", optional: true },
            { item: "Persil haché", quantity: 1, unit: "c. à café" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Couper les pêches en deux et retirer le noyau. Les éplucher si nécessaire (pocher 30s si trop fermes).",
            "Émietter le thon, mélanger avec la mayonnaise, le jus de citron, le persil, sel et poivre.",
            "Garnir les demi-pêches avec la farce au thon.",
            "Réserver au frais 1h avant de servir, décoré de persil ou de ciboulette."
        ],
        nutrition: { calories: 250, proteins: 15, carbs: 20, fats: 12 },
        tags: ["entrée", "sucré-salé", "thon"]
    },

    // RECETTES LÉGUMES & SALADES CRUES
    
    {
        title: "Salade de Fenouil et Orange à la Menthe",
        description: "Une salade fraîche, croquante et légèrement anisée, idéale pour accompagner poisson ou viande blanche.",
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        ingredients: [
            { item: "Bulbes de fenouil", quantity: 2, unit: "petits" },
            { item: "Orange", quantity: 2, unit: "pièces" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Huile d’olive extra vierge", quantity: 3, unit: "c. à soupe" },
            { item: "Menthe fraîche hachée", quantity: 1, unit: "c. à soupe" },
            { item: "Olives noires", quantity: 10, unit: "pièces", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Émincer très finement le fenouil. Peler à vif les oranges et découper les segments.",
            "Mélanger le fenouil et les segments d'orange.",
            "Préparer la vinaigrette : mélanger l’huile d’olive, le jus de citron, sel et poivre.",
            "Verser la vinaigrette sur la salade et laisser mariner 15-30 min au frais.",
            "Ajouter la menthe et les olives (si utilisées) juste avant de servir."
        ],
        nutrition: { calories: 150, proteins: 3, carbs: 15, fats: 10 },
        tags: ["entrée", "salade", "végétarien", "frais"]
    },
    {
        title: "Salade de Chicons (Endives) Classique aux Noix et Pommes",
        description: "Salade croquante et légèrement amère, équilibrée par la douceur de la pomme et le gras des noix.",
        servings: 4,
        prepTime: 15,
        cookTime: 0,
        ingredients: [
            { item: "Chicons (Endives)", quantity: 4, unit: "pièces" },
            { item: "Pomme (Granny Smith ou autre)", quantity: 1, unit: "pièce" },
            { item: "Noix concassées", quantity: 50, unit: "g" },
            { item: "Dés de fromage (emmental, comté, ou chèvre)", quantity: 50, unit: "g", optional: true },
            { item: "Moutarde douce", quantity: 1, unit: "c. à café" },
            { item: "Vinaigre de cidre ou vin blanc", quantity: 1, unit: "c. à soupe" },
            { item: "Huile de noix ou d’olive", quantity: 3, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Émincer finement les chicons et la pomme. Mélanger pour éviter l’oxydation.",
            "Préparer la vinaigrette : fouetter la moutarde, le vinaigre, le sel et le poivre, puis incorporer l'huile.",
            "Mélanger les chicons, la pomme, les noix et le fromage (si utilisé) avec la vinaigrette.",
            "Servir frais et croquant."
        ],
        nutrition: { calories: 200, proteins: 8, carbs: 15, fats: 15 },
        tags: ["entrée", "salade", "belge"]
    },
    
    // RECETTES POIVRONS & CANNELLONIS (FARCES & GRATINS)
    
    {
        title: "Cannellonis Ricotta-Épinards et Sauce Tomate Douce",
        description: "Cannellonis farcis d’une farce douce à la ricotta et aux épinards, nappés d’une sauce tomate lisse et gratinés au four. (Portions : 6 personnes)",
        servings: 6,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Cannellonis secs", quantity: 300, unit: "g" },
            { item: "Épinards frais", quantity: 500, unit: "g" },
            { item: "Ricotta", quantity: 300, unit: "g" },
            { item: "Emmental râpé (farce et gratin)", quantity: 150, unit: "g" },
            { item: "Pulpe de tomate", quantity: 800, unit: "g" },
            { item: "Carottes (râpées pour sauce)", quantity: 100, unit: "g" },
            { item: "Oignon doux", quantity: 1, unit: "pièce" },
            { item: "Huile d’olive", quantity: 3, unit: "c. à soupe" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire tomber les épinards, bien égoutter, puis mélanger avec la ricotta et 50g d'emmental.",
            "Préparer la sauce tomate : faire revenir l'oignon et la carotte râpée, ajouter la pulpe de tomate, assaisonner et mijoter 20 min (mixer pour une sauce lisse).",
            "Farcir les cannellonis et les disposer dans un plat.",
            "Napper de sauce, parsemer du reste d'emmental. Cuire 30 min à 180°C (couvert alu 20 min, puis gratiner)."
        ],
        nutrition: { calories: 450, proteins: 20, carbs: 45, fats: 22 },
        tags: ["plat principal", "végétarien", "gratin", "pâtes"]
    },
    {
        title: "Cannellonis Saumon et Courgettes Crémées",
        description: "Cannellonis gourmands farcis de saumon émietté et de courgettes, nappés d'une sauce crème-béchamel onctueuse.",
        servings: 6,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Cannellonis secs", quantity: 300, unit: "g" },
            { item: "Saumon frais (ou surgelé)", quantity: 500, unit: "g" },
            { item: "Courgettes (râpées)", quantity: 400, unit: "g" },
            { item: "Ricotta", quantity: 300, unit: "g" },
            { item: "Emmental râpé (farce et gratin)", quantity: 150, unit: "g" },
            { item: "Béchamel légère (faite avec 15g de beurre/farine)", quantity: 50, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire le saumon à la vapeur ou pocher, l'émietter. Râper les courgettes et les faire revenir pour retirer l'excès d'eau.",
            "Mélanger saumon, courgettes, ricotta et 50g d'emmental. Farcir les cannellonis.",
            "Préparer une béchamel légère et y ajouter la crème liquide.",
            "Napper les cannellonis, parsemer de fromage. Cuire 30 min à 180°C (couvert alu 20 min, puis gratiner)."
        ],
        nutrition: { calories: 480, proteins: 30, carbs: 35, fats: 25 },
        tags: ["plat principal", "poisson", "gratin", "pâtes"]
    },
    
    // RECETTES POTAGES & SOUPE
    
    {
        title: "Soupe de Tomates Maison",
        description: "Soupe classique, réconfortante, adoucie par la carotte et facile à préparer en grande quantité.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Tomates mûres ou concassées", quantity: 800, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Carotte", quantity: 1, unit: "pièce" },
            { item: "Ail", quantity: 1, unit: "gousse" },
            { item: "Bouillon de légumes", quantity: 60, unit: "cl" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à café" },
            { item: "Huile d’olive", quantity: 1, unit: "c. à soupe" },
            { item: "Sucre", quantity: 0.5, unit: "c. à café", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Émincer l’oignon, la carotte et l’ail. Les faire revenir dans l'huile d'olive 3-4 min sans coloration.",
            "Ajouter les tomates, le concentré, assaisonner et cuire 5 min.",
            "Verser le bouillon, laisser cuire 15-20 min à feu moyen.",
            "Mixer finement, ajuster l’assaisonnement et servir chaud."
        ],
        nutrition: { calories: 120, proteins: 5, carbs: 15, fats: 5 },
        tags: ["soupe", "entrée", "végétarien"]
    },
    {
        title: "Soupe de Potiron Douce et Veloutée",
        description: "Soupe d'automne naturellement sucrée et réconfortante, idéale pour les enfants comme pour les adultes.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Potiron ou potimarron", quantity: 800, unit: "g" },
            { item: "Pommes de terre", quantity: 250, unit: "g" },
            { item: "Oignon doux", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 80, unit: "cl" },
            { item: "Beurre ou huile d’olive", quantity: 20, unit: "g" },
            { item: "Crème fraîche liquide", quantity: 3, unit: "c. à soupe", optional: true },
            { item: "Sel, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Éplucher et couper le potiron et les pommes de terre. Émincer l’oignon.",
            "Faire revenir l’oignon dans le beurre ou l’huile. Ajouter le potiron et les pommes de terre.",
            "Verser le bouillon, couvrir et cuire 20-25 min jusqu’à ce que les légumes soient tendres.",
            "Mixer finement, ajouter la crème (si utilisée) et assaisonner de sel et muscade."
        ],
        nutrition: { calories: 180, proteins: 4, carbs: 25, fats: 8 },
        tags: ["soupe", "entrée", "végétarien"]
    },
    {
        title: "Soupe de Petits Pois Onctueuse",
        description: "Soupe printanière, douce et naturellement sucrée, parfaite pour introduire les légumes aux plus jeunes.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Petits pois (frais ou surgelés)", quantity: 500, unit: "g" },
            { item: "Pomme de terre", quantity: 150, unit: "g" },
            { item: "Oignon doux", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes doux", quantity: 80, unit: "cl" },
            { item: "Beurre ou huile d’olive", quantity: 20, unit: "g" },
            { item: "Crème fraîche", quantity: 2, unit: "c. à soupe", optional: true },
            { item: "Sel fin", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire suer l’oignon émincé dans le beurre ou l’huile.",
            "Ajouter les petits pois et la pomme de terre coupée en dés.",
            "Verser le bouillon, couvrir et laisser mijoter 15-20 min jusqu’à ce que tout soit tendre.",
            "Mixer finement, ajouter la crème (si utilisée) et ajuster le sel. Servir chaud."
        ],
        nutrition: { calories: 220, proteins: 10, carbs: 30, fats: 8 },
        tags: ["soupe", "entrée", "végétarien", "enfant"]
    },
    
    {
        title: "Curry de Légumes au Lait de Coco Doux",
        description: "Un plat végétarien réconfortant, riche en légumes et parfumé au curry et au lait de coco, parfait avec du riz basmati.",
        servings: 4,
        prepTime: 20,
        cookTime: 25,
        ingredients: [
            { item: "Lait de coco", quantity: 40, unit: "cl" },
            { item: "Pâte de curry doux (rouge ou jaune)", quantity: 1, unit: "c. à soupe" },
            { item: "Pommes de terre", quantity: 2, unit: "pièces" },
            { item: "Carottes", quantity: 2, unit: "pièces" },
            { item: "Brocolis (fleurons)", quantity: 150, unit: "g" },
            { item: "Poivron rouge", quantity: 1, unit: "pièce" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Huile végétale", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" },
            { item: "Coriandre fraîche", quantity: 1, unit: "c. à soupe", optional: true }
        ],
        instructions: [
            "Émincer l'oignon et le faire revenir dans l'huile. Ajouter la pâte de curry et cuire 1 min.",
            "Ajouter les légumes coupés en morceaux, faire revenir 5 min.",
            "Verser le lait de coco et 10 cl d'eau. Assaisonner.",
            "Couvrir et laisser mijoter 20 min, jusqu'à ce que les légumes soient tendres.",
            "Servir avec du riz et de la coriandre fraîche."
        ],
        nutrition: { calories: 400, proteins: 10, carbs: 35, fats: 25 },
        tags: ["plat principal", "végétarien", "curry", "asiatique"]
    },
    {
        title: "Lasagnes aux Épinards et Ricotta",
        description: "Lasagnes végétariennes, sans viande, composées de couches de pâtes, d'une farce crémeuse aux épinards et ricotta, et de béchamel.",
        servings: 6,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Feuilles de lasagnes sèches", quantity: 250, unit: "g" },
            { item: "Épinards frais ou surgelés", quantity: 500, unit: "g" },
            { item: "Ricotta", quantity: 300, unit: "g" },
            { item: "Béchamel (lait, beurre, farine)", quantity: 50, unit: "cl" },
            { item: "Emmental ou parmesan râpé", quantity: 150, unit: "g" },
            { item: "Noix de muscade", quantity: 1, unit: "pincée" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Faire cuire les épinards, bien les égoutter.",
            "Mélanger les épinards avec la ricotta, muscade, sel et poivre.",
            "Préparer la béchamel.",
            "Montage : alterner dans un plat à gratin les couches de béchamel, pâtes, farce ricotta-épinards, et fromage râpé.",
            "Terminer par une couche de béchamel et de fromage. Enfourner 35 à 40 minutes."
        ],
        nutrition: { calories: 420, proteins: 20, carbs: 40, fats: 20 },
        tags: ["plat principal", "végétarien", "gratin", "italien"]
    },
    {
        title: "Galettes de Lentilles Corail et Curry",
        description: "Galettes de légumes et lentilles corail riches en protéines, idéales pour remplacer la viande dans un burger ou une assiette composée.",
        servings: 4,
        prepTime: 20,
        cookTime: 15,
        ingredients: [
            { item: "Lentilles corail (sèches)", quantity: 150, unit: "g" },
            { item: "Carotte râpée", quantity: 1, unit: "pièce" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Œuf", quantity: 1, unit: "pièce" },
            { item: "Chapelure ou flocons d'avoine", quantity: 2, unit: "c. à soupe" },
            { item: "Poudre de curry", quantity: 1, unit: "c. à café" },
            { item: "Huile pour cuisson", quantity: 2, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les lentilles corail (15 min), bien les égoutter et les écraser en purée.",
            "Râper la carotte et hacher l'oignon. Les faire revenir 5 min.",
            "Mélanger la purée de lentilles, l'oignon/carotte, l’œuf, la chapelure et le curry. Assaisonner.",
            "Former 4 à 6 galettes. Les faire dorer 5 à 7 min de chaque côté dans une poêle huilée."
        ],
        nutrition: { calories: 350, proteins: 18, carbs: 50, fats: 8 },
        tags: ["plat principal", "végétarien", "légumineuses", "protéiné"]
    },
    {
        title: "Buddha Bowl Végétal et Quinoa",
        description: "Un bol repas complet, sain et équilibré, composé d'une base de céréales (quinoa), de légumes colorés, de légumineuses et d'une sauce.",
        servings: 1,
        prepTime: 20,
        cookTime: 15,
        ingredients: [
            { item: "Quinoa cuit", quantity: 100, unit: "g" },
            { item: "Pois chiches (cuits)", quantity: 50, unit: "g" },
            { item: "Avocat", quantity: 0.5, unit: "pièce" },
            { item: "Patate douce (rôtie)", quantity: 100, unit: "g" },
            { item: "Chou rouge ou épinards frais", quantity: 50, unit: "g" },
            { item: "Tomates cerises", quantity: 50, unit: "g" },
            { item: "Graines (courge, sésame)", quantity: 1, unit: "c. à café" },
            { item: "Sauce : Tahini, citron, huile d’olive, eau", quantity: 2, unit: "c. à soupe" }
        ],
        instructions: [
            "Préparer la base : cuire le quinoa, rôtir la patate douce (15 min à 200°C), égoutter les pois chiches.",
            "Préparer la sauce : mélanger tous les ingrédients (Tahini, citron, etc.) jusqu'à obtenir une consistance lisse.",
            "Assembler le bol : disposer le quinoa au fond, puis organiser les légumes, l'avocat et les pois chiches en sections bien séparées.",
            "Arroser de sauce Tahini et parsemer de graines."
        ],
        nutrition: { calories: 500, proteins: 20, carbs: 60, fats: 25 },
        tags: ["plat principal", "végétarien", "sain", "quinoa"]
    },
    {
        title: "Tacos Végétariens aux Haricots Noirs Épicés",
        description: "Tortillas garnies d'un mélange de haricots noirs, maïs et épices, garnies de légumes frais et d'une sauce avocat.",
        servings: 4,
        prepTime: 20,
        cookTime: 15,
        ingredients: [
            { item: "Tortillas de maïs ou blé", quantity: 8, unit: "pièces" },
            { item: "Haricots noirs (cuits)", quantity: 400, unit: "g" },
            { item: "Maïs (en conserve)", quantity: 100, unit: "g" },
            { item: "Oignon rouge", quantity: 0.5, unit: "pièce" },
            { item: "Épices Tex-Mex (cumin, paprika)", quantity: 1, unit: "c. à soupe" },
            { item: "Avocat (pour le guacamole)", quantity: 1, unit: "pièce" },
            { item: "Jus de citron vert", quantity: 1, unit: "c. à soupe" },
            { item: "Tomates, laitue, crème fraîche (garniture)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Hacher l'oignon et le faire revenir. Écraser légèrement les haricots noirs.",
            "Ajouter les haricots, le maïs et les épices. Cuire 5 min pour réchauffer et mélanger les saveurs.",
            "Préparer le guacamole : écraser l'avocat avec le jus de citron vert, sel et poivre.",
            "Réchauffer les tortillas à sec à la poêle.",
            "Garnir chaque tortilla du mélange de haricots chauds, puis des garnitures (tomates, laitue, guacamole, crème)."
        ],
        nutrition: { calories: 450, proteins: 15, carbs: 60, fats: 18 },
        tags: ["plat principal", "végétarien", "mexicain"]
    },

    {
        title: "Cuisson Pommes de Terre Fermes à la Vapeur Douce",
        description: "Technique de cuisson pour des pommes de terre qui conservent leur tenue et leurs nutriments (idéal pour salades ou accompagnements).",
        servings: 4,
        prepTime: 5,
        cookTime: 25,
        ingredients: [
            { item: "Pommes de terre (chair ferme : Charlotte, Belle de Fontenay, ...)", quantity: 600, unit: "g" },
            { item: "Eau", quantity: 1, unit: "quantité suffisante" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Laver et brosser les pommes de terre. Les laisser entières (ou couper en gros morceaux uniformes).",
            "Placer de l'eau dans le fond d'une marmite (sans que l'eau touche le panier vapeur).",
            "Disposer les pommes de terre dans le panier vapeur.",
            "Couvrir et cuire à feu moyen 20 à 30 minutes (selon la taille). Vérifier la cuisson avec la pointe d'un couteau."
        ],
        tags: ["technique", "accompagnement", "légumes", "sain"]
    },
    {
        title: "Cuisson Sole Meunière au Four (Rational)",
        description: "Méthode professionnelle pour obtenir une sole meunière parfaitement cuite et croustillante, sans friture excessive.",
        servings: 4,
        prepTime: 15,
        cookTime: 12,
        ingredients: [
            { item: "Soles entières", quantity: 4, unit: "pièces" },
            { item: "Farine", quantity: 60, unit: "g" },
            { item: "Beurre clarifié (ou huile/beurre)", quantity: 30, unit: "g" }
        ],
        instructions: [
            "Sécher et saler les soles. Les fariner légèrement et retirer l’excédent.",
            "Préchauffer le four Rational sur le programme Air Chaud ou Friture Légère (si disponible) à 200°C.",
            "Badigeonner les soles de beurre clarifié ou d'un mélange huile/beurre.",
            "Enfourner 10 à 12 min à 200°C. La sole est cuite lorsque la chair se détache de l'arête.",
            "Napper d'un beurre meunière frais (beurre noisette, citron, persil) après cuisson."
        ],
        tags: ["technique", "poisson", "professionnel", "rational"]
    },
    {
        title: "Cuisson Rôti de Dinde au Miel et Légumes (Rational)",
        description: "Méthode de rôtissage de la dinde au four professionnel (type Rational) pour une chair juteuse et un extérieur caramélisé.",
        servings: 6,
        prepTime: 15,
        cookTime: 70,
        ingredients: [
            { item: "Rôti de dinde", quantity: 1.2, unit: "kg" },
            { item: "Miel", quantity: 2, unit: "c. à soupe" },
            { item: "Moutarde", quantity: 1, unit: "c. à café" },
            { item: "Mélange de légumes racines (carottes, pommes de terre, etc.)", quantity: 500, unit: "g" },
            { item: "Huile, sel, poivre, thym", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Assaisonner le rôti. Le badigeonner du mélange miel/moutarde.",
            "Couper les légumes en dés, les assaisonner et les disposer sur une plaque.",
            "Placer le rôti sur les légumes (pour récupérer les sucs).",
            "Cuisson Rational : Utiliser la sonde à cœur à 72°C. Cuisson 'Air Chaud' à 160°C pendant 60 min, puis dorer à 190°C (ou selon programme automatique 'Rôti').",
            "Laisser reposer 10 min avant de trancher."
        ],
        tags: ["technique", "volaille", "professionnel", "rational"]
    },
    {
        title: "Carottes Glacées au Beurre et Sucre",
        description: "Méthode classique pour enrober les carottes d'une laque brillante et savoureuse.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Carottes (petites ou en bâtonnets)", quantity: 600, unit: "g" },
            { item: "Eau", quantity: 15, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Sucre (ou miel)", quantity: 1, unit: "c. à café" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mettre les carottes, l'eau, le beurre, le sucre et le sel dans une sauteuse.",
            "Couvrir et cuire à feu moyen jusqu'à ce que les carottes soient tendres (environ 10 min).",
            "Retirer le couvercle. Augmenter le feu pour faire évaporer l'eau. Les carottes vont se laquer dans le mélange beurre/sucre fondu. Remuer jusqu'à ce qu'elles soient brillantes."
        ],
        tags: ["accompagnement", "légumes", "classique"]
    },
    {
        title: "Crème d'Amande Maison",
        description: "Alternative végétale sans lactose, idéale pour les sauces ou les desserts.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Amandes entières blanchies", quantity: 100, unit: "g" },
            { item: "Eau", quantity: 10, unit: "cl" },
            { item: "Jus de citron", quantity: 0.5, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Faire tremper les amandes dans l'eau chaude pendant 30 min (ou 1 nuit à froid).",
            "Égoutter et placer les amandes dans un blender avec l'eau fraîche.",
            "Mixer à très haute puissance jusqu'à obtenir une texture parfaitement lisse et homogène (environ 2 min).",
            "Passer au chinois si nécessaire pour retirer les résidus, puis ajouter le jus de citron si la crème doit être utilisée dans une sauce salée."
        ],
        tags: ["sauce", "crème", "végétale", "sans lactose"]
    },
    {
        title: "Crème d'Avoine Maison",
        description: "Crème végétale douce, parfaite pour lier les soupes ou épaissir les sauces sans altérer le goût.",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Flocons d’avoine", quantity: 60, unit: "g" },
            { item: "Eau", quantity: 20, unit: "cl" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire bouillir l'eau. Ajouter les flocons d'avoine et une pincée de sel.",
            "Cuire 10 min à feu doux, en remuant de temps en temps.",
            "Mixer la préparation très finement. La crème doit être lisse et crémeuse.",
            "Si elle est trop épaisse, ajouter un peu d'eau ou de boisson végétale. Utiliser immédiatement ou conserver au frais."
        ],
        tags: ["sauce", "crème", "végétale", "sans lactose"]
    },
    {
        title: "Crème de Coco Maison (pour sauces salées)",
        description: "Crème de noix de coco épaisse, idéale pour les currys et plats asiatiques.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Noix de coco fraîche (chair)", quantity: 150, unit: "g" },
            { item: "Eau chaude", quantity: 15, unit: "cl" }
        ],
        instructions: [
            "Couper la chair de noix de coco en petits morceaux.",
            "Placer la chair de noix de coco et l'eau chaude dans un blender.",
            "Mixer à haute puissance jusqu'à obtenir un mélange laiteux et très fin.",
            "Filtrer le liquide à travers un tamis fin ou un torchon pour séparer la crème (partie liquide) des résidus. La crème obtenue est très riche."
        ],
        tags: ["sauce", "crème", "végétale", "sans lactose"]
    },
    {
        title: "Sauce Citron et Herbes (pour Volailles)",
        description: "Une sauce fraîche, légère et acidulée, parfaite pour napper les filets de dinde ou de poulet rôtis ou grillés.",
        servings: 4,
        prepTime: 5,
        cookTime: 5,
        ingredients: [
            { item: "Jus de citron frais", quantity: 5, unit: "cl" },
            { item: "Bouillon de volaille (chaud)", quantity: 10, unit: "cl" },
            { item: "Crème fraîche légère", quantity: 5, unit: "cl" },
            { item: "Herbes fraîches (ciboulette, persil)", quantity: 1, unit: "c. à soupe" },
            { item: "Maïzena (pour lier)", quantity: 0.5, unit: "c. à café", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire chauffer le bouillon et le jus de citron dans une petite casserole.",
            "Ajouter la Maïzena (si utilisée) diluée dans un peu d'eau froide pour lier. Laisser épaissir 1 min.",
            "Incorporer la crème fraîche hors du feu. Assaisonner.",
            "Ajouter les herbes fraîches juste avant de servir.",
        ],
        nutrition: { calories: 80, proteins: 2, carbs: 5, fats: 5 },
        tags: ["sauce", "volaille", "citronnée", "légère"]
    },
    {
        title: "Sauce Miel et Soja (pour Volailles et Wok)",
        description: "Une laque sucrée-salée et caramélisée, idéale pour accompagner la dinde ou pour une marinade de légumes sautés.",
        servings: 4,
        prepTime: 5,
        cookTime: 10,
        ingredients: [
            { item: "Miel liquide", quantity: 2, unit: "c. à soupe" },
            { item: "Sauce soja", quantity: 2, unit: "c. à soupe" },
            { item: "Gingembre frais râpé", quantity: 0.5, unit: "c. à café" },
            { item: "Gousse d'ail hachée", quantity: 1, unit: "pièce", optional: true },
            { item: "Vinaigre de cidre ou de riz", quantity: 1, unit: "c. à café" },
            { item: "Sésame (pour la décoration)", quantity: 1, unit: "pincée", optional: true }
        ],
        instructions: [
            "Mélanger le miel, la sauce soja, le gingembre, l'ail et le vinaigre dans une petite casserole.",
            "Porter à frémissement. Laisser réduire à feu doux 5 à 8 minutes, jusqu'à consistance légèrement sirupeuse.",
            "Utiliser pour badigeonner la viande en fin de cuisson ou la servir en accompagnement. Parsemer de sésame."
        ],
        nutrition: { calories: 120, proteins: 3, carbs: 25, fats: 1 },
        tags: ["sauce", "asiatique", "caramélisée", "marinade"]
    },
    {
        title: "Sauce Miel-Moutarde Crémeuse (pour Rôti)",
        description: "Une sauce douce et piquante, parfaite pour un rôti de dinde ou de poulet, qui combine la richesse du miel et le grain de la moutarde à l'ancienne.",
        servings: 4,
        prepTime: 5,
        cookTime: 5,
        ingredients: [
            { item: "Jus de cuisson de la dinde ou Bouillon de volaille", quantity: 10, unit: "cl" },
            { item: "Miel liquide", quantity: 1, unit: "c. à soupe" },
            { item: "Moutarde à l’ancienne", quantity: 1, unit: "c. à soupe" },
            { item: "Crème fraîche liquide (entière ou semi-épaisse)", quantity: 10, unit: "cl" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire chauffer le jus de cuisson ou le bouillon dans la poêle du rôti pour récupérer les sucs.",
            "Ajouter le miel et la moutarde. Bien mélanger.",
            "Ajouter la crème liquide et laisser mijoter 2-3 minutes. Assaisonner et servir.",
        ],
        nutrition: { calories: 150, proteins: 3, carbs: 10, fats: 12 },
        tags: ["sauce", "rôti", "crémeuse", "moutarde"]
    },
    {
        title: "Jus Corsé Miel et Herbes (pour Rôti)",
        description: "Jus de viande réduit et déglacé, parfumé au miel et aux herbes, idéal pour un nappage riche sans crème.",
        servings: 4,
        prepTime: 5,
        cookTime: 5,
        ingredients: [
            { item: "Jus de cuisson de la dinde ou Fond de veau", quantity: 15, unit: "cl" },
            { item: "Miel", quantity: 0.5, unit: "c. à café" },
            { item: "Vinaigre balsamique", quantity: 1, unit: "c. à café" },
            { item: "Herbes fraîches (thym, romarin)", quantity: 1, unit: "brin" },
            { item: "Beurre froid (pour monter le jus)", quantity: 5, unit: "g", optional: true }
        ],
        instructions: [
            "Faire chauffer le jus/fond de veau avec le miel et le vinaigre balsamique, laisser réduire légèrement.",
            "Ajouter les herbes et laisser infuser 1 minute.",
            "Hors du feu, ajouter le beurre froid en remuant (monter le jus) pour le lier et le faire briller.",
            "Retirer les herbes et servir aussitôt.",
        ],
        nutrition: { calories: 80, proteins: 5, carbs: 10, fats: 2 },
        tags: ["sauce", "jus", "rôti", "gastronomique"]
    },
    {
        title: "Sauce Citronnée et Beurre Mousseux (pour Raie)",
        description: "Sauce simple à base de beurre fondu et de citron, qui forme une mousse légère et aérienne, parfaite pour le poisson blanc.",
        servings: 4,
        prepTime: 2,
        cookTime: 5,
        ingredients: [
            { item: "Beurre", quantity: 50, unit: "g" },
            { item: "Jus de citron frais", quantity: 2, unit: "c. à soupe" },
            { item: "Eau", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire fondre le beurre dans une petite casserole. Retirer du feu dès qu'il est fondu.",
            "Ajouter le jus de citron et l'eau. Saler et poivrer.",
            "Battre la sauce très rapidement avec un mixeur plongeant ou un fouet pour faire monter une mousse légère.",
            "Napper le poisson immédiatement, avant que la mousse ne retombe."
        ],
        nutrition: { calories: 180, proteins: 1, carbs: 1, fats: 20 },
        tags: ["sauce", "poisson", "classique"]
    },
    {
        title: "Riz Pilaf Simple et Égrené",
        description: "Technique de cuisson qui permet d'obtenir un riz aux grains détachés, riche en goût grâce à l'oignon et au bouillon.",
        servings: 4,
        prepTime: 5,
        cookTime: 20,
        ingredients: [
            { item: "Riz à grains longs (Basmati ou Thaï)", quantity: 250, unit: "g" },
            { item: "Oignon ou échalote", quantity: 0.5, unit: "pièce" },
            { item: "Beurre ou huile d’olive", quantity: 1, unit: "c. à soupe" },
            { item: "Bouillon de volaille ou eau salée", quantity: 50, unit: "cl" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Rincer le riz. Faire suer l'oignon émincé dans le beurre/huile sans coloration.",
            "Ajouter le riz et le faire nacrer (cuire jusqu'à ce que les grains deviennent translucides) pendant 2 min.",
            "Ajouter le bouillon chaud. Porter à ébullition, couvrir et cuire 15 min à feu très doux.",
            "Éteindre le feu et laisser reposer 5 min sans soulever le couvercle. Égrener à la fourchette avant de servir."
        ],
        nutrition: { calories: 350, proteins: 8, carbs: 65, fats: 5 },
        tags: ["accompagnement", "riz", "classique"]
    },
    {
        title: "Haricots Verts à l'Anglaise (Cuisson Rational)",
        description: "Méthode de cuisson des haricots verts au four vapeur (Rational) pour un résultat croquant et une couleur intense (à l'anglaise).",
        servings: 4,
        prepTime: 10,
        cookTime: 10,
        ingredients: [
            { item: "Haricots verts (frais ou surgelés)", quantity: 600, unit: "g" },
            { item: "Sel fin", quantity: 1, unit: "pincée" },
            { item: "Beurre", quantity: 10, unit: "g", optional: true }
        ],
        instructions: [
            "Équeuter les haricots verts.",
            "Cuisson Rational : Placer les haricots dans une plaque perforée.",
            "Utiliser la fonction 'Vapeur' (100% humidité) à 100°C pendant 8 à 10 minutes (ou selon le degré de croquant souhaité).",
            "Refroidir immédiatement après cuisson si les haricots ne sont pas servis immédiatement. Assaisonner avec sel, poivre et beurre fondu avant de servir."
        ],
        tags: ["technique", "légumes", "sain", "rational"]
    },
    {
        title: "Cuisson Asperges Vertes à la Vapeur",
        description: "Méthode douce pour cuire les asperges de manière uniforme en conservant leur couleur et leur croquant.",
        servings: 4,
        prepTime: 5,
        cookTime: 10,
        ingredients: [
            { item: "Asperges vertes", quantity: 500, unit: "g" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" },
            { item: "Vinaigrette (facultatif)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Couper le talon des asperges. Les peler légèrement si besoin.",
            "Les placer dans un panier vapeur (ou au Rational en fonction 'Vapeur').",
            "Cuire 8 à 10 minutes. Elles doivent être tendres, mais encore légèrement croquantes.",
            "Servir chaud ou tiède avec un filet d'huile d'olive et de sel fin."
        ],
        tags: ["accompagnement", "légumes", "printemps", "sain"]
    },
    {
        title: "Pommes de Terre Entières Cuisson Rational",
        description: "Méthode de cuisson en four professionnel pour des pommes de terre entières à chair ferme, idéales pour les salades ou accompagnements froids.",
        servings: 4,
        prepTime: 5,
        cookTime: 30,
        ingredients: [
            { item: "Pommes de terre (petites ou moyennes, entières)", quantity: 800, unit: "g" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Laver et brosser les pommes de terre. Les laisser entières.",
            "Les placer dans une plaque perforée (idéalement).",
            "Cuisson Rational : Utiliser la fonction 'Vapeur' (100% humidité) à 100°C pendant 25 à 35 minutes (selon la taille des pommes de terre).",
            "Vérifier la cuisson avec la sonde. Assaisonner après cuisson."
        ],
        tags: ["technique", "légumes", "rational"]
    },
    {
        title: "Accompagnement Simple pour Poisson Meunière (Riz et Citron)",
        description: "Un riz simple, frais et acidulé, qui complète la richesse de la sole meunière ou de la raie au beurre.",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Riz blanc cuit", quantity: 500, unit: "g" },
            { item: "Jus de citron frais", quantity: 1, unit: "c. à soupe" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" },
            { item: "Beurre ou huile d'olive", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire chauffer le riz cuit avec le beurre ou l'huile d'olive.",
            "Ajouter le jus de citron et le persil haché. Mélanger délicatement.",
            "Assaisonner. Servir immédiatement.",
        ],
        nutrition: { calories: 250, proteins: 5, carbs: 45, fats: 5 },
        tags: ["accompagnement", "riz", "poisson"]
    },
    {
        title: "Crème Fraîche Épaisse (Faite Maison)",
        description: "Méthode pour obtenir une crème fraîche fermentée, plus épaisse et légèrement acidulée, à partir de crème liquide.",
        servings: 10,
        prepTime: 5,
        cookTime: 1,
        ingredients: [
            { item: "Crème liquide entière (30% MG minimum)", quantity: 50, unit: "cl" },
            { item: "Ferment (Babeurre, Kéfir, ou Yaourt nature)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Stériliser un bocal et son couvercle.",
            "Faire chauffer la crème liquide à 30-35°C (tiède au doigt).",
            "Ajouter le ferment (babeurre ou kéfir). Mélanger doucement.",
            "Fermer le bocal et laisser fermenter à température ambiante (20-25°C) pendant 12 à 24 heures (jusqu'à épaississement).",
            "Une fois prise, la placer au réfrigérateur où elle s'épaissira encore."
        ],
        tags: ["crème", "fermentation", "maison"]
    },
    {
        title: "Crème Liquide Végétale (Remplaçante)",
        description: "Méthode générale pour fabriquer une crème liquide végétale utilisable pour les sauces et la pâtisserie (ici à base de riz ou de soja).",
        servings: 4,
        prepTime: 5,
        cookTime: 5,
        ingredients: [
            { item: "Lait végétal (Riz ou Soja)", quantity: 20, unit: "cl" },
            { item: "Huile végétale neutre (Tournesol ou colza)", quantity: 2, unit: "c. à soupe" },
            { item: "Fécule de maïs (Maïzena)", quantity: 1, unit: "c. à café" }
        ],
        instructions: [
            "Dans une casserole, mélanger le lait végétal et la fécule de maïs (Maïzena).",
            "Chauffer doucement en remuant constamment jusqu'à ce que le mélange épaississe légèrement (ne doit pas bouillir fortement).",
            "Retirer du feu. Incorporer l'huile végétale en fouettant.",
            "Utiliser pour remplacer la crème liquide dans les recettes."
        ],
        tags: ["crème", "végétale", "sans lactose"]
    },
    {
        title: "Pâtes aux Légumes Grillés et Pesto de Roquette",
        description: "Un plat de pâtes estival et savoureux, combinant des légumes rôtis au four et un pesto frais et légèrement poivré.",
        servings: 4,
        prepTime: 20,
        cookTime: 20,
        ingredients: [
            { item: "Pâtes (type farfalle ou penne)", quantity: 400, unit: "g" },
            { item: "Légumes d'été (courgette, aubergine, poivron)", quantity: 500, unit: "g" },
            { item: "Huile d'olive", quantity: 5, unit: "c. à soupe" },
            { item: "Roquette", quantity: 50, unit: "g" },
            { item: "Pignons de pin", quantity: 30, unit: "g" },
            { item: "Parmesan râpé (pour le pesto)", quantity: 30, unit: "g" },
            { item: "Ail", quantity: 1, unit: "gousse" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Couper les légumes en dés, les mélanger avec 2 c. à soupe d'huile d'olive, sel et poivre. Les rôtir au four à 200°C pendant 20 min.",
            "Préparer le pesto : Mixer la roquette, les pignons, le parmesan, l'ail et le reste d'huile d'olive jusqu'à consistance lisse. Assaisonner.",
            "Cuire les pâtes. Les égoutter en gardant un peu d'eau de cuisson.",
            "Mélanger les pâtes chaudes avec les légumes rôtis, le pesto et un peu d'eau de cuisson pour lier.",
        ],
        nutrition: { calories: 550, proteins: 18, carbs: 60, fats: 25 },
        tags: ["plat principal", "pâtes", "végétarien", "estival"]
    },
    {
        title: "Rôti de Dinde au Miel et Légumes (Version Classique)",
        description: "Un rôti de dinde nappé d'une laque miel-moutarde, cuit lentement avec ses légumes pour une viande juteuse et parfumée.",
        servings: 6,
        prepTime: 15,
        cookTime: 90,
        ingredients: [
            { item: "Rôti de dinde ficelé", quantity: 1.2, unit: "kg" },
            { item: "Miel liquide", quantity: 2, unit: "c. à soupe" },
            { item: "Moutarde forte", quantity: 1, unit: "c. à café" },
            { item: "Huile d’olive", quantity: 2, unit: "c. à soupe" },
            { item: "Mélange de légumes racines (carottes, pommes de terre, oignons)", quantity: 500, unit: "g" },
            { item: "Thym, romarin", quantity: 2, unit: "brins" },
            { item: "Bouillon de volaille", quantity: 10, unit: "cl" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Assaisonner le rôti. Le badigeonner du mélange miel/moutarde/huile.",
            "Couper les légumes en gros morceaux et les disposer au fond d'un plat. Placer le rôti dessus.",
            "Verser le bouillon dans le plat. Couvrir le rôti de papier aluminium.",
            "Cuire 60 min à 180°C. Retirer l'aluminium et dorer 30 min (jusqu’à 72°C à cœur). Arroser de temps en temps.",
            "Laisser reposer 10 min sous aluminium avant de trancher."
        ],
        nutrition: { calories: 380, proteins: 35, carbs: 20, fats: 15 },
        tags: ["plat principal", "volaille", "rôti", "miel"]
    },
    {
        title: "Poulet Cuit en Sauce, Coloration au Four (Rational)",
        description: "Technique pour une cuisson de poulet en sauce qui assure à la fois le moelleux et une belle coloration sans dessécher la volaille.",
        servings: 4,
        prepTime: 15,
        cookTime: 45,
        ingredients: [
            { item: "Hauts de cuisse de poulet", quantity: 4, unit: "pièces" },
            { item: "Base de sauce (tomate, curry, ou vin blanc)", quantity: 20, unit: "cl" },
            { item: "Épices (paprika, curcuma, etc.)", quantity: 1, unit: "c. à café" },
            { item: "Oignon, ail", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Dorer la volaille : Saisir les morceaux de poulet dans une poêle pour une première coloration. Réserver.",
            "Préparer la sauce : Faire revenir l'oignon et l'ail, ajouter les épices et la base de sauce. Porter à ébullition.",
            "Cuisson Rational : Placer le poulet et la sauce dans une plaque non perforée. Utiliser la fonction 'Air Chaud + Vapeur' (Mode Combi) à 160°C.",
            "Cuire 30 à 35 min jusqu'à 82°C à cœur. Retirer le couvercle ou passer en mode 'Air Chaud' à 200°C les 5 dernières minutes pour intensifier la coloration de la peau/surface visible."
        ],
        nutrition: { calories: 420, proteins: 35, carbs: 10, fats: 25 },
        tags: ["technique", "volaille", "sauce", "rational"]
    },
    {
        title: "Risotto aux Champignons et Parmesan",
        description: "Un risotto crémeux et classique, à base de bouillon de légumes et de champignons de Paris, enrichi en fin de cuisson par du beurre et du parmesan.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Riz Arborio ou Carnaroli", quantity: 300, unit: "g" },
            { item: "Champignons de Paris", quantity: 200, unit: "g" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Bouillon de légumes (chaud)", quantity: 1, unit: "L" },
            { item: "Parmesan râpé", quantity: 50, unit: "g" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire suer l'oignon/échalote haché dans l'huile et 10g de beurre. Ajouter les champignons émincés et les faire dorer.",
            "Ajouter le riz et le faire nacrer (cuire jusqu'à ce qu'il devienne translucide) 2 min.",
            "Déglacer au vin blanc, laisser réduire. Ajouter une louche de bouillon chaud. Remuer jusqu'à absorption.",
            "Continuer d'ajouter le bouillon, louche par louche, en remuant doucement pendant 18-20 min jusqu'à ce que le riz soit cuit 'al dente'.",
            "Retirer du feu. Incorporer le reste du beurre et le parmesan râpé. Couvrir 2 min, puis servir.",
        ],
        nutrition: { calories: 500, proteins: 18, carbs: 65, fats: 20 },
        tags: ["plat principal", "végétarien", "italien", "risotto"]
    },
    {
        title: "Préparation Crème Fraîche Fermentée (Longue)",
        description: "Méthode pour obtenir une crème à l'ancienne, épaisse et très acide, utilisée dans la cuisine gastronomique (méthode alternative à la rapide).",
        servings: 10,
        prepTime: 5,
        cookTime: 48, // Temps de fermentation en heures
        ingredients: [
            { item: "Crème liquide entière (30% MG minimum)", quantity: 50, unit: "cl" },
            { item: "Ferment lactique (cultures spécifiques)", quantity: 1, unit: "dose" }
        ],
        instructions: [
            "Faire tiédir la crème à 30°C. Ajouter le ferment lactique ou une cuillère de yaourt nature.",
            "Mélanger doucement et verser dans un récipient hermétique.",
            "Laisser reposer à température ambiante (18-20°C) pendant 24 à 48 heures, jusqu'à ce que la crème ait la consistance souhaitée.",
            "Stocker au frais. La fermentation se stabilise au froid.",
        ],
        tags: ["crème", "fermentation", "maison", "traditionnel"]
    },
    {
        title: "Crème Liquide Végétale à base d'Avoine (Simplifiée)",
        description: "Méthode simplifiée pour une crème liquide d'avoine, idéale pour les soupes et les sauces légères.",
        servings: 4,
        prepTime: 2,
        cookTime: 0,
        ingredients: [
            { item: "Boisson d’avoine non sucrée", quantity: 20, unit: "cl" },
            { item: "Fécule de maïs (Maïzena)", quantity: 1, unit: "c. à café" }
        ],
        instructions: [
            "Mélanger la Maïzena avec un peu de boisson d'avoine froide pour créer une 'liaison'.",
            "Ajouter le reste de la boisson d'avoine dans une casserole et porter à frémissement.",
            "Ajouter la liaison Maïzena. Remuer jusqu'à l'épaississement souhaité. Utiliser immédiatement."
        ],
        tags: ["crème", "végétale", "sans lactose", "express"]
    },
    {
        title: "Crème d'Amande (pour cuisine)",
        description: "Boisson d'amande très concentrée, utilisable en remplacement de la crème fraîche dans les plats salés.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Purée d'amande complète ou blanche", quantity: 2, unit: "c. à soupe" },
            { item: "Eau chaude", quantity: 10, unit: "cl" },
            { item: "Pincée de sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mélanger la purée d'amande avec l'eau chaude à l'aide d'un fouet ou d'un mixeur.",
            "Ajouter une pincée de sel si la crème est destinée à un plat salé.",
            "La crème doit être homogène et légèrement épaisse. Utiliser immédiatement pour éviter la séparation."
        ],
        tags: ["crème", "végétale", "sans lactose", "express"]
    },
    {
        title: "Poulet Tandoori Doux, Cuit au Four",
        description: "Des morceaux de poulet marinés dans un mélange de yogourt et d'épices tandoori, cuits au four pour une tendreté et une saveur inégalées. Se marie très bien avec du riz Basmati.",
        servings: 4,
        prepTime: 20,
        cookTime: 25,
        ingredients: [
            { item: "Blanc de poulet (coupé en cubes)", quantity: 600, unit: "g" },
            { item: "Yogourt nature ou grec", quantity: 150, unit: "g" },
            { item: "Pâte Tandoori (douce)", quantity: 2, unit: "c. à soupe" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Gingembre frais râpé", quantity: 0.5, unit: "c. à café" },
            { item: "Ail haché", quantity: 1, unit: "gousse" },
            { item: "Huile végétale", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mélanger dans un bol le yogourt, la pâte Tandoori, le jus de citron, le gingembre, l'ail, l'huile, le sel et le poivre.",
            "Ajouter les cubes de poulet et s'assurer qu'ils sont bien enrobés. Laisser mariner au réfrigérateur pendant au moins 2 heures (idéalement une nuit).",
            "Préchauffer le four à 200°C.",
            "Enfiler les morceaux de poulet sur des brochettes ou les étaler sur une plaque recouverte de papier cuisson.",
            "Cuire au four pendant 20 à 25 minutes, en retournant à mi-cuisson, jusqu'à ce que le poulet soit doré et bien cuit à cœur.",
            "Servir chaud avec une sauce au yogourt et de la coriandre fraîche."
        ],
        nutrition: { calories: 350, proteins: 40, carbs: 8, fats: 15 },
        tags: ["plat principal", "volaille", "indien", "protéiné"]
    },
    {
        title: "Soupe Minestrone Complète et Réconfortante",
        description: "Soupe italienne copieuse, débordante de légumes de saison, de petites pâtes et de légumineuses, le tout mijoté dans un bouillon léger à la tomate.",
        servings: 6,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Courgette (en dés)", quantity: 1, unit: "pièce" },
            { item: "Carotte (en dés)", quantity: 1, unit: "pièce" },
            { item: "Branche de céleri (en dés)", quantity: 1, unit: "pièce" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Haricots rouges (cuits, en conserve)", quantity: 100, unit: "g" },
            { item: "Pâtes courtes (petits coudes, coquillettes)", quantity: 50, unit: "g" },
            { item: "Tomates concassées", quantity: 200, unit: "g" },
            { item: "Bouillon de légumes", quantity: 1.5, unit: "L" },
            { item: "Huile d'olive", quantity: 2, unit: "c. à soupe" },
            { item: "Basilic frais, Parmesan (pour servir)", quantity: 1, unit: "quantité suffisante", optional: true }
        ],
        instructions: [
            "Hacher l'oignon, le céleri et la carotte. Les faire suer dans l'huile d'olive pendant 5 minutes.",
            "Ajouter les dés de courgette, les tomates concassées et le bouillon de légumes.",
            "Porter à ébullition, puis laisser mijoter 20 minutes (la soupe doit rester claire, ne pas couvrir).",
            "Ajouter les haricots rouges et les petites pâtes. Cuire selon le temps indiqué pour les pâtes (généralement 8 à 10 min).",
            "Assaisonner, servir chaud avec un filet d'huile d'olive, du basilic et du parmesan râpé (si utilisé)."
        ],
        nutrition: { calories: 250, proteins: 12, carbs: 40, fats: 5 },
        tags: ["soupe", "plat complet", "végétarien", "italien"]
    },
    {
        title: "Tiramisu Classique aux Biscuits Cuillère",
        description: "Le dessert italien par excellence : couches de biscuits trempés dans du café, alternées avec une crème riche au mascarpone et saupoudrées de cacao.",
        servings: 6,
        prepTime: 25,
        cookTime: 0,
        ingredients: [
            { item: "Mascarpone", quantity: 500, unit: "g" },
            { item: "Œufs (séparés : jaunes et blancs)", quantity: 3, unit: "pièces" },
            { item: "Sucre en poudre", quantity: 100, unit: "g" },
            { item: "Biscuits cuillère (ou Savoiardi)", quantity: 24, unit: "pièces" },
            { item: "Café fort (refroidi)", quantity: 20, unit: "cl" },
            { item: "Amaretto ou Rhum", quantity: 2, unit: "c. à soupe", optional: true },
            { item: "Cacao amer en poudre", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Préparer la crème : Fouetter les jaunes d'œufs avec le sucre jusqu'à ce que le mélange blanchisse. Ajouter le mascarpone et mélanger jusqu'à obtenir une crème lisse.",
            "Monter les blancs en neige ferme. Les incorporer délicatement au mélange mascarpone.",
            "Mélanger le café refroidi et l'Amaretto (si utilisé).",
            "Assemblage : Tremper rapidement un côté des biscuits dans le café et disposer une première couche au fond d'un plat.",
            "Étaler la moitié de la crème au mascarpone sur les biscuits. Répéter l'opération (une couche de biscuits, le reste de la crème).",
            "Saupoudrer généreusement de cacao amer. Mettre au réfrigérateur pendant au moins 6 heures avant de servir."
        ],
        nutrition: { calories: 450, proteins: 10, carbs: 40, fats: 30 },
        tags: ["dessert", "italien", "café", "sans cuisson"]
    },
    {
        title: "Vinaigrette Émulsionnée Classique et Stable",
        description: "La vinaigrette française de base, bien émulsionnée, qui tient en place sur la salade et ne se sépare pas facilement.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Huile (Olive, Colza ou Noix)", quantity: 3, unit: "c. à soupe" },
            { item: "Vinaigre (Vin, Cidre ou Balsamique)", quantity: 1, unit: "c. à soupe" },
            { item: "Moutarde forte ou à l'ancienne", quantity: 0.5, unit: "c. à café" },
            { item: "Sel fin", quantity: 1, unit: "pincée" },
            { item: "Poivre noir", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Dans un petit bol ou un pot hermétique, mélanger la moutarde, le sel et le poivre.",
            "Ajouter le vinaigre. Bien mélanger pour dissoudre le sel.",
            "Ajouter l'huile très progressivement (filet par filet) tout en fouettant énergiquement (ou en secouant le pot).",
            "Continuer de fouetter jusqu'à obtenir une émulsion stable et homogène (texture légèrement épaisse).",
            "Servir aussitôt ou conserver au frais (si elle se sépare, la fouetter à nouveau)."
        ],
        nutrition: { calories: 150, proteins: 0, carbs: 2, fats: 16 },
        tags: ["sauce", "vinaigrette", "classique", "assaisonnement"]
    },
    {
        title: "Gâteau aux Pommes Léger à la Cannelle",
        description: "Un gâteau moelleux et simple, avec de gros morceaux de pommes fondantes et un parfum de cannelle réconfortant.",
        servings: 8,
        prepTime: 20,
        cookTime: 45,
        ingredients: [
            { item: "Farine de blé", quantity: 250, unit: "g" },
            { item: "Sucre en poudre", quantity: 150, unit: "g" },
            { item: "Œufs", quantity: 3, unit: "pièces" },
            { item: "Beurre fondu", quantity: 80, unit: "g" },
            { item: "Lait", quantity: 10, unit: "cl" },
            { item: "Levure chimique", quantity: 1, unit: "sachet" },
            { item: "Pommes (pelées et coupées en gros dés)", quantity: 3, unit: "grosses" },
            { item: "Cannelle en poudre", quantity: 1, unit: "c. à café" },
            { item: "Sucre vanillé", quantity: 1, unit: "sachet", optional: true }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Beurrer et fariner un moule à manqué (environ 24 cm).",
            "Fouetter les œufs avec le sucre et le sucre vanillé jusqu'à ce que le mélange blanchisse.",
            "Ajouter le beurre fondu et le lait. Mélanger.",
            "Incorporer la farine et la levure tamisées, jusqu'à obtenir une pâte homogène.",
            "Ajouter les dés de pommes et la cannelle à la pâte, mélanger doucement.",
            "Verser la pâte dans le moule. Enfourner pour 40 à 45 minutes (vérifier la cuisson avec la pointe d'un couteau).",
            "Laisser refroidir 15 minutes avant de démouler."
        ],
        nutrition: { calories: 280, proteins: 5, carbs: 45, fats: 10 },
        tags: ["dessert", "goûter", "fruit", "pâtisserie"]
    },
    // PLATS BELGES
    {
        title: "Carbonnades Flamandes à la Bière Brune",
        description: "Un ragoût de bœuf mijoté longuement dans de la bière brune, souvent accompagné de pain d'épice et de moutarde, un classique belge.",
        servings: 6,
        prepTime: 30,
        cookTime: 150,
        ingredients: [
            { item: "Bœuf (joue ou paleron)", quantity: 1.2, unit: "kg" },
            { item: "Bière brune belge (type Chimay ou Leffe)", quantity: 75, unit: "cl" },
            { item: "Oignons", quantity: 3, unit: "pièces" },
            { item: "Pain d'épice", quantity: 2, unit: "tranches" },
            { item: "Moutarde forte", quantity: 1, unit: "c. à soupe" },
            { item: "Beurre ou graisse de bœuf", quantity: 30, unit: "g" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Thym, laurier", quantity: 1, unit: "branche" },
            { item: "Cassonade ou sucre brun", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Couper la viande en cubes. Assaisonner et fariner légèrement.",
            "Faire dorer la viande dans le beurre, retirer et réserver. Faire dorer les oignons émincés dans la même cocotte.",
            "Replacer la viande. Déglacer à la bière. Ajouter le bouquet garni et la cassonade.",
            "Tartiner le pain d'épice de moutarde et le déposer sur le ragoût (cela épaissira la sauce).",
            "Couvrir et laisser mijoter à feu très doux 2h30 à 3h. Servir avec des frites ou des pommes de terre vapeur."
        ],
        nutrition: { calories: 550, proteins: 40, carbs: 30, fats: 30 },
        tags: ["plat principal", "belge", "viande", "mijote"]
    },
    {
        title: "Moules Frites à la Marinière",
        description: "Le plat emblématique de la Belgique : moules cuites au vin blanc et légumes, servies avec des frites dorées.",
        servings: 4,
        prepTime: 20,
        cookTime: 10,
        ingredients: [
            { item: "Moules de bouchot", quantity: 3, unit: "kg" },
            { item: "Vin blanc sec", quantity: 20, unit: "cl" },
            { item: "Oignons ou échalotes (émincés)", quantity: 2, unit: "pièces" },
            { item: "Céleri (haché)", quantity: 1, unit: "branche" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" },
            { item: "Frites belges (à préparer séparément)", quantity: 1, unit: "kg" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Brosser et nettoyer les moules. Jeter celles qui sont ouvertes et ne se referment pas.",
            "Dans une grande marmite, faire fondre le beurre et faire suer les oignons/échalotes et le céleri.",
            "Ajouter les moules et le vin blanc. Couvrir hermétiquement et cuire 5 à 7 min à feu vif.",
            "Secouer la marmite à mi-cuisson. Les moules sont prêtes quand elles sont toutes ouvertes.",
            "Parsemer de persil. Servir aussitôt avec les frites et de la mayonnaise."
        ],
        nutrition: { calories: 500, proteins: 35, carbs: 40, fats: 20 },
        tags: ["plat principal", "belge", "poisson", "fruits de mer"]
    },
    {
        title: "Waterzooi de Poulet à la Gantoise",
        description: "Soupe-repas crémeuse et réconfortante à base de poulet, de légumes (carottes, poireaux, céleri) et de crème fraîche.",
        servings: 4,
        prepTime: 20,
        cookTime: 45,
        ingredients: [
            { item: "Filets de poulet ou morceaux (avec os)", quantity: 600, unit: "g" },
            { item: "Bouillon de volaille", quantity: 1, unit: "L" },
            { item: "Poireaux (rondelles)", quantity: 2, unit: "pièces" },
            { item: "Carottes (rondelles)", quantity: 3, unit: "pièces" },
            { item: "Céleri-rave ou branches (dés)", quantity: 100, unit: "g" },
            { item: "Jaunes d'œufs", quantity: 2, unit: "pièces" },
            { item: "Crème fraîche liquide", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire suer les légumes (poireaux, carottes, céleri) dans le beurre.",
            "Ajouter le poulet et le bouillon. Laisser mijoter 30 minutes. Retirer le poulet et l'effilocher.",
            "Dans un bol, mélanger les jaunes d'œufs et la crème. Retirer la soupe du feu.",
            "Verser une louche de bouillon sur le mélange crème/jaune, puis reverser le tout dans la marmite en remuant constamment pour lier la sauce (sans faire bouillir).",
            "Ajouter le poulet effiloché. Servir aussitôt avec du pain grillé."
        ],
        nutrition: { calories: 450, proteins: 35, carbs: 20, fats: 25 },
        tags: ["plat principal", "soupe", "belge", "crémeux"]
    },
    {
        title: "Chicon Gratiné (Gratin d'Endives au Jambon)",
        description: "Endives braisées et enroulées dans une tranche de jambon, recouvertes de béchamel et de fromage, puis gratinées.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Chicons (Endives)", quantity: 8, unit: "pièces" },
            { item: "Tranches de jambon cuit", quantity: 8, unit: "pièces" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Farine", quantity: 30, unit: "g" },
            { item: "Lait", quantity: 50, unit: "cl" },
            { item: "Gruyère ou Emmental râpé", quantity: 100, unit: "g" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Braiser les chicons : Cuire les endives à l'eau bouillante salée 15 min ou à la vapeur 20 min. Bien les égoutter.",
            "Préparer la béchamel : Faire fondre le beurre, ajouter la farine, cuire 1 min. Verser le lait petit à petit en fouettant jusqu'à épaississement. Assaisonner de sel, poivre et muscade.",
            "Préchauffer le four à 200°C. Enrouler chaque endive dans une tranche de jambon.",
            "Les disposer dans un plat à gratin. Napper de béchamel et recouvrir de fromage râpé. Gratiné 15 min."
        ],
        nutrition: { calories: 480, proteins: 25, carbs: 30, fats: 28 },
        tags: ["plat principal", "belge", "gratin", "légumes"]
    },
    {
        title: "Vol-au-vent aux Boulettes et Champignons",
        description: "Grandes bouchées de pâte feuilletée garnies d'une sauce blanche crémeuse avec boulettes de viande et champignons.",
        servings: 4,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Croûtes de vol-au-vent (feuilletées)", quantity: 4, unit: "pièces" },
            { item: "Champignons de Paris", quantity: 300, unit: "g" },
            { item: "Boulettes de veau ou de poulet", quantity: 20, unit: "petites" },
            { item: "Bouillon de volaille", quantity: 30, unit: "cl" },
            { item: "Crème fraîche épaisse", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Farine", quantity: 30, unit: "g" },
            { item: "Jus de citron", quantity: 1, unit: "c. à café" },
            { item: "Persil, sel, poivre", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire les boulettes dans le bouillon. Réserver le bouillon de cuisson. Cuire les croûtes de vol-au-vent au four selon les instructions.",
            "Préparer la sauce : Faire fondre le beurre, ajouter la farine, cuire 1 min. Verser le bouillon réservé petit à petit en fouettant.",
            "Ajouter les champignons préalablement dorés à la poêle. Laisser mijoter 5 min.",
            "Incorporer la crème, les boulettes et le jus de citron. Assaisonner.",
            "Garnir les croûtes de vol-au-vent de sauce et servir aussitôt."
        ],
        nutrition: { calories: 600, proteins: 30, carbs: 40, fats: 35 },
        tags: ["plat principal", "belge", "classique"]
    },
    {
        title: "Tarte au Riz Belge (Flamiche au riz)",
        description: "Dessert typique à base d'une croûte de pâte levée, garnie d'une crème pâtissière au riz et cuite au four.",
        servings: 8,
        prepTime: 40,
        cookTime: 45,
        ingredients: [
            { item: "Pâte levée ou pâte brisée", quantity: 1, unit: "rouleau" },
            { item: "Riz rond", quantity: 100, unit: "g" },
            { item: "Lait entier", quantity: 75, unit: "cl" },
            { item: "Sucre", quantity: 100, unit: "g" },
            { item: "Œufs (pour la crème)", quantity: 2, unit: "pièces" },
            { item: "Sucre vanillé", quantity: 1, unit: "sachet" },
            { item: "Cannelle (pour saupoudrer)", quantity: 1, unit: "pincée", optional: true }
        ],
        instructions: [
            "Cuire le riz dans le lait avec le sucre et le sucre vanillé, jusqu'à absorption complète et consistance crémeuse (environ 30 min). Laisser tiédir.",
            "Incorporer les œufs un par un au riz tiède.",
            "Foncer un moule à tarte avec la pâte. Verser la garniture au riz.",
            "Enfourner à 180°C pendant 40 à 45 minutes, jusqu'à ce que la garniture soit dorée et ferme.",
            "Servir tiède ou froid, saupoudré de cannelle."
        ],
        nutrition: { calories: 350, proteins: 8, carbs: 55, fats: 12 },
        tags: ["dessert", "belge", "pâtisserie"]
    },
    // Plats et Sauces complémentaires belges
    {
        title: "Fricadelle/Boulet Sauce Liégeoise",
        description: "Boulettes de viande belges, souvent composées de porc et de bœuf, braisées dans une sauce aigre-douce à base de sirop de Liège et de vinaigre.",
        servings: 4,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Viande hachée (bœuf/porc)", quantity: 500, unit: "g" },
            { item: "Oignons hachés", quantity: 2, unit: "pièces" },
            { item: "Sirop de Liège (ou de pomme/poire)", quantity: 2, unit: "c. à soupe" },
            { item: "Vinaigre de cidre", quantity: 1, unit: "c. à soupe" },
            { item: "Bière brune", quantity: 10, unit: "cl" },
            { item: "Pain d'épice (émietté)", quantity: 1, unit: "tranche" },
            { item: "Bouillon de bœuf", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Former 8 à 10 boulettes avec la viande hachée, sel et poivre. Les faire dorer dans le beurre.",
            "Retirer les boulettes, faire suer les oignons. Déglacer à la bière et au vinaigre.",
            "Ajouter le bouillon, le sirop de Liège et le pain d'épice. Laisser mijoter jusqu'à ce que la sauce épaississe.",
            "Remettre les boulettes et laisser mijoter 20 min. Servir avec des frites."
        ],
        nutrition: { calories: 580, proteins: 35, carbs: 35, fats: 30 },
        tags: ["plat principal", "belge", "viande", "sauce"]
    },
    {
        title: "Croquettes de Crevettes Grises Belges",
        description: "Croquettes frites croustillantes, garnies d'une béchamel très crémeuse enrichie de petites crevettes grises de la Mer du Nord.",
        servings: 4,
        prepTime: 60, // 30 min de préparation + 30 min de refroidissement
        cookTime: 10,
        ingredients: [
            { item: "Crevettes grises décortiquées", quantity: 200, unit: "g" },
            { item: "Beurre", quantity: 50, unit: "g" },
            { item: "Farine", quantity: 50, unit: "g" },
            { item: "Lait", quantity: 30, unit: "cl" },
            { item: "Jaunes d'œufs", quantity: 2, unit: "pièces" },
            { item: "Chapelure, farine, œufs (pour panure)", quantity: 1, unit: "quantité suffisante" },
            { item: "Muscade, Sel, poivre de Cayenne", quantity: 1, unit: "pincée" },
            { item: "Huile pour friture", quantity: 1, unit: "L" }
        ],
        instructions: [
            "Préparer une béchamel très épaisse : beurre, farine, lait. Retirer du feu, ajouter les jaunes d'œufs, les crevettes et les épices. Mélanger bien. Laisser refroidir complètement.",
            "Former des cylindres ou des boules avec la farce refroidie.",
            "Paner à l'anglaise (farine > œuf battu > chapelure). Répéter la panure (double panure) pour plus de croustillant.",
            "Frire 4-5 min à 170°C jusqu'à belle coloration dorée. Servir chaud avec du persil frit et du citron."
        ],
        nutrition: { calories: 450, proteins: 20, carbs: 30, fats: 25 },
        tags: ["entrée", "belge", "friture", "fruits de mer"]
    },
    // 8 autres plats/méthodes belges...
    {
        title: "Purée de Pommes de Terre et Céleri-Rave",
        description: "Purée belge, souvent servie avec le Stoemp, mêlant la douceur de la pomme de terre au parfum subtil du céleri-rave.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre", quantity: 600, unit: "g" },
            { item: "Céleri-rave", quantity: 300, unit: "g" },
            { item: "Lait chaud", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Éplucher et couper les légumes. Cuire ensemble à l'eau salée ou à la vapeur 20 min.",
            "Égoutter et écraser au presse-purée. Ajouter le lait chaud et le beurre.",
            "Assaisonner de sel, poivre et muscade. Fouetter pour aérer."
        ],
        tags: ["accompagnement", "belge", "légumes"]
    },
    {
        title: "Salade liégeoise (Haricots Verts, Pommes de Terre, Lardons)",
        description: "Salade tiède belge, riche et complète, arrosée d'une vinaigrette chaude à base de vinaigre et de graisse de lardons.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre (chair ferme)", quantity: 500, unit: "g" },
            { item: "Haricots verts frais", quantity: 300, unit: "g" },
            { item: "Lardons fumés", quantity: 150, unit: "g" },
            { item: "Vinaigre de vin rouge", quantity: 2, unit: "c. à soupe" },
            { item: "Oignon rouge (émincé)", quantity: 1, unit: "petit" },
            { item: "Huile d'olive", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre en robe des champs, les peler et les couper en rondelles.",
            "Cuire les haricots verts à l'anglaise (croquants).",
            "Faire dorer les lardons à la poêle. Retirer les lardons, garder la graisse de cuisson.",
            "Chauffer la graisse (ou l'huile), ajouter l'oignon et le vinaigre. Réchauffer les pommes de terre et haricots dans la poêle.",
            "Mélanger tous les ingrédients (y compris les lardons) et servir tiède."
        ],
        tags: ["entrée", "plat complet", "belge", "tiède"]
    },
    {
        title: "Tarte au Sucre Belge (Bande de Doudou)",
        description: "Pâtisserie simple à pâte levée et garniture crémeuse au sucre brun (cassonade).",
        servings: 8,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Pâte levée (type pâte à brioche)", quantity: 300, unit: "g" },
            { item: "Cassonade brune", quantity: 150, unit: "g" },
            { item: "Crème fraîche épaisse", quantity: 10, unit: "cl" },
            { item: "Beurre (en petits morceaux)", quantity: 50, unit: "g" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Étaler la pâte et la foncer dans un moule rond.",
            "Piquer le fond de pâte. Répartir la cassonade sur toute la surface.",
            "Disposer les petits morceaux de beurre et napper légèrement de crème fraîche.",
            "Enfourner 25 à 30 minutes jusqu'à ce que la croûte soit dorée et la garniture caramélisée."
        ],
        tags: ["dessert", "belge", "pâtisserie"]
    },
    {
        title: "Filet Américain (Tartare de boeuf simple)",
        description: "Version pure et assaisonnée du tartare de boeuf belge, sans les condiments complexes de l'Américain Préparé.",
        servings: 2,
        prepTime: 10,
        cookTime: 0,
        ingredients: [
            { item: "Viande de bœuf hachée (ultra-fraîche)", quantity: 250, unit: "g" },
            { item: "Oignon rouge (finement haché)", quantity: 0.5, unit: "pièce" },
            { item: "Jaune d'œuf", quantity: 1, unit: "pièce" },
            { item: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" },
            { item: "Sel, poivre noir moulu", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mélanger délicatement la viande hachée, l'oignon, le persil, l'huile, le sel et le poivre.",
            "Former un dôme. Creuser un puits au centre et y déposer le jaune d'œuf.",
            "Servir très frais, souvent avec des frites et de la mayonnaise."
        ],
        tags: ["plat principal", "belge", "viande", "cru"]
    },
    {
        title: "Boudin Blanc de Liège aux Pommes",
        description: "Boudin blanc grillé ou poêlé, servi avec une compote de pommes ou des quartiers de pommes cuits au beurre, sucré/salé.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Boudin blanc de Liège (ou de volaille)", quantity: 4, unit: "pièces" },
            { item: "Pommes (type Gala ou Golden)", quantity: 4, unit: "pièces" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Cassonade ou sucre", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Piquer légèrement le boudin. Le poêler au beurre 10-12 min à feu moyen, en le retournant souvent.",
            "Couper les pommes en quartiers. Les poêler séparément dans le reste du beurre, jusqu'à tendreté (5-7 min). Saupoudrer de cassonade si désiré.",
            "Servir le boudin chaud avec les quartiers de pommes fondantes."
        ],
        tags: ["plat principal", "belge", "sucré-salé"]
    },
    {
        title: "Gaufres de Liège (Gaufres au Sucre)",
        description: "Gaufres riches, faites d'une pâte levée et contenant des pépites de sucre perlé qui caramélisent à la cuisson.",
        servings: 8,
        prepTime: 90, // 60 min de levée
        cookTime: 5,
        ingredients: [
            { item: "Farine", quantity: 500, unit: "g" },
            { item: "Beurre mou", quantity: 200, unit: "g" },
            { item: "Lait tiède", quantity: 10, unit: "cl" },
            { item: "Levure de boulanger fraîche", quantity: 20, unit: "g" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Sucre perlé (gros grains)", quantity: 250, unit: "g" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Délayer la levure dans le lait tiède. Mélanger le reste des ingrédients (sauf le sucre perlé) pour former une pâte à brioche.",
            "Laisser lever la pâte 1h à température ambiante.",
            "Incorporer le sucre perlé à la main, sans pétrir excessivement.",
            "Faire cuire des portions de pâte dans un gaufrier chaud, jusqu'à ce que le sucre soit caramélisé (3-5 min)."
        ],
        tags: ["dessert", "belge", "pâtisserie"]
    },
    {
        title: "Filet Mignon de Porc Sauce Archiduc",
        description: "Filet de porc poêlé ou rôti, servi avec une sauce classique belgo-française à base de champignons, crème et vin blanc (ou Madère).",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Filet mignon de porc", quantity: 600, unit: "g" },
            { item: "Champignons de Paris", quantity: 200, unit: "g" },
            { item: "Crème fraîche épaisse", quantity: 15, unit: "cl" },
            { item: "Vin blanc sec ou Madère", quantity: 10, unit: "cl" },
            { item: "Échalotes", quantity: 2, unit: "pièces" },
            { item: "Bouillon de volaille", quantity: 5, unit: "cl" },
            { item: "Beurre ou huile", quantity: 20, unit: "g" },
            { item: "Sel, poivre, Persil", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Couper le filet mignon en médaillons. Les dorer dans le beurre ou l'huile 3-4 min par face. Réserver au chaud.",
            "Faire suer les échalotes et les champignons émincés. Déglacer au vin blanc, laisser réduire de moitié.",
            "Ajouter le bouillon et la crème. Laisser mijoter jusqu'à épaississement (5 min).",
            "Remettre la viande et réchauffer. Assaisonner et parsemer de persil."
        ],
        tags: ["plat principal", "belge", "sauce"]
    },
    {
        title: "Frites Belges 'Cuisson Double'",
        description: "Technique de friture traditionnelle belge pour obtenir des frites dorées à l'extérieur et moelleuses à l'intérieur.",
        servings: 4,
        prepTime: 15,
        cookTime: 15,
        ingredients: [
            { item: "Pommes de terre (type Bintje ou Agria)", quantity: 1, unit: "kg" },
            { item: "Graisse de bœuf (blanc de bœuf) ou huile de friture", quantity: 1, unit: "L" },
            { item: "Sel fin", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Couper les pommes de terre en frites de 1 cm d'épaisseur. Les rincer et bien les sécher.",
            "Première cuisson (Cuisson de pré-friture) : Plonger les frites dans la graisse chauffée à 130-140°C pendant 6 à 8 minutes. Elles ne doivent pas colorer. Retirer et laisser refroidir au moins 15 min.",
            "Deuxième cuisson (Cuisson de coloration) : Augmenter la température à 175-180°C. Plonger les frites pour 2 à 4 minutes, jusqu'à ce qu'elles soient bien dorées et croustillantes.",
            "Égoutter sur du papier absorbant. Saler immédiatement."
        ],
        tags: ["technique", "accompagnement", "belge", "friture"]
    },
    {
        title: "Potée aux Choux et Lardons (Stoemp Épaissi)",
        description: "Potée épaisse et consistante, à base de pommes de terre, de choux (vert ou de Milan) et de lardons.",
        servings: 4,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Pommes de terre", quantity: 600, unit: "g" },
            { item: "Chou vert ou frisé", quantity: 400, unit: "g" },
            { item: "Lardons fumés", quantity: 150, unit: "g" },
            { item: "Oignon", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre. Couper le chou en lanières et le blanchir 5 min.",
            "Faire dorer les lardons, les retirer, garder la graisse. Faire suer l'oignon dans cette graisse.",
            "Ajouter le chou blanchi et le bouillon. Laisser mijoter 15 min.",
            "Égoutter les pommes de terre, les écraser et les mélanger au chou. Servir chaud avec les lardons dorés."
        ],
        tags: ["plat principal", "belge", "légumes", "mijote"]
    },
    {
        title: "Compote de Pommes Maison (pour Boudin/Viande)",
        description: "Compote de pommes simple, souvent utilisée en Belgique pour accompagner les plats salés comme le boudin.",
        servings: 4,
        prepTime: 5,
        cookTime: 20,
        ingredients: [
            { item: "Pommes à cuire (type Boskoop)", quantity: 1, unit: "kg" },
            { item: "Eau", quantity: 5, unit: "cl" },
            { item: "Sucre (selon l'acidité des pommes)", quantity: 2, unit: "c. à soupe", optional: true }
        ],
        instructions: [
            "Peler, évider et couper les pommes en morceaux.",
            "Mettre les morceaux de pommes, l'eau et le sucre (si utilisé) dans une casserole.",
            "Couvrir et cuire à feu doux 15 à 20 minutes, jusqu'à ce que les pommes soient bien tendres.",
            "Écraser à la fourchette ou passer au presse-purée (pas au blender pour éviter une texture trop élastique)."
        ],
        tags: ["accompagnement", "belge", "fruit"]
    },
    {
        title: "Sauce Andalouse Belge (Mayonnaise Piquante)",
        description: "Sauce typique des friteries belges : une base de mayonnaise relevée par de la purée de tomates et des épices.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Mayonnaise", quantity: 150, unit: "g" },
            { item: "Concentré de tomate (ou purée de tomate réduite)", quantity: 2, unit: "c. à soupe" },
            { item: "Jus de citron", quantity: 1, unit: "c. à café" },
            { item: "Poivron rouge (finement haché)", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Piment d'Espelette ou paprika fort", quantity: 0.5, unit: "c. à café" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mélanger la mayonnaise et le concentré de tomate (ou purée).",
            "Ajouter le jus de citron, le poivron haché et le piment ou paprika fort.",
            "Assaisonner. Laisser reposer 30 min au frais pour que les saveurs se développent."
        ],
        tags: ["sauce", "belge", "friterie"]
    },
    {
        title: "Gâteau au Yaourt aux Pommes",
        description: "Gâteau moelleux et simple à base de yaourt, avec des morceaux de pommes pour une touche fruitée.",
        servings: 8,
        prepTime: 15,
        cookTime: 40,
        ingredients: [
            { item: "Yaourt nature (1 pot = 125g)", quantity: 1, unit: "pot" },
            { item: "Farine", quantity: 250, unit: "g" },
            { item: "Sucre", quantity: 150, unit: "g" },
            { item: "Œufs", quantity: 3, unit: "pièces" },
            { item: "Huile végétale (tournesol ou colza)", quantity: 100, unit: "ml" },
            { item: "Pommes (type Golden ou Gala)", quantity: 2, unit: "pièces" },
            { item: "Levure chimique", quantity: 1, unit: "sachet" },
            { item: "Cannelle (pour saupoudrer)", quantity: 1, unit: "pincée", optional: true }
        ],   instructions: [
            "Préchauffer le four à 180°C. Éplucher et couper les pommes en petits dés.",
            "Dans un grand bol, mélanger le yaourt, le sucre et les œufs jusqu'à obtenir un mélange homogène.",
            "Incorporer la farine et la levure, puis l'huile. Ajouter les dés de pommes et mélanger délicatement.",
            "Verser la pâte dans un moule beurré et fariné. Saupoudrer de cannelle si désiré.",
            "Enfourner 35 à 40 minutes, jusqu'à ce qu'un cure-dent inséré au centre en ressorte propre."
        ],        nutrition: { calories: 320, proteins: 6, carbs: 50, fats: 10 },
        tags: ["dessert", "belge", "pâtisserie", "fruit"]
    },
    // FRITERIE & LÉGUMES BELGES
    {
        title: "Mitraillette Classique (Friterie)",
        description: "Sandwich de friterie belge, composé d'une demi-baguette garnie de frites, d'une viande (saucisse, boulette, ou fricadelle) et de sauce au choix (andalouse, mayonnaise, etc.).",
        servings: 1,
        prepTime: 10,
        cookTime: 10,
        ingredients: [
            { item: "Demi-baguette", quantity: 1, unit: "pièce" },
            { item: "Frites belges (préalablement cuites)", quantity: 200, unit: "g" },
            { item: "Viande de friterie (fricadelle, boulette, ou burger)", quantity: 1, unit: "pièce" },
            { item: "Salade et tomate (facultatif)", quantity: 1, unit: "quantité suffisante" },
            { item: "Sauce au choix (Andalouse, Samouraï, Mayo)", quantity: 3, unit: "c. à soupe" }
        ],
        instructions: [
            "Ouvrir la demi-baguette en deux dans le sens de la longueur.",
            "Cuire la viande de friterie (fricadelle) selon la méthode (friture ou four).",
            "Garnir le pain avec la salade et la tomate (si utilisé).",
            "Déposer la viande cuite, puis couvrir généreusement de frites chaudes.",
            "Napper de sauce. Servir immédiatement, souvent enveloppé dans du papier pour frites."
        ],
        nutrition: { calories: 800, proteins: 30, carbs: 80, fats: 40 },
        tags: ["plat principal", "belge", "sandwich", "friterie"]
    },
    {
        title: "Boudin Blanc de Liège aux Pommes (Poêlé)",
        description: "Boudin blanc parfumé aux fines herbes, servi avec des quartiers de pommes fondants et caramélisés.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Boudin blanc de Liège (ou nature)", quantity: 4, unit: "pièces" },
            { item: "Pommes (type Gala ou Golden)", quantity: 3, unit: "pièces" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Cassonade ou sucre", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Piquer légèrement le boudin. Le poêler au beurre 10-12 min à feu moyen, en le retournant souvent.",
            "Couper les pommes en quartiers. Les poêler séparément dans le reste du beurre, jusqu'à tendreté (5-7 min). Saupoudrer de cassonade si désiré.",
            "Servir le boudin chaud avec les quartiers de pommes fondantes."
        ],
        nutrition: { calories: 500, proteins: 20, carbs: 30, fats: 30 },
        tags: ["plat principal", "belge", "sucré-salé"]
    },
    {
        title: "Stoemp au Chou-fleur (Stoemp de chou-fleur)",
        description: "Purée belge à base de pommes de terre mélangées à du chou-fleur cuit à la vapeur, pour un stoemp plus léger et doux.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre", quantity: 600, unit: "g" },
            { item: "Chou-fleur (fleurons)", quantity: 400, unit: "g" },
            { item: "Lait chaud", quantity: 15, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire séparément les pommes de terre et le chou-fleur à la vapeur ou à l'eau salée jusqu'à ce qu'ils soient tendres.",
            "Égoutter les légumes. Les écraser ensemble au presse-purée.",
            "Ajouter le lait chaud et le beurre. Assaisonner avec sel, poivre et muscade. Mélanger énergiquement."
        ],
        nutrition: { calories: 280, proteins: 8, carbs: 35, fats: 12 },
        tags: ["accompagnement", "belge", "légumes"]
    },
    {
        title: "Salade de Pommes de Terre Belge (à la Vinaigrette)",
        description: "Salade de pommes de terre tiède, traditionnellement sans mayonnaise, assaisonnée d'une vinaigrette moutardée et d'oignons rouges.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre (chair ferme)", quantity: 800, unit: "g" },
            { item: "Oignon rouge (émincé)", quantity: 0.5, unit: "pièce" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" },
            { item: "Vinaigrette : Huile d'olive (3 c. à soupe), Vinaigre (1 c. à soupe), Moutarde (1 c. à café)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire les pommes de terre en robe des champs. Les peler et les couper en rondelles pendant qu'elles sont encore tièdes.",
            "Préparer la vinaigrette dans un grand bol.",
            "Ajouter les pommes de terre tièdes, l'oignon rouge et le persil à la vinaigrette. Mélanger délicatement.",
            "Laisser reposer au moins 30 minutes avant de servir à température ambiante ou légèrement frais."
        ],
        nutrition: { calories: 300, proteins: 5, carbs: 50, fats: 10 },
        tags: ["entrée", "accompagnement", "belge"]
    },
    // 11 autres recettes belges...
    {
        title: "Tarte au Maton de Grammont (Mattentaart)",
        description: "Spécialité flamande : petite tartelette individuelle garnie de 'maton' (mélange de lait caillé, œufs et amandes), souvent servie tiède.",
        servings: 6,
        prepTime: 40,
        cookTime: 35,
        ingredients: [
            { item: "Pâte feuilletée", quantity: 1, unit: "rouleau" },
            { item: "Maton (lait caillé frais et égoutté)", quantity: 200, unit: "g" },
            { item: "Lait entier", quantity: 10, unit: "cl" },
            { item: "Sucre", quantity: 80, unit: "g" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Poudre d'amandes", quantity: 30, unit: "g" },
            { item: "Extrait de vanille ou amande amère", quantity: 0.5, unit: "c. à café" }
        ],
        instructions: [
            "Préchauffer le four à 200°C. Découper la pâte feuilletée en 6 cercles.",
            "Mélanger le maton, le lait, le sucre, les œufs, la poudre d'amandes et la vanille pour la garniture.",
            "Foncer les moules. Verser la garniture dans chaque tartelette.",
            "Cuire 30 à 35 minutes jusqu'à ce que la garniture soit ferme et légèrement dorée."
        ],
        tags: ["dessert", "belge", "pâtisserie", "flamand"]
    },
    {
        title: "Pain Perdu Belge (Pain Croûton)",
        description: "Pain perdu réalisé avec du pain rassis (ou de la brioche), trempé dans un mélange de lait, œufs, et cassonade, puis poêlé.",
        servings: 4,
        prepTime: 10,
        cookTime: 10,
        ingredients: [
            { item: "Pain rassis ou brioche", quantity: 8, unit: "tranches" },
            { item: "Lait entier", quantity: 20, unit: "cl" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Cassonade brune", quantity: 2, unit: "c. à soupe" },
            { item: "Cannelle", quantity: 0.5, unit: "c. à café", optional: true },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Mélanger dans un bol le lait, les œufs, la cassonade et la cannelle. Fouetter légèrement.",
            "Tremper chaque tranche de pain dans le mélange, s'assurer qu'elles sont bien imbibées sans se désagréger.",
            "Faire fondre le beurre dans une poêle. Cuire le pain perdu 3-4 minutes par face, jusqu'à belle coloration dorée.",
            "Servir chaud, saupoudré d'un peu de cassonade ou de sucre glace."
        ],
        tags: ["dessert", "belge", "goûter"]
    },
    {
        title: "Stoemp aux Navets",
        description: "Variante de stoemp avec des navets, pour un goût légèrement piquant et terreux.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Pommes de terre", quantity: 600, unit: "g" },
            { item: "Navets", quantity: 300, unit: "g" },
            { item: "Oignon doux", quantity: 1, unit: "pièce" },
            { item: "Beurre, lait, sel, poivre", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Éplucher et couper les pommes de terre et les navets. Les cuire à l'eau salée jusqu'à tendreté.",
            "Faire suer l'oignon émincé dans le beurre.",
            "Égoutter et écraser les légumes. Ajouter le lait chaud, le beurre et les oignons. Assaisonner."
        ],
        tags: ["accompagnement", "belge", "légumes"]
    },
    {
        title: "Sauce Samouraï (Piquante Friterie)",
        description: "Sauce de friterie belge, à base de mayonnaise, de purée de tomates et de piments pour un goût très relevé.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Mayonnaise", quantity: 150, unit: "g" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à soupe" },
            { item: "Purée de piment (Harissa ou Sambal Oelek)", quantity: 1, unit: "c. à café" },
            { item: "Vinaigre de vin", quantity: 0.5, unit: "c. à café", optional: true },
            { item: "Sel, sucre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mélanger la mayonnaise, le concentré de tomate et la purée de piment.",
            "Ajouter le vinaigre, le sel et le sucre pour équilibrer les saveurs.",
            "Laisser reposer au frais 30 min avant de servir avec des frites ou une mitraillette."
        ],
        tags: ["sauce", "belge", "friterie", "piquante"]
    },
    // 7 autres...
    {
        title: "Stoemp aux Épinards",
        description: "Stoemp doux et vert, mêlant les épinards fondus à la purée de pommes de terre.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre", quantity: 700, unit: "g" },
            { item: "Épinards frais ou surgelés", quantity: 300, unit: "g" },
            { item: "Oignon (haché)", quantity: 1, unit: "pièce" },
            { item: "Beurre, lait chaud", quantity: 1, unit: "quantité suffisante" },
            { item: "Sel, poivre, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre. Faire fondre les épinards, bien les égoutter et les hacher.",
            "Faire suer l'oignon. Écraser les pommes de terre. Ajouter le lait, le beurre et les épinards/oignons.",
            "Assaisonner et servir."
        ],
        tags: ["accompagnement", "belge", "légumes"]
    },
    {
        title: "Salade de chicons (Endives) au Chèvre Chaud",
        description: "Salade belge/française où l'amertume des chicons est contrebalancée par la douceur du fromage de chèvre chaud et des noix.",
        servings: 4,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Chicons (Endives)", quantity: 4, unit: "pièces" },
            { item: "Tranches de chèvre bûche", quantity: 8, unit: "pièces" },
            { item: "Miel", quantity: 1, unit: "c. à café" },
            { item: "Noix concassées", quantity: 30, unit: "g" },
            { item: "Vinaigrette au miel (Huile de noix/vinaigre de cidre)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Émincer les chicons et les disposer sur une assiette.",
            "Déposer les tranches de chèvre sur du pain grillé (facultatif) ou directement sur une plaque. Les passer sous le grill 3 min.",
            "Napper les chèvres chauds de miel. Disposer sur la salade. Ajouter les noix et la vinaigrette."
        ],
        tags: ["entrée", "belge", "fromage", "salade"]
    },
    {
        title: "Stoemp aux Haricots (Haricots verts et blancs)",
        description: "Stoemp rustique et consistant, mélange de pommes de terre et de haricots verts et/ou blancs.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Pommes de terre", quantity: 600, unit: "g" },
            { item: "Haricots verts", quantity: 300, unit: "g" },
            { item: "Oignon haché", quantity: 1, unit: "pièce" },
            { item: "Beurre, lait chaud", quantity: 1, unit: "quantité suffisante" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre. Cuire les haricots à l'anglaise ou à la vapeur.",
            "Écraser les pommes de terre. Ajouter les haricots hachés (ou entiers selon préférence), le lait chaud et le beurre.",
            "Mélanger le tout avec l'oignon préalablement revenu. Assaisonner."
        ],
        tags: ["accompagnement", "belge", "légumes"]
    },
    {
        title: "Crêpes Belges à la Bière (Pannenkoeken)",
        description: "Crêpes légèrement plus épaisses et aérées, réalisées avec une petite touche de bière pour la légèreté.",
        servings: 8,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Farine", quantity: 250, unit: "g" },
            { item: "Lait", quantity: 30, unit: "cl" },
            { item: "Bière blonde légère", quantity: 10, unit: "cl" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Sucre", quantity: 2, unit: "c. à soupe" },
            { item: "Beurre fondu", quantity: 30, unit: "g" }
        ],
        instructions: [
            "Mélanger la farine et le sucre. Ajouter les œufs, fouetter.",
            "Ajouter progressivement le lait, puis la bière, en fouettant pour éviter les grumeaux.",
            "Terminer par le beurre fondu. Laisser reposer 30 min.",
            "Cuire les crêpes dans une poêle beurrée. Servir avec de la cassonade ou du sirop d'érable."
        ],
        tags: ["dessert", "belge", "crêpe"]
    },
    {
        title: "Sauce Tartare Belge (Ciboulette et Câpres)",
        description: "Sauce d'accompagnement riche et fraîche, différente de la française, à base de mayonnaise et d'herbes/câpres hachées.",
        servings: 4,
        prepTime: 5,
        cookTime: 0,
        ingredients: [
            { item: "Mayonnaise", quantity: 150, unit: "g" },
            { item: "Oignon (finement haché)", quantity: 1, unit: "c. à café" },
            { item: "Ciboulette et persil hachés", quantity: 1, unit: "c. à soupe" },
            { item: "Câpres hachées", quantity: 1, unit: "c. à café" },
            { item: "Vinaigre de vin", quantity: 0.5, unit: "c. à café", optional: true },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mélanger tous les ingrédients ensemble dans un bol.",
            "Goûter et ajuster l'assaisonnement et l'acidité (vinaigre).",
            "Laisser reposer au frais 30 min pour que les saveurs se mélangent.",
            "Servir avec les frites, les moules ou du poisson pané."
        ],
        tags: ["sauce", "belge", "friterie"]
    },
    {
        title: "Stoemp aux Carottes (Classique)",
        description: "Stoemp doux et sucré, simple mélange de carottes et de pommes de terre (déjà partiellement inclus, mais détaillé pour la clarté de la liste).",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Pommes de terre", quantity: 600, unit: "g" },
            { item: "Carottes", quantity: 400, unit: "g" },
            { item: "Oignon (haché)", quantity: 1, unit: "pièce" },
            { item: "Beurre, lait chaud", quantity: 1, unit: "quantité suffisante" },
            { item: "Sel, poivre, persil", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire ensemble les pommes de terre et les carottes. Égoutter.",
            "Écraser les légumes. Ajouter le lait chaud, le beurre et l'oignon préalablement revenu. Assaisonner."
        ],
        tags: ["accompagnement", "belge", "légumes"]
    },
    // PLATS FRANÇAIS
    {
        title: "Coq au Vin (Version Classique)",
        description: "Ragoût de poulet mijoté dans du vin rouge avec des lardons, des champignons et des oignons, plat emblématique de la cuisine française.",
        servings: 6,
        prepTime: 30,
        cookTime: 120,
        ingredients: [
            { item: "Poulet (coupé en morceaux)", quantity: 1.5, unit: "kg" },
            { item: "Vin rouge (Pinot Noir ou Beaujolais)", quantity: 75, unit: "cl" },
            { item: "Lardons fumés", quantity: 150, unit: "g" },
            { item: "Champignons de Paris", quantity: 200, unit: "g" },
            { item: "Oignons (en dés)", quantity: 2, unit: "pièces" },
            { item: "Carottes (en rondelles)", quantity: 2, unit: "pièces" },
            { item: "Cognac (pour flamber)", quantity: 2, unit: "cl", optional: true },
            { item: "Farine", quantity: 2, unit: "c. à soupe" },
            { item: "Bouquet garni", quantity: 1, unit: "pièce" }
        ],
        instructions: [
            "Faire mariner le poulet dans le vin rouge et les légumes pendant 12h (facultatif).",
            "Égoutter le poulet (garder la marinade). Faire dorer les lardons, les retirer. Dorer le poulet dans la graisse. Réserver.",
            "Faire suer les légumes. Remettre le poulet. Saupoudrer de farine. Flamber au Cognac (facultatif).",
            "Mouiller avec la marinade. Ajouter le bouquet garni. Mijoter 1h30 à 2h."
        ],
        nutrition: { calories: 550, proteins: 45, carbs: 20, fats: 30 },
        tags: ["plat principal", "français", "mijote", "classique"]
    },
    {
        title: "Poule au Pot (Bouillon de Volaille et Légumes)",
        description: "Plat traditionnel : poule entière cuite dans un bouillon aromatique avec des légumes racines (carottes, poireaux, navets).",
        servings: 6,
        prepTime: 30,
        cookTime: 150,
        ingredients: [
            { item: "Poule ou poulet entier", quantity: 1.5, unit: "kg" },
            { item: "Bouquet garni", quantity: 1, unit: "pièce" },
            { item: "Gros sel, poivre en grains", quantity: 1, unit: "quantité suffisante" },
            { item: "Carottes", quantity: 5, unit: "pièces" },
            { item: "Poireaux", quantity: 3, unit: "pièces" },
            { item: "Navets", quantity: 3, unit: "pièces" },
            { item: "Oignons (piqués d'un clou de girofle)", quantity: 2, unit: "pièces" }
        ],
        instructions: [
            "Plonger la poule dans une grande marmite d'eau froide. Porter à ébullition et écumer.",
            "Ajouter l'oignon, le bouquet garni, le gros sel et le poivre en grains. Cuire 1h30.",
            "Ajouter les légumes (carottes, poireaux, navets). Poursuivre la cuisson 1h jusqu'à ce que la poule soit très tendre.",
            "Servir le bouillon en entrée et la poule avec les légumes et de la fleur de sel en plat."
        ],
        nutrition: { calories: 400, proteins: 50, carbs: 15, fats: 15 },
        tags: ["plat principal", "français", "bouillon", "sain"]
    },
    {
        title: "Quenelles de Brochet Sauce Nantua",
        description: "Quenelles de poisson (brochet ou autre) pochées, servies avec une sauce crémeuse aux écrevisses ou aux crevettes (sauce Nantua).",
        servings: 4,
        prepTime: 30,
        cookTime: 30,
        ingredients: [
            { item: "Quenelles de brochet", quantity: 4, unit: "pièces" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Farine", quantity: 30, unit: "g" },
            { item: "Lait et fumet de poisson (pour la béchamel)", quantity: 40, unit: "cl" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à café" },
            { item: "Crème fraîche épaisse", quantity: 10, unit: "cl" },
            { item: "Queues d'écrevisses ou crevettes (pour la garniture)", quantity: 100, unit: "g" },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Pocher les quenelles 15-20 min dans de l'eau frémissante ou du fumet. Elles doivent doubler de volume.",
            "Préparer une béchamel (roux beurre/farine + lait/fumet).",
            "Ajouter le concentré de tomate pour la couleur, la crème et les queues d'écrevisses. Assaisonner.",
            "Disposer les quenelles dans un plat, napper de sauce et gratiner légèrement au four si désiré."
        ],
        nutrition: { calories: 500, proteins: 30, carbs: 30, fats: 30 },
        tags: ["plat principal", "français", "classique"]
    },
    // DESSERTS FRANÇAIS
    {
        title: "Île Flottante (Œufs en Neige)",
        description: "Blancs d'œufs montés en neige, pochés ou cuits, servis sur une crème anglaise onctueuse et nappés de caramel.",
        servings: 4,
        prepTime: 20,
        cookTime: 15,
        ingredients: [
            { item: "Blancs d'œufs", quantity: 4, unit: "pièces" },
            { item: "Sucre en poudre", quantity: 120, unit: "g" },
            { item: "Jaunes d'œufs", quantity: 4, unit: "pièces" },
            { item: "Lait entier", quantity: 50, unit: "cl" },
            { item: "Vanille (gousse ou extrait)", quantity: 1, unit: "pièce" },
            { item: "Eau", quantity: 5, unit: "cl" }
        ],
        instructions: [
            "Crème Anglaise : Faire infuser la vanille dans le lait chaud. Fouetter les jaunes avec 80g de sucre. Verser le lait chaud, cuire doucement jusqu'à ce que la crème nappe la cuillère. Laisser refroidir.",
            "Blancs en Neige : Monter les blancs fermes en incorporant le reste du sucre. Les pocher dans de l'eau frémissante (ou au micro-ondes).",
            "Caramel : Faire chauffer 40g de sucre et l'eau jusqu'à couleur ambrée.",
            "Dressage : Verser la crème anglaise, déposer les blancs en neige et napper de caramel."
        ],
        nutrition: { calories: 350, proteins: 12, carbs: 45, fats: 15 },
        tags: ["dessert", "français", "classique"]
    },
    {
        title: "Tarte Bourdaloue (Poires et Crème d'Amandes)",
        description: "Tarte fine garnie de poires pochées et d'une riche crème frangipane (crème d'amandes), un classique de la pâtisserie.",
        servings: 8,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Pâte sablée", quantity: 1, unit: "rouleau" },
            { item: "Poires (au sirop ou pochées)", quantity: 6, unit: "demi-pièces" },
            { item: "Beurre mou", quantity: 100, unit: "g" },
            { item: "Poudre d'amandes", quantity: 100, unit: "g" },
            { item: "Sucre", quantity: 100, unit: "g" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Extrait de vanille, poudre d'amandes effilées", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Foncer le moule avec la pâte.",
            "Crème d'Amandes : Mélanger le beurre mou, le sucre, la poudre d'amandes et les œufs.",
            "Étaler la crème d'amandes sur le fond de tarte. Disposer les demi-poires.",
            "Saupoudrer d'amandes effilées. Cuire 35 à 40 min jusqu'à belle coloration dorée."
        ],
        tags: ["dessert", "français", "pâtisserie"]
    },
    // 15 autres plats/méthodes françaises...
    {
        title: "Soufflé au Fromage (Léger et Aérien)",
        description: "Soufflé salé, base de béchamel et jaunes d'œufs, mélangée à des blancs en neige et du fromage râpé, cuit pour une texture très légère.",
        servings: 4,
        prepTime: 20,
        cookTime: 25,
        ingredients: [
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Farine", quantity: 30, unit: "g" },
            { item: "Lait", quantity: 25, unit: "cl" },
            { item: "Jaunes d'œufs", quantity: 3, unit: "pièces" },
            { item: "Blancs d'œufs", quantity: 4, unit: "pièces" },
            { item: "Fromage (Comté ou Gruyère) râpé", quantity: 100, unit: "g" },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 200°C. Beurrer et fariner des ramequins à soufflé.",
            "Préparer une béchamel épaisse. Retirer du feu, ajouter le fromage, puis les jaunes d'œufs un à un. Assaisonner.",
            "Monter les blancs d'œufs en neige ferme.",
            "Incorporer délicatement les blancs à la base de béchamel/fromage.",
            "Remplir les ramequins aux trois quarts. Cuire 20 à 25 minutes sans ouvrir le four. Servir immédiatement."
        ],
        tags: ["entrée", "français", "gastronomique", "fromage"]
    },
    {
        title: "Veau Marengo (Sauté de Veau aux Tomates et Champignons)",
        description: "Sauté de veau cuisiné dans une sauce à base de tomates, ail, vin blanc et champignons, originaire de la bataille de Marengo.",
        servings: 4,
        prepTime: 20,
        cookTime: 90,
        ingredients: [
            { item: "Sauté de veau (épaule ou jarret)", quantity: 800, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Champignons de Paris", quantity: 200, unit: "g" },
            { item: "Oignons", quantity: 2, unit: "pièces" },
            { item: "Ail", quantity: 2, unit: "gousses" },
            { item: "Vin blanc sec", quantity: 15, unit: "cl" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Huile d'olive", quantity: 2, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire dorer les morceaux de veau. Retirer et réserver. Faire suer les oignons et l'ail.",
            "Remettre la viande, saupoudrer de farine. Déglacer au vin blanc. Laisser réduire.",
            "Ajouter les tomates concassées et un peu d'eau ou de bouillon. Mijoter 1h. Ajouter les champignons 30 min avant la fin."
        ],
        tags: ["plat principal", "français", "mijote", "classique"]
    },
    {
        title: "Pissaladière (Tarte aux Oignons de Nice)",
        description: "Spécialité niçoise : pâte à pain ou pâte brisée garnie d'oignons caramélisés et fondants, décorée d'anchois et d'olives noires.",
        servings: 6,
        prepTime: 20,
        cookTime: 45,
        ingredients: [
            { item: "Pâte à pain ou pâte brisée", quantity: 1, unit: "rouleau" },
            { item: "Oignons (émincés)", quantity: 1, unit: "kg" },
            { item: "Huile d'olive", quantity: 4, unit: "c. à soupe" },
            { item: "Filets d'anchois à l'huile", quantity: 12, unit: "pièces" },
            { item: "Olives noires de Nice", quantity: 12, unit: "pièces" },
            { item: "Thym, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire étuver les oignons dans l'huile d'olive à feu très doux pendant 30 min, jusqu'à ce qu'ils soient complètement fondants et légèrement caramélisés. Assaisonner.",
            "Préchauffer le four à 200°C. Étaler la pâte et la placer sur une plaque.",
            "Étaler la compotée d'oignons refroidie sur la pâte. Disposer les filets d'anchois en croisillons et les olives au centre.",
            "Cuire 15 à 20 minutes. Servir tiède."
        ],
        tags: ["plat principal", "français", "tarte salée", "régional"]
    },
    {
        title: "Gratin de Ravioles (Rapide et Fromagé)",
        description: "Ravioles du Dauphiné pochées puis gratinées à la crème et au fromage, plat rapide et ultra-fondant.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Plaques de ravioles du Dauphiné", quantity: 2, unit: "pièces" },
            { item: "Crème fraîche liquide (entière)", quantity: 20, unit: "cl" },
            { item: "Parmesan ou Comté râpé", quantity: 80, unit: "g" },
            { item: "Ail (haché)", quantity: 0.5, unit: "gousse", optional: true },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 200°C. Faire frémir la crème dans une petite casserole. Assaisonner de muscade, sel et poivre.",
            "Placer les plaques de ravioles dans un plat à gratin. Verser la crème sur les ravioles.",
            "Recouvrir généreusement de fromage râpé.",
            "Gratiner 10 à 15 minutes, jusqu'à ce que le dessus soit doré et croustillant."
        ],
        tags: ["plat principal", "français", "gratin", "rapide"]
    },
    {
        title: "Tarte aux Mirabelles (Dessert d'été)",
        description: "Tarte simple aux mirabelles (ou quetsches), souvent garnie d'un peu de poudre d'amandes pour absorber le jus du fruit.",
        servings: 8,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Pâte brisée ou sablée", quantity: 1, unit: "rouleau" },
            { item: "Mirabelles (ou quetsches) fraîches", quantity: 800, unit: "g" },
            { item: "Poudre d'amandes", quantity: 2, unit: "c. à soupe" },
            { item: "Sucre", quantity: 50, unit: "g" },
            { item: "Cannelle (facultatif)", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Foncer le moule avec la pâte. Piquer le fond.",
            "Saupoudrer le fond de tarte de poudre d'amandes pour absorber le jus.",
            "Disposer les mirabelles dénoyautées, côté bombé vers le haut. Saupoudrer de sucre et de cannelle.",
            "Cuire 35 à 40 minutes jusqu'à ce que la pâte soit dorée et les fruits légèrement caramélisés."
        ],
        tags: ["dessert", "français", "fruit", "pâtisserie"]
    },
    // TAJINES ET PLATS MAROCAINS
    {
        title: "Tajine de Poisson (Dorade) aux Tomates et Poivrons",
        description: "Tajine de poisson (dorade ou cabillaud) aux saveurs méditerranéennes, mijoté avec des tomates, des poivrons et de la harissa (facultative).",
        servings: 4,
        prepTime: 25,
        cookTime: 45,
        ingredients: [
            { item: "Filets de Dorade ou Cabillaud", quantity: 600, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Poivrons (en lanières)", quantity: 2, unit: "pièces" },
            { item: "Ail (haché)", quantity: 2, unit: "gousses" },
            { item: "Épices : Cumin, Paprika, Curcuma", quantity: 1, unit: "c. à café" },
            { item: "Huile d'olive", quantity: 3, unit: "c. à soupe" },
            { item: "Olives vertes ou violettes", quantity: 50, unit: "g" },
            { item: "Coriandre fraîche (pour décor)", quantity: 1, unit: "poignée" }
        ],
        instructions: [
            "Faire revenir les poivrons dans l'huile d'olive, puis l'ail et les épices.",
            "Ajouter les tomates concassées, les olives et un peu d'eau. Laisser mijoter 20 min.",
            "Déposer les filets de poisson sur la sauce. Couvrir et cuire 15 à 20 minutes (la vapeur cuit le poisson).",
            "Servir chaud, garni de coriandre fraîche."
        ],
        nutrition: { calories: 380, proteins: 40, carbs: 15, fats: 20 },
        tags: ["plat principal", "tajine", "marocain", "poisson"]
    },
    {
        title: "Tajine de Boulettes de Bœuf à la Tomate et Œufs (Kefta)",
        description: "Tajine populaire de boulettes de bœuf (kefta) cuites dans une sauce tomate épicée et souvent agrémentées d'œufs pochés en fin de cuisson.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Bœuf haché", quantity: 500, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Œufs (pour pocher)", quantity: 4, unit: "pièces" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Épices (pour la viande et la sauce) : Cumin, Paprika, Persil, Coriandre", quantity: 1, unit: "quantité suffisante" },
            { item: "Huile d'olive", quantity: 2, unit: "c. à soupe" }
        ],
        instructions: [
            "Mélanger la viande hachée avec 1 c. à café de cumin, persil, coriandre, sel, poivre. Former des petites boulettes.",
            "Préparer la sauce : Faire revenir l'oignon et l'ail. Ajouter les tomates concassées et le reste des épices. Mijoter 15 min.",
            "Placer les boulettes dans la sauce chaude. Cuire 10 min.",
            "Casser les œufs directement dans la sauce. Couvrir et cuire 5 min, jusqu'à ce que les blancs soient pris et les jaunes encore coulants."
        ],
        nutrition: { calories: 500, proteins: 45, carbs: 15, fats: 30 },
        tags: ["plat principal", "tajine", "marocain", "viande"]
    },
    {
        title: "Tajine de Poulet aux Pommes de Terre et Carottes",
        description: "Tajine simple, familial et réconfortant, avec des morceaux de poulet mijotés avec des pommes de terre et des carottes dans une sauce safranée.",
        servings: 4,
        prepTime: 15,
        cookTime: 75,
        ingredients: [
            { item: "Morceaux de poulet (cuisses et pilons)", quantity: 800, unit: "g" },
            { item: "Pommes de terre (en quartiers)", quantity: 4, unit: "pièces" },
            { item: "Carottes (en gros morceaux)", quantity: 3, unit: "pièces" },
            { item: "Oignon (émincé)", quantity: 1, unit: "pièce" },
            { item: "Épices : Curcuma, Gingembre, Safran", quantity: 1, unit: "c. à café" },
            { item: "Huile d'olive", quantity: 2, unit: "c. à soupe" },
            { item: "Persil et coriandre hachés", quantity: 1, unit: "poignée" },
            { item: "Eau ou bouillon", quantity: 20, unit: "cl" }
        ],
        instructions: [
            "Faire dorer le poulet. Ajouter l'oignon et les épices. Cuire 5 min.",
            "Ajouter les carottes et l'eau/bouillon. Mijoter 30 min.",
            "Ajouter les pommes de terre. Poursuivre la cuisson 30 min jusqu'à ce que les légumes soient tendres et la sauce réduite.",
            "Servir chaud, parsemé d'herbes fraîches."
        ],
        nutrition: { calories: 400, proteins: 35, carbs: 30, fats: 15 },
        tags: ["plat principal", "tajine", "marocain", "volaille"]
    },
    // PLATS ET SAUCES MAROCAINES
    {
        title: "Couscous aux Sept Légumes (Base Végétale)",
        description: "Plat marocain complet : semoule fine servie avec un bouillon riche en légumes (courge, courgettes, carottes, navets, etc.) et des pois chiches.",
        servings: 6,
        prepTime: 40,
        cookTime: 90,
        ingredients: [
            { item: "Semoule de couscous (moyenne)", quantity: 500, unit: "g" },
            { item: "Légumes racines (carottes, navets)", quantity: 500, unit: "g" },
            { item: "Légumes tendres (courgettes, chou, potiron)", quantity: 500, unit: "g" },
            { item: "Pois chiches (cuits)", quantity: 200, unit: "g" },
            { item: "Tomates concassées", quantity: 200, unit: "g" },
            { item: "Épices : Ras el Hanout, Curcuma, Gingembre", quantity: 1, unit: "c. à soupe" },
            { item: "Huile d'olive", quantity: 3, unit: "c. à soupe" },
            { item: "Coriandre et persil (bouquet)", quantity: 1, unit: "pièce" },
            { item: "Eau", quantity: 2, unit: "L" }
        ],
        instructions: [
            "Préparer le bouillon : Faire revenir l'oignon, l'ail et les épices dans l'huile.",
            "Ajouter les légumes racines et les tomates. Couvrir d'eau. Mijoter 45 min.",
            "Ajouter les légumes tendres et les pois chiches. Poursuivre la cuisson 30 min.",
            "Cuire la semoule à la vapeur (ou à l'eau bouillante), l'égrainer.",
            "Servir la semoule dans un grand plat, creuser un puits et disposer les légumes et le bouillon par-dessus."
        ],
        nutrition: { calories: 450, proteins: 15, carbs: 70, fats: 10 },
        tags: ["plat principal", "marocain", "végétarien", "couscous"]
    },
    {
        title: "Sauce Chermoula (pour Poisson et Légumes)",
        description: "Marinade et sauce marocaine acidulée, fraîche et très aromatique, à base d'herbes et d'épices.",
        servings: 4,
        prepTime: 10,
        cookTime: 0,
        ingredients: [
            { item: "Coriandre fraîche", quantity: 1, unit: "bouquet" },
            { item: "Persil plat", quantity: 1, unit: "bouquet" },
            { item: "Ail (gousses)", quantity: 3, unit: "pièces" },
            { item: "Jus de citron frais", quantity: 5, unit: "cl" },
            { item: "Huile d'olive", quantity: 5, unit: "cl" },
            { item: "Épices : Cumin, Paprika doux", quantity: 1, unit: "c. à café" },
            { item: "Sel, poivre de Cayenne", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Hacher finement (ou mixer) l'ail, la coriandre et le persil.",
            "Ajouter le jus de citron, l'huile d'olive et toutes les épices. Bien mélanger pour obtenir une pâte épaisse.",
            "Utiliser comme marinade pour le poisson (minimum 30 min) ou comme sauce d'accompagnement pour les légumes ou les couscous."
        ],
        nutrition: { calories: 150, proteins: 2, carbs: 5, fats: 15 },
        tags: ["sauce", "marocain", "marinade", "aromatique"]
    },
    {
        title: "Semoule de Couscous (Méthode Vapeur Simple)",
        description: "Technique de cuisson de la semoule au couscoussier pour obtenir des grains fins, légers et bien détachés.",
        servings: 6,
        prepTime: 5,
        cookTime: 30,
        ingredients: [
            { item: "Semoule moyenne", quantity: 500, unit: "g" },
            { item: "Eau froide", quantity: 25, unit: "cl" },
            { item: "Huile d'olive ou beurre", quantity: 1, unit: "c. à soupe" },
            { item: "Sel fin", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Mettre la semoule dans un grand plat. Verser l'eau salée froide. Laisser absorber 5 min.",
            "Égrener la semoule avec les mains pour séparer les grains.",
            "Cuisson : Placer la semoule dans le couscoussier. Placer sur une marmite d'eau bouillante (ou sur le bouillon du couscous). Cuire 15 min à la vapeur.",
            "Après 15 min, verser la semoule dans le plat, l'arroser d'eau froide (10 cl) et l'égrener à nouveau. Ajouter l'huile ou le beurre.",
            "Cuire une deuxième fois 15 min à la vapeur. Servir chaud."
        ],
        tags: ["technique", "accompagnement", "marocain", "couscous"]
    },
    // PÂTES CLASSIQUES
    {
        title: "Spaghetti Aglio e Olio",
        description: "Plat de pâtes emblématique de la cuisine simple napolitaine, à base d'huile d'olive, d'ail et de piment, sans sauce tomate.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Spaghetti", quantity: 400, unit: "g" },
            { item: "Huile d'olive extra vierge", quantity: 10, unit: "cl" },
            { item: "Ail (lamelles fines)", quantity: 4, unit: "gousses" },
            { item: "Piment rouge frais ou séché (Peperoncino)", quantity: 1, unit: "pièce" },
            { item: "Persil plat haché", quantity: 1, unit: "c. à soupe" },
            { item: "Sel de mer", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les spaghetti 'al dente'. Garder 10 cl d'eau de cuisson.",
            "Faire chauffer l'huile d'olive à feu très doux. Ajouter l'ail et le piment (ne pas les laisser dorer, juste infuser).",
            "Égoutter les pâtes. Les verser dans la poêle avec l'huile parfumée et l'eau de cuisson. Sauter 2 min pour émulsionner.",
            "Retirer du feu. Ajouter le persil haché et servir immédiatement."
        ],
        nutrition: { calories: 480, proteins: 15, carbs: 65, fats: 20 },
        tags: ["plat principal", "italien", "pâtes", "végétarien"]
    },
    {
        title: "Penne all'Arrabbiata",
        description: "Sauce tomate épicée, 'arrabbiata' (enragée) en raison du piment fort, pour un plat de pâtes rapide et relevé.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Penne", quantity: 400, unit: "g" },
            { item: "Tomates concassées (Pelati)", quantity: 800, unit: "g" },
            { item: "Ail", quantity: 3, unit: "gousses" },
            { item: "Peperoncino (piment séché) ou flocons de piment", quantity: 1, unit: "c. à café" },
            { item: "Huile d'olive extra vierge", quantity: 3, unit: "c. à soupe" },
            { item: "Persil plat haché", quantity: 1, unit: "c. à soupe" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire chauffer l'huile d'olive. Faire dorer l'ail (coupé en deux) et le piment.",
            "Retirer l'ail avant qu'il ne brûle. Ajouter les tomates concassées, le sel et le poivre.",
            "Laisser mijoter la sauce 20 min. Cuire les penne 'al dente'.",
            "Mélanger les pâtes à la sauce Arrabbiata. Servir chaud, saupoudré de persil."
        ],
        nutrition: { calories: 450, proteins: 15, carbs: 70, fats: 10 },
        tags: ["plat principal", "italien", "pâtes", "végétarien"]
    },
    {
        title: "Spaghetti alla Carbonara (Version Originale)",
        description: "Spaghetti à base d'œufs, de Pecorino Romano, de Guanciale (joue de porc séchée) et de poivre, sans crème fraîche.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Spaghetti", quantity: 400, unit: "g" },
            { item: "Guanciale (ou Pancetta)", quantity: 150, unit: "g" },
            { item: "Jaunes d'œufs", quantity: 4, unit: "pièces" },
            { item: "Œufs entiers", quantity: 2, unit: "pièces" },
            { item: "Pecorino Romano râpé", quantity: 100, unit: "g" },
            { item: "Poivre noir fraîchement moulu", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Couper le Guanciale en dés épais. Le faire dorer à sec dans une poêle jusqu'à ce qu'il soit croustillant. Garder la graisse (suarda).",
            "Mélanger les œufs (entiers + jaunes) avec le Pecorino et le poivre noir.",
            "Cuire les pâtes 'al dente'. Égoutter en gardant l'eau de cuisson.",
            "Hors du feu, mélanger les pâtes avec la graisse de Guanciale. Ajouter rapidement le mélange œufs/fromage et un peu d'eau de cuisson pour créer la sauce crémeuse (émulsion). Ajouter les dés de Guanciale croustillant."
        ],
        nutrition: { calories: 650, proteins: 30, carbs: 50, fats: 40 },
        tags: ["plat principal", "italien", "pâtes", "classique"]
    },
    {
        title: "Pâtes Cacio e Pepe",
        description: "Plat minimaliste de Rome : pâtes, fromage (Cacio, soit Pecorino) et poivre, liés par l'amidon de l'eau de cuisson.",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Spaghetti ou Tonnarelli", quantity: 400, unit: "g" },
            { item: "Pecorino Romano râpé", quantity: 200, unit: "g" },
            { item: "Poivre noir en grains", quantity: 2, unit: "c. à soupe" },
            { item: "Sel (pour l'eau de cuisson)", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Concasser le poivre. Le faire griller à sec dans une poêle pour en exalter le parfum.",
            "Cuire les pâtes. Garder beaucoup d'eau de cuisson très riche en amidon.",
            "Dans la poêle, déglacer le poivre avec l'eau de cuisson. Retirer du feu, ajouter progressivement le Pecorino en remuant rapidement (effet 'mantecare') jusqu'à obtenir une sauce crémeuse.",
            "Mélanger les pâtes à la sauce et servir immédiatement. Le secret est dans l'émulsion."
        ],
        nutrition: { calories: 550, proteins: 30, carbs: 55, fats: 25 },
        tags: ["plat principal", "italien", "pâtes", "classique"]
    },
    {
        title: "Lasagnes à la Bolognaise (Complète)",
        description: "Plat emblématique de la région d'Émilie-Romagne : couches de pâtes à l'œuf, béchamel, et Ragoût alla Bolognese (sauce à la viande et tomate).",
        servings: 8,
        prepTime: 60,
        cookTime: 120,
        ingredients: [
            { item: "Pâtes à lasagnes fraîches ou sèches", quantity: 250, unit: "g" },
            { item: "Ragoût (Viande hachée, tomate, carotte, céleri, oignon)", quantity: 1, unit: "L" },
            { item: "Béchamel (Beurre, farine, lait, muscade)", quantity: 1, unit: "L" },
            { item: "Parmesan râpé", quantity: 150, unit: "g" }
        ],
        instructions: [
            "Préparer le Ragoût (mijoter 1h30). Préparer la Béchamel.",
            "Préchauffer le four à 180°C. Monter les couches : Ragoût, Béchamel, Pâtes, Parmesan. Répéter 4 à 5 fois.",
            "Terminer par une couche de Béchamel et beaucoup de Parmesan.",
            "Cuire au four 45 minutes, jusqu'à ce que le dessus soit doré et bouillonnant. Laisser reposer 10 min avant de servir."
        ],
        tags: ["plat principal", "italien", "classique", "gratin"]
    },
    {
        title: "Risotto aux Champignons de Saison (Funghi)",
        description: "Risotto crémeux, parfumé aux champignons (porcini ou de Paris), lié avec du bouillon, du vin blanc, du beurre et du parmesan.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Riz Carnaroli ou Arborio", quantity: 320, unit: "g" },
            { item: "Champignons (mélange ou de Paris)", quantity: 300, unit: "g" },
            { item: "Bouillon de légumes (chaud)", quantity: 1.5, unit: "L" },
            { item: "Oignon ou échalote (ciselé)", quantity: 1, unit: "pièce" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Beurre (pour la 'Mantecatura')", quantity: 40, unit: "g" },
            { item: "Parmesan râpé", quantity: 50, unit: "g" },
            { item: "Huile d'olive, Persil", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir l'oignon dans l'huile. Ajouter le riz et le faire nacrer 2 min.",
            "Déglacer au vin blanc. Laisser évaporer. Ajouter les champignons (préalablement sautés ou crus).",
            "Ajouter une louche de bouillon chaud à la fois, en remuant jusqu'à absorption complète avant d'ajouter la suivante. Cuire 18 min.",
            "Hors du feu, ajouter le beurre froid et le parmesan. Mélanger vigoureusement pour lier (mantecare). Laisser reposer 2 min avant de servir."
        ],
        tags: ["plat principal", "italien", "risotto", "végétarien"]
    },
    {
        title: "Spaghetti alle Vongole (Palourdes)",
        description: "Plat de fruits de mer léger de Campanie : spaghetti sautés avec des palourdes, de l'ail, du vin blanc et du piment.",
        servings: 4,
        prepTime: 20,
        cookTime: 20,
        ingredients: [
            { item: "Spaghetti", quantity: 400, unit: "g" },
            { item: "Palourdes (Vongole) fraîches", quantity: 1, unit: "kg" },
            { item: "Ail", quantity: 3, unit: "gousses" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Huile d'olive extra vierge", quantity: 4, unit: "c. à soupe" },
            { item: "Persil plat haché", quantity: 2, unit: "c. à soupe" },
            { item: "Piment (Peperoncino)", quantity: 1, unit: "pincée", optional: true }
        ],
        instructions: [
            "Faire dégorger les palourdes dans de l'eau salée pendant 1h. Les rincer.",
            "Faire chauffer l'huile, l'ail et le piment dans une grande poêle. Ajouter les palourdes et le vin blanc.",
            "Couvrir et cuire jusqu'à ce que toutes les palourdes soient ouvertes. Retirer les coquilles non ouvertes.",
            "Cuire les spaghetti. Les égoutter et les verser dans la poêle avec le jus de palourdes et du persil. Sauter 2 min."
        ],
        tags: ["plat principal", "italien", "pâtes", "fruits de mer"]
    },
    {
        title: "Gnocchi au Pesto (de Basilic frais)",
        description: "Gnocchi de pommes de terre moelleux servis avec le pesto Genovese, une sauce fraîche à base de basilic, pignons et parmesan.",
        servings: 4,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Gnocchi de pommes de terre frais", quantity: 500, unit: "g" },
            { item: "Pesto de basilic (maison ou commerce)", quantity: 4, unit: "c. à soupe" },
            { item: "Parmesan râpé", quantity: 2, unit: "c. à soupe", optional: true }
        ],
        instructions: [
            "Cuire les gnocchi dans de l'eau bouillante salée. Ils sont cuits lorsqu'ils remontent à la surface (2-3 min).",
            "Égoutter délicatement en gardant un peu d'eau de cuisson.",
            "Mélanger les gnocchi chauds dans un grand bol avec le pesto. Ajouter une cuillère d'eau de cuisson pour rendre la sauce plus onctueuse (facultatif).",
            "Servir aussitôt, éventuellement avec quelques feuilles de basilic frais."
        ],
        tags: ["plat principal", "italien", "pâtes", "végétarien"]
    },
    {
        title: "Trofie al Pesto, Fagiolini e Patate (Liguria)",
        description: "Plat complet de Ligurie : petites pâtes (Trofie) servies avec du pesto, des haricots verts et des pommes de terre.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Trofie ou Linguine", quantity: 400, unit: "g" },
            { item: "Haricots verts (Fagiolini)", quantity: 200, unit: "g" },
            { item: "Pommes de terre (coupées en dés)", quantity: 200, unit: "g" },
            { item: "Pesto de basilic", quantity: 4, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les haricots verts et les pommes de terre dans l'eau bouillante salée.",
            "Ajouter les pâtes dans la même eau de cuisson et cuire ensemble 'al dente'.",
            "Égoutter le tout, puis transférer dans un grand saladier.",
            "Ajouter le pesto et mélanger bien. Servir chaud ou tiède."
        ],
        tags: ["plat principal", "italien", "pâtes", "régional"]
    },
    {
        title: "Risotto alla Milanese (Safran et Ossobuco)",
        description: "Risotto classique de Milan, caractérisé par sa couleur jaune due au safran et traditionnellement accompagné d'ossobuco (non inclus ici).",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Riz Carnaroli ou Arborio", quantity: 320, unit: "g" },
            { item: "Bouillon de bœuf ou de légumes (chaud)", quantity: 1.5, unit: "L" },
            { item: "Oignon ou échalote (ciselé)", quantity: 1, unit: "pièce" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Safran (en filaments)", quantity: 1, unit: "pincée" },
            { item: "Beurre (pour la 'Mantecatura')", quantity: 40, unit: "g" },
            { item: "Parmesan râpé", quantity: 50, unit: "g" }
        ],
        instructions: [
            "Faire infuser le safran dans une louche de bouillon chaud.",
            "Faire revenir l'oignon dans un peu de beurre. Ajouter le riz et le nacrer.",
            "Déglacer au vin blanc. Laisser évaporer. Ajouter le bouillon louche par louche (méthode classique).",
            "À mi-cuisson, ajouter le bouillon infusé au safran. Poursuivre la cuisson.",
            "Hors du feu, incorporer le beurre froid et le parmesan pour lier (mantecare)."
        ],
        tags: ["plat principal", "italien", "risotto", "classique"]
    },
    // 10 autres recettes de pâtes/risotto
    {
        title: "Bucatini all'Amatriciana (Lazio)",
        description: "Sauce romaine à base de Guanciale (joue de porc), tomates, Pecorino et piment, sans oignon.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Bucatini (ou Spaghetti)", quantity: 400, unit: "g" },
            { item: "Guanciale (en dés)", quantity: 120, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Pecorino Romano râpé", quantity: 80, unit: "g" },
            { item: "Vin blanc sec", quantity: 5, unit: "cl" },
            { item: "Piment (Peperoncino)", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire dorer le Guanciale à sec jusqu'à ce qu'il soit croustillant. Retirer et réserver la graisse.",
            "Déglacer la poêle avec le vin blanc, laisser réduire. Ajouter les tomates concassées et le piment. Mijoter 20 min.",
            "Cuire les pâtes. Les verser dans la sauce avec la graisse réservée. Ajouter le Guanciale croustillant. Servir avec le Pecorino râpé."
        ],
        tags: ["plat principal", "italien", "pâtes", "régional"]
    },
    {
        title: "Pasta al Ragù alla Bolognese",
        description: "Pâtes (souvent des Tagliatelle) servies avec le Ragoût alla Bolognese, une sauce mijotée à base de viande, tomate et légumes.",
        servings: 4,
        prepTime: 20,
        cookTime: 120, // Longue mijote
        ingredients: [
            { item: "Tagliatelle ou Fettuccine à l'œuf", quantity: 400, unit: "g" },
            { item: "Ragoût alla Bolognese (préalablement préparé)", quantity: 500, unit: "g" },
            { item: "Parmesan râpé", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Préparer le Ragoût (mijoter au moins 2h avec vin, bouillon, et parfois du lait).",
            "Cuire les Tagliatelle 'al dente'. Égoutter.",
            "Mélanger les pâtes au Ragoût dans un grand bol ou directement dans la marmite du Ragoût.",
            "Servir chaud, généreusement saupoudré de Parmesan."
        ],
        tags: ["plat principal", "italien", "pâtes", "classique"]
    },
    {
        title: "Penne aux Quatre Fromages (Quattro Formaggi)",
        description: "Sauce crémeuse et onctueuse à base de quatre fromages italiens (Gorgonzola, Fontina, Taleggio, et Parmesan).",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Penne", quantity: 400, unit: "g" },
            { item: "Crème liquide entière", quantity: 20, unit: "cl" },
            { item: "Gorgonzola (doux)", quantity: 50, unit: "g" },
            { item: "Fontina ou Taleggio (en dés)", quantity: 50, unit: "g" },
            { item: "Parmesan râpé", quantity: 50, unit: "g" },
            { item: "Fromage doux (Mozzarella, en dés)", quantity: 50, unit: "g", optional: true }
        ],
        instructions: [
            "Faire chauffer la crème liquide. Ajouter les fromages coupés en morceaux (sauf le Parmesan).",
            "Laisser fondre doucement en remuant jusqu'à obtention d'une sauce lisse et homogène (ajouter le Parmesan en dernier).",
            "Cuire les pâtes 'al dente'. Les égoutter et les mélanger immédiatement à la sauce chaude."
        ],
        tags: ["plat principal", "italien", "pâtes", "fromage"]
    },
    {
        title: "Risotto alla Zucca (Courge et Saucisse)",
        description: "Risotto d'automne, avec des dés de courge (butternut ou potimarron) et des miettes de saucisse (salsiccia) pour la richesse.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Riz Carnaroli ou Arborio", quantity: 320, unit: "g" },
            { item: "Courge (en petits dés)", quantity: 300, unit: "g" },
            { item: "Saucisse fraîche (Salsiccia), retirée de la peau", quantity: 150, unit: "g" },
            { item: "Bouillon de volaille ou légumes (chaud)", quantity: 1.5, unit: "L" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Beurre, Parmesan", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire dorer la saucisse émiettée, retirer et réserver la graisse. Faire revenir l'oignon dans cette graisse.",
            "Ajouter le riz et le nacrer. Déglacer au vin blanc. Ajouter les dés de courge.",
            "Poursuivre la cuisson classique du risotto avec le bouillon. La courge doit s'attendrir et se dissoudre partiellement.",
            "Hors du feu, lier avec le beurre et le Parmesan. Ajouter la saucisse dorée."
        ],
        tags: ["plat principal", "italien", "risotto", "saison"]
    },
    {
        title: "Pasta al Limone (Pâtes au Citron)",
        description: "Plat d'été léger et parfumé, à base d'une sauce crémeuse au jus de citron et zestes, idéal pour les linguine.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Linguine ou Spaghetti", quantity: 400, unit: "g" },
            { item: "Crème liquide entière", quantity: 10, unit: "cl" },
            { item: "Jus de citron frais", quantity: 3, unit: "c. à soupe" },
            { item: "Zestes de citron non traité", quantity: 1, unit: "c. à soupe" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Parmesan râpé", quantity: 30, unit: "g", optional: true }
        ],
        instructions: [
            "Cuire les pâtes. Égoutter en gardant l'eau de cuisson.",
            "Faire fondre le beurre dans une poêle. Ajouter la crème, le jus et les zestes de citron. Faire frémir doucement.",
            "Ajouter les pâtes et un peu d'eau de cuisson si nécessaire. Bien mélanger pour enrober.",
            "Retirer du feu. Ajouter le Parmesan et servir immédiatement."
        ],
        tags: ["plat principal", "italien", "pâtes", "léger"]
    },
    {
        title: "Spaghetti con Polpette (Boulettes de Viande)",
        description: "Plat réconfortant du Sud : spaghetti et grosses boulettes de viande (polpette) cuites directement dans une sauce tomate simple et riche.",
        servings: 4,
        prepTime: 20,
        cookTime: 60,
        ingredients: [
            { item: "Spaghetti", quantity: 400, unit: "g" },
            { item: "Bœuf et/ou porc haché", quantity: 500, unit: "g" },
            { item: "Pain de mie trempé dans le lait", quantity: 2, unit: "tranches" },
            { item: "Parmesan, œuf, ail, persil (pour les boulettes)", quantity: 1, unit: "quantité suffisante" },
            { item: "Sauce tomate simple (préalablement mijotée)", quantity: 800, unit: "g" }
        ],
        instructions: [
            "Mélanger les ingrédients des boulettes (viande, pain essoré, parmesan, œuf, ail, persil, sel, poivre). Former 8 grosses boulettes.",
            "Faire dorer les boulettes à la poêle. Les transférer dans la sauce tomate chaude.",
            "Laisser mijoter dans la sauce 45 à 60 minutes. Cuire les spaghetti 'al dente'.",
            "Servir les spaghetti nappés de sauce, avec 2 boulettes par personne."
        ],
        tags: ["plat principal", "italien", "pâtes", "viande"]
    },
    {
        title: "Pasta alla Norma (Sicile)",
        description: "Plat sicilien à base de tomates, d'aubergines frites et de Ricotta salata (fromage salé, remplacé ici par de la Ricotta simple ou de la Feta).",
        servings: 4,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Maccheroni ou Rigatoni", quantity: 400, unit: "g" },
            { item: "Aubergine", quantity: 2, unit: "pièces" },
            { item: "Tomates concassées", quantity: 800, unit: "g" },
            { item: "Ricotta salata (ou simple)", quantity: 80, unit: "g" },
            { item: "Basilic frais", quantity: 1, unit: "poignée" },
            { item: "Huile d'olive (pour friture des aubergines)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Couper l'aubergine en dés. Les frire dans l'huile d'olive jusqu'à coloration. Égoutter sur du papier absorbant. Saler.",
            "Préparer la sauce tomate : faire mijoter les tomates avec de l'ail et du basilic pendant 20 min.",
            "Cuire les pâtes 'al dente'. Mélanger les pâtes à la sauce tomate et aux dés d'aubergines.",
            "Servir chaud, garni de feuilles de basilic frais et de Ricotta salata (ou Feta émiettée)."
        ],
        tags: ["plat principal", "italien", "pâtes", "régional"]
    },
    {
        title: "Risotto aux Fruits de Mer (Frutti di Mare)",
        description: "Risotto au fumet de poisson, garni d'un mélange de fruits de mer (moules, palourdes, crevettes) et de vin blanc.",
        servings: 4,
        prepTime: 25,
        cookTime: 35,
        ingredients: [
            { item: "Riz Carnaroli ou Arborio", quantity: 320, unit: "g" },
            { item: "Mélange de fruits de mer (sans coquilles)", quantity: 400, unit: "g" },
            { item: "Fumet de poisson (chaud)", quantity: 1.5, unit: "L" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Ail, Persil, Huile d'olive", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire sauter les fruits de mer à la poêle avec ail et persil. Réserver.",
            "Commencer le risotto classique : nacrer le riz avec l'oignon et le vin blanc. Poursuivre la cuisson avec le fumet de poisson.",
            "Ajouter les fruits de mer sautés 5 min avant la fin de la cuisson. Finir la cuisson du riz.",
            "Lier le risotto avec un peu de beurre (facultatif) et beaucoup de persil frais. Servir sans parmesan."
        ],
        tags: ["plat principal", "italien", "risotto", "fruits de mer"]
    },
    {
        title: "Lasagnes Végétariennes aux Légumes Grillés",
        description: "Lasagnes garnies de courgettes, aubergines et poivrons grillés, de sauce tomate et de mozzarella, sans béchamel lourde.",
        servings: 6,
        prepTime: 40,
        cookTime: 60,
        ingredients: [
            { item: "Pâtes à lasagnes", quantity: 250, unit: "g" },
            { item: "Légumes (courgettes, aubergines, poivrons)", quantity: 800, unit: "g" },
            { item: "Sauce tomate épaisse", quantity: 500, unit: "g" },
            { item: "Mozzarella (en tranches)", quantity: 200, unit: "g" },
            { item: "Ricotta (pour lier la farce)", quantity: 100, unit: "g", optional: true },
            { item: "Parmesan râpé", quantity: 50, unit: "g" }
        ],
        instructions: [
            "Couper les légumes en fines tranches, les griller (au four ou à la plancha). Assaisonner.",
            "Assemblage : Étaler une fine couche de sauce tomate. Alterner pâtes, sauce tomate, légumes grillés, mozzarella et Parmesan. Répéter 4 fois.",
            "Terminer par sauce tomate et Parmesan. Cuire au four 45-50 minutes à 180°C."
        ],
        tags: ["plat principal", "italien", "végétarien", "gratin"]
    },
    {
        title: "Rigatoni con Panna e Prosciutto Cotto",
        description: "Plat populaire et rapide : rigatoni dans une sauce crémeuse (panna) avec du jambon cuit (prosciutto cotto) et du Parmesan.",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Rigatoni", quantity: 400, unit: "g" },
            { item: "Jambon cuit (en dés)", quantity: 150, unit: "g" },
            { item: "Crème liquide entière (Panna)", quantity: 20, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Parmesan râpé", quantity: 50, unit: "g" }
        ],
        instructions: [
            "Faire fondre le beurre. Faire dorer les dés de jambon. Ajouter la crème liquide. Faire frémir doucement 5 min.",
            "Cuire les pâtes 'al dente'. Égoutter.",
            "Mélanger les pâtes à la sauce. Servir immédiatement avec le Parmesan."
        ],
        tags: ["plat principal", "italien", "pâtes", "rapide"]
    },
    // PIZZAS
    {
        title: "Pizza Margherita (Naples)",
        description: "Pizza classique de Naples : sauce tomate, mozzarella, basilic frais et huile d'olive.",
        servings: 4,
        prepTime: 60, // Temps de levée de la pâte
        cookTime: 15,
        ingredients: [
            { item: "Pâte à pizza (maison ou commerce)", quantity: 400, unit: "g" },
            { item: "Sauce tomate (Polpa di pomodoro)", quantity: 20, unit: "cl" },
            { item: "Mozzarella di Bufala ou Fior di latte", quantity: 200, unit: "g" },
            { item: "Basilic frais", quantity: 1, unit: "quantité suffisante" },
            { item: "Huile d'olive extra vierge", quantity: 1, unit: "c. à soupe" },
            { item: "Sel", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 250°C (ou au maximum). Étaler la pâte à pizza.",
            "Répartir la sauce tomate (assaisonnée de sel et d'huile).",
            "Disposer la mozzarella coupée et bien égouttée.",
            "Cuire 10 à 15 minutes. Ajouter le basilic frais et un filet d'huile d'olive après cuisson."
        ],
        tags: ["plat principal", "italien", "pizza", "classique"]
    },
    {
        title: "Pizza Quattro Stagioni (Quatre Saisons)",
        description: "Pizza divisée en quatre sections, chacune représentant une saison avec des ingrédients distincts (artichauts, jambon, olives, champignons).",
        servings: 4,
        prepTime: 30,
        cookTime: 15,
        ingredients: [
            { item: "Pâte à pizza", quantity: 400, unit: "g" },
            { item: "Sauce tomate", quantity: 20, unit: "cl" },
            { item: "Mozzarella", quantity: 200, unit: "g" },
            { item: "Jambon cuit (cubes)", quantity: 50, unit: "g" },
            { item: "Champignons (sautés)", quantity: 50, unit: "g" },
            { item: "Artichauts marinés", quantity: 50, unit: "g" },
            { item: "Olives noires", quantity: 10, unit: "pièces" }
        ],
        instructions: [
            "Préchauffer le four au maximum. Étaler la pâte et recouvrir de sauce tomate et mozzarella.",
            "Diviser la pizza mentalement en quatre. Disposer un ingrédient différent dans chaque quart (exemple : Jambon en haut à gauche, Champignons en haut à droite...).",
            "Cuire 10 à 15 minutes."
        ],
        tags: ["plat principal", "italien", "pizza"]
    },
    {
        title: "Focaccia al Rosmarino (Romarin et Sel)",
        description: "Pain plat italien, très moelleux, parfumé à l'huile d'olive, au gros sel et au romarin frais.",
        servings: 6,
        prepTime: 90, // Temps de levée
        cookTime: 20,
        ingredients: [
            { item: "Farine de blé type 00 ou forte", quantity: 300, unit: "g" },
            { item: "Eau tiède", quantity: 20, unit: "cl" },
            { item: "Levure de boulanger fraîche", quantity: 10, unit: "g" },
            { item: "Huile d'olive extra vierge", quantity: 5, unit: "c. à soupe" },
            { item: "Gros sel marin", quantity: 1, unit: "c. à café" },
            { item: "Romarin frais", quantity: 2, unit: "brins" }
        ],
        instructions: [
            "Préparer une pâte levée. Laisser lever 1 heure.",
            "Étaler la pâte dans un plat huilé (2 cm d'épaisseur). Laisser lever 30 min.",
            "Avec les doigts, faire des trous sur la surface. Badigeonner généreusement d'huile d'olive, d'eau (facultatif), de gros sel et de romarin.",
            "Cuire 15 à 20 minutes à 200°C jusqu'à belle coloration dorée."
        ],
        tags: ["entrée", "accompagnement", "italien", "pain"]
    },
    // AUTRES PLATS
    {
        title: "Ossobuco alla Milanese",
        description: "Jarret de veau braisé, cuit lentement dans un bouillon de vin blanc et de légumes, traditionnellement servi avec un Risotto à la Milanese et une 'gremolata'.",
        servings: 4,
        prepTime: 30,
        cookTime: 150,
        ingredients: [
            { item: "Jarrets de veau (Ossobuco)", quantity: 4, unit: "pièces" },
            { item: "Vin blanc sec", quantity: 20, unit: "cl" },
            { item: "Bouillon de bœuf (chaud)", quantity: 50, unit: "cl" },
            { item: "Tomates concassées", quantity: 200, unit: "g", optional: true },
            { item: "Carottes, céleri, oignons (pour le sofrito)", quantity: 1, unit: "quantité suffisante" },
            { item: "Gremolata : Zeste de citron, ail, persil (pour servir)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Fariner les jarrets. Les dorer dans l'huile et le beurre. Retirer et réserver.",
            "Faire suer les légumes (sofrito). Remettre la viande. Déglacer au vin blanc. Laisser réduire.",
            "Ajouter le bouillon (et les tomates si utilisées). Couvrir et mijoter 2h à 2h30 jusqu'à ce que la viande soit très tendre.",
            "Gremolata : Hacher finement le persil et l'ail. Mélanger avec le zeste de citron.",
            "Servir l'Ossobuco avec la sauce et la gremolata par-dessus."
        ],
        tags: ["plat principal", "italien", "viande", "mijote"]
    },
    {
        title: "Melanzane alla Parmigiana (Parmentière d'Aubergine)",
        description: "Gratin de tranches d'aubergines frites (ou grillées) alternées avec de la sauce tomate, de la mozzarella et du parmesan.",
        servings: 6,
        prepTime: 40,
        cookTime: 45,
        ingredients: [
            { item: "Aubergines", quantity: 4, unit: "pièces" },
            { item: "Sauce tomate simple (maison ou en conserve)", quantity: 800, unit: "g" },
            { item: "Mozzarella (en dés)", quantity: 300, unit: "g" },
            { item: "Parmesan râpé", quantity: 100, unit: "g" },
            { item: "Basilic frais", quantity: 1, unit: "poignée" },
            { item: "Huile d'olive (pour friture ou badigeon)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Couper l'aubergine en tranches. Les faire frire ou les griller au four. Égoutter.",
            "Préchauffer le four à 180°C. Assemblage : Étaler une couche de sauce tomate, puis aubergines, mozzarella, Parmesan et basilic. Répéter 3 à 4 fois.",
            "Terminer par une couche de sauce et beaucoup de Parmesan. Cuire 35 à 45 minutes jusqu'à ce que ce soit bouillonnant et doré."
        ],
        tags: ["plat principal", "italien", "gratin", "végétarien"]
    },
    {
        title: "Saltimbocca alla Romana",
        description: "Plat romain : fines escalopes de veau (ou de porc) garnies de jambon de Parme et d'une feuille de sauge, rapidement poêlées et déglacées au vin blanc.",
        servings: 4,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Escalopes de veau (fines)", quantity: 4, unit: "pièces" },
            { item: "Tranches de Prosciutto di Parma (Jambon de Parme)", quantity: 4, unit: "pièces" },
            { item: "Feuilles de sauge fraîche", quantity: 4, unit: "pièces" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Placer sur chaque escalope une tranche de jambon et une feuille de sauge. Fixer avec une pique ou plier. Fariner légèrement.",
            "Faire fondre le beurre. Dorer les saltimbocca 2 min par face (côté jambon en premier).",
            "Déglacer au vin blanc, laisser réduire. Servir aussitôt avec la sauce au vin et une purée de pommes de terre (facultatif)."
        ],
        tags: ["plat principal", "italien", "viande", "régional"]
    },
    {
        title: "Polenta Crémeuse au Parmesan",
        description: "Semoule de maïs cuite dans de l'eau ou du bouillon, liée au beurre et au fromage pour un accompagnement chaud et réconfortant.",
        servings: 4,
        prepTime: 5,
        cookTime: 30,
        ingredients: [
            { item: "Farine de maïs instantanée (Polenta)", quantity: 250, unit: "g" },
            { item: "Eau ou bouillon", quantity: 1, unit: "L" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Parmesan râpé", quantity: 50, unit: "g" },
            { item: "Sel fin", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Porter l'eau (ou le bouillon) salée à ébullition. Verser la polenta en pluie tout en remuant vigoureusement (ou utiliser la polenta instantanée selon instructions).",
            "Cuire 5 à 30 min (selon la polenta) en remuant constamment.",
            "Hors du feu, incorporer le beurre et le parmesan. Servir immédiatement (la polenta épaissit rapidement)."
        ],
        tags: ["accompagnement", "italien", "végétarien"]
    },
    // ACCOMPAGNEMENTS ET SAUCES MÈRES
    {
        title: "Purée de Pommes de Terre (Classique de Robuchon)",
        description: "Purée onctueuse et riche, avec un fort ajout de beurre et de lait chaud, pour une texture parfaitement lisse et aérée.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Pommes de terre (Bintje ou Ratte)", quantity: 1, unit: "kg" },
            { item: "Beurre froid (coupé en dés)", quantity: 250, unit: "g" },
            { item: "Lait entier (chaud)", quantity: 20, unit: "cl" },
            { item: "Sel, muscade", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre non pelées à l'eau salée. Les peler à chaud et les passer au moulin à légumes ou au presse-purée.",
            "Dessécher la purée à la spatule sur feu doux (2 min).",
            "Incorporer le beurre froid petit à petit en mélangeant énergiquement (hors du feu).",
            "Ajouter progressivement le lait chaud tout en mélangeant. Ne pas trop travailler. Assaisonner et servir aussitôt."
        ],
        nutrition: { calories: 450, proteins: 8, carbs: 40, fats: 30 },
        tags: ["accompagnement", "français", "classique", "gastronomique"]
    },
    {
        title: "Beurre Blanc (Sauce Émulsionnée Citronnée)",
        description: "Sauce émulsionnée de la cuisine française, à base de vin blanc, échalotes, et montée au beurre froid, idéale pour le poisson.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Échalotes (finement hachées)", quantity: 2, unit: "pièces" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Vinaigre de vin blanc", quantity: 2, unit: "cl" },
            { item: "Beurre froid (coupé en dés)", quantity: 150, unit: "g" },
            { item: "Crème liquide (pour stabiliser)", quantity: 1, unit: "c. à soupe", optional: true },
            { item: "Sel, poivre blanc", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Dans une petite casserole, faire réduire les échalotes avec le vin blanc et le vinaigre jusqu'à évaporation presque complète.",
            "Ajouter la crème (si utilisée). Retirer du feu.",
            "Incorporer le beurre froid, dé par dé, en fouettant vigoureusement. La sauce doit s'épaissir sans bouillir.",
            "Passer la sauce au tamis (facultatif). Servir immédiatement."
        ],
        nutrition: { calories: 350, proteins: 1, carbs: 5, fats: 35 },
        tags: ["sauce", "français", "gastronomique", "poisson"]
    },
    {
        title: "Sauce Hollandaise (Émulsion à base d'Œuf)",
        description: "Sauce mère française, chaude et mousseuse, faite de jaunes d'œufs, de beurre clarifié et de jus de citron, pour les œufs Bénédicte ou les asperges.",
        servings: 4,
        prepTime: 10,
        cookTime: 10,
        ingredients: [
            { item: "Beurre clarifié (fondu et tiède)", quantity: 150, unit: "g" },
            { item: "Jaunes d'œufs", quantity: 3, unit: "pièces" },
            { item: "Jus de citron frais", quantity: 1, unit: "c. à soupe" },
            { item: "Vinaigre de vin blanc", quantity: 0.5, unit: "c. à café" },
            { item: "Sel de Cayenne", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préparer le bain-marie (l'eau ne doit pas toucher le fond du bol).",
            "Dans le bol, fouetter les jaunes d'œufs, le jus de citron, le vinaigre, le sel et le poivre (facultatif). Fouetter jusqu'à épaississement (effet 'ruban').",
            "Retirer du bain-marie. Verser le beurre clarifié tiède en filet mince tout en fouettant continuellement jusqu'à ce que la sauce soit épaisse et onctueuse.",
            "Servir chaud (la sauce se sépare si elle est trop chaude)."
        ],
        nutrition: { calories: 400, proteins: 5, carbs: 1, fats: 40 },
        tags: ["sauce", "français", "classique", "technique"]
    },
    {
        title: "Croque-Monsieur (Bistro Classique)",
        description: "Sandwich de jambon et de fromage grillé, souvent nappé de béchamel et gratiné au four (croque-madame avec un œuf au plat).",
        servings: 2,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Pain de mie (tranches)", quantity: 4, unit: "pièces" },
            { item: "Jambon blanc", quantity: 2, unit: "tranches" },
            { item: "Fromage (emmental ou gruyère)", quantity: 80, unit: "g" },
            { item: "Béchamel (épaisse)", quantity: 4, unit: "c. à soupe" },
            { item: "Beurre", quantity: 10, unit: "g" }
        ],
        instructions: [
            "Préparer une béchamel épaisse et l'assaisonner de muscade.",
            "Beurrer les tranches de pain de mie. Placer une tranche, la napper de béchamel, ajouter une tranche de jambon et du fromage.",
            "Refermer avec la deuxième tranche. Napper le dessus de béchamel et parsemer de fromage râpé.",
            "Cuire au four à 200°C ou à la poêle/appareil à croque-monsieur jusqu'à ce que le dessus soit gratiné (10-15 min)."
        ],
        nutrition: { calories: 550, proteins: 30, carbs: 40, fats: 30 },
        tags: ["plat principal", "français", "bistro", "rapide"]
    },
    {
        title: "Salade Lyonnaise (Lardons, Croûtons, Œuf Poché)",
        description: "Salade de frisée (laitue), œuf poché, lardons croustillants et croûtons, assaisonnée d'une vinaigrette chaude.",
        servings: 2,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Frisée (Laitue)", quantity: 1, unit: "pièce" },
            { item: "Lardons fumés (épais)", quantity: 100, unit: "g" },
            { item: "Œufs frais", quantity: 2, unit: "pièces" },
            { item: "Pain (pour croûtons)", quantity: 2, unit: "tranches" },
            { item: "Vinaigre de vin rouge", quantity: 2, unit: "c. à soupe" },
            { item: "Ail (gousse), Huile d'olive", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire dorer les lardons. Retirer, garder la graisse. Faire dorer les croûtons dans la graisse de lardons.",
            "Préparer deux œufs pochés (eau frémissante vinaigrée).",
            "Dresser la salade. Préparer la vinaigrette chaude : chauffer la graisse restante, ajouter le vinaigre de vin rouge, l'ail haché (facultatif), sel et poivre.",
            "Verser la vinaigrette chaude sur la salade. Déposer l'œuf poché et les lardons/croûtons."
        ],
        nutrition: { calories: 350, proteins: 20, carbs: 15, fats: 25 },
        tags: ["entrée", "français", "régional", "classique"]
    },
    // 20 autres plats/méthodes françaises
    {
        title: "Crème Pâtissière (Base de Pâtisserie)",
        description: "Crème épaisse et onctueuse, base de nombreuses tartes et pâtisseries (éclairs, choux à la crème).",
        servings: 8,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Lait entier", quantity: 50, unit: "cl" },
            { item: "Sucre", quantity: 120, unit: "g" },
            { item: "Jaunes d'œufs", quantity: 4, unit: "pièces" },
            { item: "Maïzena ou Farine", quantity: 50, unit: "g" },
            { item: "Gousse de vanille ou extrait", quantity: 1, unit: "pièce" }
        ],
        instructions: [
            "Faire bouillir le lait avec la vanille. Retirer du feu et laisser infuser 10 min.",
            "Fouetter les jaunes d'œufs avec le sucre jusqu'à blanchiment. Ajouter la Maïzena.",
            "Verser le lait chaud (sans la vanille) sur le mélange œufs/sucre. Bien mélanger.",
            "Remettre dans la casserole et cuire à feu moyen en remuant constamment jusqu'à ce que la crème épaississe (environ 5 min après ébullition).",
            "Verser dans un plat, filmer au contact et laisser refroidir rapidement."
        ],
        tags: ["technique", "français", "pâtisserie", "crème"]
    },
    {
        title: "Velouté d'Asperges (Crème et Citron)",
        description: "Soupe d'asperges printanière, lisse et crémeuse, souvent servie froide ou tiède.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Asperges vertes ou blanches", quantity: 500, unit: "g" },
            { item: "Pomme de terre (pour la texture)", quantity: 1, unit: "pièce" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Bouillon de volaille ou légumes", quantity: 75, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Couper les asperges. Faire suer l'oignon dans le beurre. Ajouter les asperges et la pomme de terre en dés.",
            "Couvrir de bouillon. Cuire 15-20 min jusqu'à ce que les légumes soient tendres.",
            "Mixer très finement. Remettre sur le feu. Ajouter la crème, ajuster l'assaisonnement et servir."
        ],
        tags: ["entrée", "français", "soupe", "printemps"]
    },
    {
        title: "Sole au Fumet de Poisson et Vin Blanc",
        description: "Sole pochée dans un court-bouillon de vin blanc et de fumet, pour une chair délicate et un goût marin prononcé.",
        servings: 2,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Soles entières ou filets", quantity: 2, unit: "pièces" },
            { item: "Fumet de poisson", quantity: 20, unit: "cl" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Échalotes (ciselées)", quantity: 1, unit: "pièce" },
            { item: "Beurre ou huile", quantity: 1, unit: "c. à café" }
        ],
        instructions: [
            "Dans une poêle, faire suer l'échalote dans le beurre. Ajouter le vin blanc et le fumet de poisson.",
            "Porter à frémissement. Déposer la sole (ou les filets). Couvrir et cuire 8 à 12 min (pochage à couvert).",
            "Réduire le liquide de cuisson pour faire une sauce (facultatif : ajouter de la crème pour une sauce dieppoise)."
        ],
        tags: ["plat principal", "français", "poisson"]
    },
    {
        title: "Tarte aux Légumes du Soleil et Chèvre",
        description: "Tarte salée garnie d'une julienne de légumes d'été (courgettes, poivrons) et de chèvre frais, sur une base de moutarde.",
        servings: 6,
        prepTime: 25,
        cookTime: 35,
        ingredients: [
            { item: "Pâte brisée", quantity: 1, unit: "rouleau" },
            { item: "Courgettes, poivrons, tomates cerises", quantity: 600, unit: "g" },
            { item: "Fromage de chèvre frais ou bûche", quantity: 150, unit: "g" },
            { item: "Moutarde à l'ancienne ou forte", quantity: 1, unit: "c. à soupe" },
            { item: "Œufs, crème liquide (pour l'appareil)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Préchauffer le four à 180°C. Foncer le moule avec la pâte. Piquer le fond. Étaler la moutarde.",
            "Faire revenir les légumes coupés en julienne. Disposer les légumes sur le fond de tarte.",
            "Mélanger l'œuf et la crème (appareil). Assaisonner. Verser sur les légumes.",
            "Disposer le chèvre émietté ou en tranches. Cuire 30 à 35 min."
        ],
        tags: ["plat principal", "français", "tarte salée", "végétarien"]
    },
    {
        title: "Boudin Noir aux Pommes et Oignons Caramélisés",
        description: "Boudin noir poêlé, servi avec un accompagnement de pommes et d'oignons doucement caramélisés au beurre.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Boudin noir", quantity: 4, unit: "pièces" },
            { item: "Pommes (type Gala ou Golden)", quantity: 3, unit: "pièces" },
            { item: "Oignons jaunes (émincés)", quantity: 2, unit: "pièces" },
            { item: "Beurre", quantity: 30, unit: "g" },
            { item: "Sucre (pour caraméliser)", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Piquer le boudin. Dans une poêle, faire fondre 15g de beurre. Y faire dorer le boudin 10 min, en le retournant.",
            "Retirer le boudin, le maintenir au chaud. Dans la même poêle, faire fondre le reste du beurre.",
            "Faire revenir les oignons et les pommes en tranches. Ajouter le sucre (si utilisé). Cuire 10 min jusqu'à ce qu'ils soient tendres et caramélisés.",
            "Servir le boudin sur le lit de pommes et d'oignons."
        ],
        tags: ["plat principal", "français", "classique"]
    },
    // ANTIPASTI ET PLATS DE RUE
    {
        title: "Arancini au Ragoût (Boules de Riz Frites)",
        description: "Spécialité sicilienne : boules de risotto farcies de ragoût de viande et de mozzarella, panées et frites.",
        servings: 6,
        prepTime: 40,
        cookTime: 20,
        ingredients: [
            { item: "Risotto au safran (préalablement préparé)", quantity: 800, unit: "g" },
            { item: "Ragoût alla bolognese", quantity: 150, unit: "g" },
            { item: "Mozzarella (en dés)", quantity: 100, unit: "g" },
            { item: "Farine, Œufs, Chapelure (pour la panure)", quantity: 1, unit: "quantité suffisante" },
            { item: "Huile pour friture", quantity: 1, unit: "L" }
        ],
        instructions: [
            "Faire refroidir le risotto au safran. Former une boule de riz dans la main. Creuser un puits au centre.",
            "Garnir du ragoût et des dés de mozzarella. Refermer la boule de riz.",
            "Paner les arancini (farine > œuf > chapelure).",
            "Frire les arancini 5-7 min à 170°C jusqu'à ce qu'ils soient bien dorés. Servir très chaud."
        ],
        nutrition: { calories: 550, proteins: 20, carbs: 50, fats: 30 },
        tags: ["entrée", "italien", "sicilien", "friture"]
    },
    {
        title: "Vitello Tonnato (Veau Froid Sauce au Thon)",
        description: "Plat froid du Piémont : fines tranches de veau cuit, nappées d'une sauce crémeuse à base de thon, d'anchois et de mayonnaise.",
        servings: 6,
        prepTime: 30,
        cookTime: 60,
        ingredients: [
            { item: "Noix de veau (rôtie ou cuite)", quantity: 800, unit: "g" },
            { item: "Thon à l'huile (égoutté)", quantity: 200, unit: "g" },
            { item: "Mayonnaise (maison ou commerce)", quantity: 100, unit: "g" },
            { item: "Filets d'anchois", quantity: 4, unit: "pièces" },
            { item: "Câpres, jus de citron", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de veau (pour la cuisson)", quantity: 1, unit: "L" }
        ],
        instructions: [
            "Cuire le veau dans un bouillon (60 min). Laisser refroidir complètement. Couper en tranches très fines.",
            "Sauce Tonnato : Mixer le thon, les anchois, la mayonnaise, les câpres et un peu de jus de citron jusqu'à consistance lisse.",
            "Disposer les tranches de veau dans un plat. Napper généreusement de sauce Tonnato.",
            "Laisser reposer au réfrigérateur 12h avant de servir très frais."
        ],
        nutrition: { calories: 450, proteins: 35, carbs: 5, fats: 30 },
        tags: ["entrée", "italien", "piémontais", "froid"]
    },
    // PLATS DE PÂTES ET SAUCES RÉGIONALES
    {
        title: "Orecchiette con Cime di Rapa (Pouilles)",
        description: "Pâtes en forme de petites oreilles (Orecchiette) servies avec des feuilles de navet (cime di rapa) et une touche d'ail et de piment.",
        servings: 4,
        prepTime: 20,
        cookTime: 20,
        ingredients: [
            { item: "Orecchiette", quantity: 400, unit: "g" },
            { item: "Cime di Rapa (feuilles de navet)", quantity: 600, unit: "g" },
            { item: "Ail (gousses)", quantity: 3, unit: "pièces" },
            { item: "Piment (Peperoncino)", quantity: 1, unit: "pièce" },
            { item: "Filets d'anchois à l'huile", quantity: 4, unit: "pièces" },
            { item: "Huile d'olive extra vierge", quantity: 4, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les cime di rapa dans l'eau bouillante salée. Ajouter les orecchiette dans la même eau après 10 min et cuire ensemble 'al dente'.",
            "Faire chauffer l'huile d'olive, l'ail et le piment. Ajouter les filets d'anchois et les faire fondre (attention : ils se dissolvent facilement).",
            "Égoutter les pâtes et les légumes. Les verser dans la poêle avec l'huile parfumée. Sauter 2 min pour enrober."
        ],
        nutrition: { calories: 400, proteins: 15, carbs: 60, fats: 12 },
        tags: ["plat principal", "italien", "pâtes", "régional"]
    },
    {
        title: "Tiramisu Fraises et Mascarpone",
        description: "Variante printanière du tiramisu classique, remplaçant le café par un sirop de fraises pour tremper les biscuits.",
        servings: 6,
        prepTime: 25,
        cookTime: 0,
        ingredients: [
            { item: "Mascarpone", quantity: 500, unit: "g" },
            { item: "Œufs (jaunes et blancs)", quantity: 3, unit: "pièces" },
            { item: "Sucre", quantity: 100, unit: "g" },
            { item: "Biscuits cuillère", quantity: 24, unit: "pièces" },
            { item: "Purée de fraises ou sirop", quantity: 20, unit: "cl" },
            { item: "Fraises fraîches (coupées)", quantity: 150, unit: "g" }
        ],
        instructions: [
            "Préparer la crème mascarpone : mélanger jaunes, sucre, puis incorporer délicatement les blancs montés en neige.",
            "Tremper les biscuits dans le sirop de fraises. Disposer une première couche dans un plat.",
            "Recouvrir d'une couche de crème. Ajouter des fraises fraîches. Répéter l'opération.",
            "Terminer par une couche de crème. Mettre au réfrigérateur 6 heures."
        ],
        nutrition: { calories: 420, proteins: 10, carbs: 45, fats: 25 },
        tags: ["dessert", "italien", "variante", "fruit"]
    },
    {
        title: "Risotto Radicchio et Gorgonzola",
        description: "Risotto crémeux du Nord de l'Italie, combinant l'amertume du radicchio et la force du Gorgonzola (fromage bleu).",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Riz Arborio ou Carnaroli", quantity: 320, unit: "g" },
            { item: "Radicchio (légèrement poêlé)", quantity: 1, unit: "tête" },
            { item: "Gorgonzola (doux ou piquant)", quantity: 80, unit: "g" },
            { item: "Vin rouge (pour déglacer)", quantity: 10, unit: "cl" },
            { item: "Bouillon de légumes", quantity: 1.5, unit: "L" },
            { item: "Beurre, Parmesan", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire suer l'oignon. Ajouter le riz et le nacrer. Déglacer au vin rouge. Ajouter le radicchio coupé.",
            "Poursuivre la cuisson classique du risotto avec le bouillon chaud.",
            "Hors du feu, ajouter le beurre, le Parmesan et le Gorgonzola en morceaux. Mélanger vivement (mantecare).",
            "Servir rapidement."
        ],
        tags: ["plat principal", "italien", "risotto", "fromage"]
    }
];
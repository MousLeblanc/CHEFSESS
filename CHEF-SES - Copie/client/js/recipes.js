export default [

    // ====================================================================
    // 🥣 CATÉGORIE : SOUPES & POTAGES (Soupe, Velouté, Bouillon)
    // ====================================================================

    // RECETTE 12 : Velouté de Champignons Onctueux à la Crème
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
        nutrition: { calories: 200, proteins: 8, carbs: 12, fats: 14 },
        tags: ["soupe", "entrée", "champignons", "crémeux"]
    },
    // RECETTE 47 : Soupe de Tomates Maison
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
    // RECETTE 48 : Soupe de Potiron Douce et Veloutée
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
    // RECETTE 49 : Soupe de Petits Pois Onctueuse
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
    // RECETTE 88 : Waterzooi de Poulet à la Gantoise
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
        tags: ["plat principal", "soupe", "belge", "crémeux"]
    },
    // RECETTE 119 : Soupe à l'Oignon Gratinée
    {
        title: "Soupe à l'Oignon Gratinée",
        description: "Soupe réconfortante d'oignons caramélisés dans un bouillon, servie avec une tranche de pain grillée et du fromage gratiné.",
        servings: 4,
        prepTime: 15,
        cookTime: 45,
        ingredients: [
            { item: "Oignons jaunes (émincés)", quantity: 800, unit: "g" },
            { item: "Beurre", quantity: 50, unit: "g" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Bouillon de bœuf (chaud)", quantity: 1, unit: "L" },
            { item: "Tranches de pain (baguette)", quantity: 4, unit: "pièces" },
            { item: "Gruyère ou Comté râpé", quantity: 100, unit: "g" },
            { item: "Sel, poivre, thym", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire fondre le beurre dans une cocotte. Ajouter les oignons émincés. Cuire 25-30 min à feu très doux jusqu'à caramélisation (sans brûler).",
            "Saupoudrer de farine, mélanger. Déglacer au vin blanc, laisser réduire.",
            "Ajouter le bouillon, le thym, sel et poivre. Mijoter 15 min.",
            "Verser la soupe dans des bols allant au four. Déposer une tranche de pain et recouvrir de fromage. Gratiné sous le grill jusqu'à ce que le fromage soit fondu et doré."
        ],
        nutrition: { calories: 350, proteins: 15, carbs: 30, fats: 20 },
        tags: ["entrée", "soupe", "français", "classique"]
    },
    // RECETTE 178 : Velouté de Potimarron et Châtaignes
    {
        title: "Velouté de Potimarron et Châtaignes",
        description: "Soupe d'automne, naturellement douce et crémeuse, associant le potimarron à la saveur boisée des châtaignes.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Potimarron (sans le peler)", quantity: 800, unit: "g" },
            { item: "Châtaignes cuites", quantity: 150, unit: "g" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Bouillon de volaille ou légumes", quantity: 75, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl", optional: true },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Faire suer l'oignon dans le beurre. Ajouter le potimarron et les châtaignes.",
            "Couvrir de bouillon. Cuire 25-30 min jusqu'à tendreté.",
            "Mixer finement, ajouter la crème (si utilisée) et assaisonner. Servir avec quelques brisures de châtaignes."
        ],
        tags: ["soupe", "velouté", "automne", "français"]
    },
    // RECETTE 179 : Soupe Paysanne aux Légumes et Vermicelles
    {
        title: "Soupe Paysanne aux Légumes et Vermicelles",
        description: "Soupe épaisse et rustique, riche en légumes coupés en dés et en petites pâtes (vermicelles), très nourrissante.",
        servings: 6,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Carottes, poireaux, céleri (en dés)", quantity: 500, unit: "g" },
            { item: "Pommes de terre (en dés)", quantity: 200, unit: "g" },
            { item: "Bouillon de légumes ou de bœuf", quantity: 1.5, unit: "L" },
            { item: "Vermicelles ou petites pâtes", quantity: 50, unit: "g" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Huile d'olive ou beurre", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire suer l'oignon, l'ail et les légumes racines (carottes, céleri) dans l'huile.",
            "Ajouter les poireaux et les pommes de terre. Couvrir de bouillon. Cuire 30 min.",
            "Ajouter les vermicelles et cuire 5 min de plus. Servir chaud, saupoudré de persil."
        ],
        tags: ["soupe", "plat complet", "français", "légumes"]
    },
    // RECETTE 180 : Crème Du Barry (Velouté de Chou-fleur)
    {
        title: "Crème Du Barry (Velouté de Chou-fleur)",
        description: "Velouté de chou-fleur classique, très fin, enrichi d'un liaison à la crème fraîche et parfois d'un jaune d'œuf.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Chou-fleur (fleurons)", quantity: 800, unit: "g" },
            { item: "Bouillon de volaille ou lait", quantity: 75, unit: "cl" },
            { item: "Crème fraîche épaisse", quantity: 10, unit: "cl" },
            { item: "Pomme de terre (pour lier)", quantity: 1, unit: "petite" },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire le chou-fleur et la pomme de terre dans le bouillon ou le lait (30 min).",
            "Mixer finement et passer au tamis si nécessaire pour enlever les fibres.",
            "Remettre dans la casserole, ajouter la crème. Assaisonner de muscade et ajuster l'épaisseur."
        ],
        tags: ["soupe", "velouté", "français", "classique"]
    },
    // RECETTE 181 : Soupe de Poissons à la Rouille
    {
        title: "Soupe de Poissons à la Rouille",
        description: "Soupe de poissons de roche (ou de filets), très riche et épicée, servie avec des croûtons frottés à l'ail et la fameuse rouille.",
        servings: 6,
        prepTime: 40,
        cookTime: 60,
        ingredients: [
            { item: "Filets de poisson blanc (rascasse, congre, lotte)", quantity: 1, unit: "kg" },
            { item: "Carottes, poireaux, oignons", quantity: 1, unit: "quantité suffisante" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Huile d'olive, ail, fenouil, safran", quantity: 1, unit: "quantité suffisante" },
            { item: "Pour la Rouille : Ail, piment, jaune d'œuf, huile d'olive", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir les légumes (sofrito), ajouter le poisson et le safran. Couvrir d'eau et cuire 40 min.",
            "Mixer et passer le bouillon au tamis. Maintenir au chaud.",
            "Rouille : Monter une mayonnaise avec ail, jaune d'œuf, huile d'olive, et ajouter du piment fort et du safran.",
            "Servir la soupe avec les croûtons, la rouille et du fromage râpé."
        ],
        tags: ["soupe", "plat principal", "français", "régional"]
    },
    // RECETTE 182 : Velouté de Poireaux et Pommes de Terre (Vichyssoise)
    {
        title: "Velouté de Poireaux et Pommes de Terre (Vichyssoise)",
        description: "Potage crémeux et doux, souvent servi froid (Vichyssoise) ou chaud, à base de blancs de poireaux et pommes de terre.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Blancs de poireaux (émincés)", quantity: 400, unit: "g" },
            { item: "Pommes de terre (en dés)", quantity: 300, unit: "g" },
            { item: "Bouillon ou eau", quantity: 75, unit: "cl" },
            { item: "Crème fraîche liquide", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Ciboulette (pour servir)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire suer les poireaux dans le beurre sans coloration. Ajouter les pommes de terre et le bouillon.",
            "Cuire 20 min. Mixer finement, ajouter la crème. Servir froid (Vichyssoise) ou chaud, garni de ciboulette."
        ],
        tags: ["soupe", "velouté", "français", "froid"]
    },
    // RECETTE 183 : Potage Saint-Germain (Purée de Petits Pois)
    {
        title: "Potage Saint-Germain (Purée de Petits Pois)",
        description: "Potage onctueux de petits pois frais ou surgelés, souvent lié avec de la menthe et du bouillon.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Petits pois (frais ou surgelés)", quantity: 500, unit: "g" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Feuilles de menthe fraîche", quantity: 10, unit: "pièces" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Crème liquide (facultatif)", quantity: 5, unit: "cl" }
        ],
        instructions: [
            "Faire suer l'oignon. Ajouter les petits pois et le bouillon. Cuire 15 min.",
            "Ajouter la menthe. Mixer le tout. Remettre dans la casserole, ajouter la crème, assaisonner."
        ],
        tags: ["soupe", "velouté", "français", "printemps"]
    },
    // RECETTE 184 : Soupe au Pistou (Provençale)
    {
        title: "Soupe au Pistou (Provençale)",
        description: "Soupe de légumes et de haricots blancs, servie avec le pistou (équivalent du pesto, sans pignons) ajouté au dernier moment.",
        servings: 6,
        prepTime: 30,
        cookTime: 50,
        ingredients: [
            { item: "Pommes de terre, carottes, haricots verts (en dés)", quantity: 800, unit: "g" },
            { item: "Haricots blancs secs (cuits) ou en conserve", quantity: 200, unit: "g" },
            { item: "Pâtes courtes (coquillettes, pipe)", quantity: 50, unit: "g" },
            { item: "Pistou : Basilic, ail, huile d'olive, parmesan (facultatif)", quantity: 4, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les légumes racines dans l'eau salée ou le bouillon (30 min).",
            "Ajouter les légumes verts, les haricots blancs et les pâtes. Cuire 10 min.",
            "Servir chaud, chaque bol étant garni d'une cuillère à café de pistou frais."
        ],
        tags: ["soupe", "plat complet", "français", "régional"]
    },
    // RECETTE 185 : Velouté de Carottes au Cumin et Coriandre
    {
        title: "Velouté de Carottes au Cumin et Coriandre",
        description: "Soupe de carottes simple, rehaussée par la saveur chaude du cumin et la fraîcheur de la coriandre.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Carottes (en rondelles)", quantity: 700, unit: "g" },
            { item: "Pomme de terre (pour lier)", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Cumin en poudre", quantity: 1, unit: "c. à café" },
            { item: "Coriandre fraîche (pour décorer)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire suer l'oignon. Ajouter les carottes, la pomme de terre et le cumin. Cuire 1 min.",
            "Couvrir de bouillon. Cuire 20 min. Mixer finement. Servir avec un filet d'huile d'olive et de la coriandre fraîche."
        ],
        tags: ["soupe", "velouté", "français", "légumes"]
    },
    // RECETTE 186 : Potage Crème de Tomates au Basilic
    {
        title: "Potage Crème de Tomates au Basilic",
        description: "Soupe de tomates classique, très douce et onctueuse grâce à l'ajout de crème et parfumée au basilic frais.",
        servings: 4,
        prepTime: 10,
        cookTime: 25,
        ingredients: [
            { item: "Tomates mûres ou concassées", quantity: 1, unit: "kg" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de légumes", quantity: 30, unit: "cl" },
            { item: "Crème liquide entière", quantity: 15, unit: "cl" },
            { item: "Basilic frais", quantity: 1, unit: "poignée" },
            { item: "Sucre (pour corriger l'acidité)", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Faire suer l'oignon et l'ail. Ajouter les tomates, le bouillon et le sucre. Mijoter 20 min.",
            "Mixer finement. Remettre dans la casserole. Ajouter la crème. Servir avec les feuilles de basilic frais."
        ],
        tags: ["soupe", "velouté", "français", "classique"]
    },
    // RECETTE 187 : Soupe à l'Ail Douce (Version Paysanne)
    {
        title: "Soupe à l'Ail Douce (Version Paysanne)",
        description: "Potage simple à base d'ail et de bouillon, lié à la fin avec un jaune d'œuf pour l'onctuosité.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Ail (gousses, pelées)", quantity: 8, unit: "pièces" },
            { item: "Bouillon de volaille ou eau", quantity: 1, unit: "L" },
            { item: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
            { item: "Jaune d'œuf", quantity: 1, unit: "pièce", optional: true }
        ],
        instructions: [
            "Faire blanchir l'ail 3 fois. Cuire l'ail blanchi dans le bouillon avec le thym pendant 15 min.",
            "Mixer finement. Pour lier : Retirer du feu, ajouter le jaune d'œuf et fouetter rapidement."
        ],
        tags: ["soupe", "français", "régional", "sain"]
    },

    // ====================================================================
    // 🍲 CATÉGORIE : PLATS PRINCIPAUX - VÉGÉTARIENS
    // ====================================================================

    // RECETTE 45 : Cannellonis Ricotta-Épinards et Sauce Tomate Douce
    {
        title: "Cannellonis Ricotta-Épinards et Sauce Tomate Douce",
        description: "Cannellonis farcis d’une farce douce à la ricotta et aux épinards, nappés d’une sauce tomate lisse et gratinés au four.",
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
    // RECETTE 50 : Curry de Légumes au Lait de Coco Doux
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
    // RECETTE 51 : Lasagnes aux Épinards et Ricotta
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
    // RECETTE 52 : Galettes de Lentilles Corail et Curry
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
    // RECETTE 53 : Buddha Bowl Végétal et Quinoa
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
    // RECETTE 54 : Tacos Végétariens aux Haricots Noirs Épicés
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

    // ====================================================================
    // 🍮 CATÉGORIE : DESSERT & GOÛTER
    // ====================================================================

    // RECETTE 4 : Tartelettes Exotiques à l'Ananas et Crème Pâtissière
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
    // RECETTE 10 : Croûte aux Fruits Frais et Crème Pâtissière
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
    // RECETTE 39 : Crème de Millet au Lait et Vanille
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
    // RECETTE 41 : Cake à l’Orange Moelleux et Parfumé
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
    // RECETTE 83 : Tiramisu Classique aux Biscuits Cuillère
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

    // ====================================================================
    // 🥣 BLOC 1 : SOUPES & POTAGES (Soupe, Velouté, Consommé)
    // ====================================================================

    // RECETTE 12 : Velouté de Champignons Onctueux à la Crème
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
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Émincer l’oignon et l’ail. Nettoyer et couper les champignons en morceaux.",
            "Faire fondre le beurre. Ajouter l’oignon et l’ail, cuire 2-3 minutes.",
            "Ajouter les champignons, faire dorer 5 minutes. Saupoudrer de farine, mélanger et cuire 1 minute.",
            "Verser le bouillon chaud, laisser mijoter 15 minutes.",
            "Mixer jusqu’à obtenir une texture lisse. Ajouter la crème fraîche, saler, poivrer et mélanger bien."
        ],
        nutrition: { calories: 200, proteins: 8, carbs: 12, fats: 14 },
        tags: ["soupe", "entrée", "champignons", "crémeux"]
    },
    // RECETTE 47 : Soupe de Tomates Maison
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
            { item: "Sucre", quantity: 0.5, unit: "c. à café", optional: true }
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
    // RECETTE 48 : Soupe de Potiron Douce et Veloutée
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
            { item: "Crème fraîche liquide", quantity: 3, unit: "c. à soupe", optional: true }
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
    // RECETTE 49 : Soupe de Petits Pois Onctueuse
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
            { item: "Crème fraîche", quantity: 2, unit: "c. à soupe", optional: true }
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
    // RECETTE 88 : Waterzooi de Poulet à la Gantoise
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
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Faire suer les légumes (poireaux, carottes, céleri) dans le beurre.",
            "Ajouter le poulet et le bouillon. Laisser mijoter 30 minutes. Retirer le poulet et l'effilocher.",
            "Dans un bol, mélanger les jaunes d'œufs et la crème. Retirer la soupe du feu.",
            "Verser une louche de bouillon sur le mélange crème/jaune, puis reverser le tout dans la marmite en remuant constamment pour lier la sauce (sans faire bouillir).",
            "Ajouter le poulet effiloché. Servir aussitôt avec du pain grillé."
        ],
        tags: ["plat principal", "soupe", "belge", "crémeux"]
    },
    // RECETTE 119 : Soupe à l'Oignon Gratinée
    {
        title: "Soupe à l'Oignon Gratinée",
        description: "Soupe réconfortante d'oignons caramélisés dans un bouillon, servie avec une tranche de pain grillée et du fromage gratiné.",
        servings: 4,
        prepTime: 15,
        cookTime: 45,
        ingredients: [
            { item: "Oignons jaunes (émincés)", quantity: 800, unit: "g" },
            { item: "Beurre", quantity: 50, unit: "g" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Vin blanc sec", quantity: 10, unit: "cl" },
            { item: "Bouillon de bœuf (chaud)", quantity: 1, unit: "L" },
            { item: "Tranches de pain (baguette)", quantity: 4, unit: "pièces" },
            { item: "Gruyère ou Comté râpé", quantity: 100, unit: "g" }
        ],
        instructions: [
            "Faire fondre le beurre dans une cocotte. Ajouter les oignons émincés. Cuire 25-30 min à feu très doux jusqu'à caramélisation (sans brûler).",
            "Saupoudrer de farine, mélanger. Déglacer au vin blanc, laisser réduire.",
            "Ajouter le bouillon, le thym, sel et poivre. Mijoter 15 min.",
            "Verser la soupe dans des bols allant au four. Déposer une tranche de pain et recouvrir de fromage. Gratiné sous le grill jusqu'à ce que le fromage soit fondu et doré."
        ],
        nutrition: { calories: 350, proteins: 15, carbs: 30, fats: 20 },
        tags: ["entrée", "soupe", "français", "classique"]
    },
    // RECETTE 178 : Velouté de Potimarron et Châtaignes
    {
        title: "Velouté de Potimarron et Châtaignes",
        description: "Soupe d'automne, naturellement douce et crémeuse, associant le potimarron à la saveur boisée des châtaignes.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Potimarron (sans le peler)", quantity: 800, unit: "g" },
            { item: "Châtaignes cuites", quantity: 150, unit: "g" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Bouillon de volaille ou légumes", quantity: 75, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl", optional: true },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Faire suer l'oignon dans le beurre. Ajouter le potimarron et les châtaignes.",
            "Couvrir de bouillon. Cuire 25-30 min jusqu'à tendreté.",
            "Mixer finement, ajouter la crème (si utilisée) et assaisonner. Servir avec quelques brisures de châtaignes."
        ],
        tags: ["soupe", "velouté", "automne", "français"]
    },
    // RECETTE 179 : Soupe Paysanne aux Légumes et Vermicelles
    {
        title: "Soupe Paysanne aux Légumes et Vermicelles",
        description: "Soupe épaisse et rustique, riche en légumes coupés en dés et en petites pâtes (vermicelles), très nourrissante.",
        servings: 6,
        prepTime: 20,
        cookTime: 40,
        ingredients: [
            { item: "Carottes, poireaux, céleri (en dés)", quantity: 500, unit: "g" },
            { item: "Pommes de terre (en dés)", quantity: 200, unit: "g" },
            { item: "Bouillon de légumes ou de bœuf", quantity: 1.5, unit: "L" },
            { item: "Vermicelles ou petites pâtes", quantity: 50, unit: "g" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Huile d'olive ou beurre", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire suer l'oignon, l'ail et les légumes racines (carottes, céleri) dans l'huile.",
            "Ajouter les poireaux et les pommes de terre. Couvrir de bouillon. Cuire 30 min.",
            "Ajouter les vermicelles et cuire 5 min de plus. Servir chaud, saupoudré de persil."
        ],
        tags: ["soupe", "plat complet", "français", "légumes"]
    },
    // RECETTE 180 : Crème Du Barry (Velouté de Chou-fleur)
    {
        title: "Crème Du Barry (Velouté de Chou-fleur)",
        description: "Velouté de chou-fleur classique, très fin, enrichi d'un liaison à la crème fraîche et parfois d'un jaune d'œuf.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Chou-fleur (fleurons)", quantity: 800, unit: "g" },
            { item: "Bouillon de volaille ou lait", quantity: 75, unit: "cl" },
            { item: "Crème fraîche épaisse", quantity: 10, unit: "cl" },
            { item: "Pomme de terre (pour lier)", quantity: 1, unit: "petite" },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire le chou-fleur et la pomme de terre dans le bouillon ou le lait (30 min).",
            "Mixer finement et passer au tamis si nécessaire pour enlever les fibres.",
            "Remettre dans la casserole, ajouter la crème. Assaisonner de muscade et ajuster l'épaisseur."
        ],
        tags: ["soupe", "velouté", "français", "classique"]
    },
    // RECETTE 181 : Soupe de Poissons à la Rouille
    {
        title: "Soupe de Poissons à la Rouille",
        description: "Soupe de poissons de roche (ou de filets), très riche et épicée, servie avec des croûtons frottés à l'ail et la fameuse rouille.",
        servings: 6,
        prepTime: 40,
        cookTime: 60,
        ingredients: [
            { item: "Filets de poisson blanc (rascasse, congre, lotte)", quantity: 1, unit: "kg" },
            { item: "Carottes, poireaux, oignons", quantity: 1, unit: "quantité suffisante" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Huile d'olive, ail, fenouil, safran", quantity: 1, unit: "quantité suffisante" },
            { item: "Pour la Rouille : Ail, piment, jaune d'œuf, huile d'olive", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir les légumes (sofrito), ajouter le poisson et le safran. Couvrir d'eau et cuire 40 min.",
            "Mixer et passer le bouillon au tamis. Maintenir au chaud.",
            "Rouille : Monter une mayonnaise avec ail, jaune d'œuf, huile d'olive, et ajouter du piment fort et du safran.",
            "Servir la soupe avec les croûtons, la rouille et du fromage râpé."
        ],
        tags: ["soupe", "plat principal", "français", "régional"]
    },
    // RECETTE 182 : Velouté de Poireaux et Pommes de Terre (Vichyssoise)
    {
        title: "Velouté de Poireaux et Pommes de Terre (Vichyssoise)",
        description: "Potage crémeux et doux, souvent servi froid (Vichyssoise) ou chaud, à base de blancs de poireaux et pommes de terre.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Blancs de poireaux (émincés)", quantity: 400, unit: "g" },
            { item: "Pommes de terre (en dés)", quantity: 300, unit: "g" },
            { item: "Bouillon ou eau", quantity: 75, unit: "cl" },
            { item: "Crème fraîche liquide", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" },
            { item: "Ciboulette (pour servir)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire suer les poireaux dans le beurre sans coloration. Ajouter les pommes de terre et le bouillon.",
            "Cuire 20 min. Mixer finement, ajouter la crème. Servir froid (Vichyssoise) ou chaud, garni de ciboulette."
        ],
        tags: ["soupe", "velouté", "français", "froid"]
    },
    // RECETTE 183 : Potage Saint-Germain (Purée de Petits Pois)
    {
        title: "Potage Saint-Germain (Purée de Petits Pois)",
        description: "Potage onctueux de petits pois frais ou surgelés, souvent lié avec de la menthe et du bouillon.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Petits pois (frais ou surgelés)", quantity: 500, unit: "g" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Feuilles de menthe fraîche", quantity: 10, unit: "pièces" },
            { item: "Oignon ou échalote", quantity: 1, unit: "pièce" },
            { item: "Crème liquide (facultatif)", quantity: 5, unit: "cl" }
        ],
        instructions: [
            "Faire suer l'oignon. Ajouter les petits pois et le bouillon. Cuire 15 min.",
            "Ajouter la menthe. Mixer le tout. Remettre dans la casserole, ajouter la crème, assaisonner."
        ],
        tags: ["soupe", "velouté", "français", "printemps"]
    },
    // RECETTE 184 : Soupe au Pistou (Provençale)
    {
        title: "Soupe au Pistou (Provençale)",
        description: "Soupe de légumes et de haricots blancs, servie avec le pistou (équivalent du pesto, sans pignons) ajouté au dernier moment.",
        servings: 6,
        prepTime: 30,
        cookTime: 50,
        ingredients: [
            { item: "Pommes de terre, carottes, haricots verts (en dés)", quantity: 800, unit: "g" },
            { item: "Haricots blancs secs (cuits) ou en conserve", quantity: 200, unit: "g" },
            { item: "Pâtes courtes (coquillettes, pipe)", quantity: 50, unit: "g" },
            { item: "Pistou : Basilic, ail, huile d'olive, parmesan (facultatif)", quantity: 4, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les légumes racines dans l'eau salée ou le bouillon (30 min).",
            "Ajouter les légumes verts, les haricots blancs et les pâtes. Cuire 10 min.",
            "Servir chaud, chaque bol étant garni d'une cuillère à café de pistou frais."
        ],
        tags: ["soupe", "plat complet", "français", "régional"]
    },
    // RECETTE 185 : Velouté de Carottes au Cumin et Coriandre
    {
        title: "Velouté de Carottes au Cumin et Coriandre",
        description: "Soupe de carottes simple, rehaussée par la saveur chaude du cumin et la fraîcheur de la coriandre.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Carottes (en rondelles)", quantity: 700, unit: "g" },
            { item: "Pomme de terre (pour lier)", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Cumin en poudre", quantity: 1, unit: "c. à café" },
            { item: "Coriandre fraîche (pour décorer)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire suer l'oignon. Ajouter les carottes, la pomme de terre et le cumin. Cuire 1 min.",
            "Couvrir de bouillon. Cuire 20 min. Mixer finement. Servir avec un filet d'huile d'olive et de la coriandre fraîche."
        ],
        tags: ["soupe", "velouté", "français", "légumes"]
    },
    // RECETTE 186 : Potage Crème de Tomates au Basilic
    {
        title: "Potage Crème de Tomates au Basilic",
        description: "Soupe de tomates classique, très douce et onctueuse grâce à l'ajout de crème et parfumée au basilic frais.",
        servings: 4,
        prepTime: 10,
        cookTime: 25,
        ingredients: [
            { item: "Tomates mûres ou concassées", quantity: 1, unit: "kg" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de légumes", quantity: 30, unit: "cl" },
            { item: "Crème liquide entière", quantity: 15, unit: "cl" },
            { item: "Basilic frais", quantity: 1, unit: "poignée" },
            { item: "Sucre (pour corriger l'acidité)", quantity: 1, unit: "c. à café", optional: true }
        ],
        instructions: [
            "Faire suer l'oignon et l'ail. Ajouter les tomates, le bouillon et le sucre. Mijoter 20 min.",
            "Mixer finement. Remettre dans la casserole. Ajouter la crème. Servir avec les feuilles de basilic frais."
        ],
        tags: ["soupe", "velouté", "français", "classique"]
    },
    // RECETTE 187 : Soupe à l'Ail Douce (Version Paysanne)
    {
        title: "Soupe à l'Ail Douce (Version Paysanne)",
        description: "Potage simple à base d'ail et de bouillon, lié à la fin avec un jaune d'œuf pour l'onctuosité.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Ail (gousses, pelées)", quantity: 8, unit: "pièces" },
            { item: "Bouillon de volaille ou eau", quantity: 1, unit: "L" },
            { item: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
            { item: "Jaune d'œuf", quantity: 1, unit: "pièce", optional: true }
        ],
        instructions: [
            "Faire blanchir l'ail 3 fois. Cuire l'ail blanchi dans le bouillon avec le thym pendant 15 min.",
            "Mixer finement. Pour lier : Retirer du feu, ajouter le jaune d'œuf et fouetter rapidement."
        ],
        tags: ["soupe", "français", "régional", "sain"]
    },
    // RECETTE 188 : Gaspacho Andalou (Soupe Froide Espagnole)
    {
        title: "Gaspacho Andalou (Soupe Froide Espagnole)",
        description: "Soupe de légumes crus (tomate, concombre, poivron) mixés, servie très froide et relevée au vinaigre et à l'huile d'olive.",
        servings: 4,
        prepTime: 20,
        cookTime: 0,
        ingredients: [
            { item: "Tomates mûres", quantity: 1, unit: "kg" },
            { item: "Concombre", quantity: 0.5, unit: "pièce" },
            { item: "Poivron vert", quantity: 0.5, unit: "pièce" },
            { item: "Ail", quantity: 1, unit: "gousse" },
            { item: "Pain de mie (rassis)", quantity: 1, unit: "tranche" },
            { item: "Huile d'olive extra vierge", quantity: 5, unit: "cl" },
            { item: "Vinaigre de Xérès (ou de vin rouge)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Mélanger tous les légumes, l'ail et le pain trempé dans l'eau. Mixer le tout très finement.",
            "Ajouter l'huile d'olive et le vinaigre. Assaisonner. Réfrigérer au moins 4 heures."
        ],
        tags: ["soupe", "espagnol", "froid", "végétarien"]
    },
    // RECETTE 189 : Bortsch (Soupe de Betteraves Ukrainienne/Russe)
    {
        title: "Bortsch (Soupe de Betteraves Ukrainienne/Russe)",
        description: "Soupe épaisse et légèrement aigre-douce, riche en légumes (betteraves, chou, carottes) et servie avec de la crème fraîche.",
        servings: 6,
        prepTime: 30,
        cookTime: 60,
        ingredients: [
            { item: "Betteraves cuites ou crues", quantity: 400, unit: "g" },
            { item: "Chou blanc (émincé)", quantity: 200, unit: "g" },
            { item: "Carottes, pommes de terre, oignons", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de bœuf ou de légumes", quantity: 2, unit: "L" },
            { item: "Vinaigre de vin blanc ou jus de citron", quantity: 2, unit: "c. à soupe" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à soupe" },
            { item: "Smetana ou Crème fraîche (pour servir)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire mijoter la viande (si utilisée) et les légumes racines dans le bouillon (45 min).",
            "Faire sauter les betteraves et les choux avec le concentré de tomate et le vinaigre (pour fixer la couleur).",
            "Ajouter les betteraves/choux au bouillon. Cuire 15 min de plus. Servir chaud avec une cuillère de crème fraîche."
        ],
        tags: ["soupe", "international", "légumes", "complet"]
    },
    // RECETTE 190 : Soupe de Tortilla (Mexicaine)
    {
        title: "Soupe de Tortilla (Mexicaine)",
        description: "Soupe de poulet et de tomate, garnie d'avocat, de fromage, de crème fraîche et de lanières de tortillas de maïs frites et croustillantes.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Bouillon de poulet", quantity: 1, unit: "L" },
            { item: "Tomates (en dés)", quantity: 400, unit: "g" },
            { item: "Blanc de poulet cuit (effiloché)", quantity: 200, unit: "g" },
            { item: "Tortillas de maïs (pour les lanières)", quantity: 4, unit: "pièces" },
            { item: "Avocat, fromage râpé, crème fraîche", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir l'oignon et l'ail. Ajouter les tomates et le bouillon. Mijoter 20 min.",
            "Faire frire les tortillas coupées en lanières.",
            "Ajouter le poulet effiloché au bouillon chaud. Servir la soupe garnie d'avocat, de fromage, de crème fraîche et des lanières de tortillas croustillantes."
        ],
        tags: ["soupe", "international", "mexicain", "complet"]
    },
    // RECETTE 191 : Soupe Pho (Bouillon Vietnamien aux Nouilles)
    {
        title: "Soupe Pho (Bouillon Vietnamien aux Nouilles)",
        description: "Bouillon vietnamien clair et très parfumé (anis étoilé, gingembre), servi avec des nouilles de riz, du bœuf cru ou cuit et des herbes fraîches.",
        servings: 4,
        prepTime: 40,
        cookTime: 120,
        ingredients: [
            { item: "Os de bœuf ou bouillon de bœuf", quantity: 2, unit: "L" },
            { item: "Gingembre, Anis étoilé, Cannelle", quantity: 1, unit: "quantité suffisante" },
            { item: "Sauce poisson (Nuoc Mâm)", quantity: 2, unit: "c. à soupe" },
            { item: "Nouilles de riz (plates)", quantity: 250, unit: "g" },
            { item: "Bœuf (très fines tranches crues ou cuites)", quantity: 200, unit: "g" },
            { item: "Garniture : Feuilles de menthe, basilic thai, coriandre, germes de soja", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Préparer le bouillon : Faire mijoter le bouillon avec les épices grillées, le gingembre et la sauce poisson (2h). Filtrer.",
            "Cuire les nouilles de riz.",
            "Dans des bols, disposer les nouilles, les tranches de bœuf crues (si utilisées) et les herbes. Verser le bouillon très chaud par-dessus."
        ],
        tags: ["soupe", "international", "vietnamien", "complet"]
    },
    // RECETTE 192 : Soupe de Lentilles Corail au Curry
    {
        title: "Soupe de Lentilles Corail au Curry",
        description: "Soupe épaisse et rapide, naturellement crémeuse, à base de lentilles corail, lait de coco et épices indiennes.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Lentilles corail (sèches)", quantity: 200, unit: "g" },
            { item: "Lait de coco", quantity: 20, unit: "cl" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Poudre de curry doux", quantity: 1, unit: "c. à soupe" },
            { item: "Oignon, Ail, Gingembre", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Rincer les lentilles. Faire revenir l'oignon, l'ail et le gingembre. Ajouter le curry et cuire 1 min.",
            "Ajouter les lentilles et le bouillon. Cuire 20 min. Ajouter le lait de coco. Mixer pour une texture lisse (facultatif)."
        ],
        tags: ["soupe", "international", "légumineuses", "végétarien"]
    },
    // RECETTE 193 : Soupe aux Haricots Noirs (Frijoles Cubains)
    {
        title: "Soupe aux Haricots Noirs (Frijoles Cubains)",
        description: "Soupe épaisse et fumée de haricots noirs, riche en cumin, ail et origan, souvent servie avec du riz et de la crème fraîche.",
        servings: 6,
        prepTime: 30,
        cookTime: 90,
        ingredients: [
            { item: "Haricots noirs secs", quantity: 300, unit: "g" },
            { item: "Oignon, Poivron vert, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Cumin en poudre, Origan", quantity: 1, unit: "c. à café" },
            { item: "Bouillon de légumes ou eau", quantity: 2, unit: "L" },
            { item: "Vinaigre de cidre (pour servir)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les haricots avec l'eau/bouillon (90 min). Préparer un sofrito avec oignon, poivron, ail, cumin et origan. L'ajouter aux haricots.",
            "Mixer partiellement les haricots pour épaissir. Servir avec une touche de vinaigre."
        ],
        tags: ["soupe", "international", "légumineuses", "complet"]
    },
    // RECETTE 194 : Soupe de Pois Cassés (avec Lardons Fumé)
    {
        title: "Soupe de Pois Cassés (avec Lardons Fumé)",
        description: "Soupe très épaisse et réconfortante, souvent liée avec de la poitrine fumée ou des saucisses.",
        servings: 4,
        prepTime: 20,
        cookTime: 75,
        ingredients: [
            { item: "Pois cassés secs", quantity: 300, unit: "g" },
            { item: "Poitrine fumée ou lardons", quantity: 100, unit: "g" },
            { item: "Carotte, Oignon, Poireau", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de volaille ou eau", quantity: 1.5, unit: "L" }
        ],
        instructions: [
            "Faire dorer la poitrine fumée (lardons). Retirer et réserver. Faire suer les légumes dans la graisse.",
            "Ajouter les pois cassés et le bouillon. Cuire 1h à 1h15 jusqu'à ce que les pois soient réduits en purée. Servir avec les lardons croustillants."
        ],
        tags: ["soupe", "hiver", "légumineuses", "français"]
    },
    // RECETTE 195 : Consommé de Volaille Clarifié (Technique)
    {
        title: "Consommé de Volaille Clarifié (Technique)",
        description: "Bouillon de volaille très clair et fin, obtenu par une filtration et une clarification aux blancs d'œufs.",
        servings: 4,
        prepTime: 30,
        cookTime: 120,
        ingredients: [
            { item: "Bouillon de volaille (préalablement mijoté)", quantity: 1, unit: "L" },
            { item: "Blanc de poulet haché ou mixé", quantity: 100, unit: "g" },
            { item: "Blancs d'œufs", quantity: 2, unit: "pièces" },
            { item: "Carottes, céleri, poireaux (en brunoise)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Mélanger le poulet haché, les blancs d'œufs et les légumes dans le bouillon froid.",
            "Chauffer très doucement sans remuer. Maintenir à feu très doux 1h30.",
            "Filtrer le consommé très doucement à travers une étamine pour obtenir un liquide parfaitement transparent."
        ],
        tags: ["soupe", "technique", "gastronomique", "sain"]
    },
    // RECETTE 196 : Soupe de Cresson et Pommes de Terre
    {
        title: "Soupe de Cresson et Pommes de Terre",
        description: "Soupe verte, légèrement poivrée et revigorante, grâce au cresson, liée par la pomme de terre.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Cresson (feuilles et tiges)", quantity: 2, unit: "bouquets" },
            { item: "Pommes de terre", quantity: 300, unit: "g" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Crème ou jaune d'œuf (pour lier)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire les pommes de terre. Ajouter le cresson dans les 5 dernières minutes. Mixer finement avec le bouillon.",
            "Lier à la crème ou au jaune d'œuf (hors du feu). Assaisonner."
        ],
        tags: ["soupe", "velouté", "printemps", "sain"]
    },
    // RECETTE 197 : Bouillon Dashi (Base Japonaise)
    {
        title: "Bouillon Dashi (Base Japonaise)",
        description: "Bouillon de base de la cuisine japonaise, très umami, fait d'algue kombu et de flocons de bonite séchée (katsuobushi).",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Eau", quantity: 1, unit: "L" },
            { item: "Kombu (algue séchée)", quantity: 10, unit: "g" },
            { item: "Katsuobushi (flocons de bonite séchée)", quantity: 10, unit: "g" }
        ],
        instructions: [
            "Placer le kombu dans l'eau. Chauffer doucement jusqu'à frémissement. Retirer le kombu.",
            "Retirer du feu. Ajouter les flocons de bonite. Laisser infuser 5 min. Filtrer le bouillon à travers une étamine."
        ],
        tags: ["soupe", "technique", "japonais", "sain"]
    },
    // RECETTE 198 : Soupe de Ravioles (Rapide et Goûteuse)
    {
        title: "Soupe de Ravioles (Rapide et Goûteuse)",
        description: "Consommé de volaille servi avec des ravioles (du Dauphiné ou chinoises) pour un plat réconfortant et rapide.",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Ravioles du Dauphiné (plaques)", quantity: 2, unit: "pièces" },
            { item: "Bouillon de volaille clair (chaud)", quantity: 1.2, unit: "L" },
            { item: "Carottes (en fine julienne)", quantity: 1, unit: "pièce" },
            { item: "Ciboulette ou persil", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Porter le bouillon de volaille à frémissement. Ajouter la julienne de carottes et cuire 5 min.",
            "Ajouter les carrés de ravioles. Cuire 1 à 2 min (jusqu'à ce qu'ils remontent à la surface). Servir aussitôt."
        ],
        tags: ["soupe", "rapide", "français", "complet"]
    },
    // RECETTE 199 : Soupe à l'Orge Perlé (Épaisse et Rustique)
    {
        title: "Soupe à l'Orge Perlé (Épaisse et Rustique)",
        description: "Soupe traditionnelle épaisse, utilisant l'orge pour un effet liant, souvent garnie de légumes racines.",
        servings: 6,
        prepTime: 20,
        cookTime: 90,
        ingredients: [
            { item: "Orge perlé", quantity: 150, unit: "g" },
            { item: "Bouillon de bœuf ou de légumes", quantity: 1.5, unit: "L" },
            { item: "Carottes, céleri, poireaux (en dés)", quantity: 500, unit: "g" },
            { item: "Jambon fumé (en dés)", quantity: 50, unit: "g", optional: true }
        ],
        instructions: [
            "Faire revenir les légumes et l'orge. Couvrir de bouillon. Cuire 1h30. L'orge doit être très tendre et avoir épaissi le bouillon.",
            "Servir chaud. Ajouter le jambon fumé (facultatif) ou des croûtons."
        ],
        tags: ["soupe", "hiver", "complet", "international"]
    },
    // RECETTE 200 : Minestrone de Légumes et Pâtes (Complet)
    {
        title: "Minestrone de Légumes et Pâtes (Complet)",
        description: "Soupe repas italienne, riche en haricots, légumes de saison et petites pâtes.",
        servings: 6,
        prepTime: 20,
        cookTime: 45,
        ingredients: [
            { item: "Légumes de saison (courgettes, carottes, céleri, chou)", quantity: 800, unit: "g" },
            { item: "Haricots rouges et/ou blancs (cuits)", quantity: 200, unit: "g" },
            { item: "Tomates concassées", quantity: 200, unit: "g" },
            { item: "Petites pâtes ou riz", quantity: 50, unit: "g" },
            { item: "Bouillon de légumes", quantity: 1.5, unit: "L" }
        ],
        instructions: [
            "Faire revenir l'oignon, l'ail et les légumes. Ajouter les tomates et le bouillon. Mijoter 30 min.",
            "Ajouter les haricots et les pâtes. Cuire 10 min de plus. Servir avec du pesto ou du Parmesan."
        ],
        tags: ["soupe", "italien", "complet", "végétarien"]
    },
    // RECETTE 201 : Zuppa di Fagioli (Soupe de Haricots Italiens)
    {
        title: "Zuppa di Fagioli (Soupe de Haricots Italiens)",
        description: "Soupe paysanne toscane, épaisse, à base de haricots Cannellini ou Borlotti, parfumée à la sauge et au romarin.",
        servings: 4,
        prepTime: 20,
        cookTime: 60,
        ingredients: [
            { item: "Haricots secs (Cannellini ou Borlotti)", quantity: 300, unit: "g" },
            { item: "Tomates concassées", quantity: 100, unit: "g" },
            { item: "Ail, sauge, romarin", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de légumes", quantity: 1.2, unit: "L" },
            { item: "Pain rassis (pour épaissir)", quantity: 2, unit: "tranches", optional: true }
        ],
        instructions: [
            "Cuire les haricots (préalablement trempés) avec de la sauge, du romarin, de l'ail et du bouillon (1h).",
            "Mixer partiellement les haricots pour lier. Ajouter les tomates. Cuire 15 min.",
            "Servir avec un filet d'huile d'olive et du poivre noir."
        ],
        tags: ["soupe", "italien", "légumineuses", "régional"]
    },
    // RECETTE 202 : Crema di Pomodoro (Crème de Tomate Fine)
    {
        title: "Crema di Pomodoro (Crème de Tomate Fine)",
        description: "Crème de tomate italienne, très simple et douce, souvent servie avec des croûtons ou un filet de pesto.",
        servings: 4,
        prepTime: 10,
        cookTime: 25,
        ingredients: [
            { item: "Tomates concassées de bonne qualité", quantity: 800, unit: "g" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de légumes", quantity: 20, unit: "cl" },
            { item: "Crème fraîche liquide (facultatif)", quantity: 5, unit: "cl" }
        ],
        instructions: [
            "Faire revenir l'oignon et l'ail. Ajouter les tomates, le bouillon et une pincée de sucre (pour l'acidité). Mijoter 20 min.",
            "Mixer très finement et passer au tamis. Ajouter la crème. Servir chaud."
        ],
        tags: ["soupe", "velouté", "italien", "végétarien"]
    },
    // RECETTE 203 : Potage de Courge au Gingembre et Lait de Coco
    {
        title: "Potage de Courge au Gingembre et Lait de Coco",
        description: "Velouté de courge (butternut ou potimarron) avec un goût exotique de gingembre frais et une touche de lait de coco.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Courge (en dés)", quantity: 800, unit: "g" },
            { item: "Gingembre frais (râpé)", quantity: 1, unit: "c. à café" },
            { item: "Lait de coco", quantity: 15, unit: "cl" },
            { item: "Bouillon de légumes", quantity: 60, unit: "cl" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir l'oignon, l'ail et le gingembre. Ajouter la courge et le bouillon.",
            "Cuire 20 min. Mixer finement. Ajouter le lait de coco et réchauffer doucement."
        ],
        tags: ["soupe", "velouté", "international", "végétarien"]
    },
    // RECETTE 204 : Consommé de Bœuf aux Petits Légumes (Brunoise)
    {
        title: "Consommé de Bœuf aux Petits Légumes (Brunoise)",
        description: "Bouillon de bœuf clair et raffiné, garni d'une brunoise de légumes croquants (carotte, céleri, navet).",
        servings: 4,
        prepTime: 20,
        cookTime: 90,
        ingredients: [
            { item: "Bouillon de bœuf (clarifié si possible)", quantity: 1, unit: "L" },
            { item: "Carottes (brunoise)", quantity: 50, unit: "g" },
            { item: "Céleri (brunoise)", quantity: 50, unit: "g" },
            { item: "Navet (brunoise)", quantity: 50, unit: "g" },
            { item: "Vermicelles ou fine nouille (facultatif)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Préparer un bouillon de bœuf très clair (ou utiliser un bouillon de qualité).",
            "Cuire la brunoise de légumes dans le bouillon chaud pendant 5-7 min (ils doivent rester légèrement croquants).",
            "Ajouter les vermicelles (si utilisés) 2 min avant la fin. Servir très chaud."
        ],
        tags: ["soupe", "français", "classique", "sain"]
    },
    // RECETTE 205 : Crème de Haricots de Soissons et Croutons Aillés
    {
        title: "Crème de Haricots de Soissons et Croutons Aillés",
        description: "Soupe épaisse et rustique, avec de gros haricots blancs (type Soissons ou Tarbais) mixés, parfumée à l'ail et au thym.",
        servings: 4,
        prepTime: 20,
        cookTime: 60,
        ingredients: [
            { item: "Haricots de Soissons (cuits ou en conserve)", quantity: 500, unit: "g" },
            { item: "Bouillon de légumes ou eau de cuisson des haricots", quantity: 75, unit: "cl" },
            { item: "Oignon, Ail, Thym", quantity: 1, unit: "quantité suffisante" },
            { item: "Pain rassis (pour les croûtons)", quantity: 2, unit: "tranches" }
        ],
        instructions: [
            "Faire revenir l'oignon et l'ail. Ajouter les haricots et le bouillon. Cuire 15 min.",
            "Mixer finement (garder quelques haricots entiers pour la garniture). Assaisonner.",
            "Croutons : Frire ou toaster les dés de pain. Frotter à l'ail et ajouter un filet d'huile d'olive."
        ],
        tags: ["soupe", "légumineuses", "français", "régional"]
    },
    // RECETTE 206 : Velouté de Brocolis et Cheddar (ou Roquefort)
    {
        title: "Velouté de Brocolis et Cheddar (ou Roquefort)",
        description: "Velouté de brocolis classique, lié par une pomme de terre, et enrichi d'une touche de fromage fort pour le goût.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Brocolis (fleurons)", quantity: 600, unit: "g" },
            { item: "Pomme de terre", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Cheddar ou Roquefort (pour la saveur)", quantity: 50, unit: "g" },
            { item: "Crème liquide", quantity: 5, unit: "cl", optional: true }
        ],
        instructions: [
            "Cuire le brocoli et la pomme de terre dans le bouillon (20 min).",
            "Mixer finement. Remettre sur le feu. Ajouter la crème et le fromage. Mélanger jusqu'à ce que le fromage soit fondu."
        ],
        tags: ["soupe", "velouté", "fromage", "international"]
    },
    // RECETTE 207 : Potage au Cerfeuil (Potage Santé)
    {
        title: "Potage au Cerfeuil (Potage Santé)",
        description: "Potage léger et détoxifiant, à base de pommes de terre, poireaux, et parfumé au cerfeuil frais.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Pommes de terre", quantity: 300, unit: "g" },
            { item: "Poireaux (blancs)", quantity: 1, unit: "pièce" },
            { item: "Cerfeuil frais", quantity: 1, unit: "bouquet" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Cuire les pommes de terre et le poireau dans le bouillon (20 min).",
            "Ajouter le cerfeuil et mixer très rapidement (pour éviter que la chaleur n'oxyde sa couleur). Servir immédiatement."
        ],
        tags: ["soupe", "velouté", "français", "sain"]
    },
    // RECETTE 208 : Velouté d'Endives au Jambon Cru (ou fèves)
    {
        title: "Velouté d'Endives au Jambon Cru (ou fèves)",
        description: "Soupe légèrement amère d'endives, adoucie par de la crème et garnie de petits morceaux de jambon cru ou de fèves.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Endives (chicons)", quantity: 600, unit: "g" },
            { item: "Pomme de terre", quantity: 1, unit: "pièce" },
            { item: "Bouillon de volaille", quantity: 75, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Jambon cru (en dés) ou fèves cuites", quantity: 50, unit: "g" }
        ],
        instructions: [
            "Faire suer les endives émincées jusqu'à ce qu'elles fondent. Ajouter la pomme de terre et le bouillon. Cuire 20 min.",
            "Mixer, ajouter la crème. Servir garni des dés de jambon cru (sautés) ou des fèves."
        ],
        tags: ["soupe", "velouté", "français", "original"]
    },
    // RECETTE 209 : Crème d'Artichauts (Velouté Printanier)
    {
        title: "Crème d'Artichauts (Velouté Printanier)",
        description: "Velouté très fin à base de fonds d'artichauts (ou d'artichauts en conserve), doux et subtil.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Fonds d'artichauts (frais ou surgelés)", quantity: 400, unit: "g" },
            { item: "Pomme de terre", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Jus de citron", quantity: 1, unit: "c. à café" }
        ],
        instructions: [
            "Cuire les fonds d'artichauts et la pomme de terre dans le bouillon. Cuire 15 min.",
            "Mixer finement, ajouter la crème et le jus de citron. Assaisonner."
        ],
        tags: ["soupe", "velouté", "français", "printemps"]
    },
    // RECETTE 210 : Crème d'Avoine et Légumes (Végétale)
    {
        title: "Crème d'Avoine et Légumes (Végétale)",
        description: "Soupe veloutée et végétalienne, épaissie par des flocons d'avoine, avec des légumes racines pour la saveur.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Carottes, céleri, poireaux", quantity: 400, unit: "g" },
            { item: "Flocons d'avoine", quantity: 50, unit: "g" },
            { item: "Lait végétal (avoine ou riz)", quantity: 20, unit: "cl" },
            { item: "Bouillon de légumes", quantity: 60, unit: "cl" }
        ],
        instructions: [
            "Faire suer les légumes. Ajouter le bouillon et les flocons d'avoine.",
            "Cuire 20 min. Mixer finement. Ajouter le lait végétal pour ajuster la texture et la douceur."
        ],
        tags: ["soupe", "velouté", "végétalien", "sain"]
    },
    // RECETTE 211 : Soupe à la Courgette et Vache Qui Rit
    {
        title: "Soupe à la Courgette et Vache Qui Rit (Pour Enfants)",
        description: "Soupe de courgettes très douce et onctueuse, liée par de la crème de fromage fondue (type Vache Qui Rit) pour les enfants.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Courgettes", quantity: 800, unit: "g" },
            { item: "Pomme de terre", quantity: 1, unit: "pièce" },
            { item: "Portions de fromage fondu (Vache Qui Rit ou Kiri)", quantity: 4, unit: "pièces" },
            { item: "Bouillon de volaille", quantity: 75, unit: "cl" }
        ],
        instructions: [
            "Cuire les courgettes et la pomme de terre dans le bouillon (20 min).",
            "Mixer finement. Ajouter les portions de fromage fondu. Mélanger jusqu'à ce qu'elles soient complètement incorporées. Servir tiède."
        ],
        tags: ["soupe", "enfant", "velouté", "rapide"]
    },
    // RECETTE 212 : Potage Germiny (Crème d'Oseille)
    {
        title: "Potage Germiny (Crème d'Oseille)",
        description: "Potage français raffiné à base de feuilles d'oseille (qui donne un goût acidulé), lié par un jaune d'œuf et de la crème.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Oseille fraîche (feuilles)", quantity: 50, unit: "g" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Jaune d'œuf", quantity: 1, unit: "pièce" },
            { item: "Crème fraîche épaisse", quantity: 10, unit: "cl" },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Faire fondre l'oseille hachée dans le beurre. Ajouter le bouillon. Cuire 5 min. Assaisonner.",
            "Liaison : Dans un bol, mélanger la crème et le jaune d'œuf. Retirer le bouillon du feu. Ajouter le mélange crème/œuf en fouettant (sans faire bouillir). Servir aussitôt."
        ],
        tags: ["soupe", "français", "gastronomique", "classique"]
    },
    // RECETTE 213 : Crème d'Avocat (Soupe Froide)
    {
        title: "Crème d'Avocat (Soupe Froide)",
        description: "Soupe froide rafraîchissante, à base d'avocat mixé avec du lait de coco, du jus de citron vert et de la coriandre.",
        servings: 4,
        prepTime: 10,
        cookTime: 0,
        ingredients: [
            { item: "Avocats mûrs", quantity: 2, unit: "pièces" },
            { item: "Lait de coco", quantity: 20, unit: "cl" },
            { item: "Jus de citron vert", quantity: 1, unit: "c. à soupe" },
            { item: "Bouillon de légumes froid", quantity: 20, unit: "cl" },
            { item: "Coriandre fraîche", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Mixer tous les ingrédients ensemble jusqu'à obtenir une crème parfaitement lisse.",
            "Ajouter le bouillon froid pour ajuster la texture.",
            "Assaisonner de sel et de piment (facultatif). Servir très froid, garni de dés de tomate ou de crevettes."
        ],
        tags: ["soupe", "froid", "international", "végétarien"]
    },
    // RECETTE 214 : Soupe de Maïs et Poivrons Grillés (Chili)
    {
        title: "Soupe de Maïs et Poivrons Grillés (Chili)",
        description: "Soupe veloutée de maïs, avec des poivrons grillés pour un goût fumé, et un peu de piment pour le relèvement.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Maïs (en conserve ou surgelé)", quantity: 400, unit: "g" },
            { item: "Poivron rouge", quantity: 1, unit: "pièce" },
            { item: "Bouillon de volaille", quantity: 75, unit: "cl" },
            { item: "Crème liquide ou lait de coco", quantity: 10, unit: "cl" },
            { item: "Oignon, Ail, Cumin", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Griller le poivron au four jusqu'à ce que la peau noircisse. Le peler et le couper en dés.",
            "Faire revenir l'oignon, l'ail et le cumin. Ajouter le maïs et le bouillon. Cuire 15 min.",
            "Mixer la soupe. Ajouter la crème et les dés de poivron grillé. Servir chaud."
        ],
        tags: ["soupe", "international", "légumes", "original"]
    },
    // RECETTE 215 : Soupe Miso Classique (Japonaise)
    {
        title: "Soupe Miso Classique (Japonaise)",
        description: "Bouillon de base japonais (Dashi) assaisonné de pâte de miso, garni de tofu et d'algues séchées (Wakame).",
        servings: 4,
        prepTime: 10,
        cookTime: 5,
        ingredients: [
            { item: "Bouillon Dashi (préalablement préparé)", quantity: 1, unit: "L" },
            { item: "Pâte de Miso (Shiro ou Awase)", quantity: 2, unit: "c. à soupe" },
            { item: "Tofu soyeux (en petits cubes)", quantity: 100, unit: "g" },
            { item: "Algues Wakame séchées", quantity: 1, unit: "c. à café" },
            { item: "Ciboulette (pour garnir)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire chauffer le bouillon Dashi (ne pas bouillir).",
            "Délayer la pâte de miso dans une petite quantité de bouillon chaud, puis l'ajouter au reste du bouillon. (Ne jamais faire bouillir le miso).",
            "Ajouter les algues Wakame et les cubes de tofu. Laisser les algues se réhydrater (1 min). Servir aussitôt."
        ],
        tags: ["soupe", "international", "japonais", "sain"]
    },
    // RECETTE 216 : Soupe Tom Kha Gai (Thaïlandaise)
    {
        title: "Soupe Tom Kha Gai (Thaïlandaise)",
        description: "Soupe thaïlandaise onctueuse à base de lait de coco, de poulet, de galanga, de citronnelle et de feuilles de kaffir, au goût aigre-doux.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Lait de coco", quantity: 40, unit: "cl" },
            { item: "Bouillon de volaille", quantity: 40, unit: "cl" },
            { item: "Blanc de poulet (en fines tranches)", quantity: 300, unit: "g" },
            { item: "Pâte de curry rouge ou Galanga, citronnelle, feuilles de kaffir", quantity: 1, unit: "quantité suffisante" },
            { item: "Jus de citron vert", quantity: 2, unit: "c. à soupe" },
            { item: "Champignons (Shiitake ou de Paris)", quantity: 100, unit: "g" }
        ],
        instructions: [
            "Faire mijoter le bouillon et le lait de coco avec le galanga, la citronnelle et les feuilles de kaffir (ou la pâte de curry). Cuire 10 min.",
            "Ajouter le poulet et les champignons. Cuire 10 min.",
            "Retirer du feu. Ajouter le jus de citron vert et la sauce poisson (Nuoc Mâm) pour l'assaisonnement. Servir chaud."
        ],
        tags: ["soupe", "international", "thaïlandais", "complet"]
    },
    // RECETTE 217 : Soupe Wonton (Chinoise)
    {
        title: "Soupe Wonton (Chinoise)",
        description: "Bouillon de volaille clair et parfumé, garni de raviolis chinois (Wontons) farcis à la viande et/ou crevettes.",
        servings: 4,
        prepTime: 30,
        cookTime: 15,
        ingredients: [
            { item: "Bouillon de volaille ou d'os", quantity: 1.5, unit: "L" },
            { item: "Wontons (achetés ou maison, farcis porc/crevettes)", quantity: 12, unit: "pièces" },
            { item: "Bok Choy (chou chinois) ou épinards", quantity: 100, unit: "g" },
            { item: "Sauce soja, huile de sésame, gingembre (pour assaisonner)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Porter le bouillon à ébullition. Ajouter les wontons et cuire 5-7 min (ils sont cuits lorsqu'ils flottent).",
            "Ajouter le Bok Choy émincé (ou les épinards). Cuire 1 min.",
            "Assaisonner le bouillon avec la sauce soja et l'huile de sésame. Servir chaud."
        ],
        tags: ["soupe", "international", "chinois", "complet"]
    },
    // RECETTE 218 : Soupe de Poisson (Velouté Simple)
    {
        title: "Soupe de Poisson (Velouté Simple)",
        description: "Velouté de poisson blanc, épais et riche en saveur marine, parfait comme base pour une rouille ou un accompagnement.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Filets de poisson blanc (merlan, cabillaud)", quantity: 400, unit: "g" },
            { item: "Légumes (poireaux, carottes, oignons)", quantity: 300, unit: "g" },
            { item: "Fumet de poisson ou eau", quantity: 75, unit: "cl" },
            { item: "Concentré de tomate", quantity: 1, unit: "c. à soupe" },
            { item: "Riz (pour lier) ou pomme de terre", quantity: 30, unit: "g" }
        ],
        instructions: [
            "Faire revenir les légumes. Ajouter le poisson, le riz/pomme de terre et le fumet.",
            "Cuire 25 min. Mixer le tout. Assaisonner avec le concentré de tomate et le poivre de Cayenne (facultatif)."
        ],
        tags: ["soupe", "velouté", "poisson", "français"]
    },
    // RECETTE 219 : Potage à la Citrouille et Épices Douces
    {
        title: "Potage à la Citrouille et Épices Douces",
        description: "Velouté de citrouille (ou potimarron) avec un mélange d'épices douces (cannelle, muscade, gingembre) pour un goût de fête.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Citrouille (en dés)", quantity: 800, unit: "g" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Mélange d'épices (Cannelle, Muscade, Gingembre)", quantity: 1, unit: "c. à café" },
            { item: "Lait ou crème (pour lier)", quantity: 10, unit: "cl" }
        ],
        instructions: [
            "Faire revenir l'oignon et l'ail. Ajouter la citrouille et les épices. Cuire 5 min.",
            "Couvrir de bouillon. Cuire 20 min. Mixer finement. Ajouter le lait ou la crème pour lier."
        ],
        tags: ["soupe", "velouté", "automne", "international"]
    },
    // RECETTE 220 : Velouté de Légumes Verts et Fromage Frais
    {
        title: "Velouté de Légumes Verts et Fromage Frais",
        description: "Velouté de saison à base de brocolis, courgettes et épinards, lié par du fromage frais (Philadelphia ou St Môret).",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Légumes verts (Brocolis, Courgettes, Épinards)", quantity: 700, unit: "g" },
            { item: "Fromage frais (type St Môret ou Philadelphia)", quantity: 100, unit: "g" },
            { item: "Pomme de terre (pour lier)", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" }
        ],
        instructions: [
            "Cuire tous les légumes et la pomme de terre dans le bouillon (20 min).",
            "Mixer finement. Ajouter le fromage frais. Mélanger jusqu'à ce qu'il soit incorporé. Assaisonner."
        ],
        tags: ["soupe", "velouté", "sain", "végétarien"]
    },
    // RECETTE 221 : Soupe à la Bière et Croûtons (Flamande)
    {
        title: "Soupe à la Bière et Croûtons (Flamande)",
        description: "Soupe rustique et aigre-douce, utilisant la bière (blonde ou ambrée) et souvent liée par de la farine et de l'œuf (technique flamande).",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Bière blonde ou ambrée", quantity: 50, unit: "cl" },
            { item: "Bouillon de volaille", quantity: 50, unit: "cl" },
            { item: "Oignons (émincés)", quantity: 2, unit: "pièces" },
            { item: "Farine", quantity: 1, unit: "c. à soupe" },
            { item: "Jaune d'œuf et crème (pour lier)", quantity: 1, unit: "quantité suffisante" },
            { item: "Croûtons ou pain rassis", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire suer les oignons. Ajouter la farine. Déglacer avec la bière. Ajouter le bouillon. Cuire 20 min.",
            "Liaison : Battre le jaune d'œuf et la crème. Retirer la soupe du feu. Ajouter le mélange en fouettant.",
            "Servir chaud avec des croûtons."
        ],
        tags: ["soupe", "belge", "international", "original"]
    },
    // RECETTE 222 : Potage Solferino (Purée de Pommes de Terre et Tomate)
    {
        title: "Potage Solferino (Purée de Pommes de Terre et Tomate)",
        description: "Potage traditionnel français à base de purée de pommes de terre (pour lier) et de bouillon de tomate, souvent garni de haricots verts.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Pommes de terre", quantity: 300, unit: "g" },
            { item: "Tomates concassées", quantity: 400, unit: "g" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Haricots verts (pour garnir)", quantity: 100, unit: "g" }
        ],
        instructions: [
            "Cuire les pommes de terre dans le bouillon. Ajouter les tomates concassées. Cuire 20 min.",
            "Mixer le tout pour une texture de velouté. Cuire les haricots verts à part. Servir la soupe garnie de haricots verts coupés en morceaux."
        ],
        tags: ["soupe", "français", "classique", "légumes"]
    },
    // RECETTE 223 : Soupe de Butternut au Sirop d'Érable
    {
        title: "Soupe de Butternut au Sirop d'Érable",
        description: "Soupe américaine (du Québec/Canada) à la courge butternut, avec une touche de sirop d'érable et de noix de pécan.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Courge Butternut (en dés)", quantity: 800, unit: "g" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" },
            { item: "Sirop d'érable", quantity: 1, unit: "c. à soupe" },
            { item: "Bouillon de volaille", quantity: 75, unit: "cl" },
            { item: "Lait ou crème (facultatif)", quantity: 10, unit: "cl" },
            { item: "Noix de pécan (pour décorer)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir l'oignon. Ajouter la courge. Cuire 5 min. Ajouter le bouillon et le sirop d'érable. Cuire 20 min.",
            "Mixer finement. Servir avec un filet de crème et des noix de pécan concassées."
        ],
        tags: ["soupe", "international", "sucré-salé", "automne"]
    },
    // RECETTE 224 : Soupe Au Bleu (Velouté Fromage Bleu)
    {
        title: "Soupe Au Bleu (Velouté Fromage Bleu)",
        description: "Soupe épaisse et riche, à base de pommes de terre ou de poireaux, enrichie d'un fromage bleu (Roquefort ou Gorgonzola) à la fin de la cuisson.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Poireaux ou pommes de terre", quantity: 700, unit: "g" },
            { item: "Fromage bleu (Roquefort ou Gorgonzola)", quantity: 80, unit: "g" },
            { item: "Bouillon de légumes", quantity: 75, unit: "cl" },
            { item: "Crème liquide", quantity: 10, unit: "cl" },
            { item: "Noix (pour garnir)", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les légumes dans le bouillon jusqu'à tendreté. Mixer finement.",
            "Retirer du feu. Ajouter la crème et le fromage bleu émietté. Mélanger jusqu'à ce que le fromage soit fondu. Servir avec les noix."
        ],
        tags: ["soupe", "velouté", "fromage", "original"]
    },
    // RECETTE 226 : Crème de Morilles (Raffinée)
    {
        title: "Crème de Morilles (Raffinée)",
        description: "Crème de champignons de luxe, à base de morilles séchées réhydratées, liée à la crème et parfumée au vin jaune ou au Madère.",
        servings: 4,
        prepTime: 15,
        cookTime: 30,
        ingredients: [
            { item: "Morilles séchées", quantity: 30, unit: "g" },
            { item: "Crème liquide entière", quantity: 20, unit: "cl" },
            { item: "Bouillon de volaille", quantity: 20, unit: "cl" },
            { item: "Vin Jaune ou Madère", quantity: 5, unit: "cl" },
            { item: "Échalotes", quantity: 2, unit: "pièces" },
            { item: "Beurre", quantity: 20, unit: "g" }
        ],
        instructions: [
            "Réhydrater les morilles dans de l'eau tiède. Égoutter (garder le jus).",
            "Faire suer les échalotes. Ajouter les morilles coupées. Déglacer au Vin Jaune. Laisser réduire.",
            "Ajouter le bouillon et le jus de trempage (filtré). Laisser mijoter 15 min. Ajouter la crème. Servir chaud."
        ],
        tags: ["soupe", "gastronomique", "champignons", "français"]
    },
    // RECETTE 227 : Potage Parmentier (Pommes de Terre et Poireaux)
    {
        title: "Potage Parmentier (Pommes de Terre et Poireaux)",
        description: "Potage simple et nourrissant, base du velouté Vichyssoise, sans la crème : pommes de terre et poireaux, liés par l'amidon.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Pommes de terre", quantity: 500, unit: "g" },
            { item: "Poireaux (blancs)", quantity: 200, unit: "g" },
            { item: "Bouillon de légumes ou eau", quantity: 1, unit: "L" },
            { item: "Sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Faire suer les poireaux dans le beurre. Ajouter les pommes de terre. Couvrir d'eau/bouillon.",
            "Cuire 20 min. Mixer finement. Rectifier l'assaisonnement. Servir chaud."
        ],
        tags: ["soupe", "français", "classique", "sain"]
    },
    // RECETTE 230 : Crème de Légumes (Carotte et Courgette)
    {
        title: "Crème de Légumes (Carotte et Courgette) au Pain Croquant",
        description: "Velouté très doux, parfait pour masquer la courgette, adouci par la carotte et servi avec des mouillettes beurrées.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Carottes", quantity: 400, unit: "g" },
            { item: "Courgettes", quantity: 400, unit: "g" },
            { item: "Pomme de terre (pour lier)", quantity: 1, unit: "pièce" },
            { item: "Bouillon de légumes ou eau", quantity: 1, unit: "L" },
            { item: "Crème fraîche ou lait", quantity: 10, unit: "cl", optional: true }
        ],
        instructions: [
            "Cuire tous les légumes coupés dans le bouillon jusqu'à tendreté (20 min).",
            "Mixer très finement. Ajouter la crème ou le lait. Assaisonner très légèrement. Servir avec du pain toasté."
        ],
        tags: ["soupe", "enfant", "légumes", "sain"]
    },
    // RECETTE 239 : Soupe de Tomates et Vermicelles (Douce)
    {
        title: "Soupe de Tomates et Vermicelles (Douce)",
        description: "Soupe de tomates légèrement sucrée pour masquer l'acidité, garnie de vermicelles.",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        ingredients: [
            { item: "Tomates concassées", quantity: 800, unit: "g" },
            { item: "Bouillon de volaille ou d'eau", quantity: 50, unit: "cl" },
            { item: "Vermicelles", quantity: 30, unit: "g" },
            { item: "Sucre (pour corriger l'acidité)", quantity: 1, unit: "c. à café" }
        ],
        instructions: [
            "Cuire les tomates avec le bouillon et le sucre 15 min. Mixer finement. Ajouter les vermicelles. Cuire 5 min de plus."
        ],
        tags: ["soupe", "enfant", "légumes", "rapide"]
    },
    // RECETTE 252 : Soupe Tom Yum (Crevettes Aigre-Piquante)
    {
        title: "Soupe Tom Yum (Crevettes Aigre-Piquante)",
        description: "Soupe thaïlandaise emblématique, légère, très parfumée (citronnelle, galanga, kaffir) et relevée (chili) avec des crevettes.",
        servings: 4,
        prepTime: 15,
        cookTime: 20,
        ingredients: [
            { item: "Crevettes cuites ou crues", quantity: 300, unit: "g" },
            { item: "Bouillon de volaille ou d'eau", quantity: 1, unit: "L" },
            { item: "Citronnelle, Galanga, Feuilles de Kaffir, Piment frais", quantity: 1, unit: "quantité suffisante" },
            { item: "Jus de citron vert, sauce Nuoc Mâm", quantity: 1, unit: "quantité suffisante" },
            { item: "Champignons (pailles ou de Paris)", quantity: 100, unit: "g" }
        ],
        instructions: [
            "Faire mijoter le bouillon avec les aromates (citronnelle, galanga, kaffir, piment) pendant 10 min.",
            "Ajouter les crevettes et les champignons. Cuire 5 min.",
            "Retirer du feu. Assaisonner avec le jus de citron vert et la sauce Nuoc Mâm. Servir très chaud."
        ],
        tags: ["soupe", "asiatique", "thaïlandais", "poisson"]
    },
    // RECETTE 272 : Soupe Goulash aux Pommes de Terre (Simple)
    {
        title: "Soupe Goulash aux Pommes de Terre (Simple)",
        description: "Version simplifiée et plus souple du Goulash, concentrée sur le bouillon au paprika, bœuf et pommes de terre.",
        servings: 6,
        prepTime: 20,
        cookTime: 90,
        ingredients: [
            { item: "Bœuf (joue ou gîte)", quantity: 600, unit: "g" },
            { item: "Oignons", quantity: 3, unit: "pièces" },
            { item: "Paprika (doux et fort)", quantity: 2, unit: "c. à soupe" },
            { item: "Pommes de terre, carottes", quantity: 500, unit: "g" },
            { item: "Bouillon de bœuf", quantity: 1.5, unit: "L" }
        ],
        instructions: [
            "Faire dorer la viande. Retirer. Faire revenir les oignons et le paprika.",
            "Remettre la viande. Ajouter le bouillon. Mijoter 1h. Ajouter les pommes de terre et carottes. Cuire 30 min de plus."
        ],
        tags: ["soupe", "européen", "hongrois", "complet"]
    },


    // ====================================================================
    // 🥩 BLOC 2 : PLATS PRINCIPAUX - VIANDE & VOLAILLE
    // ====================================================================

    // RECETTE 5 : Stoemp Carottes et Saucisses de Volaille
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
    // RECETTE 6 : Stoemp Fondant aux Poireaux et Saucisses de Volaille
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
    // RECETTE 11 : Américain Préparé (Steak Tartare Belge)
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
    // RECETTE 17 : Quiche Lorraine Traditionnelle
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
    // RECETTE 22 : Rôti de Dinde Moelleux, Sauce Moutarde Crémée
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
    // RECETTE 23 : Entrecôte de Bœuf Grillée, Jus Corsé au Romarin
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
    // RECETTE 24 : Cuisse de Poulet Rôtie et Croustillante
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
    // RECETTE 86 : Carbonnades Flamandes à la Bière Brune
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
    // RECETTE 90 : Vol-au-vent aux Boulettes et Champignons
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
    // RECETTE 92 : Fricadelle/Boulet Sauce Liégeoise
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
    // RECETTE 98 : Boudin Blanc de Liège aux Pommes
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
    // RECETTE 100 : Filet Mignon de Porc Sauce Archiduc
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
    // RECETTE 120 : Coq au Vin (Version Classique)
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
    // RECETTE 121 : Poule au Pot (Bouillon de Volaille et Légumes)
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
    // RECETTE 126 : Veau Marengo (Sauté de Veau aux Tomates et Champignons)
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
    // RECETTE 131 : Tajine de Boulettes de Bœuf à la Tomate et Œufs (Kefta)
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
    // RECETTE 132 : Tajine de Poulet aux Pommes de Terre et Carottes
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
    // RECETTE 151 : Spaghetti con Polpette (Boulettes de Viande)
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
    // RECETTE 161 : Saltimbocca alla Romana
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
    // RECETTE 232 : Hamburger Maison au Poulet Haché
    {
        title: "Hamburger Maison au Poulet Haché (Version Douce)",
        description: "Pains à burger garnis d'une galette de poulet haché (moins gras) avec fromage fondu et ketchup/mayo.",
        servings: 4,
        prepTime: 20,
        cookTime: 15,
        ingredients: [
            { item: "Pains à burger", quantity: 4, unit: "pièces" },
            { item: "Poulet haché (ou bœuf haché maigre)", quantity: 400, unit: "g" },
            { item: "Fromage à croque-monsieur ou cheddar", quantity: 4, unit: "tranches" },
            { item: "Oignon haché, persil (pour la galette)", quantity: 1, unit: "quantité suffisante" },
            { item: "Garnitures : ketchup, laitue, rondelles de tomate (facultatif)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Mélanger la viande hachée avec l'oignon et le persil. Former 4 galettes. Les cuire à la poêle ou au four (10-12 min).",
            "Faire fondre le fromage sur les galettes chaudes.",
            "Toaster les pains. Garnir des sauces, de la galette au fromage et des légumes (si utilisés)."
        ],
        tags: ["plat principal", "enfant", "rapide"]
    },
    // RECETTE 285 : Porc Laqué (Char Siu Chinois)
    {
        title: "Porc Laqué (Char Siu Chinois)",
        description: "Morceaux d'échine de porc marinés dans une sauce riche et sucrée (miel, sauce Hoisin, sauce soja), puis rôtis.",
        servings: 4,
        prepTime: 60,
        cookTime: 45,
        ingredients: [
            { item: "Échine de porc", quantity: 800, unit: "g" },
            { item: "Miel ou sirop d'érable", quantity: 3, unit: "c. à soupe" },
            { item: "Sauce Hoisin", quantity: 3, unit: "c. à soupe" },
            { item: "Sauce soja, Vin de riz, Ail, Gingembre", quantity: 1, unit: "quantité suffisante" },
            { item: "Colorant rouge alimentaire (facultatif)", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Couper le porc en lanières épaisses. Mélanger tous les ingrédients de la marinade.",
            "Mariner le porc (minimum 2h, idéalement 12h).",
            "Rôtir au four à 200°C sur une grille (30-40 min), en badigeonnant régulièrement de marinade pour laquer."
        ],
        tags: ["plat principal", "asiatique", "chinois", "rôti"]
    },
    // RECETTE 287 : Poulet Général Tao (Chinois-Américain)
    {
        title: "Poulet Général Tao (Chinois-Américain)",
        description: "Poulet frit croustillant, enrobé d'une sauce épaisse, sucrée et légèrement piquante (gingembre, soja, vinaigre de riz).",
        servings: 4,
        prepTime: 30,
        cookTime: 20,
        ingredients: [
            { item: "Blanc de poulet (en dés)", quantity: 500, unit: "g" },
            { item: "Farine, Œuf (pour la friture)", quantity: 1, unit: "quantité suffisante" },
            { item: "Sauce : Sauce soja, Vinaigre de riz, Sucre, Hoisin, Piment (Peperoncino)", quantity: 1, unit: "quantité suffisante" },
            { item: "Gingembre frais, Ail", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Paner et frire le poulet (deux fois si possible) jusqu'à ce qu'il soit croustillant. Réserver.",
            "Faire revenir le gingembre et l'ail. Ajouter tous les ingrédients de la sauce. Laisser épaissir.",
            "Mélanger le poulet croustillant à la sauce. Servir immédiatement sur du riz."
        ],
        tags: ["plat principal", "asiatique", "chinois", "friture"]
    },
    // RECETTE 288 : Salade Thaï de Bœuf aux Herbes (Larb Neua)
    {
        title: "Salade Thaï de Bœuf aux Herbes (Larb Neua)",
        description: "Salade de viande hachée (bœuf ou poulet) cuite, assaisonnée de Nuoc Mâm, citron vert, riz grillé concassé (Khao Khua) et herbes fraîches.",
        servings: 4,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Bœuf haché ou effiloché", quantity: 400, unit: "g" },
            { item: "Jus de citron vert", quantity: 3, unit: "c. à soupe" },
            { item: "Sauce poisson (Nuoc Mâm)", quantity: 2, unit: "c. à soupe" },
            { item: "Riz grillé concassé (Khao Khua)", quantity: 1, unit: "c. à soupe" },
            { item: "Menthe, Coriandre, Oignon rouge", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire le bœuf haché à sec dans une poêle. Retirer l'excès de graisse.",
            "Mélanger la viande cuite avec la sauce Nuoc Mâm, le jus de citron vert, le Khao Khua, et les herbes/oignons. Servir à température ambiante avec des feuilles de laitue."
        ],
        tags: ["entrée", "asiatique", "thaïlandais", "frais"]
    },
    // RECETTE 289 : Curry Rouge de Canard aux Fruits (Thaï)
    {
        title: "Curry Rouge de Canard aux Fruits (Thaï)",
        description: "Curry rouge riche et aromatique (canard), équilibré par des fruits sucrés (ananas, litchi, raisin) et du lait de coco.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Filet de canard (coupé en tranches)", quantity: 400, unit: "g" },
            { item: "Pâte de curry rouge", quantity: 1, unit: "c. à soupe" },
            { item: "Lait de coco", quantity: 40, unit: "cl" },
            { item: "Bouillon de volaille", quantity: 10, unit: "cl" },
            { item: "Fruits (ananas, litchis, raisins)", quantity: 150, unit: "g" },
            { item: "Feuilles de basilic thaï", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire le canard (côté peau) et le retirer. Faire revenir la pâte de curry dans le lait de coco.",
            "Ajouter le bouillon, la viande et les fruits. Mijoter 15 min. Assaisonner avec Nuoc Mâm et sucre.",
            "Servir chaud avec du basilic thaï."
        ],
        tags: ["plat principal", "asiatique", "thaïlandais", "original"]
    },

    // ====================================================================
    // 🐟 BLOC 3 : PLATS PRINCIPAUX - POISSON & FRUITS DE MER
    // ====================================================================

    // RECETTE 18 : Aile de Raie au Beurre Noir et Câpres
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
    // RECETTE 19 : Filet de Dauraude en Papillote aux Légumes Croquants et Citron
    {
        title: "Filet de Dauraude en Papillote aux Légumes Croquants et Citron",
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
    // RECETTE 20 : Tagliatelles au Saumon Fumé et à la Crème Citronnée
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
    // RECETTE 21 : Sole Meunière au Four et Beurre Noisette
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
    // RECETTE 46 : Cannellonis Saumon et Courgettes Crémées
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
    // RECETTE 87 : Moules Frites à la Marinière
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
        tags: ["plat principal", "belge", "poisson", "fruits de mer"]
    },
    // RECETTE 130 : Tajine de Poisson (Dorade) aux Tomates et Poivrons
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
    // RECETTE 142 : Spaghetti alle Vongole (Palourdes)
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
    // RECETTE 153 : Risotto aux Fruits de Mer (Frutti di Mare)
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
    // RECETTE 283 : Filet de Cabillaud Sauce Blanche Citronnée
    {
        title: "Filet de Cabillaud Sauce Blanche Citronnée",
        description: "Poisson blanc (cabillaud ou lieu) poché ou cuit au four, servi avec une sauce légère au citron et au persil.",
        servings: 4,
        prepTime: 10,
        cookTime: 15,
        ingredients: [
            { item: "Filets de cabillaud (sans arêtes)", quantity: 600, unit: "g" },
            { item: "Béchamel ou sauce blanche légère", quantity: 20, unit: "cl" },
            { item: "Jus de citron", quantity: 1, unit: "c. à soupe" },
            { item: "Persil haché", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire le poisson à la vapeur ou au four (180°C, 12 min).",
            "Préparer une sauce blanche simple. Ajouter le jus de citron et le persil. Assaisonner.",
            "Napper le poisson chaud de la sauce. Servir avec du riz ou de la purée."
        ],
        tags: ["plat principal", "enfant", "poisson", "sain"]
    },

    // ====================================================================
    // 🥗 BLOC 4 : ACCOMPAGNEMENTS & PLATS VÉGÉTARIENS
    // ====================================================================

    // RECETTE 3 : Ratatouille Classique Provençale
    {
        title: "Ratatouille Classique Provençale",
        description: "Mélange de légumes du soleil mijotés à l'huile d'olive et aux herbes aromatiques, parfait en accompagnement.",
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
    // RECETTE 26 : Gnocchi au Gorgonzola Crémeux et Noix
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
    // RECETTE 27 : Spaghetti Primavera aux Légumes Croquants
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
    // RECETTE 29 : Penne au Tofu Fumé et Sauce Tomate
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
    // RECETTE 32 : Rôti de Légumes Méditerranéens au Four
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
    // RECETTE 33 : Gratin Dauphinois Classique
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

    // ====================================================================
    // 🍝 BLOC 1 : PLATS PRINCIPAUX - PÂTES, RIZ & CÉRÉALES (Végétarien et Complet)
    // ====================================================================

    // RECETTE 26 : Gnocchi au Gorgonzola Crémeux et Noix (Italien)
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
        tags: ["plat principal", "pâtes", "végétarien", "crémeux", "italien"]
    },
    // RECETTE 27 : Spaghetti Primavera aux Légumes Croquants (Italien)
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
        tags: ["plat principal", "pâtes", "végétarien", "léger", "italien"]
    },
    // RECETTE 28 : Riz Sauté aux Légumes (Style Cantonais Doux)
    {
        title: "Riz Sauté aux Légumes (Style Cantonais Doux)",
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
            { item: "Huile végétale", quantity: 3, unit: "c. à soupe" }
        ],
        instructions: [
            "Couper les légumes en petits dés. Faire dorer l’oignon (facultatif).",
            "Faire sauter les légumes dans un wok ou une grande poêle 5-7 minutes.",
            "Ajouter le riz froid, bien séparer les grains et faire sauter 2-3 minutes.",
            "Ajouter la sauce soja. Assaisonner.",
            "Faire cuire les œufs brouillés à part et les mélanger au riz avant de servir."
        ],
        nutrition: { calories: 400, proteins: 15, carbs: 60, fats: 10 },
        tags: ["plat principal", "riz", "asiatique", "enfant"]
    },
    // RECETTE 29 : Penne au Tofu Fumé et Sauce Tomate (Végétarien)
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
            { item: "Huile d’olive", quantity: 3, unit: "c. à soupe" }
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
    // RECETTE 30 : Nouilles Sautées aux Légumes Croquants (Wok)
    {
        title: "Nouilles Sautées aux Légumes Croquants (Wok)",
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
            { item: "Sauce soja douce", quantity: 4, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire et égoutter les nouilles, les rincer à l'eau froide. Blanchir les brocolis 2-3 min. Couper les autres légumes en julienne.",
            "Chauffer le wok avec l’huile à feu vif. Ajouter oignon et légumes, sauter 5-6 min pour qu'ils restent croquants.",
            "Ajouter les nouilles et la sauce soja. Mélanger énergiquement et servir aussitôt."
        ],
        nutrition: { calories: 420, proteins: 15, carbs: 60, fats: 15 },
        tags: ["plat principal", "asiatique", "végétarien"]
    },
    // RECETTE 140 : Penne all'Arrabbiata (Italien, Pimenté)
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
            { item: "Persil plat haché", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Faire chauffer l'huile d'olive. Faire dorer l'ail (coupé en deux) et le piment.",
            "Retirer l'ail avant qu'il ne brûle. Ajouter les tomates concassées, le sel et le poivre.",
            "Laisser mijoter la sauce 20 min. Cuire les penne 'al dente'.",
            "Mélanger les pâtes à la sauce Arrabbiata. Servir chaud, saupoudré de persil."
        ],
        tags: ["plat principal", "italien", "pâtes", "végétarien"]
    },
    // RECETTE 141 : Spaghetti Aglio e Olio (Italien, Ail et Huile)
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
            { item: "Persil plat haché", quantity: 1, unit: "c. à soupe" }
        ],
        instructions: [
            "Cuire les spaghetti 'al dente'. Garder 10 cl d'eau de cuisson.",
            "Faire chauffer l'huile d'olive à feu très doux. Ajouter l'ail et le piment (ne pas les laisser dorer).",
            "Égoutter les pâtes. Les verser dans la poêle avec l'huile parfumée et l'eau de cuisson. Sauter 2 min pour émulsionner.",
            "Retirer du feu. Ajouter le persil haché et servir immédiatement."
        ],
        tags: ["plat principal", "italien", "pâtes", "végétarien"]
    },
    // RECETTE 144 : Pâtes Cacio e Pepe (Italien, Fromage et Poivre)
    {
        title: "Pâtes Cacio e Pepe",
        description: "Plat minimaliste de Rome : pâtes, fromage (Pecorino) et poivre, liés par l'amidon de l'eau de cuisson.",
        servings: 4,
        prepTime: 5,
        cookTime: 15,
        ingredients: [
            { item: "Spaghetti ou Tonnarelli", quantity: 400, unit: "g" },
            { item: "Pecorino Romano râpé", quantity: 200, unit: "g" },
            { item: "Poivre noir en grains", quantity: 2, unit: "c. à soupe" }
        ],
        instructions: [
            "Concasser le poivre. Le faire griller à sec dans une poêle. Cuire les pâtes. Garder l'eau de cuisson.",
            "Dans la poêle, déglacer le poivre avec l'eau de cuisson. Retirer du feu, ajouter progressivement le Pecorino en remuant rapidement (effet 'mantecare').",
            "Mélanger les pâtes à la sauce et servir immédiatement."
        ],
        tags: ["plat principal", "italien", "pâtes", "classique"]
    },
    // RECETTE 146 : Risotto aux Champignons de Saison (Funghi) (Italien)
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
            { item: "Parmesan râpé", quantity: 50, unit: "g" }
        ],
        instructions: [
            "Faire revenir l'oignon dans l'huile. Ajouter le riz et le faire nacrer 2 min.",
            "Déglacer au vin blanc. Ajouter les champignons. Poursuivre la cuisson classique du risotto avec le bouillon (louche par louche).",
            "Hors du feu, ajouter le beurre froid et le parmesan. Mélanger vigoureusement pour lier (mantecare)."
        ],
        tags: ["plat principal", "italien", "risotto", "végétarien"]
    },
    // RECETTE 148 : Gnocchi au Pesto (de Basilic frais) (Italien)
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
            "Mélanger les gnocchi chauds dans un grand bol avec le pesto. Ajouter une cuillère d'eau de cuisson pour rendre la sauce plus onctueuse (facultatif)."
        ],
        tags: ["plat principal", "italien", "pâtes", "végétarien"]
    },
    // RECETTE 149 : Trofie al Pesto, Fagiolini e Patate (Liguria) (Italien)
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
    // RECETTE 150 : Risotto alla Milanese (Safran) (Italien)
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
    // RECETTE 154 : Rigatoni con Panna e Prosciutto Cotto (Italien)
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
            "Cuire les pâtes 'al dente'. Les égoutter et les mélanger immédiatement à la sauce chaude."
        ],
        tags: ["plat principal", "italien", "pâtes", "rapide"]
    },
    // RECETTE 156 : Pâtes aux Quatre Fromages (Quattro Formaggi) (Italien)
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
    // RECETTE 157 : Risotto alla Zucca (Courge) (Italien)
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
            "Poursuivre la cuisson classique du risotto avec le bouillon.",
            "Hors du feu, lier avec le beurre et le Parmesan. Ajouter la saucisse dorée."
        ],
        tags: ["plat principal", "italien", "risotto", "saison"]
    },
    // RECETTE 159 : Pasta alla Norma (Sicile) (Italien)
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
    // RECETTE 163 : Melanzane alla Parmigiana (Parmentière d'Aubergine) (Italien)
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
            { item: "Basilic frais", quantity: 1, unit: "poignée" }
        ],
        instructions: [
            "Couper l'aubergine en tranches. Les faire frire ou les griller au four. Égoutter.",
            "Préchauffer le four à 180°C. Assemblage : Étaler une couche de sauce tomate, puis aubergines, mozzarella, Parmesan et basilic. Répéter 3 à 4 fois.",
            "Terminer par une couche de sauce et beaucoup de Parmesan. Cuire 35 à 45 minutes jusqu'à ce que ce soit bouillonnant et doré."
        ],
        tags: ["plat principal", "italien", "gratin", "végétarien"]
    },
    // RECETTE 165 : Conchiglioni Farcis Ricotta et Épinards (Italien)
    {
        title: "Conchiglioni Farcis Ricotta et Épinards",
        description: "Grandes pâtes en forme de coquillages (conchiglioni) farcies d'un mélange de ricotta et d'épinards, cuites dans une sauce tomate et gratinées.",
        servings: 4,
        prepTime: 30,
        cookTime: 40,
        ingredients: [
            { item: "Conchiglioni (grandes pâtes)", quantity: 250, unit: "g" },
            { item: "Ricotta", quantity: 250, unit: "g" },
            { item: "Épinards (cuits et hachés)", quantity: 200, unit: "g" },
            { item: "Sauce tomate simple", quantity: 500, unit: "g" },
            { item: "Mozzarella et Parmesan râpé", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire les pâtes. Préparer la farce (Ricotta, épinards, sel, poivre).",
            "Étaler une couche de sauce tomate au fond d'un plat. Farcir chaque pâte et la disposer dans le plat.",
            "Napper du reste de sauce, recouvrir de fromage. Cuire au four à 180°C pendant 30 minutes."
        ],
        tags: ["plat principal", "italien", "gratin", "végétarien"]
    },
    // RECETTE 176 : Tarte Flambée (Flammekueche Alsacien) (Français Régional)
    {
        title: "Tarte Flambée (Flammekueche Alsacien)",
        description: "Fine galette de pâte à pain recouverte de crème fraîche, d'oignons émincés et de lardons, cuite très rapidement au four très chaud.",
        servings: 4,
        prepTime: 20,
        cookTime: 10,
        ingredients: [
            { item: "Pâte à pain (très fine)", quantity: 300, unit: "g" },
            { item: "Crème fraîche épaisse", quantity: 150, unit: "g" },
            { item: "Oignons jaunes (finement émincés)", quantity: 2, unit: "pièces" },
            { item: "Lardons fumés", quantity: 100, unit: "g" },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 250°C (ou au maximum). Étaler la pâte très finement sur une plaque.",
            "Mélanger la crème fraîche avec sel, poivre et muscade. Étaler sur la pâte.",
            "Garnir d'oignons émincés et de lardons (crus).",
            "Cuire 8 à 10 minutes (la pâte doit être croustillante et les bords dorés)."
        ],
        tags: ["plat principal", "français", "régional", "rapide"]
    },
    // RECETTE 200 : Minestrone de Légumes et Pâtes (Complet) (Italien)
    {
        title: "Minestrone de Légumes et Pâtes (Complet)",
        description: "Soupe repas italienne, riche en haricots, légumes de saison et petites pâtes.",
        servings: 6,
        prepTime: 20,
        cookTime: 45,
        ingredients: [
            { item: "Légumes de saison (courgettes, carottes, céleri, chou)", quantity: 800, unit: "g" },
            { item: "Haricots rouges et/ou blancs (cuits)", quantity: 200, unit: "g" },
            { item: "Tomates concassées", quantity: 200, unit: "g" },
            { item: "Petites pâtes ou riz", quantity: 50, unit: "g" },
            { item: "Bouillon de légumes", quantity: 1.5, unit: "L" }
        ],
        instructions: [
            "Faire revenir l'oignon, l'ail et les légumes. Ajouter les tomates et le bouillon. Mijoter 30 min.",
            "Ajouter les haricots et les pâtes. Cuire 10 min de plus. Servir avec du pesto ou du Parmesan."
        ],
        tags: ["soupe", "italien", "complet", "végétarien"]
    },
    // RECETTE 201 : Zuppa di Fagioli (Soupe de Haricots Italiens)
    {
        title: "Zuppa di Fagioli (Soupe de Haricots Italiens)",
        description: "Soupe paysanne toscane, épaisse, à base de haricots Cannellini ou Borlotti, parfumée à la sauge et au romarin.",
        servings: 4,
        prepTime: 20,
        cookTime: 60,
        ingredients: [
            { item: "Haricots secs (Cannellini ou Borlotti)", quantity: 300, unit: "g" },
            { item: "Tomates concassées", quantity: 100, unit: "g" },
            { item: "Ail, sauge, romarin", quantity: 1, unit: "quantité suffisante" },
            { item: "Bouillon de légumes", quantity: 1.2, unit: "L" },
            { item: "Pain rassis (pour épaissir)", quantity: 2, unit: "tranches", optional: true }
        ],
        instructions: [
            "Cuire les haricots (préalablement trempés) avec de la sauge, du romarin, de l'ail et du bouillon (1h).",
            "Mixer partiellement les haricots pour lier. Ajouter les tomates. Cuire 15 min.",
            "Servir avec un filet d'huile d'olive et du poivre noir."
        ],
        tags: ["soupe", "italien", "légumineuses", "régional"]
    },
    // RECETTE 203 : Potage de Courge au Gingembre et Lait de Coco
    {
        title: "Potage de Courge au Gingembre et Lait de Coco",
        description: "Velouté de courge (butternut ou potimarron) avec un goût exotique de gingembre frais et une touche de lait de coco.",
        servings: 4,
        prepTime: 20,
        cookTime: 30,
        ingredients: [
            { item: "Courge (en dés)", quantity: 800, unit: "g" },
            { item: "Gingembre frais (râpé)", quantity: 1, unit: "c. à café" },
            { item: "Lait de coco", quantity: 15, unit: "cl" },
            { item: "Bouillon de légumes", quantity: 60, unit: "cl" },
            { item: "Oignon, Ail", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire revenir l'oignon, l'ail et le gingembre. Ajouter la courge et le bouillon.",
            "Cuire 20 min. Mixer finement. Ajouter le lait de coco et réchauffer doucement."
        ],
        tags: ["soupe", "velouté", "international", "végétarien"]
    },
    // RECETTE 243 : Poulet et Légumes Sautés à la Sauce Soja Douce (Enfant)
    {
        title: "Poulet et Légumes Sautés à la Sauce Soja Douce",
        description: "Morceaux de poulet et de légumes (carottes, brocolis) sautés au wok, assaisonnés d'une sauce soja sucrée (moins salée).",
        servings: 4,
        prepTime: 15,
        cookTime: 15,
        ingredients: [
            { item: "Blanc de poulet (en dés)", quantity: 400, unit: "g" },
            { item: "Légumes (Brocolis, carottes, poivrons)", quantity: 400, unit: "g" },
            { item: "Sauce soja sucrée ou teriyaki", quantity: 3, unit: "c. à soupe" },
            { item: "Riz (pour accompagner)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire sauter le poulet. Ajouter les légumes coupés en petits morceaux (cuire les plus durs en premier).",
            "Ajouter la sauce soja sucrée. Sauter 3-4 minutes. Servir sur du riz blanc."
        ],
        tags: ["plat principal", "enfant", "asiatique", "sain"]
    },
    // RECETTE 244 : Pad Thaï au Poulet et Crevettes (Asiatique)
    {
        title: "Pad Thaï au Poulet et Crevettes",
        description: "Nouilles de riz sautées, plat emblématique de la Thaïlande, avec une sauce aigre-douce, œuf, tofu (facultatif) et cacahuètes.",
        servings: 4,
        prepTime: 20,
        cookTime: 20,
        ingredients: [
            { item: "Nouilles de riz plates (Pad Thaï)", quantity: 300, unit: "g" },
            { item: "Poulet (en lamelles) et/ou Crevettes", quantity: 300, unit: "g" },
            { item: "Tofu ferme (en dés)", quantity: 100, unit: "g", optional: true },
            { item: "Sauce Tamarin, Sauce poisson, Sucre, Jus de citron vert (pour la sauce)", quantity: 1, unit: "quantité suffisante" },
            { item: "Œufs", quantity: 2, unit: "pièces" },
            { item: "Cacahuètes concassées, Ciboule", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Faire tremper les nouilles. Préparer la sauce Pad Thaï.",
            "Faire sauter le poulet/crevettes et le tofu. Repousser sur les bords. Casser les œufs et les brouiller.",
            "Ajouter les nouilles. Verser la sauce. Sauter 2 min. Ajouter les cacahuètes, la ciboule et servir avec du citron vert."
        ],
        tags: ["plat principal", "asiatique", "thaïlandais", "nouilles"]
    },
    // RECETTE 251 : Curry Vert Thaïlandais Végétal (Asiatique)
    {
        title: "Curry Vert Thaïlandais Végétal",
        description: "Curry thaïlandais piquant (ajustable) à base de pâte de curry vert, de lait de coco et d'un mélange de légumes de saison.",
        servings: 4,
        prepTime: 20,
        cookTime: 25,
        ingredients: [
            { item: "Pâte de curry vert", quantity: 1, unit: "c. à soupe" },
            { item: "Lait de coco", quantity: 40, unit: "cl" },
            { item: "Légumes (courgettes, poivrons, haricots verts, pousses de bambou)", quantity: 500, unit: "g" },
            { item: "Basilic thaï, jus de citron vert", quantity: 1, unit: "quantité suffisante" },
            { item: "Tofu ferme (en cubes)", quantity: 150, unit: "g", optional: true }
        ],
        instructions: [
            "Faire chauffer l'huile. Faire revenir la pâte de curry vert (30 sec). Ajouter un peu de lait de coco pour diluer.",
            "Ajouter le reste du lait de coco. Porter à frémissement. Ajouter les légumes et le tofu.",
            "Mijoter 15 minutes. Assaisonner avec la sauce Nuoc Mâm ou du sel et du jus de citron vert. Servir avec du riz Basmati."
        ],
        tags: ["plat principal", "asiatique", "thaïlandais", "végétarien"]
    },
    // RECETTE 264 : Tarte Flambée (Flammekueche Alsacien) (Français Régional)
    {
        title: "Tarte Flambée (Flammekueche Alsacien)",
        description: "Fine galette de pâte à pain recouverte de crème fraîche, d'oignons émincés et de lardons, cuite très rapidement au four très chaud.",
        servings: 4,
        prepTime: 20,
        cookTime: 10,
        ingredients: [
            { item: "Pâte à pain (très fine)", quantity: 300, unit: "g" },
            { item: "Crème fraîche épaisse", quantity: 150, unit: "g" },
            { item: "Oignons jaunes (finement émincés)", quantity: 2, unit: "pièces" },
            { item: "Lardons fumés", quantity: 100, unit: "g" },
            { item: "Muscade, sel, poivre", quantity: 1, unit: "pincée" }
        ],
        instructions: [
            "Préchauffer le four à 250°C (ou au maximum). Étaler la pâte très finement sur une plaque.",
            "Mélanger la crème fraîche avec sel, poivre et muscade. Étaler sur la pâte.",
            "Garnir d'oignons émincés et de lardons (crus).",
            "Cuire 8 à 10 minutes (la pâte doit être croustillante et les bords dorés)."
        ],
        tags: ["plat principal", "français", "régional", "rapide"]
    },
    // RECETTE 272 : Soupe Goulash aux Pommes de Terre (Simple)
    {
        title: "Soupe Goulash aux Pommes de Terre (Simple)",
        description: "Version simplifiée et plus souple du Goulash, concentrée sur le bouillon au paprika, bœuf et pommes de terre.",
        servings: 6,
        prepTime: 20,
        cookTime: 90,
        ingredients: [
            { item: "Bœuf (joue ou gîte)", quantity: 600, unit: "g" },
            { item: "Oignons", quantity: 3, unit: "pièces" },
            { item: "Paprika (doux et fort)", quantity: 2, unit: "c. à soupe" },
            { item: "Pommes de terre, carottes", quantity: 500, unit: "g" },
            { item: "Bouillon de bœuf", quantity: 1.5, unit: "L" }
        ],
        instructions: [
            "Faire dorer la viande. Retirer. Faire revenir les oignons et le paprika.",
            "Remettre la viande. Ajouter le bouillon. Mijoter 1h. Ajouter les pommes de terre et carottes. Cuire 30 min de plus."
        ],
        tags: ["soupe", "européen", "hongrois", "complet"]
    },
    // RECETTE 281 : Macaroni au Fromage (Mac and Cheese Classique)
    {
        title: "Macaroni au Fromage (Mac and Cheese Classique)",
        description: "Plat réconfortant américain : macaronis dans une sauce très crémeuse à base de cheddar, souvent gratiné.",
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        ingredients: [
            { item: "Macaronis", quantity: 400, unit: "g" },
            { item: "Lait", quantity: 40, unit: "cl" },
            { item: "Cheddar (râpé)", quantity: 200, unit: "g" },
            { item: "Beurre, Farine (pour le roux)", quantity: 30, unit: "g" },
            { item: "Muscade (légèrement)", quantity: 1, unit: "pincée" },
            { item: "Chapelure (facultatif, pour gratiner)", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire les macaronis. Préparer une sauce béchamel légère (roux + lait).",
            "Ajouter le cheddar râpé à la béchamel et laisser fondre. Assaisonner.",
            "Mélanger les pâtes à la sauce. Servir tel quel ou gratiner au four 10 min."
        ],
        tags: ["plat principal", "enfant", "américain", "rapide"]
    },
    // RECETTE 288 : Salade Thaï de Bœuf aux Herbes (Larb Neua)
    {
        title: "Salade Thaï de Bœuf aux Herbes (Larb Neua)",
        description: "Salade de viande hachée (bœuf ou poulet) cuite, assaisonnée de Nuoc Mâm, citron vert, riz grillé concassé (Khao Khua) et herbes fraîches.",
        servings: 4,
        prepTime: 15,
        cookTime: 10,
        ingredients: [
            { item: "Bœuf haché ou effiloché", quantity: 400, unit: "g" },
            { item: "Jus de citron vert", quantity: 3, unit: "c. à soupe" },
            { item: "Sauce poisson (Nuoc Mâm)", quantity: 2, unit: "c. à soupe" },
            { item: "Riz grillé concassé (Khao Khua)", quantity: 1, unit: "c. à soupe" },
            { item: "Menthe, Coriandre, Oignon rouge", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire le bœuf haché à sec dans une poêle. Retirer l'excès de graisse.",
            "Mélanger la viande cuite avec la sauce Nuoc Mâm, le jus de citron vert, le Khao Khua, et les herbes/oignons. Servir à température ambiante avec des feuilles de laitue."
        ],
        tags: ["entrée", "asiatique", "thaïlandais", "frais"]
    },
    // RECETTE 289 : Curry Rouge de Canard aux Fruits (Thaï)
    {
        title: "Curry Rouge de Canard aux Fruits (Thaï)",
        description: "Curry rouge riche et aromatique (canard), équilibré par des fruits sucrés (ananas, litchi, raisin) et du lait de coco.",
        servings: 4,
        prepTime: 20,
        cookTime: 35,
        ingredients: [
            { item: "Filet de canard (coupé en tranches)", quantity: 400, unit: "g" },
            { item: "Pâte de curry rouge", quantity: 1, unit: "c. à soupe" },
            { item: "Lait de coco", quantity: 40, unit: "cl" },
            { item: "Bouillon de volaille", quantity: 10, unit: "cl" },
            { item: "Fruits (ananas, litchis, raisins)", quantity: 150, unit: "g" },
            { item: "Feuilles de basilic thaï", quantity: 1, unit: "quantité suffisante" }
        ],
        instructions: [
            "Cuire le canard (côté peau) et le retirer. Faire revenir la pâte de curry dans le lait de coco.",
            "Ajouter le bouillon, la viande et les fruits. Mijoter 15 min. Assaisonner avec Nuoc Mâm et sucre.",
            "Servir chaud avec du basilic thaï."
        ],
        tags: ["plat principal", "asiatique", "thaïlandais", "original"]
    },
];

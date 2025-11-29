import json

# Charger le fichier JSON
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print(f"Total des recettes: {len(recipes)}")

# Traiter les recettes 51 à 100
start_index = 50
end_index = min(100, len(recipes))

for i in range(start_index, end_index):
    recipe = recipes[i]
    
    # Normaliser les allergenCategories
    if 'allergenCategories' not in recipe:
        recipe['allergenCategories'] = {
            "sans_arachides": True,
            "sans_celeri": True,
            "sans_crustaces": True,
            "sans_fruits_a_coque": True,
            "sans_gluten": True,
            "sans_lactose": True,
            "sans_lupin": True,
            "sans_mollusques": True,
            "sans_moutarde": True,
            "sans_oeufs": True,
            "sans_poisson": True,
            "sans_sesame": True,
            "sans_soja": True,
            "sans_sulfites": True
        }
    
    # Corriger selon les allergènes déclarés
    if 'allergens' in recipe:
        for allergen in recipe['allergens']:
            if allergen == 'celeri':
                recipe['allergenCategories']['sans_celeri'] = False
            elif allergen == 'lactose':
                recipe['allergenCategories']['sans_lactose'] = False
            elif allergen == 'gluten':
                recipe['allergenCategories']['sans_gluten'] = False
            elif allergen == 'oeufs':
                recipe['allergenCategories']['sans_oeufs'] = False
            elif allergen == 'poisson':
                recipe['allergenCategories']['sans_poisson'] = False
            elif allergen == 'crustaces':
                recipe['allergenCategories']['sans_crustaces'] = False
            elif allergen == 'mollusques':
                recipe['allergenCategories']['sans_mollusques'] = False
            elif allergen == 'arachides':
                recipe['allergenCategories']['sans_arachides'] = False
            elif allergen == 'soja':
                recipe['allergenCategories']['sans_soja'] = False
            elif allergen == 'fruits_a_coque':
                recipe['allergenCategories']['sans_fruits_a_coque'] = False
            elif allergen == 'moutarde':
                recipe['allergenCategories']['sans_moutarde'] = False
            elif allergen == 'sesame':
                recipe['allergenCategories']['sans_sesame'] = False
            elif allergen == 'sulfites':
                recipe['allergenCategories']['sans_sulfites'] = False
            elif allergen == 'lupin':
                recipe['allergenCategories']['sans_lupin'] = False
    
    print(f"Recette {i+1}: {recipe.get('name', 'Sans nom')} - Mise à jour")

# Sauvegarder
with open('all-recipes-export-2025-11-29.json', 'w', encoding='utf-8') as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"Recettes {start_index+1} à {end_index} mises à jour!")
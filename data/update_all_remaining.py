import json

def update_allergen_categories(recipe):
    """Met à jour les catégories d'allergènes pour une recette"""
    # Initialiser avec tous les allergènes à True (sans allergène)
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

# Charger le fichier JSON
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

total_recipes = len(recipes)
print(f"Total des recettes: {total_recipes}")

# Traiter toutes les recettes restantes (à partir de la 101ème)
start_index = 100
batch_size = 50

current_index = start_index
while current_index < total_recipes:
    end_index = min(current_index + batch_size, total_recipes)
    
    print(f"\nTraitement du lot {current_index + 1} à {end_index}...")
    
    for i in range(current_index, end_index):
        recipe = recipes[i]
        update_allergen_categories(recipe)
        print(f"  Recette {i+1}: {recipe.get('name', 'Sans nom')[:50]}... - Mise à jour")
    
    current_index = end_index
    print(f"Lot terminé ({end_index - start_index} recettes traitées)")

# Sauvegarder le fichier complet
print("\nSauvegarde du fichier...")
with open('all-recipes-export-2025-11-29.json', 'w', encoding='utf-8') as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"\nToutes les recettes ont été mises à jour ! ({total_recipes} recettes au total)")
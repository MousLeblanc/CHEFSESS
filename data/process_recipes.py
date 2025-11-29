import json
import sys

def process_recipes_batch(input_file, output_file, start_index, batch_size):
    """
    Traite un lot de recettes en appliquant les modifications nécessaires
    """
    with open(input_file, 'r', encoding='utf-8') as f:
        recipes = json.load(f)
    
    total_recipes = len(recipes)
    end_index = min(start_index + batch_size, total_recipes)
    
    print(f"Traitement des recettes {start_index + 1} à {end_index} sur {total_recipes}")
    
    # Appliquer les modifications aux recettes du lot
    for i in range(start_index, end_index):
        recipe = recipes[i]
        
        # Exemple de modifications (à adapter selon vos besoins)
        # 1. Normaliser les champs manquants
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
        
        # 2. Vérifier et corriger les allergènes
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
        
        # 3. Normaliser les tags
        if 'tags' not in recipe:
            recipe['tags'] = []
        
        # 4. Ajouter des champs manquants si nécessaire
        if 'establishmentTypes' not in recipe:
            recipe['establishmentTypes'] = recipe.get('establishmentType', [])
        
        print(f"  Recette {i + 1}: {recipe.get('name', 'Sans nom')} - Modifiée")
    
    # Sauvegarder le fichier modifié
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
    
    print(f"Lot traité et sauvegardé dans {output_file}")
    return end_index < total_recipes

if __name__ == "__main__":
    input_file = "all-recipes-export-2025-11-29.json"
    output_file = "all-recipes-export-2025-11-29.json"
    
    batch_size = 50
    start_index = 0
    
    while True:
        has_more = process_recipes_batch(input_file, output_file, start_index, batch_size)
        start_index += batch_size
        
        if not has_more:
            break
        
        # Pause entre les lots (optionnel)
        input(f"Lot terminé. Appuyez sur Entrée pour traiter le lot suivant...")
    
    print("Traitement terminé pour toutes les recettes!")
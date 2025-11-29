import json

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print(f"Correction des establishmentTypes manquants pour {len(recipes)} recettes...")

# Types d'établissements par défaut
default_types = ["ehpad", "hopital", "cantine_scolaire", "cantine_entreprise"]

corrections_made = 0

for i, recipe in enumerate(recipes):
    recipe_name = recipe.get('name', f'Recette {i+1}')
    
    # Vérifier si le champ existe et n'est pas vide
    if 'establishmentTypes' not in recipe or not recipe['establishmentTypes']:
        # Attribuer tous les types par défaut
        recipe['establishmentTypes'] = default_types.copy()
        corrections_made += 1
        print(f"Corrigé: {recipe_name}")
    
    # Vérifier que tous les types attendus sont présents
    current_types = set(recipe['establishmentTypes'])
    missing_types = set(default_types) - current_types
    
    if missing_types:
        # Ajouter les types manquants
        recipe['establishmentTypes'].extend(list(missing_types))
        corrections_made += 1
        print(f"Complété: {recipe_name} - ajouté: {list(missing_types)}")

# Sauvegarder
with open('all-recipes-export-2025-11-29.json', 'w', encoding='utf-8') as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"\nCorrections appliquées: {corrections_made}")
print("Toutes les recettes ont maintenant les 4 types d'établissements!")
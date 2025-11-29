import json

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print(f"Analyse des establishmentTypes pour {len(recipes)} recettes...")

# Collecter toutes les valeurs uniques
all_establishment_types = set()
recipes_with_issues = []

for i, recipe in enumerate(recipes):
    recipe_name = recipe.get('name', f'Recette {i+1}')
    
    # Vérifier si le champ existe
    if 'establishmentTypes' not in recipe:
        recipes_with_issues.append((i+1, recipe_name, "Champ manquant"))
        continue
    
    establishment_types = recipe['establishmentTypes']
    
    # Vérifier si le champ est vide
    if not establishment_types:
        recipes_with_issues.append((i+1, recipe_name, "Champ vide"))
        continue
    
    # Collecter toutes les valeurs
    for et_type in establishment_types:
        all_establishment_types.add(et_type)

print(f"\nNombre total de categories uniques: {len(all_establishment_types)}")
print("\nToutes les categories trouvees:")
for i, et_type in enumerate(sorted(all_establishment_types), 1):
    print(f"{i}. {et_type}")

# Compter les occurrences de chaque type
type_counts = {}
for recipe in recipes:
    if 'establishmentTypes' in recipe and recipe['establishmentTypes']:
        for et_type in recipe['establishmentTypes']:
            type_counts[et_type] = type_counts.get(et_type, 0) + 1

print(f"\nRepartition par categorie:")
for et_type in sorted(type_counts.keys()):
    print(f"- {et_type}: {type_counts[et_type]} recettes")

# Types attendus
expected_types = ["ehpad", "hopital", "cantine_scolaire", "cantine_entreprise"]

print(f"\nVerification des types attendus:")
for et_type in expected_types:
    if et_type in all_establishment_types:
        print(f"OK - {et_type} present ({type_counts.get(et_type, 0)} recettes)")
    else:
        print(f"MANQUE - {et_type}")

unexpected_types = all_establishment_types - set(expected_types)
if unexpected_types:
    print(f"\nTypes non attendus:")
    for et_type in sorted(unexpected_types):
        print(f"- {et_type} ({type_counts.get(et_type, 0)} recettes)")

print(f"\nProblemes detectes:")
print(f"- Recettes avec champ manquant ou vide: {len(recipes_with_issues)}")
print(f"- Types non standard: {len(unexpected_types)}")

print(f"\nRESUME:")
print(f"- Total categories: {len(all_establishment_types)}")
print(f"- Categories attendues presentes: {len(set(expected_types) & all_establishment_types)}/4")
print(f"- Toutes les categories attendues sont presentes: {'OUI' if len(set(expected_types) & all_establishment_types) == 4 else 'NON'}")
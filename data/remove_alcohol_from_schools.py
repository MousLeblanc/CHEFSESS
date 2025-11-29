import json

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print(f"Vérification de l'alcool dans {len(recipes)} recettes...")

# Mots-clés d'alcool à détecter
alcohol_keywords = [
    'vin', 'wine', 'bière', 'beer', 'rhum', 'rum', 'cognac', 'whisky', 'vodka',
    'amaretto', 'madère', 'porto', 'champagne', 'alcool', 'alcohol', 'liqueur',
    'kirsch', 'calvados', 'armagnac', 'gin', 'tequila', 'sake', 'shaoxing'
]

recipes_with_alcohol = []
corrections_made = 0

for i, recipe in enumerate(recipes):
    recipe_name = recipe.get('name', f'Recette {i+1}')
    has_alcohol = False
    
    # Vérifier dans les ingrédients
    if 'ingredients' in recipe:
        for ingredient in recipe['ingredients']:
            ingredient_name = ingredient.get('name', '').lower()
            for keyword in alcohol_keywords:
                if keyword in ingredient_name:
                    has_alcohol = True
                    break
            if has_alcohol:
                break
    
    # Vérifier dans les étapes de préparation
    if not has_alcohol and 'preparationSteps' in recipe:
        for step in recipe['preparationSteps']:
            step_text = step.lower()
            for keyword in alcohol_keywords:
                if keyword in step_text:
                    has_alcohol = True
                    break
            if has_alcohol:
                break
    
    # Vérifier dans le nom et la description
    if not has_alcohol:
        full_text = (recipe_name + ' ' + recipe.get('description', '')).lower()
        for keyword in alcohol_keywords:
            if keyword in full_text:
                has_alcohol = True
                break
    
    # Si la recette contient de l'alcool
    if has_alcohol:
        recipes_with_alcohol.append((i+1, recipe_name))
        
        # Retirer "cantine_scolaire" des establishmentTypes
        if 'establishmentTypes' in recipe and 'cantine_scolaire' in recipe['establishmentTypes']:
            recipe['establishmentTypes'].remove('cantine_scolaire')
            corrections_made += 1
            print(f"Retiré cantine_scolaire de: {recipe_name}")

print(f"\n=== RÉSULTATS ===")
print(f"Recettes avec alcool détectées: {len(recipes_with_alcohol)}")
print(f"Corrections appliquées: {corrections_made}")

if recipes_with_alcohol:
    print(f"\nExemples de recettes avec alcool:")
    for idx, name in recipes_with_alcohol[:10]:
        print(f"  {idx}: {name}")
    
    if len(recipes_with_alcohol) > 10:
        print(f"  ... et {len(recipes_with_alcohol) - 10} autres")

# Sauvegarder
with open('all-recipes-export-2025-11-29.json', 'w', encoding='utf-8') as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"\nFichier sauvegardé avec les corrections!")

# Vérification finale
school_recipes_count = 0
for recipe in recipes:
    if 'establishmentTypes' in recipe and 'cantine_scolaire' in recipe['establishmentTypes']:
        school_recipes_count += 1

print(f"Recettes restantes pour cantine_scolaire: {school_recipes_count}")
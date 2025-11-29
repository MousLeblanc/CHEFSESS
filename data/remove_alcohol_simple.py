import json

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

# Mots-clés d'alcool
alcohol_keywords = ['vin', 'wine', 'bière', 'beer', 'rhum', 'rum', 'cognac', 'whisky', 'vodka', 'amaretto', 'madère', 'porto', 'champagne', 'alcool', 'shaoxing']

corrections_made = 0
recipes_with_alcohol = 0

for recipe in recipes:
    has_alcohol = False
    
    # Vérifier dans les ingrédients
    if 'ingredients' in recipe:
        for ingredient in recipe['ingredients']:
            ingredient_name = ingredient.get('name', '').lower()
            if any(keyword in ingredient_name for keyword in alcohol_keywords):
                has_alcohol = True
                break
    
    # Vérifier dans le nom et description
    if not has_alcohol:
        full_text = (recipe.get('name', '') + ' ' + recipe.get('description', '')).lower()
        if any(keyword in full_text for keyword in alcohol_keywords):
            has_alcohol = True
    
    # Si alcool détecté, retirer cantine_scolaire
    if has_alcohol:
        recipes_with_alcohol += 1
        if 'establishmentTypes' in recipe and 'cantine_scolaire' in recipe['establishmentTypes']:
            recipe['establishmentTypes'].remove('cantine_scolaire')
            corrections_made += 1

# Sauvegarder
with open('all-recipes-export-2025-11-29.json', 'w', encoding='utf-8') as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"Recettes avec alcool: {recipes_with_alcohol}")
print(f"Corrections: {corrections_made}")
print("Termine!")
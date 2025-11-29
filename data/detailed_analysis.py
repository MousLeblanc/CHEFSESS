import json

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print("=== ANALYSE DETAILLEE DES PROBLEMES ===\n")

# 1. Rechercher les recettes complètement en anglais
english_recipes = []
for i, recipe in enumerate(recipes):
    name = recipe.get('name', '')
    # Détecter les noms complètement en anglais
    if any(word in name.upper() for word in ['CHICKEN', 'BEEF', 'PORK', 'SHRIMP', 'SOUP', 'SAUCE', 'PASTA']):
        english_recipes.append((i+1, name))

print(f"1. RECETTES AVEC NOMS EN ANGLAIS: {len(english_recipes)}")
for idx, name in english_recipes[:10]:
    print(f"   {idx}: {name}")
if len(english_recipes) > 10:
    print(f"   ... et {len(english_recipes) - 10} autres")

# 2. Fautes d'orthographe courantes
spelling_issues = []
for i, recipe in enumerate(recipes):
    name = recipe.get('name', '')
    description = recipe.get('description', '')
    
    # Rechercher des fautes spécifiques
    if 'buf' in name.lower() or 'buf' in description.lower():
        spelling_issues.append((i+1, name, "buf -> bœuf"))
    if 'ufs' in name.lower() or 'ufs' in description.lower():
        spelling_issues.append((i+1, name, "ufs -> œufs"))

print(f"\n2. FAUTES D'ORTHOGRAPHE DETECTEES: {len(spelling_issues)}")
for idx, name, error in spelling_issues[:10]:
    print(f"   {idx}: {name} ({error})")

# 3. Ingrédients en anglais
english_ingredients_count = 0
for recipe in recipes:
    if 'ingredients' in recipe:
        for ingredient in recipe['ingredients']:
            name = ingredient.get('name', '')
            if any(word in name.lower() for word in ['chicken', 'beef', 'pork', 'sauce', 'oil', 'salt', 'pepper']):
                english_ingredients_count += 1

print(f"\n3. INGREDIENTS EN ANGLAIS: {english_ingredients_count}")

# 4. Étapes de préparation en anglais
english_steps_count = 0
english_steps_recipes = []
for i, recipe in enumerate(recipes):
    if 'preparationSteps' in recipe:
        for step in recipe['preparationSteps']:
            if any(phrase in step.lower() for phrase in ['heat', 'cook until', 'add the', 'mix well', 'bring to']):
                english_steps_count += 1
                if (i+1, recipe.get('name', '')) not in english_steps_recipes:
                    english_steps_recipes.append((i+1, recipe.get('name', '')))
                break

print(f"\n4. RECETTES AVEC ETAPES EN ANGLAIS: {len(english_steps_recipes)}")
for idx, name in english_steps_recipes[:5]:
    print(f"   {idx}: {name}")

# 5. Unités de mesure en anglais
english_units = []
for i, recipe in enumerate(recipes):
    if 'ingredients' in recipe:
        for ingredient in recipe['ingredients']:
            unit = ingredient.get('unit', '')
            if unit in ['cups', 'tsp', 'tbsp', 'oz', 'lb']:
                english_units.append((i+1, recipe.get('name', ''), unit))

print(f"\n5. UNITES EN ANGLAIS: {len(english_units)}")
for idx, name, unit in english_units[:5]:
    print(f"   {idx}: {name} (unite: {unit})")

print(f"\n=== RESUME ===")
print(f"Total recettes: {len(recipes)}")
print(f"Recettes avec noms anglais: {len(english_recipes)}")
print(f"Recettes avec fautes orthographe: {len(spelling_issues)}")
print(f"Recettes avec etapes anglaises: {len(english_steps_recipes)}")
print(f"Ingredients avec unites anglaises: {len(english_units)}")

percentage_issues = ((len(english_recipes) + len(english_steps_recipes)) / len(recipes)) * 100
print(f"Pourcentage recettes avec problemes majeurs: {percentage_issues:.1f}%")
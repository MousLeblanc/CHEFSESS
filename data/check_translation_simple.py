import json

def check_translation_issues(recipes):
    """Vérifie les problèmes de traduction et d'orthographe"""
    issues = []
    
    for i, recipe in enumerate(recipes):
        recipe_issues = []
        recipe_name = recipe.get('name', f'Recette {i+1}')
        
        # Vérifier les ingrédients
        if 'ingredients' in recipe:
            for j, ingredient in enumerate(recipe['ingredients']):
                name = ingredient.get('name', '')
                
                # Détecter les textes en anglais (mots courants)
                english_words = ['chicken', 'beef', 'pork', 'shrimp', 'garlic', 'onion', 'water', 
                               'salt', 'pepper', 'oil', 'sauce', 'broth', 'cups', 'tsp', 'tbsp',
                               'ground', 'fresh', 'dried', 'sliced', 'chopped', 'minced',
                               'large', 'medium', 'small', 'baby', 'whole', 'half']
                
                for word in english_words:
                    if word.lower() in name.lower():
                        recipe_issues.append(f"Ingredient {j+1} en anglais: {name}")
                        break
                
                # Vérifier les unités en anglais
                unit = ingredient.get('unit', '')
                english_units = ['cups', 'tsp', 'tbsp', 'oz', 'lb', 'inch', 'inches']
                if unit in english_units:
                    recipe_issues.append(f"Unite en anglais: {unit} pour {name}")
        
        # Vérifier les étapes de préparation
        if 'preparationSteps' in recipe:
            for j, step in enumerate(recipe['preparationSteps']):
                # Détecter les phrases en anglais
                english_indicators = ['heat', 'cook', 'add', 'mix', 'combine', 'place', 'remove',
                                    'transfer', 'bring to', 'simmer', 'boil', 'minutes', 'until']
                
                english_count = sum(1 for word in english_indicators if word.lower() in step.lower())
                if english_count >= 3:  # Si plusieurs mots anglais détectés
                    recipe_issues.append(f"Etape {j+1} probablement en anglais")
        
        # Vérifier les fautes d'orthographe courantes dans le nom
        common_errors = ['buf', 'ufs', 'uf ']
        for error in common_errors:
            if error in recipe_name.lower():
                recipe_issues.append(f"Faute orthographe dans nom: {error}")
        
        if recipe_issues:
            issues.append({
                'recipe_index': i + 1,
                'recipe_name': recipe_name,
                'issues': recipe_issues
            })
    
    return issues

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print(f"Analyse de {len(recipes)} recettes...")

# Vérifier les problèmes
issues = check_translation_issues(recipes)

print(f"\nRecettes avec des problemes: {len(issues)}")

# Compter les types de problèmes
english_ingredients = 0
english_units = 0
english_steps = 0
spelling_errors = 0

for issue in issues:
    for problem in issue['issues']:
        if 'en anglais:' in problem:
            english_ingredients += 1
        elif 'Unite en anglais:' in problem:
            english_units += 1
        elif 'probablement en anglais' in problem:
            english_steps += 1
        elif 'Faute orthographe' in problem:
            spelling_errors += 1

print(f"\nTypes de problemes detectes:")
print(f"- Ingredients en anglais: {english_ingredients}")
print(f"- Unites en anglais: {english_units}")
print(f"- Etapes en anglais: {english_steps}")
print(f"- Fautes orthographe: {spelling_errors}")

# Afficher quelques exemples
print(f"\nExemples de recettes avec problemes:")
for i, issue in enumerate(issues[:5]):
    print(f"{issue['recipe_index']}: {issue['recipe_name']}")
    for problem in issue['issues'][:3]:
        print(f"  - {problem}")

print(f"\nAnalyse terminee. {len(issues)} recettes necessitent des corrections.")
import json
import re

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
                        recipe_issues.append(f"Ingrédient {j+1} en anglais: '{name}'")
                        break
                
                # Vérifier les unités en anglais
                unit = ingredient.get('unit', '')
                english_units = ['cups', 'tsp', 'tbsp', 'oz', 'lb', 'inch', 'inches']
                if unit in english_units:
                    recipe_issues.append(f"Unité en anglais: '{unit}' pour '{name}'")
        
        # Vérifier les étapes de préparation
        if 'preparationSteps' in recipe:
            for j, step in enumerate(recipe['preparationSteps']):
                # Détecter les phrases en anglais
                english_indicators = ['heat', 'cook', 'add', 'mix', 'combine', 'place', 'remove',
                                    'transfer', 'bring to', 'simmer', 'boil', 'minutes', 'until']
                
                english_count = sum(1 for word in english_indicators if word.lower() in step.lower())
                if english_count >= 3:  # Si plusieurs mots anglais détectés
                    recipe_issues.append(f"Étape {j+1} probablement en anglais: '{step[:100]}...'")
        
        # Vérifier les fautes d'orthographe courantes
        text_to_check = recipe_name + ' ' + str(recipe.get('description', ''))
        
        # Fautes courantes détectées
        common_errors = {
            'buf': 'bœuf',
            'ufs': 'œufs',
            'uf': 'œuf',
            'creme': 'crème',
            'epices': 'épices',
            'legumes': 'légumes',
            'melange': 'mélange',
            'prechauffer': 'préchauffer'
        }
        
        for error, correction in common_errors.items():
            if error in text_to_check.lower():
                recipe_issues.append(f"Faute d'orthographe possible: '{error}' → '{correction}'")
        
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

print(f"\n=== RÉSULTATS DE L'ANALYSE ===")
print(f"Recettes avec des problèmes: {len(issues)}")

# Afficher les premiers problèmes
for i, issue in enumerate(issues[:10]):  # Limiter à 10 pour l'affichage
    print(f"\n--- Recette {issue['recipe_index']}: {issue['recipe_name']} ---")
    for problem in issue['issues'][:5]:  # Limiter à 5 problèmes par recette
        print(f"  • {problem}")

if len(issues) > 10:
    print(f"\n... et {len(issues) - 10} autres recettes avec des problèmes")

# Statistiques
total_issues = sum(len(issue['issues']) for issue in issues)
print(f"\nTotal des problèmes détectés: {total_issues}")

# Sauvegarder le rapport détaillé
with open('translation_issues_report.json', 'w', encoding='utf-8') as f:
    json.dump(issues, f, ensure_ascii=False, indent=2)

print(f"\nRapport détaillé sauvegardé dans 'translation_issues_report.json'")
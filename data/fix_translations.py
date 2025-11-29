import json
import re

def fix_recipe_translations(recipes):
    """Corrige les traductions et fautes d'orthographe"""
    
    # Dictionnaires de traduction
    ingredient_translations = {
        'chicken': 'poulet', 'beef': 'bœuf', 'pork': 'porc', 'shrimp': 'crevettes',
        'garlic': 'ail', 'onion': 'oignon', 'salt': 'sel', 'pepper': 'poivre',
        'oil': 'huile', 'sauce': 'sauce', 'broth': 'bouillon', 'water': 'eau',
        'butter': 'beurre', 'cream': 'crème', 'milk': 'lait', 'cheese': 'fromage',
        'egg': 'œuf', 'eggs': 'œufs', 'flour': 'farine', 'sugar': 'sucre',
        'tomato': 'tomate', 'potato': 'pomme de terre', 'carrot': 'carotte',
        'mushroom': 'champignon', 'mushrooms': 'champignons', 'rice': 'riz',
        'pasta': 'pâtes', 'noodles': 'nouilles', 'bread': 'pain',
        'fresh': 'frais', 'dried': 'séché', 'ground': 'haché', 'sliced': 'tranché',
        'chopped': 'haché', 'minced': 'émincé', 'large': 'gros', 'medium': 'moyen',
        'small': 'petit', 'baby': 'petit', 'whole': 'entier', 'half': 'demi'
    }
    
    unit_translations = {
        'cups': 'tasses', 'cup': 'tasse', 'tsp': 'c. à café', 'tbsp': 'c. à soupe',
        'oz': 'g', 'lb': 'kg', 'inch': 'cm', 'inches': 'cm', 'bunch': 'botte'
    }
    
    # Corrections orthographiques
    spelling_fixes = {
        'buf': 'bœuf', 'ufs': 'œufs', 'uf ': 'œuf ', 'creme': 'crème',
        'epices': 'épices', 'legumes': 'légumes', 'melange': 'mélange'
    }
    
    corrections_count = 0
    
    for recipe in recipes:
        # Corriger le nom
        name = recipe.get('name', '')
        original_name = name
        
        # Corrections orthographiques dans le nom
        for error, correction in spelling_fixes.items():
            name = name.replace(error, correction)
        
        if name != original_name:
            recipe['name'] = name
            corrections_count += 1
        
        # Corriger la description
        if 'description' in recipe:
            desc = recipe['description']
            for error, correction in spelling_fixes.items():
                desc = desc.replace(error, correction)
            recipe['description'] = desc
        
        # Corriger les ingrédients
        if 'ingredients' in recipe:
            for ingredient in recipe['ingredients']:
                if 'name' in ingredient:
                    ing_name = ingredient['name']
                    
                    # Traductions d'ingrédients
                    for eng, fr in ingredient_translations.items():
                        ing_name = re.sub(r'\b' + eng + r'\b', fr, ing_name, flags=re.IGNORECASE)
                    
                    # Corrections orthographiques
                    for error, correction in spelling_fixes.items():
                        ing_name = ing_name.replace(error, correction)
                    
                    ingredient['name'] = ing_name
                
                # Corriger les unités
                if 'unit' in ingredient:
                    unit = ingredient['unit']
                    if unit in unit_translations:
                        ingredient['unit'] = unit_translations[unit]
        
        # Corriger les étapes (traduction basique)
        if 'preparationSteps' in recipe:
            for i, step in enumerate(recipe['preparationSteps']):
                # Traductions de base pour les étapes
                step_translations = {
                    'heat': 'chauffer', 'cook': 'cuire', 'add': 'ajouter',
                    'mix': 'mélanger', 'combine': 'combiner', 'place': 'placer',
                    'remove': 'retirer', 'transfer': 'transférer', 'bring to': 'porter à',
                    'simmer': 'mijoter', 'boil': 'bouillir', 'minutes': 'minutes',
                    'until': 'jusqu\'à ce que', 'serve': 'servir', 'season': 'assaisonner'
                }
                
                for eng, fr in step_translations.items():
                    step = re.sub(r'\b' + eng + r'\b', fr, step, flags=re.IGNORECASE)
                
                recipe['preparationSteps'][i] = step
    
    return corrections_count

# Charger le fichier
with open('all-recipes-export-2025-11-29.json', 'r', encoding='utf-8') as f:
    recipes = json.load(f)

print(f"Correction de {len(recipes)} recettes...")

# Appliquer les corrections
corrections = fix_recipe_translations(recipes)

# Sauvegarder
with open('all-recipes-export-2025-11-29.json', 'w', encoding='utf-8') as f:
    json.dump(recipes, f, ensure_ascii=False, indent=2)

print(f"Corrections appliquées: {corrections}")
print("Fichier sauvegardé avec les corrections!")
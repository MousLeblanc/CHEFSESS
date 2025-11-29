#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de correction automatique des recettes
Corrige les traductions, allergènes, et incohérences
"""

import json
import re

def clean_ingredient_name(name):
    """Nettoie et traduit les noms d'ingrédients"""
    translations = {
        'water': 'eau',
        'sugar': 'sucre',
        'oil': 'huile',
        'olive oil': "huile d'olive",
        'lemon': 'citron',
        'garlic': 'ail',
        'mint': 'menthe',
        'anisette liqueur': 'liqueur d\'anisette',
        'aniseed': 'anis',
        'pineapple': 'ananas',
        'strawberries': 'fraises',
        'kiwi fruit': 'kiwis',
        'grapes': 'raisins',
        'artichokes': 'artichauts',
        'lemons': 'citrons',
        'cloves': 'gousses',
        'chopped': 'haché',
        'minced': 'émincé',
        'fresh': 'frais',
        'halved': 'coupé en deux',
        'peeled': 'pelé',
        'cored': 'épépiné',
        'cubes': 'cubes',
        'baskets': 'barquettes'
    }
    
    # Nettoyer les formats bizarres
    name = re.sub(r'^\d+(/\d+)?\s+', '', name)
    name = name.strip()
    
    # Traduire
    for eng, fr in translations.items():
        name = re.sub(r'\b' + eng + r'\b', fr, name, flags=re.IGNORECASE)
    
    return name

def clean_unit(unit):
    """Nettoie et traduit les unités"""
    translations = {
        'cup': 'tasse',
        'cups': 'tasses',
        'tablespoon': 'c. à soupe',
        'tablespoons': 'c. à soupe',
        'teaspoon': 'c. à café',
        'teaspoons': 'c. à café',
        'ounce': 'once',
        'ounces': 'onces',
        'pound': 'livre',
        'pounds': 'livres',
        'inch': 'pouce',
        'inches': 'pouces',
        'large': 'grand',
        'medium': 'moyen',
        'small': 'petit',
        'unit': 'pièce'
    }
    
    unit = unit.strip()
    for eng, fr in translations.items():
        unit = re.sub(r'\b' + eng + r'\b', fr, unit, flags=re.IGNORECASE)
    
    return unit

def detect_allergens(ingredients):
    """Détecte automatiquement les allergènes"""
    allergens = set()
    
    allergen_keywords = {
        'gluten': ['farine', 'blé', 'pain', 'pâte', 'semoule'],
        'lactose': ['lait', 'crème', 'beurre', 'fromage', 'yaourt', 'ricotta', 'emmental', 'parmesan', 'mascarpone'],
        'oeufs': ['œuf', 'oeuf', 'jaune', 'blanc d\'œuf'],
        'poisson': ['poisson', 'saumon', 'cabillaud', 'dorade', 'raie', 'thon'],
        'crustaces': ['crevette', 'crabe', 'homard', 'langouste'],
        'mollusques': ['moule', 'huître', 'calamar', 'seiche'],
        'arachides': ['cacahuète', 'arachide', 'peanut'],
        'fruits_a_coque': ['noix', 'amande', 'noisette', 'cajou', 'pistache', 'pécan', 'noix de pécan'],
        'celeri': ['céleri', 'celeri'],
        'moutarde': ['moutarde'],
        'sesame': ['sésame', 'sesame'],
        'soja': ['soja', 'tofu'],
        'sulfites': ['vin', 'vinaigre'],
        'lupin': ['lupin']
    }
    
    for ingredient in ingredients:
        name = ingredient.get('name', '').lower()
        for allergen, keywords in allergen_keywords.items():
            if any(keyword in name for keyword in keywords):
                allergens.add(allergen)
    
    return list(allergens)

def fix_dietary_restrictions(recipe):
    """Corrige les restrictions alimentaires selon les ingrédients"""
    ingredients_text = ' '.join([ing.get('name', '').lower() for ing in recipe.get('ingredients', [])])
    
    restrictions = []
    
    # Végétarien si pas de viande/poisson
    meat_keywords = ['poulet', 'bœuf', 'porc', 'veau', 'agneau', 'canard', 'dinde', 'viande', 'poisson', 'saumon', 'thon', 'jambon', 'lard', 'bacon']
    if not any(keyword in ingredients_text for keyword in meat_keywords):
        restrictions.append('végétarien')
    
    # Végétalien si pas de produits animaux
    animal_keywords = meat_keywords + ['lait', 'crème', 'beurre', 'fromage', 'œuf', 'oeuf', 'miel']
    if not any(keyword in ingredients_text for keyword in animal_keywords):
        restrictions.append('végétalien')
    
    # Halal si pas de porc
    if 'porc' not in ingredients_text and 'jambon' not in ingredients_text and 'lard' not in ingredients_text:
        if 'végétarien' not in restrictions and 'végétalien' not in restrictions:
            restrictions.append('halal')
    
    # Casher similaire
    if 'porc' not in ingredients_text:
        if 'végétarien' not in restrictions and 'végétalien' not in restrictions:
            restrictions.append('casher')
    
    return restrictions

def correct_recipe(recipe):
    """Corrige une recette complète"""
    
    # Corriger les ingrédients
    if 'ingredients' in recipe:
        for ing in recipe['ingredients']:
            if 'name' in ing:
                ing['name'] = clean_ingredient_name(ing['name'])
            if 'unit' in ing:
                ing['unit'] = clean_unit(ing['unit'])
    
    # Détecter les allergènes
    if 'ingredients' in recipe:
        detected_allergens = detect_allergens(recipe['ingredients'])
        recipe['allergens'] = detected_allergens
        
        # Mettre à jour allergenCategories
        allergen_categories = {
            'sans_arachides': 'arachides' not in detected_allergens,
            'sans_celeri': 'celeri' not in detected_allergens,
            'sans_crustaces': 'crustaces' not in detected_allergens,
            'sans_fruits_a_coque': 'fruits_a_coque' not in detected_allergens,
            'sans_gluten': 'gluten' not in detected_allergens,
            'sans_lactose': 'lactose' not in detected_allergens,
            'sans_lupin': 'lupin' not in detected_allergens,
            'sans_mollusques': 'mollusques' not in detected_allergens,
            'sans_moutarde': 'moutarde' not in detected_allergens,
            'sans_oeufs': 'oeufs' not in detected_allergens,
            'sans_poisson': 'poisson' not in detected_allergens,
            'sans_sesame': 'sesame' not in detected_allergens,
            'sans_soja': 'soja' not in detected_allergens,
            'sans_sulfites': 'sulfites' not in detected_allergens
        }
        recipe['allergenCategories'] = allergen_categories
    
    # Corriger les restrictions alimentaires
    recipe['dietaryRestrictions'] = fix_dietary_restrictions(recipe)
    
    # Corriger les tags
    if 'végétarien' in recipe.get('dietaryRestrictions', []):
        if 'tags' not in recipe:
            recipe['tags'] = []
        recipe['tags'] = [tag for tag in recipe['tags'] if not tag.startswith('type:')]
        recipe['tags'].append('type:végétarien')
    
    return recipe

def main():
    """Fonction principale"""
    input_file = 'all-recipes-export-2025-11-29.json'
    output_file = 'all-recipes-corrected.json'
    
    print(f"Lecture de {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Correction de {len(data)} recettes...")
    corrected_data = []
    for i, recipe in enumerate(data):
        try:
            corrected_recipe = correct_recipe(recipe)
            corrected_data.append(corrected_recipe)
            if (i + 1) % 10 == 0:
                print(f"  {i + 1}/{len(data)} recettes corrigées...")
        except Exception as e:
            print(f"Erreur sur la recette {i}: {e}")
            corrected_data.append(recipe)
    
    print(f"Écriture dans {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(corrected_data, f, ensure_ascii=False, indent=2)
    
    print("Correction terminée!")

if __name__ == '__main__':
    main()

import os
import sys
import json
import time
from openai import OpenAI

# ----------------------------------------------------
# CONFIG
# ----------------------------------------------------
MODEL = "gpt-4o-mini"
SLEEP_BETWEEN_CALLS = 0.15

# ⚠️ pour tester, on limite à X recettes
# Mets None pour tout traiter
MAX_RECIPES = 10   # ← teste d'abord sur 10 recettes

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

SYSTEM_PROMPT = """
Tu traduis et corriges UNE recette au format JSON pour une application culinaire française.

RÈGLES :
1. Traduire en français : nom, description, ingrédients, étapes, catégories, hashtags, tags.
2. Convertir les unités US → unités françaises métriques : g, kg, ml, cl, dl, L, c. à café, c. à soupe.
3. Ajuster les quantités selon conversions réalistes.
4. Corriger l’orthographe, garder un style simple de fiche technique.
5. Ne pas changer la structure JSON (mêmes clés, mêmes types), sauf unités/quantités adaptées.
6. Toujours renvoyer un JSON VALIDE, sans texte autour.
"""

def show_change(label, before, after):
    """Affiche une diff simple pour un champ."""
    if before is None and after is None:
        return
    # si c'est identique, tu verras aussi que rien n'a changé
    print(f"  {label}")
    print(f"    AVANT : {before}")
    print(f"    APRES : {after}\n")


def process_recipe(recipe, index, total):
    print(f"\n=== Recette {index+1}/{total} ===")
    original = json.loads(json.dumps(recipe))  # copie profonde

    nom = original.get("name", "(sans nom)")
    print("Nom original :", nom)

    user_prompt = (
        "Voici une recette JSON à traduire/corriger/convertir.\n"
        "Renvoie uniquement le JSON corrigé.\n\n"
        + json.dumps(recipe, ensure_ascii=False, indent=2)
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            timeout=60,  # évite de rester bloqué trop longtemps
        )
        content = response.choices[0].message.content.strip()
        new_recipe = json.loads(content)
    except Exception as e:
        print("⚠️ Erreur → recette gardée telle quelle :", e)
        return recipe

    print("🔍 CHANGEMENTS :")

    # Nom
    show_change("★ Nom",
                original.get("name"), new_recipe.get("name"))

    # Description
    show_change("★ Description",
                original.get("description"), new_recipe.get("description"))

    # Ingrédients (on limite l'affichage des exemples)
    if "ingredients" in original and "ingredients" in new_recipe:
        print("★ Ingrédients (quelques exemples)")
        for i, ing in enumerate(original["ingredients"][:5]):  # max 5 affichés
            old = ing.get("name")
            new = new_recipe["ingredients"][i].get("name")
            show_change(f"   - ingr {i+1}", old, new)

    # Étapes (on affiche les 3 premières)
    if "preparationSteps" in original and "preparationSteps" in new_recipe:
        print("★ Étapes (quelques exemples)")
        for i, step in enumerate(original["preparationSteps"][:3]):
            old = step
            new = new_recipe["preparationSteps"][i]
            show_change(f"   - étape {i+1}", old, new)

    print("✅ Recette traitée avec succès.\n")
    return new_recipe


def main():
    if len(sys.argv) < 3:
        print("Usage: python translate_recipes_openai.py <input.json> fr")
        return

    input_file = sys.argv[1]
    target_lang = sys.argv[2]

    if not os.path.exists(input_file):
        print("Fichier introuvable :", input_file)
        return

    print("📂 Chargement du fichier :", input_file)
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("Le fichier doit contenir une LISTE de recettes.")
        return

    if MAX_RECIPES is not None:
        data = data[:MAX_RECIPES]

    total = len(data)
    print(f"🔄 Recettes à traiter : {total}")

    output = []
    for i, recipe in enumerate(data):
        new_recipe = process_recipe(recipe, i, total)
        output.append(new_recipe)

        # petite sauvegarde de sécurité
        if (i+1) % 10 == 0:
            backup = f"partial_live_fr_{i+1}.json"
            with open(backup, "w", encoding="utf-8") as bf:
                json.dump(output, bf, ensure_ascii=False, indent=2)
            print(f"💾 Sauvegarde intermédiaire → {backup}")

        time.sleep(SLEEP_BETWEEN_CALLS)

    out_file = "translated_live_fr_test.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("\n🎉 TERMINÉ pour ce lot de recettes.")
    print("📁 Fichier généré :", out_file)


if __name__ == "__main__":
    main()

import os
import sys
import json
import time
from openai import OpenAI

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
MODEL = "gpt-4o-mini"
SLEEP_BETWEEN_CALLS = 0.15

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

SYSTEM_PROMPT = """
Tu traduis et corriges UNE recette au format JSON pour une application culinaire française.

RÈGLES :
1. Traduire en français : nom, description, ingrédients, étapes, catégories, hashtags, tags.
2. Convertir les unités US → unités françaises métriques : g, kg, ml, cl, dl, L, c. à café, c. à soupe.
3. Ajuster les quantités selon conversions réelles.
4. Corriger l’orthographe et simplifier les phrases.
5. Ne pas changer la structure JSON.
6. Toujours renvoyer un JSON valide, sans texte autour.
"""

def show_changes(original, new):
    """Affiche les différences texte avant/après."""
    print(f"     AVANT : {original}")
    print(f"     APRES : {new}\n")

def process_recipe(recipe, index, total):
    print(f"\n=== Recette {index+1}/{total} ===")

    # sauvegarde originale pour comparaison
    original_recipe = json.loads(json.dumps(recipe))

    # préparation du prompt
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
        )

        content = response.choices[0].message.content.strip()
        new_recipe = json.loads(content)

    except Exception as e:
        print("⚠️ Erreur → recette gardée originale :", str(e))
        return recipe

    # ------------------------------------------------------------------
    # MODE LIVE : AFFICHAGE AVANT / APRÈS
    # ------------------------------------------------------------------

    print("\n🔍 CHANGEMENTS EN TEMPS RÉEL :")

    # Nom
    if "name" in recipe:
        print("\n★ Nom")
        show_changes(original_recipe.get("name"), new_recipe.get("name"))

    # Description
    if "description" in recipe:
        print("★ Description")
        show_changes(original_recipe.get("description"), new_recipe.get("description"))

    # Ingrédients
    if "ingredients" in recipe:
        print("★ Ingrédients")
        for i, ing in enumerate(recipe["ingredients"]):
            old = ing.get("name")
            new = new_recipe["ingredients"][i].get("name")
            show_changes(old, new)

    # Étapes
    if "preparationSteps" in recipe:
        print("★ Étapes")
        for i, step in enumerate(recipe["preparationSteps"]):
            old = step
            new = new_recipe["preparationSteps"][i]
            show_changes(old, new)

    # Catégories et tags
    for field in ["category", "tags", "hashtags", "diet", "pathologies"]:
        if field in recipe:
            print(f"★ {field}")
            old = original_recipe.get(field)
            new = new_recipe.get(field)
            if isinstance(old, list):
                for i in range(min(len(old), len(new))):
                    show_changes(old[i], new[i])
            else:
                show_changes(old, new)

    print("→ Recette traitée ✔️\n")
    return new_recipe


def main():
    if len(sys.argv) < 3:
        print("Usage: python translate_recipes_openai.py <input.json> fr")
        return

    input_file = sys.argv[1]
    target = sys.argv[2]

    if not os.path.exists(input_file):
        print("Fichier introuvable :", input_file)
        return

    print("📂 Chargement :", input_file)
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print("Le fichier doit contenir une LISTE de recettes.")
        return

    total = len(data)
    print(f"🔄 Recettes à traiter : {total}")

    output = []
    for i, recipe in enumerate(data):
        output.append(process_recipe(recipe, i, total))

        # sauvegarde toutes les 30 recettes
        if (i+1) % 30 == 0:
            partial = f"partial_live_fr_{i+1}.json"
            with open(partial, "w", encoding="utf-8") as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            print(f"💾 Sauvegarde intermédiaire → {partial}")

        time.sleep(SLEEP_BETWEEN_CALLS)

    # sauvegarde finale
    output_file = "translated_live_fr.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("\n🎉 TRADUCTION TERMINÉE !")
    print("📁 Fichier final :", output_file)


if __name__ == "__main__":
    main()

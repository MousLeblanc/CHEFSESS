import os
import sys
import json
import time
from openai import OpenAI

# -----------------------------------------
# CONFIG
# -----------------------------------------
MODEL = "gpt-4o-mini"
BATCH_SIZE = 10       # nombre de recettes par appel
SLEEP_BETWEEN_CALLS = 0.2
MAX_RECIPES = 50   # ex: 100 pour tester, None pour tout

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

SYSTEM_PROMPT = """
Tu es un assistant culinaire pour une application de restauration collective française.

On va t'envoyer un TABLEAU JSON de plusieurs recettes (format Chef SES).
Tu dois renvoyer un TABLEAU JSON de MÊME LONGUEUR, dans le même ordre,
avec les règles suivantes :

1. Tout le texte doit être en français correct :
   - name, description
   - ingredients[i].name
   - preparationSteps[i]
   - category, hashtags, tags, diet, pathologies

2. Convertir les unités US en unités métriques françaises :
   - tsp/teaspoon  → c. à café (~5 ml)
   - tbsp/tablespoon → c. à soupe (~15 ml)
   - cup → ~240 ml (liquides) ou ~120–140 g (secs, adapte selon l’ingrédient)
   - oz (poids) → ~28 g
   - lb → ~450 g
   N’utiliser que : g, kg, ml, cl, dl, L, c. à café, c. à soupe, pièce(s).
   Ajuster les QUANTITÉS en conséquence, avec des valeurs réalistes.

3. Corriger l’orthographe et la grammaire en français, style fiche technique simple.

4. NE PAS changer la structure JSON :
   - mêmes clés, mêmes types.
   - garder tous les champs non textuels (id, nutriments, etc.) sauf unités/quantités adaptées.

5. SORTIE :
   - Renvoie UNIQUEMENT un TABLEAU JSON valide
     (par ex. [ {...}, {...}, ... ]).
   - Pas de texte explicatif autour.
"""

def process_batch(batch, batch_index, total_batches):
    """Traite un batch (liste de recettes) avec l'API."""
    print(f"\n=== Batch {batch_index+1}/{total_batches} | {len(batch)} recettes ===")

    user_prompt = (
        "Voici un TABLEAU JSON de recettes. Applique toutes les règles et renvoie un TABLEAU JSON de même longueur.\n\n"
        + json.dumps(batch, ensure_ascii=False, indent=2)
    )

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            timeout=90,
        )
        content = response.choices[0].message.content.strip()
        new_batch = json.loads(content)

        if not isinstance(new_batch, list) or len(new_batch) != len(batch):
            print("⚠️ Réponse inattendue de l’API (longueur différente). Batch conservé tel quel.")
            return batch

        print("✅ Batch traité avec succès.")
        return new_batch

    except Exception as e:
        print("⚠️ Erreur sur ce batch, on garde les recettes originales. Détail :", e)
        return batch


def main():
    if len(sys.argv) < 3:
        print("Usage: python translate_recipes_openai_batch.py <input.json> fr")
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

    total_recipes = len(data)
    print(f"🔄 Nombre de recettes à traiter : {total_recipes}")

    output = []
    total_batches = (total_recipes + BATCH_SIZE - 1) // BATCH_SIZE

    for b_index in range(total_batches):
        start = b_index * BATCH_SIZE
        end = min(start + BATCH_SIZE, total_recipes)
        batch = data[start:end]

        print(f"\n--- Traitement des recettes {start+1} à {end} ---")
        new_batch = process_batch(batch, b_index, total_batches)
        output.extend(new_batch)

        # Sauvegarde intermédiaire
        if (b_index + 1) % 5 == 0:
            tmp_name = f"translated_batch_partial_{b_index+1}.json"
            with open(tmp_name, "w", encoding="utf-8") as tmp:
                json.dump(output, tmp, ensure_ascii=False, indent=2)
            print(f"💾 Sauvegarde intermédiaire : {tmp_name}")

        time.sleep(SLEEP_BETWEEN_CALLS)

    output_file = "translated_openai_batch_fr.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("\n🎉 TRAVAIL TERMINÉ !")
    print("📁 Fichier final :", output_file)


if __name__ == "__main__":
    main()

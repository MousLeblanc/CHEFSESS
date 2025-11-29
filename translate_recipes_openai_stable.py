import os
import sys
import json
import time
from openai import OpenAI

# ================================
# CONFIGURATION STABLE
# ================================
MODEL = "gpt-4o-mini"

# On réduit la taille des batchs pour moins charger le réseau
BATCH_SIZE = 3          # 3 recettes par appel au lieu de 10

# On laisse BEAUCOUP plus de chances au réseau
MAX_RETRIES = 10        # jusqu'à 10 tentatives par batch
TIMEOUT = 60            # chaque appel peut attendre jusqu'à 60 s

# On ralentit un peu entre chaque batch pour laisser souffler la box
SLEEP_BETWEEN_BATCHES = 1.0

# Pour tester sur un petit nombre au début, tu peux mettre 30
# Quand tu es ok tu remets None pour tout traiter
MAX_RECIPES = None       # ← commence comme ça pour tester

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """
Tu es un assistant culinaire pour une application francophone.
Règles :
1. Traduire en français : nom, description, ingrédients, étapes, catégories, hashtags.
2. Convertir les unités US -> unités métriques françaises (g, kg, ml, cl, L, c. à soupe, c. à café).
3. Corriger l’orthographe et simplifier le style à la manière des fiches techniques.
4. Garder exactement la même structure JSON.
5. Toujours renvoyer un TABLEAU JSON propre, sans texte autour.
"""

# ================================
#  FONCTION STABLE OPENAI
# ================================

def openai_safe_call(messages):
    """Appel OpenAI avec retry automatique + timeout."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"   → Appel OpenAI (tentative {attempt}/{MAX_RETRIES})...")
            response = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                timeout=TIMEOUT,
            )
            return response.choices[0].message.content.strip()

        except Exception as e:
            print(f"      ⚠️ Erreur réseau : {str(e)[:80]}")
            if attempt == MAX_RETRIES:
                print("      ❌ Abandon : trop d'échecs sur ce batch.")
                return None
            wait = attempt * 2
            print(f"      ⏳ On réessaie dans {wait} sec...")
            time.sleep(wait)

    return None


# ================================
#  TRAITEMENT DES BATCHS
# ================================

def process_batch(batch, batch_idx, total_batches):
    print(f"\n=== Batch {batch_idx+1}/{total_batches} (taille : {len(batch)}) ===")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                "Voici un TABLEAU JSON de recettes. "
                "Renvoie le même tableau, traduit et corrigé.\n\n"
                + json.dumps(batch, ensure_ascii=False)
            ),
        },
    ]

    content = openai_safe_call(messages)
    if not content:
        print("⚠️ Batch conservé tel quel (pas de réponse)")
        return batch

    try:
        parsed = json.loads(content)
        if isinstance(parsed, list) and len(parsed) == len(batch):
            print("✅ Batch traité avec succès.")
            return parsed
        else:
            print("⚠️ Format inattendu → batch conservé")
            return batch
    except Exception:
        print("⚠️ JSON invalide → batch conservé")
        return batch


# ================================
#  MAIN
# ================================

def main():
    if len(sys.argv) < 3:
        print("Usage : python translate_recipes_openai_stable.py fichier.json fr")
        return

    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print("Fichier introuvable :", input_file)
        return

    print("📂 Chargement :", input_file)
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if MAX_RECIPES:
        data = data[:MAX_RECIPES]

    total = len(data)
    print("🔄 Nombre total de recettes :", total)

    output = []
    num_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(num_batches):
        start = i * BATCH_SIZE
        end = min(start + BATCH_SIZE, total)
        batch = data[start:end]

        new_batch = process_batch(batch, i, num_batches)
        output.extend(new_batch)

        # Sauvegarde de sécurité
        if (i + 1) % 3 == 0:
            tmp_name = f"intermediate_batch_{i+1}.json"
            with open(tmp_name, "w", encoding="utf-8") as tmp:
                json.dump(output, tmp, ensure_ascii=False, indent=2)
            print(f"💾 Sauvegarde intermédiaire : {tmp_name}")

        time.sleep(SLEEP_BETWEEN_BATCHES)

    out_file = "translated_openai_stable_fr.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print("\n🎉 TRADUCTION TERMINÉE ✔️")
    print("📁 Fichier final :", out_file)


if __name__ == "__main__":
    main()

import sys
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv(override=True)
client = Groq()

models_to_test = [
    "meta-llama/llama-4-scout-17b-16e-instruct"
]

results = {}
for m in models_to_test:
    try:
        completion = client.chat.completions.create(
            model=m,
            messages=[
                {"role": "user", "content": "Hello"}
            ]
        )
        results[m] = "SUCCESS"
    except Exception as e:
        results[m] = str(e)

with open("vision_test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

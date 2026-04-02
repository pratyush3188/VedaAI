import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv(override=True)
client = Groq()

models = client.models.list()
with open("models.txt", "w") as f:
    f.write("\n".join([m.id for m in models.data]))

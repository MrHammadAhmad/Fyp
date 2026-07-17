import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv('.env')
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

models = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-flash-lite-latest']

for m in models:
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content('hi')
        print(f'{m}: {response.text.strip()}')
    except Exception as e:
        print(f'{m} failed: {e}')

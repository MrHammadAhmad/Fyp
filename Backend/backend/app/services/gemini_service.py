try:
    import google.generativeai as genai
except Exception:
    genai = None

from app.core.config import settings

# ──────────────────────────────────────────────
# Gemini setup (used for image analysis tasks)
# ──────────────────────────────────────────────
model = None
if genai is not None and getattr(settings, "GEMINI_API_KEY", None):
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-3.5-flash')
        print("SUCCESS: Gemini AI model loaded successfully: gemini-3.5-flash")
    except Exception as e:
        print(f"ERROR: Failed to load Gemini model: {e}")
        model = None

# ──────────────────────────────────────────────
# Groq setup (used for chatbot — much faster)
# ──────────────────────────────────────────────
groq_client = None
try:
    from groq import Groq
    if getattr(settings, "GROQ_API_KEY", None):
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        print("SUCCESS: Groq client loaded successfully")
    else:
        print("WARNING: GROQ_API_KEY not set — Groq chatbot disabled")
except Exception as e:
    print(f"ERROR: Failed to load Groq client: {e}")
    groq_client = None


def _ensure_model_available():
    if model is None:
        raise RuntimeError("Gemini AI client not available. Install google-generativeai and set GEMINI_API_KEY.")


def get_chat_response(prompt: str) -> str:
    _ensure_model_available()
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        if "429" in str(e):
            return "You are sending requests too fast! Please wait about 1 minute for your API limits to reset."
        raise e

def get_groq_chat_response(messages: list) -> str:
    if groq_client is None:
        raise RuntimeError("Groq AI client not available. Set GROQ_API_KEY.")
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat error: {e}")
        raise e


def get_service_recommendation(user_preferences: str, services_list: list) -> str:
    _ensure_model_available()
    context = f"Services available: {services_list}\n"
    prompt = f"{context} Based on the user's preferences: '{user_preferences}', which of these services would you recommend and why? Be concise and helpful like a beauty advisor."
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        if "429" in str(e):
            return "Rate limit exceeded. Please wait 1 minute."
        raise e


def analyze_face_shape_and_recommend(image_bytes: bytes, mime_type: str) -> str:
    _ensure_model_available()
    prompt = (
        "Analyze this selfie image. "
        "1. Detect the user's face shape (e.g. oval, round, square, heart, diamond). "
        "2. Identify the skin tone family (e.g. fair, medium, olive, dark) and undertone (warm, cool, neutral). "
        "3. Recommend suitable hairstyles (short, medium, long styles that flatter their shape). "
        "4. Suggest make-up color directions and hair colors that suit their skin tone. "
        "Provide your analysis in a structured, clean, and helpful response suitable for a personalized beauty application."
    )
    try:
        response = model.generate_content([
            {
                "mime_type": mime_type,
                "data": image_bytes
            },
            prompt
        ])
        return response.text
    except Exception as e:
        if "429" in str(e):
            return "Rate limit exceeded. Please wait 1 minute before analyzing another image."
        return f"Error from AI: {str(e)}"

def analyze_image_general(image_bytes: bytes, mime_type: str, user_prompt: str) -> str:
    _ensure_model_available()
    try:
        response = model.generate_content([
            {
                "mime_type": mime_type,
                "data": image_bytes
            },
            user_prompt
        ])
        return response.text
    except Exception as e:
        if "429" in str(e):
            return "Rate limit exceeded. Please wait 1 minute before analyzing another image."
        return f"Error from AI: {str(e)}"

def analyze_hair_image_json(image_bytes: bytes, mime_type: str) -> dict:
    import json
    _ensure_model_available()
    prompt = (
        "Analyze this image of a person's hair. Provide a structured JSON response with the following keys EXACTLY: "
        "\"hairType\" (e.g. Type 2B (Wavy)), "
        "\"condition\" (e.g. Dry & Frizzy), "
        "\"healthScore\" (integer 1-100), "
        "\"scalpCondition\" (e.g. Mild Flaking), "
        "\"damageLevel\" (e.g. Moderate), "
        "\"suggestedServices\" (list of 2 strings), "
        "\"suggestedTreatments\" (list of 2 strings), "
        "\"suggestedProducts\" (list of 2 strings), "
        "\"explanation\" (a brief paragraph explaining the analysis in plain English). "
        "Do NOT include any markdown formatting like ```json. Return ONLY valid JSON."
    )
    try:
        response = model.generate_content([{"mime_type": mime_type, "data": image_bytes}, prompt])
        clean_text = response.text
        start = clean_text.find('{')
        end = clean_text.rfind('}')
        if start != -1 and end != -1:
            clean_text = clean_text[start:end+1]
        return json.loads(clean_text)
    except Exception as e:
        print(f"Hair Analysis Error: {e}")
        return None

def analyze_skin_image_json(image_bytes: bytes, mime_type: str) -> dict:
    import json
    _ensure_model_available()
    prompt = (
        "Analyze this image of a person's face/skin. Provide a structured JSON response with the following keys EXACTLY: "
        "\"skinType\" (e.g. Combination), "
        "\"hydrationLevel\" (integer 1-100), "
        "\"tone\" (e.g. Medium Warm), "
        "\"concerns\" (list of 2 strings), "
        "\"uvDamage\" (e.g. Low-Moderate), "
        "\"healthScore\" (integer 1-100), "
        "\"suggestedRoutine\" (list of 2 strings for AM/PM), "
        "\"suggestedTreatments\" (list of 2 strings), "
        "\"suggestedProducts\" (list of 2 strings), "
        "\"explanation\" (a brief paragraph explaining the analysis). "
        "Do NOT include any markdown formatting like ```json. Return ONLY valid JSON."
    )
    try:
        response = model.generate_content([{"mime_type": mime_type, "data": image_bytes}, prompt])
        clean_text = response.text
        start = clean_text.find('{')
        end = clean_text.rfind('}')
        if start != -1 and end != -1:
            clean_text = clean_text[start:end+1]
        return json.loads(clean_text)
    except Exception as e:
        print(f"Skin Analysis Error: {e}")
        return None

def analyze_review_sentiment(review_text: str) -> int:
    import json
    if not review_text or not review_text.strip():
        return None
        
    prompt = f"Analyze the sentiment of this review and rate it on a scale of 1 to 10 (1 being extremely negative, 10 being extremely positive). IMPORTANT RULES: 1. Treat simple positive words/phrases like 'nice', 'good', 'great', 'awesome', 'perfect', or 'nice work' as a full 10 out of 10. 2. Treat simple negative words like 'bad', 'poor', or 'terrible' as a 1. 3. Treat constructive or mixed feedback (e.g., 'need improvements', 'okay', 'average') as moderate scores (e.g., 4, 5, or 6). Use the full scale appropriately for nuances. Review: '{review_text}'. Format your ENTIRE response as a strictly valid JSON object with EXACTLY one key: 'rating' (integer)."
    
    # Try Groq first (much faster and more reliable for JSON)
    if groq_client is not None:
        try:
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            parsed = json.loads(completion.choices[0].message.content)
            rating = int(parsed.get('rating', 0))
            return max(1, min(10, rating))
        except Exception as e:
            print(f"Groq Sentiment error: {e}")
            # Fall through to Gemini
            
    # Fallback to Gemini
    try:
        _ensure_model_available()
        response = model.generate_content(prompt)
        clean_reply = response.text.replace('```json', '').replace('```', '').strip()
        
        # Sometimes Gemini adds extra text before/after the JSON, so find the first '{' and last '}'
        start = clean_reply.find('{')
        end = clean_reply.rfind('}')
        if start != -1 and end != -1:
            clean_reply = clean_reply[start:end+1]
            
        parsed_reply = json.loads(clean_reply)
        rating = int(parsed_reply.get('rating', 0))
        return max(1, min(10, rating))
    except Exception as e:
        print(f"Gemini Sentiment error: {e}")
        return None

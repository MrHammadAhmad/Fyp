try:
    import google.generativeai as genai
except Exception:
    genai = None

from app.core.config import settings

model = None
if genai is not None and getattr(settings, "GEMINI_API_KEY", None):
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
    except Exception:
        model = None


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
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
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
        clean_text = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except Exception as e:
        return None

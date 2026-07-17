import base64
from typing import List, Dict, Any, Optional
from app.core.config import settings

BEAUTY_AGENT_NAME = "Beauty AI Assistant"

BEAUTY_AI_SYSTEM_INSTRUCTIONS = """
You are a friendly, expert Beauty AI Assistant for a salon booking platform.
Your job is to provide highly personalized, casual, and plain-text beauty advice, salon recommendations, and styling tips.

CRITICAL RULES:
- Be extremely conversational, friendly, and 100% plain-text.
- Do NOT sound like a robotic customer service agent.
- AVOID ALL formatting like bold (**text**), italics, bulleted lists, or special characters. It must look like a normal human text message.
- Keep paragraphs very short (1-2 sentences).
- If the user asks for recommendations, provide simple, helpful suggestions without overwhelming them.

PERSONALIZATION:
- Address their specific concerns (e.g., hair type, skin type, style preferences).
- Provide actionable, easy-to-understand advice.
- Sound like a human beauty consultant sharing a quick tip.

OUTPUT REQUIREMENTS:
- Pure plain text style, NO markdown, NO bold, NO lists.
- Very casual and friendly.
"""

class BeautyAIAgent:
    """Agent that generates personalized beauty recommendations and chat responses using Groq"""

    def __init__(self):
        self.groq_api_key = settings.GROQ_API_KEY

    def _get_groq_client(self):
        """Get Groq client"""
        if not self.groq_api_key:
            raise Exception("Groq API key not configured. Set GROQ_API_KEY in environment.")
        from groq import Groq
        return Groq(api_key=self.groq_api_key)

    def get_chat_response(self, prompt: str) -> str:
        """Generate a basic chat response"""
        client = self._get_groq_client()
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": BEAUTY_AI_SYSTEM_INSTRUCTIONS},
                    {"role": "user", "content": prompt},
                ],
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            try:
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": BEAUTY_AI_SYSTEM_INSTRUCTIONS},
                        {"role": "user", "content": prompt},
                    ],
                )
                return completion.choices[0].message.content.strip()
            except Exception as e2:
                raise Exception(f"Chat generation failed: {e}, Fallback: {e2}")

    def get_service_recommendation(self, user_preferences: str, services_list: list) -> str:
        """Recommend services based on user preferences"""
        client = self._get_groq_client()
        context = f"Services available: {services_list}\n"
        prompt = f"{context} Based on the user's preferences: '{user_preferences}', which of these services would you recommend and why? Be concise and helpful like a beauty advisor."
        
        try:
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": BEAUTY_AI_SYSTEM_INSTRUCTIONS},
                    {"role": "user", "content": prompt},
                ],
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            try:
                completion = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": BEAUTY_AI_SYSTEM_INSTRUCTIONS},
                        {"role": "user", "content": prompt},
                    ],
                )
                return completion.choices[0].message.content.strip()
            except Exception as e2:
                raise Exception(f"Recommendation generation failed: {e}, Fallback: {e2}")


    def analyze_face_shape_and_recommend(self, image_bytes: bytes, mime_type: str) -> str:
        """Analyze an uploaded image for beauty recommendations using Gemini Vision"""
        try:
            from app.services.gemini_service import analyze_face_shape_and_recommend as gemini_analyze
            return gemini_analyze(image_bytes, mime_type)
        except Exception as e:
            print(f"Vision analysis failed: {e}")
            return "Hey there! I couldn't quite see the image clearly. Could you try uploading another one or just tell me a bit about your hair and skin type?"

    def analyze_image_general(self, image_bytes: bytes, mime_type: str, user_prompt: str) -> str:
        """Generic method to analyze an image (describe, detect objects, OCR) based on a user prompt using Gemini Vision"""
        try:
            from app.services.gemini_service import model
            if not model:
                raise Exception("Gemini model not initialized")
            response = model.generate_content([
                {"mime_type": mime_type, "data": image_bytes},
                user_prompt
            ])
            return response.text
        except Exception as e:
            print(f"General Vision analysis failed: {e}")
            return f"I couldn't analyze the image properly. Error: {str(e)}"

agent = BeautyAIAgent()

def get_chat_response(prompt: str) -> str:
    return agent.get_chat_response(prompt)

def get_service_recommendation(user_preferences: str, services_list: list) -> str:
    return agent.get_service_recommendation(user_preferences, services_list)

def analyze_face_shape_and_recommend(image_bytes: bytes, mime_type: str) -> str:
    return agent.analyze_face_shape_and_recommend(image_bytes, mime_type)

def analyze_image_general(image_bytes: bytes, mime_type: str, user_prompt: str) -> str:
    return agent.analyze_image_general(image_bytes, mime_type, user_prompt)


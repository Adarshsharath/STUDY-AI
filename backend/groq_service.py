import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def get_groq_response(document_context, user_question):
    """
    Get AI response from Groq API using document context.
    
    Args:
        document_context: Extracted text from the document
        user_question: User's question
    
    Returns:
        AI response string
    """
    
    # Strict prompt to prevent hallucination
    # Relaxed prompt to allow general conversation while prioritizing context
    system_prompt = """You are AnswerXtractor, a helpful AI assistant. 

YOUR PRIMARY GOAL:
1. Answer users' questions based on the provided DOCUMENT CONTEXT.
2. Always try to be helpful and polite.

GREETINGS AND GENERAL CHAT:
- If the user says "hi", "hello", "perfect", or asks a general non-document question, respond naturally and politely (like GPT).
- Do NOT say "Not found in the document" for greetings or common pleasantries.

DOCUMENT-BASED QUESTIONS:
- If a question is specifically about the document content:
  a. Provide the answer using ONLY the document context.
  b. If the answer is NOT in the document at all, politely state: "I couldn't find information about that in the document, but based on general knowledge..." (and provide a brief general answer if applicable, or ask for clarification).
- Keep answers professional and accurate."""

    user_prompt = f"""DOCUMENT CONTEXT:
{document_context}

USER QUESTION:
{user_question}

Answer the question using ONLY the information from the document context above."""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            model="llama-3.3-70b-versatile",  # Using Groq's fast model
            temperature=0.1,  # Low temperature for more deterministic responses
            max_tokens=1024,
            top_p=0.9
        )
        
        return chat_completion.choices[0].message.content
    
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")

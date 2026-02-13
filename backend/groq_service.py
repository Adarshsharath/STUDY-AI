import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def get_groq_response(document_context, user_question, no_context=False):
    """
    Get AI response from Groq API.
    
    Args:
        document_context: Extracted text from the document
        user_question: User's question
        no_context: If True, ignore document context and provide a general AI answer
    
    Returns:
        AI response string
    """
    
    # Strict prompt to prevent hallucination
    # If no_context is True, we don't pass the document content and change the prompt
    if no_context:
        system_prompt = """You are AnswerXtractor, a helpful AI assistant. 
        The user wants a general answer NOT based on any specific document. 
        Provide a helpful, accurate, and detailed general response."""
        
        user_prompt = user_question
    else:
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

def generate_study_material(document_context, tool_type):
    """
    Generate study material (flashcards, quiz, or mindmap) based on document context.
    """
    
    prompts = {
        "flashcards": """Extract 10-15 key concepts and their definitions from the document. 
        Output ONLY a JSON array of objects with 'question' and 'answer' fields.
        Example: {"flashcards": [{"question": "What is X?", "answer": "X is Y."}]}""",
        
        "quiz": """Create a 10-question multiple-choice quiz based on the document.
        Output ONLY a JSON array of objects with 'question', 'options' (array of 4 strings), and 'correct_index' (0-3).
        Example: {"quiz": [{"question": "X?", "options": ["A", "B", "C", "D"], "correct_index": 1}]}""",
        
        "mindmap": """Create a hierarchical mind map structure of the main topics in the document.
        Output ONLY a JSON object representing a tree with 'name' and 'children' (array of objects).
        Keep it to 2-3 levels deep.
        Example: {"mindmap": {"name": "Root", "children": [{"name": "Subtopic", "children": []}]}}"""
    }

    system_prompt = f"You are an educational AI assistant. {prompts.get(tool_type, '')} Return valid JSON only."
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"DOCUMENT CONTENT:\n{document_context}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        import json
        content = chat_completion.choices[0].message.content
        parsed = json.loads(content)
        
        # Extract the actual data from the wrapped response
        if tool_type in parsed:
            return parsed[tool_type]
        elif 'data' in parsed:
            return parsed['data']
        else:
            # Try to find the first array or object in the response
            for key, value in parsed.items():
                if tool_type in ['flashcards', 'quiz'] and isinstance(value, list):
                    return value
                elif tool_type == 'mindmap' and isinstance(value, dict):
                    return value
            # If nothing found, return the parsed data as-is
            return parsed
    
    except Exception as e:
        raise Exception(f"Error generating study material: {str(e)}")

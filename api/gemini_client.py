import google.generativeai as genai

# Configure the Gemini API key
genai.configure(api_key="AIzaSyBHJ2RNUL84ybnWEOtpzmqLc-qh9taBns0")

# Use a valid model name
model = genai.GenerativeModel(
    model_name="models/gemini-1.5-flash",  # Updated model
    generation_config={
        "temperature": 0.7,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 1024,
    }
)

chat = model.start_chat(history=[])

def get_recipe_suggestion(user_prompt):
    try:
        response = chat.send_message(user_prompt)
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

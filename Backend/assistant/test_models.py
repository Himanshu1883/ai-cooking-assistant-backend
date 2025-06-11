import google.generativeai as genai

genai.configure(api_key="AIzaSyBHJ2RNUL84ybnWEOtpzmqLc-qh9taBns0")

models = genai.list_models()
print("Available models:")
for m in models:
    print(m)

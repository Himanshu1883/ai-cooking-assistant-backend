from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Recipe, SavedRecipe
from .serializers import RecipeSerializer, SavedRecipeSerializer
from django.contrib.auth.models import User
from django.http import JsonResponse
import os
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import google.generativeai as genai
from django.http import JsonResponse
from .gemini_client import get_recipe_suggestion
from .models import RecipeHistory
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework import status

from rest_framework.authtoken.models import Token

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    user = User.objects.create_user(username=username, password=password)
    token, _ = Token.objects.get_or_create(user=user)

    return Response({"message": "User registered successfully!", "token": token.key}, status=201)


from rest_framework.authtoken.models import Token

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"message": "Login successful", "token": token.key})
    else:
        return Response({"error": "Invalid credentials"}, status=401)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_recipe(request):
    ingredients = request.data.get('ingredients', '')
    # call your AI logic here to generate recipe
    recipe = f"AI generated recipe using: {ingredients}"

    # Save to history
    RecipeHistory.objects.create(
        user=request.user,
        ingredients=ingredients,
        recipe_text=recipe
    )

    return Response({'recipe': recipe})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    history = RecipeHistory.objects.filter(user=request.user).order_by('-created_at')
    return Response([{
        "ingredients": h.ingredients,
        "recipe_text": h.recipe_text,
        "created_at": h.created_at
    } for h in history])

def ai_recipe(request):
    user_prompt = request.GET.get('prompt', '')

    if not user_prompt:
        return JsonResponse({'error': 'No prompt provided'}, status=400)

    result = get_recipe_suggestion(user_prompt)
    return JsonResponse({'response': result})

# Load your API key for Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def generate_recipe(request):
    """
    Receives a JSON with 'ingredients', sends prompt to Gemini AI,
    and returns the generated recipe text.
    """
    ingredients = request.data.get("ingredients", "")
    if not ingredients:
        return Response({"error": "Ingredients are required."}, status=400)

    try:
        # Use the shared Gemini helper function
        prompt = (
            f"Create a detailed cooking recipe using these ingredients: {ingredients}. "
            "Include a title, short description, ingredient list, and step-by-step instructions."
        )

        recipe_text = get_recipe_suggestion(prompt)
        return Response({"recipe": recipe_text})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


def home(request):
    return JsonResponse({"message": "Cooking Assistant Backend Running!"})

# CRUD for recipes
class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().order_by('-created_at')
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# CRUD for saved recipes
class SavedRecipeViewSet(viewsets.ModelViewSet):
    queryset = SavedRecipe.objects.all().order_by('-saved_at')
    serializer_class = SavedRecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Create your views here.

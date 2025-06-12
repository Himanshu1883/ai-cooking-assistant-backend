from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Recipe, SavedRecipe, RecipeHistory
from .serializers import RecipeSerializer, SavedRecipeSerializer
from django.contrib.auth.models import User
from django.http import JsonResponse
import os
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated
import google.generativeai as genai
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from .gemini_client import get_recipe_suggestion

# Load your API key for Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    email = request.data.get("email", "")

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already taken"}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email)
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "message": "User registered successfully!", 
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }, status=201)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=400)

    user = authenticate(username=username, password=password)
    if user is not None:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "message": "Login successful", 
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })
    else:
        return Response({"error": "Invalid credentials"}, status=401)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Change to IsAuthenticated when you want to require login
def generate_recipe(request):
    """
    Receives a JSON with 'ingredients', sends prompt to Gemini AI,
    and returns the generated recipe text. Saves to history if user is authenticated.
    """
    ingredients = request.data.get("ingredients", "")
    if not ingredients:
        return Response({"error": "Ingredients are required."}, status=400)

    try:
        # Use the shared Gemini helper function
        prompt = (
            f"Create a detailed cooking recipe using these ingredients: {ingredients}. "
            "Include a title, short description, ingredient list, and step-by-step instructions. "
            "Format it nicely with clear sections."
        )

        recipe_text = get_recipe_suggestion(prompt)
        
        # Save to history only if user is authenticated
        if request.user.is_authenticated:
            RecipeHistory.objects.create(
                user=request.user,
                ingredients=ingredients,
                recipe_text=recipe_text
            )

        return Response({"recipe": recipe_text})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    """
    Get recipe history for the authenticated user
    """
    try:
        history = RecipeHistory.objects.filter(user=request.user).order_by('-created_at')[:20]  # Limit to 20 recent
        history_data = []
        
        for h in history:
            history_data.append({
                "id": h.id,
                "ingredients": h.ingredients,
                "recipe_text": h.recipe_text,
                "created_at": h.created_at.isoformat()
            })
            
        return Response({
            "history": history_data,
            "count": len(history_data)
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_history_item(request, history_id):
    """
    Delete a specific history item
    """
    try:
        history_item = RecipeHistory.objects.get(id=history_id, user=request.user)
        history_item.delete()
        return Response({"message": "History item deleted successfully"})
    except RecipeHistory.DoesNotExist:
        return Response({"error": "History item not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Logout user by deleting their token
    """
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
        return Response({"message": "Logged out successfully"})
    except Token.DoesNotExist:
        return Response({"error": "Invalid token"}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get current user profile
    """
    return Response({
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "date_joined": request.user.date_joined.isoformat()
        }
    })


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

    def get_queryset(self):
        # Only return saved recipes for the current user
        if self.request.user.is_authenticated:
            return SavedRecipe.objects.filter(user=self.request.user).order_by('-saved_at')
        return SavedRecipe.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
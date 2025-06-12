from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecipeViewSet, SavedRecipeViewSet
from .views import generate_recipe
router = DefaultRouter()
router.register(r'recipes', RecipeViewSet)
router.register(r'saved', SavedRecipeViewSet)
from . import views

urlpatterns = [
    path('', include(router.urls)),
    path('', views.home, name='home'),
    path('auth/signup/', views.signup_user, name='signup'),
    path('auth/login/', views.login_user, name='login'),
    path('generate_recipe/', generate_recipe, name='generate_recipe'),
    # path('recipes/', views.ai_recipe, name='ai_recipe'),
    path('history/', views.get_history, name='get_history'),
]

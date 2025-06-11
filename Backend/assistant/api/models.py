from django.db import models
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import User
from django.db import models

class RecipeHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ingredients = models.TextField()
    recipe_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Recipe(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    ingredients = models.TextField(help_text="Comma-separated ingredients")
    steps = models.TextField(help_text="Step-by-step instructions")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class SavedRecipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"

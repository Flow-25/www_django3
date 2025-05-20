from django.db import models
from django.contrib.auth.models import User

class GameBoard(models.Model):
    name = models.CharField(max_length=100, unique=True)
    rows = models.PositiveIntegerField()
    cols = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Dot(models.Model):
    COLOR_CHOICES = [
        ('red', 'Red'),
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('yellow', 'Yellow'),
    ]
    game_board = models.ForeignKey(GameBoard, on_delete=models.CASCADE, related_name='dots')
    row = models.PositiveIntegerField()
    col = models.PositiveIntegerField()
    color = models.CharField(max_length=20, choices=COLOR_CHOICES)

    class Meta:
        unique_together = ('game_board', 'row', 'col')

    def __str__(self):
        return f"{self.color} dot at ({self.row}, {self.col})"

class Game(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    board = models.ForeignKey(GameBoard, on_delete=models.CASCADE, related_name='games')
    paths = models.JSONField(default=dict)  # Przechowuje ścieżki w formacie JSON
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Gra użytkownika {self.user.username} na planszy {self.board.name}"
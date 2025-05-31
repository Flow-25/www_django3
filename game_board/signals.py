from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GameBoard, Game

# Kolejka zdarzeń do wysłania (globalna)
from .views import event_queue

@receiver(post_save, sender=GameBoard)
def notify_new_board(sender, instance, created, **kwargs):
    """Sygnał dla nowej planszy."""
    if created:
        event_queue.append({
            "type": "newBoard",
            "data": {
                "board_id": instance.id,
                "board_name": instance.name,
                "rows": instance.rows,
                "cols": instance.cols,
                "created_at": instance.created_at.isoformat(),
            }
        })

@receiver(post_save, sender=Game)
def notify_new_game(sender, instance, created, **kwargs):
    """Sygnał dla nowej gry (zapisanej ścieżki)."""
    if created:
        event_queue.append({
            "type": "newPath",
            "data": {
                "game_id": instance.id,
                "board_id": instance.board.id,
                "board_name": instance.board.name,
                "user_username": instance.user.username,
                "paths": instance.paths,  # JSONField przechowujący ścieżki
                "created_at": instance.created_at.isoformat(),
            }
        })
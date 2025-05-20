from django.urls import path
from .views import (
    game_board_list,
    game_board_detail,
    game_board_form,
    game_board_delete,
    save_game_board,
    save_dots,
    update_game_board,
    game_board_play,
    save_path,
    game_board_continue,
    overwrite_game,
    create_game,
)

urlpatterns = [
    path('', game_board_list, name='game_board_list'),
    path('<int:pk>/', game_board_detail, name='game_board_detail'),
    path('create/', game_board_form, name='game_board_create'),
    path('create/<int:pk>/', game_board_form, name='game_board_edit'),  # Dla edycji planszy
    path('<int:pk>/delete/', game_board_delete, name='game_board_delete'),
    path('save/', save_game_board, name='save_game_board'),
    path('<int:pk>/save-dots/', save_dots, name='save_dots'),
    path('<int:pk>/update/', update_game_board, name='update_game_board'),
    path('<int:pk>/play/', game_board_play, name='game_board_play'),
    #path('<int:pk>/save-path/', save_path, name='save_path'),
    path('continue/<int:game_id>/', game_board_continue, name='game_board_continue'),
    path('<int:game_id>/overwrite/', overwrite_game, name='overwrite_game'),
    path('<int:pk>/create-game/', create_game, name='create_game'),
]
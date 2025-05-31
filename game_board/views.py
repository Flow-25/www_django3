from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import GameBoard, Dot
from django.views.decorators.csrf import csrf_exempt
import json


from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Game

@csrf_exempt
@login_required
def overwrite_game(request, game_id):
    """Nadpisuje istniejącą grę użytkownika."""
    if request.method == 'POST':
        try:
            game = get_object_or_404(Game, id=game_id, user=request.user)
            data = json.loads(request.body)
            paths = data.get('paths', {})

            # Walidacja danych
            if not isinstance(paths, dict):
                return JsonResponse({'error': 'Nieprawidłowe dane!'}, status=400)

            # Nadpisz ścieżki w modelu Game
            game.paths = paths
            game.save()

            return JsonResponse({'message': 'Gra została nadpisana!', 'game_id': game.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Nieobsługiwana metoda HTTP!'}, status=405)

@login_required
def game_board_continue(request, game_id):
    """Obsługuje kontynuowanie gry: renderuje HTML lub zwraca dane JSON."""
    game = get_object_or_404(Game, id=game_id, user=request.user)
    board = game.board
    dots = board.dots.all()

    # Jeśli żądanie jest AJAX, zwróć dane w formacie JSON
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'name': board.name,
            'rows': board.rows,
            'cols': board.cols,
            'dots': [{'row': dot.row, 'col': dot.col, 'color': dot.color} for dot in dots],
            'paths': game.paths  # Zapisane ścieżki użytkownika
        })

    # W przeciwnym razie renderuj szablon HTML
    return render(request, 'game_board/game_board_continue.html', {
        'board': board,
        'game': game,
    })
@csrf_exempt
@login_required
def save_path(request, pk):  # Zmieniono 'game_id' na 'pk'
    """Zapisuje ścieżki dla gry użytkownika."""
    if request.method == 'POST':
        try:
            game = get_object_or_404(Game, id=pk, user=request.user)  # Użyj 'pk' zamiast 'game_id'
            data = json.loads(request.body)
            paths = data.get('paths', {})

            # Logowanie danych
            print(f"DEBUG: Otrzymano żądanie zapisu ścieżek dla gry o ID {pk}")
            print(f"DEBUG: Otrzymane dane: {data}")

            # Walidacja danych
            if not isinstance(paths, dict):
                print("DEBUG: Nieprawidłowe dane!")
                return JsonResponse({'error': 'Nieprawidłowe dane!'}, status=400)

            # Zapisz ścieżki w modelu Game
            game.paths = paths
            game.save()
            print("DEBUG: Ścieżki zostały zapisane!")

            return JsonResponse({'message': 'Ścieżki zostały zapisane!', 'game_id': game.id})
        except Exception as e:
            print(f"DEBUG: Wystąpił błąd Zapis nie ten: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    print("DEBUG: Nieobsługiwana metoda HTTP!")
    return JsonResponse({'error': 'Nieobsługiwana metoda HTTP!'}, status=405)
def game_board_list(request):
    """Wyświetla listę wszystkich plansz."""
    boards = GameBoard.objects.all()
    return render(request, 'game_board/game_board_list.html', {'boards': boards})

def game_board_detail(request, pk):
    """Wyświetla szczegóły wybranej planszy."""
    board = get_object_or_404(GameBoard, pk=pk)
    dots = board.dots.all()
    games = board.games.filter(user=request.user)  # Pobierz wszystkie gry powiązane z planszą

    # Jeśli żądanie jest AJAX, zwróć dane w formacie JSON
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'name': board.name,
            'rows': board.rows,
            'cols': board.cols,
            'dots': [{'row': dot.row, 'col': dot.col, 'color': dot.color} for dot in dots],
        })

    # W przeciwnym razie renderuj szablon HTML
    return render(request, 'game_board/game_board_detail.html', {
        'board': board,
        'dots': dots,
        'games': games,  # Przekaż gry do szablonu
    })

def game_board_form(request, pk=None):
    """Wyświetla formularz do tworzenia lub edycji planszy."""
    board = None
    if pk:
        board = get_object_or_404(GameBoard, pk=pk)
    return render(request, 'game_board/game_board_form.html', {'board': board})

def game_board_delete(request, pk):
    """Usuwa wybraną planszę."""
    board = get_object_or_404(GameBoard, pk=pk)
    board.delete()
    return redirect('game_board_list')

@csrf_exempt
@login_required
def create_game(request, pk):
    """Tworzy nową grę dla planszy."""
    if request.method == 'POST':
        try:
            # Pobierz planszę na podstawie ID
            board = get_object_or_404(GameBoard, pk=pk)
            data = json.loads(request.body)
            paths = data.get('paths', {})

            # Logowanie danych
            print(f"DEBUG: Tworzenie nowej gry dla planszy o ID {pk}")
            print(f"DEBUG: Otrzymane dane: {data}")

            # Walidacja danych
            if not isinstance(paths, dict):
                print("DEBUG: Nieprawidłowe dane!")
                return JsonResponse({'error': 'Nieprawidłowe dane!'}, status=400)

            # Utwórz nową grę
            game = Game.objects.create(
                user=request.user,
                board=board,
                paths=paths
            )
            print(f"DEBUG: Gra została utworzona z ID {game.id}")

            return JsonResponse({'message': 'Gra została utworzona!', 'game_id': game.id})
        except Exception as e:
            print(f"DEBUG: Wystąpił błąd: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Nieobsługiwana metoda HTTP!'}, status=405)

@csrf_exempt
def save_game_board(request):
    """Zapisuje nową planszę wraz z kropkami."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            rows = data.get('rows')
            cols = data.get('cols')
            dots = data.get('dots', [])

            # Walidacja danych
            if not name or not rows or not cols:
                return JsonResponse({'error': 'Nieprawidłowe dane'}, status=400)

            # Utwórz planszę
            board = GameBoard.objects.create(name=name, rows=rows, cols=cols)

            # Dodaj kropki
            for dot in dots:
                Dot.objects.create(
                    game_board=board,
                    row=dot['row'],
                    col=dot['col'],
                    color=dot['color']
                )

            return JsonResponse({'status': 'success', 'id': board.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Nieprawidłowe żądanie'}, status=400)

@csrf_exempt
def save_dots(request, pk):
    """Zapisuje kropki na istniejącej planszy."""
    if request.method == 'POST':
        try:
            board = get_object_or_404(GameBoard, pk=pk)
            data = json.loads(request.body)
            board.dots.all().delete()  # Usuń istniejące kropki
            for dot_data in data.get('dots', []):
                Dot.objects.create(
                    game_board=board,
                    row=dot_data['row'],
                    col=dot_data['col'],
                    color=dot_data['color']
                )
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Nieprawidłowe żądanie'}, status=400)

@csrf_exempt
def update_game_board(request, pk):
    """Aktualizuje istniejącą planszę."""
    if request.method == 'POST':
        try:
            board = GameBoard.objects.get(pk=pk)
            data = json.loads(request.body)
            board.name = data.get('name', board.name)
            board.rows = data.get('rows', board.rows)
            board.cols = data.get('cols', board.cols)
            board.save()

            # Usuń istniejące kropki i dodaj nowe
            board.dots.all().delete()
            for dot in data.get('dots', []):
                Dot.objects.create(
                    game_board=board,
                    row=dot['row'],
                    col=dot['col'],
                    color=dot['color']
                )

            return JsonResponse({'status': 'success', 'id': board.id})
        except GameBoard.DoesNotExist:
            return JsonResponse({'error': 'Plansza nie istnieje'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Nieprawidłowe żądanie'}, status=400)

def game_board_play(request, pk):
    """Widok do rysowania trasy na planszy."""
    board = get_object_or_404(GameBoard, pk=pk)
    return render(request, 'game_board/game_board_play.html', {'board': board})


"""WIDOKI SSE"""
import json
import time
from django.http import StreamingHttpResponse

# Kolejka zdarzeń do wysłania
event_queue = []

def sse_notifications(request):
    """Widok obsługujący SSE."""
    def event_stream():
        while True:
            if event_queue:
                event = event_queue.pop(0)
                yield f"event: {event['type']}\ndata: {json.dumps(event['data'])}\n\n"
            else:
                yield ": keep-alive\n\n"  # Komentarz keep-alive
            time.sleep(5)  # Odczekaj 5 sekund przed kolejną iteracją

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response['Cache-Control'] = 'no-cache'
    return response
# trasy

## Wprowadzenie
`trasy` to aplikacja Django, która umożliwia zarządzanie trasami. Ten plik README zawiera instrukcje dotyczące pobierania i instalacji aplikacji.

## Wymagania
Aby uruchomić aplikację, upewnij się, że masz zainstalowane:
- Python 3.8 lub nowszy
- `pip` (Python package installer)
- Wirtualne środowisko Python (opcjonalne, ale zalecane)

## Instalacja

### 1. Sklonuj repozytorium
```bash
git clone <URL_REPOZYTORIUM>
cd trasy
```

### 2. Utwórz i aktywuj wirtualne środowisko (opcjonalne)
#### Na systemie Linux/macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Na systemie Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Zainstaluj wymagania
Użyj `pip`, aby zainstalować zależności z pliku `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Wykonaj migracje bazy danych
```bash
python manage.py migrate
```

### 5. Uruchom serwer deweloperski
```bash
python manage.py runserver
```

## Użycie
Otwórz przeglądarkę i przejdź do adresu [http://127.0.0.1:8000/](http://127.0.0.1:8000/), aby zobaczyć działającą aplikację.

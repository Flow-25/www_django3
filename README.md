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
git clone git@github.com:Flow-25/www_django3.git
cd www_django3
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
python manage.py makemigrations
python manage.py migrate
```

### 5. Uruchom serwer deweloperski
```bash
python manage.py runserver
```

## Użycie
Otwórz przeglądarkę i przejdź do adresu [http://127.0.0.1:8000/](http://127.0.0.1:8000/), aby zobaczyć działającą aplikację.

## Super user:

1. **Uruchom polecenie zarządzania**:
  ```bash
  python manage.py createsuperuser
  ```

2. **Podaj wymagane dane**:
  - Nazwę użytkownika
  - Adres e-mail
  - Hasło (wpisz i potwierdź)

3. **Zaloguj się do panelu administracyjnego**:
  - Uruchom serwer deweloperski:
    ```bash
    python manage.py runserver
    ```
  - Otwórz przeglądarkę i przejdź pod adres:
    ```
    http://127.0.0.1:8000/admin/
    ```
  - Zaloguj się za pomocą danych superusera.

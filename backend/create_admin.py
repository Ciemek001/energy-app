# backend/create_admin.py
import sys
import os

# Dodajemy bieżący katalog do ścieżki
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.utils.security import get_password_hash

# --- POPRAWIONE IMPORTY ---
# Teraz nazwy plików zgadzają się z tym, co masz w folderze models
from app.models.user import User
from app.models.building import Building
from app.models.advanced_audit import AdvancedAudit  # <--- Tu była pomyłka w nazwie pliku

def create_admin():
    db = SessionLocal()
    
    print("--- KREATOR KONTA ADMINA ---")
    email = input("Podaj email dla admina: ")
    password = input("Podaj hasło: ")
    
    if not email or not password:
        print("Błąd: Email i hasło nie mogą być puste.")
        return

    # Sprawdzenie czy user istnieje
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"\n[!] Użytkownik o adresie {email} już istnieje w bazie!")
        choice = input("Czy chcesz nadać mu uprawnienia admina? (t/n): ")
        if choice.lower() == 't':
            existing_user.role = "admin"
            existing_user.is_active = True
            db.commit()
            print("Pomyślnie zaktualizowano użytkownika do roli Admina.")
        return

    # Tworzenie nowego admina
    admin_user = User(
        email=email,
        hashed_password=get_password_hash(password),
        role="admin",
        is_active=True,
        first_name="Super",
        last_name="Admin",
        address="System"
    )

    try:
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"\n[SUKCES] Utworzono konto admina: {email}")
        print("Możesz się teraz zalogować w aplikacji.")
    except Exception as e:
        print(f"\n[BŁĄD] Nie udało się zapisać użytkownika: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
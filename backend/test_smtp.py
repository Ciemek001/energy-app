# backend/test_smtp.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# --- KONFIGURACJA (Wpisz tu dane na sztywno do testu) ---
SMTP_SERVER = "smtp.gmail.com" # np. smtp.gmail.com
SMTP_PORT = 587                # Zazwyczaj 587 dla TLS
SMTP_USER = "energy.app001@gmail.com"   # Twój pełny adres email
SMTP_PASSWORD = "cyxbfsgsulzrvblb"  # Hasło (dla Gmaila to MUSI być "Hasło aplikacji", nie zwykłe!)
TO_EMAIL = "bartekkw345098@gmail.com" # Gdzie wysłać test
# -------------------------------------------------------

def send_test_email():
    try:
        print(f"1. Łączenie z serwerem {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1) # Pokaże dokładne logi komunikacji
        
        print("2. Uruchamianie TLS...")
        server.starttls()
        
        print("3. Logowanie...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        print("4. Tworzenie wiadomości...")
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = TO_EMAIL
        msg['Subject'] = "Test SMTP z Pythona"
        body = "Jeśli to czytasz, SMTP działa poprawnie!"
        msg.attach(MIMEText(body, 'plain'))
        
        print("5. Wysyłanie...")
        server.send_message(msg)
        
        print("-" * 30)
        print("SUKCES! Wiadomość została wysłana.")
        print("-" * 30)
        
        server.quit()
        
    except smtplib.SMTPAuthenticationError:
        print("\n!!! BŁĄD LOGOWANIA !!!")
        print("Sprawdź email i hasło. Jeśli używasz Gmaila, musisz wygenerować 'Hasło do aplikacji'.")
    except Exception as e:
        print(f"\n!!! WYSTĄPIŁ BŁĄD: {e}")

if __name__ == "__main__":
    send_test_email()
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext # Upewnij się, że masz to zaimportowane

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class CRUDUser:
    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    # Zwróć uwagę na nazwę drugiego argumentu: 'user', a nie 'obj_in'
    def create(self, db: Session, user: UserCreate):
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            email=user.email, 
            hashed_password=hashed_password,
            is_active=False # Ważne dla systemu weryfikacji email!
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

crud_user = CRUDUser()
# app/crud/crud_user.py

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate


class CRUDUser:
    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, user_in: UserCreate):
        db_user = User(
            email=user_in.email,
            hashed_password=user_in.hashed_password,
            role=user_in.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user


crud_user = CRUDUser()

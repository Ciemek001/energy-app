from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class AdvancedAudit(Base):
    __tablename__ = "advanced_audits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Dane wejściowe (zapiszemy całą strukturę JSON, żeby móc ją odtworzyć)
    input_data = Column(JSON) 

    # Wyniki główne
    ep_value = Column(Float)
    ek_value = Column(Float)
    eu_value = Column(Float)
    classification = Column(String)
    passed_wt2021 = Column(Boolean)

    user = relationship("User", back_populates="advanced_audits")
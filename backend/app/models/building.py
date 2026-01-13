from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    location = Column(String)
    build_year = Column(Integer)
    heated_area = Column(Numeric(10, 2))
    floors = Column(Integer)
    zone = Column(String)

    parameters = relationship("BuildingParameters", back_populates="building")
    calculations = relationship("Calculation", back_populates="building")

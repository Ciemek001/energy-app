from sqlalchemy import Column, Integer, String, Numeric
from app.db.database import Base

class HeatingSystem(Base):
    __tablename__ = "heating_systems"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    fuel_type = Column(String)
    efficiency = Column(Numeric(10, 4))

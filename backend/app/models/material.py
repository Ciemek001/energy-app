from sqlalchemy import Column, Integer, String, Numeric
from app.db.database import Base

class MaterialPreset(Base):
    __tablename__ = "material_presets"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    u_value = Column(Numeric(10, 4), nullable=False)

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class BuildingParameters(Base):
    __tablename__ = "building_parameters"

    id = Column(Integer, primary_key=True)

    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"))
    wall_type_id = Column(Integer, ForeignKey("material_presets.id"))
    roof_type_id = Column(Integer, ForeignKey("material_presets.id"))
    window_type_id = Column(Integer, ForeignKey("material_presets.id"))
    heating_system_id = Column(Integer, ForeignKey("heating_systems.id"))

    ventilation_type = Column(String)

    building = relationship("Building", back_populates="parameters")

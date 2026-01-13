from sqlalchemy import Column, Integer, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Calculation(Base):
    __tablename__ = "calculations"

    id = Column(Integer, primary_key=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"))

    ep = Column(Numeric(10, 4))
    ek = Column(Numeric(10, 4))
    eu = Column(Numeric(10, 4))

    timestamp = Column(TIMESTAMP, server_default=func.now())

    building = relationship("Building", back_populates="calculations")

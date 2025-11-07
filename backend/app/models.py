from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class Flight(Base):
    __tablename__ = "flights"

    id = Column(Integer, primary_key=True, index=True)
    icao24 = Column(String(20), nullable=False, index=True)
    callsign = Column(String(20))
    origin_country = Column(String(100))
    longitude = Column(Float)
    latitude = Column(Float)
    altitude = Column(Float)
    velocity = Column(Float)
    heading = Column(Float)
    vertical_rate = Column(Float)
    on_ground = Column(Boolean)
    last_contact = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now(), index=True)

class SystemEvent(Base):
    __tablename__ = "system_events"

    id = Column(Integer, primary_key=True)
    event_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    message = Column(Text)
    metadata_json = Column("metadata", JSON)  # ✅ alias interno, columna sigue siendo 'metadata'
    created_at = Column(DateTime, server_default=func.now())
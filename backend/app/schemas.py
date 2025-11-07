from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FlightBase(BaseModel):
    icao24: str
    callsign: Optional[str] = None
    origin_country: Optional[str] = None
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    altitude: Optional[float] = None
    velocity: Optional[float] = None
    heading: Optional[float] = None
    vertical_rate: Optional[float] = None
    on_ground: Optional[bool] = False
    last_contact: Optional[datetime] = None

class FlightResponse(FlightBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_flights: int
    active_flights: int
    unique_aircraft: int
    avg_altitude: Optional[float] = None
    avg_velocity: Optional[float] = None

class SystemEventBase(BaseModel):
    event_type: str
    severity: str
    message: str
    metadata: Optional[dict] = None

class SystemEventResponse(SystemEventBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ZabbixWebhook(BaseModel):
    trigger_name: str
    severity: str
    status: str
    item_value: str
    timestamp: str
    message: str
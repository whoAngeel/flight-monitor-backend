from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.services.flights import get_active_flights
from app.schemas import FlightResponse

router = APIRouter()

@router.get("/active", response_model=List[FlightResponse])
async def get_active(db: AsyncSession = Depends(get_db)):
    return await get_active_flights(db)
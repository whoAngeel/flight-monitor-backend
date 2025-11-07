from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import List

from app.models import Flight
from app.schemas import FlightResponse, StatsResponse

async def save_flights(db: AsyncSession, flights_data: List[dict]) -> int:
    flights = [Flight(**data) for data in flights_data]
    db.add_all(flights)
    await db.commit()
    return len(flights)

async def get_active_flights(db: AsyncSession, minutes: int = 5) -> List[FlightResponse]:
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    result = await db.execute(
        select(Flight).where(Flight.created_at >= cutoff).order_by(Flight.created_at.desc())
    )
    return result.scalars().all()

async def get_stats(db: AsyncSession) -> StatsResponse:
    # Total flights today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    total_result = await db.execute(
        select(func.count(Flight.id)).where(Flight.created_at >= today)
    )
    total_flights = total_result.scalar()
    
    # Active flights (last 5 min)
    cutoff = datetime.utcnow() - timedelta(minutes=5)
    active_result = await db.execute(
        select(func.count(Flight.id)).where(Flight.created_at >= cutoff)
    )
    active_flights = active_result.scalar()
    
    # Unique aircraft today
    unique_result = await db.execute(
        select(func.count(func.distinct(Flight.icao24))).where(Flight.created_at >= today)
    )
    unique_aircraft = unique_result.scalar()
    
    # Averages from last hour
    hour_ago = datetime.utcnow() - timedelta(hours=1)
    avg_result = await db.execute(
        select(
            func.avg(Flight.altitude),
            func.avg(Flight.velocity)
        ).where(Flight.created_at >= hour_ago)
    )
    avg_altitude, avg_velocity = avg_result.first()
    
    return StatsResponse(
        total_flights=total_flights or 0,
        active_flights=active_flights or 0,
        unique_aircraft=unique_aircraft or 0,
        avg_altitude=float(avg_altitude) if avg_altitude else None,
        avg_velocity=float(avg_velocity) if avg_velocity else None
    )

async def cleanup_old_flights(db: AsyncSession, hours: int = 2) -> int:
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    result = await db.execute(
        delete(Flight).where(Flight.created_at < cutoff)
    )
    await db.commit()
    return result.rowcount
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta

from app.database import get_db
from app.services.flights import get_stats
from app.services.gemini import gemini_service
from app.schemas import StatsResponse
from app.models import Flight

router = APIRouter()

@router.get("/current", response_model=StatsResponse)
async def get_current_stats(db: AsyncSession = Depends(get_db)):
    return await get_stats(db)

@router.get("/insights")
async def get_insights(db: AsyncSession = Depends(get_db)):
    stats = await get_stats(db)
    insights = await gemini_service.analyze_traffic(stats.model_dump())
    
    return {
        "insights": insights,
        "stats": stats
    }

@router.get("/predict")
async def predict_traffic(db: AsyncSession = Depends(get_db)):
    # Obtener estadísticas por hora de las últimas 24h
    result = await db.execute(
        select(
            func.date_trunc('hour', Flight.created_at).label('hour'),
            func.count(Flight.id).label('flights')
        )
        .where(Flight.created_at >= datetime.utcnow() - timedelta(hours=24))
        .group_by('hour')
        .order_by(desc('hour'))
    )
    
    hourly_stats = [
        {"hour": row.hour.strftime("%H:00"), "flights": row.flights}
        for row in result.all()
    ]
    
    prediction = await gemini_service.predict_traffic(hourly_stats)
    
    return {
        "prediction": prediction,
        "historical_data": hourly_stats[:12]  # Últimas 12 horas
    }

@router.post("/chat")
async def chat_with_ai(
    question: str = Query(..., description="Pregunta sobre tráfico aéreo"),
    db: AsyncSession = Depends(get_db)
):
    stats = await get_stats(db)
    response = await gemini_service.chat(question, stats.model_dump())
    
    return {
        "question": question,
        "answer": response,
        "context": stats
    }

@router.get("/report/daily")
async def get_daily_report(db: AsyncSession = Depends(get_db)):
    # Stats del día completo
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    result = await db.execute(
        select(
            func.count(Flight.id).label('total'),
            func.count(func.distinct(Flight.icao24)).label('unique'),
            func.avg(Flight.altitude).label('avg_alt'),
            func.avg(Flight.velocity).label('avg_vel')
        ).where(Flight.created_at >= today)
    )
    
    row = result.first()
    
    # Hora pico
    peak_result = await db.execute(
        select(
            func.date_trunc('hour', Flight.created_at).label('hour'),
            func.count(Flight.id).label('flights')
        )
        .where(Flight.created_at >= today)
        .group_by('hour')
        .order_by(desc('flights'))
        .limit(1)
    )
    
    peak = peak_result.first()
    
    daily_stats = {
        "total_flights": row.total or 0,
        "unique_aircraft": row.unique or 0,
        "avg_altitude": float(row.avg_alt) if row.avg_alt else 0,
        "avg_velocity": float(row.avg_vel) if row.avg_vel else 0,
        "peak_hour": peak.hour.strftime("%H:00") if peak else "N/A",
        "peak_flights": peak.flights if peak else 0
    }
    
    report = await gemini_service.generate_report(daily_stats)
    
    return {
        "report": report,
        "stats": daily_stats,
        "generated_at": datetime.utcnow().isoformat()
    }
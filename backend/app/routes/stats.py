from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.flights import get_stats
from app.services.gemini import get_ai_insights
from app.schemas import StatsResponse

router = APIRouter()

@router.get("/current", response_model=StatsResponse)
async def get_current_stats(db: AsyncSession = Depends(get_db)):
    return await get_stats(db)

@router.get("/insights")
async def get_insights(db: AsyncSession = Depends(get_db)):
    stats = await get_stats(db)
    insights = await get_ai_insights(stats.model_dump())
    return {"insights": insights, "stats": stats}
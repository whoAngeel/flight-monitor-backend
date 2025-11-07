from app.services.flights import cleanup_old_flights
from app.database import async_session_maker

async def run_cleanup(hours: int = 2) -> int:
    async with async_session_maker() as db:
        deleted = await cleanup_old_flights(db, hours)
        print(f"Cleanup: deleted {deleted} old flight records")
        return deleted
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.opensky import opensky_client
from app.services.flights import save_flights, get_stats
from app.database import async_session_maker

scheduler = AsyncIOScheduler()

async def fetch_and_store_flights(sio):
    async with async_session_maker() as db:
        flights_data = await opensky_client.get_flights_over_cdmx()
        
        if flights_data:
            count = await save_flights(db, flights_data)
            print(f"Stored {count} flights")
            
            # Emit to WebSocket clients
            await sio.emit('flights_update', flights_data)
            
            stats = await get_stats(db)
            await sio.emit('stats_update', stats.model_dump())

async def start_collector(sio):
    scheduler.add_job(
        fetch_and_store_flights,
        'interval',
        seconds=60,
        args=[sio],
        id='flight_collector'
    )
    scheduler.start()
    print("Flight collector started - fetching every 60 seconds")
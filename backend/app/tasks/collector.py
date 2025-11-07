from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.opensky import opensky_client
from app.services.flights import save_flights, get_stats
from app.database import async_session_maker
import datetime
scheduler = AsyncIOScheduler()

async def fetch_and_store_flights(sio):
    async with async_session_maker() as db:
        flights_data = await opensky_client.get_flights_over_cdmx()
        
        if flights_data:
            count = await save_flights(db, flights_data)
            print(f"Stored {count} flights")
            
            # --- INICIO DE LA CORRECCIÓN ---
            
            # 'flights_data' es probablemente una lista de dicts.
            # Necesitamos crear una copia serializable.
            serializable_flights = []
            
            for flight_dict in flights_data:
                # Hacemos una copia para procesar
                processed_flight = flight_dict.copy()
                
                # Iteramos sobre las claves y valores del dict
                for key, value in processed_flight.items():
                    # Si encontramos un datetime, lo convertimos a string ISO
                    if isinstance(value, datetime.datetime):
                        processed_flight[key] = value.isoformat()
                
                serializable_flights.append(processed_flight)
            
            # Emitimos la lista que SÍ es serializable
            await sio.emit('flights_update', serializable_flights)
            
            # --- FIN DE LA CORRECCIÓN ---
            
            stats = await get_stats(db)
            # Esta línea ya estaba bien, porque .model_dump() hace la serialización
            await sio.emit('stats_update', stats.model_dump())

async def start_collector(sio):
    scheduler.add_job(
        fetch_and_store_flights,
        'interval',
        seconds=5,
        args=[sio],
        id='flight_collector'
    )
    scheduler.start()
    print("Flight collector started - fetching every 5 seconds")
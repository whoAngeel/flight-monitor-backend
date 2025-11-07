from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, delete, func
from datetime import datetime, timedelta
from app.database import async_session_maker
from app.models import Flight
from app.services.snowflake_backup import snowflake_service

scheduler = AsyncIOScheduler()

async def auto_archive_and_cleanup(sio):
    """Monitorea BD y archiva en Snowflake antes de limpiar"""
    async with async_session_maker() as db:
        # Contar registros totales
        result = await db.execute(select(func.count(Flight.id)))
        total_count = result.scalar()
        
        print(f"📊 Current DB records: {total_count}")
        
        if total_count <= 200:
            print("✅ DB within limits, no action needed")
            return
        
        print(f"⚠️ DB has {total_count} records (threshold: 200)")
        
        # Seleccionar registros antiguos (>1 hora)
        cutoff = datetime.utcnow() - timedelta(hours=1)
        result = await db.execute(
            select(Flight).where(Flight.created_at < cutoff)
        )
        old_flights = result.scalars().all()
        
        if not old_flights:
            print("⚠️ No old records to archive (all are <1 hour old)")
            return
        
        # Convertir a dict para Snowflake
        flights_data = [
            {
                "id": f.id,
                "icao24": f.icao24,
                "callsign": f.callsign,
                "origin_country": f.origin_country,
                "longitude": f.longitude,
                "latitude": f.latitude,
                "altitude": f.altitude,
                "velocity": f.velocity,
                "heading": f.heading,
                "vertical_rate": f.vertical_rate,
                "on_ground": f.on_ground,
                "last_contact": f.last_contact,
                "created_at": f.created_at
            }
            for f in old_flights
        ]
        
        print(f"📦 Backing up {len(flights_data)} records to Snowflake...")
        
        # Backup a Snowflake
        backup_success = snowflake_service.backup_flights(flights_data)
        
        if not backup_success:
            print("❌ Backup failed, aborting cleanup")
            return
        
        # Eliminar de PostgreSQL solo si backup fue exitoso
        delete_result = await db.execute(
            delete(Flight).where(Flight.created_at < cutoff)
        )
        await db.commit()
        
        deleted_count = delete_result.rowcount
        print(f"🗑️ Deleted {deleted_count} records from PostgreSQL")
        
        # Notificar vía WebSocket
        await sio.emit('cleanup_executed', {
            "deleted_records": deleted_count,
            "backed_up_to": "Snowflake",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        await sio.emit('zabbix_alert', {
            "trigger_name": "Database cleanup executed",
            "severity": "info",
            "status": "OK",
            "item_value": str(deleted_count),
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"Archived {deleted_count} records to Snowflake and cleaned from PostgreSQL"
        })

async def start_auto_archiver(sio):
    """Inicia el scheduler de archivado automático"""
    # Inicializar schema de Snowflake al arrancar
    snowflake_service.initialize_schema()
    
    # Ejecutar cada 5 minutos
    scheduler.add_job(
        auto_archive_and_cleanup,
        'interval',
        minutes=5,
        args=[sio],
        id='auto_archiver'
    )
    
    scheduler.start()
    print("🔄 Auto-archiver started - checking every 5 minutes")
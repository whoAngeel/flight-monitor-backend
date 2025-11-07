from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
import socketio

from app.database import get_db
from app.config import settings
from app.models import SystemEvent
from app.schemas import ZabbixWebhook
from app.tasks.cleanup import run_cleanup
from app.socket_manager import sio

router = APIRouter()

@router.post("/webhook")
async def receive_webhook(
    payload: ZabbixWebhook,
    x_zabbix_token: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if x_zabbix_token != settings.zabbix_webhook_secret:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Save event to database
    event = SystemEvent(
        event_type=payload.trigger_name,
        severity=payload.severity,
        message=payload.message,
        metadata={
            "status": payload.status,
            "item_value": payload.item_value,
            "timestamp": payload.timestamp
        }
    )
    db.add(event)
    await db.commit()
    
    # Emit to WebSocket clients
    await sio.emit('zabbix_alert', payload.model_dump())
    
    # Execute cleanup if high volume trigger
    if "high_volume" in payload.trigger_name.lower() or "limpieza" in payload.trigger_name.lower():
        deleted = await run_cleanup(hours=2)
        await sio.emit('cleanup_executed', {"deleted_records": deleted})
    
    return {"status": "received", "event_id": event.id}
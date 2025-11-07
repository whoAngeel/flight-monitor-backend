from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio
from app.tasks.auto_archiver import start_auto_archiver

from app.config import settings
from app.database import engine
from app.routes import flights, stats, zabbix
from app.tasks.collector import start_collector


sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_collector(sio)
    await start_auto_archiver(sio) 
    yield
    await engine.dispose()

fastapi_app = FastAPI(
    title="Air Traffic Monitor API",
    version="1.0.0",
    lifespan=lifespan
)

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_app.include_router(flights.router, prefix="/api/flights", tags=["flights"])
fastapi_app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
fastapi_app.include_router(zabbix.router, prefix="/api/zabbix", tags=["zabbix"])

@fastapi_app.get("/api/system/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment
    }

@sio.on('connect')
async def connect(sid, environ):
    print(f"✅ Client connected: {sid}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"❌ Client disconnected: {sid}")

app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)
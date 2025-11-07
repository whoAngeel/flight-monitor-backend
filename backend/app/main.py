from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio

from app.config import settings
from app.database import engine
from app.routes import flights, stats, zabbix

from app.socket_manager import sio, socket_app

from app.tasks.collector import start_collector

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

socket_app = socketio.ASGIApp(sio)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_collector(sio)
    yield
    await engine.dispose()

app = FastAPI(
    title="Air Traffic Monitor API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flights.router, prefix="/api/flights", tags=["flights"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(zabbix.router, prefix="/api/zabbix", tags=["zabbix"])

app.mount("/ws", socket_app)

@app.get("/")
async def root():
    return {"status": "ok", "message": "Air Traffic Monitor API"}

@app.get("/api/system/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment
    }

@sio.on('connect')
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
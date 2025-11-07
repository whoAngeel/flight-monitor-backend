# Air Traffic Monitor - Backend

Sistema de monitoreo de tráfico aéreo sobre CDMX usando OpenSky API, FastAPI, PostgreSQL y Zabbix.

## Setup Rápido

1. **Clonar y configurar:**
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales
```

2. **Levantar con Docker:**
```bash
docker-compose up -d
```

3. **Verificar:**
```bash
curl http://localhost:8000/api/system/health
```

## Endpoints

- `GET /api/flights/active` - Vuelos activos
- `GET /api/stats/current` - Estadísticas actuales
- `GET /api/stats/insights` - Insights con Gemini AI
- `POST /api/zabbix/webhook` - Recibe triggers de Zabbix
- `WS /ws` - WebSocket para tiempo real

## WebSocket Events

**Enviados por el servidor:**
- `flights_update` - Nuevos vuelos detectados
- `stats_update` - Estadísticas actualizadas
- `zabbix_alert` - Alerta de Zabbix
- `cleanup_executed` - Limpieza de BD ejecutada

## Desarrollo
```bash
# Logs
docker-compose logs -f backend

# Reiniciar
docker-compose restart backend

# Entrar al contenedor
docker-compose exec backend bash
```
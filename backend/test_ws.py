import asyncio
import socketio

sio = socketio.AsyncClient()

@sio.on('connect')
async def on_connect():
    print('✅ Connected to WebSocket')

@sio.on('flights_update')
async def on_flights(data):
    print(f'✈️ Flights update: {len(data)} flights')

@sio.on('stats_update')
async def on_stats(data):
    print(f'📊 Stats update: {data}')

@sio.on('disconnect')
async def on_disconnect():
    print('❌ Disconnected')

async def main():
    await sio.connect('http://localhost:8000/ws')
    await sio.wait()

if __name__ == '__main__':
    asyncio.run(main())

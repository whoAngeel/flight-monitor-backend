import httpx
from datetime import datetime, timedelta
from typing import List
from app.config import settings

OPENSKY_API_URL = "https://opensky-network.org/api/states/all"
OPENSKY_TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"

CDMX_BBOX = {
    "lamin": 19.0,
    "lomin": -99.4,
    "lamax": 19.6,
    "lomax": -98.9
}

class OpenSkyClient:
    def __init__(self):
        self.api_url = OPENSKY_API_URL
        self.token_url = OPENSKY_TOKEN_URL
        self.client_id = settings.opensky_client_id
        self.client_secret = settings.opensky_client_secret
        self.access_token = None
        self.token_expires_at = None
    
    async def _get_access_token(self) -> str:
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return self.access_token
        
        print("🔑 Obtaining OAuth token from OpenSky...")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                self.token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                raise Exception(f"Token error: {response.status_code} - {response.text}")
            
            data = response.json()
            self.access_token = data.get("access_token")
            
            if not self.access_token:
                raise Exception("No access_token in response")
            
            expires_in = data.get("expires_in", 3600)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
            
            print(f"✅ Token obtained (expires in {expires_in}s)")
            return self.access_token
    
    async def get_flights_over_cdmx(self) -> List[dict]:
        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                token = await self._get_access_token()
                
                response = await client.get(
                    self.api_url,
                    params=CDMX_BBOX,
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if response.status_code == 401:
                    print("Token expired, refreshing...")
                    self.access_token = None
                    token = await self._get_access_token()
                    response = await client.get(
                        self.api_url,
                        params=CDMX_BBOX,
                        headers={"Authorization": f"Bearer {token}"}
                    )
                
                response.raise_for_status()
                data = response.json()
                
                states = data.get("states", [])
                if not states:
                    print("⚠️ No flights found over CDMX")
                    return []
                
                print(f"✈️ Found {len(states)} flights over CDMX")
                return self._parse_states(states)
            
            except Exception as e:
                print(f"❌ Error fetching flights: {e}")
                return []
    
    def _parse_states(self, states: List) -> List[dict]:
        flights = []
        for state in states:
            flights.append({
                "icao24": state[0],
                "callsign": state[1].strip() if state[1] else None,
                "origin_country": state[2],
                "longitude": state[5],
                "latitude": state[6],
                "altitude": state[7],
                "on_ground": state[8],
                "velocity": state[9],
                "heading": state[10],
                "vertical_rate": state[11],
                "last_contact": datetime.fromtimestamp(state[4]) if state[4] else None
            })
        return flights

opensky_client = OpenSkyClient()
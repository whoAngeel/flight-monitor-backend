import os
import httpx
from datetime import datetime


CLIENT_ID = "whoangel-api-client"
CLIENT_SECRET = "cLcmCbk8aTcS6RxbGUo2mC12HO1KGY0j"

TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
API_URL = "https://opensky-network.org/api/states/all"

# Coordenadas de la Ciudad de México
CDMX_BBOX = {
    "lamin": 19.0,
    "lomin": -99.4,
    "lamax": 19.6,
    "lomax": -98.9
}


def get_access_token():
    """Obtiene un token OAuth2 válido usando client_credentials."""
    print("🔑 Obteniendo token OAuth de OpenSky...")
    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    with httpx.Client(timeout=15.0) as client:
        response = client.post(TOKEN_URL, data=data, headers=headers)

        if response.status_code != 200:
            raise Exception(f"❌ Error obteniendo token: {response.status_code} - {response.text}")

        token = response.json().get("access_token")
        if not token:
            raise Exception("❌ No se encontró 'access_token' en la respuesta.")

        print("✅ Token obtenido correctamente.")
        return token


def get_flights_over_cdmx(token: str):
    """Consulta los vuelos actuales sobre la Ciudad de México."""
    print("✈️ Consultando vuelos sobre la Ciudad de México...")

    headers = {"Authorization": f"Bearer {token}"}

    with httpx.Client(timeout=20.0) as client:
        response = client.get(API_URL, params=CDMX_BBOX, headers=headers)

        if response.status_code == 401:
            raise Exception("❌ Token inválido o expirado. Verifica tus credenciales.")
        response.raise_for_status()

        data = response.json()
        states = data.get("states", [])
        if not states:
            print("⚠️ No se encontraron vuelos sobre CDMX.")
            return

        print(f"🛫 Se encontraron {len(states)} vuelos sobre CDMX.")
        for s in states[:10]:
            callsign = s[1].strip() if s[1] else "SIN LLAMADA"
            country = s[2]
            lat, lon = s[6], s[5]
            alt = s[7]
            print(f"• {callsign} ({country}) - Altitud: {alt} m - ({lat:.2f}, {lon:.2f})")


if __name__ == "__main__":
    try:
        token = get_access_token()
        get_flights_over_cdmx(token)
    except Exception as e:
        print(e)

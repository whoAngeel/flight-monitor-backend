import httpx
from app.config import settings
import json

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

class GeminiService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.api_url = GEMINI_API_URL
    
    async def _generate(self, prompt: str) -> str:
        if not self.api_key:
            return "Gemini API key not configured"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.api_url,
                headers={
                    "Content-Type": "application/json",
                    "X-goog-api-key": self.api_key
                },
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Gemini API error: {response.status_code} - {response.text}")
            
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    
    async def analyze_traffic(self, stats: dict) -> str:
        prompt = f"""
Eres un analista de tráfico aéreo. Analiza estos datos sobre vuelos en Ciudad de México:

📊 DATOS ACTUALES:
- Total de vuelos hoy: {stats['total_flights']}
- Vuelos activos ahora: {stats['active_flights']}
- Aeronaves únicas: {stats['unique_aircraft']}
- Altitud promedio: {stats['avg_altitude']:.0f} metros
- Velocidad promedio: {stats['avg_velocity']:.1f} m/s

TAREA: Genera exactamente 3 insights breves y accionables (máximo 2 líneas cada uno).

Formato requerido:
- [Insight 1]
- [Insight 2]
- [Insight 3]

Enfócate en: patrones, anomalías, tendencias o recomendaciones operativas.
"""
        
        try:
            return await self._generate(prompt)
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def predict_traffic(self, hourly_stats: list) -> dict:
        stats_text = "\n".join([
            f"Hora {s['hour']}: {s['flights']} vuelos" 
            for s in hourly_stats[-6:]  # Últimas 6 horas
        ])
        
        prompt = f"""
Datos de tráfico aéreo de las últimas horas en CDMX:

{stats_text}

Basándote en estos datos:
1. Predice cuántos vuelos habrá en la próxima hora
2. Indica tu nivel de confianza (0-100%)
3. Explica brevemente tu razonamiento

Responde SOLO con JSON válido en este formato:
{{
  "predicted_flights": número,
  "confidence": porcentaje,
  "reasoning": "explicación breve"
}}
"""
        
        try:
            response = await self._generate(prompt)
            # Limpiar respuesta (puede venir con markdown)
            clean_response = response.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(clean_response)
        except Exception as e:
            return {
                "predicted_flights": 0,
                "confidence": 0,
                "reasoning": f"Error: {str(e)}"
            }
    
    async def chat(self, question: str, context: dict) -> str:
        prompt = f"""
Eres un asistente de información de tráfico aéreo sobre Ciudad de México.

CONTEXTO ACTUAL:
- Total vuelos: {context.get('total_flights', 0)}
- Vuelos activos: {context.get('active_flights', 0)}
- Aeronaves únicas: {context.get('unique_aircraft', 0)}

PREGUNTA DEL USUARIO: {question}

Responde de forma clara, concisa y profesional. Si la pregunta no está relacionada con tráfico aéreo, redirige amablemente al tema.
"""
        
        try:
            return await self._generate(prompt)
        except Exception as e:
            return f"Lo siento, ocurrió un error: {str(e)}"
    
    async def generate_report(self, daily_stats: dict) -> str:
        prompt = f"""
Genera un reporte ejecutivo profesional sobre el tráfico aéreo en Ciudad de México.

DATOS DEL DÍA:
- Total de vuelos: {daily_stats['total_flights']}
- Aeronaves únicas: {daily_stats['unique_aircraft']}
- Altitud promedio: {daily_stats['avg_altitude']:.0f}m
- Velocidad promedio: {daily_stats['avg_velocity']:.1f} m/s
- Hora pico: {daily_stats.get('peak_hour', 'N/A')} con {daily_stats.get('peak_flights', 0)} vuelos

FORMATO:
## Resumen Ejecutivo
[2-3 líneas clave]

## Métricas Destacadas
[3-4 bullets con datos importantes]

## Observaciones
[2-3 insights relevantes]

## Recomendaciones
[1-2 acciones sugeridas]

Usa markdown profesional.
"""
        
        try:
            return await self._generate(prompt)
        except Exception as e:
            return f"# Error generando reporte\n\n{str(e)}"

gemini_service = GeminiService()
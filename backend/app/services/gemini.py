import google.generativeai as genai
from app.config import settings

if settings.gemini_api_key:
    genai.configure(api_key=settings.gemini_api_key)

async def get_ai_insights(stats: dict) -> str:
    if not settings.gemini_api_key:
        return "Gemini API key not configured"
    
    try:
        prompt = f"""
        Analiza estos datos de tráfico aéreo sobre Ciudad de México:
        
        - Total de vuelos hoy: {stats['total_flights']}
        - Vuelos activos ahora: {stats['active_flights']}
        - Aeronaves únicas: {stats['unique_aircraft']}
        - Altitud promedio: {stats['avg_altitude']:.0f} metros
        - Velocidad promedio: {stats['avg_velocity']:.1f} m/s
        
        Genera 3 insights breves y útiles (máximo 2 líneas cada uno).
        Formato: lista con bullets usando "•".
        """
        
        model = genai.GenerativeModel('gemini-pro')
        response = await model.generate_content_async(prompt)
        
        return response.text
    
    except Exception as e:
        return f"Error generating insights: {str(e)}"
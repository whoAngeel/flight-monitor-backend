from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    opensky_client_id: str
    opensky_client_secret: str
    zabbix_webhook_secret: str
    gemini_api_key: str = ""
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()
import snowflake.connector
from typing import List, Dict
from app.config import settings
from datetime import datetime

class SnowflakeBackupService:
    def __init__(self):
        self.account = "NDRGZDA-YE47027"
        self.user = "WHOANGEL"
        self.password = settings.snowflake_password
        self.warehouse = "COMPUTE_WH"
        self.database = "SKY_MONITOR"
        self.schema = "ARCHIVE"
        self.role = "ACCOUNTADMIN"
    
    def _get_connection(self):
        return snowflake.connector.connect(
            account=self.account,
            user=self.user,
            password=self.password,
            warehouse=self.warehouse,
            database=self.database,
            schema=self.schema,
            role=self.role
        )
    
    def initialize_schema(self):
        """Crea schema y tabla si no existen"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {self.schema}")
            cursor.execute(f"USE SCHEMA {self.schema}")
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS FLIGHTS_ARCHIVE (
                    id INTEGER,
                    icao24 VARCHAR(20),
                    callsign VARCHAR(20),
                    origin_country VARCHAR(100),
                    longitude FLOAT,
                    latitude FLOAT,
                    altitude FLOAT,
                    velocity FLOAT,
                    heading FLOAT,
                    vertical_rate FLOAT,
                    on_ground BOOLEAN,
                    last_contact TIMESTAMP,
                    created_at TIMESTAMP,
                    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
                )
            """)
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print("✅ Snowflake schema and table initialized")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing Snowflake: {e}")
            return False
    
    def backup_flights(self, flights: List[Dict]) -> bool:
        """Inserta vuelos en Snowflake"""
        if not flights:
            return True
        
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            insert_query = """
                INSERT INTO FLIGHTS_ARCHIVE (
                    id, icao24, callsign, origin_country,
                    longitude, latitude, altitude, velocity,
                    heading, vertical_rate, on_ground,
                    last_contact, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s
                )
            """
            
            data = [
                (
                    f['id'], f['icao24'], f['callsign'], f['origin_country'],
                    f['longitude'], f['latitude'], f['altitude'], f['velocity'],
                    f['heading'], f['vertical_rate'], f['on_ground'],
                    f['last_contact'], f['created_at']
                )
                for f in flights
            ]
            
            cursor.executemany(insert_query, data)
            conn.commit()
            
            inserted_count = cursor.rowcount
            cursor.close()
            conn.close()
            
            print(f"✅ Backed up {inserted_count} flights to Snowflake")
            return True
            
        except Exception as e:
            print(f"❌ Error backing up to Snowflake: {e}")
            return False
    
    def get_archive_stats(self) -> Dict:
        """Obtiene estadísticas del archivo"""
        try:
            conn = self._get_connection()
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(DISTINCT icao24) as unique_aircraft,
                    MIN(created_at) as oldest_record,
                    MAX(created_at) as newest_record
                FROM FLIGHTS_ARCHIVE
            """)
            
            row = cursor.fetchone()
            cursor.close()
            conn.close()
            
            return {
                "total_records": row[0],
                "unique_aircraft": row[1],
                "oldest_record": row[2],
                "newest_record": row[3]
            }
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {}

snowflake_service = SnowflakeBackupService()
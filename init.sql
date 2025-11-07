CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    icao24 VARCHAR(20) NOT NULL,
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
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flights_created_at ON flights(created_at DESC);
CREATE INDEX idx_flights_icao24 ON flights(icao24);
CREATE INDEX idx_flights_active ON flights(created_at) WHERE created_at > NOW() - INTERVAL '5 minutes';

CREATE TABLE IF NOT EXISTS system_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_created_at ON system_events(created_at DESC);

CREATE MATERIALIZED VIEW flight_stats AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as total_flights,
    COUNT(DISTINCT icao24) as unique_aircraft,
    AVG(altitude) as avg_altitude,
    AVG(velocity) as avg_velocity,
    AVG(heading) as avg_heading
FROM flights
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

CREATE UNIQUE INDEX ON flight_stats(hour);
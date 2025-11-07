import { useSocket } from '../hooks/useSocket';
import MapView from '../components/MapView';
import StatsChart from '../components/StatsChart';
import WebSocketStatus from '../components/WebSocketStatus';

function Dashboard() {
  const { flights, stats, alerts } = useSocket();

  return (
    <div className="p-4 text-white bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">✈️ Panel de Tráfico Aéreo</h1>

      <section className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-slate-800 p-4 rounded-2xl shadow">
          <h2 className="text-xl mb-2">🗺️ Mapa de vuelos</h2>
          <MapView flights={flights} />
        </div>

        <div className="bg-slate-800 p-4 rounded-2xl shadow">
          <h2 className="text-xl mb-2">📊 Estadísticas</h2>
          {stats ? (
            <ul>
             <StatsChart />

            </ul>
          ) : (
            <p>Cargando...</p>
          )}
        </div>

        <div className="col-span-3 bg-slate-800 p-4 rounded-2xl shadow mt-4">
          <h2 className="text-xl mb-2">⚠️ Alertas recientes</h2>
          {alerts.length ? (
            <ul>
              {alerts.map((a, i) => (
                <li key={i}>
                  [{a.severity.toUpperCase()}] {a.trigger_name} - {a.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin alertas</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

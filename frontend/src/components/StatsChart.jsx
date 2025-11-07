import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function StatsChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/stats/predict')
      .then((res) => setData(res.data.historical_data || []))
      .catch((err) => console.error('Error cargando datos predictivos:', err));
  }, []);

  return (
    <div className="mt-4">
      <h3 className="text-lg mb-2">📈 Vuelos por hora (histórico)</h3>
      {data.length ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="hour" stroke="#f1f5f9" />
            <YAxis stroke="#f1f5f9" />
            <Tooltip />
            <Bar dataKey="flights" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>Cargando gráfico...</p>
      )}
    </div>
  );
}

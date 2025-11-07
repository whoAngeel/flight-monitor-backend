import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { useFlightData } from "../context/socketContext";

export default function FlightsChart() {
  const { chartData } = useFlightData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{`Hora: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed(1)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200 h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-2 text-gray-800 flex items-center gap-1.5">
        <span className="text-lg">📈</span>
        Evolución en tiempo real
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAltitude" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              opacity={0.5}
            />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              style={{ fontSize: "10px" }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              stroke="#6b7280"
              style={{ fontSize: "10px" }}
              width={50}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              style={{ fontSize: "10px" }}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
              iconType="line"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="active"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorActive)"
              name="Vuelos activos"
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="avg_altitude"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAltitude)"
              name="Altitud promedio (m)"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {chartData.length === 0 && (
        <div className="text-center py-4">
          <p className="text-gray-400 text-xs animate-pulse">
            Esperando datos...
          </p>
        </div>
      )}
    </div>
  );
}
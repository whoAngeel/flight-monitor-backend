import { useState, useEffect } from "react";
import axios from "axios";

export default function CurrentStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:8000/api/stats/current");
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="bg-white rounded-lg shadow p-6">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        📊 Current Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Flights" value={stats?.total_flights || 0} />
        <StatCard label="Active Now" value={stats?.active_flights || 0} />
        <StatCard label="Unique Aircraft" value={stats?.unique_aircraft || 0} />
        <StatCard
          label="Avg Altitude"
          value={`${Math.round(stats?.avg_altitude || 0)}m`}
        />
        <StatCard
          label="Avg Velocity"
          value={`${Math.round((stats?.avg_velocity || 0) * 3.6)} km/h`}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded p-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
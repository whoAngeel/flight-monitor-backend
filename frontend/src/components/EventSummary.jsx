import { useState, useEffect } from "react";
import axios from "axios";

const severityColors = {
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  error: "bg-orange-500",
  critical: "bg-red-500",
};

export default function EventsSummary() {
  const [summary, setSummary] = useState(null);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/system/events/summary?hours=${hours}`
      );
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, [hours]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const total = summary.total_events || 0;
  const getSeverityPercentage = (sev) => {
    if (total === 0) return 0;
    return ((summary.summary[sev] || 0) / total) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          📊 Events Summary
        </h3>
        <select
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
          className="px-3 py-1 border rounded text-sm"
        >
          <option value={1}>Last hour</option>
          <option value={6}>Last 6 hours</option>
          <option value={24}>Last 24 hours</option>
          <option value={72}>Last 3 days</option>
          <option value={168}>Last week</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-sm text-gray-600">Total Events</span>
        </div>

        <div className="space-y-2">
          {["info", "warning", "error", "critical"].map((sev) => {
            const count = summary.summary[sev] || 0;
            const percentage = getSeverityPercentage(sev);
            return (
              <div key={sev}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize font-medium">{sev}</span>
                  <span className="text-gray-600">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${severityColors[sev]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
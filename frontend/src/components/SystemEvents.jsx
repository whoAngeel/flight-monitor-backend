import { useState, useEffect } from "react";
import axios from "axios";

const severityConfig = {
  info: { color: "bg-blue-50 border-blue-200 text-blue-800", icon: "ℹ️" },
  warning: { color: "bg-yellow-50 border-yellow-200 text-yellow-800", icon: "⚠️" },
  error: { color: "bg-orange-50 border-orange-200 text-orange-800", icon: "⚠️" },
  critical: { color: "bg-red-50 border-red-200 text-red-800", icon: "🚨" },
};

export default function SystemEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(null);
  const [limit, setLimit] = useState(20);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { limit };
      if (filter) params.severity = filter;

      const { data } = await axios.get("http://localhost:8000/api/system/events", {
        params,
      });
      setEvents(data.events);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [filter, limit]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          📋 System Events Timeline
        </h2>
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
        >
          {loading ? "⟳" : "Refresh"}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1 text-sm rounded ${
            filter === null
              ? "bg-gray-800 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {["info", "warning", "error", "critical"].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`px-3 py-1 text-sm rounded capitalize ${
              filter === sev
                ? "bg-gray-800 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading && events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No events found</div>
        ) : (
          events.map((event) => {
            const config =
              severityConfig[event.severity] || severityConfig.info;
            return (
              <div
                key={event.id}
                className={`border rounded-lg p-3 ${config.color}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm">
                        {event.event_type}
                      </span>
                      <span className="text-xs opacity-75 whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{event.message}</p>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer opacity-75 hover:opacity-100">
                          View metadata
                        </summary>
                        <pre className="text-xs mt-1 bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Showing {events.length} events</span>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-2 py-1 border rounded"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}
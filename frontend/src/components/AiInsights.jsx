import { useState } from "react";
import axios from "axios";

export default function AiInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const { data } = await axios.get(`${apiUrl}/api/stats/insights`);
      setData(data);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🤖 AI Insights (Gemini)
        </h2>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Generate Insights"}
        </button>
      </div>

      {data && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded p-4 whitespace-pre-wrap">
            {data.insights}
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Total: </span>
              <span className="font-bold">{data.stats.total_flights}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Active: </span>
              <span className="font-bold">{data.stats.active_flights}</span>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Unique: </span>
              <span className="font-bold">{data.stats.unique_aircraft}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
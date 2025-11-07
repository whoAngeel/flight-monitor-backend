import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function DailyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const { data } = await axios.get(
        
        `${apiUrl}/api/stats/report/daily`
      );
      setReport(data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          📄 Daily Executive Report
        </h2>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⚙️</span> Generating...
            </>
          ) : (
            <>
              <span>✨</span> Generate Report
            </>
          )}
        </button>
      </div>

      {report && (
        <div>
          <div className="bg-blue-50 rounded p-3 mb-4 text-sm flex items-center gap-2">
            <span>🕐</span>
            <span className="text-gray-700">
              Generated at:{" "}
              <strong>
                {new Date(report.generated_at).toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </strong>
            </span>
          </div>

          <div className="prose max-w-none markdown-report">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-200">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-gray-700 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="ml-4">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900">
                    {children}
                  </strong>
                ),
              }}
            >
              {report.report}
            </ReactMarkdown>
          </div>

          <div className="mt-6 bg-gray-50 rounded p-4">
            <h3 className="font-bold mb-3">📊 Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-600">Total Flights</div>
                <div className="text-xl font-bold text-gray-900">
                  {report.stats.total_flights}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Unique Aircraft</div>
                <div className="text-xl font-bold text-gray-900">
                  {report.stats.unique_aircraft}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Avg Altitude</div>
                <div className="text-xl font-bold text-gray-900">
                  {Math.round(report.stats.avg_altitude)}m
                </div>
              </div>
              <div>
                <div className="text-gray-600">Peak Hour</div>
                <div className="text-xl font-bold text-gray-900">
                  {report.stats.peak_hour}
                  <span className="text-sm text-gray-600 ml-1">
                    ({report.stats.peak_flights})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
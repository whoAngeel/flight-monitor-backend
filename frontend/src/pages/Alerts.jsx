import React from "react";
import { useFlightData } from "../context/socketContext";

const severityColors = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  critical: "bg-red-50 border-red-200 text-red-800",
};

const severityIcons = {
  info: "ℹ️",
  warning: "⚠️",
  critical: "🚨",
};

export default function AlertsPage() {
  const { alerts } = useFlightData();

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Alertas</h2>

        {alerts.length === 0 ? (
          <div className="p-6 bg-white border rounded-lg text-center text-gray-500">
            No hay alertas en este momento.
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`border rounded-lg p-4 shadow-sm ${
                  severityColors[alert.severity] || severityColors.info
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{severityIcons[alert.severity] || severityIcons.info}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{alert.trigger_name}</div>
                      <div className="text-xs text-gray-700 opacity-80">{new Date(alert.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-sm mt-2 text-gray-800">{alert.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

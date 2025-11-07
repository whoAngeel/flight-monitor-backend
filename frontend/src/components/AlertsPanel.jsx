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

export default function AlertsPanel() {
  const { alerts } = useFlightData();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto space-y-2 z-50">
      {alerts.slice(0, 5).map((alert, i) => (
        <div
          key={i}
          className={`border rounded-lg p-3 shadow-lg ${
            severityColors[alert.severity] || severityColors.info
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-xl">
              {severityIcons[alert.severity] || severityIcons.info}
            </span>
            <div className="flex-1">
              <div className="font-bold text-sm">{alert.trigger_name}</div>
              <div className="text-xs mt-1">{alert.message}</div>
              <div className="text-xs mt-1 opacity-60">
                {new Date(alert.timestamp).toLocaleTimeString("es-MX")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
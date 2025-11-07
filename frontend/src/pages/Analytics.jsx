import { useState } from "react";
// import CurrentStats from "../components/analytics/CurrentStats";
import EventsSummary from "../components/EventSummary";
import SystemEvents from "../components/SystemEvents";
import DailyReport from "../components/DailyReport";
import TrafficPrediction from "../components/TrafficPrediction";
import AiInsights from "../components/AiInsights";
import AiChat from "../components/AiChat";
import CurrentStats from "../components/CurrentStats";


export default function Analytics() {
  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="md:col-span-2 space-y-6">
          <CurrentStats />
          {/* <EventsSummary /> */}
          <AiInsights />
          <TrafficPrediction />
          {/* <SystemEvents /> */}
          <DailyReport />
        </div>

        {/* Sidebar Chat */}
        <aside className="md:col-span-1">
          <div className="sticky top-4 h-[calc(100vh-4rem)] overflow-auto">
            <AiChat />
          </div>
        </aside>
      </div>
    </div>
  );
}

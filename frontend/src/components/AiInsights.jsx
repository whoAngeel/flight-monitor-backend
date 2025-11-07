import { useState } from "react";
import axios from "axios";

export default function AiInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

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

  const playAudioFromText = async (text) => {
    try {
      setPlaying(true);
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      });

      const audioData = await response.arrayBuffer();
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();

      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Error reproduciendo el audio:", error);
      setPlaying(false);
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

          <div className="flex gap-3">
            <button
              onClick={() => playAudioFromText(data.insights)}
              disabled={playing}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {playing ? "Reproduciendo..." : "🔊 Escuchar Insight"}
            </button>
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

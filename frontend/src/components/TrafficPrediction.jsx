import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function TrafficPrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef(null);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const { data } = await axios.get(`${apiUrl}/api/stats/predict`);
      setData(data);

      // 🔊 Reproduce automáticamente el texto
      if (data?.prediction?.reasoning) {
        await speakText(data.prediction.reasoning);
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text) => {
    try {
      stopAudio(); // por si hay algo reproduciéndose

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
      audioRef.current = audio;
      setSpeaking(true);

      audio.play();
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Error reproduciendo el audio:", error);
      setSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSpeaking(false);
    }
  };

  // Limpia el audio al desmontar
  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🔮 Traffic Prediction
        </h2>
        <div className="flex gap-2">
          <button
            onClick={fetchPrediction}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Predicting..." : "Predict Next Hour"}
          </button>

          {speaking && (
            <button
              onClick={stopAudio}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              ⛔ Detener voz
            </button>
          )}
        </div>
      </div>

      {data && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded p-4">
            <h3 className="font-bold mb-2">Prediction</h3>
            <div className="text-3xl font-bold text-purple-600">
              {data.prediction.predicted_flights} flights
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Confidence: {data.prediction.confidence}%
            </div>
            <p className="text-sm mt-3">{data.prediction.reasoning}</p>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-bold mb-2">Recent History</h3>
            <div className="space-y-1 text-sm">
              {data.historical_data.slice(0, 6).map((h, i) => (
                <div key={i} className="flex justify-between">
                  <span>{h.hour}</span>
                  <span className="font-bold">{h.flights} flights</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

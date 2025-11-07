import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function AiChat() {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: "user", content: question };
    setChat((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const { data } = await axios.post(
        `${apiUrl}/api/stats/chat?question=${encodeURIComponent(
          question
        )}`
      );
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Unable to get response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">🤖</span>
          AI Assistant
        </h2>
        <p className="text-xs text-gray-500 mt-1">Ask about flight traffic</p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">Start a conversation</p>
            <div className="mt-4 space-y-2 text-xs text-left max-w-xs mx-auto">
              <div className="bg-gray-50 p-2 rounded">
                "How many flights are active?"
              </div>
              <div className="bg-gray-50 p-2 rounded">
                "What's the average altitude?"
              </div>
              <div className="bg-gray-50 p-2 rounded">
                "Show me today's summary"
              </div>
            </div>
          </div>
        )}

        {chat.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
                }`}
            >
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
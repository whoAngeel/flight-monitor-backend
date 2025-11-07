import WebSocketStatus from "./components/WebSocketStatus";

function App() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Air Traffic Monitor Dashboard</h1>
      <WebSocketStatus />
    </div>
  );
}

export default App;

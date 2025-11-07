import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <main className="h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            Air Traffic Monitor
          </h1>
        </div>
      </header>
      <Dashboard />
    </main>
  );
}

export default App;

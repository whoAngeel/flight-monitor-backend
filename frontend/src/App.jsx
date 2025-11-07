import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { SocketProvider } from "./context/socketContext";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <main className="h-screen bg-gray-50 text-gray-800 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 flex-shrink-0">
            <div className="px-4 py-2 flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">✈️</span>
                Air Traffic Monitor
              </h1>

              <nav className="flex gap-4">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  AI Analytics
                </NavLink>
              </nav>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
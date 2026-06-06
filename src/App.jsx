import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ContentArea from "./components/ContentArea";
import "./App.css";

const isMobile = () => typeof window !== "undefined" && window.innerWidth <= 820;

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  // Start collapsed on small screens, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile());

  // Collapse the sidebar automatically if the window shrinks to mobile width
  useEffect(() => {
    const onResize = () => {
      if (isMobile()) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // When a topic is chosen, auto-close the sidebar on mobile
  const handleSelect = (id) => {
    setSelectedId(id);
    if (isMobile()) setSidebarOpen(false);
  };

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((p) => !p)}
        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Backdrop for mobile overlay mode */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar selectedId={selectedId} onSelect={handleSelect} />

      <main className="main-content">
        <ContentArea selectedId={selectedId} onSelect={handleSelect} />
      </main>
    </div>
  );
}

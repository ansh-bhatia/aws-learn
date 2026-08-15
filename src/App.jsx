import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ContentArea from "./components/ContentArea";
import ChatBot from "./components/ChatBot";
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

  // Reading-progress bar tied to the main scroll container
  const progressRef = useRef(null);
  useEffect(() => {
    const main = document.querySelector(".main-content");
    const fill = progressRef.current;
    if (!main || !fill) return;
    const meshA = document.querySelector(".scroll-bg-mesh");
    const meshB = document.querySelector(".scroll-bg-mesh-b");
    const conic = document.querySelector(".scroll-bg-conic");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ticking = false;
    // Throttle to one update per frame. Only touch compositor-friendly props
    // (transform / opacity) — NO filter or background-position (those repaint
    // the whole layer every frame and make scrolling janky). Colour change is
    // a crossfade between two palettes; motion is parallax + rotation.
    const apply = () => {
      ticking = false;
      const max = main.scrollHeight - main.clientHeight;
      const p = max > 0 ? main.scrollTop / max : 0;
      fill.style.transform = `scaleX(${p})`;
      if (!reduce) {
        if (meshA) {
          meshA.style.transform = `translate3d(0, ${(p * -6).toFixed(2)}%, 0) scale(1.08)`;
          meshA.style.opacity = (1 - p * 0.75).toFixed(3);
        }
        if (meshB) {
          meshB.style.transform = `translate3d(0, ${(p * -11).toFixed(2)}%, 0) scale(1.1)`;
          meshB.style.opacity = (p * 0.9).toFixed(3);
        }
        if (conic) {
          conic.style.transform = `rotate(${(p * 120).toFixed(1)}deg) scale(1.15)`;
          conic.style.opacity = (0.4 + p * 0.3).toFixed(2);
        }
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    };
    apply();
    main.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      main.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [selectedId]);

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <div className="scroll-bg" aria-hidden="true">
        <span className="scroll-bg-layer scroll-bg-mesh" />
        <span className="scroll-bg-layer scroll-bg-mesh-b" />
        <span className="scroll-bg-layer scroll-bg-conic" />
      </div>
      <div className="scroll-progress" aria-hidden="true">
        <span ref={progressRef} className="scroll-progress-fill" />
      </div>
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

      <ChatBot />
    </div>
  );
}

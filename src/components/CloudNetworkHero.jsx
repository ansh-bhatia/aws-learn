import React, { useRef, useEffect } from "react";

/*
 * CloudNetworkHero — a lightweight canvas animation of an AWS-style global
 * network: glowing "data-center" nodes connected by lines, with little data
 * packets pulsing along the links. Pure canvas, no dependencies. Rendered only
 * on the dashboard hero so the study pages stay fast. Honors reduced-motion.
 */
export default function CloudNetworkHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    let links = [];
    let pulses = [];
    let raf = 0;

    const NODE_COLOR = "111, 196, 255"; // cloud blue

    function build() {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(10, Math.min(26, Math.round((w * h) / 22000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: 1.5 + Math.random() * 1.8,
        glow: Math.random(),
      }));

      // connect each node to its nearest few neighbours
      links = [];
      const maxDist = Math.min(w, h) * 0.34;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < maxDist) links.push({ a: i, b: j });
        }
      }
      pulses = [];
    }

    function spawnPulse() {
      if (!links.length) return;
      const link = links[(Math.random() * links.length) | 0];
      pulses.push({ link, t: 0, speed: 0.004 + Math.random() * 0.006 });
    }

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);

      // drift nodes slowly
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.glow += 0.01;
      }

      // links
      const maxDist = Math.min(w, h) * 0.34;
      for (const l of links) {
        const a = nodes[l.a], b = nodes[l.b];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const alpha = Math.max(0, 0.22 * (1 - d / maxDist));
        if (alpha <= 0) continue;
        ctx.strokeStyle = `rgba(${NODE_COLOR}, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // pulses travelling along links
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const a = nodes[p.link.a], b = nodes[p.link.b];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
        g.addColorStop(0, `rgba(${NODE_COLOR}, 0.9)`);
        g.addColorStop(1, `rgba(${NODE_COLOR}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        const pulse = 0.5 + 0.5 * Math.sin(n.glow);
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        g.addColorStop(0, `rgba(${NODE_COLOR}, ${0.35 + 0.35 * pulse})`);
        g.addColorStop(1, `rgba(${NODE_COLOR}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${NODE_COLOR}, ${0.7 + 0.3 * pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame++;
      if (frame % 32 === 0 && pulses.length < 14) spawnPulse();
      raf = requestAnimationFrame(draw);
    }

    build();
    if (reduce) {
      draw(); // single static frame
    } else {
      raf = requestAnimationFrame(draw);
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-network" aria-hidden="true" />;
}

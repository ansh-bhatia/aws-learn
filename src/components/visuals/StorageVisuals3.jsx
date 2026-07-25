import { useState } from "react";
import "./StorageVisuals.css";
import "./StorageVisuals3.css";

/* ─── 1. WHY INSTANCE STORE IS EPHEMERAL ───────────────────────────── */
export function PhysicalHostReassignment() {
  const [phase, setPhase] = useState(0);

  const phases = [
    {
      name: "1 · Running",
      onHost: 0,
      blurb: "Your instance is running on Host A. Instance store is directly attached to THAT host, and the instance reaches it at very low latency.",
      lost: false,
    },
    {
      name: "2 · Stopped",
      onHost: null,
      blurb: "You stop the instance. It is no longer running on any host — and AWS's placement algorithm will decide fresh where to start it next.",
      lost: false,
    },
    {
      name: "3 · Started again",
      onHost: 1,
      blurb: "AWS starts it on Host B, because that host had free resources. The instance store still sits in Host A — a different physical machine entirely. The instance cannot reach it.",
      lost: true,
    },
  ];

  const p = phases[phase];

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">🔌 Why Instance Store Data Disappears</div>
      <p className="st3-intro">
        AWS runs <strong>50,000–60,000 hosts per availability zone</strong>, and an algorithm decides which one
        runs your instance <em>every time it starts</em>. Step through what that means for directly-attached
        storage.
      </p>

      <div className="st3-steps">
        {phases.map((x, i) => (
          <button key={x.name} className={`st3-step ${phase === i ? "active" : ""}`} onClick={() => setPhase(i)}>
            {x.name}
          </button>
        ))}
      </div>

      <div className="st3-hosts">
        {[0, 1].map((h) => (
          <div key={h} className={`st3-host ${p.onHost === h ? "active" : ""}`}>
            <div className="st3-host-tag">Physical Host {h === 0 ? "A" : "B"}</div>
            {p.onHost === h && <div className="st3-vm">🖥️ your EC2 instance</div>}
            {p.onHost !== h && <div className="st3-vm ghost">— no instance —</div>}
            {h === 0 && (
              <div className={`st3-store ${p.lost ? "lost" : ""}`}>
                💾 instance store
                <small>{p.lost ? "unreachable — data gone" : "attached to this host"}</small>
              </div>
            )}
            {h === 1 && <div className="st3-store empty">no instance store here</div>}
          </div>
        ))}
      </div>

      <div className={`st3-blurb ${p.lost ? "bad" : ""}`}>{p.blurb}</div>

      <div className="st3-note">
        This is the whole reason instance store is <strong>temporary</strong>: stop the instance and the data is
        deleted. <strong>EBS</strong> solves it by being <strong>external</strong> storage reachable from
        <em> any</em> host — which is why it survives stop, start, and even termination of the instance.
      </div>
    </div>
  );
}

/* ─── 2. FULL 7-TYPE VOLUME MATRIX ─────────────────────────────────── */
export function VolumeTypeFullMatrix() {
  const [row, setRow] = useState("cost");

  const cols = [
    { k: "gp2", n: "gp2", sub: "General Purpose" },
    { k: "gp3", n: "gp3", sub: "General Purpose" },
    { k: "io1", n: "io1", sub: "Provisioned IOPS" },
    { k: "io2", n: "io2", sub: "Provisioned IOPS" },
    { k: "st1", n: "st1", sub: "Throughput HDD" },
    { k: "sc1", n: "sc1", sub: "Cold HDD" },
    { k: "mag", n: "magnetic", sub: "Legacy ⚠️" },
  ];

  const rows = {
    size: { label: "Volume size", v: { gp2: "1 GiB – 16 TiB", gp3: "1 GiB – 16 TiB", io1: "4 GiB – 16 TiB", io2: "4 GiB – 16 TiB", st1: "125 GiB – 16 TiB", sc1: "125 GiB – 16 TiB", mag: "1 GiB – 1 TiB" } },
    base: { label: "Base performance", v: { gp2: "3 IOPS per GB", gp3: "3,000 IOPS flat", io1: "provisioned", io2: "provisioned", st1: "500 IOPS", sc1: "250 IOPS", mag: "~100 IOPS" } },
    max: { label: "Max IOPS", v: { gp2: "16,000", gp3: "16,000", io1: "64,000", io2: "64,000 · 256,000 Block Express", st1: "500", sc1: "250", mag: "variable" } },
    thr: { label: "Max throughput", v: { gp2: "250 MiB/s", gp3: "1,000 MiB/s", io1: "1,000 MiB/s", io2: "4,000 MiB/s Block Express", st1: "500 MiB/s", sc1: "250 MiB/s", mag: "40–90 MiB/s" } },
    cost: { label: "Cost per TB / month", v: { gp2: "$102", gp3: "$81", io1: "$128", io2: "$128", st1: "$46", sc1: "$15", mag: "$51 ⚠️" } },
    dura: { label: "Durability", v: { gp2: "99.9%", gp3: "99.9%", io1: "99.9%", io2: "99.999%", st1: "99.9%", sc1: "99.9%", mag: "99.9%" } },
    burst: { label: "Burst capacity", v: { gp2: "yes", gp3: "no", io1: "no", io2: "no", st1: "no", sc1: "no", mag: "yes" } },
    multi: { label: "Multi-attach", v: { gp2: "no", gp3: "no", io1: "yes", io2: "yes", st1: "no", sc1: "no", mag: "no" } },
    conf: { label: "Configurable IOPS", v: { gp2: "no", gp3: "yes", io1: "yes", io2: "yes", st1: "no", sc1: "no", mag: "no" } },
    boot: { label: "Boot volume", v: { gp2: "yes", gp3: "yes", io1: "yes", io2: "yes", st1: "no", sc1: "no", mag: "yes" } },
  };

  const notes = {
    cost: "gp3 is CHEAPER than gp2 and performs better — always choose gp3 over gp2. sc1 at $15/TB is a fraction of SSD. Magnetic costs MORE than both HDD types while performing worst: AWS is pricing it out deliberately.",
    base: "This is the gp2 trap. gp2 gives 3 IOPS per GB, so 900 IOPS means a 300 GB volume even if you only store 50 GB. gp3 gives 3,000 IOPS flat regardless of size.",
    dura: "io2 offers five nines — 99.999% — at the SAME price as io1. There is no reason to choose io1 over io2.",
    multi: "Multi-attach works only on io1/io2 AND only with Nitro-based instances. Every other type is single-attach, because block storage is fundamentally not shared.",
    boot: "Oddly, magnetic IS supported as a boot volume — though booting an OS from a sequential device would be painfully slow.",
    max: "Need more than 16,000 IOPS? gp2 and gp3 cannot do it. You must move to io1/io2.",
  };

  return (
    <div className="sv-card st3-card">
      <div className="sv-title st3-title">📊 All 7 EBS Volume Types Compared</div>
      <p className="st3-intro">
        Choosing the wrong type means <strong>paying more for less performance</strong>. Pick a row to compare
        all seven.
      </p>

      <div className="st3-rowpicker">
        {Object.keys(rows).map((k) => (
          <button key={k} className={`st3-rowbtn ${row === k ? "active" : ""}`} onClick={() => setRow(k)}>
            {rows[k].label}
          </button>
        ))}
      </div>

      <div className="st3-matrix">
        {cols.map((c) => {
          const v = rows[row].v[c.k];
          const cls = v === "yes" ? "yes" : v === "no" ? "no" : "txt";
          return (
            <div key={c.k} className={`st3-cell ${cls} ${c.k === "mag" ? "legacy" : ""}`}>
              <div className="st3-cell-name">{c.n}</div>
              <div className="st3-cell-sub">{c.sub}</div>
              <div className="st3-cell-val">{v === "yes" ? "✅" : v === "no" ? "❌" : v}</div>
            </div>
          );
        })}
      </div>

      {notes[row] && <div className="st3-note">{notes[row]}</div>}
    </div>
  );
}

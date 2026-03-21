import { useEffect, useRef } from "react";

export default function MedNexusBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Data structures ---
    const W = () => canvas.width;
    const H = () => canvas.height;

    // DNA Helix strands
    const DNA_PAIRS = 18;
    // Floating particles (neon dust)
    const PARTICLES = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      hue: Math.random() < 0.5 ? 160 : Math.random() < 0.5 ? 190 : 320,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // City skyline buildings (Blade Runner)
    const BUILDINGS = Array.from({ length: 22 }, (_, i) => ({
      x: i / 22,
      w: 0.028 + Math.random() * 0.022,
      h: 0.08 + Math.random() * 0.22,
      windows: Array.from({ length: Math.floor(Math.random() * 12 + 4) }, () => ({
        row: Math.random(),
        col: Math.random(),
        on: Math.random() > 0.35,
        flicker: Math.random() > 0.85,
      })),
    }));

    // ECG wave points
    const ECG_POINTS = 320;
    let ecgOffset = 0;

    function ecgY(x, offset) {
      const phase = (x + offset) % 1;
      // Realistic ECG shape
      if (phase < 0.08) return Math.sin(phase * Math.PI / 0.08) * 0.018; // P wave
      if (phase < 0.18) return 0;
      if (phase < 0.21) return -Math.sin((phase - 0.18) * Math.PI / 0.03) * 0.012; // Q dip
      if (phase < 0.245) return Math.sin((phase - 0.21) * Math.PI / 0.035) * 0.11; // R spike
      if (phase < 0.28) return -Math.sin((phase - 0.245) * Math.PI / 0.035) * 0.03; // S dip
      if (phase < 0.38) return 0;
      if (phase < 0.52) return Math.sin((phase - 0.38) * Math.PI / 0.14) * 0.025; // T wave
      return 0;
    }

    // Hex grid (cyber overlay)
    const HEX_COLS = 14;
    const HEX_ROWS = 9;

    // Scan lines
    let scanY = 0;

    // Neural network nodes
    const NODES = Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      pulse: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.012,
      r: 2 + Math.random() * 3,
      active: Math.random() > 0.4,
    }));
    const EDGES = [];
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const dx = NODES[i].x - NODES[j].x;
        const dy = NODES[i].y - NODES[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.18) {
          EDGES.push([i, j, Math.random()]);
        }
      }
    }

    // Data streams (vertical falling chars)
    const STREAMS = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.0008 + Math.random() * 0.0015,
      chars: Array.from({ length: 12 }, () =>
        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      ),
      alpha: 0.08 + Math.random() * 0.13,
    }));

    // Molecule orbits (medical atoms)
    const MOLECULES = Array.from({ length: 5 }, () => ({
      cx: 0.1 + Math.random() * 0.8,
      cy: 0.15 + Math.random() * 0.7,
      r: 0.04 + Math.random() * 0.05,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.003 + Math.random() * 0.004),
      electrons: Math.floor(2 + Math.random() * 3),
      phase: Math.random() * Math.PI * 2,
      hue: [160, 190, 200, 320, 280][Math.floor(Math.random() * 5)],
    }));

    function draw() {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // -- 1. DEEP BACKGROUND --
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.8);
      bg.addColorStop(0, "rgba(4,18,28,1)");
      bg.addColorStop(0.5, "rgba(2,10,18,1)");
      bg.addColorStop(1, "rgba(1,5,10,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // -- 2. HEX GRID --
      const hSize = w / HEX_COLS / Math.sqrt(3);
      for (let row = 0; row < HEX_ROWS + 2; row++) {
        for (let col = 0; col < HEX_COLS + 1; col++) {
          const hx = col * hSize * Math.sqrt(3) + (row % 2) * hSize * Math.sqrt(3) * 0.5;
          const hy = row * hSize * 1.5;
          const pulse = Math.sin(t * 0.6 + row * 0.4 + col * 0.3) * 0.5 + 0.5;
          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const angle = (Math.PI / 3) * s - Math.PI / 6;
            const px = hx + hSize * 0.92 * Math.cos(angle);
            const py = hy + hSize * 0.92 * Math.sin(angle);
            s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(0,200,140,${0.025 + pulse * 0.025})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // -- 3. CITY SKYLINE --
      const skyH = h * 0.28;
      BUILDINGS.forEach((b) => {
        const bx = b.x * w;
        const bw = b.w * w;
        const bh = b.h * skyH;
        const by = h - bh;

        // Building body
        const bGrad = ctx.createLinearGradient(bx, by, bx, h);
        bGrad.addColorStop(0, "rgba(0,30,50,0.85)");
        bGrad.addColorStop(1, "rgba(0,10,20,0.95)");
        ctx.fillStyle = bGrad;
        ctx.fillRect(bx, by, bw, bh);

        // Neon edge glow (cyan/pink)
        ctx.strokeStyle = Math.random() > 0.97
          ? "rgba(255,50,120,0.6)"
          : "rgba(0,220,180,0.25)";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(bx, by, bw, bh);

        // Windows
        b.windows.forEach((win) => {
          if (!win.on) return;
          const flickering = win.flicker && Math.sin(t * 8 + win.col * 10) > 0.7;
          const wx = bx + win.col * bw * 0.8 + bw * 0.1;
          const wy = by + win.row * bh * 0.85 + bh * 0.05;
          ctx.fillStyle = flickering
            ? "rgba(255,180,80,0.15)"
            : "rgba(0,200,255,0.18)";
          ctx.fillRect(wx, wy, bw * 0.08, bh * 0.04);
        });

        // Rooftop antenna blink
        ctx.fillStyle = `rgba(255,50,50,${Math.sin(t * 3 + b.x * 10) > 0.8 ? 0.9 : 0.1})`;
        ctx.beginPath();
        ctx.arc(bx + bw / 2, by - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground reflection
      const refGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
      refGrad.addColorStop(0, "rgba(0,180,120,0.0)");
      refGrad.addColorStop(0.4, "rgba(0,180,120,0.06)");
      refGrad.addColorStop(1, "rgba(0,80,60,0.0)");
      ctx.fillStyle = refGrad;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);

      // -- 4. DNA HELIX (left side) --
      const dnaX = w * 0.08;
      const dnaH = h * 0.82;
      const dnaTop = h * 0.07;
      const dnaAmp = w * 0.026;

      const dnaBeam = ctx.createLinearGradient(0, 0, w * 0.28, 0);
      dnaBeam.addColorStop(0, "rgba(0,255,175,0.2)");
      dnaBeam.addColorStop(0.45, "rgba(0,255,175,0.1)");
      dnaBeam.addColorStop(1, "rgba(0,255,175,0)");
      ctx.fillStyle = dnaBeam;
      ctx.fillRect(0, dnaTop - 40, w * 0.3, dnaH + 80);

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(0,255,185,0.9)";

      for (let i = 0; i < DNA_PAIRS * 3; i++) {
        const frac = i / (DNA_PAIRS * 3);
        const y = dnaTop + frac * dnaH;
        const phase = frac * Math.PI * 4 + t * 0.8;
        const x1 = dnaX + Math.sin(phase) * dnaAmp;
        const x2 = dnaX + Math.sin(phase + Math.PI) * dnaAmp;
        const alpha = 0.72 + Math.sin(phase) * 0.2;

        // Strand 1
        if (i > 0) {
          const prevFrac = (i - 1) / (DNA_PAIRS * 3);
          const prevY = dnaTop + prevFrac * dnaH;
          const prevPhase = prevFrac * Math.PI * 4 + t * 0.8;
          ctx.beginPath();
          ctx.moveTo(dnaX + Math.sin(prevPhase) * dnaAmp, prevY);
          ctx.lineTo(x1, y);
          ctx.strokeStyle = `rgba(0,255,170,${alpha * 0.52})`;
          ctx.lineWidth = 3.3;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(dnaX + Math.sin(prevPhase) * dnaAmp, prevY);
          ctx.lineTo(x1, y);
          ctx.strokeStyle = `rgba(0,255,170,${alpha})`;
          ctx.lineWidth = 1.7;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(dnaX + Math.sin(prevPhase + Math.PI) * dnaAmp, prevY);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(0,190,255,${alpha * 0.52})`;
          ctx.lineWidth = 3.3;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(dnaX + Math.sin(prevPhase + Math.PI) * dnaAmp, prevY);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(0,190,255,${alpha})`;
          ctx.lineWidth = 1.7;
          ctx.stroke();
        }

        // Rungs (every 3rd)
        if (i % 3 === 0) {
          const rAlpha = Math.abs(Math.sin(phase)) * 0.62 + 0.4;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(195,95,255,${rAlpha})`;
          ctx.lineWidth = 1.25;
          ctx.stroke();

          // Node dots
          ctx.beginPath();
          ctx.arc(x1, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,170,${Math.min(0.98, rAlpha + 0.28)})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x1, y, 4.8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,255,170,0.2)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,190,255,${Math.min(0.98, rAlpha + 0.28)})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y, 4.8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,190,255,0.2)";
          ctx.fill();
        }
      }

      ctx.restore();

      // DNA label
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(0,255,170,0.52)";
      ctx.fillText("DNA//SEQUENCE", dnaX - 22, dnaTop - 10);

      // -- 5. ECG WAVE (horizontal, center) --
      ecgOffset += 0.004;
      const ecgY_center = h * 0.5;
      const ecgX_start = w * 0.18;
      const ecgX_end = w * 0.82;
      const ecgWidth = ecgX_end - ecgX_start;
      const ecgAmplitude = h * 0.09;

      ctx.beginPath();
      for (let i = 0; i <= ECG_POINTS; i++) {
        const xFrac = i / ECG_POINTS;
        const px = ecgX_start + xFrac * ecgWidth;
        const py = ecgY_center - ecgY(xFrac, ecgOffset) * ecgAmplitude * 10;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      const ecgGrad = ctx.createLinearGradient(ecgX_start, 0, ecgX_end, 0);
      ecgGrad.addColorStop(0, "rgba(0,255,120,0)");
      ecgGrad.addColorStop(0.3, "rgba(0,255,120,0.15)");
      ecgGrad.addColorStop(0.7, "rgba(0,255,180,0.35)");
      ecgGrad.addColorStop(0.9, "rgba(0,255,120,0.5)");
      ecgGrad.addColorStop(1, "rgba(0,255,120,0.05)");
      ctx.strokeStyle = ecgGrad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // ECG glow
      ctx.beginPath();
      for (let i = 0; i <= ECG_POINTS; i++) {
        const xFrac = i / ECG_POINTS;
        const px = ecgX_start + xFrac * ecgWidth;
        const py = ecgY_center - ecgY(xFrac, ecgOffset) * ecgAmplitude * 10;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = "rgba(0,255,120,0.07)";
      ctx.lineWidth = 8;
      ctx.stroke();

      // ECG label
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(0,255,120,0.4)";
      ctx.fillText("CARDIAC//MONITOR", ecgX_start, ecgY_center - ecgAmplitude - 14);
      ctx.fillStyle = "rgba(0,255,120,0.7)";
      ctx.font = "bold 11px monospace";
      ctx.fillText("♥ 72 BPM", ecgX_end - 70, ecgY_center - ecgAmplitude - 13);

      // -- 6. MOLECULE ORBITS --
      MOLECULES.forEach((mol) => {
        const mx = mol.cx * w;
        const my = mol.cy * h;
        const mr = mol.r * Math.min(w, h);
        mol.phase += mol.speed;

        // Nucleus
        ctx.beginPath();
        ctx.arc(mx, my, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${mol.hue},100%,70%,0.5)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 7, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${mol.hue},100%,70%,0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Orbit ring
        ctx.beginPath();
        ctx.ellipse(mx, my, mr, mr * 0.38, mol.phase * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${mol.hue},80%,65%,0.12)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Electrons
        for (let e = 0; e < mol.electrons; e++) {
          const eAngle = mol.phase + (e / mol.electrons) * Math.PI * 2;
          const ex = mx + Math.cos(eAngle) * mr;
          const ey = my + Math.sin(eAngle) * mr * 0.38;
          ctx.beginPath();
          ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${mol.hue},100%,80%,0.7)`;
          ctx.fill();
        }
      });

      // -- 7. NEURAL NETWORK --
      EDGES.forEach(([i, j, phase]) => {
        const a = NODES[i], b = NODES[j];
        const signal = Math.sin(t * 1.5 + phase * Math.PI * 2) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.strokeStyle = `rgba(0,160,255,${0.04 + signal * 0.08})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();

        // Traveling pulse on edge
        if (signal > 0.75) {
          const px = a.x * w + (b.x - a.x) * w * ((t * 0.5 + phase) % 1);
          const py = a.y * h + (b.y - a.y) * h * ((t * 0.5 + phase) % 1);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,200,255,0.6)";
          ctx.fill();
        }
      });

      NODES.forEach((node) => {
        node.pulse += node.speed;
        const glow = Math.sin(node.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(node.x * w, node.y * h, node.r + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = node.active
          ? `rgba(0,200,255,${0.3 + glow * 0.4})`
          : `rgba(0,100,160,${0.15 + glow * 0.1})`;
        ctx.fill();
      });

      // -- 8. DATA STREAMS (Matrix-style, medical chars) --
      STREAMS.forEach((s) => {
        s.y += s.speed;
        if (s.y > 1) { s.y = 0; s.x = Math.random(); }
        s.chars.forEach((ch, idx) => {
          const alpha = s.alpha * (1 - idx / s.chars.length);
          ctx.font = `${9 + Math.random()}px monospace`;
          ctx.fillStyle = `rgba(0,255,120,${alpha})`;
          ctx.fillText(ch, s.x * w, (s.y + idx * 0.018) * h);
        });
      });

      // -- 9. PARTICLES --
      PARTICLES.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.alpha * (0.6 + Math.sin(t + p.x * 10) * 0.4)})`;
        ctx.fill();
      });

      // -- 10. SCAN LINE --
      scanY += 0.0015;
      if (scanY > 1) scanY = 0;
      const scanGrad = ctx.createLinearGradient(0, scanY * h - 40, 0, scanY * h + 40);
      scanGrad.addColorStop(0, "rgba(0,255,140,0)");
      scanGrad.addColorStop(0.5, "rgba(0,255,140,0.04)");
      scanGrad.addColorStop(1, "rgba(0,255,140,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY * h - 40, w, 80);

      // -- 11. VIGNETTE --
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,5,0.7)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // -- 12. HUD CORNER ELEMENTS --
      const corners = [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]];
      corners.forEach(([cx, cy], idx) => {
        const signs = [[1,1],[-1,1],[1,-1],[-1,-1]][idx];
        const len = 24;
        ctx.strokeStyle = `rgba(0,255,140,${0.3 + Math.sin(t * 0.8 + idx) * 0.15})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy + signs[1] * len);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + signs[0] * len, cy);
        ctx.stroke();
      });

      // Status text
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(0,255,140,0.35)";
      ctx.fillText(`SYS//ONLINE  t=${t.toFixed(1)}`, 34, h - 28);
      ctx.fillStyle = "rgba(0,180,255,0.3)";
      ctx.fillText("NEURAL//ACTIVE", w - 120, h - 28);

      t += 0.012;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

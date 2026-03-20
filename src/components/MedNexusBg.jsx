import { useEffect, useRef } from "react";

export default function MedNexusBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const getW = () => canvas.width;
    const getH = () => canvas.height;

    const buildingCount = 22;
    const buildings = Array.from({ length: buildingCount }, () => ({
      width: 0.02 + Math.random() * 0.04,
      height: 0.3 + Math.random() * 0.7,
      antennaPhase: Math.random() * Math.PI * 2,
      windows: Array.from({ length: 14 + Math.floor(Math.random() * 12) }, () => ({
        u: Math.random(),
        v: Math.random(),
        on: Math.random() > 0.35,
        flicker: Math.random() > 0.8,
      })),
    }));

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      hue: [160, 190, 320][Math.floor(Math.random() * 3)],
      phase: Math.random() * Math.PI * 2,
    }));

    const streams = Array.from({ length: 16 }, () => ({
      x: Math.random() < 0.78 ? Math.random() * 0.42 : 0.42 + Math.random() * 0.58,
      y: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      alpha: 0.07 + Math.random() * 0.05,
      length: 8 + Math.floor(Math.random() * 11),
      chars: Array.from({ length: 20 }, () =>
        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      ),
    }));

    const molecules = Array.from({ length: 5 }, () => ({
      cx: 0.06 + Math.random() * 0.36,
      cy: 0.12 + Math.random() * 0.72,
      rx: 0.02 + Math.random() * 0.04,
      ry: 0.015 + Math.random() * 0.03,
      orbitRotation: Math.random() * Math.PI,
      speed: (Math.random() > 0.5 ? 1 : -1) * (0.004 + Math.random() * 0.006),
      electrons: 2 + Math.floor(Math.random() * 2),
      hue: [170, 190, 320, 275][Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2,
    }));

    const nodes = Array.from({ length: 24 }, () => ({
      x: Math.random(),
      y: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2,
      size: 1.8 + Math.random() * 2.5,
      speed: 0.01 + Math.random() * 0.02,
    }));

    const edges = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.2) {
          edges.push({ i, j, phase: Math.random() * Math.PI * 2, speed: 0.2 + Math.random() * 0.6 });
        }
      }
    }

    let scanLineY = 0;
    let ecgScroll = 0;

    const ecgShape = (phase) => {
      if (phase < 0.08) return Math.sin((phase / 0.08) * Math.PI) * 0.1;
      if (phase < 0.17) return 0;
      if (phase < 0.2) return -Math.sin(((phase - 0.17) / 0.03) * Math.PI) * 0.12;
      if (phase < 0.24) return Math.sin(((phase - 0.2) / 0.04) * Math.PI) * 1.1;
      if (phase < 0.28) return -Math.sin(((phase - 0.24) / 0.04) * Math.PI) * 0.3;
      if (phase < 0.4) return 0;
      if (phase < 0.56) return Math.sin(((phase - 0.4) / 0.16) * Math.PI) * 0.24;
      return 0;
    };

    const draw = () => {
      const w = getW();
      const h = getH();
      ctx.clearRect(0, 0, w, h);

      // 1. Deep dark background
      const bg = ctx.createRadialGradient(w * 0.2, h * 0.48, 0, w * 0.2, h * 0.52, Math.max(w, h) * 0.95);
      bg.addColorStop(0, "rgba(3,14,22,1)");
      bg.addColorStop(1, "rgba(0,3,8,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const leftBoost = ctx.createLinearGradient(0, 0, w * 0.5, 0);
      leftBoost.addColorStop(0, "rgba(0, 36, 44, 0.28)");
      leftBoost.addColorStop(0.7, "rgba(0, 20, 28, 0.08)");
      leftBoost.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = leftBoost;
      ctx.fillRect(0, 0, w, h);

      // 2. Hex grid overlay
      const hexRadius = Math.max(18, Math.min(38, w * 0.022));
      const hexH = Math.sqrt(3) * hexRadius;
      const hexVStep = hexH;
      const hexHStep = hexRadius * 1.5;
      const rows = Math.ceil(h / hexVStep) + 2;
      const cols = Math.ceil(w / hexHStep) + 2;

      for (let row = -1; row < rows; row += 1) {
        for (let col = -1; col < cols; col += 1) {
          const cx = col * hexHStep;
          const cy = row * hexVStep + (col % 2 === 0 ? 0 : hexVStep / 2);
          const pulse = (Math.sin(t + row + col) + 1) / 2;
          const alpha = 0.02 + pulse * 0.03;
          ctx.beginPath();
          for (let i = 0; i < 6; i += 1) {
            const angle = (Math.PI / 3) * i + Math.PI / 6;
            const px = cx + Math.cos(angle) * hexRadius;
            const py = cy + Math.sin(angle) * hexRadius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.strokeStyle = `rgba(0,200,140,${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      // 3. Cyberpunk city skyline
      const skylineTop = h * 0.75;
      const skylineHeight = h * 0.25;
      let bx = 0;

      buildings.forEach((b, idx) => {
        const bw = Math.max(22, b.width * w);
        const bh = skylineHeight * b.height;
        const by = h - bh;
        const buildingFill = ctx.createLinearGradient(0, by, 0, h);
        buildingFill.addColorStop(0, "rgba(5,16,24,0.95)");
        buildingFill.addColorStop(1, "rgba(2,8,14,0.98)");

        ctx.fillStyle = buildingFill;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = "rgba(0,190,255,0.22)";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);

        b.windows.forEach((win) => {
          if (!win.on) return;
          const flicker = win.flicker && Math.sin(t * 10 + win.u * 12 + idx) > 0.5;
          if (flicker && Math.sin(t * 13 + win.v * 10) < 0) return;
          const ww = Math.max(2, bw * 0.07);
          const wh = Math.max(2, bh * 0.04);
          const wx = bx + bw * 0.08 + win.u * bw * 0.84;
          const wy = by + bh * 0.07 + win.v * bh * 0.85;
          ctx.fillStyle = "rgba(0,190,255,0.17)";
          ctx.fillRect(wx, wy, ww, wh);
        });

        const antennaAlpha = Math.sin(t * 3 + b.antennaPhase) > 0.35 ? 0.95 : 0.2;
        ctx.fillStyle = `rgba(255,60,60,${antennaAlpha})`;
        ctx.beginPath();
        ctx.arc(bx + bw * 0.52, by - 3, 1.8, 0, Math.PI * 2);
        ctx.fill();

        bx += bw * 0.92;
        if (bx > w) bx = w + 10;
      });

      const reflection = ctx.createLinearGradient(0, skylineTop, 0, h);
      reflection.addColorStop(0, "rgba(0,180,160,0)");
      reflection.addColorStop(0.45, "rgba(0,180,160,0.11)");
      reflection.addColorStop(1, "rgba(0,120,90,0)");
      ctx.fillStyle = reflection;
      ctx.fillRect(0, skylineTop, w, h - skylineTop);

      // 4. DNA double helix
      const helixX = w * 0.1;
      const helixTop = h * 0.15;
      const helixHeight = h * 0.68;
      const helixAmp = w * 0.028;
      const helixPoints = 72;
      const upward = (t * 35) % helixHeight;

      for (let i = 0; i < helixPoints; i += 1) {
        const k = i / (helixPoints - 1);
        const y = helixTop + ((k * helixHeight - upward + helixHeight) % helixHeight);
        const phase = k * Math.PI * 6 + t * 1.05;
        const x1 = helixX + Math.sin(phase) * helixAmp;
        const x2 = helixX + Math.sin(phase + Math.PI) * helixAmp;

        if (i > 0) {
          const prevK = (i - 1) / (helixPoints - 1);
          const prevY = helixTop + ((prevK * helixHeight - upward + helixHeight) % helixHeight);
          const prevPhase = prevK * Math.PI * 6 + t * 1.05;
          const prevX1 = helixX + Math.sin(prevPhase) * helixAmp;
          const prevX2 = helixX + Math.sin(prevPhase + Math.PI) * helixAmp;

          ctx.beginPath();
          ctx.moveTo(prevX1, prevY);
          ctx.lineTo(x1, y);
          ctx.strokeStyle = "rgba(0,255,155,0.62)";
          ctx.lineWidth = 1.6;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(prevX2, prevY);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = "rgba(0,175,255,0.62)";
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = "rgba(175,70,255,0.62)";
          ctx.lineWidth = 1.1;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x1, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,255,155,0.85)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,175,255,0.85)";
          ctx.fill();
        }
      }

      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(0,255,155,0.4)";
      ctx.fillText("DNA//SEQUENCE", helixX - 28, helixTop - 12);

      // 5. ECG heartbeat wave
      ecgScroll += 0.005;
      const ecgStartX = w * 0.07;
      const ecgEndX = w * 0.45;
      const ecgWidth = ecgEndX - ecgStartX;
      const ecgCenterY = h * 0.5;
      const ecgAmp = h * 0.075;
      const ecgPoints = 480;

      ctx.beginPath();
      for (let i = 0; i <= ecgPoints; i += 1) {
        const u = i / ecgPoints;
        const x = ecgStartX + u * ecgWidth;
        const y = ecgCenterY - ecgShape((u + ecgScroll) % 1) * ecgAmp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(0,255,120,0.13)";
      ctx.lineWidth = 9;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= ecgPoints; i += 1) {
        const u = i / ecgPoints;
        const x = ecgStartX + u * ecgWidth;
        const y = ecgCenterY - ecgShape((u + ecgScroll) % 1) * ecgAmp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      const ecgGrad = ctx.createLinearGradient(ecgStartX, 0, ecgEndX, 0);
      ecgGrad.addColorStop(0, "rgba(0,255,120,0)");
      ecgGrad.addColorStop(0.2, "rgba(0,255,120,0.24)");
      ecgGrad.addColorStop(0.6, "rgba(0,255,120,0.62)");
      ecgGrad.addColorStop(1, "rgba(0,255,120,0.95)");
      ctx.strokeStyle = ecgGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(0,255,120,0.5)";
      ctx.fillText("CARDIAC//MONITOR", ecgStartX, ecgCenterY - ecgAmp - 20);
      ctx.fillStyle = "rgba(0,255,120,0.76)";
      ctx.fillText("♥ 72 BPM", ecgEndX - 74, ecgCenterY - ecgAmp - 20);

      // 6. Molecule orbits
      molecules.forEach((mol) => {
        const mx = mol.cx * w;
        const my = mol.cy * h;
        const rx = mol.rx * Math.min(w, h);
        const ry = mol.ry * Math.min(w, h);
        mol.phase += mol.speed;

        ctx.beginPath();
        ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${mol.hue}, 100%, 72%, 0.72)`;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(mx, my, rx, ry, mol.orbitRotation, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${mol.hue}, 100%, 72%, 0.25)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        for (let e = 0; e < mol.electrons; e += 1) {
          const angle = mol.phase + (e / mol.electrons) * Math.PI * 2;
          const ex = mx + Math.cos(angle) * rx * Math.cos(mol.orbitRotation) - Math.sin(angle) * ry * Math.sin(mol.orbitRotation);
          const ey = my + Math.cos(angle) * rx * Math.sin(mol.orbitRotation) + Math.sin(angle) * ry * Math.cos(mol.orbitRotation);
          ctx.beginPath();
          ctx.arc(ex, ey, 1.9, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${mol.hue}, 100%, 78%, 0.85)`;
          ctx.fill();
        }
      });

      // 7. Neural network
      edges.forEach((edge) => {
        const a = nodes[edge.i];
        const b = nodes[edge.j];
        const pulse = (Math.sin(t * 1.8 + edge.phase) + 1) / 2;
        const travel = (t * edge.speed + edge.phase) % 1;

        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.strokeStyle = `rgba(0,195,255,${0.05 + pulse * 0.12})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        if (pulse > 0.56) {
          const px = (a.x + (b.x - a.x) * travel) * w;
          const py = (a.y + (b.y - a.y) * travel) * h;
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,195,255,0.82)";
          ctx.fill();
        }
      });

      nodes.forEach((node) => {
        node.pulsePhase += node.speed;
        const glow = (Math.sin(node.pulsePhase) + 1) / 2;

        ctx.beginPath();
        ctx.arc(node.x * w, node.y * h, node.size + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,195,255,${0.2 + glow * 0.55})`;
        ctx.fill();
      });

      // 8. Data streams
      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y > 1.05) {
          s.y = -0.1;
          s.x = Math.random() < 0.78 ? Math.random() * 0.42 : 0.42 + Math.random() * 0.58;
        }

        for (let idx = 0; idx < s.length; idx += 1) {
          const ch = s.chars[(idx + Math.floor(t * 100)) % s.chars.length];
          const alpha = s.alpha * (1 - idx / s.chars.length);
          ctx.font = "11px monospace";
          ctx.fillStyle = `rgba(0,255,120,${alpha})`;
          ctx.fillText(ch, s.x * w, (s.y + idx * 0.018) * h);
        }
      });

      // 9. Floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = 1;
        else if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        else if (p.y > 1) p.y = 0;

        const opacity = 0.2 + ((Math.sin(t + p.phase) + 1) / 2) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 72%, ${opacity})`;
        ctx.fill();
      });

      // 10. Scan line
      scanLineY += 0.0018;
      if (scanLineY > 1.1) scanLineY = -0.1;
      const scanY = scanLineY * h;
      const scanGrad = ctx.createLinearGradient(0, scanY - 45, 0, scanY + 45);
      scanGrad.addColorStop(0, "rgba(0,255,140,0)");
      scanGrad.addColorStop(0.5, "rgba(0,255,140,0.04)");
      scanGrad.addColorStop(1, "rgba(0,255,140,0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 45, w, 90);

      // 11. Vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.12, w / 2, h / 2, Math.max(w, h) * 0.8);
      vig.addColorStop(0, "rgba(0,0,6,0)");
      vig.addColorStop(1, "rgba(0,0,6,0.68)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // 12. HUD corner brackets
      const pulse = 0.35 + (Math.sin(t * 1.1) + 1) * 0.14;
      const drawBracket = (x, y, sx, sy) => {
        const len = 28;
        ctx.strokeStyle = `rgba(0,255,140,${pulse})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x + sx * len, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + sy * len);
        ctx.stroke();
      };

      drawBracket(18, 18, 1, 1);
      drawBracket(w - 18, 18, -1, 1);
      drawBracket(18, h - 18, 1, -1);
      drawBracket(w - 18, h - 18, -1, -1);

      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(0,255,140,0.45)";
      ctx.fillText("SYS//ONLINE", 28, h - 24);
      ctx.fillStyle = "rgba(0,255,140,0.45)";
      ctx.fillText("NEURAL//ACTIVE", w - 108, h - 24);

      t += 0.012;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
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

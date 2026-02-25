import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: number;
  life: number;
  maxLife: number;
}

const ParticleField = ({ variant = "ambient" }: { variant?: "ambient" | "battle" | "victory" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1, y: -1 });
  const frameRef = useRef(0);

  const createParticle = useCallback((w: number, h: number): Particle => {
    const hues = variant === "battle" ? [195, 25, 0] : variant === "victory" ? [45, 150, 195] : [195, 220, 250];
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      hue: hues[Math.floor(Math.random() * hues.length)],
      life: 0,
      maxLife: Math.random() * 400 + 200,
    };
  }, [variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = variant === "battle" ? 80 : 50;
    particlesRef.current = Array.from({ length: count }, () => createParticle(canvas.width, canvas.height));

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    const animate = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        p.life++;
        if (p.life > p.maxLife) {
          particlesRef.current[i] = createParticle(canvas.width, canvas.height);
          return;
        }

        // Mouse repulsion
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        if (mx > 0) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120 * 0.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const fadeIn = Math.min(p.life / 30, 1);
        const fadeOut = Math.max(1 - (p.life - p.maxLife + 60) / 60, 0);
        const a = p.alpha * fadeIn * fadeOut;

        // Glow
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${a * 0.4})`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${a})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connection lines
      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const a = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(195, 80%, 60%, ${a})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [variant, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ParticleField;

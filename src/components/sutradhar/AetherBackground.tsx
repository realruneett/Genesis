import { useEffect, useRef } from "react";

export default function AetherBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    // Particle system
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life: number;
      maxLife: number;
    }> = [];

    // Create particles
    const createParticle = (x: number, y: number, vx: number, vy: number) => {
      particles.push({
        x,
        y,
        vx,
        vy,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        life: 0,
        maxLife: Math.random() * 200 + 100,
      });
    };

    // Initialize ambient particles
    for (let i = 0; i < 80; i++) {
      createParticle(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );
    }

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Spawn trail particles
      const dx = mouseRef.current.x - mouseRef.current.prevX;
      const dy = mouseRef.current.y - mouseRef.current.prevY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 2) {
        for (let i = 0; i < Math.min(speed * 0.3, 5); i++) {
          createParticle(
            mouseRef.current.x + (Math.random() - 0.5) * 10,
            mouseRef.current.y + (Math.random() - 0.5) * 10,
            dx * 0.1 + (Math.random() - 0.5) * 0.5,
            dy * 0.1 + (Math.random() - 0.5) * 0.5
          );
        }
      }
    };

    const draw = () => {
      time += 0.005;

      // Clear with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);

      // Draw gradient orbs
      const orb1X = width * 0.3 + Math.sin(time * 0.5) * 100;
      const orb1Y = height * 0.4 + Math.cos(time * 0.3) * 80;
      const orb1Grad = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 300);
      orb1Grad.addColorStop(0, "rgba(0, 240, 255, 0.03)");
      orb1Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = orb1Grad;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.7 + Math.cos(time * 0.4) * 120;
      const orb2Y = height * 0.6 + Math.sin(time * 0.6) * 60;
      const orb2Grad = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 250);
      orb2Grad.addColorStop(0, "rgba(0, 240, 255, 0.02)");
      orb2Grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = orb2Grad;
      ctx.fillRect(0, 0, width, height);

      // Draw central sphere
      const sphereX = width * 0.5;
      const sphereY = height * 0.5;
      const sphereRadius = 80 + Math.sin(time * 0.8) * 10;
      const sphereGrad = ctx.createRadialGradient(
        sphereX, sphereY, 0,
        sphereX, sphereY, sphereRadius
      );
      sphereGrad.addColorStop(0, "rgba(0, 240, 255, 0.08)");
      sphereGrad.addColorStop(0.5, "rgba(0, 240, 255, 0.02)");
      sphereGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = sphereGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Apply friction
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Mouse influence
        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 150 && mDist > 0) {
          p.vx += (mdx / mDist) * 0.02;
          p.vy += (mdy / mDist) * 0.02;
        }

        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * (1 - lifeRatio);

        if (p.life >= p.maxLife || alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        ctx.fill();
      }

      // Draw connecting lines between nearby particles
      ctx.strokeStyle = "rgba(0, 240, 255, 0.03)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Maintain minimum particle count
      while (particles.length < 60) {
        createParticle(
          Math.random() * width,
          Math.random() * height,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        );
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
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

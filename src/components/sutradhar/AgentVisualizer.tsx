import { useEffect, useRef, useState } from "react";
import { Cpu, Zap, Activity, Globe } from "lucide-react";

type AgentNode = {
  id: string;
  x: number;
  y: number;
  label: string;
  subtitle: string;
  status: "active" | "idle" | "busy" | "error";
  vram: number;
  icon: "cloud" | "agent" | "vision" | "fallback";
};

const AGENTS: AgentNode[] = [
  { id: "cloud", x: 0.5, y: 0.12, label: "Groq Cloud", subtitle: "llama-3.3-70b", status: "active", vram: 0, icon: "cloud" },
  { id: "vision", x: 0.2, y: 0.12, label: "Vision", subtitle: "llama-3.2-90b-v", status: "active", vram: 0, icon: "vision" },
  { id: "fallback", x: 0.8, y: 0.12, label: "Gemini FB", subtitle: "gemini-2.0-flash", status: "idle", vram: 0, icon: "fallback" },
  { id: "ag1", x: 0.25, y: 0.55, label: "Agent-1", subtitle: "qwen2.5vl:7b", status: "busy", vram: 5.5, icon: "agent" },
  { id: "ag2", x: 0.5, y: 0.75, label: "Agent-2", subtitle: "qwen2.5-coder:3b", status: "active", vram: 2.0, icon: "agent" },
  { id: "ag3", x: 0.75, y: 0.55, label: "Agent-3", subtitle: "qwen2.5-coder:3b", status: "active", vram: 2.0, icon: "agent" },
];

const LINKS = [
  { from: "cloud", to: "ag1", label: "plan" },
  { from: "cloud", to: "ag2", label: "plan" },
  { from: "cloud", to: "ag3", label: "plan" },
  { from: "vision", to: "ag1", label: "img" },
  { from: "ag1", to: "ag2", label: "query" },
  { from: "ag2", to: "ag3", label: "sync" },
  { from: "ag1", to: "cloud", label: "result" },
  { from: "ag2", to: "cloud", label: "result" },
  { from: "ag3", to: "cloud", label: "result" },
  { from: "fallback", to: "cloud", label: "fb" },
];

type Particle = {
  linkIdx: number;
  t: number;
  speed: number;
  size: number;
  prevX: number;
  prevY: number;
};

const statusColors: Record<string, { fill: string; glow: string; pulse: boolean }> = {
  active: { fill: "#00F0FF", glow: "rgba(0,240,255,0.3)", pulse: false },
  idle: { fill: "#00FF88", glow: "rgba(0,255,136,0.2)", pulse: false },
  busy: { fill: "#FF8800", glow: "rgba(255,136,0,0.4)", pulse: true },
  error: { fill: "#FF4444", glow: "rgba(255,68,68,0.4)", pulse: true },
};

export default function AgentVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentNode["status"]>>({});

  useEffect(() => {
    // Initialize random status changes for demo
    const interval = setInterval(() => {
      const ids = ["ag1", "ag2", "ag3"];
      const statuses: AgentNode["status"][] = ["active", "idle", "busy"];
      const randomId = ids[Math.floor(Math.random() * ids.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setAgentStatuses((prev) => ({ ...prev, [randomId]: randomStatus }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    const particles: Particle[] = [];
    const nodePositions: Map<string, { x: number; y: number }> = new Map();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = canvas.width = rect.width * window.devicePixelRatio;
      height = canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      AGENTS.forEach((agent) => {
        nodePositions.set(agent.id, {
          x: agent.x * rect.width,
          y: agent.y * rect.height,
        });
      });
    };

    const spawnParticle = (linkIdx: number) => {
      const link = LINKS[linkIdx];
      const fromNode = nodePositions.get(link.from);
      if (!fromNode) return;

      particles.push({
        linkIdx,
        t: 0,
        speed: 0.008 + Math.random() * 0.012,
        size: 1.5 + Math.random() * 2,
        prevX: fromNode.x,
        prevY: fromNode.y,
      });
    };

    const draw = () => {
      const cssWidth = width / window.devicePixelRatio;
      const cssHeight = height / window.devicePixelRatio;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      time += 0.016;

      // Draw event bus bar at bottom
      const busY = cssHeight * 0.88;
      const busGradient = ctx.createLinearGradient(0, busY - 10, 0, busY + 10);
      busGradient.addColorStop(0, "rgba(0,240,255,0)");
      busGradient.addColorStop(0.5, "rgba(0,240,255,0.08)");
      busGradient.addColorStop(1, "rgba(0,240,255,0)");
      ctx.fillStyle = busGradient;
      ctx.fillRect(cssWidth * 0.1, busY - 10, cssWidth * 0.8, 20);

      ctx.fillStyle = "rgba(0,240,255,0.3)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("EVENT BUS — asyncio pub/sub", cssWidth / 2, busY + 20);

      // Draw links (curved lines)
      LINKS.forEach((link) => {
        const from = nodePositions.get(link.from);
        const to = nodePositions.get(link.to);
        if (!from || !to) return;

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - (link.from === "cloud" || link.from === "vision" || link.from === "fallback" ? -30 : 30);

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(midX, midY, to.x, to.y);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Link label
        const labelT = 0.5;
        const inv = 1 - labelT;
        const lx = inv * inv * from.x + 2 * inv * labelT * midX + labelT * labelT * to.x;
        const ly = inv * inv * from.y + 2 * inv * labelT * midY + labelT * labelT * to.y;

        ctx.fillStyle = "rgba(138, 138, 138, 0.4)";
        ctx.font = "7px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(link.label, lx, ly);
      });

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.t += p.speed;

        if (p.t >= 1) {
          particles.splice(i, 1);
          continue;
        }

        const link = LINKS[p.linkIdx];
        const from = nodePositions.get(link.from);
        const to = nodePositions.get(link.to);
        if (!from || !to) continue;

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - (link.from === "cloud" || link.from === "vision" || link.from === "fallback" ? -30 : 30);
        const inv = 1 - p.t;

        const cx = inv * inv * from.x + 2 * inv * p.t * midX + p.t * p.t * to.x;
        const cy = inv * inv * from.y + 2 * inv * p.t * midY + p.t * p.t * to.y;

        // Particle glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.size * 4);
        glow.addColorStop(0, "rgba(0, 240, 255, 0.6)");
        glow.addColorStop(1, "rgba(0, 240, 255, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(cx - p.size * 4, cy - p.size * 4, p.size * 8, p.size * 8);

        // Particle trail
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.6 * (1 - p.t)})`;
        ctx.lineWidth = p.size;
        ctx.stroke();

        // Particle head
        ctx.beginPath();
        ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
        ctx.fill();

        p.prevX = cx;
        p.prevY = cy;
      }

      // Spawn new particles
      if (Math.random() < 0.12) {
        spawnParticle(Math.floor(Math.random() * LINKS.length));
      }

      // Draw nodes
      AGENTS.forEach((agent) => {
        const pos = nodePositions.get(agent.id);
        if (!pos) return;

        const status = agentStatuses[agent.id] || agent.status;
        const colors = statusColors[status] || statusColors.active;
        const isHovered = hoveredAgent === agent.id;

        // Outer glow for busy/hovered
        if (colors.pulse || isHovered) {
          const pulseSize = 20 + Math.sin(time * 3) * 5;
          const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulseSize);
          glow.addColorStop(0, colors.glow);
          glow.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = glow;
          ctx.fillRect(pos.x - pulseSize, pos.y - pulseSize, pulseSize * 2, pulseSize * 2);
        }

        // Connection line to event bus
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + (agent.id.startsWith("ag") ? 18 : 18));
        ctx.lineTo(pos.x, busY);
        ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node body
        const nodeW = agent.id === "cloud" ? 70 : 60;
        const nodeH = 36;
        const cornerR = 6;

        ctx.fillStyle = isHovered ? "rgba(15, 15, 15, 0.95)" : "rgba(10, 10, 10, 0.9)";
        ctx.strokeStyle = isHovered ? colors.fill : colors.fill + "80";
        ctx.lineWidth = isHovered ? 2 : 1;

        ctx.beginPath();
        ctx.roundRect(pos.x - nodeW / 2, pos.y - nodeH / 2, nodeW, nodeH, cornerR);
        ctx.fill();
        ctx.stroke();

        // Status dot
        ctx.beginPath();
        ctx.arc(pos.x + nodeW / 2 - 8, pos.y - nodeH / 2 + 8, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.fill;
        ctx.fill();

        // Label
        ctx.fillStyle = "#E5E5E5";
        ctx.font = "bold 9px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(agent.label, pos.x, pos.y - 2);

        // Subtitle
        ctx.fillStyle = "#8A8A8A";
        ctx.font = "7px 'JetBrains Mono', monospace";
        ctx.fillText(agent.subtitle, pos.x, pos.y + 10);

        // VRAM indicator for agents
        if (agent.vram > 0) {
          ctx.fillStyle = "rgba(138, 138, 138, 0.5)";
          ctx.font = "6px 'JetBrains Mono', monospace";
          ctx.fillText(`${agent.vram}GB VRAM`, pos.x, pos.y + nodeH / 2 + 10);
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [hoveredAgent, agentStatuses]);

  // Handle mouse move to detect hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    let found = null;
    AGENTS.forEach((agent) => {
      const px = agent.x * rect.width;
      const py = agent.y * rect.height;
      const nodeW = agent.id === "cloud" ? 70 : 60;
      const nodeH = 36;
      if (mx >= px - nodeW / 2 && mx <= px + nodeW / 2 && my >= py - nodeH / 2 && my <= py + nodeH / 2) {
        found = agent.id;
      }
    });

    setHoveredAgent(found);
    canvas.style.cursor = found ? "pointer" : "default";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-[#00F0FF]" />
          <span className="text-[10px] font-mono-data text-[#8A8A8A] tracking-wider">AGENT TOPOLOGY</span>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(statusColors).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.fill }} />
              <span className="text-[8px] font-mono-data text-[#8A8A8A] capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative min-h-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredAgent(null)}
        />

        {/* Agent Detail Overlay */}
        {hoveredAgent && (() => {
          const agent = AGENTS.find((a) => a.id === hoveredAgent);
          if (!agent) return null;
          const status = agentStatuses[agent.id] || agent.status;
          const colors = statusColors[status];
          return (
            <div className="absolute bottom-4 left-4 right-4 glass-panel-strong rounded-lg p-3 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.glow }}>
                  {agent.icon === "cloud" ? <Globe size={16} style={{ color: colors.fill }} /> :
                   agent.icon === "vision" ? <Activity size={16} style={{ color: colors.fill }} /> :
                   <Cpu size={16} style={{ color: colors.fill }} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-space text-[#E5E5E5]">{agent.label}</span>
                    <span className="text-[9px] font-mono-data px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: colors.glow, color: colors.fill }}>
                      {status}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono-data text-[#8A8A8A] mt-0.5">{agent.subtitle}</div>
                </div>
                {agent.vram > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-mono-data text-[#8A8A8A]">
                    <Zap size={10} className="text-[#00F0FF]" />
                    {agent.vram} GB VRAM
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

import { Settings, LogOut, User, Cpu, Zap, Brain, Shield } from "lucide-react";
import type { ConsoleMode } from "./types";
import type { UnifiedUser } from "./types";

type TopBarProps = {
  mode: ConsoleMode;
  onModeChange: (mode: ConsoleMode) => void;
  user: UnifiedUser | null;
  onLogin: () => void;
  onLogout: () => void;
  onSettings: () => void;
  onMemory: () => void;
  vramUsage: number;
  vramTotal: number;
  activeAgents: number;
  totalAgents: number;
};

export default function TopBar({
  mode,
  onModeChange,
  user,
  onLogin,
  onLogout,
  onSettings,
  onMemory,
  vramUsage,
  vramTotal,
  activeAgents,
  totalAgents,
}: TopBarProps) {
  const modes: { id: ConsoleMode; label: string; icon: React.ElementType }[] = [
    { id: "ORCHESTRATE", label: "ORCHESTRATE", icon: Brain },
    { id: "CHAT", label: "CHAT", icon: Cpu },
    { id: "CODEX", label: "CODEX", icon: Shield },
  ];

  return (
    <header className="h-14 glass-panel-strong flex items-center justify-between px-4 z-50 shrink-0">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="font-orbitron text-lg tracking-[0.2em] text-[#E5E5E5] hover:text-[#00F0FF] transition-colors cursor-pointer">
            SUTRADHAR
          </div>
          <div className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.3)] to-transparent" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.15)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] pulse-glow" />
          <span className="text-[10px] font-mono-data text-[#00F0FF] tracking-wider">
            v3.0
          </span>
        </div>
      </div>

      {/* Center: Mode Switcher */}
      <div className="flex items-center gap-1 bg-[rgba(255,255,255,0.02)] rounded-xl p-0.5 border border-[rgba(255,255,255,0.04)]">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className={`flex items-center gap-2 px-4 py-2 text-[11px] font-mono-data tracking-wider rounded-lg transition-all duration-300 ${
              mode === m.id
                ? "bg-[rgba(0,240,255,0.12)] text-[#00F0FF] border border-[rgba(0,240,255,0.25)] shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                : "text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.04)]"
            }`}
          >
            <m.icon size={12} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Right: Stats + User */}
      <div className="flex items-center gap-3">
        {/* VRAM Stats */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-mono-data">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.02)]">
            <Cpu size={11} className="text-[#00F0FF]" />
            <span className="text-[#8A8A8A]">VRAM:</span>
            <span className="text-[#00F0FF]">{vramUsage.toFixed(1)}/{vramTotal}GB</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.02)]">
            <Zap size={11} className="text-[#FF8800]" />
            <span className="text-[#8A8A8A]">AGENTS:</span>
            <span className="text-[#FF8800]">{activeAgents}/{totalAgents}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />

        {/* Memory Button */}
        <button
          onClick={onMemory}
          className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#00F0FF] hover:bg-[rgba(0,240,255,0.08)] transition-all"
          title="Memory"
        >
          <Brain size={14} />
        </button>

        {/* User / Auth */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <div className="w-5 h-5 rounded-full bg-[rgba(0,240,255,0.15)] flex items-center justify-center">
                <User size={10} className="text-[#00F0FF]" />
              </div>
              <span className="text-[11px] text-[#E5E5E5] font-space max-w-[100px] truncate">
                {user.name || "User"}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono-data text-[#00F0FF] border border-[rgba(0,240,255,0.25)] hover:bg-[rgba(0,240,255,0.1)] transition-all"
          >
            <User size={12} />
            LOGIN
          </button>
        )}

        {/* Settings */}
        <button
          onClick={onSettings}
          className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#00F0FF] hover:bg-[rgba(0,240,255,0.08)] transition-all"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Terminal, Activity, Brain, Search, RefreshCw, Server,
  CheckCircle, Wifi, ChevronDown, ChevronUp, Filter
} from "lucide-react";

type LogEntry = {
  topic: string;
  agent: number | null;
  text: string;
  ts: number;
  level: "info" | "warn" | "error" | "success";
};

const DEMO_LOGS: LogEntry[] = [
  { topic: "agent_1.stream", agent: 1, text: "Initializing Qwen2.5-VL 7B model...", ts: Date.now() - 15000, level: "info" },
  { topic: "orchestrator.plan", agent: null, text: "Decomposed task into 3 subtask manifests", ts: Date.now() - 14500, level: "success" },
  { topic: "agent_2.stream", agent: 2, text: "Researching JWT best practices 2024...", ts: Date.now() - 14000, level: "info" },
  { topic: "agent_3.stream", agent: 3, text: "Setting up pytest framework and fixtures", ts: Date.now() - 13800, level: "info" },
  { topic: "agent_2.tool_call", agent: 2, text: "search_web(\"FastAPI rate limiting patterns\")", ts: Date.now() - 13500, level: "info" },
  { topic: "agent_2.tool_result", agent: 2, text: "Found 5 relevant results from DuckDuckGo", ts: Date.now() - 13000, level: "success" },
  { topic: "agent_1.stream", agent: 1, text: "Analyzing image context for vision task", ts: Date.now() - 12000, level: "info" },
  { topic: "agent_2.stream", agent: 2, text: "Key findings: RS256 preferred, 15min expiry recommended", ts: Date.now() - 11000, level: "info" },
  { topic: "system.vram", agent: null, text: "VRAM usage: 7.5/12GB (Agent-1 loaded)", ts: Date.now() - 10000, level: "info" },
  { topic: "agent_3.stream", agent: 3, text: "Writing test cases for JWT authentication", ts: Date.now() - 9500, level: "info" },
  { topic: "agent_1.tool_call", agent: 1, text: "write_file(auth.py, 134 lines)", ts: Date.now() - 9000, level: "success" },
  { topic: "agent_3.tool_call", agent: 3, text: "run_code(\"pytest test_auth.py -v\")", ts: Date.now() - 8500, level: "info" },
  { topic: "agent_3.stream", agent: 3, text: "6/6 tests passed ✓", ts: Date.now() - 8000, level: "success" },
  { topic: "orchestrator.review", agent: null, text: "Synthesis complete. All 3 subtasks done.", ts: Date.now() - 7500, level: "success" },
  { topic: "memory.store", agent: null, text: "Stored session in ChromaDB vector memory", ts: Date.now() - 7000, level: "success" },
  { topic: "agent_1.query", agent: 1, text: "Agent-2: what auth scheme did you recommend?", ts: Date.now() - 6000, level: "info" },
  { topic: "agent_2.query_response", agent: 2, text: "RS256 with python-jose library", ts: Date.now() - 5500, level: "info" },
  { topic: "system.status", agent: null, text: "All agents healthy. Event bus latency: 0.3ms", ts: Date.now() - 4000, level: "success" },
  { topic: "agent_1.stream", agent: 1, text: "Ready for next task assignment", ts: Date.now() - 2000, level: "info" },
  { topic: "system.vram", agent: null, text: "VRAM: 9.5/12GB — 2.5GB headroom available", ts: Date.now() - 1000, level: "info" },
];

const levelConfig = {
  info: { color: "#8A8A8A", bg: "transparent" },
  warn: { color: "#FF8800", bg: "rgba(255,136,0,0.08)" },
  error: { color: "#FF4444", bg: "rgba(255,68,68,0.08)" },
  success: { color: "#00FF88", bg: "rgba(0,255,136,0.08)" },
};

export default function SystemMonitor() {
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>(DEMO_LOGS);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Periodically add new log entries
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const topics = [
          { topic: "agent_1.stream", agent: 1, text: "Processing inference request...", level: "info" as const },
          { topic: "agent_2.stream", agent: 2, text: "Memory vector search: 3 results", level: "info" as const },
          { topic: "system.status", agent: null, text: "Health check: all agents operational", level: "success" as const },
          { topic: "task.complete", agent: null, text: "Task pipeline completed in 8.2s", level: "success" as const },
          { topic: "agent_3.stream", agent: 3, text: "Running code validation...", level: "info" as const },
          { topic: "orchestrator.plan", agent: null, text: "New task decomposed: 2 subtasks", level: "info" as const },
          { topic: "system.vram", agent: null, text: "VRAM: 9.2/12GB (agent unloaded)", level: "info" as const },
        ];
        const random = topics[Math.floor(Math.random() * topics.length)];
        const newLog: LogEntry = { ...random, ts: Date.now() };
        return [...prev.slice(-80), newLog];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getAgentColor = (agent: number | null) => {
    if (agent === 1) return "text-[#00F0FF]";
    if (agent === 2) return "text-[#00FF88]";
    if (agent === 3) return "text-[#FF8800]";
    return "text-[#8A8A8A]";
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === "all" || log.level === filterLevel;
    const matchesAgent = filterAgent === "all" || (filterAgent === "sys" ? log.agent === null : log.agent === Number(filterAgent));
    return matchesSearch && matchesLevel && matchesAgent;
  });

  return (
    <div className="w-80 glass-panel-strong border-l border-[rgba(255,255,255,0.06)] flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#00F0FF]" />
          <span className="text-xs font-mono-data text-[#E5E5E5] tracking-wider">
            SYSTEM
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-md transition-colors ${showFilters ? "text-[#00F0FF] bg-[rgba(0,240,255,0.1)]" : "text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)]"}`}
          >
            <Filter size={12} />
          </button>
          <RefreshCw size={12} className="text-[#8A8A8A] animate-spin" style={{ animationDuration: "8s" }} />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-2 border-b border-[rgba(255,255,255,0.06)] space-y-2 animate-[slideIn_0.15s_ease-out]">
          <div className="flex gap-1">
            {["all", "info", "success", "warn", "error"].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`flex-1 px-2 py-1 rounded text-[9px] font-mono-data transition-all ${
                  filterLevel === level
                    ? "bg-[rgba(0,240,255,0.1)] text-[#00F0FF]"
                    : "text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                {level === "all" ? "ALL" : level.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {["all", "1", "2", "3", "sys"].map((agent) => (
              <button
                key={agent}
                onClick={() => setFilterAgent(agent)}
                className={`flex-1 px-2 py-1 rounded text-[9px] font-mono-data transition-all ${
                  filterAgent === agent
                    ? "bg-[rgba(0,240,255,0.1)] text-[#00F0FF]"
                    : "text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                {agent === "all" ? "ALL" : agent === "sys" ? "SYS" : `AG${agent}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* System Stats */}
      <div className="p-3 border-b border-[rgba(255,255,255,0.06)] space-y-2.5">
        {/* VRAM Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono-data text-[#8A8A8A]">VRAM</span>
            <span className="text-[10px] font-mono-data text-[#00F0FF]">9.5 / 12.0 GB</span>
          </div>
          <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] via-[#00F0FF]/70 to-[#00F0FF]/40 rounded-full transition-all duration-700 relative"
              style={{ width: "79%" }}
            >
              <div className="absolute right-0 top-0 w-2 h-full bg-white/50 blur-[2px]" />
            </div>
          </div>
        </div>

        {/* Agent Status Row */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((ag) => {
            const statuses = ["idle", "busy", "active"] as const;
            const status = statuses[ag - 1];
            const colors = {
              idle: { dot: "bg-[#00FF88]", text: "text-[#00FF88]" },
              busy: { dot: "bg-[#FF8800]", text: "text-[#FF8800]" },
              active: { dot: "bg-[#00F0FF]", text: "text-[#00F0FF]" },
            };
            const c = colors[status];
            return (
              <div key={ag} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.02)]">
                <div className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === "busy" ? "animate-pulse" : ""}`} />
                <span className={`text-[9px] font-mono-data ${c.text}`}>AG{ag}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[rgba(255,255,255,0.02)] ml-auto">
            <Wifi size={9} className="text-[#00FF88]" />
            <span className="text-[9px] font-mono-data text-[#00FF88]">ONLINE</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Server, label: "Agents", value: "6", color: "#00F0FF" },
            { icon: Brain, label: "Models", value: "3 loaded", color: "#00FF88" },
            { icon: CheckCircle, label: "Health", value: "100%", color: "#00FF88" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center p-1.5 rounded-md bg-[rgba(255,255,255,0.02)]">
              <stat.icon size={10} style={{ color: stat.color }} />
              <span className="text-[10px] font-mono-data text-[#E5E5E5] mt-0.5">{stat.value}</span>
              <span className="text-[7px] font-mono-data text-[#5A5A5A]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Search */}
      <div className="p-2 border-b border-[rgba(255,255,255,0.06)]">
        <div className="relative">
          <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter logs..."
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-md pl-6 pr-2 py-1 text-[10px] font-mono-data text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
          />
        </div>
      </div>

      {/* Log Count */}
      <div className="px-3 py-1 border-b border-[rgba(255,255,255,0.04)] flex items-center justify-between">
        <span className="text-[8px] font-mono-data text-[#5A5A5A]">
          {filteredLogs.length} / {logs.length} entries
        </span>
        <span className="text-[8px] font-mono-data text-[#5A5A5A]">
          Auto-refresh
        </span>
      </div>

      {/* Log Viewer */}
      <div className="flex-1 overflow-y-auto p-1.5 font-mono-data text-[10px] space-y-0.5">
        {filteredLogs.map((log, i) => {
          const config = levelConfig[log.level];
          const isExpanded = expandedLog === i;

          return (
            <div
              key={i}
              className="group"
            >
              <button
                onClick={() => setExpandedLog(isExpanded ? null : i)}
                className={`w-full flex items-start gap-1.5 px-2 py-1 rounded transition-all text-left ${
                  isExpanded ? "bg-[rgba(255,255,255,0.04)]" : "hover:bg-[rgba(255,255,255,0.02)]"
                }`}
                style={log.level !== "info" ? { backgroundColor: isExpanded ? config.bg : undefined } : undefined}
              >
                <span className="text-[#5A5A5A] shrink-0 mt-0.5">
                  {new Date(log.ts).toLocaleTimeString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
                <span className={`shrink-0 ${getAgentColor(log.agent)}`}>
                  {log.agent !== null ? `[AG${log.agent}]` : `[SYS]`}
                </span>
                <span className="text-[#8A8A8A] truncate flex-1" style={{ color: config.color }}>
                  {log.text}
                </span>
                {isExpanded ? <ChevronUp size={8} className="text-[#5A5A5A] shrink-0 mt-0.5" /> : <ChevronDown size={8} className="text-[#5A5A5A] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>

              {isExpanded && (
                <div className="px-2 pb-2 pl-[52px] animate-[fadeIn_0.1s_ease-out]">
                  <div className="text-[9px] text-[#5A5A5A] space-y-0.5">
                    <div>Topic: <span className="text-[#8A8A8A]">{log.topic}</span></div>
                    <div>Level: <span style={{ color: config.color }}>{log.level}</span></div>
                    <div>Timestamp: <span className="text-[#8A8A8A]">{new Date(log.ts).toISOString()}</span></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>

      {/* Log Input */}
      <div className="p-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="relative">
          <Terminal size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search memory..."
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-md pl-6 pr-2 py-1.5 text-[10px] font-mono-data text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

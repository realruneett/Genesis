import { useState } from "react";
import {
  X, Search, Brain, AlertTriangle, CheckCircle, Clock, Tag, Trash2, Plus, FileText
} from "lucide-react";

type MemoryEntry = {
  id: number;
  content: string;
  type: "task" | "error" | "success";
  capability: string | null;
  similarity?: number;
  createdAt: Date;
  metadata?: Record<string, any> | null;
};

type MemoryPanelProps = {
  onClose: () => void;
};

const DEMO_MEMORY: MemoryEntry[] = [
  {
    id: 1,
    content: "FastAPI JWT auth implementation using RS256 algorithm with 15-minute token expiry. Used python-jose library.",
    type: "success",
    capability: "authentication",
    similarity: 0.94,
    createdAt: new Date(Date.now() - 86400000 * 2),
    metadata: { duration: "13.2s", agents: [1, 2, 3], date: "2025-06-10" },
  },
  {
    id: 2,
    content: "Error: ImportError - cannot import name 'HTTPBearer' from 'fastapi'. Resolution: Import from fastapi.security, not fastapi directly.",
    type: "error",
    capability: "code_execution",
    similarity: 0.88,
    createdAt: new Date(Date.now() - 86400000 * 3),
    metadata: { error_class: "ImportError", agent: 1, resolved: true },
  },
  {
    id: 3,
    content: "Docker container networking setup with custom bridge. Services: web (port 8080), db (port 3306), redis (port 6379). Used docker-compose with health checks.",
    type: "success",
    capability: "infrastructure",
    similarity: 0.82,
    createdAt: new Date(Date.now() - 86400000),
    metadata: { duration: "8.5s", agents: [2, 3] },
  },
  {
    id: 4,
    content: "React Three Fiber fluid simulation background effect. Uses ping-pong framebuffer approach for 2D fluid dynamics. Resolution: 512x512 for performance.",
    type: "success",
    capability: "frontend",
    similarity: 0.79,
    createdAt: new Date(Date.now() - 86400000 * 5),
    metadata: { duration: "22.1s", agents: [1, 2] },
  },
  {
    id: 5,
    content: "WebSocket streaming for real-time chat tokens. Event bus pattern with pub/sub. Sub-millisecond delivery via asyncio queues.",
    type: "success",
    capability: "realtime",
    similarity: 0.76,
    createdAt: new Date(Date.now() - 86400000 * 4),
    metadata: { duration: "5.3s", agents: [2] },
  },
  {
    id: 6,
    content: "Error: RateLimitError - Groq API rate limit exceeded (30 RPM). Resolution: Implemented exponential backoff with jitter. Fallback to Gemini on failure.",
    type: "error",
    capability: "api_integration",
    similarity: 0.71,
    createdAt: new Date(Date.now() - 86400000 * 6),
    metadata: { error_class: "RateLimitError", provider: "groq", resolved: true },
  },
  {
    id: 7,
    content: "tRPC router setup with Zod validation. End-to-end type safety between frontend and backend. Drizzle ORM for type-safe database queries.",
    type: "success",
    capability: "backend",
    similarity: 0.68,
    createdAt: new Date(Date.now() - 86400000 * 2),
    metadata: { duration: "11.7s", agents: [1, 2, 3] },
  },
  {
    id: 8,
    content: "ChromaDB vector search integration for semantic memory. Embedding model: all-MiniLM-L6-v2. Retrieves 5 most similar past experiences per query.",
    type: "success",
    capability: "memory",
    similarity: 0.65,
    createdAt: new Date(Date.now() - 86400000 * 7),
    metadata: { duration: "7.2s", agents: [1] },
  },
];

const typeConfig = {
  success: { icon: CheckCircle, color: "#00FF88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.2)" },
  error: { icon: AlertTriangle, color: "#FF4444", bg: "rgba(255,68,68,0.1)", border: "rgba(255,68,68,0.2)" },
  task: { icon: FileText, color: "#00F0FF", bg: "rgba(0,240,255,0.1)", border: "rgba(0,240,255,0.2)" },
};

export default function MemoryPanel({ onClose }: MemoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<{ content: string; type: "task" | "error" | "success"; capability: string }>({ content: "", type: "task", capability: "" });

  const filtered = DEMO_MEMORY.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.capability?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = filterType === "all" || entry.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddEntry = () => {
    if (!newEntry.content.trim()) return;
    // In a real app, this would call the API
    setShowAddModal(false);
    setNewEntry({ content: "", type: "task", capability: "" });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[900px] max-h-[85vh] glass-panel-strong rounded-xl overflow-hidden shadow-2xl flex flex-col animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[#00F0FF]" />
            <span className="font-orbitron text-sm text-[#E5E5E5] tracking-wider">
              MEMORY
            </span>
            <span className="text-[10px] font-mono-data text-[#8A8A8A] ml-2">
              {filtered.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono-data text-[#00F0FF] border border-[rgba(0,240,255,0.2)] hover:bg-[rgba(0,240,255,0.1)] transition-colors"
            >
              <Plus size={10} />
              Add Entry
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 p-3 border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory entries..."
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg pl-9 pr-3 py-2 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
            />
          </div>
          <div className="flex gap-1">
            {["all", "success", "error", "task"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono-data tracking-wider transition-all ${
                  filterType === type
                    ? "bg-[rgba(0,240,255,0.1)] text-[#00F0FF] border border-[rgba(0,240,255,0.2)]"
                    : "text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.03)] border border-transparent"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Entry List */}
          <div className="w-[420px] border-r border-[rgba(255,255,255,0.06)] overflow-y-auto shrink-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Brain size={32} className="mx-auto text-[#5A5A5A] mb-3" />
                <div className="text-xs text-[#8A8A8A] font-space">No memory entries found</div>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filtered.map((entry) => {
                  const config = typeConfig[entry.type];
                  const Icon = config.icon;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedEntry?.id === entry.id
                          ? "bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.2)]"
                          : "bg-transparent hover:bg-[rgba(255,255,255,0.02)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5"
                          style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
                        >
                          <Icon size={12} style={{ color: config.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-space text-[#E5E5E5] line-clamp-2 leading-relaxed">
                            {entry.content}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="text-[9px] font-mono-data px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: config.bg, color: config.color }}
                            >
                              {entry.type}
                            </span>
                            {entry.capability && (
                              <span className="text-[9px] font-mono-data text-[#8A8A8A] flex items-center gap-1">
                                <Tag size={8} />
                                {entry.capability}
                              </span>
                            )}
                            {entry.similarity && (
                              <span className="text-[9px] font-mono-data text-[#00F0FF]">
                                {(entry.similarity * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entry Detail */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedEntry ? (
              <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const config = typeConfig[selectedEntry.type];
                      const Icon = config.icon;
                      return (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
                        >
                          <Icon size={16} style={{ color: config.color }} />
                        </div>
                      );
                    })()}
                    <div>
                      <div className="text-xs font-space text-[#E5E5E5] capitalize">{selectedEntry.type}</div>
                      <div className="text-[10px] font-mono-data text-[#8A8A8A]">
                        ID: {selectedEntry.id}
                      </div>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#FF4444] hover:bg-[rgba(255,68,68,0.1)] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <div className="text-[10px] font-mono-data text-[#8A8A8A] mb-2">CONTENT</div>
                  <div className="text-sm font-space text-[#E5E5E5] leading-relaxed">
                    {selectedEntry.content}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {selectedEntry.capability && (
                    <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                      <div className="text-[9px] font-mono-data text-[#8A8A8A] mb-1">CAPABILITY</div>
                      <div className="text-xs font-space text-[#E5E5E5]">{selectedEntry.capability}</div>
                    </div>
                  )}
                  {selectedEntry.similarity && (
                    <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                      <div className="text-[9px] font-mono-data text-[#8A8A8A] mb-1">SIMILARITY</div>
                      <div className="text-xs font-mono-data text-[#00F0FF]">
                        {(selectedEntry.similarity * 100).toFixed(1)}%
                      </div>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-[9px] font-mono-data text-[#8A8A8A] mb-1 flex items-center gap-1">
                      <Clock size={8} />
                      CREATED
                    </div>
                    <div className="text-xs font-space text-[#E5E5E5]">
                      {selectedEntry.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {selectedEntry.metadata && (
                  <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-[9px] font-mono-data text-[#8A8A8A] mb-2">METADATA</div>
                    <pre className="text-[10px] font-mono-data text-[#8A8A8A] overflow-x-auto">
                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Brain size={48} className="text-[#5A5A5A] mb-4" />
                <div className="text-sm font-space text-[#8A8A8A] mb-1">Select a memory entry</div>
                <div className="text-[10px] font-mono-data text-[#5A5A5A]">
                  Click on an entry to view details
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-[480px] glass-panel-strong rounded-xl overflow-hidden shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
              <span className="font-orbitron text-sm text-[#E5E5E5] tracking-wider">ADD MEMORY</span>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-mono-data text-[#8A8A8A] mb-1 tracking-wider">CONTENT</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Enter memory content..."
                  rows={4}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] resize-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono-data text-[#8A8A8A] mb-1 tracking-wider">TYPE</label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as "task" | "error" | "success" })}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs font-space text-[#E5E5E5] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                  >
                    <option value="task">Task</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono-data text-[#8A8A8A] mb-1 tracking-wider">CAPABILITY</label>
                  <input
                    type="text"
                    value={newEntry.capability}
                    onChange={(e) => setNewEntry({ ...newEntry, capability: e.target.value })}
                    placeholder="e.g. authentication"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleAddEntry}
                className="w-full py-2.5 rounded-lg bg-[#00F0FF] text-black text-sm font-space font-medium hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
              >
                Add Memory Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

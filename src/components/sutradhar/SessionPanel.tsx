import { useState } from "react";
import {
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
} from "lucide-react";
import type { UnifiedUser } from "./types";
import { trpc } from "@/providers/trpc";

type SessionPanelProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeSessionId: number | null;
  onSelectSession: (sessionId: number, messages: any[]) => void;
  onNewChat: () => void;
  currentUser: UnifiedUser | null;
};

export default function SessionPanel({
  collapsed,
  onToggleCollapse,
  activeSessionId,
  onSelectSession,
  onNewChat,
  currentUser,
}: SessionPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const { data: sessions, isLoading } = trpc.chat.listSessions.useQuery(
    {
      userId: currentUser?.id,
      userType: currentUser?.authType,
      status: showArchived ? "archived" : "active",
    },
    { enabled: !!currentUser }
  );

  const filteredSessions = sessions?.filter((s) =>
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-10 glass-panel-strong border-r border-[rgba(255,255,255,0.06)] flex flex-col items-center py-3 gap-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-md text-[#00F0FF] hover:bg-[rgba(0,240,255,0.1)] transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 glass-panel-strong border-r border-[rgba(255,255,255,0.06)] flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[#00F0FF]" />
          <span className="text-xs font-mono-data text-[#E5E5E5] tracking-wider">
            SESSIONS
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="p-1.5 rounded-md text-[#00F0FF] hover:bg-[rgba(0,240,255,0.1)] transition-colors"
            title="New Chat"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[rgba(255,255,255,0.06)]">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-md pl-8 pr-3 py-1.5 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => setShowArchived(false)}
          className={`flex-1 py-2 text-[10px] font-mono-data tracking-wider transition-colors ${
            !showArchived
              ? "text-[#00F0FF] border-b border-[#00F0FF]"
              : "text-[#8A8A8A] hover:text-[#E5E5E5]"
          }`}
        >
          ACTIVE
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`flex-1 py-2 text-[10px] font-mono-data tracking-wider transition-colors ${
            showArchived
              ? "text-[#00F0FF] border-b border-[#00F0FF]"
              : "text-[#8A8A8A] hover:text-[#E5E5E5]"
          }`}
        >
          ARCHIVED
        </button>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {!currentUser ? (
          <div className="p-4 text-center">
            <div className="text-xs text-[#8A8A8A] font-space">
              Login to see your sessions
            </div>
          </div>
        ) : isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-[rgba(255,255,255,0.03)] rounded animate-pulse" />
            ))}
          </div>
        ) : filteredSessions && filteredSessions.length > 0 ? (
          <div className="p-1">
            {filteredSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id, [])}
                className={`w-full text-left px-3 py-2.5 rounded-md mb-0.5 transition-all group ${
                  activeSessionId === session.id
                    ? "bg-[rgba(0,240,255,0.1)] border-l-2 border-[#00F0FF]"
                    : "hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${
                    activeSessionId === session.id ? "text-[#00F0FF]" : "text-[#8A8A8A]"
                  }`}>
                    ›
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-space truncate ${
                      activeSessionId === session.id ? "text-[#E5E5E5]" : "text-[#8A8A8A] group-hover:text-[#E5E5E5]"
                    }`}>
                      {session.title || "Untitled Session"}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono-data text-[#8A8A8A]">
                        {session.model}
                      </span>
                      <span className="text-[9px] font-mono-data text-[#8A8A8A]">
                        {session.provider}
                      </span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] opacity-50" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center">
            <Clock size={16} className="mx-auto text-[#8A8A8A] mb-2" />
            <div className="text-xs text-[#8A8A8A] font-space">
              No {showArchived ? "archived" : "active"} sessions
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between text-[9px] font-mono-data text-[#8A8A8A]">
          <span>{filteredSessions?.length || 0} sessions</span>
          <span>Total: {sessions?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}

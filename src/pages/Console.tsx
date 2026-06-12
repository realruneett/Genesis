import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import TopBar from "@/components/sutradhar/TopBar";
import AetherBackground from "@/components/sutradhar/AetherBackground";
import ChatPanel from "@/components/sutradhar/ChatPanel";
import AgentVisualizer from "@/components/sutradhar/AgentVisualizer";
import SessionPanel from "@/components/sutradhar/SessionPanel";
import SystemMonitor from "@/components/sutradhar/SystemMonitor";
import ModelSelector from "@/components/sutradhar/ModelSelector";
import AuthModal from "@/components/sutradhar/AuthModal";
import SettingsPanel from "@/components/sutradhar/SettingsPanel";
import MemoryPanel from "@/components/sutradhar/MemoryPanel";
import { trpc } from "@/providers/trpc";
import type { ChatMessage } from "@/components/sutradhar/types";

export type ConsoleMode = "ORCHESTRATE" | "CHAT" | "CODEX";

export default function Console() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<ConsoleMode>("CHAT");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vramUsage, setVramUsage] = useState(9.5);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const createSession = trpc.chat.createSession.useMutation();
  const streamMessageMut = trpc.chat.streamMessage.useMutation();
  const utils = trpc.useUtils();

  // Simulate VRAM fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setVramUsage((prev) => {
        const change = (Math.random() - 0.5) * 0.4;
        return Math.max(7.0, Math.min(11.5, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show auth modal on first load if not authenticated, but allow dismissal
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasDismissedAuth) {
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated]);

  const [hasDismissedAuth, setHasDismissedAuth] = useState(false);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      let sessionId = activeSessionId;

      // Create session if none exists
      if (!sessionId && user) {
        try {
          const result = await createSession.mutateAsync({
            userId: user.id,
            userType: user.authType,
            title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
            model: selectedModel,
            provider: selectedProvider,
          });
          sessionId = result.id;
          setActiveSessionId(sessionId);
        } catch {
          return;
        }
      }

      if (!sessionId) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: Date.now(),
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      try {
        // Start stream
        const streamResult = await streamMessageMut.mutateAsync({
          sessionId,
          content,
          model: selectedModel,
          provider: selectedProvider,
        });

        // Fetch tokens via utils client
        const tokensResult = await utils.chat.getStreamTokens.fetch({
          streamId: streamResult.streamId,
        });

        if (tokensResult && !tokensResult.done) {
          // Simulate streaming by showing tokens one by one
          const tokens = tokensResult.tokens;
          let assistantContent = "";

          const assistantMsg: ChatMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: "",
            model: selectedModel,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);

          // Stream tokens with animation - variable speed for realism
          for (let i = 0; i < tokens.length; i++) {
            // Variable delay for more natural feel
            const delay = 20 + Math.random() * 40;
            await new Promise((resolve) => setTimeout(resolve, delay));
            assistantContent += (i > 0 ? " " : "") + tokens[i];
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsg.id
                  ? { ...msg, content: assistantContent }
                  : msg
              )
            );
          }
        }
      } catch (err) {
        console.error("Stream error:", err);
        const errorMsg: ChatMessage = {
          id: Date.now() + 2,
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please check your connection and try again.",
          model: selectedModel,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsStreaming(false);
      }
    },
    [activeSessionId, user, selectedModel, selectedProvider, isStreaming, createSession, streamMessageMut, utils]
  );

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  const handleSelectSession = useCallback((sessionId: number, sessionMessages: ChatMessage[]) => {
    setActiveSessionId(sessionId);
    setMessages(sessionMessages);
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="font-orbitron text-2xl text-[#00F0FF] tracking-[0.3em] animate-pulse glow-cyan-text">
            SUTRADHAR
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <div className="text-xs text-[#8A8A8A] font-mono-data">
            Initializing quantum intelligence...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden">
      {/* Aether Background */}
      <AetherBackground />

      {/* Ambient glow effects */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[rgba(0,240,255,0.02)] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[rgba(0,240,255,0.015)] rounded-full blur-[120px]" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Top Command Bar */}
        <TopBar
          mode={mode}
          onModeChange={setMode}
          user={user}
          onLogin={() => setShowAuthModal(true)}
          onLogout={logout}
          onSettings={() => setShowSettings(true)}
          onMemory={() => setShowMemory(true)}
          vramUsage={vramUsage}
          vramTotal={12.0}
          activeAgents={3}
          totalAgents={3}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Sessions */}
          <SessionPanel
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            currentUser={user}
          />

          {/* Center Panel - Chat / Agent Visualizer */}
          <div className="flex-1 flex flex-col min-w-0">
            {mode === "ORCHESTRATE" && (
              <AgentVisualizer />
            )}
            {mode === "CODEX" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center animate-[fadeIn_0.5s_ease-out]">
                  <div className="relative inline-block mb-6">
                    <div className="font-orbitron text-3xl text-[#00F0FF] tracking-wider glow-cyan-text">
                      CODEX MODE
                    </div>
                    <div className="absolute -inset-4 bg-[rgba(0,240,255,0.05)] blur-2xl rounded-full" />
                  </div>
                  <div className="text-[#8A8A8A] text-sm font-space mb-2">
                    Code execution and development environment
                  </div>
                  <div className="text-[#5A5A5A] text-xs font-mono-data mt-4">
                    Phase 2 — Coming Soon
                  </div>
                  <div className="mt-8 flex items-center justify-center gap-4">
                    {["Python", "TypeScript", "Rust", "Go"].map((lang) => (
                      <div
                        key={lang}
                        className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[10px] font-mono-data text-[#8A8A8A]"
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={handleSendMessage}
              selectedModel={selectedModel}
              onOpenModelSelector={() => setShowModelSelector(true)}
              chatEndRef={chatEndRef}
            />
          </div>

          {/* Right Panel - System Monitor */}
          <SystemMonitor />
        </div>
      </div>

      {/* Overlays */}
      {showModelSelector && (
        <ModelSelector
          selectedModel={selectedModel}
          selectedProvider={selectedProvider}
          onSelect={(model, provider) => {
            setSelectedModel(model);
            setSelectedProvider(provider);
            setShowModelSelector(false);
          }}
          onClose={() => setShowModelSelector(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setHasDismissedAuth(true);
          }}
        />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      {showMemory && (
        <MemoryPanel onClose={() => setShowMemory(false)} />
      )}
    </div>
  );
}

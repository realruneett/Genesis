import { useState, useRef, useEffect } from "react";
import { Send, Square, Bot, UserCircle, ChevronDown, Sparkles, Copy, Check, ImagePlus } from "lucide-react";
import type { ChatMessage } from "./types";
import ReactMarkdown from "react-markdown";

type ChatPanelProps = {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  selectedModel: string;
  onOpenModelSelector: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

function MessageBubble({ message, isLast }: { message: ChatMessage; isLast: boolean }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 animate-[fadeIn_0.3s_ease-out] group ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
        isUser
          ? "bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] shadow-[0_0_10px_rgba(0,240,255,0.1)]"
          : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
      }`}>
        {isUser ? (
          <UserCircle size={16} className="text-[#00F0FF]" />
        ) : (
          <Bot size={16} className="text-[#8A8A8A]" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-xl text-sm leading-relaxed font-space relative group/message transition-all duration-300 ${
            isUser
              ? "bg-[#1A1A1A] text-[#E5E5E5] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,240,255,0.15)]"
              : "bg-transparent text-[#E5E5E5]"
          }`}
        >
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover/message:opacity-100 transition-all text-[#8A8A8A] hover:text-[#00F0FF] hover:bg-[rgba(0,240,255,0.1)]"
              title="Copy message"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
          {isUser ? (
            <div>{message.content}</div>
          ) : (
            <div className={`prose prose-invert prose-sm max-w-none ${isLast && message.content.length < 200 ? "typing-cursor" : ""}`}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-[rgba(0,240,255,0.1)] text-[#00F0FF] px-1.5 py-0.5 rounded text-xs font-mono-data border border-[rgba(0,240,255,0.15)]">
                        {children}
                      </code>
                    ) : (
                      <code className="font-mono-data text-xs">{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="bg-[#0F0F0F] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 overflow-x-auto my-2 shadow-inner">
                      {children}
                    </pre>
                  ),
                  h1: ({ children }) => <h1 className="text-lg font-orbitron text-[#00F0FF] mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-orbitron text-[#E5E5E5] mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-orbitron text-[#8A8A8A] mt-2 mb-1">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 text-[#B0B0B0]">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 text-[#B0B0B0]">{children}</ol>,
                  li: ({ children }) => <li className="text-[#B0B0B0]">{children}</li>,
                  strong: ({ children }) => <strong className="text-[#E5E5E5] font-semibold">{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#00F0FF] pl-3 my-2 text-[#8A8A8A] italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content || "..."}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {message.model && (
          <div className="mt-1.5 flex items-center gap-2 px-1">
            <span className="text-[10px] font-mono-data text-[#8A8A8A] bg-[rgba(255,255,255,0.03)] px-1.5 py-0.5 rounded">
              {message.model}
            </span>
            <span className="text-[9px] font-mono-data text-[#5A5A5A]">
              {message.createdAt.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({
  messages,
  isStreaming,
  onSendMessage,
  selectedModel,
  onOpenModelSelector,
  chatEndRef,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px";
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSendMessage(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Drag and drop for images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Image drop handling would go here
  };

  // Suggested prompts for empty state
  const suggestions = [
    { icon: "🧠", text: "Explain quantum computing in simple terms", tag: "Science" },
    { icon: "⚡", text: "Write a Python function to calculate Fibonacci", tag: "Code" },
    { icon: "🗄️", text: "Design a database schema for a chat application", tag: "Backend" },
    { icon: "🏗️", text: "Analyze the pros and cons of microservices", tag: "Architecture" },
    { icon: "🎨", text: "Create a React component with framer-motion animations", tag: "Frontend" },
    { icon: "🔒", text: "Implement JWT authentication with refresh tokens", tag: "Security" },
  ];

  return (
    <div
      className="flex-1 flex flex-col min-h-0 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[rgba(0,240,255,0.05)] border-2 border-dashed border-[#00F0FF] rounded-xl flex items-center justify-center backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="text-center">
            <ImagePlus size={48} className="mx-auto text-[#00F0FF] mb-3" />
            <div className="font-orbitron text-lg text-[#00F0FF]">Drop image to analyze</div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Logo Animation */}
            <div className="text-center space-y-3">
              <div className="relative">
                <div className="font-orbitron text-4xl text-[#E5E5E5] tracking-[0.3em] glow-cyan-text">
                  SUTRADHAR
                </div>
                <div className="absolute -inset-4 bg-[rgba(0,240,255,0.03)] blur-2xl rounded-full" />
              </div>
              <div className="text-sm text-[#8A8A8A] font-space tracking-wider">
                Quantum Intelligence Console v3.0
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] pulse-glow" />
                <span className="text-[10px] font-mono-data text-[#00F0FF] tracking-wider">
                  ALL SYSTEMS OPERATIONAL
                </span>
              </div>
            </div>

            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s.text);
                    textareaRef.current?.focus();
                  }}
                  className="text-left px-4 py-3.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.05)] transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-[9px] font-mono-data text-[#5A5A5A] uppercase tracking-wider group-hover:text-[#00F0FF] transition-colors">
                      {s.tag}
                    </span>
                  </div>
                  <div className="text-xs text-[#8A8A8A] group-hover:text-[#E5E5E5] font-space transition-colors leading-relaxed">
                    {s.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1 && msg.role === "assistant" && isStreaming}
              />
            ))}
            {isStreaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3 animate-[fadeIn_0.3s_ease-out]">
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
                  <Bot size={16} className="text-[#8A8A8A] animate-pulse" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-[#8A8A8A] font-mono-data ml-2">Processing...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto glass-panel rounded-xl overflow-hidden transition-all duration-300 focus-within:border-[rgba(0,240,255,0.3)] focus-within:shadow-[0_0_20px_rgba(0,240,255,0.1)]"
        >
          <div className="flex items-end gap-2 p-3">
            {/* Image Upload Button */}
            <button
              type="button"
              className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#00F0FF] hover:bg-[rgba(0,240,255,0.1)] transition-all shrink-0"
              title="Upload image"
            >
              <ImagePlus size={16} />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Input directive..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#E5E5E5] placeholder-[#8A8A8A] font-space resize-none outline-none border-glow p-2 min-h-[40px] max-h-[150px]"
              disabled={isStreaming}
            />
            <div className="flex items-center gap-2 pb-1 shrink-0">
              {/* Model Selector Button */}
              <button
                type="button"
                onClick={onOpenModelSelector}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono-data text-[#8A8A8A] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(0,240,255,0.1)] hover:text-[#00F0FF] transition-all border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,240,255,0.2)]"
              >
                <Sparkles size={10} className="text-[#00F0FF]" />
                <span className="max-w-[80px] truncate">{selectedModel}</span>
                <ChevronDown size={10} />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  input.trim() && !isStreaming
                    ? "bg-[#00F0FF] text-black hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-105 active:scale-95"
                    : "bg-[rgba(255,255,255,0.05)] text-[#8A8A8A]"
                }`}
              >
                {isStreaming ? (
                  <Square size={12} className="animate-pulse" />
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-2 flex items-center justify-center gap-4">
          <span className="text-[10px] text-[#5A5A5A] font-mono-data">
            SUTRADHAR v3.0
          </span>
          <span className="text-[10px] text-[#3A3A3A]">|</span>
          <span className="text-[10px] text-[#5A5A5A] font-mono-data">
            Enter to send, Shift+Enter for new line
          </span>
          <span className="text-[10px] text-[#3A3A3A]">|</span>
          <span className="text-[10px] text-[#5A5A5A] font-mono-data">
            Drop images to analyze
          </span>
        </div>
      </div>
    </div>
  );
}

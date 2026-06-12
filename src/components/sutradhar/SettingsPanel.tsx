import { useState } from "react";
import {
  X, Key, Server, Palette, Bell, Shield, Database, Save, Check, Loader2
} from "lucide-react";

type SettingsTab = "general" | "api-keys" | "models" | "appearance" | "notifications" | "security";

type SettingsPanelProps = {
  onClose: () => void;
};

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Server },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "models", label: "Models", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

const modelDefaults = [
  { provider: "openai", model: "gpt-4o", name: "OpenAI GPT-4o" },
  { provider: "anthropic", model: "claude-sonnet-4", name: "Claude Sonnet 4" },
  { provider: "google", model: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { provider: "xai", model: "grok-3", name: "Grok 3" },
  { provider: "deepseek", model: "deepseek-chat", name: "DeepSeek V3" },
];

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // General settings
  const [autoSave, setAutoSave] = useState(true);
  const [streamTokens, setStreamTokens] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [defaultProvider, setDefaultProvider] = useState("openai");
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(0.7);

  // API Key states (mock)
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
    groq: "",
    cohere: "",
    mistral: "",
    xai: "",
    deepseek: "",
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  const updateApiKey = (provider: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const maskKey = (key: string) => {
    if (!key) return "";
    if (key.length < 8) return "•".repeat(key.length);
    return key.slice(0, 4) + "•".repeat(key.length - 8) + key.slice(-4);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[800px] max-h-[85vh] glass-panel-strong rounded-xl overflow-hidden shadow-2xl flex flex-col animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-[#00F0FF]" />
            <span className="font-orbitron text-sm text-[#E5E5E5] tracking-wider">
              SETTINGS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono-data transition-all ${
                saved
                  ? "bg-[rgba(0,255,136,0.15)] text-[#00FF88] border border-[rgba(0,255,136,0.3)]"
                  : "bg-[rgba(0,240,255,0.1)] text-[#00F0FF] border border-[rgba(0,240,255,0.2)] hover:bg-[rgba(0,240,255,0.15)]"
              }`}
            >
              {saving ? (
                <Loader2 size={10} className="animate-spin" />
              ) : saved ? (
                <Check size={10} />
              ) : (
                <Save size={10} />
              )}
              {saved ? "Saved" : "Save Changes"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-[rgba(255,255,255,0.06)] overflow-y-auto shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-2.5 transition-all ${
                  activeTab === tab.id
                    ? "bg-[rgba(0,240,255,0.08)] border-l-2 border-[#00F0FF]"
                    : "hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent"
                }`}
              >
                <tab.icon
                  size={14}
                  className={activeTab === tab.id ? "text-[#00F0FF]" : "text-[#8A8A8A]"}
                />
                <span
                  className={`text-xs font-space ${
                    activeTab === tab.id ? "text-[#E5E5E5]" : "text-[#8A8A8A]"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-sm font-orbitron text-[#E5E5E5] mb-1">General Settings</h3>
                  <p className="text-[10px] text-[#8A8A8A] font-space">Configure basic system behavior</p>
                </div>

                {/* Toggle Items */}
                <div className="space-y-4">
                  {[
                    { label: "Auto-save sessions", desc: "Automatically save chat sessions", value: autoSave, onChange: setAutoSave },
                    { label: "Token streaming", desc: "Stream tokens in real-time during responses", value: streamTokens, onChange: setStreamTokens },
                    { label: "Show timestamps", desc: "Display message timestamps in chat", value: showTimestamps, onChange: setShowTimestamps },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-xs font-space text-[#E5E5E5]">{item.label}</div>
                        <div className="text-[10px] text-[#8A8A8A] font-space mt-0.5">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => item.onChange(!item.value)}
                        className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
                          item.value ? "bg-[#00F0FF]" : "bg-[rgba(255,255,255,0.1)]"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
                            item.value ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[rgba(255,255,255,0.06)]" />

                {/* Default Provider */}
                <div>
                  <label className="block text-xs font-space text-[#E5E5E5] mb-2">Default AI Provider</label>
                  <select
                    value={defaultProvider}
                    onChange={(e) => setDefaultProvider(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs font-space text-[#E5E5E5] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google AI</option>
                    <option value="xai">xAI</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="groq">Groq</option>
                    <option value="cohere">Cohere</option>
                    <option value="mistral">Mistral AI</option>
                  </select>
                </div>

                {/* Max Tokens */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-space text-[#E5E5E5]">Max Tokens</label>
                    <span className="text-[10px] font-mono-data text-[#00F0FF]">{maxTokens.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={256}
                    max={128000}
                    step={256}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#00F0FF]"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-mono-data text-[#5A5A5A]">256</span>
                    <span className="text-[9px] font-mono-data text-[#5A5A5A]">128k</span>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-space text-[#E5E5E5]">Temperature</label>
                    <span className="text-[10px] font-mono-data text-[#00F0FF]">{temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full appearance-none cursor-pointer accent-[#00F0FF]"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-mono-data text-[#5A5A5A]">Precise (0)</span>
                    <span className="text-[9px] font-mono-data text-[#5A5A5A]">Creative (2)</span>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === "api-keys" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-sm font-orbitron text-[#E5E5E5] mb-1">API Keys</h3>
                  <p className="text-[10px] text-[#8A8A8A] font-space">Manage your AI provider API keys securely</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(apiKeys).map(([provider, key]) => (
                    <div key={provider} className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.08)] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-space text-[#E5E5E5] capitalize">{provider}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${key ? "bg-[#00FF88]" : "bg-[#FF4444]"}`} />
                      </div>
                      <input
                        type="password"
                        value={key}
                        onChange={(e) => updateApiKey(provider, e.target.value)}
                        placeholder={`Enter ${provider} API key...`}
                        className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-md px-3 py-2 text-[10px] font-mono-data text-[#E5E5E5] placeholder-[#5A5A5A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                      />
                      {key && (
                        <div className="mt-1 text-[9px] font-mono-data text-[#5A5A5A]">
                          {maskKey(key)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Models Tab */}
            {activeTab === "models" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-sm font-orbitron text-[#E5E5E5] mb-1">Model Defaults</h3>
                  <p className="text-[10px] text-[#8A8A8A] font-space">Configure default models for different providers</p>
                </div>

                <div className="space-y-2">
                  {modelDefaults.map((m) => (
                    <div
                      key={m.provider}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                        defaultProvider === m.provider
                          ? "bg-[rgba(0,240,255,0.05)] border-[rgba(0,240,255,0.2)]"
                          : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)]"
                      }`}
                      onClick={() => setDefaultProvider(m.provider)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              {
                                openai: "#00F0FF",
                                anthropic: "#D4A574",
                                google: "#4285F4",
                                xai: "#FF4444",
                                deepseek: "#00FF88",
                              }[m.provider] || "#8A8A8A",
                          }}
                        />
                        <div>
                          <div className="text-xs font-space text-[#E5E5E5] capitalize">{m.provider}</div>
                          <div className="text-[10px] font-mono-data text-[#8A8A8A]">{m.model}</div>
                        </div>
                      </div>
                      {defaultProvider === m.provider && (
                        <span className="text-[9px] font-mono-data text-[#00F0FF] px-2 py-0.5 rounded bg-[rgba(0,240,255,0.1)]">
                          DEFAULT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-sm font-orbitron text-[#E5E5E5] mb-1">Appearance</h3>
                  <p className="text-[10px] text-[#8A8A8A] font-space">Customize the visual experience</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-xs font-space text-[#E5E5E5] mb-3">Theme Preset</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Quantum", color: "#00F0FF", desc: "Cyan neon (default)" },
                        { name: "Amber", color: "#FFAA00", desc: "Warm amber glow" },
                        { name: "Crimson", color: "#FF3366", desc: "Red neon accent" },
                        { name: "Emerald", color: "#00FF88", desc: "Green neon glow" },
                        { name: "Violet", color: "#AA66FF", desc: "Purple neon accent" },
                        { name: "Mono", color: "#E5E5E5", desc: "Grayscale minimal" },
                      ].map((theme) => (
                        <button
                          key={theme.name}
                          className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-all text-center group"
                        >
                          <div
                            className="w-6 h-6 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}40` }}
                          />
                          <div className="text-[10px] font-space text-[#E5E5E5]">{theme.name}</div>
                          <div className="text-[8px] font-mono-data text-[#5A5A5A] mt-0.5">{theme.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-xs font-space text-[#E5E5E5] mb-3">Background Effect</div>
                    <div className="flex gap-2">
                      {["Aether", "Matrix", "Minimal", "None"].map((effect) => (
                        <button
                          key={effect}
                          className="flex-1 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(0,240,255,0.3)] text-[10px] font-mono-data text-[#8A8A8A] hover:text-[#E5E5E5] transition-all"
                        >
                          {effect}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-sm font-orbitron text-[#E5E5E5] mb-1">Notifications</h3>
                  <p className="text-[10px] text-[#8A8A8A] font-space">Configure alert preferences</p>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Task completions", desc: "Get notified when agents complete tasks" },
                    { label: "Error alerts", desc: "Show alerts for system errors" },
                    { label: "Rate limit warnings", desc: "Warn when approaching API rate limits" },
                    { label: "VRAM threshold", desc: "Alert when VRAM usage exceeds 90%" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                      <div>
                        <div className="text-xs font-space text-[#E5E5E5]">{item.label}</div>
                        <div className="text-[10px] text-[#8A8A8A] font-space mt-0.5">{item.desc}</div>
                      </div>
                      <div className="w-10 h-5 rounded-full bg-[#00F0FF] relative">
                        <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 left-5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
                <div>
                  <h3 className="text-sm font-orbitron text-[#E5E5E5] mb-1">Security</h3>
                  <p className="text-[10px] text-[#8A8A8A] font-space">Security and privacy settings</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-[rgba(255,68,68,0.05)] border border-[rgba(255,68,68,0.15)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={14} className="text-[#FF4444]" />
                      <span className="text-xs font-space text-[#E5E5E5]">Clear All Memory</span>
                    </div>
                    <p className="text-[10px] text-[#8A8A8A] font-space mb-3">
                      This will permanently delete all stored memory entries, chat sessions, and error logs.
                    </p>
                    <button className="px-4 py-2 rounded-lg bg-[rgba(255,68,68,0.15)] border border-[rgba(255,68,68,0.3)] text-[#FF4444] text-xs font-space hover:bg-[rgba(255,68,68,0.25)] transition-colors">
                      Clear Memory
                    </button>
                  </div>

                  <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                    <div className="text-xs font-space text-[#E5E5E5] mb-2">Session Timeout</div>
                    <p className="text-[10px] text-[#8A8A8A] font-space mb-3">
                      Automatically end sessions after a period of inactivity.
                    </p>
                    <select className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-xs font-space text-[#E5E5E5] outline-none">
                      <option>Never</option>
                      <option>15 minutes</option>
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>24 hours</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

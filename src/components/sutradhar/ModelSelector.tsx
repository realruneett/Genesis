import { useState } from "react";
import { X, Sparkles, ChevronRight, Key } from "lucide-react";
import { trpc } from "@/providers/trpc";

type ModelSelectorProps = {
  selectedModel: string;
  selectedProvider: string;
  onSelect: (model: string, provider: string) => void;
  onClose: () => void;
};

export default function ModelSelector({
  selectedModel,
  selectedProvider,
  onSelect,
  onClose,
}: ModelSelectorProps) {
  const [activeProvider, setActiveProvider] = useState(selectedProvider);
  const { data: providers } = trpc.model.listProviders.useQuery();
  const { data: models } = trpc.model.listModels.useQuery(
    activeProvider ? { provider: activeProvider } : undefined
  );

  const providerColors: Record<string, string> = {
    openai: "#00F0FF",
    anthropic: "#D4A574",
    google: "#4285F4",
    cohere: "#FF6B6B",
    mistral: "#FF8800",
    xai: "#FF4444",
    deepseek: "#00FF88",
    alibaba: "#FF6B35",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[640px] max-h-[80vh] glass-panel-strong rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#00F0FF]" />
            <span className="font-orbitron text-sm text-[#E5E5E5] tracking-wider">
              MODEL SELECTOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex max-h-[60vh]">
          {/* Provider List */}
          <div className="w-48 border-r border-[rgba(255,255,255,0.06)] overflow-y-auto">
            {providers?.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setActiveProvider(provider.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 transition-all ${
                  activeProvider === provider.id
                    ? "bg-[rgba(0,240,255,0.08)] border-l-2 border-[#00F0FF]"
                    : "hover:bg-[rgba(255,255,255,0.03)] border-l-2 border-transparent"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: providerColors[provider.id] || "#8A8A8A",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-space ${
                      activeProvider === provider.id
                        ? "text-[#E5E5E5]"
                        : "text-[#8A8A8A]"
                    }`}
                  >
                    {provider.name}
                  </div>
                  <div className="text-[9px] font-mono-data text-[#8A8A8A]">
                    {provider.modelCount} models
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Model List */}
          <div className="flex-1 overflow-y-auto">
            {models && models.length > 0 ? (
              <div className="p-2 space-y-1">
                {models.map((model: any) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model.id, activeProvider);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all ${
                      selectedModel === model.id && selectedProvider === activeProvider
                        ? "bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)]"
                        : "hover:bg-[rgba(255,255,255,0.03)] border border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-space text-[#E5E5E5]">
                          {model.name}
                        </span>
                        {selectedModel === model.id && selectedProvider === activeProvider && (
                          <span className="text-[9px] font-mono-data text-[#00F0FF] px-1.5 py-0.5 rounded bg-[rgba(0,240,255,0.1)]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-space text-[#8A8A8A] mt-0.5">
                        {model.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono-data text-[#8A8A8A]">
                          Context: {(model.contextWindow / 1000).toFixed(0)}k
                        </span>
                        {model.providerName && (
                          <span className="text-[9px] font-mono-data text-[#8A8A8A]">
                            {model.providerName}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-[#8A8A8A] shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#8A8A8A] text-xs font-space">
                Select a provider to see models
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <div className="text-[10px] font-mono-data text-[#8A8A8A]">
            {providers?.reduce((acc, p) => acc + p.modelCount, 0) || 0} models across {providers?.length || 0} providers
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono-data text-[#00F0FF] border border-[rgba(0,240,255,0.2)] hover:bg-[rgba(0,240,255,0.1)] transition-colors">
            <Key size={10} />
            Manage API Keys
          </button>
        </div>
      </div>
    </div>
  );
}

import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

// AI Provider configurations with their available models
export const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, GPT-4o-mini, and more",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable multimodal model", contextWindow: 128000 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable", contextWindow: 128000 },
      { id: "gpt-4.1", name: "GPT-4.1", description: "Latest GPT-4 generation", contextWindow: 128000 },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", description: "Balanced performance", contextWindow: 128000 },
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", description: "Lightweight and fast", contextWindow: 128000 },
      { id: "o3", name: "o3", description: "Advanced reasoning", contextWindow: 128000 },
      { id: "o4-mini", name: "o4 Mini", description: "Efficient reasoning", contextWindow: 128000 },
      { id: "o3-mini", name: "o3 Mini", description: "Fast reasoning", contextWindow: 128000 },
      { id: "o1", name: "o1", description: "Complex reasoning", contextWindow: 128000 },
      { id: "o1-mini", name: "o1 Mini", description: "Quick reasoning", contextWindow: 128000 },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude Sonnet, Haiku, and more",
    models: [
      { id: "claude-sonnet-4", name: "Claude Sonnet 4", description: "Balanced intelligence", contextWindow: 200000 },
      { id: "claude-haiku", name: "Claude Haiku", description: "Fast and lightweight", contextWindow: 200000 },
      { id: "claude-opus-4", name: "Claude Opus 4", description: "Most powerful Claude", contextWindow: 200000 },
    ],
  },
  {
    id: "google",
    name: "Google AI",
    description: "Gemini Pro, Flash, and more",
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Advanced reasoning", contextWindow: 1000000 },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast responses", contextWindow: 1000000 },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Quick generation", contextWindow: 1000000 },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "Command R and more",
    models: [
      { id: "command-r", name: "Command R", description: "Enterprise retrieval", contextWindow: 128000 },
      { id: "command-r7b", name: "Command R 7B", description: "Lightweight RAG", contextWindow: 128000 },
      { id: "command-a", name: "Command A", description: "Advanced capabilities", contextWindow: 256000 },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    description: "Codestral, Mistral Large, and more",
    models: [
      { id: "codestral", name: "Codestral", description: "Code generation specialist", contextWindow: 32000 },
      { id: "mistral-large", name: "Mistral Large", description: "General purpose", contextWindow: 128000 },
      { id: "mistral-medium", name: "Mistral Medium", description: "Balanced", contextWindow: 32000 },
      { id: "mistral-small", name: "Mistral Small", description: "Fast responses", contextWindow: 32000 },
      { id: "mistral-saba", name: "Mistral Saba", description: "Specialized", contextWindow: 32000 },
      { id: "ministral-3b", name: "Ministral 3B", description: "Ultra-lightweight", contextWindow: 128000 },
      { id: "ministral-8b", name: "Ministral 8B", description: "Compact", contextWindow: 128000 },
      { id: "mistral-nemo", name: "Mistral Nemo", description: "Efficient", contextWindow: 128000 },
      { id: "pixtral-large", name: "Pixtral Large", description: "Vision capable", contextWindow: 128000 },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok models",
    models: [
      { id: "grok-3", name: "Grok 3", description: "Latest Grok model", contextWindow: 128000 },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "DeepSeek V3 and more",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3", description: "Powerful open model", contextWindow: 64000 },
    ],
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    description: "Qwen models",
    models: [
      { id: "qwen-turbo", name: "Qwen Turbo", description: "Fast multilingual", contextWindow: 32000 },
      { id: "qwen-plus", name: "Qwen Plus", description: "Enhanced capabilities", contextWindow: 128000 },
      { id: "qwen-max", name: "Qwen Max", description: "Most capable", contextWindow: 128000 },
    ],
  },
];

export const modelRouter = createRouter({
  listProviders: publicQuery.query(() => {
    return AI_PROVIDERS.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      modelCount: p.models.length,
    }));
  }),

  listModels: publicQuery
    .input(
      z.object({
        provider: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => {
      if (input?.provider) {
        const provider = AI_PROVIDERS.find((p) => p.id === input.provider);
        return provider?.models ?? [];
      }
      return AI_PROVIDERS.flatMap((p) =>
        p.models.map((m) => ({ ...m, provider: p.id, providerName: p.name }))
      );
    }),

  validateKey: publicQuery
    .input(
      z.object({
        provider: z.string(),
        apiKey: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // In production, this would validate the API key with the actual provider
      // For demo, simulate a validation check
      const isValid = input.apiKey.length > 10;
      return { valid: isValid, provider: input.provider };
    }),
});

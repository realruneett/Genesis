import { useState } from "react";
import { X, User, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

type AuthModalProps = {
  onClose: () => void;
};

type AuthMode = "login" | "register";

function getOAuthUrl() {
  const authUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${authUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = trpc.localAuth.login.useMutation();
  const registerMutation = trpc.localAuth.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await loginMutation.mutateAsync({ username, password });
        localStorage.setItem("local_auth_token", result.token);
        window.location.reload();
      } else {
        const result = await registerMutation.mutateAsync({
          username,
          password,
          displayName: displayName || undefined,
        });
        localStorage.setItem("local_auth_token", result.token);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[420px] glass-panel-strong rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="font-orbitron text-sm text-[#E5E5E5] tracking-wider">
            {mode === "login" ? "AUTHENTICATE" : "REGISTER"}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8A8A8A] hover:text-[#E5E5E5] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* OAuth Login */}
          <a
            href={getOAuthUrl()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)] text-[#00F0FF] text-sm font-space hover:bg-[rgba(0,240,255,0.15)] transition-colors"
          >
            <User size={16} />
            Login with Kimi OAuth
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[10px] font-mono-data text-[#8A8A8A]">OR</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          {/* Local Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="block text-[10px] font-mono-data text-[#8A8A8A] mb-1 tracking-wider">
                  DISPLAY NAME
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
                  />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2.5 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono-data text-[#8A8A8A] mb-1 tracking-wider">
                USERNAME
              </label>
              <div className="relative">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2.5 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono-data text-[#8A8A8A] mb-1 tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-10 pr-4 py-2.5 text-xs font-space text-[#E5E5E5] placeholder-[#8A8A8A] outline-none focus:border-[rgba(0,240,255,0.3)] transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#FF4444] font-space bg-[rgba(255,68,68,0.1)] border border-[rgba(255,68,68,0.2)] rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#00F0FF] text-black text-sm font-space font-medium hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Login" : "Create Account"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-xs font-space text-[#8A8A8A] hover:text-[#00F0FF] transition-colors"
            >
              {mode === "login"
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="font-orbitron text-6xl text-[#00F0FF] mb-4 glow-cyan-text">
          404
        </div>
        <div className="font-space text-sm text-[#8A8A8A] mb-6">
          Signal lost in the void
        </div>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono-data text-[#00F0FF] border border-[rgba(0,240,255,0.3)] hover:bg-[rgba(0,240,255,0.1)] transition-colors"
        >
          <ArrowLeft size={12} />
          RETURN TO CONSOLE
        </button>
      </div>
    </div>
  );
}

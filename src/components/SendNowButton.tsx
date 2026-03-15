"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

interface SendButtonProps {
  leadId: string;
  templateId: string;
}

export function SendNowButton({ leadId, templateId }: SendButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSend = async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/send-now", {
        method: "POST",
        body: JSON.stringify({ leadId, templateId }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={status === "loading" || status === "success"}
      className={`p-2 rounded-lg transition-all active:scale-95 ${
        status === "success" 
          ? "bg-emerald-500 text-white" 
          : status === "error"
          ? "bg-rose-500 text-white"
          : "bg-white/5 text-slate-400 hover:text-white hover:bg-violet-600"
      }`}
      title="Send email now"
    >
      {status === "loading" ? (
        <Loader2 size={16} className="animate-spin" />
      ) : status === "success" ? (
        <CheckCircle2 size={16} />
      ) : (
        <Send size={16} />
      )}
    </button>
  );
}

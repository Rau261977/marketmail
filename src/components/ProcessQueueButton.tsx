"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ProcessQueueButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleProcess = async () => {
    setLoading(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/cron/process-queue');
      if (res.ok) {
        setStatus('success');
        // Refresh the page to show updated counts
        window.location.reload();
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleProcess}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-95 ${
        status === 'success' ? 'bg-emerald-600 text-white' : 
        status === 'error' ? 'bg-rose-600 text-white' :
        'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'
      }`}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : status === 'success' ? (
        <CheckCircle2 size={18} />
      ) : status === 'error' ? (
        <AlertCircle size={18} />
      ) : (
        <Play size={18} />
      )}
      {loading ? 'Processing...' : status === 'success' ? 'Sent!' : status === 'error' ? 'Failed' : 'Process Queue'}
    </button>
  );
}

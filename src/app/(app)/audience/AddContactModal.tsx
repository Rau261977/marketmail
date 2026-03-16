"use client";

import { useState } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Algo salió mal");
      }

      setName("");
      setEmail("");
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-md relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400">
            <UserPlus size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Agregar Contacto</h3>
            <p className="text-sm text-slate-400">Ingresa los datos del nuevo suscriptor.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nombre (Opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-400/10 p-2 rounded-lg border border-rose-400/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Contacto"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

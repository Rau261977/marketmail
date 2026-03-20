"use client";

import { useState } from "react";
import { Plus, X, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { Portal } from "./ui/Portal";

export function CreateTemplateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    subject: ""
  });
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ slug: "", subject: "" });
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al crear la plantilla");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95"
      >
        <Plus size={18} />
        Crear Plantilla
      </button>

      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto">
            <div className="glass-card w-full max-w-md p-8 relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Mail size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Nueva Plantilla</h3>
                  <p className="text-sm text-slate-400 mt-1">Crea un diseño base para tus correos.</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre Interno (slug)</label>
                  <input 
                    required
                    type="text"
                    placeholder="ej: oferta-semanal"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 transition-colors"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Asunto del Correo</label>
                  <input 
                    required
                    type="text"
                    placeholder="¡Mira lo que traemos esta semana!"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 transition-colors"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <span>Crear Plantilla</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

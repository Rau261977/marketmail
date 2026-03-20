"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2, Send, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Portal } from "./ui/Portal";

interface CreateCampaignModalProps {
  variant?: "primary" | "sidebar";
}

export function CreateCampaignModal({ variant = "primary" }: CreateCampaignModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    templateId: ""
  });
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetch("/api/templates")
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setTemplates(data);
        })
        .catch(err => console.error("Error fetching templates:", err));
    }
  }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateId) return alert("Por favor elige una plantilla");
    
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsOpen(false);
        setFormData({ name: "", templateId: "" });
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Error al lanzar la campaña");
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
      {variant === "primary" ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 border border-violet-500/20"
        >
          <Plus size={18} />
          Nueva Campaña
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 px-4 font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={20} />
          Nueva Campaña
        </button>
      )}

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
                  <Send size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Lanzar Nueva Campaña</h3>
                  <p className="text-sm text-slate-400 mt-1">Envía un correo masivo a todos tus contactos.</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre de la Campaña</label>
                  <input 
                    required
                    type="text"
                    placeholder="ej: Oferta Relámpago"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500/50 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Seleccionar Plantilla</label>
                  <div className="relative">
                    <select 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-violet-500/50 transition-colors text-slate-200"
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    >
                      <option value="" disabled className="bg-slate-900">Elegir una plantilla...</option>
                      {templates.map(tmp => (
                        <option key={tmp.id} value={tmp.id} className="bg-slate-900">
                          {tmp.slug} - {tmp.subject}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <span>Lanzar Campaña</span>
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

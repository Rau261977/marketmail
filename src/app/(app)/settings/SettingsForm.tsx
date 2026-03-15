"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, Info, ExternalLink } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    fromEmail: initialData?.settings?.fromEmail || "",
    fromName: initialData?.settings?.fromName || "",
    brandingPrimaryColor: initialData?.settings?.brandingPrimaryColor || "#e11d48",
    brandingLogoUrl: initialData?.settings?.brandingLogoUrl || ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Error al guardar la configuración");

      setStatus("success");
      setMessage("Configuración guardada correctamente");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* General Settings */}
      <div className="glass-card space-y-6">
        <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Información de la Organización</h3>
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nombre de la Empresa</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
            />
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="glass-card space-y-6">
        <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Configuración de Envío</h3>
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nombre del Remitente</label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
              placeholder="Ej: CarniApp"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Correo del Remitente</label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
              placeholder="admin@tuempresa.com"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="glass-card space-y-6">
        <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Identidad Visual</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Color Primario</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={formData.brandingPrimaryColor}
                onChange={(e) => setFormData({ ...formData, brandingPrimaryColor: e.target.value })}
                className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer"
              />
              <span className="text-sm font-mono text-slate-400 uppercase">{formData.brandingPrimaryColor}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">URL del Logo (Imagen)</label>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={formData.brandingLogoUrl}
                onChange={(e) => setFormData({ ...formData, brandingLogoUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white placeholder:text-slate-600"
                placeholder="https://tu-web.com/logo.png"
              />
              {formData.brandingLogoUrl && (
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center p-1 shrink-0">
                  <img 
                    src={formData.brandingLogoUrl} 
                    alt="Logo Preview" 
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-tight">
              <Info size={14} className="mt-0.5 shrink-0 text-violet-500" />
              <p>
                <strong>Tip de Calidad:</strong> Para que tu logo se vea nítido en pantallas modernas (Retina), usa una imagen de <strong>240px x 240px</strong> (o superior). El sistema lo ajustará automáticamente para que se vea perfecto.
              </p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-violet-600/5 border border-violet-500/10 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-violet-400">
              <Info size={20} />
              <h4 className="font-semibold text-sm uppercase tracking-wider">¿Cómo cambiar el avatar en la bandeja de entrada?</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ese círculo con una letra que ves en Gmail o Outlook no se controla desde el código del correo. Para mostrar tu logo real ahí, necesitas configurar <strong>Gravatar</strong> o <strong>BIMI</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                <p className="text-xs font-bold text-slate-200 mb-1">Opción Rápida: Gravatar</p>
                <p className="text-[11px] text-slate-500 mb-3">Asocia tu logo al email remitente ({formData.fromEmail || 'tu-correo@empresa.com'}).</p>
                <a 
                  href="https://es.gravatar.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  Configurar Gravatar <ExternalLink size={12} />
                </a>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-violet-500/30 transition-colors">
                <p className="text-xs font-bold text-slate-200 mb-1">Opción Pro: BIMI</p>
                <p className="text-[11px] text-slate-500 mb-3">Estándar oficial que muestra tu logo verificado junto a tus correos.</p>
                <a 
                  href="https://bimigroup.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  Saber más sobre BIMI <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          {status === "success" && (
            <span className="text-emerald-400 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-left-2 transition-all">
              <CheckCircle2 size={16} />
              {message}
            </span>
          )}
          {status === "error" && (
            <span className="text-rose-400 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-left-2 transition-all">
              <AlertCircle size={16} />
              {message}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Guardar Cambios
        </button>
      </div>
    </form>
  );
}

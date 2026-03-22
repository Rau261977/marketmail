"use client";

import { useState } from "react";
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ExternalLink,
  Globe,
  Bell,
  Shield,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { updatePasswordAction } from "@/lib/auth-actions";

type Tab = "general" | "notifications" | "security";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    fromEmail: initialData?.settings?.fromEmail || "",
    fromName: initialData?.settings?.fromName || "",
    brandingPrimaryColor: initialData?.settings?.brandingPrimaryColor || "#e11d48",
    brandingLogoUrl: initialData?.settings?.brandingLogoUrl || ""
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      if (activeTab === "general") {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error("Error al guardar la configuración");
        setMessage("Configuración guardada correctamente");
      } else if (activeTab === "security") {
        if (passwords.new !== passwords.confirm) {
          throw new Error("Las contraseñas no coinciden");
        }
        if (passwords.new.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres");
        }
        await updatePasswordAction(passwords.new);
        setMessage("Contraseña actualizada correctamente");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setMessage("Preferencias actualizadas");
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Navigation Tabs */}
      <div className="lg:col-span-1 space-y-2">
        <button 
          onClick={() => setActiveTab("general")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "general" 
              ? "bg-violet-600/20 text-violet-400" 
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          <Globe size={18} />
          General
        </button>
        <button 
          onClick={() => setActiveTab("notifications")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "notifications" 
              ? "bg-violet-600/20 text-violet-400" 
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          <Bell size={18} />
          Notificaciones
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "security" 
              ? "bg-violet-600/20 text-violet-400" 
              : "text-slate-400 hover:bg-white/5"
          }`}
        >
          <Shield size={18} />
          Seguridad
        </button>
      </div>

      {/* Content Area */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8 max-w-2xl">
        {activeTab === "general" && (
          <>
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
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "notifications" && (
          <div className="glass-card space-y-6">
            <h3 className="text-lg font-semibold border-b border-white/5 pb-4">Preferencias de Notificación</h3>
            <div className="space-y-4">
              {[
                { label: "Email de resumen diario", desc: "Recibe un resumen de la actividad de ayer." },
                { label: "Alertas de fallos críticos", desc: "Te avisaremos si una campaña se detiene por error." },
                { label: "Nuevos registros en audiencia", desc: "Notificar cada vez que alguien se une a una lista." }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <div className="w-10 h-5 bg-violet-600/30 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-violet-400 rounded-full shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="glass-card space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Lock className="text-violet-400" size={20} />
              <h3 className="text-lg font-semibold">Seguridad de la Cuenta</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white pr-10"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Confirmar Nueva Contraseña</label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Al cambiar tu contraseña, asegúrate de usar combinaciones seguras de letras, números y símbolos. Deberás volver a iniciar sesión en todos tus dispositivos.
                </p>
              </div>
            </div>
          </div>
        )}

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
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2 ml-auto"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {activeTab === "security" ? "Actualizar Contraseña" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}


import { Settings as SettingsIcon, Shield, Bell, Palette, Globe } from "lucide-react";
import { SettingsForm } from "./SettingsForm";

async function getSettings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/settings`, {
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold font-heading">Ajustes</h2>
        <p className="text-slate-400 mt-1">Configura tu organización y preferencias de envío.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs (Visual only for now) */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/20 text-violet-400 text-sm font-medium">
            <Globe size={18} />
            General
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors text-sm font-medium">
            <Palette size={18} />
            Apariencia
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors text-sm font-medium">
            <Bell size={18} />
            Notificaciones
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 transition-colors text-sm font-medium">
            <Shield size={18} />
            Seguridad
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <SettingsForm initialData={settings} />
        </div>
      </div>
    </div>
  );
}

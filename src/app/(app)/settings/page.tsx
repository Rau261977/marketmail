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

      <SettingsForm initialData={settings} />
    </div>
  );
}

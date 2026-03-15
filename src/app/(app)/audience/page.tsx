import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus
} from "lucide-react";
import { SendNowButton } from "@/components/SendNowButton";
import { AddContactModal } from "./AddContactModal";
import { prisma } from "@/lib/db";
import { ClientAudienceActions } from "./ClientAudienceActions";

async function getAudienceData() {
  const [leads, welcomeTemplate] = await Promise.all([
    prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
    }),
    prisma.emailTemplate.findFirst({ where: { slug: 'welcome' } })
  ]);
  
  return { 
      leads, 
      templateId: welcomeTemplate?.id || null 
  };
}

export default async function AudiencePage() {
  const { leads, templateId } = await getAudienceData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-heading">Audiencia</h2>
          <p className="text-slate-400 mt-1">Gestiona tus contactos y segmenta a tus suscriptores.</p>
        </div>
        <ClientAudienceActions templateId={templateId} />
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar contactos..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
          />
        </div>
        <button className="glass flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      <div className="glass-card overflow-hidden !p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Nombre</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Registrado</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold uppercase">
                      {lead.name?.charAt(0) || lead.email.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{lead.name || 'Anónimo'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{lead.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.unsubscribedAt 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {lead.unsubscribedAt ? 'Baja' : 'Activo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {templateId && <SendNowButton leadId={lead.id} templateId={templateId} />}
                    <button className="p-2 text-slate-500 hover:text-slate-200 transition-colors">
                        <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <Users size={48} />
                    <p className="text-sm">No se encontraron contactos en tu audiencia.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

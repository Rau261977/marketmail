export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { Mail, CheckCircle2, XCircle, Clock, Search, Filter, Eye, MousePointer2, Smartphone, Monitor, ChevronRight } from "lucide-react";
import Link from "next/link";
import FormattedDate from "@/components/ui/FormattedDate";

async function getEmailLogs() {
  try {
    // Use raw query to bypass Prisma Client's out-of-sync model (due to EPERM during generate)
    const logs = await prisma.$queryRaw`
      SELECT 
        l.id, 
        l.status, 
        l.device, 
        l.opened_at as "openedAt", 
        l.clicked_at as "clickedAt", 
        l.created_at as "createdAt",
        json_build_object('name', ld.name, 'email', ld.email) as lead
      FROM email_logs l
      JOIN leads ld ON l.lead_id = ld.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `;
    return logs as any[];
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return [];
  }
}

export default async function EmailsPage() {
  const logs = await getEmailLogs();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-heading">Correos Enviados</h2>
          <p className="text-slate-400 mt-1">Historial completo de tus comunicaciones con CarniApp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="glass-card border-emerald-500/20">
          <p className="text-slate-400 text-sm">Entregados</p>
          <h3 className="text-2xl font-bold text-emerald-400">{logs.filter(l => l.status === 'sent').length}</h3>
        </div>
        <div className="glass-card border-violet-500/20">
          <p className="text-slate-400 text-sm">Aperturas</p>
          <h3 className="text-2xl font-bold text-violet-400">{logs.filter(l => l.openedAt !== null).length}</h3>
        </div>
        <div className="glass-card border-blue-500/20">
          <p className="text-slate-400 text-sm">Tasa de Apertura</p>
          <h3 className="text-2xl font-bold text-blue-400">
            {logs.filter(l => l.status === 'sent').length > 0 
              ? ((logs.filter(l => l.openedAt !== null).length / logs.filter(l => l.status === 'sent').length) * 100).toFixed(1) 
              : 0}%
          </h3>
        </div>
        <div className="glass-card border-amber-500/20">
          <p className="text-slate-400 text-sm">Clics</p>
          <h3 className="text-2xl font-bold text-amber-400">{logs.filter(l => l.clickedAt !== null).length}</h3>
        </div>
        <div className="glass-card border-pink-500/20">
          <p className="text-slate-400 text-sm">CTR</p>
          <h3 className="text-2xl font-bold text-pink-400">
            {logs.filter(l => l.status === 'sent').length > 0 
              ? ((logs.filter(l => l.clickedAt !== null).length / logs.filter(l => l.status === 'sent').length) * 100).toFixed(1) 
              : 0}%
          </h3>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02]">
            <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar destinatario o asunto..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/10">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Destinatario</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Asunto</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Abierto</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Dispositivo</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Clics</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">{log.lead.name || 'Sin nombre'}</span>
                        <span className="text-xs text-slate-400">{log.lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {/* Simulating a subject since it might not be in the log explicitly yet */}
                      Confirmación de Suscripción
                    </td>
                    <td className="px-6 py-4">
                      {log.openedAt ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-violet-400 text-xs font-medium bg-violet-500/10 w-fit px-2 py-1 rounded-full border border-violet-500/20">
                            <Eye size={14} />
                            Abierto
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 ml-1 tabular-nums">
                            <FormattedDate date={log.openedAt} />
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic ml-2">No abierto</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {/* @ts-ignore */}
                      {log.device === 'mobile' ? (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Smartphone size={16} className="text-violet-400/70" />
                          <span className="text-xs">Móvil</span>
                        </div>
                      /* @ts-ignore */
                      ) : log.device === 'tablet' ? (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Smartphone size={16} className="text-blue-400/70" />
                          <span className="text-xs">Tablet</span>
                        </div>
                      /* @ts-ignore */
                      ) : log.device === 'desktop' ? (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Monitor size={16} className="text-emerald-400/70" />
                          <span className="text-xs">PC</span>
                        </div>
                      /* @ts-ignore */
                      ) : log.device === 'other' ? (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Monitor size={16} className="text-slate-400/70" />
                          <span className="text-xs">Otro</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.clickedAt ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium bg-amber-500/10 w-fit px-2 py-1 rounded-full border border-amber-500/20">
                            <MousePointer2 size={14} />
                            Click
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1 ml-1 tabular-nums">
                            <FormattedDate date={log.clickedAt} />
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic ml-2">Sin clics</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'sent' ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={14} />
                          Enviado
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-medium bg-rose-500/10 w-fit px-2 py-1 rounded-full border border-rose-500/20">
                          <XCircle size={14} />
                          Error
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 tabular-nums">
                      <FormattedDate date={log.createdAt} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-white/5 rounded-full">
                        <Mail size={32} className="text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-sm">No hay correos enviados todavía.</p>
                      <Link href="/audience" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        Ir a Audiencia para enviar un correo
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { 
  BarChart3, 
  Users, 
  Mail, 
  TrendingUp,
  Activity,
  Send,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { prisma } from "@/lib/db";

async function getStats() {
  const [totalLeads, totalSent, totalTemplates, recentLogs] = await Promise.all([
    prisma.lead.count(),
    prisma.emailLog.count({ where: { status: "sent" } }),
    prisma.emailTemplate.count(),
    prisma.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { lead: true }
    })
  ]);

  // Use raw query for opened count to bypass validation error until Prisma client is regenerated
  const openedResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM "email_logs" WHERE "opened_at" IS NOT NULL
  `;
  const totalOpened = Number(openedResult[0]?.count || 0);

  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;

  // Handle pluralization and formatting for time ago safely for this demo
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "hace unos segundos";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    const hours = Math.floor(minutes / 60);
    return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  };

  return {
    totalLeads: totalLeads.toLocaleString(),
    totalSent: totalSent.toLocaleString(),
    totalOpened: totalOpened.toLocaleString(),
    openRate: openRate.toFixed(1) + "%",
    totalTemplates: totalTemplates.toLocaleString(),
    recentLogs: recentLogs.map(log => ({
      id: log.id,
      text: `Correo enviado a ${log.lead.name || log.lead.email}`,
      time: formatTimeAgo(log.createdAt)
    }))
  };
}

export default async function Dashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-heading">Bienvenido, Arquitecto</h2>
          <p className="text-slate-400 mt-1">Esto es lo que está pasando en tus campañas hoy.</p>
        </div>
        <div className="flex gap-3">
          <button className="glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Audiencia Total" 
          value={stats.totalLeads}
          change="+12.5%" 
          positive={true}
          icon={Users} 
          href="/audience"
        />
        <MetricCard 
          label="Correos Enviados" 
          value={stats.totalSent}
          change="+8.2%" 
          positive={true}
          icon={Send} 
          href="/emails"
        />
        <MetricCard 
          label="Plantillas" 
          value={stats.totalTemplates}
          icon={Mail} 
          href="/templates"
        />
        <MetricCard 
          label="Tasa de Apertura" 
          value={stats.openRate} 
          change={stats.totalOpened + " aperturas"} 
          positive={true}
          icon={TrendingUp} 
          href="/emails"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 size={20} className="text-violet-400" />
                Rendimiento de Entrega
              </h3>
            </div>
            <div className="flex-1 flex items-center justify-center border-t border-white/5 border-dashed">
              <p className="text-slate-500 text-sm">Visualización de analíticas en desarrollo.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-emerald-400" />
              Actividad en Vivo
            </h3>
            <div className="space-y-4">
              {stats.recentLogs.length > 0 ? stats.recentLogs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {log.text}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{log.time}</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400" />
                </div>
              )) : (
                <p className="text-sm text-slate-500 text-center py-4">Sin actividad reciente.</p>
              )}
            </div>
            <Link 
              href="/emails" 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm text-violet-400 mt-6 hover:text-violet-300 transition-colors border-t border-white/5 pt-6 group"
            >
              Ver toda la actividad
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

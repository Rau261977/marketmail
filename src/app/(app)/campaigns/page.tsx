import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Plus,
  Play,
  RotateCcw,
  Mail
} from "lucide-react";
import { prisma } from "@/lib/db";
import { ProcessQueueButton } from "@/components/ProcessQueueButton";

async function getCampaigns() {
  return await prisma.emailCampaign.findMany({
    include: { template: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getQueueSummary() {
  const counts = await prisma.emailQueue.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const summary = {
    pending: 0,
    sent: 0,
    failed: 0,
    retry: 0
  };

  counts.forEach((c: any) => {
    if (c.status === 'pending') summary.pending = c._count.status;
    if (c.status === 'sent') summary.sent = c._count.status;
    if (c.status === 'failed') summary.failed = c._count.status;
    if (c.status === 'retry') summary.retry = c._count.status;
  });

  return summary;
}

export default async function CampaignsPage() {
  const [campaigns, queue] = await Promise.all([
    getCampaigns(),
    getQueueSummary()
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Campaigns</h2>
          <p className="text-slate-400 mt-1">Configure mass mailings and monitor delivery status.</p>
        </div>
        <div className="flex items-center gap-3">
          <ProcessQueueButton />
          <button className="flex items-center gap-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 border border-violet-500/20">
            <Plus size={18} />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Queue Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending', count: queue.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Sent', count: queue.sent, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Failed', count: queue.failed, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
          { label: 'Retrying', count: queue.retry, icon: RotateCcw, color: 'text-violet-400', bg: 'bg-violet-400/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass p-4 rounded-xl flex items-center gap-4">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaigns List */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <h3 className="font-semibold">Recent Campaigns</h3>
            <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View All</button>
        </div>
        <div className="divide-y divide-white/5">
          {campaigns.map((camp: any) => (
            <div key={camp.id} className="p-6 hover:bg-white/[0.01] transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                  <Send size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">{camp.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Mail size={12}/> {camp.template.slug}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleString() : 'Not scheduled'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                    camp.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    camp.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {camp.status}
                  </span>
                </div>
                <button className="p-2 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-violet-600 transition-all active:scale-95 shadow-lg">
                  <Play size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="p-12 text-center opacity-40 flex flex-col items-center gap-3">
              <Send size={48} />
              <p className="text-sm">No campaigns created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

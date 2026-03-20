export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { EmailLogsDashboard } from "@/components/EmailLogsDashboard";

async function getEmailLogs() {
  try {
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

      <EmailLogsDashboard initialLogs={logs} />
    </div>
  );
}

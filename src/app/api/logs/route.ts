import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    // 1. Fetch recent 'sent' logs to potentially sync them from Resend API
    // We only sync if they are older than 3 seconds to give the provider time to process
    const now = new Date();
    const threeSecondsAgo = new Date(now.getTime() - 3000);

    const pendingLogs = await prisma.emailLog.findMany({
      where: {
        status: 'sent',
        createdAt: { lt: threeSecondsAgo }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // 2. Proactively sync each pending log from Resend
    for (const log of pendingLogs) {
      if (!log.resendId) continue;
      
      try {
        const { data, error } = await resend.emails.get(log.resendId);
        if (data && data.last_event) {
          const resendStatus: any = data.last_event;
          
          // Map Resend status to our status
          let newStatus = log.status;
          let updateData: any = {};

          if (resendStatus === 'delivered') {
            newStatus = 'delivered';
            updateData.deliveredAt = new Date();
          } else if (resendStatus === 'bounced') {
            newStatus = 'bounced';
            updateData.bouncedAt = new Date();
          } else if (resendStatus === 'complaint' || resendStatus === 'complained') {
            newStatus = 'complained';
            updateData.complainedAt = new Date();
          }


          if (newStatus !== log.status) {
            console.log(`[Lazy Sync] Updating log ${log.id} status to ${newStatus}`);
            await prisma.emailLog.update({
              where: { id: log.id },
              data: { ...updateData, status: newStatus }
            });
          }
        }
      } catch (e) {
        console.error(`[Lazy Sync] Error syncing log ${log.id}:`, e);
      }
    }

    // 3. Fetch logs for the UI
    const logs = await prisma.$queryRaw`

      SELECT 
        l.id, 
        l.status, 
        l.device, 
        l.opened_at as "openedAt", 
        l.clicked_at as "clickedAt", 
        l.delivered_at as "deliveredAt",
        l.bounced_at as "bouncedAt",
        l.complained_at as "complainedAt",
        l.resend_id as "resendId",
        l.created_at as "createdAt",

        json_build_object('name', ld.name, 'email', ld.email) as lead
      FROM email_logs l
      JOIN leads ld ON l.lead_id = ld.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({
      logs,
      serverTime: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error fetching logs API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

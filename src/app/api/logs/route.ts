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
    const tenSecondsAgo = new Date(now.getTime() - 10000);

    const pendingLogs = await prisma.emailLog.findMany({
      where: {
        status: 'sent',
        createdAt: { lt: tenSecondsAgo }
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[Lazy Sync] Running sync for ${pendingLogs.length} pending logs...`);

    // 2. Proactively sync each pending log from Resend
    for (const log of pendingLogs) {
      if (!log.resendId) continue;
      
      try {
        const apiResendId = log.resendId.startsWith('re_') ? log.resendId : `re_${log.resendId}`;
        const { data, error } = await resend.emails.get(apiResendId);
        
        if (error) {
          console.error(`[Lazy Sync] Resend API error for ${apiResendId}:`, error);
          continue;
        }

        const resendData: any = data;
        if (resendData) {
          const resendStatus: any = resendData.last_event || resendData.status;
          console.log(`[Lazy Sync] DATA for ${log.id}:`, JSON.stringify({ 
            resendId: apiResendId, 
            status: resendData.status, 
            last_event: resendData.last_event 
          }));

          // Map Resend status to our internal status
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
          } else if (resendStatus === 'delivery_delayed') {
            newStatus = 'delayed';
          } else if (resendStatus === 'failed') {
            newStatus = 'failed';
          } else if (resendStatus === 'queued') {
            newStatus = 'queued';
          } else if (resendStatus === 'scheduled') {
            newStatus = 'scheduled';
          } else if (resendStatus === 'canceled') {
            newStatus = 'canceled';
          }


          if (newStatus !== log.status) {
            console.log(`[Lazy Sync] UPDATING DATABASE ${log.id}: ${log.status} -> ${newStatus}`);
            await prisma.emailLog.update({
              where: { id: log.id },
              data: { ...updateData, status: newStatus }
            });
          }
        }
      } catch (e) {
        console.error(`[Lazy Sync] Unexpected error syncing log ${log.id}:`, e);
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

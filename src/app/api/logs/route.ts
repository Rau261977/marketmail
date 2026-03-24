import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';


export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // 1. Fetch recent logs that are not in a final state (Bounced/Opened)
    // to proactively sync them from Resend API
    const pendingLogs = await prisma.emailLog.findMany({
      where: {
        status: { in: ['sent', 'delivered', 'delayed', 'delivery_delayed'] },
        openedAt: null,
        bouncedAt: null
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[Lazy Sync] Found ${pendingLogs.length} logs to check...`);
    const debugFile = path.join(process.cwd(), 'tmp', 'sync_debug.log');
    if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
      fs.mkdirSync(path.join(process.cwd(), 'tmp'), { recursive: true });
    }

    // 2. Proactively sync each log from Resend
    for (const log of pendingLogs) {
      if (!log.resendId) {
        fs.appendFileSync(debugFile, `${new Date().toISOString()} | Log ${log.id} missing resendId\n`);
        continue;
      }
      
      try {
        const apiResendId = log.resendId.startsWith('re_') ? log.resendId : `re_${log.resendId}`;
        const { data, error } = await resend.emails.get(apiResendId);
        
        fs.appendFileSync(debugFile, `${new Date().toISOString()} | Syncing ${log.id} (${apiResendId}) | Result: ${JSON.stringify(data || error)}\n`);

        
        if (error) {
          console.error(`[Lazy Sync] API Error [${apiResendId}]:`, error);
          continue;
        }

          const resendData: any = data;
          if (resendData) {
            // Priority: last_event -> status -> error object
            const lastEvent = resendData.last_event;
            const resendStatus = resendData.status;
            const resendError = resendData.error;

            console.log(`[Lazy Sync] Log: ${log.id} | LastEvent: ${lastEvent} | Status: ${resendStatus} | HasError: ${!!resendError}`);

            // Map Resend status to our internal status
            let newStatus = log.status;
            let updateData: any = {};

            // 1. Check for explicit delivery events first
            if (lastEvent === 'delivered') {
              newStatus = 'delivered';
              updateData.deliveredAt = new Date();
            } else if (lastEvent === 'bounced') {
              newStatus = 'bounced';
              updateData.bouncedAt = new Date();
            } else if (lastEvent === 'complaint' || lastEvent === 'complained') {
              newStatus = 'complained';
              updateData.complainedAt = new Date();
            } else if (lastEvent === 'delivery_delayed') {
              newStatus = 'delayed';
            } else if (lastEvent === 'failed' || !!resendError) {
              newStatus = 'failed';
            } 
            // 2. Fallback to status if no specific event yet
            else if (resendStatus === 'delivered') {
              newStatus = 'delivered';
              updateData.deliveredAt = new Date();
            } else if (resendStatus === 'bounced') {
              newStatus = 'bounced';
              updateData.bouncedAt = new Date();
            }

            // IMPORTANT: Never downgrade a specific status (delivered, bounced, delayed) back to 'sent'
            const isDowngradeToSent = newStatus === 'sent' && ['delivered', 'bounced', 'delayed', 'complained', 'failed'].includes(log.status);

            // Force update if resend has more info or different status (and it's not a downgrade)
            if (newStatus !== log.status && !isDowngradeToSent) {
              console.log(`[Lazy Sync] UPDATING ${log.id}: ${log.status} -> ${newStatus}`);
              await prisma.emailLog.update({
                where: { id: log.id },
                data: { ...updateData, status: newStatus }
              });
            }
          }
      } catch (e) {
        console.error(`[Lazy Sync] Exception for ${log.id}:`, e);
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

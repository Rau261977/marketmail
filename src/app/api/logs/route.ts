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
          const resendStatus: any = resendData.last_event || resendData.status;
          const resendError = resendData.error; // Some payloads might have an error field

          console.log(`[Lazy Sync] Log: ${log.id} | Status: ${resendStatus} | Error: ${resendError ? JSON.stringify(resendError) : 'None'}`);

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
          }

          // Force update if resend has more info or different status
          if (newStatus !== log.status) {
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

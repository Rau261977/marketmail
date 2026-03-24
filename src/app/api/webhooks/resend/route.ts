import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Resend Webhook Handler
 * 
 * This endpoint processes delivery events from Resend (delivered, bounced, complained).
 * You should configure this URL in the Resend Dashboard: 
 * https://your-domain.com/api/webhooks/resend
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Resend Webhook] Full Payload:', JSON.stringify(body, null, 2));

    const { type, event, data } = body;
    const finalType = type || event;

    const rawResendId = data?.email_id || data?.id || body.id;
    
    // Normalize IDs by removing "re_" prefix if present
    const normalize = (id?: any) => (typeof id === 'string' ? id.replace(/^re_/, '') : id);
    const resendId = normalize(rawResendId);

    // Extract log_id from various possible locations and normalize
    let logId = null;
    if (data?.tags) {
      const tagVal = Array.isArray(data.tags) 
        ? data.tags.find((t: any) => t.name === 'log_id' || t.key === 'log_id' || t.name === 'logId')?.value
        : (data.tags.log_id || data.tags.logId);
      logId = normalize(tagVal);
    }

    console.log(`[Resend Webhook] Processed -> Event: ${finalType} | ResendID(norm): ${resendId} | LogID(norm): ${logId}`);


    if (!resendId && !logId) {
      console.warn('[Resend Webhook] Could not find any identification (id or log_id)');
      return NextResponse.json({ error: 'Missing identification' }, { status: 200 }); // 200 to avoid Resend retries if it's just a payload we don't like
    }

    const updateData: any = {};
    const now = new Date();

    // Support both prefixed and non-prefixed types
    const statusType = finalType?.replace('email.', '');

    switch (statusType) {
      case 'delivered':
        updateData.status = 'delivered';
        updateData.deliveredAt = now;
        break;
      case 'bounced':
        updateData.status = 'bounced';
        updateData.bouncedAt = now;
        break;
      case 'complained':
        updateData.status = 'complained';
        updateData.complainedAt = now;
        break;
      case 'delivery_delayed':
        updateData.status = 'delayed';
        break;
      case 'failed':
        updateData.status = 'failed';
        break;
      default:
        console.log(`[Resend Webhook] Ignored event type: ${finalType}`);
        return NextResponse.json({ message: 'Event not tracked' });
    }

    // 1. Try to find the log ID by ResendID or our LogID Tag (Both normalized)
    let targetedLogId = logId;
    
    if (!targetedLogId && resendId) {
      // Search for matches with OR WITHOUT prefix in the database
      const logs = await prisma.emailLog.findMany({
        where: {
          OR: [
            { resendId: resendId },
            { resendId: `re_${resendId}` },
            { id: resendId as any } // Fallback if the ID was somehow stored in the main ID column
          ]
        },
        select: { id: true },
        take: 1
      });
      if (logs.length > 0) targetedLogId = logs[0].id;
    }

    // 2. ULTIMATE FALLBACK: Match by recipient email
    if (!targetedLogId && data?.to) {
      const recipient = Array.isArray(data.to) ? data.to[0] : data.to;
      const recentLog = await prisma.emailLog.findFirst({
        where: { 
          lead: { email: recipient },
          status: 'sent'
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true }
      });
      if (recentLog) {
        targetedLogId = recentLog.id;
        console.log(`[Resend Webhook] Matched by recipient fallback: ${recipient} -> ${targetedLogId}`);
      }
    }


    if (!targetedLogId) {
      console.warn(`[Resend Webhook] Still could not find log for event ${finalType} (ResendID: ${resendId}, LogID: ${logId})`);
      return NextResponse.json({ message: 'Log not found' }, { status: 200 });
    }

    // 3. Use executeRaw to bypass any Prisma

    // 3. Use executeRaw to bypass any Prisma UUID mapping issues in production
    let result = 0;
    if (statusType === 'delivered') {
      result = await prisma.$executeRaw`
        UPDATE "email_logs" 
        SET "status" = 'delivered', "delivered_at" = COALESCE("delivered_at", ${now})
        WHERE "id" = ${targetedLogId}::uuid
      `;
    } else if (statusType === 'bounced' || statusType === 'complained' || statusType === 'delivery_delayed' || statusType === 'failed') {
      if (statusType === 'bounced') {
        result = await prisma.$executeRaw`UPDATE "email_logs" SET "status" = 'bounced', "bounced_at" = ${now} WHERE "id" = ${targetedLogId}::uuid`;
      } else if (statusType === 'complained') {
        result = await prisma.$executeRaw`UPDATE "email_logs" SET "status" = 'complained', "complained_at" = ${now} WHERE "id" = ${targetedLogId}::uuid`;
      } else if (statusType === 'delivery_delayed') {
        result = await prisma.$executeRaw`UPDATE "email_logs" SET "status" = 'delayed' WHERE "id" = ${targetedLogId}::uuid`;
      } else if (statusType === 'failed') {
        result = await prisma.$executeRaw`UPDATE "email_logs" SET "status" = 'failed' WHERE "id" = ${targetedLogId}::uuid`;
      }
    }

    console.log(`[Resend Webhook] Final Result: ${result} rows updated for ${targetedLogId}`);

    return NextResponse.json({ success: true, updated: result });
  } catch (error) {
    console.error('[Resend Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



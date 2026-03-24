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
    // Improved logging for debugging
    console.log('[Resend Webhook] Received Event:', body.type || body.event, '| ID:', body.id || (body.data && body.data.id));

    const { type, event, data } = body;
    const finalType = type || event;

    const rawResendId = data?.email_id || data?.id || body.id;
    
    // Normalize IDs: remove "re_" prefix only if needed
    // Smart normalization: if it's already a UUID, keep it as is.
    const normalize = (id?: any) => (typeof id === 'string' ? id.replace(/^re_/, '') : id);
    const isUuidFormat = (id: any) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.replace(/^re_/, ''));
    
    const resendId = normalize(rawResendId);

    // Extract log_id from various possible locations and normalize
    let logIdFromTag = null;
    if (data?.tags) {
      const tagVal = Array.isArray(data.tags) 
        ? data.tags.find((t: any) => t.name === 'log_id' || t.key === 'log_id' || t.name === 'logId')?.value
        : (data.tags.log_id || data.tags.logId || data.tags.log_id);
      logIdFromTag = normalize(tagVal);
    }

    console.log(`[Resend Webhook] Processed -> Event: ${finalType} | ResendID(norm): ${resendId} | LogID(norm): ${logIdFromTag}`);

    if (!resendId && !logIdFromTag) {
      console.warn('[Resend Webhook] Could not find any identification (id or log_id)');
      return NextResponse.json({ error: 'Missing identification' }, { status: 200 }); 
    }

    const now = new Date();
    const statusType = finalType?.replace('email.', '');

    // 1. Identify the targeted log record
    let targetedLogId = logIdFromTag;
    
    // UUID validation helper
    const isValidUuid = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

    if (!targetedLogId || !isValidUuid(targetedLogId)) {
      if (resendId) {
        // Search for matches with OR WITHOUT prefix in the database
        const logs = await prisma.emailLog.findMany({
          where: {
            OR: [
              { resendId: resendId },
              { resendId: `re_${resendId}` }
            ]
          },
          select: { id: true },
          take: 1
        });
        if (logs.length > 0) targetedLogId = logs[0].id;
      }
    }

    // 2. ULTIMATE FALLBACK: Match by recipient email if still not found
    if (!targetedLogId || !isValidUuid(targetedLogId)) {
      if (data?.to) {
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
    }

    if (!targetedLogId || !isValidUuid(targetedLogId)) {
      console.warn(`[Resend Webhook] Still could not find VALID log UUID for event ${finalType} (ResendID: ${resendId}, LogID: ${logIdFromTag})`);
      return NextResponse.json({ message: 'Log not found or invalid ID' }, { status: 200 });
    }

    // 3. Update the database using Raw SQL for performance and to handle production edge cases
    let result = 0;
    
    switch (statusType) {
      case 'delivered':
        result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "status" = 'delivered', "delivered_at" = COALESCE("delivered_at", ${now})
          WHERE "id" = ${targetedLogId}::uuid
        `;
        break;
      case 'bounced':
        result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "status" = 'bounced', "bounced_at" = ${now}
          WHERE "id" = ${targetedLogId}::uuid
        `;
        break;
      case 'complained':
        result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "status" = 'complained', "complained_at" = ${now}
          WHERE "id" = ${targetedLogId}::uuid
        `;
        break;
      case 'delivery_delayed':
        result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "status" = 'delayed'
          WHERE "id" = ${targetedLogId}::uuid
        `;
        break;
      case 'failed':
        result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "status" = 'failed'
          WHERE "id" = ${targetedLogId}::uuid
        `;
        break;
      default:
        console.log(`[Resend Webhook] Ignored event type: ${finalType}`);
        return NextResponse.json({ message: 'Event not tracked' });
    }

    console.log(`[Resend Webhook] SUCCESS: ${result} rows updated | Event: ${statusType} | Target: ${targetedLogId}`);
    return NextResponse.json({ success: true, updated: result });

  } catch (error) {
    console.error('[Resend Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



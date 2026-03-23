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
    const { type, data } = body;
    const resendId = data.email_id;
    
    // Extract log_id from tags if available (our reliable internal ID)
    const logId = data.tags?.log_id;

    console.log(`[Resend Webhook] Event: ${type} | ResendID: ${resendId} | LogID: ${logId}`);

    if (!resendId && !logId) {
      console.warn('[Resend Webhook] Missing both email_id and log_id in payload');
      return NextResponse.json({ error: 'Missing identification' }, { status: 400 });
    }


    const updateData: any = {};
    const now = new Date();

    // Map Resend events to our internal statuses
    switch (type) {
      case 'email.delivered':
        updateData.status = 'delivered';
        updateData.deliveredAt = now;
        break;
      case 'email.bounced':
        updateData.status = 'bounced';
        updateData.bouncedAt = now;
        break;
      case 'email.complained':
        updateData.status = 'complained';
        updateData.complainedAt = now;
        break;
      default:
        // Other events (clicked, opened, sent) are handled elsewhere or ignored here
        return NextResponse.json({ message: 'Event type not tracked via webhook' });
    }

    // Update using our internal logId (UUID) if available, otherwise fallback to resendId
    const result = await prisma.emailLog.updateMany({
      where: logId ? { id: logId } : { resendId },
      data: updateData,
    });

    console.log(`[Resend Webhook] Updated ${result.count} logs. Targeted ID: ${logId || resendId} | New Status: ${updateData.status}`);


    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('[Resend Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

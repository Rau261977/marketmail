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
    console.log('[Resend Webhook] Received event:', body.type);

    const { type, data } = body;
    const resendId = data.email_id;

    if (!resendId) {
      console.warn('[Resend Webhook] Missing email_id in payload');
      return NextResponse.json({ error: 'Missing email_id' }, { status: 400 });
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

    // Update all logs with this resendId (usually one, but safety first)
    const result = await prisma.emailLog.updateMany({
      where: { resendId },
      data: updateData,
    });

    console.log(`[Resend Webhook] Updated ${result.count} logs for ID ${resendId} to status ${updateData.status}`);

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('[Resend Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

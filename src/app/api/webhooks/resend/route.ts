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
    const finalType = type || event; // Some versions use event
    const resendId = data?.email_id || data?.id || body.id;
    
    // Extract log_id from various possible locations in the payload
    let logId = null;
    if (data?.tags) {
      if (Array.isArray(data.tags)) {
        logId = data.tags.find((t: any) => t.name === 'log_id' || t.key === 'log_id' || t.name === 'logId')?.value;
      } else if (typeof data.tags === 'object') {
        logId = data.tags.log_id || data.tags.logId;
      }
    }

    console.log(`[Resend Webhook] Processed -> Event: ${finalType} | ResendID: ${resendId} | LogID: ${logId}`);

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
      default:
        console.log(`[Resend Webhook] Ignored event type: ${finalType}`);
        return NextResponse.json({ message: 'Event not tracked' });
    }

    // Update using internal logId if found, otherwise resendId
    const result = await prisma.emailLog.updateMany({
      where: logId ? { id: logId } : { resendId: resendId },
      data: updateData,
    });

    console.log(`[Resend Webhook] Result: ${result.count} rows updated for ${logId || resendId}`);

    return NextResponse.json({ success: true, updated: result.count });
  } catch (error) {
    console.error('[Resend Webhook Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


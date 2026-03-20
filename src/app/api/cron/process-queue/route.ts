import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EmailService } from '@/services/email/EmailService';
import { QueueWorker } from '@/services/email/queue/QueueWorker';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow skip auth if secret is not configured (dev) or if triggered from local dashboard
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron] Unauthorized attempt to access process-queue');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const defaultFrom = process.env.EMAIL_FROM_DEFAULT;

    if (!apiKey || !defaultFrom) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY or EMAIL_FROM_DEFAULT not configured' },
        { status: 500 }
      );
    }

    const emailService = new EmailService(apiKey, defaultFrom);
    const worker = new QueueWorker(emailService);

    console.log('[Cron] Processing a batch of emails...');
    // We only process one batch per request to keep it within serverless limits
    await worker.processBatch();

    return NextResponse.json({ success: true, message: 'Queue processed successfully' });
  } catch (error: any) {
    console.error('[Cron] Error processing queue:', error);
    return NextResponse.json(
      { error: 'Error processing queue', details: error.message },
      { status: 500 }
    );
  }
}

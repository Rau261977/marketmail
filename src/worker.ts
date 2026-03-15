import { EmailService } from './services/email/EmailService';
import { QueueWorker } from './services/email/queue/QueueWorker';
import * as dotenv from 'dotenv';

dotenv.config();

async function runWorker() {
  const apiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.EMAIL_FROM_DEFAULT;

  if (!apiKey || !defaultFrom) {
    console.error('Error: RESEND_API_KEY o EMAIL_FROM_DEFAULT no configurados.');
    return;
  }

  const emailService = new EmailService(apiKey, defaultFrom);
  const worker = new QueueWorker(emailService);

  console.log('🚀 Iniciando Worker de MarketMail...');
  await worker.start();
}

runWorker().catch(console.error);

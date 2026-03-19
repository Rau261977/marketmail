import { EmailService, EmailPayload } from '../EmailService';
import { prisma } from '../../../lib/db';
import { WelcomeEmail } from '../templates/WelcomeEmail';
import React from 'react';

export class QueueWorker {
  private emailService: EmailService;
  private isRunning: boolean = false;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async start() {
    this.isRunning = true;
    console.log('[QueueWorker] Started');
    
    while (this.isRunning) {
      await this.processBatch();
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  stop() {
    this.isRunning = false;
    console.log('[QueueWorker] Stopped');
  }

  async processBatch() {
    try {
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: { in: ['pending', 'retry'] },
          scheduledAt: { lte: new Date() },
          retryCount: { lt: 5 }
        },
        include: {
          lead: true,
          template: true,
          tenant: {
            include: { settings: true }
          }
        },
        take: 10
      });

      if (pendingEmails.length === 0) return;

      console.log(`[QueueWorker] Processing ${pendingEmails.length} emails`);

      for (const item of pendingEmails) {
        await this.processItem(item);
      }

    } catch (err) {
      console.error('[QueueWorker] Batch processing error:', err);
    }
  }

  private async processItem(item: any) {
    await prisma.emailQueue.update({
      where: { id: item.id },
      data: { status: 'processing' }
    });

    try {
      const { lead, tenant, template, variablesJson } = item;
      const settings = tenant.settings;

      if (!lead || lead.unsubscribedAt) {
        await prisma.emailQueue.update({
          where: { id: item.id },
          data: { status: 'cancelled', errorLog: 'Lead unsubscribed or not found' }
        });
        return;
      }

      // Template selection logic
      let templateElement: React.ReactElement | null = null;
      const vars = (variablesJson as any) || {};
      const trackingId = crypto.randomUUID();

      if (template?.slug === 'welcome') {
        const content = (template.contentJson as any) || {};
        templateElement = React.createElement(WelcomeEmail, {
          name: lead.name || vars.name,
          businessName: settings?.fromName || 'CarniApp',
          primaryColor: settings?.brandingPrimaryColor,
          logoUrl: settings?.brandingLogoUrl,
          link: content.buttonUrl || 'https://carniapp.com',
          message: content.body || undefined,
          previewText: content.previewText || undefined,
          heading: content.heading || undefined,
          benefit1Title: content.benefit1Title || undefined,
          benefit1Description: content.benefit1Description || undefined,
          benefit2Title: content.benefit2Title || undefined,
          benefit2Description: content.benefit2Description || undefined,
          buttonText: content.buttonText || undefined,
          trackingId: trackingId,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/u/${trackingId}`
        });
      }

      if (!templateElement) {
        throw new Error(`Template slug ${template?.slug} not supported or template missing`);
      }

      const recipientName = lead.name || vars.name || "";
      const rawSubject = template?.subject || item.subject || 'Notification';
      const finalSubject = rawSubject
        .split('{{nombre}}').join(recipientName)
        .split('{{name}}').join(recipientName);

      const payload: EmailPayload = {
        to: lead.email,
        subject: finalSubject,
        template: templateElement,
        from: settings ? `"${settings.fromName}" <${settings.fromEmail}>` : undefined,
        replyTo: settings?.replyTo || undefined,
        tenantId: item.tenantId,
      };

      const result = await this.emailService.safeSend(payload);

      if (result.success) {
        await prisma.emailQueue.update({
          where: { id: item.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            resendId: result.id
          }
        });

        // Log the send
        await prisma.emailLog.create({
          data: {
            id: trackingId,
            tenantId: item.tenantId,
            leadId: lead.id,
            templateId: template?.id,
            resendId: result.id,
            status: 'sent'
          }
        });
      } else {
        await prisma.emailQueue.update({
          where: { id: item.id },
          data: {
            status: 'retry',
            retryCount: item.retryCount + 1,
            errorLog: result.error
          }
        });
      }

    } catch (err: any) {
      console.error(`[QueueWorker] Item ${item.id} processing error:`, err);
      await prisma.emailQueue.update({
        where: { id: item.id },
        data: {
          status: 'failed',
          errorLog: err.message
        }
      });
    }
  }
}

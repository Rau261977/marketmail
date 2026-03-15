import { EmailService, EmailPayload } from './EmailService';
import { WelcomeEmail } from './templates/WelcomeEmail';
import { prisma } from '../../lib/db';
import React from 'react';

export class MultiTenantEmailService {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  async sendTenantEmail(tenantId: string, leadId: string, templateSlug: string, variables: any) {
    const settings = await prisma.tenantEmailSetting.findUnique({
      where: { tenantId: tenantId }
    });
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!settings || !lead) throw new Error('Tenant settings or lead not found');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sentToday = await prisma.emailLog.count({
      where: {
        tenantId: tenantId,
        createdAt: { gte: today }
      }
    });

    const DAILY_LIMIT = 5000;
    if (sentToday >= DAILY_LIMIT) {
      throw new Error(`Daily limit reached for tenant ${tenantId}`);
    }

    let templateElement: React.ReactElement;
    
    if (templateSlug === 'welcome') {
      const template = await prisma.emailTemplate.findUnique({
        where: { tenantId_slug: { tenantId, slug: templateSlug } }
      });
      const content = (template?.contentJson as any) || {};
      const trackingId = crypto.randomUUID();

      templateElement = React.createElement(WelcomeEmail, {
        name: lead.name || variables.name,
        businessName: settings.fromName || 'Our Company',
        primaryColor: settings.brandingPrimaryColor ?? undefined,
        logoUrl: settings.brandingLogoUrl ?? undefined,
        link: variables.link,
        message: content.body || undefined,
        previewText: content.previewText || undefined,
        heading: content.heading || undefined,
        benefit1Title: content.benefit1Title || undefined,
        benefit1Description: content.benefit1Description || undefined,
        benefit2Title: content.benefit2Title || undefined,
        benefit2Description: content.benefit2Description || undefined,
        buttonText: content.buttonText || undefined,
        trackingId: trackingId
      });
    } else {
      throw new Error('Template not found');
    }

    return await this.emailService.safeSend({
      to: lead.email,
      subject: `Welcome to ${settings.fromName}`,
      template: templateElement,
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      replyTo: settings.replyTo || undefined,
      tenantId: tenantId
    });
  }
}

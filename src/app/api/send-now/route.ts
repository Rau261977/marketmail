import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { EmailService } from "@/services/email/EmailService";
import { WelcomeEmail } from "@/services/email/templates/WelcomeEmail";
import { render } from "@react-email/render";
import React from "react";

export async function POST(request: Request) {
  try {
    const { leadId, templateId } = await request.json();

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
    const settings = await prisma.tenantEmailSetting.findFirst({
        where: { tenantId: lead?.tenantId }
    });

    if (!lead || !template || !settings) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // Direct send for "Send Now" functionality
    const emailService = new EmailService(
        process.env.RESEND_API_KEY!,
        process.env.EMAIL_FROM_DEFAULT!
    );

    // Extract dynamic content and branding
    const content = (template.contentJson as any) || {};
    const { brandingLogoUrl, brandingPrimaryColor, fromName, fromEmail } = settings;

    const trackingId = crypto.randomUUID();

    const emailProps = {
        name: lead.name || 'Amigo',
        businessName: fromName || 'CarniApp',
        link: content.buttonUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://carniapp.com',
        primaryColor: brandingPrimaryColor || '#7c3aed',
        logoUrl: brandingLogoUrl || undefined,
        message: content.body || undefined,
        previewText: content.previewText || undefined,
        heading: content.heading || undefined,
        benefit1Title: content.benefit1Title || undefined,
        benefit1Description: content.benefit1Description || undefined,
        benefit2Title: content.benefit2Title || undefined,
        benefit2Description: content.benefit2Description || undefined,
        buttonText: content.buttonText || undefined,
        trackingId: trackingId
    };

    const result = await emailService.sendEmail({
        to: lead.email,
        subject: template.subject,
        template: React.createElement(WelcomeEmail, emailProps),
        from: `${fromName} <${fromEmail}>`,
        tenantId: lead.tenantId
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log the send
    await prisma.emailLog.create({
        data: {
            id: trackingId,
            tenantId: lead.tenantId,
            leadId: lead.id,
            templateId: template.id,
            resendId: result.id,
            status: "sent"
        }
    });

    return NextResponse.json({ success: true, resendId: result.id });
  } catch (error: any) {
    console.error("Send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

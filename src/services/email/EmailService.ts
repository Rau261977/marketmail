import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';

// Types for Email Service
export interface EmailPayload {
  to: string | string[];
  subject: string;
  template: React.ReactElement;
  from?: string;
  replyTo?: string;
  tenantId: string;
  unsubscribeUrl?: string;
  logId?: string;
}


export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

export class EmailService {
  private resend: Resend;
  private defaultFrom: string;

  constructor(apiKey: string, defaultFrom: string) {
    this.resend = new Resend(apiKey);
    this.defaultFrom = defaultFrom;
  }

  /**
   * Sends an email using Resend and handles template rendering.
   */
  async sendEmail(payload: EmailPayload): Promise<SendResult> {
    try {
      // 1. Render React template to HTML
      const html = await render(payload.template);
      
      // 2. Determine "From" address (prioritize payload, then default)
      const from = payload.from || this.defaultFrom;

      // 3. Prepare headers for One-Click Unsubscribe (RFC 8058)
      const headers: Record<string, string> = {};
      if (payload.unsubscribeUrl) {
        headers['List-Unsubscribe'] = `<${payload.unsubscribeUrl}>`;
        headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
      }

      // 4. Send via Resend
      const { data, error } = await this.resend.emails.send({
        from,
        to: payload.to,
        subject: payload.subject,
        html,
        replyTo: payload.replyTo ?? undefined,
        headers,
        tags: [
          { name: 'tenant_id', value: payload.tenantId },
          // log_id is the internal UUID for this email send, used for reliable webhook mapping
          { name: 'log_id', value: (payload as any).logId || 'unknown' },
        ],
      });


      if (error) {
        console.error(`[EmailService] Resend error:`, error);
        return { success: false, error: error.message };
      }

      console.log(`[EmailService] Email sent successfully: ${data?.id}`);
      return { success: true, id: data?.id };

    } catch (err: any) {
      console.error(`[EmailService] Unexpected error:`, err);
      return { success: false, error: err.message || 'Unknown error' };
    }
  }

  /**
   * Safe send function with automatic retries and logging.
   * To be used by the queue worker.
   */
  async safeSend(payload: EmailPayload, maxRetries = 3): Promise<SendResult> {
    let attempt = 0;
    let lastError = '';

    while (attempt < maxRetries) {
      const result = await this.sendEmail(payload);
      if (result.success) return result;

      attempt++;
      lastError = result.error || 'Unknown error';
      console.warn(`[EmailService] Retry attempt ${attempt}/${maxRetries} failed: ${lastError}`);
      
      // Basic exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { success: false, error: `Failed after ${maxRetries} attempts. Last error: ${lastError}` };
  }
}

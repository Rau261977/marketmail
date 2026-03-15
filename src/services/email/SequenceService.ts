import { prisma } from '../../lib/db';

export class SequenceService {
  /**
   * Enrolls a lead into a sequence.
   */
  async enrollLead(leadId: string, sequenceId: string, tenantId: string) {
    try {
      const steps = await prisma.sequenceStep.findMany({
        where: { sequenceId: sequenceId },
        orderBy: { stepOrder: 'asc' }
      });

      if (steps.length === 0) return;

      const firstStep = steps[0];
      await this.scheduleStep(leadId, firstStep, tenantId);

      console.log(`[SequenceService] Lead ${leadId} enrolled in sequence ${sequenceId}`);
    } catch (err) {
      console.error('[SequenceService] Enrollment error:', err);
    }
  }

  async scheduleStep(leadId: string, step: any, tenantId: string) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + (step.delayDays || 0));

    await prisma.emailQueue.create({
      data: {
        leadId: leadId,
        templateId: step.templateId,
        tenantId: tenantId,
        status: 'pending',
        scheduledAt: scheduledAt,
      }
    });
  }

  async triggerNextStep(leadId: string, currentTemplateId: string, tenantId: string) {
    const currentStep = await prisma.sequenceStep.findFirst({
      where: { templateId: currentTemplateId }
    });

    if (!currentStep) return;

    const nextStep = await prisma.sequenceStep.findFirst({
      where: {
        sequenceId: currentStep.sequenceId,
        stepOrder: currentStep.stepOrder + 1
      }
    });

    if (nextStep) {
      await this.scheduleStep(leadId, nextStep, tenantId);
    }
  }
}

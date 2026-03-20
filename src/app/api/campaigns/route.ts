import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, templateId } = body;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // 1. Create the campaign
    const campaign = await prisma.emailCampaign.create({
      data: {
        tenantId: tenant.id,
        name,
        templateId,
        status: 'draft'
      }
    });

    // 2. Fetch all leads for this tenant
    const leads = await prisma.lead.findMany({
      where: { 
        tenantId: tenant.id,
        unsubscribedAt: null // Only active leads
      }
    });

    // 3. Populate the queue
    if (leads.length > 0) {
      await prisma.emailQueue.createMany({
        data: leads.map(lead => ({
          tenantId: tenant.id,
          leadId: lead.id,
          templateId,
          campaignId: campaign.id,
          status: 'pending'
        }))
      });
    }

    return NextResponse.json({ 
      success: true, 
      campaign,
      queuedCount: leads.length
    });

  } catch (error: any) {
    console.error("[Campaigns API] Error creating campaign:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
    try {
      const campaigns = await prisma.emailCampaign.findMany({
        include: { template: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(campaigns);
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const tenant = await prisma.tenant.findFirst({
      include: {
        settings: true
      }
    });
    
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, fromEmail, fromName, brandingPrimaryColor, brandingLogoUrl } = body;

    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 });
    }

    // Update Tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { name }
    });

    // Update or Create Email Settings
    await prisma.tenantEmailSetting.upsert({
      where: { tenantId: tenant.id },
      update: {
        fromEmail,
        fromName,
        brandingPrimaryColor,
        brandingLogoUrl
      },
      create: {
        tenantId: tenant.id,
        fromEmail,
        fromName,
        brandingPrimaryColor,
        brandingLogoUrl
      }
    });

    return NextResponse.json({ success: true, tenant: updatedTenant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

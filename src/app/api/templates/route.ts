import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, subject } = body;

    // Get the first tenant (single-tenant app for now)
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        tenantId: tenant.id,
        slug,
        subject,
        contentJson: {
          heading: "Nueva Plantilla",
          body: "Edita este contenido para personalizar tu correo.",
          previewText: "Previsualización del correo",
          buttonText: "Acción",
          buttonUrl: "https://carniapp.com"
        }
      }
    });

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("[Templates API] Error creating template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

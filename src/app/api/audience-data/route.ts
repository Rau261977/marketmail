import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [leads, welcomeTemplate] = await Promise.all([
      prisma.lead.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
      }),
      prisma.emailTemplate.findFirst({ where: { slug: 'welcome' } })
    ]);
    
    return NextResponse.json({ 
        leads, 
        templateId: welcomeTemplate?.id || null 
    });
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron obtener los datos" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });
    
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      subject, 
      bodyHtml, 
      previewText,
      heading,
      benefit1Title,
      benefit1Description,
      benefit2Title,
      benefit2Description,
      buttonText,
      buttonUrl
    } = body;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        subject,
        contentJson: { 
          body: bodyHtml,
          previewText,
          heading,
          benefit1Title,
          benefit1Description,
          benefit2Title,
          benefit2Description,
          buttonText,
          buttonUrl
        },
      },
    });

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

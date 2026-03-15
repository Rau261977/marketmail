import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/services/email/templates/WelcomeEmail";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { 
      templateId, 
      subject, 
      bodyHtml, 
      variablesJson,
      previewText,
      heading,
      benefit1Title,
      benefit1Description,
      benefit2Title,
      benefit2Description,
      buttonText
    } = await req.json();

    // Fetch tenant branding
    const tenant = await prisma.tenant.findFirst({
      include: {
        settings: true
      }
    });

    const emailSettings = (tenant as any)?.settings;

    const emailHtml = await render(
      WelcomeEmail({
        name: "{{nombre}}",
        businessName: tenant?.name || "CarniApp",
        primaryColor: emailSettings?.brandingPrimaryColor || "#7c3aed",
        logoUrl: emailSettings?.brandingLogoUrl || undefined,
        message: bodyHtml,
        previewText,
        heading,
        benefit1Title,
        benefit1Description,
        benefit2Title,
        benefit2Description,
        buttonText
      })
    );

    return NextResponse.json({ html: emailHtml });
  } catch (error: any) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

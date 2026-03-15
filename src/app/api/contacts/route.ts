import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "El correo electrónico es obligatorio" },
        { status: 400 }
      );
    }

    // Get the first tenant (assuming single-tenant for now, as in previous mocks)
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json(
        { error: "No se encontró un tenant configurado" },
        { status: 500 }
      );
    }

    const lead = await prisma.lead.upsert({
      where: {
        tenantId_email: {
          tenantId: tenant.id,
          email: email.toLowerCase(),
        },
      },
      update: {
        name,
      },
      create: {
        tenantId: tenant.id,
        email: email.toLowerCase(),
        name,
      },
    });

    revalidatePath("/audience");
    revalidatePath("/dashboard");

    return NextResponse.json(lead);
  } catch (error: any) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Error al crear el contacto" },
      { status: 500 }
    );
  }
}

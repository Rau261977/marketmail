import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, email, city } = await request.json();

    const updatedLead = await (prisma.lead as any).update({
      where: { id },
      data: {
        name,
        email: email?.toLowerCase(),
        city,
      },
    });

    revalidatePath("/audience");
    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error("[Contacts-PATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el contacto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.lead.delete({
      where: { id },
    });

    revalidatePath("/audience");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Contacts-DELETE] Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar el contacto" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBot } from "@/lib/bot-detection";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const { logId } = await params;

    // 1. Find the email log to identify the lead
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: logId },
      include: { lead: true }
    });

    if (!emailLog || !emailLog.lead) {
        return new NextResponse("Link de baja no válido o expirado.", { status: 404 });
    }

    // 2. Filter out bots (scanners) to prevent accidental unsubscriptions
    if (isBot(request)) {
        console.log(`[Unsubscribe] Bot detected for log ${logId}, skipping.`);
        return new NextResponse("Bot detected. No changes made.");
    }

    // 3. Mark the lead as unsubscribed
    await prisma.lead.update({
      where: { id: emailLog.leadId },
      data: { unsubscribedAt: new Date() }
    });

    console.log(`[Unsubscribe] Lead ${emailLog.leadId} unsubscribed via log ${logId}`);

    // 4. Return a simple success message (in a real app, redirect to a nice page)
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Baja confirmada</title>
          <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f6f9fc; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: #333; font-size: 1.5rem; margin-bottom: 1rem; }
            p { color: #666; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Baja confirmada</h1>
            <p>Has sido dado de baja correctamente de nuestra lista de correo. No recibirás más mensajes de este tipo.</p>
          </div>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new NextResponse("Error al procesar la baja. Por favor, inténtalo de nuevo más tarde.", { status: 500 });
  }
}

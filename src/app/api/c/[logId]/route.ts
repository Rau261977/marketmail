import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBot } from "@/lib/bot-detection";
import { getDeviceType } from "@/lib/device-detection";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const { logId } = await params;
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("to") || "https://carniapp.com";

    console.log(`[Click Tracking] Click recorded for log: ${logId}, redirecting to: ${targetUrl}`);

    // Check if the request is from a bot/pre-fetcher
    if (isBot(request)) {
        console.log(`[Click Tracking] Bot/Pre-fetcher detected for log ${logId}, skipping recording.`);
    } else {
        const userAgent = request.headers.get("user-agent");
        const device = getDeviceType(userAgent);

        console.log(`[Click Tracking] Device detected: ${device} | UA: ${userAgent}`);

        // Record the click if it's the first time
        await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "clicked_at" = ${new Date()},
              "device" = COALESCE("device", ${device})
          WHERE "id" = ${logId}::uuid AND "clicked_at" IS NULL
        `.catch(err => {
            console.error(`[Click Tracking] Database error for log ${logId}:`, err);
        });

        // Record open as well if it hasn't been recorded (clicking imply opening)
        await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "opened_at" = COALESCE("opened_at", ${new Date()}),
              "device" = COALESCE("device", ${device})
          WHERE "id" = ${logId}::uuid
        `.catch(err => {
            console.error(`[Click Tracking] Database error (open sync) for log ${logId}:`, err);
        });
    }

    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error("Click tracking error:", error);
    // Even if tracking fails, try to redirect for UX
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("to") || "https://carniapp.com";
    return NextResponse.redirect(targetUrl);
  }
}

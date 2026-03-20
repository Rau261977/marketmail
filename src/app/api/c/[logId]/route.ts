import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isBot, isSafeClick } from "@/lib/bot-detection";
import { getDeviceType } from "@/lib/device-detection";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ logId: string }> }
) {
  try {
    const { logId } = await params;
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("to") || "https://carniapp.com";

    console.log(`[Click Tracking] Request received for log: ${logId}`);
    const userAgent = request.headers.get("user-agent") || "";

    // Check if the request is from a safe click (less restrictive than isBot)
    if (!isSafeClick(request)) {
        console.log(`[Click Tracking] Bot/Scanner detected for log ${logId}, skipping recording. UA: ${userAgent}`);
    } else {
        const device = getDeviceType(userAgent);

        console.log(`[Click Tracking] Device detected: ${device} | UA: ${userAgent}`);

        // Record the click. Update device if it's currently NULL or 'other'
        await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "clicked_at" = COALESCE("clicked_at", ${new Date()}),
              "device" = CASE 
                WHEN "device" IS NULL OR "device" = 'other' THEN ${device}
                ELSE "device"
              END
          WHERE "id" = ${logId}::uuid
        `.catch(err => {
            console.error(`[Click Tracking] Database error for log ${logId}:`, err);
        });

        // Record open as well. Update device if it's currently NULL or 'other'
        await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "opened_at" = COALESCE("opened_at", ${new Date()}),
              "device" = CASE 
                WHEN "device" IS NULL OR "device" = 'other' THEN ${device}
                ELSE "device"
              END
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

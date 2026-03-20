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

    console.log(`[Tracking] Pixel requested for log: ${logId}`);

    const userAgent = request.headers.get("user-agent") || "";

    // Check if the request is from a bot/pre-fetcher
    if (isBot(request)) {
        console.log(`[Tracking] Bot/Pre-fetcher detected for log ${logId}, skipping recording. UA: ${userAgent}`);
    } else {
        const device = getDeviceType(userAgent);
        
        console.log(`[Tracking] Device detected: ${device} | UA: ${userAgent}`);

        // Record the open. Update device if it's currently NULL or 'other' (to allow override from proxy)
        const result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "opened_at" = COALESCE("opened_at", ${new Date()}),
              "device" = CASE 
                WHEN "device" IS NULL OR "device" = 'other' THEN ${device}
                ELSE "device"
              END
          WHERE "id" = ${logId}::uuid
        `.catch(err => {
            console.error(`[Tracking] Database error for log ${logId}:`, err);
            return 0;
        });

        if (result > 0) {
          console.log(`[Tracking] Successfully recorded open for log: ${logId}`);
        }
    }

    // Return a 1x1 transparent GIF
    const buffer = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/gif",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return new NextResponse(null, { status: 500 });
  }
}

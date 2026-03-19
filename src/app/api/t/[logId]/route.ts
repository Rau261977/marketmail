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

    // Check if the request is from a bot/pre-fetcher
    if (isBot(request)) {
        console.log(`[Tracking] Bot/Pre-fetcher detected for log ${logId}, skipping recording.`);
    } else {
        const userAgent = request.headers.get("user-agent");
        const device = getDeviceType(userAgent);

        // Record the open if it's the first time using raw query to bypass client validation issues
        const result = await prisma.$executeRaw`
          UPDATE "email_logs" 
          SET "opened_at" = ${new Date()},
              "device" = ${device}
          WHERE "id" = ${logId}::uuid AND "opened_at" IS NULL
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await prisma.$queryRaw`
      SELECT 
        l.id, 
        l.status, 
        l.device, 
        l.opened_at as "openedAt", 
        l.clicked_at as "clickedAt", 
        l.delivered_at as "deliveredAt",
        l.bounced_at as "bouncedAt",
        l.complained_at as "complainedAt",
        l.created_at as "createdAt",
        json_build_object('name', ld.name, 'email', ld.email) as lead
      FROM email_logs l
      JOIN leads ld ON l.lead_id = ld.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `;
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Error fetching logs API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

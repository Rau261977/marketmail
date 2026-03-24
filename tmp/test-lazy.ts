
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    console.log("Starting test...");
    
    // 1. Fetch recent logs
    const pendingLogs = await prisma.emailLog.findMany({
        where: {
            status: { in: ['sent', 'delivered', 'delayed', 'delivery_delayed'] },
            openedAt: null,
            bouncedAt: null
        },
        take: 20,
        orderBy: { createdAt: 'desc' }
    });

    console.log(`[Lazy Sync Test] Found ${pendingLogs.length} logs to check...`);

    for (const log of pendingLogs) {
        if (!log.resendId) {
            console.log(`Log ${log.id} missing resendId`);
            continue;
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(log.resendId);
        const apiResendId = isUuid ? log.resendId : (log.resendId.startsWith('re_') ? log.resendId : `re_${log.resendId}`);
        
        console.log(`Checking API for ID: ${apiResendId}`);
        const { data, error } = await resend.emails.get(apiResendId);

        if (error) {
            console.error(`[API ERROR] ${apiResendId}:`, error);
        } else {
            console.log(`[API SUCCESS] ${apiResendId}:`, JSON.stringify(data, null, 2));
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

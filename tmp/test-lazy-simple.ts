
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    const pendingLogs = await prisma.emailLog.findMany({
        where: {
            status: { in: ['sent', 'delivered', 'delayed', 'delivery_delayed'] },
            openedAt: null,
            bouncedAt: null
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    for (const log of pendingLogs) {
        if (!log.resendId) continue;
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(log.resendId);
        const apiResendId = isUuid ? log.resendId : (log.resendId.startsWith('re_') ? log.resendId : `re_${log.resendId}`);
        const { data, error } = await resend.emails.get(apiResendId);
        if (data) {
            console.log(`LOG ${log.id} -> last_event: ${data.last_event} | status: ${data.status}`);
        }
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());

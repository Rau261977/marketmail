
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    const logs = await prisma.emailLog.findMany({
        where: { status: 'sent', resendId: { not: null } },
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${logs.length} sent logs to test.`);

    for (const log of logs) {
        const rid = log.resendId.startsWith('re_') ? log.resendId : `re_${log.resendId}`;
        console.log(`Checking ${rid}...`);
        try {
            const { data, error } = await resend.emails.get(rid);
            if (error) {
                console.error(`Error for ${rid}:`, JSON.stringify(error, null, 2));
            } else {
                console.log(`Data for ${rid}:`, JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.error(`Exception for ${rid}:`, e);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

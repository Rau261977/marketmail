
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
    const log = await prisma.emailLog.findFirst({
        where: { resendId: { not: null } },
        orderBy: { createdAt: 'desc' }
    });

    if (!log || !log.resendId) return console.log('No log found');

    const rawId = log.resendId;
    const prefixedId = rawId.startsWith('re_') ? rawId : `re_${rawId}`;
    const cleanId = rawId.replace(/^re_/, '');

    console.log(`Testing Raw ID: [${rawId}]`);
    console.log(`Testing Prefixed ID: [${prefixedId}]`);
    console.log(`Testing Clean ID: [${cleanId}]`);

    console.log('--- TEST 1: Prefixed ---');
    try {
        const r1 = await resend.emails.get(prefixedId);
        console.log('Result 1:', JSON.stringify(r1, null, 2));
    } catch (e) {
        console.error('Error 1:', e);
    }

    console.log('--- TEST 2: Clean ---');
    try {
        const r2 = await resend.emails.get(cleanId);
        console.log('Result 2:', JSON.stringify(r2, null, 2));
    } catch (e) {
        console.error('Error 2:', e);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

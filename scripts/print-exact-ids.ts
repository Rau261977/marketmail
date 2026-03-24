
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.emailLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { resendId: true }
    });
    logs.forEach((l, i) => {
        console.log(`LOG ${i}: [${l.resendId}]`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());

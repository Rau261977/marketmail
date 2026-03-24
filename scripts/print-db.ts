
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.emailLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, resendId: true, status: true, createdAt: true }
    });
    console.log(JSON.stringify(logs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

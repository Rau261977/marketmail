
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.emailLog.findMany({
    take: 10,
    where: { resendId: { not: null } },
    select: { resendId: true, status: true }
  });
  logs.forEach(l => console.log(`RID: ${l.resendId} STATUS: ${l.status}`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

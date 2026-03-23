
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.emailLog.findMany({
    take: 5,
    where: { resendId: { not: null } },
    select: { id: true, resendId: true, status: true }
  });
  console.log(JSON.stringify(logs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

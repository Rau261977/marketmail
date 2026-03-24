const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.emailLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      resendId: true,
      createdAt: true
    }
  });
  console.log('--- RECENT LOGS ---');
  logs.forEach(l => {
    console.log(`ID: ${l.id} | Status: ${l.status} | ResendID: ${l.resendId} | Created: ${l.createdAt}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

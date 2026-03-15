const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const logs = await prisma.emailLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log('Last 10 Email Logs:');
    logs.forEach(log => {
      console.log(`FULL_ID: ${log.id} | Status: ${log.status}`);
    });
    
    const totalOpened = await prisma.emailLog.count({
      where: { openedAt: { not: null } }
    }).catch(() => 'Query failed (likely column missing or client out of sync)');
    
    console.log('\nTotal Opened count (count check):', totalOpened);

    const rawCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "email_logs" WHERE "opened_at" IS NOT NULL`;
    console.log('Raw SQL count:', rawCount);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

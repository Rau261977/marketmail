import { prisma } from '../lib/db';
import { SequenceService } from '../services/email/SequenceService';

/**
 * script de ejemplo para configurar el sistema y enrolar un lead.
 */
async function main() {
  console.log('--- Configurando Datos Iniciales ---');

  // 1. Crear un Tenant (Tu Carnicería)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'carniapp' },
    update: {},
    create: {
      name: 'CarniApp',
      slug: 'carniapp',
    },
  });

  // 2. Configurar el Branding y Remitente
  await prisma.tenantEmailSetting.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      fromEmail: 'admin@carniapp.com',
      fromName: 'CarniApp',
      brandingPrimaryColor: '#e11d48',
      brandingLogoUrl: 'https://carniapp.com/logo.png',
    },
  });

  // 3. Crear una Plantilla (Template)
  const template = await prisma.emailTemplate.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: 'welcome' } },
    update: {},
    create: {
      tenantId: tenant.id,
      slug: 'welcome',
      subject: '¡Bienvenido a nuestra familia!',
    },
  });

/*
  // 4. Crear un Lead (Cliente)
  const lead = await prisma.lead.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'cliente@ejemplo.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'cliente@ejemplo.com',
      name: 'Juan Pérez',
    },
  });

  // 5. Enrolar en una Secuencia (O simplemente encolar un mail directo)
  console.log('Encolando email de bienvenida...');
  await prisma.emailQueue.create({
    data: {
      tenantId: tenant.id,
      leadId: lead.id,
      templateId: template.id,
      variablesJson: { name: 'Juan', link: 'https://carniapp.com/ofertas' },
      status: 'pending',
      scheduledAt: new Date(), // Enviar ahora
    },
  });
*/

  console.log('✅ Configuración completada. El email está en la cola (email_queue).');
  console.log('Para enviarlo, debes correr el worker con: npx ts-node src/worker.ts');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

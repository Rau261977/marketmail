import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 1. Check if a tenant already exists
    let tenant = await prisma.tenant.findFirst();

    if (!tenant) {
      console.log('[Init] No tenant found, creating default...');
      tenant = await prisma.tenant.create({
        data: {
          name: 'MarketMail Default',
          slug: 'marketmail-default',
          settings: {
            create: {
              fromName: 'MarketMail',
              fromEmail: process.env.EMAIL_FROM_DEFAULT || 'hello@example.com',
              brandingPrimaryColor: '#7C3AED', // Violet 600
            }
          }
        }
      });
      console.log('[Init] Default tenant created:', tenant.id);
    } else {
      console.log('[Init] Tenant already exists:', tenant.id);
    }

    // 2. Check if a default template exists
    let template = await prisma.emailTemplate.findFirst({
        where: { slug: 'welcome' }
    });

    if (!template) {
        console.log('[Init] No welcome template found, creating...');
        await prisma.emailTemplate.create({
            data: {
                tenantId: tenant.id,
                slug: 'welcome',
                subject: '¡Bienvenido a MarketMail!',
                contentJson: {
                    heading: "¡Hola! Gracias por sumarte",
                    body: "Estamos felices de tenerte con nosotros.",
                    buttonText: "Visitar sitio",
                    previewText: "Bienvenido a bordo"
                }
            }
        });
        console.log('[Init] Welcome template created.');
    }

    return NextResponse.json({ 
        success: true, 
        message: 'System initialized',
        tenantId: tenant.id
    });
  } catch (error: any) {
    console.error('[Init] Error during initialization:', error);
    return NextResponse.json(
      { error: 'Initialization failed', details: error.message },
      { status: 500 }
    );
  }
}

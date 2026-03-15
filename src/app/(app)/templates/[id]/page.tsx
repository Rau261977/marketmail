import { prisma } from "@/lib/db";
import TemplateEditor from "../TemplateEditor";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    notFound();
  }

  return <TemplateEditor template={template} />;
}

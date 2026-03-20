import { 
  Mail, 
  Plus, 
  Search, 
  Eye, 
  Edit3,
  Trash2,
  Copy
} from "lucide-react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CreateTemplateModal } from "@/components/CreateTemplateModal";

async function getTemplates() {
  return await prisma.emailTemplate.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold font-heading">Plantillas</h2>
          <p className="text-slate-400 mt-1">Diseña y gestiona tus diseños de correo reutilizables.</p>
        </div>
        <CreateTemplateModal />
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template: any) => (
          <div key={template.id} className="glass-card group hover:border-violet-500/30 transition-all flex flex-col p-0 overflow-hidden">
            {/* Template Preview Placeholder */}
            <div className="aspect-video bg-white/[0.03] border-b border-white/5 flex items-center justify-center group-hover:bg-white/[0.05] transition-colors relative h-48">
              <Mail size={48} className="text-slate-700 group-hover:text-violet-500/20 transition-colors" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 bg-black/40 backdrop-blur-sm transition-all">
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors" title="Previsualizar">
                  <Eye size={18} />
                </button>
                <Link 
                  href={`/templates/${template.id}`}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors" 
                  title="Editar"
                >
                  <Edit3 size={18} />
                </Link>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{template.slug}</h4>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">{template.subject}</p>
                </div>
                <div className="flex gap-1">
                   <button className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors">
                    <Copy size={16} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Actualizado el {new Date(template.updatedAt).toLocaleDateString()}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400/70 bg-violet-400/5 px-2 py-0.5 rounded">Activa</span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Create New Card handled by the same modal button if needed, but for now we keep the simple button above */}
        <div className="border-2 border-dashed border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-violet-500/20 hover:bg-violet-500/[0.02] transition-all group min-h-[300px] opacity-20">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-[0.2em]">Diseño Premium</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Save, ChevronLeft, Loader2, Eye, EyeOff, Layout, Type } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TemplateEditor({ template }: { template: any }) {
  const content = template.contentJson || {};
  const [subject, setSubject] = useState(template.subject || "");
  const [message, setMessage] = useState(content.body || "");
  
  // New editable fields
  const [previewText, setPreviewText] = useState(content.previewText || "");
  const [heading, setHeading] = useState(content.heading || "");
  const [benefit1Title, setBenefit1Title] = useState(content.benefit1Title || "Calidad Premium");
  const [benefit1Description, setBenefit1Description] = useState(content.benefit1Description || "Seleccionamos los mejores cortes para ti.");
  const [benefit2Title, setBenefit2Title] = useState(content.benefit2Title || "Envío Rápido");
  const [benefit2Description, setBenefit2Description] = useState(content.benefit2Description || "Directo a tu puerta en el menor tiempo.");
  const [buttonText, setButtonText] = useState(content.buttonText || "Comenzar ahora");
  const [buttonUrl, setButtonUrl] = useState(content.buttonUrl || "https://carniapp.com");

  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const router = useRouter();

  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          templateId: template.id,
          subject,
          bodyHtml: message,
          previewText,
          heading,
          benefit1Title,
          benefit1Description,
          benefit2Title,
          benefit2Description,
          buttonText,
          buttonUrl
        })
      });
      const data = await res.json();
      setPreviewHtml(data.html);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [template.id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject,
          bodyHtml: message,
          previewText,
          heading,
          benefit1Title,
          benefit1Description,
          benefit2Title,
          benefit2Description,
          buttonText,
          buttonUrl
        })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/templates" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold font-heading">Editar Plantilla</h2>
            <p className="text-sm text-slate-400">Personaliza el diseño y contenido de tu correo.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="glass flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Editor Side */}
        <div className="glass-card flex flex-col gap-8 overflow-y-auto">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/5 pb-4">
              <Type size={18} className="text-violet-400" />
              Contenido del Correo
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Asunto del Correo</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                    placeholder="Ej: ¡Bienvenido a CarniApp!"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Texto de Vista Previa (Hidden)</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                    placeholder="Resumen corto del correo..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Encabezado Principal</label>
                <input
                  type="text"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                  placeholder="Ej: ¡Hola, {{nombre}}!"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Mensaje del Correo</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white min-h-[120px] resize-none"
                  placeholder="Escribe el contenido de tu correo aquí..."
                />
              </div>

              {/* Benefits Section Editor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Beneficio 1</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={benefit1Title}
                      onChange={(e) => setBenefit1Title(e.target.value)}
                      className="w-full bg-white/10 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white"
                      placeholder="Título"
                    />
                    <textarea
                      value={benefit1Description}
                      onChange={(e) => setBenefit1Description(e.target.value)}
                      className="w-full bg-white/10 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white h-16 resize-none"
                      placeholder="Descripción"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-wider">Beneficio 2</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={benefit2Title}
                      onChange={(e) => setBenefit2Title(e.target.value)}
                      className="w-full bg-white/10 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white"
                      placeholder="Título"
                    />
                    <textarea
                      value={benefit2Description}
                      onChange={(e) => setBenefit2Description(e.target.value)}
                      className="w-full bg-white/10 border border-white/5 rounded-lg py-1.5 px-3 text-xs text-white h-16 resize-none"
                      placeholder="Descripción"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Texto del Botón</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                  placeholder="Ej: Comenzar ahora"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Link del Botón</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                    placeholder="Ej: https://carniapp.com"
                  />
                  <button 
                    onClick={fetchPreview}
                    className="px-4 py-2 bg-violet-600/20 text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-600/30 transition-all"
                  >
                    Actualizar Vista Previa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-white/5 pb-4">
              <Layout size={18} className="text-violet-400" />
              Estructura de la Marca
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="text-slate-400">Logo Corporativo</span>
                <span className="text-emerald-400 font-medium">Activo</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="text-slate-400">Colores de Marca</span>
                <span className="text-emerald-400 font-medium">Aplicado</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="text-slate-400">Diseño Responsivo</span>
                <span className="text-emerald-400 font-medium">Verificado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Side */}
        {showPreview && (
          <div className="glass-card p-0 flex flex-col relative bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vista Previa Profesional</span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-[#f6f9fc]">
              {previewLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 transition-all">
                  <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-violet-500 mx-auto mb-4" />
                    <p className="text-sm text-slate-400">Generando diseño profesional...</p>
                  </div>
                </div>
              ) : (
                <div className="animate-in zoom-in-95 duration-500 origin-top">
                  <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

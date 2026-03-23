"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Info, 
  X, 
  Loader2,
  Calendar,
  Mail,
  User,
  Fingerprint,
  MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";
import FormattedDate from "@/components/ui/FormattedDate";

interface Lead {
  id: string;
  name: string | null;
  email: string;
  city: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
}

export function ContactActions({ lead }: { lead: Lead }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const [editName, setEditName] = useState(lead.name || "");
  const [editEmail, setEditEmail] = useState(lead.email);
  const [editCity, setEditCity] = useState(lead.city || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX, // 192 is w-48 (12rem * 16px)
      });
    }
  }, [isMenuOpen]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/contacts/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail, city: editCity }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setIsEditOpen(false);
      setIsMenuOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/${lead.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      setIsDeleteOpen(false);
      setIsMenuOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPortal = (content: React.ReactNode) => {
    if (!mounted) return null;
    return createPortal(content, document.body);
  };

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-white/5"
      >
        <MoreHorizontal size={18} />
      </button>

      {/* Dropdown Menu using Portal for robust positioning */}
      {isMenuOpen && renderPortal(
        <div 
          ref={menuRef}
          style={{ 
            position: 'absolute', 
            top: menuPosition.top, 
            left: menuPosition.left,
            zIndex: 100 
          }}
          className="w-48 glass-card bg-slate-900 border border-white/10 !p-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <button 
            onClick={() => { setIsInfoOpen(true); setIsMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Info size={16} className="text-blue-400" />
            Ver Información
          </button>
          <button 
            onClick={() => { setIsEditOpen(true); setIsMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Edit2 size={16} className="text-violet-400" />
            Editar Contacto
          </button>
          <div className="h-px bg-white/5 my-1" />
          <button 
            onClick={() => { setIsDeleteOpen(true); setIsMenuOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      )}

      {/* Info Modal */}
      {isInfoOpen && renderPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card bg-slate-900/95 border border-white/20 w-full max-w-md relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <button onClick={() => setIsInfoOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="text-blue-400" /> Detalle del Contacto
            </h3>
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <User size={18} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Nombre Completo</p>
                        <p className="text-slate-200">{lead.name || 'No proporcionado'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <Mail size={18} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Email</p>
                        <p className="text-slate-200">{lead.email}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <MapPin size={18} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Localidad</p>
                        <p className="text-slate-200">{lead.city || 'No especificada'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <Calendar size={18} className="text-slate-500 mt-1" />
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Fecha de Registro</p>
                        <p className="text-slate-200"><FormattedDate date={lead.createdAt} /></p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <Fingerprint size={18} className="text-slate-500 mt-1" />
                    <div className="overflow-hidden">
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">ID Interno</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{lead.id}</p>
                    </div>
                </div>
                <div className="mt-4 p-3 rounded-xl border bg-emerald-500/5 border-emerald-500/20 text-center">
                    <p className="text-xs text-emerald-400 font-medium">
                        {lead.unsubscribedAt ? `Baja el ${new Date(lead.unsubscribedAt).toLocaleDateString()}` : 'Suscriptor Activo'}
                    </p>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && renderPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card bg-slate-900/95 border border-white/20 w-full max-w-md relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <button onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6">Editar Contacto</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Localidad</label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white"
                />
              </div>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteOpen && renderPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card bg-slate-900 border border-white/20 w-full max-w-sm relative animate-in zoom-in-95 duration-300 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto mb-4">
                <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">¿Eliminar contacto?</h3>
            <p className="text-sm text-slate-400 mb-6">
                Esta acción borrará a **{lead.email}** de tu audiencia. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={() => setIsDeleteOpen(false)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Eliminar"}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

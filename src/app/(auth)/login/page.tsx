"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, ChevronRight, Github, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden shadow-2xl">
      {/* Decorative Blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-xl mb-4 shadow-xl shadow-violet-600/20">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MarketMail</h1>
          <p className="text-slate-400 mt-2">Bienvenido de nuevo. Ingresa tus datos.</p>
        </div>

        <div className="glass-card p-8 border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email" 
                  placeholder="admin@carniapp.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Contraseña</label>
                <button type="button" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  placeholder="password123"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-white placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold h-12 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Entrar
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs font-medium uppercase text-slate-600">
              <span className="bg-[#0c0c0e] px-4">O continúa con</span>
            </div>
          </div>

            <button className="w-full glass py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-[0.98] text-sm font-medium">
            <Github size={20} />
            Acceder con GitHub
          </button>

          <div className="mt-6 p-4 rounded-xl bg-violet-600/5 border border-violet-600/10 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Acceso para Raul</p>
            <p className="text-xs text-slate-400">admin@carniapp.com / password123</p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          ¿No tienes una cuenta? <Link href="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">Empieza gratis ahora</Link>
        </p>
      </div>
    </div>
  );
}


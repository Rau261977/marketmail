"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  Mail, 
  Layers, 
  Settings, 
  Send,
  Plus
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: BarChart3, label: "Panel Principal", href: "/" },
  { icon: Users, label: "Audiencia", href: "/audience" },
  { icon: Mail, label: "Plantillas", href: "/templates" },
  { icon: Send, label: "Campañas", href: "/campaigns" },
  { icon: Layers, label: "Automatización", href: "/automation" },
  { icon: Settings, label: "Ajustes", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass border-r border-white/5 h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold gradient-text">CarniApp</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-violet-600/20 text-violet-400" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-violet-400" : "group-hover:text-slate-200")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 px-4 font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={20} />
          Nueva Campaña
        </button>
      </div>
    </aside>
  );
}

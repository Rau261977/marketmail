import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  href?: string;
}

export function MetricCard({ label, value, change, positive, icon: Icon, href }: MetricCardProps) {
  const content = (
    <div className="glass-card flex flex-col gap-4 h-full hover:bg-white/5 transition-all cursor-pointer group active:scale-[0.98]">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-violet-500/30 transition-colors">
          <Icon size={24} className="text-violet-400" />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          }`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-bold mt-1 group-hover:text-violet-400 transition-colors">{value}</h3>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block no-underline">{content}</Link>;
  }

  return content;
}

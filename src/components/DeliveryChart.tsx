"use client";

import React from 'react';
import { Send, CheckCircle2, Eye, AlertCircle, TrendingUp } from 'lucide-react';

interface ChartData {
  date: string;
  sent: number;
  opened: number;
  delivered?: number;
  bounced?: number;
}

interface DeliveryChartProps {
  data: ChartData[];
}

export function DeliveryChart({ data }: DeliveryChartProps) {
  return (
    <div className="w-full h-full flex flex-col pt-2">
      {/* Performance Grid Area - High resolution of information */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {data.map((day, i) => {
          const openRate = day.sent > 0 ? Math.round((day.opened / day.sent) * 100) : 0;
          const bounced = day.bounced || 0;
          
          return (
            <div 
              key={i} 
              className={`flex flex-col rounded-2xl border transition-all duration-300 ${
                day.sent > 0 
                ? 'bg-white/[0.04] border-white/10 shadow-lg' 
                : 'bg-transparent border-white/5 opacity-50'
              }`}
            >
              {/* Header */}
              <div className="py-3 px-4 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day.date}</span>
                {day.sent > 0 && (
                  <div className={`w-2 h-2 rounded-full ${openRate >= 50 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                )}
              </div>
              
              {/* Stats Body */}
              <div className="p-4 space-y-4 flex flex-col items-center text-center">
                {/* Sent */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Send size={12} />
                    <span className="text-[10px] uppercase font-semibold">Enviados</span>
                  </div>
                  <span className="text-xl font-mono font-bold text-white tracking-tight">{day.sent}</span>
                </div>
                
                {/* Delivered */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-blue-500/70 mb-1">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] uppercase font-semibold">Entregados</span>
                  </div>
                  <span className="text-lg font-mono text-blue-400/90">{day.delivered || 0}</span>
                </div>

                {/* Opened */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-violet-500/70 mb-1">
                    <Eye size={12} />
                    <span className="text-[10px] uppercase font-semibold text-violet-400/70">Abiertos</span>
                  </div>
                  <span className="text-lg font-mono text-violet-400 font-bold">{day.opened}</span>
                </div>

                {/* Bounced */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 text-rose-500/70 mb-1">
                    <AlertCircle size={12} />
                    <span className="text-[10px] uppercase font-semibold text-rose-400/70">Rebotados</span>
                  </div>
                  <span className="text-lg font-mono text-rose-400/80">{bounced}</span>
                </div>

                {/* Open Rate Badge - Even Bigger and Centered */}
                <div className={`mt-4 w-full py-4 px-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                  openRate >= 50 
                  ? 'text-emerald-400' 
                  : 'text-slate-500'
                }`}>
                  <span className="text-[11px] uppercase font-extrabold tracking-tighter opacity-80">Efectividad</span>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={16} />
                    <span className="text-2xl font-black">{openRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Info Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-slate-500 text-[11px]">
        <p>Datos basados en los eventos de seguimiento de las últimas 24 horas por día.</p>
        <div className="flex gap-4 uppercase tracking-tighter font-semibold">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ideal (+50%)</span>
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Revisar</span>
        </div>
      </div>
    </div>
  );
}

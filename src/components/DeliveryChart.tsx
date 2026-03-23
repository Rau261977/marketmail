"use client";

import React from 'react';

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
  const maxVal = Math.max(...data.map(d => Math.max(d.sent, d.opened, d.delivered || 0, 10)));
  
  return (
    <div className="w-full h-full flex flex-col pt-4">
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-4 px-2 pb-6">
        {data.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
            <div className="w-full flex justify-center gap-1 items-end h-full">
              {/* Sent Bar */}
              <div 
                className="w-2 sm:w-4 rounded-t-sm bg-violet-500/20 relative group-hover:bg-violet-500/40 transition-all duration-500 ease-out"
                style={{ height: `${Math.max((day.sent / maxVal) * 100, 2)}%` }}
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[10px] text-slate-300 bg-slate-900/90 px-2 py-1 rounded pointer-events-none z-20 border border-white/10 shadow-xl">
                  <div className="flex flex-col gap-1">
                    <span className="text-violet-300">Enviados: {day.sent}</span>
                    <span className="text-blue-300">Entregados: {day.delivered || 0}</span>
                    <span className="text-emerald-300 font-bold">Abiertos: {day.opened}</span>
                    {(day.bounced || 0) > 0 && <span className="text-rose-400">Rebotados: {day.bounced}</span>}
                  </div>
                </div>
              </div>
              
              {/* Delivered Bar (New) */}
              <div 
                className="w-2 sm:w-4 rounded-t-sm bg-blue-500/40 relative group-hover:bg-blue-500/60 transition-all duration-500 ease-out delay-75"
                style={{ height: `${Math.max(((day.delivered || 0) / maxVal) * 100, 2)}%` }}
              />

              {/* Opened Bar */}
              <div 
                className="w-2 sm:w-4 rounded-t-sm bg-violet-400 relative group-hover:bg-violet-300 transition-all duration-500 ease-out delay-150 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]"
                style={{ height: `${Math.max((day.opened / maxVal) * 100, 2)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-2">{day.date}</span>
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-4 border-t border-white/5 bg-white/[0.01] rounded-b-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-violet-500/20" />
          <span className="text-[11px] text-slate-400 font-medium">Enviados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/40" />
          <span className="text-[11px] text-slate-400 font-medium">Entregados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-violet-400" />
          <span className="text-[11px] text-slate-400 font-medium">Abiertos</span>
        </div>
      </div>
    </div>
  );
}

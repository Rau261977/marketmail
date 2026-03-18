'use client';

import { useEffect, useState } from 'react';

interface TimeAgoProps {
  date: string | Date;
  className?: string;
}

export default function TimeAgo({ date, className }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const update = () => {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const seconds = Math.floor(diffMs / 1000);
      
      if (seconds < 60) {
        setTimeAgo("hace unos segundos");
      } else {
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
          setTimeAgo(`hace ${minutes} minuto${minutes > 1 ? 's' : ''}`);
        } else {
          const hours = Math.floor(minutes / 60);
          if (hours < 24) {
            setTimeAgo(`hace ${hours} hora${hours > 1 ? 's' : ''}`);
          } else {
            const days = Math.floor(hours / 24);
            setTimeAgo(`hace ${days} día${days > 1 ? 's' : ''}`);
          }
        }
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [date]);

  if (!mounted) return <span className={className}>...</span>;

  return <span className={className}>{timeAgo}</span>;
}

'use client';

import { useEffect, useState } from 'react';

interface FormattedDateProps {
  date: string | Date | null | undefined;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
  placeholder?: string;
}

export default function FormattedDate({ 
  date, 
  options = {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }, 
  className,
  placeholder = ''
}: FormattedDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !date) return <span className={className}>{!date ? placeholder : ''}</span>;

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return (
      <span className={className}>
        {d.toLocaleString('es-ES', options)}
      </span>
    );
  } catch (e) {
    return <span className={className}>{placeholder}</span>;
  }
}

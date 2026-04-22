import React, { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

interface MaskedDateInputProps {
  value: string; // format: yyyy-mm-dd
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export function MaskedDateInput({ value, onChange, className = '', placeholder = 'DD/MM/AAAA' }: MaskedDateInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setDisplayValue(`${parts[2]}/${parts[1]}/${parts[0]}`);
      } else {
        setDisplayValue(value);
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    if (val.length > 4) {
      formatted = `${formatted.slice(0, 5)}/${val.slice(4)}`;
    }
    
    setDisplayValue(formatted);
    
    if (val.length === 8) {
      const day = val.slice(0, 2);
      const month = val.slice(2, 4);
      const year = val.slice(4, 8);
      onChange(`${year}-${month}-${day}`);
    } else if (val.length === 0) {
      onChange('');
    }
  };

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value; // yyyy-mm-dd
    onChange(newVal);
  };

  return (
    <div className={`relative flex items-center ${className} p-0 bg-transparent border-0 ring-0 h-auto overflow-visible`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-full px-4 py-3 bg-nt-paper border border-nt-border rounded-xl md:rounded-lg sm:py-2 focus:border-nt-primary focus:outline-none focus:ring-1 focus:ring-nt-primary transition-all text-sm font-medium pr-10"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-nt-primary cursor-pointer w-5 h-5 overflow-hidden">
        <Calendar className="w-5 h-5 absolute inset-0 pointer-events-none" />
        <input 
            type="date" 
            value={value || ''} 
            onChange={handleNativeChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-[2.0]"
        />
      </div>
    </div>
  );
}

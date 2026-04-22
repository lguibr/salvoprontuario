import React, { useState } from 'react';
import { generateSessions } from '../lib/dateUtils';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { MaskedDateInput } from './MaskedDateInput';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export function SessionGenerator({ onGenerate }: { onGenerate: (timestamps: number[]) => void }) {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [sessionCount, setSessionCount] = useState<number>(5);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleGenerate = () => {
    if (selectedDays.length === 0) {
      alert('Selecione pelo menos um dia da semana.');
      return;
    }
    const timestamps = generateSessions(startDate, time, selectedDays, sessionCount);
    onGenerate(timestamps);
  };

  return (
    <div className="bg-nt-paper p-6 rounded-xl border border-nt-border shadow-card mb-8">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-nt-text">Gerar agenda de consultas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">A partir de</label>
          <MaskedDateInput 
            value={startDate} 
            onChange={val => setStartDate(val)}
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Horário</label>
          <input 
            type="time" 
            value={time} 
            onChange={e => setTime(e.target.value)}
            className="w-full bg-nt-paper border border-nt-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-nt-primary focus:border-nt-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Qtd. Sessões</label>
          <input 
            type="number" 
            min="1"
            max="50"
            value={sessionCount} 
            onChange={e => setSessionCount(parseInt(e.target.value))}
            className="w-full bg-nt-paper border border-nt-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-nt-primary focus:border-nt-primary transition-colors"
          />
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-2">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dias da semana</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => (
                 <button
                 key={day.value}
                 onClick={() => toggleDay(day.value)}
                 className={cn(
                   "w-8 h-8 flex items-center justify-center rounded text-[10px] font-bold transition-all",
                   selectedDays.includes(day.value) 
                     ? "bg-nt-primary text-white shadow-sm" 
                     : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                 )}
               >
                 {day.label[0]}
               </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-nt-border-light">
          <button 
            onClick={handleGenerate}
            disabled={selectedDays.length === 0}
            className="w-full sm:w-auto bg-nt-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Gerar Datas
          </button>
      </div>
    </div>
  );
}

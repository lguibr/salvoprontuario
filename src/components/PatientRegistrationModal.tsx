import React, { useState } from 'react';
import { Patient } from '../types';
import { User, Calendar, Clock, X, Check, Loader2 } from 'lucide-react';
import { MaskedDateInput } from './MaskedDateInput';

interface PatientRegistrationModalProps {
  onClose: () => void;
  onSave: (details: Partial<Patient> & { name: string }, timestamps: number[]) => void;
}

export function PatientRegistrationModal({ onClose, onSave }: PatientRegistrationModalProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [startDateStr, setStartDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [sessionTime, setSessionTime] = useState('08:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [complaint, setComplaint] = useState('');
  const [plan, setPlan] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (dayIndex: number) => {
    if (daysOfWeek.includes(dayIndex)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== dayIndex));
    } else {
      setDaysOfWeek([...daysOfWeek, dayIndex]);
    }
  };

  const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const handleSave = () => {
    if (!name.trim()) return alert("Insira o nome do paciente.");
    setIsSaving(true);
    
    // Calculate sessions
    const timestamps: number[] = [];
    if (daysOfWeek.length > 0 && startDateStr && sessionTime) {
      const [year, month, day] = startDateStr.split('-').map(Number);
      const start = new Date(year, month - 1, day);
      const [hours, mins] = sessionTime.split(':').map(Number);
      
      const endMidnight = new Date();
      endMidnight.setHours(23, 59, 59, 999);
      
      let current = new Date(start);
      let safetyCount = 0;
      
      while (current <= endMidnight && safetyCount < 300) {
        if (daysOfWeek.includes(current.getDay())) {
          const sDate = new Date(current);
          sDate.setHours(hours, mins, 0, 0);
          timestamps.push(sDate.getTime());
          safetyCount++;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    // Convert days array to human readable string
    const mapDay = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    let scheduleInfo = '';
    if (daysOfWeek.length > 0) {
      const dayNames = daysOfWeek.map(d => mapDay[d]).join(' e ');
      scheduleInfo = `${dayNames} às ${sessionTime}`;
    }

    onSave({
      name,
      birthDate,
      startDate: startDateStr,
      endDate: new Date().toISOString().split('T')[0],
      sessionDays: daysOfWeek,
      sessionTime,
      scheduleInfo,
      complaint,
      therapeuticPlan: plan
    }, timestamps);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-nt-bg w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-nt-border bg-nt-paper rounded-t-2xl flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold font-serif flex items-center gap-2 text-nt-text">
            <User className="w-5 h-5 text-nt-primary" />
            Novo Paciente
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto w-full flex flex-col gap-6 font-sans text-nt-text">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Nome Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Valquíria Carla de Sena Pereira"
                className="w-full px-4 py-3 bg-nt-paper border border-nt-border rounded-xl focus:border-nt-primary focus:outline-none focus:ring-1 focus:ring-nt-primary transition-all text-sm font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Data de Nascimento</label>
              <MaskedDateInput 
                value={birthDate}
                onChange={val => setBirthDate(val)}
              />
            </div>
          </div>

          <div className="bg-nt-paper border border-nt-border p-5 rounded-xl space-y-4">
            <h3 className="text-xs uppercase font-bold text-gray-600 tracking-widest flex items-center gap-2 border-b border-nt-border pb-3">
              <Calendar className="w-4 h-4 opacity-50" />
              Sessões & Recorrência
            </h3>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              O sistema gerará automaticamente todas as sessões passadas a partir da <strong className="text-nt-text">Data Inicial</strong> até a data de hoje, seguindo os dias e horário combinados.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Data Inicial do Acompanhamento</label>
                <MaskedDateInput 
                  value={startDateStr}
                  onChange={val => setStartDateStr(val)}
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horário Fixo (24h)
                </label>
                <select 
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  className="w-full px-4 py-3 bg-nt-paper border border-nt-border rounded-lg focus:border-nt-primary focus:outline-none text-sm appearance-none cursor-pointer"
                >
                  {Array.from({length: 48}).map((_, i) => {
                    const h = Math.floor(i / 2).toString().padStart(2, '0');
                    const m = (i % 2 === 0) ? '00' : '30';
                    return <option key={`${h}:${m}`} value={`${h}:${m}`}>{h}:{m}</option>;
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3">Dias da Semana</label>
              <div className="flex gap-2 justify-between max-w-sm">
                {dayLabels.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`w-10 h-10 rounded-full border text-xs font-bold transition-all ${daysOfWeek.includes(idx) ? 'bg-nt-primary text-white border-nt-primary shadow-sm' : 'bg-nt-paper text-gray-500 border-nt-border hover:bg-gray-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Demanda / Queixa (Opcional)</label>
                <textarea 
                  value={complaint}
                  onChange={e => setComplaint(e.target.value)}
                  placeholder="Resumo do caso..."
                  className="w-full p-4 bg-nt-paper border border-nt-border rounded-xl resize-none min-h-[100px] text-sm focus:border-nt-primary focus:outline-none transition-colors"
                />
             </div>
             <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">Plano Terapêutico (Opcional)</label>
                <textarea 
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  placeholder="Estratégias de tratamento..."
                  className="w-full p-4 bg-nt-paper border border-nt-border rounded-xl resize-none min-h-[100px] text-sm focus:border-nt-primary focus:outline-none transition-colors"
                />
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-nt-border bg-nt-paper rounded-b-2xl flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-nt-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Cadastrar Paciente
          </button>
        </div>
      </div>
    </div>
  );
}

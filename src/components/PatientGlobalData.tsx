import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wand2, Loader2, Send } from 'lucide-react';
import { Patient } from '../types';
import { MaskedDateInput } from './MaskedDateInput';

interface PatientGlobalDataProps {
  patient: Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  onElaborateField: (field: 'complaint' | 'plan') => void;
  onRefineField: (field: 'complaint' | 'plan', prompt: string) => Promise<void>;
  isElaboratingComplaint: boolean;
  isElaboratingPlan: boolean;
  isRefiningComplaint: boolean;
  isRefiningPlan: boolean;
}

export function PatientGlobalData({
  patient,
  updatePatient,
  onElaborateField,
  onRefineField,
  isElaboratingComplaint,
  isElaboratingPlan,
  isRefiningComplaint,
  isRefiningPlan
}: PatientGlobalDataProps) {
  const [showGlobalData, setShowGlobalData] = useState(false);
  const [complaintChat, setComplaintChat] = useState('');
  const [planChat, setPlanChat] = useState('');

  const handleRefineComplaint = async () => {
    if (!complaintChat.trim()) return;
    await onRefineField('complaint', complaintChat);
    setComplaintChat('');
  };

  const handleRefinePlan = async () => {
    if (!planChat.trim()) return;
    await onRefineField('plan', planChat);
    setPlanChat('');
  };

  return (
    <div className="bg-nt-paper rounded-2xl border border-nt-border shadow-sm overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setShowGlobalData(!showGlobalData)}
        className="w-full px-4 sm:px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-bold flex items-center gap-2 text-nt-text">
          Detalhes Globais do Prontuário
        </h3>
        {showGlobalData ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      
      {showGlobalData && (
        <div className="p-4 sm:p-6 pt-0 border-t border-nt-border bg-nt-paper/30 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Data Nasc.</label>
              <MaskedDateInput 
                value={patient.birthDate || ''}
                onChange={val => updatePatient(patient.id, { birthDate: val })}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Início</label>
              <MaskedDateInput 
                value={patient.startDate || ''}
                onChange={val => updatePatient(patient.id, { startDate: val })}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Término/Alta</label>
              <MaskedDateInput 
                value={patient.endDate || ''}
                onChange={val => updatePatient(patient.id, { endDate: val })}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Horário</label>
              <input 
                type="text" 
                placeholder="Ex: segundas 11:30" 
                value={patient.scheduleInfo || ''}
                onChange={e => updatePatient(patient.id, { scheduleInfo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-nt-border rounded-lg bg-nt-paper focus:outline-none focus:border-nt-primary"
              />
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">1. Demanda/Queixa</label>
              <button 
                onClick={() => onElaborateField('complaint')}
                disabled={isElaboratingComplaint}
                className="text-xs flex items-center gap-1 font-bold text-nt-primary hover:text-[#7f947f] transition-colors disabled:opacity-50"
                title="Estruturar texto com IA"
              >
                {isElaboratingComplaint ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                <span className="hidden sm:inline">Processar com IA</span>
                <span className="sm:hidden">IA</span>
              </button>
            </div>
            <textarea 
              value={patient.complaint || ''}
              onChange={e => updatePatient(patient.id, { complaint: e.target.value })}
              placeholder="Resumo da demanda e queixa inicial..."
              className="w-full px-3 py-2 text-sm border border-nt-border rounded-t-lg bg-nt-paper min-h-[120px] resize-none focus:outline-none focus:border-nt-primary"
            />
            <div className="flex border border-t-0 border-nt-border rounded-b-lg bg-[#f0f2en] focus-within:ring-1 focus-within:ring-nt-primary overflow-hidden">
              <input 
                type="text"
                className="w-full bg-[#f8f9f6] text-xs px-3 py-2 focus:outline-none placeholder-gray-400"
                placeholder="Ex: deixe mais formal..."
                value={complaintChat}
                onChange={e => setComplaintChat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRefineComplaint()}
              />
              <button 
                onClick={handleRefineComplaint}
                disabled={isRefiningComplaint || !complaintChat.trim()}
                className="px-4 bg-nt-active text-nt-primary font-bold hover:bg-[#d0d6c8] transition-colors disabled:opacity-50"
              >
                {isRefiningComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="col-span-1 md:col-span-2 flex flex-col gap-1 mt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">2. Plano Terapêutico</label>
              <button 
                onClick={() => onElaborateField('plan')}
                disabled={isElaboratingPlan}
                className="text-xs flex items-center gap-1 font-bold text-nt-primary hover:text-[#7f947f] transition-colors disabled:opacity-50"
                title="Estruturar plano baseado no rascunho, queixa e evoluções"
              >
                {isElaboratingPlan ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                <span className="hidden sm:inline">Unir com IA</span>
                <span className="sm:hidden">IA</span>
              </button>
            </div>
            <textarea 
              value={patient.therapeuticPlan || ''}
              onChange={e => updatePatient(patient.id, { therapeuticPlan: e.target.value })}
              placeholder="Rascunho do plano de tratamento..."
              className="w-full px-3 py-2 text-sm border border-nt-border rounded-t-lg bg-nt-paper min-h-[120px] resize-none focus:outline-none focus:border-nt-primary"
            />
            <div className="flex border border-t-0 border-nt-border rounded-b-lg bg-[#f0f2en] focus-within:ring-1 focus-within:ring-nt-primary overflow-hidden">
              <input 
                type="text"
                className="w-full bg-[#f8f9f6] text-xs px-3 py-2 focus:outline-none placeholder-gray-400"
                placeholder="Ex: adicione fluoxetina ao plano..."
                value={planChat}
                onChange={e => setPlanChat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRefinePlan()}
              />
              <button 
                onClick={handleRefinePlan}
                disabled={isRefiningPlan || !planChat.trim()}
                className="px-4 bg-nt-active text-nt-primary font-bold hover:bg-[#d0d6c8] transition-colors disabled:opacity-50"
              >
                {isRefiningPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

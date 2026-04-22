import React from 'react';
import { Eye, X, FileText } from 'lucide-react';
import { Patient, Session } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientPreviewModalProps {
  patient: Patient;
  sessions: Session[];
  stampImage: string | null;
  psychologistName: string;
  onClose: () => void;
  onExportDoc: () => void;
}

export function PatientPreviewModal({ patient, sessions, stampImage, psychologistName, onClose, onExportDoc }: PatientPreviewModalProps) {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-0 sm:p-4 print:hidden backdrop-blur-sm">
      <div className="bg-nt-paper w-full h-full sm:h-auto sm:max-w-4xl sm:rounded-2xl shadow-2xl border-0 sm:border border-nt-border overflow-hidden flex flex-col max-h-screen sm:max-h-[90vh]">
        <div className="p-4 sm:p-5 border-b border-nt-border flex justify-between items-center bg-nt-paper shrink-0">
          <h3 className="font-bold text-nt-text flex items-center gap-2">
            <Eye className="w-5 h-5 text-nt-primary" /> Visualizar Prontuário Final
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-serif text-black leading-relaxed max-w-full">
          <h1 className="text-lg sm:text-xl font-bold text-center mb-8 uppercase">Prontuário Psicológico</h1>

          <div className="text-sm space-y-1 mb-8">
            <p><strong>Paciente:</strong> {patient.name}</p>
            {patient.scheduleInfo && <p><strong>Sessões:</strong> {patient.scheduleInfo}</p>}
            {patient.birthDate && <p><strong>Data de nascimento:</strong> {patient.birthDate}</p>}
            {sessions.length > 0 && <p><strong>Data da primeira sessão:</strong> {format(sessions[0].datetime, "dd/MM/yy")}</p>}
          </div>

          <div className="text-sm mb-6">
            <p className="font-bold mb-1">1. Demanda/queixa:</p>
            <p className="whitespace-pre-wrap">{patient.complaint || "Não preenchido."}</p>
          </div>

          <div className="text-sm mb-10">
            <p className="font-bold mb-1">2. Plano Terapêutico:</p>
            <p className="whitespace-pre-wrap">{patient.therapeuticPlan || "Não preenchido."}</p>
          </div>

          <div className="text-sm space-y-6">
            {sessions.filter(s => s.status === 'completed' && s.clinicalText).map((s, i) => (
              <div key={s.id} className="break-inside-avoid">
                <p className="font-bold uppercase mb-1 text-xs">EVOLUÇÃO {i+1} ({format(s.datetime, 'dd/MM/yy')})</p>
                <p className="whitespace-pre-wrap">{s.clinicalText}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-right text-sm">
            {psychologistName && <p className="font-bold">{psychologistName}</p>}
            <p>Belo Horizonte, Minas Gerais Brasil {format(new Date(), "dd/MM/yy", { locale: ptBR })}</p>
          </div>

          {stampImage && (
            <div className="mt-4 flex justify-end">
              <img src={stampImage} alt="Carimbo" className="max-h-[100px] sm:max-h-[120px] object-contain" />
            </div>
          )}
        </div>
        
        <div className="p-4 sm:p-5 border-t border-nt-border flex justify-end gap-3 bg-gray-50 shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors"
          >
            Fechar
          </button>
          <button 
            onClick={onExportDoc} 
            className="px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-nt-primary text-white rounded-lg hover:bg-[#4a5d4e] shadow-sm transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Exportar .DOC
          </button>
        </div>
      </div>
    </div>
  );
}

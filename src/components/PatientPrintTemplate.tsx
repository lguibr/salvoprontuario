import React from 'react';
import { Patient, Session } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientPrintTemplateProps {
  patient: Patient;
  sessions: Session[];
}

export function PatientPrintTemplate({ patient, sessions }: PatientPrintTemplateProps) {
  return (
    <div className="hidden print:block p-8 font-serif text-black max-w-[21cm] mx-auto bg-white min-h-screen">
      <h1 className="text-xl font-bold text-center mb-10">PRONTUÁRIO PSICOLÓGICO</h1>

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
            <p className="font-bold uppercase mb-1">EVOLUÇÃO {i+1} ({format(s.datetime, 'dd/MM/yy')})</p>
            <p className="whitespace-pre-wrap">{s.clinicalText}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-right text-sm">
        <p>Belo Horizonte, {format(new Date(), "dd/MM/yy", { locale: ptBR })}.</p>
      </div>
    </div>
  );
}

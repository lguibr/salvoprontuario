import React, { useState } from 'react';
import { usePatients } from '../hooks/usePatients';
import { SessionCard } from './SessionCard';
import { SessionGenerator } from './SessionGenerator';
import { PatientChat } from './PatientChat';
import { elaboratePatientField, refinePatientField } from '../lib/gemini';
import { Calendar as CalendarIcon, Clock, Trash2 } from 'lucide-react';
import { Patient } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { PatientHeader } from './PatientHeader';
import { PatientGlobalData } from './PatientGlobalData';
import { PatientSettingsModal } from './PatientSettingsModal';
import { PatientPreviewModal } from './PatientPreviewModal';
import { PatientPrintTemplate } from './PatientPrintTemplate';

interface PatientViewProps {
  patient: Patient;
  onBack: () => void;
  hooks: ReturnType<typeof usePatients>;
}

export function PatientView({ patient, onBack, hooks }: PatientViewProps) {
  const { getSessionsForPatient, addMultipleSessions, updateSession, updatePatient, deletePatient, systemPrompt, updateSystemPrompt, complaintPrompt, planPrompt, updateComplaintPrompt, updatePlanPrompt, stampImage, updateStampImage, deleteAllSessions, psychologistName, updatePsychologistName } = hooks;
  const sessions = getSessionsForPatient(patient.id);
  const [chatOpen, setChatOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);
  const [tempComplaintPrompt, setTempComplaintPrompt] = useState(complaintPrompt);
  const [tempPlanPrompt, setTempPlanPrompt] = useState(planPrompt);

  const [isElaboratingComplaint, setIsElaboratingComplaint] = useState(false);
  const [isElaboratingPlan, setIsElaboratingPlan] = useState(false);
  const [isRefiningComplaint, setIsRefiningComplaint] = useState(false);
  const [isRefiningPlan, setIsRefiningPlan] = useState(false);

  const handleElaborateField = async (field: 'complaint' | 'plan') => {
    const currentText = field === 'complaint' ? patient.complaint : patient.therapeuticPlan;
    if (!currentText || currentText.trim().length < 10) {
      alert("Escreva um rascunho um pouco maior para a IA melhorar.");
      return;
    }
    
    if (field === 'complaint') setIsElaboratingComplaint(true);
    else setIsElaboratingPlan(true);

    try {
      const extraCtx = field === 'plan' ? patient.complaint : undefined;
      const response = await elaboratePatientField(field, currentText, field === 'complaint' ? complaintPrompt : planPrompt, sessions, extraCtx);
      updatePatient(patient.id, { [field === 'complaint' ? 'complaint' : 'therapeuticPlan']: response });
    } catch (e) {
      alert("Erro ao elaborar texto."); 
      console.error(e);
    } finally {
      if (field === 'complaint') setIsElaboratingComplaint(false);
      else setIsElaboratingPlan(false);
    }
  };

  const handleRefineField = async (field: 'complaint' | 'plan', instruction: string) => {
    const currentText = field === 'complaint' ? patient.complaint : patient.therapeuticPlan;
    if (!instruction.trim() || !currentText) return;

    if (field === 'complaint') setIsRefiningComplaint(true);
    else setIsRefiningPlan(true);

    try {
      const extraCtx = field === 'plan' ? patient.complaint : undefined;
      const response = await refinePatientField(field, currentText, instruction, field === 'complaint' ? complaintPrompt : planPrompt, sessions, extraCtx);
      updatePatient(patient.id, { [field === 'complaint' ? 'complaint' : 'therapeuticPlan']: response });
    } catch (e) {
      alert("Erro ao refinar texto.");
    } finally {
      if (field === 'complaint') setIsRefiningComplaint(false);
      else setIsRefiningPlan(false);
    }
  };

  const handleGenerateSessions = (timestamps: number[]) => {
    addMultipleSessions(patient.id, timestamps);
  };

  const handleExportDoc = () => {
    const completed = sessions.filter(s => s.status === 'completed' && s.clinicalText);
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Prontuário</title><style>body { font-family: Arial, sans-serif; }</style></head><body>";
    const footer = "</body></html>";
    let html = header;

    html += `<h1 style="text-align: center;">PRONTUÁRIO PSICOLÓGICO</h1><br/>`;
    html += `<p><strong>Paciente:</strong> ${patient.name}</p>`;
    if (patient.scheduleInfo) html += `<p><strong>Sessões:</strong> ${patient.scheduleInfo}</p>`;
    if (patient.birthDate) html += `<p><strong>Data de Nascimento:</strong> ${patient.birthDate}</p>`;
    if (patient.startDate) html += `<p><strong>Data Inicial:</strong> ${patient.startDate}</p>`;
    if (patient.endDate) html += `<p><strong>Data de Término:</strong> ${patient.endDate}</p>`;
    html += `<br/>`;

    html += `<h3>1. Demanda/Queixa:</h3>`;
    html += `<p>${(patient.complaint || 'Não preenchido.').replace(/\\n/g, '<br/>')}</p><br/>`;

    html += `<h3>2. Plano Terapêutico:</h3>`;
    html += `<p>${(patient.therapeuticPlan || 'Não preenchido.').replace(/\\n/g, '<br/>')}</p><br/>`;

    completed.forEach((s, idx) => {
       html += `<h3>EVOLUÇÃO ${idx + 1} (${format(s.datetime, 'dd/MM/yy')})</h3>`;
       html += `<p>${s.clinicalText.replace(/\\n/g, '<br/>')}</p><br/>`;
    });

    html += `<div style="text-align: right; margin-top: 40px; font-size: 14px;">`;
    if (psychologistName) html += `<strong>${psychologistName}</strong><br/>`;
    html += `Belo Horizonte, Minas Gerais Brasil ${format(new Date(), "dd/MM/yy", { locale: ptBR })}<br/>`;
    html += `</div>`;

    if (stampImage) {
      html += `<div style="text-align: right; margin-top: 20px;">
                 <img src="${stampImage}" style="max-height: 100px; max-width: 250px;" />
               </div>`;
    }

    html += footer;
    
    const blob = new Blob(['\\ufeff', html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Prontuario_${patient.name.replace(/\\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyAll = async () => {
    const completed = sessions.filter(s => s.status === 'completed' && s.clinicalText);
    if (!completed.length) return alert('Não há evoluções finalizadas para copiar.');
    
    let text = `PRONTUÁRIO PSICOLÓGICO\\n\\n`;
    text += `Paciente: ${patient.name}\\n`;
    if (patient.scheduleInfo) text += `Sessões: ${patient.scheduleInfo}\\n`;
    if (patient.birthDate) text += `Data de nascimento: ${patient.birthDate}\\n`;
    if (sessions.length > 0) text += `Data da primeira sessão: ${format(sessions[0].datetime, "dd/MM/yy")}\\n`;
    text += `\\n`;
    
    text += `1. Demanda/queixa:\\n`;
    text += `${patient.complaint || 'Não preenchido.'}\\n\\n`;
    
    text += `2. Plano Terapêutico:\\n`;
    text += `${patient.therapeuticPlan || 'Não preenchido.'}\\n\\n`;
    
    completed.forEach((s, idx) => {
       text += `EVOLUÇÃO ${idx + 1} (${format(s.datetime, 'dd/MM/yy')})\\n`;
       text += `${s.clinicalText}\\n\\n`;
    });
    
    text += `\\n`;
    if (psychologistName) text += `${psychologistName}\\n`;
    text += `Belo Horizonte, Minas Gerais Brasil ${format(new Date(), "dd/MM/yy", { locale: ptBR })}`;

    try {
      await navigator.clipboard.writeText(text);
      alert('Prontuário copiado com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao copiar prontuário.');
    }
  };

  const handleSavePrompt = () => {
    updateSystemPrompt(tempPrompt);
    updateComplaintPrompt(tempComplaintPrompt);
    updatePlanPrompt(tempPlanPrompt);
    setShowSettings(false);
  };

  const handleDeletePatient = () => {
    if (confirm("Tem certeza que deseja excluir DEFINITIVAMENTE este paciente e TODAS as suas evoluções?")) {
      deletePatient(patient.id);
      onBack();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-nt-bg overflow-hidden relative print:bg-white print:h-auto print:overflow-visible">
      
      <PatientHeader 
        patient={patient}
        onBack={onBack}
        onShowSettings={() => setShowSettings(true)}
        onShowPreview={() => setShowPreviewModal(true)}
        onCopyAll={handleCopyAll}
        onExportDoc={handleExportDoc}
        onToggleChat={() => setChatOpen(!chatOpen)}
        chatOpen={chatOpen}
        onDeletePatient={handleDeletePatient}
        updatePatient={updatePatient}
      />

      {showSettings && (
        <PatientSettingsModal 
          onClose={() => setShowSettings(false)}
          onSave={handleSavePrompt}
          tempPrompt={tempPrompt}
          setTempPrompt={setTempPrompt}
          tempComplaintPrompt={tempComplaintPrompt}
          setTempComplaintPrompt={setTempComplaintPrompt}
          tempPlanPrompt={tempPlanPrompt}
          setTempPlanPrompt={setTempPlanPrompt}
          stampImage={stampImage}
          updateStampImage={updateStampImage}
          psychologistName={psychologistName}
          setPsychologistName={updatePsychologistName}
        />
      )}

      {showPreviewModal && (
        <PatientPreviewModal 
          patient={patient}
          sessions={sessions}
          stampImage={stampImage}
          psychologistName={psychologistName}
          onClose={() => setShowPreviewModal(false)}
          onExportDoc={handleExportDoc}
        />
      )}

      <PatientPrintTemplate patient={patient} sessions={sessions} stampImage={stampImage} psychologistName={psychologistName} />

      <div className="flex-1 overflow-y-auto w-full scroll-hide relative print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-8 flex flex-col gap-6">

          <PatientGlobalData 
            patient={patient}
            updatePatient={updatePatient}
            onElaborateField={handleElaborateField}
            onRefineField={handleRefineField}
            isElaboratingComplaint={isElaboratingComplaint}
            isElaboratingPlan={isElaboratingPlan}
            isRefiningComplaint={isRefiningComplaint}
            isRefiningPlan={isRefiningPlan}
          />

          <div>
            <SessionGenerator onGenerate={handleGenerateSessions} />
          </div>

          <div className="mt-2">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-nt-text flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 opacity-40" /> 
                Sessões ({sessions.length})
              </h3>
              {sessions.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir TODAS as sessões deste paciente? Esta ação não pode ser desfeita.')) {
                      deleteAllSessions(patient.id);
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Excluir Todas
                </button>
              )}
            </div>
            
            {sessions.length === 0 ? (
              <div className="text-center py-12 bg-nt-paper border border-nt-border border-dashed rounded-2xl opacity-60">
                <Clock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h4 className="text-nt-text font-bold text-sm">Nenhuma sessão agendada</h4>
                <p className="text-gray-500 text-xs mt-1 px-4 text-center">Gere datas para começar a preencher os prontuários deste paciente.</p>
              </div>
            ) : (
              <div className="space-y-3 pb-8">
                {sessions.sort((a,b) => a.datetime - b.datetime).map(session => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onUpdate={(updates) => updateSession(session.id, updates)} 
                    hooks={hooks}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PatientChat 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        patient={patient} 
        sessions={sessions} 
        hooks={hooks} 
      />
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Patient, Session } from '../types';
import { usePatients } from '../hooks/usePatients';
import { chatPatientRecord } from '../lib/gemini';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface PatientChatProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  sessions: Session[];
  hooks: ReturnType<typeof usePatients>;
}

export function PatientChat({ isOpen, onClose, patient, sessions, hooks }: PatientChatProps) {
  const { addPatientMessage, bulkUpdateSessionTexts } = hooks;
  const [inputMsg, setInputMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [patient.globalChatHistory, isProcessing, isOpen]);

  const handleSend = async () => {
    if (!inputMsg.trim() || isProcessing) return;
    
    const userText = inputMsg;
    setInputMsg('');
    setIsProcessing(true);
    addPatientMessage(patient.id, { role: 'user', content: userText });

    try {
      const result = await chatPatientRecord(patient, sessions, userText);
      addPatientMessage(patient.id, { role: 'model', content: result.reply });
      
      if (result.updatedSessions && result.updatedSessions.length > 0) {
        bulkUpdateSessionTexts(result.updatedSessions);
        // Optional: you could add an automated system message notifying about the bulk update, 
        // but the model's 'reply' usually already mentions it.
      }
    } catch (e) {
      console.error(e);
      addPatientMessage(patient.id, { role: 'model', content: '⚠️ Ocorreu um erro ao processar. Tente novamente.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className={cn(
        "absolute top-0 right-0 h-full bg-nt-paper shadow-2xl border-l border-nt-border flex flex-col z-50 transition-transform duration-300 w-full sm:w-[420px]",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="p-5 border-b border-nt-border-light flex justify-between items-center bg-nt-paper shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-nt-primary" />
          <h3 className="font-bold text-nt-text">Visão Global do Paciente</h3>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 scroll-hide flex flex-col gap-4">
        {(!patient.globalChatHistory || patient.globalChatHistory.length === 0) && (
          <div className="text-center mt-10">
            <h4 className="font-bold text-nt-text mb-2">Converse com todo o prontuário</h4>
            <p className="text-xs text-gray-500 font-medium">Você pode pedir modificações que afetam todas as evoluções (ex: "simplifique os textos" ou "adicione que ele toma Ritalina 10mg").</p>
          </div>
        )}
        
        {patient.globalChatHistory?.map((m, i) => (
          <div key={i} className={cn("flex flex-col max-w-[85%]", m.role === 'user' ? "self-end" : "self-start")}>
             <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">{m.role === 'user' ? 'Você' : 'Assistente IA'}</span>
             <div className={cn(
               "p-3 rounded-2xl text-sm leading-relaxed",
               m.role === 'user' ? "bg-nt-primary text-white rounded-tr-sm" : "bg-nt-paper border border-nt-border text-nt-text shadow-sm rounded-tl-sm whitespace-pre-wrap"
             )}>
               {m.content}
             </div>
          </div>
        ))}
        {isProcessing && (
          <div className="self-start flex items-center p-3 rounded-2xl bg-nt-paper border border-nt-border text-nt-text shadow-sm rounded-tl-sm w-fit">
            <Loader2 className="w-4 h-4 animate-spin opacity-50 mr-2" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Analisando histórico...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-nt-paper border-t border-nt-border-light shrink-0">
        <div className="relative">
          <input 
            type="text" 
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isProcessing}
            placeholder="Pedir ajuste em lote... (Ex: Resuma os textos)"
            className="w-full bg-nt-bg border border-nt-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-nt-primary disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!inputMsg.trim() || isProcessing}
            className="absolute right-2 top-1.5 p-1.5 bg-nt-primary text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

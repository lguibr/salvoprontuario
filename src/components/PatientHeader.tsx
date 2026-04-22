import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Copy, Settings, Trash2, Edit2, Check, FileText, Eye } from 'lucide-react';
import { Patient } from '../types';

interface PatientHeaderProps {
  patient: Patient;
  onBack: () => void;
  onShowSettings: () => void;
  onShowPreview: () => void;
  onCopyAll: () => void;
  onExportDoc: () => void;
  onToggleChat: () => void;
  chatOpen: boolean;
  onDeletePatient: () => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
}

export function PatientHeader({
  patient,
  onBack,
  onShowSettings,
  onShowPreview,
  onCopyAll,
  onExportDoc,
  onToggleChat,
  chatOpen,
  onDeletePatient,
  updatePatient
}: PatientHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(patient.name);

  const handleSaveName = () => {
    if (editName.trim()) {
      updatePatient(patient.id, { name: editName.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div className="bg-white px-4 sm:px-8 py-4 sm:py-5 border-b border-nt-border z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 print:hidden">
      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          onClick={onBack}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-nt-primary text-white flex items-center justify-center text-xl sm:text-2xl font-serif italic shrink-0">
            {patient.name.charAt(0).toUpperCase()}
          </div>
          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="text-lg sm:text-xl font-serif text-nt-text border-b border-nt-primary focus:outline-none px-1 py-0 w-full max-w-[150px] sm:max-w-xs"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1 text-green-600 hover:bg-green-50 rounded shrink-0">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <h2 className="text-xl sm:text-2xl font-serif text-nt-text flex items-center gap-2 group">
                <span className="truncate max-w-[150px] sm:max-w-sm">{patient.name}</span>
                <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-nt-primary transition-all shrink-0">
                  <Edit2 className="w-4 h-4" />
                </button>
              </h2>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="px-2 py-0.5 bg-nt-active text-[#4a5d4e] text-[10px] font-bold rounded uppercase tracking-wider">
                Desde {new Date(patient.createdAt).toLocaleDateString()}
              </span>
              <button 
                onClick={onShowSettings}
                className="px-2 py-0.5 border border-nt-border text-gray-500 hover:bg-gray-50 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <Settings className="w-3 h-3" /> Prompts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto overflow-x-auto scroll-hide pb-1 sm:pb-0">
         <button 
           onClick={onShowPreview}
           title="Visualizar Prontuário"
           className="p-2 sm:px-4 sm:py-2 bg-white text-nt-text hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-widest shadow-sm border border-nt-border shrink-0"
         >
           <Eye className="w-4 h-4" />
           <span className="hidden sm:inline">Preview</span>
         </button>

         <button 
           onClick={onCopyAll}
           title="Copiar todas evoluções"
           className="p-2 sm:px-4 sm:py-2 bg-white text-nt-text hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-widest shadow-sm border border-nt-border shrink-0"
         >
           <Copy className="w-4 h-4" />
           <span className="hidden sm:inline">Copiar</span>
         </button>
         
         <button 
           onClick={onExportDoc}
           title="Exportar documento Word"
           className="p-2 sm:px-4 sm:py-2 bg-white text-nt-text hover:bg-gray-50 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-widest shadow-sm border border-nt-border shrink-0"
         >
           <FileText className="w-4 h-4" />
           <span className="hidden sm:inline">.DOC</span>
         </button>

        <div className="w-[1px] h-6 sm:h-8 bg-nt-border mx-1 shrink-0"></div>

        <button 
          onClick={onToggleChat}
          className="hidden sm:flex px-4 py-2 bg-nt-active text-nt-primary hover:bg-[#d0d6c8] rounded-lg text-xs font-bold items-center gap-2 transition-colors uppercase tracking-widest shadow-sm border border-nt-border shrink-0"
        >
          <MessageSquare className="w-4 h-4" />
          Chat Global
        </button>
        
        <button 
          onClick={onToggleChat}
          className="sm:hidden p-2 bg-nt-active text-nt-primary rounded-lg shadow-sm border border-nt-border shrink-0"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        <button 
           onClick={onDeletePatient}
           title="Excluir Paciente"
           className="p-2 sm:p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg shadow-sm border border-red-100 shrink-0 ml-1 transition-colors"
         >
           <Trash2 className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

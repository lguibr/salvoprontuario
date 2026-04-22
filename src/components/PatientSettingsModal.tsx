import React from 'react';
import { Settings, Upload, X } from 'lucide-react';

interface PatientSettingsModalProps {
  onClose: () => void;
  onSave: () => void;
  tempPrompt: string;
  setTempPrompt: (val: string) => void;
  tempComplaintPrompt: string;
  setTempComplaintPrompt: (val: string) => void;
  tempPlanPrompt: string;
  setTempPlanPrompt: (val: string) => void;
  stampImage: string | null;
  updateStampImage: (val: string | null) => void;
  psychologistName: string;
  setPsychologistName: (val: string) => void;
}

export function PatientSettingsModal({
  onClose,
  onSave,
  tempPrompt,
  setTempPrompt,
  tempComplaintPrompt,
  setTempComplaintPrompt,
  tempPlanPrompt,
  setTempPlanPrompt,
  stampImage,
  updateStampImage,
  psychologistName,
  setPsychologistName
}: PatientSettingsModalProps) {
  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 print:hidden backdrop-blur-sm">
      <div className="bg-nt-paper w-full max-w-4xl rounded-2xl shadow-2xl border border-nt-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-nt-border flex justify-between items-center bg-nt-paper shrink-0">
          <h3 className="font-bold text-nt-text flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-nt-primary" /> Prompts do SalvoProntuário
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
          <div className="bg-nt-paper border border-nt-border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-nt-text flex items-center gap-2 mb-1">
                Carimbo / Assinatura do Profissional
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed max-w-lg mb-4">
                Faça upload da imagem do seu carimbo (PNG ou JPG) e informe seu nome. Isso será inserido no fim do documento exportado.
              </p>
              <div className="flex flex-col gap-2 max-w-md">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Nome do Profissional</label>
                <input 
                  type="text" 
                  value={psychologistName}
                  onChange={(e) => setPsychologistName(e.target.value)}
                  placeholder="Ex: Psicólogo(a) CRP 00/0000"
                  className="w-full px-3 py-2 text-sm border border-nt-border rounded-lg bg-nt-paper focus:outline-none focus:border-nt-primary"
                />
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 w-full md:w-auto">
              {stampImage ? (
                <div className="relative group border border-nt-border rounded bg-nt-paper p-2 w-[200px] h-[100px] flex items-center justify-center shadow-inner">
                  <img src={stampImage} alt="Carimbo" className="max-w-full max-h-full object-contain" />
                  <button onClick={() => updateStampImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 focus:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer border-2 border-dashed border-nt-primary text-nt-primary flex flex-col items-center justify-center p-4 rounded-xl w-full sm:w-[200px] h-[100px] hover:bg-nt-primary/5 transition-colors">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-widest text-center">Fazer Upload</span>
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateStampImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col flex-1">
              <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Prompt: Evoluções Diárias</p>
              <textarea 
                value={tempPrompt}
                onChange={e => setTempPrompt(e.target.value)}
                className="w-full text-xs font-mono p-4 border border-nt-border rounded-xl resize-none h-[300px] lg:h-[400px] focus:outline-none focus:ring-2 focus:ring-nt-primary/50 focus:border-nt-primary bg-nt-paper leading-relaxed text-gray-700 hover:border-nt-primary/50 transition-colors"
                title="Use para estruturar a evolução baseada em um rascunho de fim de sessão."
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Prompt: Demanda/Queixa</p>
              <textarea 
                value={tempComplaintPrompt}
                onChange={e => setTempComplaintPrompt(e.target.value)}
                className="w-full text-xs font-mono p-4 border border-nt-border rounded-xl resize-none h-[300px] lg:h-[400px] focus:outline-none focus:ring-2 focus:ring-nt-primary/50 focus:border-nt-primary bg-nt-paper leading-relaxed text-gray-700 hover:border-nt-primary/50 transition-colors"
              />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Prompt: Plano Terapêutico</p>
              <textarea 
                value={tempPlanPrompt}
                onChange={e => setTempPlanPrompt(e.target.value)}
                className="w-full text-xs font-mono p-4 border border-nt-border rounded-xl resize-none h-[300px] lg:h-[400px] focus:outline-none focus:ring-2 focus:ring-nt-primary/50 focus:border-nt-primary bg-nt-paper leading-relaxed text-gray-700 hover:border-nt-primary/50 transition-colors"
                title="Lembre-se que as evoluções já são passadas automaticamente para refinar o plano."
              />
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5 border-t border-nt-border flex justify-end gap-3 bg-gray-50 shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onSave} 
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-nt-primary text-white rounded-lg hover:bg-[#4a5d4e] shadow-sm transition-colors"
          >
            Salvar Prompts
          </button>
        </div>
      </div>
    </div>
  );
}

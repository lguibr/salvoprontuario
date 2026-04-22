import React, { useState } from 'react';
import { Session } from '../types';
import { elaborateClinicalNote, refineSessionNote } from '../lib/gemini';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Wand2, Loader2, CheckCircle2, Copy, Send, Edit2, Check, X, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePatients } from '../hooks/usePatients';
import ReactMarkdown from 'react-markdown';

export interface SessionCardProps {
  session: Session;
  onUpdate: (updates: Partial<Session>) => void;
  hooks: ReturnType<typeof usePatients>;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onUpdate, hooks }) => {
  const { addSessionMessage, systemPrompt } = hooks;
  const [draft, setDraft] = useState(session.draftText);
  const [isElaborating, setIsElaborating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [chatMsg, setChatMsg] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Manual Editing States
  const [isManualEditing, setIsManualEditing] = useState(false);
  const [manualText, setManualText] = useState('');

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDateStr, setEditDateStr] = useState('');
  const [editTimeStr, setEditTimeStr] = useState('');

  const handleDelete = () => {
    if (confirm('Deseja excluir DEFNITIVAMENTE esta sessão?')) {
      hooks.deleteSession(session.id);
    }
  };

  const handleEditDate = () => {
    const d = new Date(session.datetime);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    setEditDateStr(`${yyyy}-${mm}-${dd}`);
    setEditTimeStr(format(d, "HH:mm"));
    setIsEditingDate(true);
  };

  const saveEditedDate = () => {
    if (editDateStr && editTimeStr) {
      const [year, month, day] = editDateStr.split('-').map(Number);
      const [hours, mins] = editTimeStr.split(':').map(Number);
      const newD = new Date(year, month - 1, day, hours, mins, 0);
      onUpdate({ datetime: newD.getTime() });
    }
    setIsEditingDate(false);
  };

  const toggleAbsent = () => {
    const isNowAbsent = !session.isAbsent;
    onUpdate({ 
      isAbsent: isNowAbsent, 
      status: isNowAbsent ? 'completed' : (draft.trim() ? 'draft' : 'draft'), 
      clinicalText: isNowAbsent ? 'Paciente ausente.' : '' 
    });
  };

  const handleElaborate = async () => {
    if (!draft.trim()) return;
    
    setIsElaborating(true);
    onUpdate({ status: 'elaborating', draftText: draft });
    
    try {
      const generatedText = await elaborateClinicalNote(draft, systemPrompt);
      onUpdate({ clinicalText: generatedText, status: 'completed' });
    } catch (error) {
      console.error(error);
      alert('Erro ao elaborar prontuário com IA. Verifique sua chave da API GEMINI.');
      onUpdate({ status: 'draft' }); // Revert status
    } finally {
      setIsElaborating(false);
    }
  };
  
  const handleRefine = async () => {
    if (!chatMsg.trim() || isChatting) return;
    const userText = chatMsg;
    setChatMsg('');
    setIsChatting(true);
    
    addSessionMessage(session.id, { role: 'user', content: userText });
    
    try {
      const result = await refineSessionNote(session, userText);
      addSessionMessage(session.id, { role: 'model', content: result.reply });
      onUpdate({ clinicalText: result.updatedNote });
    } catch (e) {
      console.error(e);
      addSessionMessage(session.id, { role: 'model', content: '⚠️ Ocorreu um erro ao refinar. Tente novamente.' });
    } finally {
      setIsChatting(false);
    }
  };

  const handleSaveDraft = () => {
    onUpdate({ draftText: draft });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(session.clinicalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const startManualEdit = () => {
    setManualText(session.clinicalText);
    setIsManualEditing(true);
  };

  const saveManualEdit = () => {
    onUpdate({ clinicalText: manualText });
    setIsManualEditing(false);
  };

  const cancelManualEdit = () => {
    setIsManualEditing(false);
    setManualText('');
  };

  const formattedDate = format(session.datetime, "dd/MM/yy", { locale: ptBR });
  const formattedTime = format(session.datetime, "HH:mm");

  return (
    <div className="mb-2 print:mb-8 print:break-inside-avoid">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-1.5 px-0 group">
         <div className="flex items-center gap-3">
           {isEditingDate ? (
             <div className="flex items-center gap-2 print:hidden">
               <input type="date" value={editDateStr} onChange={e => setEditDateStr(e.target.value)} className="text-[10px] uppercase font-bold text-gray-500 border border-nt-border rounded px-1 outline-none" />
               <input type="time" value={editTimeStr} onChange={e => setEditTimeStr(e.target.value)} className="text-[10px] uppercase font-bold text-gray-500 border border-nt-border rounded px-1 outline-none" />
               <button onClick={saveEditedDate} className="text-green-600 hover:bg-green-50 p-0.5 rounded"><Check className="w-3 h-3" /></button>
               <button onClick={() => setIsEditingDate(false)} className="text-red-500 hover:bg-red-50 p-0.5 rounded"><X className="w-3 h-3" /></button>
             </div>
           ) : (
             <>
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest print:text-black print:text-sm">{formattedDate}</span>
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest px-2 border-l border-nt-border print:text-black print:text-sm">{formattedTime}</span>
               <button onClick={handleEditDate} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-nt-primary transition-opacity print:hidden">
                 <Edit2 className="w-3 h-3" />
               </button>
             </>
           )}
         </div>
         <div className="flex items-center gap-2">
           <button 
             onClick={toggleAbsent}
             className={cn(
               "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-colors print:hidden",
               session.isAbsent 
                ? "bg-red-50 text-red-500 border border-red-200" 
                : "bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100"
             )}
           >
             {session.isAbsent ? 'Faltou / Ausente' : 'Marcar Falta'}
           </button>
           <button 
             onClick={handleDelete}
             className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity print:hidden"
             title="Excluir Sessão"
           >
             <Trash2 className="w-3.5 h-3.5" />
           </button>
         </div>
      </div>

      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 items-stretch print:block print:w-full", session.isAbsent && "opacity-60")}>
        {/* Left Col: Draft */}
        <div className={cn(
          "flex flex-col h-full bg-nt-paper rounded-2xl border border-nt-border overflow-hidden shadow-card print:hidden",
          session.isAbsent && "pointer-events-none"
        )}>
            <div className="px-3 py-2 border-b border-nt-border-light flex justify-between items-center bg-nt-paper">
               <h3 className="text-xs font-bold flex items-center gap-2 text-nt-text">
                 <Calendar className="w-3 h-3 opacity-50" /> Rascunho da Sessão
               </h3>
               <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                 {session.status === 'elaborating' ? 'Processando' : 'Editando'}
               </span>
            </div>
            
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSaveDraft}
              placeholder="Digite os pontos chaves da sessão aqui... Ex: Paciente relatou melhora..."
              className="flex-1 p-3 text-xs md:text-sm leading-relaxed text-[#4a5d4e] min-h-[60px] md:min-h-[80px] resize-none outline-none bg-nt-paper focus:bg-nt-paper transition-colors"
              disabled={session.isAbsent}
            />
            
            <div className="p-2 bg-nt-paper border-t border-nt-border-light flex justify-end">
              <button
                onClick={handleElaborate}
                disabled={!draft.trim() || isElaborating || session.status === 'elaborating' || session.isAbsent}
                className="px-4 py-1.5 bg-nt-primary text-white text-[10px] uppercase tracking-wider font-bold rounded-lg flex items-center gap-2 hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
              >
                {isElaborating ? (
                  <><Loader2 className="w-3 h-3 animate-spin"/> Processando...</>
                ) : (
                  <><Wand2 className="w-3 h-3" /> Processar com IA</>
                )}
              </button>
            </div>
        </div>

        {/* Right Col: AI Output */}
        <div className={cn(
          "flex flex-col h-full rounded-2xl overflow-hidden border-2 transition-all duration-500 min-h-[auto] md:min-h-[100px] print:block print:w-full print:border-none print:shadow-none print:min-h-0",
          (session.status === 'completed' || isElaborating || session.clinicalText) 
            ? (session.isAbsent ? "bg-red-50 text-red-700 border-red-200" : "bg-nt-primary text-white shadow-lg border-white/20 print:bg-white print:text-black") 
            : "border-dashed border-nt-border bg-nt-paper print:hidden"
        )}>
          {(session.status === 'completed' || isElaborating || session.clinicalText) ? (
            <>
              <div className={cn("px-3 py-2 border-b flex justify-between items-center bg-transparent shrink-0 print:hidden", session.isAbsent ? "border-red-200" : "border-white/10")}>
                <h3 className="text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 opacity-70" /> 
                  {session.isAbsent ? 'Sessão Não Realizada' : 'Evolução Estruturada'}
                </h3>
                
                {session.clinicalText && !isElaborating && !session.isAbsent && (
                  <div className="flex items-center gap-3">
                    {!isManualEditing ? (
                      <>
                        <button 
                          onClick={startManualEdit}
                          className="flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider"
                        >
                          <Copy className="w-3 h-3" /> {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={cancelManualEdit}
                          className="flex items-center gap-1 text-[10px] opacity-70 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider text-red-200"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                        <button 
                          onClick={saveManualEdit}
                          className="flex items-center gap-1 text-[10px] opacity-90 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider text-green-200"
                        >
                          <Check className="w-3 h-3" /> Salvar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className={cn(
                "flex-1 overflow-y-auto scroll-hide font-serif relative print:overflow-visible print:p-0",
                isManualEditing ? "p-0" : "p-3"
              )}>
                {isElaborating ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center opacity-70 print:hidden">
                     <Loader2 className="w-8 h-8 animate-spin mb-3" />
                     <p className="text-[10px] font-sans uppercase tracking-widest font-bold">Estruturando...</p>
                   </div>
                ) : isManualEditing ? (
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="w-full h-full min-h-[80px] p-3 border-none bg-white/10 text-white resize-none focus:outline-none font-serif text-sm leading-relaxed"
                    autoFocus
                  />
                ) : (
                  <div className="space-y-2 text-xs md:text-sm leading-relaxed opacity-90 whitespace-pre-wrap print:text-black print:opacity-100">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold pr-1" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li {...props} />
                      }}
                    >
                      {session.clinicalText}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Session Chat / Refinement */}
              {!isElaborating && !isManualEditing && session.status === 'completed' && (
                <div className="p-2.5 bg-black/10 border-t border-white/10 flex flex-col gap-2 shrink-0 print:hidden">
                  {session.chatHistory && session.chatHistory.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-[100px] overflow-y-auto scroll-hide pr-1">
                      {session.chatHistory.map((m, i) => (
                        <div key={i} className={cn(
                          "px-2.5 py-1.5 rounded-xl text-[10px] md:text-xs max-w-[90%] leading-relaxed",
                          m.role === 'user' ? "bg-white/20 self-end" : "bg-nt-active text-nt-text self-start font-sans"
                        )}>
                          {m.content}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRefine()}
                      disabled={isChatting}
                      placeholder="Pedir ajuste à IA (ex: deixe mais simples)..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-[11px] text-white placeholder-white/50 focus:outline-none focus:border-white/50 disabled:opacity-50"
                    />
                    <button 
                      onClick={handleRefine} 
                      disabled={!chatMsg.trim() || isChatting} 
                      className="p-1.5 bg-nt-paper text-nt-primary rounded-full hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {isChatting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3"/>}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
             <div className="flex-1 flex px-8 text-center flex-col justify-center items-center opacity-50">
                <Wand2 className="w-8 h-8 text-gray-300 mb-3"/>
                <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Sem Evolução</p>
                <p className="text-xs font-medium text-gray-400 mt-2">Escreva o rascunho e processe com a IA para estruturar.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

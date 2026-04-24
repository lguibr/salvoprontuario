import React, { useState, useEffect } from 'react';
import { Settings, X, Key, ShieldAlert, Loader2 } from 'lucide-react';
import localforage from 'localforage';

interface AppSettingsModalProps {
  onClose: () => void;
}

export function AppSettingsModal({ onClose }: AppSettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchKey = async () => {
      try {
        let key = await localforage.getItem<string>('prontuario_geminiApiKey');
        if (key == null) {
           key = localStorage.getItem('prontuario_geminiApiKey') || '';
           if (key) {
             await localforage.setItem('prontuario_geminiApiKey', key);
           }
        }
        if (mounted) setApiKey(key);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchKey();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    await localforage.setItem('prontuario_geminiApiKey', apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 print:hidden backdrop-blur-sm">
        <div className="bg-nt-paper w-full max-w-md rounded-2xl shadow-2xl border border-nt-border overflow-hidden flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-nt-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 print:hidden backdrop-blur-sm">
      <div className="bg-nt-paper w-full max-w-md rounded-2xl shadow-2xl border border-nt-border overflow-hidden flex flex-col">
        <div className="p-5 border-b border-nt-border flex justify-between items-center bg-nt-paper shrink-0">
          <h3 className="font-bold text-nt-text flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-nt-primary" /> Configurações do Sistema
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-nt-text flex items-center gap-2">
              <Key className="w-4 h-4" /> Gemini API Key
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Insira sua chave da API do Google Gemini. A chave é salva apenas no seu navegador para sua privacidade.
            </p>
            <input 
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full px-4 py-3 bg-nt-paper border border-nt-border rounded-xl focus:border-nt-primary focus:outline-none focus:ring-1 focus:ring-nt-primary transition-all text-sm font-mono text-nt-text"
            />
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-xl text-xs flex gap-3 items-start border border-yellow-200 dark:border-yellow-900/50">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>Sua chave permanece local no seu computador e sai dele apenas para se comunicar diretamente com o Google Gemini. Nenhum servidor intermediário armazena esta chave.</p>
          </div>
        </div>

        <div className="p-5 border-t border-nt-border flex justify-end gap-3 bg-nt-paper shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-nt-primary text-white rounded-lg hover:bg-nt-primary/90 shadow-sm transition-colors flex items-center gap-2"
          >
            {saved ? 'Salvo!' : 'Salvar Chave'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { usePatients } from '../hooks/usePatients';
import { UserPlus, UserCircle, Search, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { Patient } from '../types';
import { PatientRegistrationModal } from './PatientRegistrationModal';

interface SidebarProps {
  hooks: ReturnType<typeof usePatients>;
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
}

export function Sidebar({ hooks, selectedPatientId, onSelectPatient }: SidebarProps) {
  const { patients, addPatient } = hooks;
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  const toggleTheme = () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    setIsDark(isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  };

  const handleAddPatient = (details: Partial<Patient> & { name: string }, timestamps: number[]) => {
    const newId = addPatient(details, timestamps);
    setShowModal(false);
    onSelectPatient(newId);
  };

  const filteredPatients = patients.filter(p => {
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) ||
           (p.complaint && p.complaint.toLowerCase().includes(term)) ||
           (p.therapeuticPlan && p.therapeuticPlan.toLowerCase().includes(term));
  }).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="w-full lg:w-80 h-full bg-nt-sidebar border-r border-nt-border flex flex-col z-20 relative">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-nt-text flex items-center gap-2">
              SalvoProntuário
            </h1>
            <p className="text-xs font-medium mt-1 opacity-70 text-nt-text">Evoluções Clínicas via Gemini AI</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 text-nt-text hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 opacity-40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-full pl-9 pr-4 py-2 text-sm border-none ring-1 ring-black/5 focus:outline-none focus:ring-1 focus:ring-nt-primary transition-colors"
          />
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="w-full py-2 bg-white rounded-lg text-sm font-medium border border-[#b8c0b0] hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors uppercase tracking-wider text-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span className="font-bold">Novo Paciente</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide">
        <div className="p-0">
          <h3 className="px-6 py-2 text-[10px] font-bold text-nt-primary uppercase tracking-widest">
            Seus Pacientes
          </h3>
          
          {patients.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              <UserCircle className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              Nenhum paciente
            </div>
          ) : filteredPatients.length === 0 ? (
             <div className="px-6 py-8 text-center text-gray-500 text-sm">
               Nenhum resultado.
             </div>
          ) : (
            <ul className="space-y-0 pb-4">
              {filteredPatients.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => onSelectPatient(p.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4",
                      selectedPatientId === p.id 
                        ? "bg-nt-active border-nt-primary" 
                        : "border-transparent hover:bg-black/5"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-colors",
                      selectedPatientId === p.id ? "bg-white text-nt-primary" : "bg-nt-border text-nt-text"
                    )}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm truncate text-nt-text">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showModal && (
        <PatientRegistrationModal 
          onClose={() => setShowModal(false)}
          onSave={handleAddPatient}
        />
      )}
    </div>
  );
}

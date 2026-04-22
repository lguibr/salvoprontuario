import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PatientView } from './components/PatientView';
import { usePatients } from './hooks/usePatients';
import { UserCircle } from 'lucide-react';

export default function App() {
  const patientHooks = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const selectedPatient = selectedPatientId 
    ? patientHooks.patients.find(p => p.id === selectedPatientId) 
    : null;

  React.useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="flex h-screen w-full bg-nt-bg overflow-hidden font-sans text-nt-text print:bg-white print:h-auto print:overflow-visible">
      {/* Mobile Sidebar overlay */}
      <div 
        className={`lg:block print:hidden ${selectedPatient ? 'hidden' : 'w-full'}`}
      >
        <Sidebar 
          hooks={patientHooks} 
          selectedPatientId={selectedPatientId} 
          onSelectPatient={setSelectedPatientId}
        />
      </div>

      {/* Main Content View */}
      <div 
        className={`flex-1 flex-col h-full bg-nt-bg relative lg:flex print:bg-white print:h-auto print:block ${!selectedPatient ? 'hidden' : 'flex'}`}
      >
        {selectedPatient ? (
          <PatientView 
            patient={selectedPatient} 
            onBack={() => setSelectedPatientId(null)}
            hooks={patientHooks}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400 bg-nt-bg/50 print:hidden">
            <div className="p-8 bg-nt-paper rounded-2xl border border-nt-border shadow-card text-center max-w-sm">
              <div className="w-16 h-16 bg-nt-sidebar text-nt-primary rounded-full flex items-center justify-center mx-auto mb-5">
                 <UserCircle className="w-10 h-10 text-nt-primary" />
              </div>
              <h3 className="text-xl font-bold text-nt-text mb-2 tracking-tight">Selecione um Paciente</h3>
              <p className="text-sm font-medium text-gray-500">
                Escolha um paciente na barra lateral ou crie um novo para gerar pautas e elaborar prontuários clínicos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

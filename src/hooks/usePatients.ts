import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Patient, Session } from '../types';

const DEFAULT_SYSTEM_PROMPT = `Você é um psiquiatra/psicólogo clńico sênior estruturando evoluções clínicas. 
Por favor, transforme o rascunho da sessão a seguir em uma evolução clínica profissional, técnica e objetiva.

DIRETRIZES:
1. Retorne ESTRITAMENTE E APENAS o texto livre da evolução elaborada. 
2. NÃO use markdown, não adicione "Aqui está", "Versão melhorada:" ou comentários fora do texto clínico.
3. Não use tópicos ou listas descritivas se não houver pedido. Faça um ou dois parágrafos diretos.
4. Linguagem na terceira pessoa sem identificação de nome (Ex: "Paciente relata...").`;

const DEFAULT_GLOBAL_PROMPT = `Você é um assistente sênior especializado em auditoria de prontuários e avaliação psicológica.
Analise as informações do paciente e atenda estritamente ao pedido de edição do clínico. Suas modificações no texto devem manter o tom técnico, objetivo e em terceira pessoa. NÃO adicione apresentações aos seus textos (como "Abaixo segue o...", ou "Claro"). Apenas retorne o conteúdo validado.`;

const DEFAULT_COMPLAINT_PROMPT = `Aja como um clínico sênior refinando as notas de Demanda/Queixa inicial.
Transforme as notas num texto clínico corrido, profissional, direto, em 3ª pessoa. 
Não invente detalhes inexistentes e retorne ONLY o texto elaborado. SEM explicações, NUNCA introduza o texto.`;

const DEFAULT_PLAN_PROMPT = `Aja como um clínico sênior elaborando o Plano Terapêutico.
Baseado na queixa inicial e nas evoluções enviadas (se houver), redija um plano de tratamento atualizado, coerente e com metodologias clínicas. 
Retorne EXCLUSIVAMENTE o texto clínico para o plano, sem saudações ou comentários.`;

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('prontuario_patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('prontuario_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('prontuario_systemPrompt');
    return saved || DEFAULT_SYSTEM_PROMPT;
  });

  const [globalSystemPrompt, setGlobalSystemPrompt] = useState<string>(() => {
    const saved = localStorage.getItem('prontuario_globalSystemPrompt');
    return saved || DEFAULT_GLOBAL_PROMPT;
  });

  const [complaintPrompt, setComplaintPrompt] = useState<string>(() => {
    return localStorage.getItem('prontuario_complaintPrompt') || DEFAULT_COMPLAINT_PROMPT;
  });

  const [planPrompt, setPlanPrompt] = useState<string>(() => {
    return localStorage.getItem('prontuario_planPrompt') || DEFAULT_PLAN_PROMPT;
  });

  const [psychologistName, setPsychologistName] = useState<string>(() => {
    return localStorage.getItem('prontuario_psychologistName') || '';
  });

  useEffect(() => {
    localStorage.setItem('prontuario_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('prontuario_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('prontuario_systemPrompt', systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem('prontuario_globalSystemPrompt', globalSystemPrompt);
  }, [globalSystemPrompt]);

  useEffect(() => {
    localStorage.setItem('prontuario_complaintPrompt', complaintPrompt);
  }, [complaintPrompt]);

  useEffect(() => {
    localStorage.setItem('prontuario_planPrompt', planPrompt);
  }, [planPrompt]);

  useEffect(() => {
    localStorage.setItem('prontuario_psychologistName', psychologistName);
  }, [psychologistName]);

  const updateSystemPrompt = (prompt: string) => {
    setSystemPrompt(prompt);
  };

  const updateGlobalSystemPrompt = (prompt: string) => {
    setGlobalSystemPrompt(prompt);
  };

  const addPatient = (details: Partial<Patient> & { name: string }, initialTimestamps?: number[]) => {
    const newPatient: Patient = {
      id: uuidv4(),
      createdAt: Date.now(),
      ...details
    };
    setPatients([...patients, newPatient]);

    if (initialTimestamps && initialTimestamps.length > 0) {
      const newSessions = initialTimestamps.map(timestamp => ({
        id: uuidv4(),
        patientId: newPatient.id,
        datetime: timestamp,
        draftText: '',
        clinicalText: '',
        status: 'draft' as const,
      }));
      setSessions((current) => [...current, ...newSessions]);
    }

    return newPatient.id;
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients(current => current.map(p => p.id === patientId ? { ...p, ...updates } : p));
  };

  const deletePatient = (patientId: string) => {
    setPatients(current => current.filter(p => p.id !== patientId));
    setSessions(current => current.filter(s => s.patientId !== patientId));
  };

  const getSessionsForPatient = useCallback((patientId: string) => {
    return sessions
      .filter((s) => s.patientId === patientId)
      .sort((a, b) => a.datetime - b.datetime);
  }, [sessions]);

  const addSession = (patientId: string, timestamp: number) => {
    const newSession: Session = {
      id: uuidv4(),
      patientId,
      datetime: timestamp,
      draftText: '',
      clinicalText: '',
      status: 'draft',
    };
    setSessions([...sessions, newSession]);
  };

  const addMultipleSessions = (patientId: string, timestamps: number[]) => {
    const newSessions: Session[] = timestamps.map((timestamp) => ({
      id: uuidv4(),
      patientId,
      datetime: timestamp,
      draftText: '',
      clinicalText: '',
      status: 'draft',
    }));
    setSessions([...sessions, ...newSessions]);
  };

  const updateSession = (sessionId: string, updates: Partial<Session>) => {
    setSessions((current) =>
      current.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((current) => current.filter((s) => s.id !== sessionId));
  };

  const deleteAllSessions = (patientId: string) => {
    setSessions((current) => current.filter((s) => s.patientId !== patientId));
  };

  const addSessionMessage = (sessionId: string, message: { role: 'user' | 'model'; content: string }) => {
    setSessions((current) =>
      current.map((s) => (s.id === sessionId ? { ...s, chatHistory: [...(s.chatHistory || []), message] } : s))
    );
  };

  const addPatientMessage = (patientId: string, message: { role: 'user' | 'model'; content: string }) => {
    setPatients((current) =>
      current.map((p) => (p.id === patientId ? { ...p, globalChatHistory: [...(p.globalChatHistory || []), message] } : p))
    );
  };

  const bulkUpdateSessionTexts = (updates: { sessionId: string; newText: string }[]) => {
    setSessions((current) =>
      current.map((s) => {
        const match = updates.find((u) => u.sessionId === s.id);
        return match && s.clinicalText ? { ...s, clinicalText: match.newText } : s;
      })
    );
  };

  const [stampImage, setStampImage] = useState<string | null>(() => {
    return localStorage.getItem('prontuario_stampImage') || null;
  });

  useEffect(() => {
    if (stampImage) {
      localStorage.setItem('prontuario_stampImage', stampImage);
    } else {
      localStorage.removeItem('prontuario_stampImage');
    }
  }, [stampImage]);

  return {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    sessions,
    getSessionsForPatient,
    addSession,
    addMultipleSessions,
    updateSession,
    deleteSession,
    deleteAllSessions,
    addSessionMessage,
    addPatientMessage,
    bulkUpdateSessionTexts,
    systemPrompt,
    updateSystemPrompt,
    globalSystemPrompt,
    updateGlobalSystemPrompt,
    complaintPrompt,
    updateComplaintPrompt: setComplaintPrompt,
    planPrompt,
    updatePlanPrompt: setPlanPrompt,
    psychologistName,
    updatePsychologistName: setPsychologistName,
    stampImage,
    updateStampImage: setStampImage,
  };
}

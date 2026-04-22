export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};

export type Patient = {
  id: string;
  name: string;
  createdAt: number;
  globalChatHistory?: ChatMessage[];
  birthDate?: string;
  scheduleInfo?: string;
  complaint?: string;
  therapeuticPlan?: string;
  startDate?: string;
  endDate?: string;
  sessionDays?: number[];
  sessionTime?: string;
};

export type SessionStatus = 'draft' | 'elaborating' | 'completed';

export type Session = {
  id: string;
  patientId: string;
  datetime: number;
  draftText: string;
  clinicalText: string;
  status: SessionStatus;
  chatHistory?: ChatMessage[];
  isAbsent?: boolean;
};

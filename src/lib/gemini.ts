import { GoogleGenAI, Type } from '@google/genai';
import { Session, Patient, ChatMessage } from '../types';
import { encryptData, decryptData } from './crypto';

let ai: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export async function getGemini() {
  const storedKey = localStorage.getItem('prontuario_geminiApiKey');
  let key = '';

  if (storedKey) {
    if (storedKey.startsWith('AIza')) {
      // Plain text key, migrate it
      key = storedKey;
      try {
        const encrypted = await encryptData(key);
        localStorage.setItem('prontuario_geminiApiKey', encrypted);
      } catch (e) {
        console.error('Failed to migrate API key:', e);
      }
    } else {
      try {
        key = await decryptData(storedKey);
      } catch (e) {
        console.error('Failed to decrypt API key:', e);
      }
    }
  }

  if (!key) {
    key = import.meta.env?.VITE_GEMINI_API_KEY || '';
  }
  
  if (!key) {
    throw new Error('Chave da API do Google Gemini não encontrada. Configure-a nas suas configurações.');
  }

  if (!ai || cachedKey !== key) {
    ai = new GoogleGenAI({ apiKey: key });
    cachedKey = key;
  }
  
  return ai;
}

export async function elaborateClinicalNote(draft: string, systemPrompt: string): Promise<string> {
  const ai = await getGemini();
  const prompt = `${systemPrompt}

RASCUNHO DO PROFISSIONAL:
${draft}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clinicalText: { type: Type.STRING, description: "A evolução clínica profissional formatada e elaborada." }
        },
        required: ["clinicalText"]
      }
    }
  });

  try {
    const json = JSON.parse(response.text || '{}');
    return json.clinicalText || response.text || '';
  } catch (e) {
    return response.text || '';
  }
}

export async function refineSessionNote(session: Session, userMessage: string): Promise<{ reply: string, updatedNote: string }> {
  const ai = await getGemini();
  
  const historyText = session.chatHistory?.map(m => `${m.role === 'user' ? 'Clínico' : 'IA'}: ${m.content}`).join('\n') || '';
  
  const prompt = `Você está ajudando um clínico a iterar e refinar uma evolução clínica individual.
  
Histórico da conversa atual (se houver):
${historyText}

Evolução ATUAL:
"""${session.clinicalText}"""

Nova instrução do clínico para alterar esta evolução:
"""${userMessage}"""

Retorne um JSON com:
"reply": Uma mensagem curta conformando a alteração.
"updatedNote": A evolução atualizada, reescrita profissionalmente com as alterações solicitadas pelo clínico aplicadas.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          updatedNote: { type: Type.STRING }
        },
        required: ['reply', 'updatedNote']
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw new Error('Falha ao processar resposta do modelo.');
  }
}

export async function elaboratePatientField(type: 'complaint' | 'plan', draft: string, customPrompt: string, sessions?: Session[], extraContext?: string): Promise<string> {
  const ai = await getGemini();
  
  let context = '';
  if (type === 'plan') {
    if (extraContext) {
      context += `\n\n=== DEMANDA/QUEIXA DO PACIENTE ===\n${extraContext}\n`;
    }
    if (sessions) {
      const validSessions = sessions.filter(s => s.status === 'completed' && s.clinicalText && !s.isAbsent);
      if (validSessions.length > 0) {
        context += "\n=== EVOLUÇÕES DO PACIENTE ===\n" + validSessions.map((s, i) => `Evolução: ${s.clinicalText}`).join('\n\n');
      }
    }
  }

  const prompt = `${customPrompt}

RASCUNHO ORIGINAL / NOTAS:
${draft || 'Nenhum rascunho prévio fornecido.'}${context}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING }
        },
        required: ["text"]
      }
    }
  });

  try {
    const json = JSON.parse(response.text || '{}');
    return json.text || response.text || '';
  } catch (e) {
    return response.text || '';
  }
}

export async function refinePatientField(type: 'complaint' | 'plan', currentText: string, instruction: string, customPrompt: string, sessions?: Session[], extraContext?: string): Promise<string> {
  const ai = await getGemini();

  let context = '';
  if (type === 'plan') {
    if (extraContext) {
      context += `\n\n=== DEMANDA/QUEIXA DO PACIENTE ===\n${extraContext}\n`;
    }
    if (sessions) {
      const validSessions = sessions.filter(s => s.status === 'completed' && s.clinicalText && !s.isAbsent);
      if (validSessions.length > 0) {
        context += "\n=== EVOLUÇÕES DO PACIENTE ===\n" + validSessions.map((s, i) => `Evolução: ${s.clinicalText}`).join('\n\n');
      }
    }
  }

  const prompt = `Você está ajudando um clínico a iterar e refinar um texto de ${type === 'complaint' ? 'Demanda/Queixa' : 'Plano Terapêutico'}.
  
  Diretrizes de Formatação e Tom do Assistente:
  ${customPrompt}

${context}

TEXTO ATUAL:
"""${currentText}"""

NOVA INSTRUÇÃO DO CLÍNICO:
"""${instruction}"""

Sua tarefa: Reescreva o "TEXTO ATUAL" aplicando rigorosamente as mudanças da "NOVA INSTRUÇÃO" acima. 
Retorne APENAS o novo texto revisado, encapsulado em JSON.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING }
        },
        required: ["text"]
      }
    }
  });

  try {
    const json = JSON.parse(response.text || '{}');
    return json.text || response.text || '';
  } catch (e) {
    return response.text || '';
  }
}

export async function chatPatientRecord(patient: Patient, sessions: Session[], userMessage: string, globalSystemPromptStr?: string): Promise<{ reply: string, updatedSessions: { sessionId: string, newText: string }[] }> {
  const ai = await getGemini();
  
  const validSessions = sessions.filter(s => s.clinicalText);
  const sessionsText = validSessions.map(s => `ID_SESSAO: ${s.id}\nData: ${new Date(s.datetime).toLocaleString()}\nEvolução Atual: ${s.clinicalText}`).join('\n\n---\n\n');
  
  const historyText = patient.globalChatHistory?.map(m => `${m.role === 'user' ? 'Clínico' : 'IA'}: ${m.content}`).join('\n') || '';

  const prompt = `${globalSystemPromptStr || `Você é um assistente analisando o prontuário completo de ${patient.name}.`}
  
Detalhes do Paciente:
- Nome: ${patient.name}
- Nascimento: ${patient.birthDate || 'N/A'}
- Frequência: ${patient.scheduleInfo || 'N/A'}
- Demanda/Queixa: ${patient.complaint || 'N/A'}
- Plano Terapêutico: ${patient.therapeuticPlan || 'N/A'}

Histórico das conversas anteriores:
${historyText}

Total de evoluções preenchidas: ${validSessions.length}
Evoluções atuais do paciente:
${sessionsText || 'Nenhuma evolução preenchida ainda.'}

Novo pedido/mensagem do clínico:
"${userMessage}"

Seu objetivo é:
1. Analisar todas as sessões se necessário e prover uma resposta no campo "reply".
2. Se o clínico pedir para modificar O PRONTUÁRIO (ex: "adicione que ele toma Fluoxetina", "simplifique todas as sessões"), você DEVE reescrever os textos originais incorporando essa mudança, e retorná-los no array "updatedSessions".
3. "updatedSessions" só deve conter sessões que realmente precisaram ser reescritas baseadas na mensagem do clínico. Se a mensagem for apenas uma pergunta, "updatedSessions" pode vir vazio.
4. Mantenha os IDs e contexto fiéis originais!

Retorne APENAS um JSON com o schema exigido.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          updatedSessions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sessionId: { type: Type.STRING },
                newText: { type: Type.STRING }
              },
              required: ["sessionId", "newText"]
            }
          }
        },
        required: ["reply", "updatedSessions"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw new Error('Falha ao processar resposta do modelo.');
  }
}

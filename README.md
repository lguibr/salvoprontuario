# 🧠 SalvoProntuário | Assistente Inteligente

**SalvoProntuário** é uma aplicação Web _"First Class Mobile"_, desenhada sob medida para psicólogos, psiquiatras e terapeutas clínicos. Ela acelera o processo e a estruturação de evoluções diárias de pacientes através da inteligência artificial **Google Gemini**.

O grande diferencial deste projeto é a sua natureza **Client-Side e Privada**: Todos os dados dos pacientes e configurações da sua API Key da OpenAI/Gemini ficam armazenados **exclusivamente no navegador** (LocalStorage), garantindo sigilo médico e adequação às necessidades do consultório moderno, sem a necessidade de um servidor de banco de dados (Backendless).

---

## ✨ Features Principais

* 🚀 **Geração de Evoluções com IA**: Transforme rascunhos rápidos em evoluções ricas, em terceira pessoa e 100% técnicas com 1 clique.
* 🤖 **Chat Interativo sobre o Paciente**: Converse globalmente sobre todo o prontuário do paciente ("Faça um resumo dos últimos 3 meses", "Liste os medicamentos testados") e obtenha insights baseados no histórico das suas evoluções.
* 🎨 **UI Premium Light / Dark Mode**: Layout fluído, responsivo para celulares e focado no uso clínico diário. Troca dinâmica utilizando Design Tokens TailwndCSS v4.
* 📝 **Gestão de Demandas & Plano Terapêutico**: Preencha permanentemente a Demanda e Queixa inicial. Deixe a IA montar seu plano terapêutico inteligente com base nas evoluções já executadas.
* ⚙️ **Configuração Dinâmica de Prompts**: Modifique o comportamento da IA como quiser. Altere os Prompts originais por paciente definindo o tom da linguagem que você mais gosta.
* 💾 **100% Client-Side**: Sem servidores salvando os dados dos seus pacientes. A API-Key do Gemini fica segura no `localStorage` da sua máquina!
* 🖨️ **Assinatura e Exportação .DOC**: Suba seu Carimbo Clínico. O SalvoProntuário anexa o seu nome, seu carimbo, a data atual da consulta formatada (`Belo Horizonte, Minas Gerais Brasil dd/MM/yy`) e formata visualmente na aba de Preview ou exporta os dados limpos tudo para o formato Microsoft Word.

---

## 🛠 Como usar e onde os dados são salvos?

### Armazenamento (LocalStorage)
Este é um app focado estritamente em **Privacidade Clínica**. Logo, ele não envia textos para uma nuvem/servidor do desenvolvedor.
1. **Dados**: Nomes, datas, históricos do chat e queixas ficam dentro da estrutura do navegador em chaves prefixadas como: `prontuario_patients`, `prontuario_sessions`.
2. **Imagens/Carimbo**: O seu carimbo é guardado em formato Base64 direto no navegador.
3. **Senhas/API**: A chave para a Inteligência Artificial funcionar é salva dentro de `prontuario_geminiApiKey` (Segurança total para você).

> ⚠️ **DICA DE OURO**: Uma vez que tudo é salvo no navegador atual (Chrome/Safari), se você abrir as abas incógnitas (Guia Anônima) ou limpar os dados/cache do seu navegador, os seus pacientes **serão apagados**.

### Adicionando a sua (Gemini API Key)
Para a IA de textos ganhar vida, siga os passos abaixo:
1. Ao abrir o App, clique no pequeno **Ícone de Engrenagem (Configurações)** ⚙️ lá no menu esquerdo superior, junto de seu logotipo.
2. Cole a sua `Gemini API Key` obtida gratuitamente no [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Clique em salvar. Pronto! A conectividade está feita e a ferramenta funcionará livremente para sempre no seu PC.

### Exportação e Modos
Você escolhe como quer extrair a inteligência do fluxo.
- **Exportar (.DOC)**: Todas as sessões, Demandas e Plano Terapêutico condensados no padrão word contendo assinatura.
- **Visualização Previa (Preview)**: Leia a documentação organizada e clean.
- **Native Print**: Ao dar um "CTRL+P", as telas do software se auto-ocultam mostrando APENAS os dados importantes do formulário clínico (A4 Ready).

---

## 💻 Construindo Localmente

Estes são os passos caso queira hospedar a ferramenta localmente, customizar cores ou criar novos componentes na UI:

### Pre-requisitos:
- [Node.js](https://nodejs.org/en) (v18+)

### Scripts Disponíveis:
```bash
# 1. Clonar o projeto
git clone [repo_url]

# 2. Instalar dependências
npm install

# 3. Rodar a aplicação Web (Dev Mode)
npm run dev

# 4. Compilar pacotes pra produção web:
npm run build
```

---
**Tecnologias Utilizadas:** React, Tailwind CSS v4, Lucide React (Icons), date-fns, GoogleGenAI (Gemini SDK), Vite.

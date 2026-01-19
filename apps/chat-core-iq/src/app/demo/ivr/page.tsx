'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { playDTMFTone } from '@/lib/dtmf';
import { speakWithElevenLabs, stopElevenLabsSpeaking } from '@/lib/elevenlabs-tts';
import { apiUrl, BASE_PATH } from '@/lib/utils';

interface Message {
  id: string;
  type: 'system' | 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface IVRDemoState {
  isActive: boolean;
  language: 'en' | 'es' | 'ht';
  languageSelected: boolean;
  messages: Message[];
  isProcessing: boolean;
  transferCode: string | null;
  demoUserId: string | null;
  audioEnabled: boolean;
}

// Language-specific messages
// Each message has display (shown) and spoken (TTS) versions
// Chat Core IQ - configurable for any organization
const MESSAGES = {
  en: {
    mainMenu: 'You can ask me questions about our services, policies, and more. Press 1 at any time to speak with a representative. Press 2 to get a code to continue this conversation on our website. How can I help you today?',
    connecting: 'We are connecting you to a live agent. Please hold.',
    goodbye: 'Thank you for calling Chat Core IQ. Have a great day!',
    goodbyeSpoken: 'Thank you for calling Chat Core I Q. Have a great day!',
    followUp: 'Press 2 to get a code and continue on our website for more details. Or ask another question.',
    error: 'I apologize, I had trouble processing your request. Please try again.',
    transferCode: (code: string) => `I will give you a transfer code to continue this conversation on our website. Your code is: ${code}. I repeat, your code is: ${code}. Go to our website, open the chat assistant, click the key icon, and enter this code. Your conversation will continue right where you left off.`,
    transferCodeSpoken: (code: string) => `I will give you a transfer code to continue this conversation on our website. ... Your code is: ${code}. ... I repeat, your code is: ${code}. ... Go to our website, open the chat assistant, click the key icon, and enter this code. ... Your conversation will continue right where you left off.`,
  },
  es: {
    mainMenu: 'Puede hacerme preguntas sobre nuestros servicios, políticas y más. Presione 1 en cualquier momento para hablar con un representante. Presione 2 para obtener un código para continuar esta conversación en nuestro sitio web. ¿En qué puedo ayudarle hoy?',
    connecting: 'Lo estamos conectando con un agente en vivo. Por favor espere.',
    goodbye: 'Gracias por llamar a Chat Core IQ. ¡Que tenga un buen día!',
    goodbyeSpoken: 'Gracias por llamar a Chat Core I Q. ¡Que tenga un buen día!',
    followUp: 'Presione 2 para obtener un código y continuar en nuestro sitio web para más detalles. O haga otra pregunta.',
    error: 'Lo siento, tuve un problema al procesar su solicitud. Por favor, intente de nuevo.',
    transferCode: (code: string) => `Le daré un código de transferencia para continuar esta conversación en nuestro sitio web. Su código es: ${code}. Repito, su código es: ${code}. Vaya a nuestro sitio web, abra el asistente de chat, haga clic en el icono de llave e ingrese este código. Su conversación continuará donde la dejó.`,
    transferCodeSpoken: (code: string) => `Le daré un código de transferencia para continuar esta conversación en nuestro sitio web. ... Su código es: ${code}. ... Repito, su código es: ${code}. ... Vaya a nuestro sitio web, abra el asistente de chat, haga clic en el icono de llave e ingrese este código. ... Su conversación continuará donde la dejó.`,
  },
  ht: {
    mainMenu: 'Ou ka poze m kesyon sou sèvis nou yo, règleman, ak plis ankò. Peze 1 nenpòt ki lè pou pale ak yon reprezantan. Peze 2 pou jwenn yon kòd pou kontinye konvèsasyon sa a sou sit entènèt nou an. Kijan mwen ka ede w jodi a?',
    connecting: 'Nou ap konekte w ak yon ajan an dirèk. Tanpri tann.',
    goodbye: 'Mèsi paske w rele Chat Core IQ. Pase yon bon jounen!',
    goodbyeSpoken: 'Mèsi paske w rele Chat Core I Q. Pase yon bon jounen!',
    followUp: 'Peze 2 pou jwenn yon kòd epi kontinye sou sit entènèt nou an pou plis detay. Oswa poze yon lòt kesyon.',
    error: 'Eskize m, mwen te gen yon pwoblèm pou trete demann ou a. Tanpri eseye ankò.',
    transferCode: (code: string) => `Mwen pral ba ou yon kòd transfè pou kontinye konvèsasyon sa a sou sit entènèt nou an. Kòd ou a se: ${code}. Mwen repete, kòd ou a se: ${code}. Ale sou sit entènèt nou an, ouvri asistan chat la, klike sou ikòn kle a epi antre kòd sa a. Konvèsasyon ou a pral kontinye kote ou te kite li.`,
    transferCodeSpoken: (code: string) => `Mwen pral ba ou yon kòd transfè pou kontinye konvèsasyon sa a sou sit entènèt nou an. ... Kòd ou a se: ${code}. ... Mwen repete, kòd ou a se: ${code}. ... Ale sou sit entènèt nou an, ouvri asistan chat la, klike sou ikòn kle a epi antre kòd sa a. ... Konvèsasyon ou a pral kontinye kote ou te kite li.`,
  },
};

// Format message text with bullet points and bold
function formatMessageText(text: string): React.ReactNode {
  // Split by newlines first
  const lines = text.split('\n').filter(line => line.trim());

  const elements: React.ReactNode[] = [];
  let bulletItems: string[] = [];

  const flushBullets = () => {
    if (bulletItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-none space-y-1 my-2">
          {bulletItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(item) }} />
            </li>
          ))}
        </ul>
      );
      bulletItems = [];
    }
  };

  const formatBold = (str: string): string => {
    return str.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if it's a bullet point
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.replace(/^[•\-\*]\s*/, '');
      bulletItems.push(content);
    } else {
      // Flush any pending bullets
      flushBullets();
      // Regular text line
      elements.push(
        <p
          key={`p-${elements.length}`}
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: formatBold(trimmed) }}
        />
      );
    }
  }

  // Flush remaining bullets
  flushBullets();

  return <>{elements}</>;
}

export default function IVRDemoPage() {
  const [state, setState] = useState<IVRDemoState>({
    isActive: false,
    language: 'en',
    languageSelected: false,
    messages: [],
    isProcessing: false,
    transferCode: null,
    demoUserId: null,
    audioEnabled: true,
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll disabled per user request
  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [state.messages]);

  const addMessage = (type: Message['type'], text: string) => {
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { id: crypto.randomUUID(), type, text, timestamp: new Date() },
      ],
    }));
  };

  // Speak message using ElevenLabs (natural voice)
  // Optional lang parameter allows overriding state.language (needed for language selection)
  const speakMessage = useCallback(async (text: string, lang?: 'en' | 'es' | 'ht') => {
    if (!state.audioEnabled) return;
    try {
      await speakWithElevenLabs(text, { language: lang || state.language });
    } catch (error) {
      console.error('TTS error:', error);
    }
  }, [state.audioEnabled, state.language]);

  // Toggle audio on/off
  const toggleAudio = () => {
    if (state.audioEnabled) {
      stopElevenLabsSpeaking();
    }
    setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  };

  const startCall = async () => {
    const userId = '+1-demo-' + Date.now();

    setState(prev => ({
      isActive: true,
      language: 'en',
      languageSelected: false,
      messages: [],
      isProcessing: false,
      transferCode: null,
      demoUserId: userId,
      audioEnabled: prev.audioEnabled, // Preserve audio setting
    }));

    // Multi-language greeting - separate display and spoken versions
    const greetingDisplay = 'Hello! Welcome to Chat Core IQ. ' +
      'Press 1 for English. ' +
      'Para español, presione el dos. ' +
      'Pou Kreyòl Ayisyen, peze twa.';

    // Spoken version with phonetic name and natural pauses
    const greetingSpoken = 'Hello! Welcome to Chat Core I Q. ... ' +
      'Press 1, for English. ... ' +
      'Para español, presione el dos. ... ' +
      'Pou Kreyòl Ayisyen, peze twa.';

    // Create session and add greeting message via API
    try {
      await fetch(apiUrl('/api/ivr/demo-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-message',
          userId,
          role: 'assistant',
          content: greetingDisplay,
        }),
      });
    } catch (e) {
      console.log('Session API not available, continuing in demo mode', e);
    }

    // Display text shows full name, voice says "I Q" for clarity
    setTimeout(() => {
      addMessage('assistant', greetingDisplay);
      speakMessage(greetingSpoken);
    }, 500);
  };

  const endCall = () => {
    stopElevenLabsSpeaking(); // Stop any active speech
    addMessage('system', 'Call ended');
    setState(prev => ({ ...prev, isActive: false }));
  };

  const resetDemo = () => {
    stopElevenLabsSpeaking(); // Stop any active speech
    setInput('');
    setState(prev => ({
      isActive: false,
      language: 'en',
      languageSelected: false,
      messages: [],
      isProcessing: false,
      transferCode: null,
      demoUserId: null,
      audioEnabled: prev.audioEnabled, // Preserve audio setting
    }));
  };

  const handleDTMF = async (digit: string) => {
    // Play DTMF tone
    if (state.audioEnabled) {
      playDTMFTone(digit);
    }

    addMessage('user', `Pressed: ${digit}`);
    setState(prev => ({ ...prev, isProcessing: true }));

    // LANGUAGE SELECTION PHASE (before language is selected)
    if (!state.languageSelected) {
      if (digit === '1' || digit === '2' || digit === '3') {
        const selectedLang = digit === '1' ? 'en' : digit === '2' ? 'es' : 'ht';
        const langName = digit === '1' ? 'English' : digit === '2' ? 'Spanish' : 'Haitian Creole';

        addMessage('system', `Language selected: ${langName}`);

        // Update language and mark as selected
        setState(prev => ({
          ...prev,
          language: selectedLang,
          languageSelected: true,
          isProcessing: false
        }));

        // Speak the main menu in the selected language
        setTimeout(() => {
          const mainMenuMessage = MESSAGES[selectedLang].mainMenu;
          addMessage('assistant', mainMenuMessage);
          speakMessage(mainMenuMessage, selectedLang);
        }, 500);
        return;
      } else {
        setTimeout(() => {
          addMessage('system', 'Please press 1 for English, 2 for Spanish, or 3 for Haitian Creole');
          setState(prev => ({ ...prev, isProcessing: false }));
        }, 500);
        return;
      }
    }

    // MAIN MENU PHASE (after language is selected)
    const msgs = MESSAGES[state.language];

    if (digit === '1') {
      // Transfer to live agent
      setTimeout(() => {
        addMessage('assistant', msgs.connecting);
        speakMessage(msgs.connecting);
        addMessage('system', 'Dialing City Hall: 305-593-4700...');
      }, 1000);

      // Simulate transfer delay then end demo call
      setTimeout(() => {
        addMessage('system', 'Call transferred to live agent. (Demo ended)');
        setState(prev => ({ ...prev, isActive: false, isProcessing: false }));
      }, 3000);
      return;
    } else if (digit === '2') {
      // Generate real transfer code via demo session API
      // Pass conversation history directly (solves serverless session persistence)
      try {
        // Extract user/assistant messages from state for transfer
        const conversationHistory = state.messages
          .filter(m => m.type === 'user' || m.type === 'assistant')
          .map(m => ({
            role: m.type as 'user' | 'assistant',
            content: m.text,
          }));

        const response = await fetch(apiUrl('/api/ivr/demo-session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-token',
            userId: state.demoUserId,
            messages: conversationHistory, // Pass conversation history directly
            language: state.language,
          }),
        });
        const data = await response.json();
        const code = data.token || 'ERROR';

        const codeSpaced = code.split('').join(' ');
        const transferDisplay = msgs.transferCode(codeSpaced);
        const transferSpoken = msgs.transferCodeSpoken(codeSpaced);

        addMessage('assistant', transferDisplay);
        speakMessage(transferSpoken);

        setState(prev => ({ ...prev, isProcessing: false, transferCode: code }));
      } catch {
        addMessage('system', 'Error generating transfer code');
        setState(prev => ({ ...prev, isProcessing: false }));
      }
      return;
    } else if (digit === '0' || digit === '9') {
      setTimeout(() => {
        addMessage('assistant', msgs.goodbye);
        speakMessage(msgs.goodbyeSpoken);
        endCall();
      }, 1000);
    } else {
      setTimeout(() => {
        addMessage('system', `Digit ${digit} not recognized`);
        setState(prev => ({ ...prev, isProcessing: false }));
      }, 500);
    }
  };

  const handleSpeech = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setInput('');
    addMessage('user', `Said: "${userInput}"`);
    setState(prev => ({ ...prev, isProcessing: true }));

    // Check for special phrases
    const lowerInput = userInput.toLowerCase();

    // Goodbye phrases
    if (['goodbye', 'bye', 'thank you', 'thanks', 'adios', 'gracias', 'mèsi', 'orevwa'].some(p => lowerInput.includes(p))) {
      const msgs = MESSAGES[state.language];
      setTimeout(() => {
        addMessage('assistant', msgs.goodbye);
        speakMessage(msgs.goodbyeSpoken);
        endCall();
      }, 1000);
      return;
    }

    // Escalation phrases (en, es, ht)
    if (['agent', 'human', 'person', 'representative', 'agente', 'persona', 'ajan', 'moun'].some(p => lowerInput.includes(p))) {
      const msgs = MESSAGES[state.language];
      setTimeout(() => {
        addMessage('assistant', msgs.connecting);
        speakMessage(msgs.connecting);
        addMessage('system', 'Dialing City Hall: 305-593-4700...');
      }, 1000);

      // Simulate transfer delay then end demo call
      setTimeout(() => {
        addMessage('system', 'Call transferred to live agent. (Demo ended)');
        setState(prev => ({ ...prev, isActive: false, isProcessing: false }));
      }, 3000);
      return;
    }

    // Website/transfer phrases (en, es, ht)
    if (['website', 'web', 'online', 'transfer', 'sitio', 'página', 'transferir', 'sit', 'entènèt', 'transfè'].some(p => lowerInput.includes(p))) {
      const msgs = MESSAGES[state.language];

      try {
        // Extract conversation history including this user message
        const conversationHistory = [
          ...state.messages
            .filter(m => m.type === 'user' || m.type === 'assistant')
            .map(m => ({
              role: m.type as 'user' | 'assistant',
              content: m.text,
            })),
          { role: 'user' as const, content: userInput }, // Include current message
        ];

        const response = await fetch(apiUrl('/api/ivr/demo-session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate-token',
            userId: state.demoUserId,
            messages: conversationHistory,
            language: state.language,
          }),
        });
        const data = await response.json();
        const code = data.token || 'ERROR';

        const codeSpaced = code.split('').join(' ');
        const transferDisplay = msgs.transferCode(codeSpaced);
        const transferSpoken = msgs.transferCodeSpoken(codeSpaced);

        addMessage('assistant', transferDisplay);
        speakMessage(transferSpoken);

        setState(prev => ({ ...prev, isProcessing: false, transferCode: code }));
      } catch {
        addMessage('system', 'Error generating transfer code');
        setState(prev => ({ ...prev, isProcessing: false }));
      }
      return;
    }

    // Store user message
    await fetch(apiUrl('/api/ivr/demo-session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add-message',
        userId: state.demoUserId,
        role: 'user',
        content: userInput,
      }),
    });

    // Process with AI response
    try {
      const response = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userInput }],
          language: state.language,
          sessionId: 'ivr-demo-' + Date.now(),
          isIVR: true, // Request short, concise responses for phone
        }),
      });

      const data = await response.json();
      const aiResponse = data.message || 'I apologize, I had trouble understanding. Could you please repeat that?';

      addMessage('assistant', aiResponse);
      await speakMessage(aiResponse);

      // Store assistant message
      await fetch(apiUrl('/api/ivr/demo-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-message',
          userId: state.demoUserId,
          role: 'assistant',
          content: aiResponse,
        }),
      });

      // Add follow-up prompt in the selected language
      const msgs = MESSAGES[state.language];
      addMessage('assistant', msgs.followUp);
      speakMessage(msgs.followUp);
    } catch {
      const msgs = MESSAGES[state.language];
      addMessage('assistant', msgs.error);
      speakMessage(msgs.error);
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900/80 border-b border-slate-700/50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`${BASE_PATH}/Home/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Website
            </a>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Side - Phone Interface */}
        <div className="flex-1 py-8 px-4 pr-80">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-2">
                <h1 className="text-3xl font-bold">IVR Demo</h1>
                {(state.isActive || state.messages.length > 0 || state.transferCode) && (
                  <button
                    onClick={resetDemo}
                    className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                    title="Reset demo"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-slate-300">
                Simulate the Chat Core IQ phone IVR experience
              </p>
            </div>

            {/* Phone Interface */}
            <div className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
          {/* Phone Top Bar */}
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">Chat Core IQ IVR</span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors ${
                  state.audioEnabled
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={state.audioEnabled ? 'Audio on - click to mute' : 'Audio off - click to unmute'}
              >
                {state.audioEnabled ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
                {state.audioEnabled ? 'ON' : 'OFF'}
              </button>
              <span className="text-slate-300">
                {state.isActive ? 'In Call' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Call Display */}
          <div className="p-6 min-h-[400px] max-h-[500px] overflow-y-auto bg-slate-850">
            {!state.isActive ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-slate-300 mb-4">305-593-6725</p>
                <button
                  onClick={startCall}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-full font-semibold transition-colors"
                >
                  Start Call
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.type === 'user' ? 'justify-end' :
                      msg.type === 'system' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        msg.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : msg.type === 'system'
                          ? 'bg-slate-700 text-slate-300 text-sm'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      <div className="leading-relaxed">
                        {msg.type === 'assistant' ? formatMessageText(msg.text) : msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {state.isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Transfer Code Display */}
          {state.transferCode && (
            <div className="bg-blue-900/50 border-t border-blue-800 p-4">
              <p className="text-center text-sm text-blue-300 mb-2">Transfer Code</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-mono font-bold tracking-widest text-blue-200">
                  {state.transferCode}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(state.transferCode || '');
                    // Brief visual feedback
                    const btn = document.getElementById('copy-code-btn');
                    if (btn) {
                      btn.classList.add('text-green-400');
                      setTimeout(() => btn.classList.remove('text-green-400'), 1000);
                    }
                  }}
                  id="copy-code-btn"
                  className="p-2 hover:bg-blue-800/50 rounded-lg transition-colors text-blue-300 hover:text-blue-100"
                  title="Copy to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              {/* Open Website Button */}
              <button
                onClick={() => {
                  // Stop IVR TTS before transferring to prevent audio overlap
                  stopElevenLabsSpeaking();
                  // Build conversation history for transfer (filter out system messages and IVR-specific prompts)
                  const conversationHistory = state.messages
                    .filter(m => m.type === 'user' || m.type === 'assistant')
                    .filter(m => {
                      const text = m.text.toLowerCase();
                      // Filter out IVR-specific messages
                      return !text.includes('press 1') &&
                             !text.includes('presione') &&
                             !text.includes('peze') &&
                             !text.includes('transfer code') &&
                             !text.includes('código de transferencia') &&
                             !text.includes('kòd transfè');
                    })
                    .map(m => ({ role: m.type, content: m.text }));
                  // Encode conversation for URL (works across serverless instances)
                  // Use UTF-8 safe base64 encoding to handle Unicode characters
                  const jsonStr = JSON.stringify({
                    messages: conversationHistory,
                    language: state.language,
                  });
                  // Safe base64 encode: UTF-8 → percent-encoded → binary string → base64
                  const historyParam = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
                  const websiteUrl = `/Home/index.html?transfer=${state.transferCode}&history=${historyParam}`;
                  window.open(websiteUrl, '_blank');
                }}
                className="mt-3 w-full py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Website & Continue Chat
              </button>
            </div>
          )}

          {/* Controls */}
          {state.isActive && (
            <div className="p-4 bg-slate-900 space-y-4">
              {/* DTMF Keypad */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(digit => {
                  // Dynamic labels based on current phase
                  let label = '';
                  if (!state.languageSelected) {
                    // Language selection phase
                    if (digit === '1') label = 'English';
                    else if (digit === '2') label = 'Español';
                    else if (digit === '3') label = 'Kreyòl';
                  } else {
                    // Main menu phase
                    if (digit === '1') label = 'Agent';
                    else if (digit === '2') label = 'Web';
                    else if (digit === '0') label = 'End';
                  }

                  return (
                    <button
                      key={digit}
                      onClick={() => handleDTMF(digit)}
                      disabled={state.isProcessing}
                      className="py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      {digit}
                      <span className="block text-[10px] text-slate-300">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Speech Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSpeech()}
                  placeholder="Type to simulate speech..."
                  disabled={state.isProcessing}
                  className="flex-1 px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSpeech}
                  disabled={state.isProcessing || !input.trim()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Speak
                </button>
              </div>

              {/* End Call */}
              <button
                onClick={endCall}
                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                End Call
              </button>
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Right Side - Fixed Instructions */}
        <div className="fixed right-0 top-0 w-72 h-screen bg-slate-800/90 border-l border-slate-700 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">How to Use</h2>

          {/* Step 1: Language Selection */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Step 1: Select Language</h3>
            <ul className="space-y-1 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">1</span>
                <span>English</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono">2</span>
                <span>Español (Spanish)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-mono">3</span>
                <span>Kreyòl Ayisyen (Haitian Creole)</span>
              </li>
            </ul>
          </div>

          {/* Step 2: Main Menu */}
          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Step 2: Main Menu</h3>
            <ul className="space-y-1 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 font-mono">1</span>
                <span>Transfer to live agent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-mono">2</span>
                <span>Get transfer code for website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 font-mono">0</span>
                <span>End call</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <h3 className="font-semibold mb-2 text-sm">Voice Commands</h3>
            <ul className="space-y-1 text-slate-300 text-xs">
              <li>Say &quot;website&quot; or &quot;transfer&quot; for transfer code</li>
              <li>Say &quot;agent&quot; or &quot;human&quot; for live agent</li>
              <li>Say &quot;goodbye&quot; to end the call</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

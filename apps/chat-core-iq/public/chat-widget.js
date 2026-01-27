/**
 * Chat Core IQ Chat Widget
 * Embeddable floating chat widget with RAG-powered responses
 * Bilingual (English/Spanish) support
 *
 * Features:
 * - Conversation history persistence (localStorage)
 * - Enhanced typing indicator
 * - Message timestamp grouping (Today/Yesterday/Date)
 * - Quick Actions menu
 * - Feedback API integration
 * - Full accessibility (WCAG 2.1 AA)
 * - Dynamic page-aware suggestions
 * - Conversation logging
 */
(function() {
  'use strict';

  // Configuration - will be overridden by admin settings
  // API Base URL - auto-detect production vs localhost
  function getApiBase() {
    if (window.CHAT_WIDGET_API_BASE) return window.CHAT_WIDGET_API_BASE;
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3002/dcq';
    }
    // Production: use current origin + basePath
    return window.location.origin + '/dcq';
  }
  const API_BASE = getApiBase();

  const CONFIG = {
    apiUrl: API_BASE + '/api/chat',
    feedbackUrl: API_BASE + '/api/feedback',
    logUrl: API_BASE + '/api/log',
    settingsUrl: API_BASE + '/api/settings',
    languagesUrl: API_BASE + '/api/languages',
    sessionUrl: API_BASE + '/api/session', // Cross-channel session transfer
    ttsUrl: API_BASE + '/api/tts', // ElevenLabs TTS API
    defaultLanguage: 'en',
    storageKey: 'doral_chat_history',
    sessionKey: 'doral_chat_session',
    maxMessages: 50,
    historyExpiry: 24 * 60 * 60 * 1000, // 24 hours in ms
    // Dynamic settings from admin (will be loaded on init)
    primaryColor: '#1a237e',
    position: 'bottom-right',
    showSources: true,
    showFeedback: true,
    welcomeMessageEn: null, // Custom welcome message (English)
    welcomeMessageEs: null, // Custom welcome message (Spanish)
    welcomeMessageHt: null, // Custom welcome message (Haitian Creole)
    sessionTimeout: 30, // minutes
    settingsLoaded: false,
    enabledLanguages: ['en', 'es', 'ht'] // Will be loaded from API
  };

  // Load settings from admin panel
  async function loadWidgetConfig() {
    try {
      // Fetch settings and languages in parallel
      const [settingsResponse, languagesResponse] = await Promise.all([
        fetch(CONFIG.settingsUrl),
        fetch(CONFIG.languagesUrl)
      ]);

      // Process settings
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();

        // Apply settings to CONFIG
        if (settings.appearance) {
          CONFIG.primaryColor = settings.appearance.primaryColor || CONFIG.primaryColor;
          CONFIG.position = settings.appearance.position || CONFIG.position;
          CONFIG.showSources = settings.appearance.showSources ?? CONFIG.showSources;
          CONFIG.showFeedback = settings.appearance.showFeedback ?? CONFIG.showFeedback;
        }

        if (settings.general) {
          CONFIG.defaultLanguage = settings.general.defaultLanguage || CONFIG.defaultLanguage;
          CONFIG.welcomeMessageEn = settings.general.welcomeMessage || null;
          CONFIG.welcomeMessageEs = settings.general.welcomeMessageEs || null;
          CONFIG.welcomeMessageHt = settings.general.welcomeMessageHt || null;
        }

        if (settings.chatbot) {
          CONFIG.maxMessages = settings.chatbot.maxMessagesPerSession || CONFIG.maxMessages;
          CONFIG.sessionTimeout = settings.chatbot.sessionTimeout || CONFIG.sessionTimeout;
          CONFIG.historyExpiry = (settings.chatbot.sessionTimeout || 30) * 60 * 1000;
        }
      } else {
        console.warn('[DoralChat] Failed to load settings, using defaults');
      }

      // Process languages
      if (languagesResponse.ok) {
        const languagesData = await languagesResponse.json();
        const languages = languagesData.languages || [];
        CONFIG.enabledLanguages = languages
          .filter(l => l.enabled)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(l => l.code);

        // If current default language is not enabled, use first enabled language
        if (!CONFIG.enabledLanguages.includes(CONFIG.defaultLanguage) && CONFIG.enabledLanguages.length > 0) {
          CONFIG.defaultLanguage = CONFIG.enabledLanguages[0];
        }
      }

      CONFIG.settingsLoaded = true;

      // Apply dynamic styles
      applyDynamicStyles();

    } catch (error) {
      console.warn('[DoralChat] Error loading settings:', error);
    }
  }

  // Apply dynamic CSS based on admin settings
  function applyDynamicStyles() {
    const styleId = 'doral-dynamic-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    // Calculate position values
    const isLeft = CONFIG.position.includes('left');
    const isTop = CONFIG.position.includes('top');

    styleEl.textContent = `
      :root {
        --doral-primary: ${CONFIG.primaryColor};
        --doral-primary-dark: ${darkenColor(CONFIG.primaryColor, 30)};
        --doral-primary-light: ${lightenColor(CONFIG.primaryColor, 30)};
        --doral-bg-chat-user: ${CONFIG.primaryColor};
        --doral-focus: ${lightenColor(CONFIG.primaryColor, 15)};
        --doral-focus-ring: ${CONFIG.primaryColor}66;
        --doral-hover: ${lightenColor(CONFIG.primaryColor, 50)};
      }

      .doral-chat-fab {
        ${isLeft ? 'left: 24px; right: auto;' : 'right: 24px; left: auto;'}
        ${isTop ? 'top: 24px; bottom: auto;' : 'bottom: 24px; top: auto;'}
      }

      .doral-chat-panel {
        ${isLeft ? 'left: 24px; right: auto;' : 'right: 24px; left: auto;'}
        ${isTop ? 'top: 100px; bottom: auto;' : 'bottom: 100px; top: auto;'}
      }
    `;
  }

  // Helper: Darken a hex color
  function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  // Helper: Lighten a hex color
  function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  // Generate unique IDs
  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Bilingual labels
  const LABELS = {
    en: {
      title: 'Chat Core IQ Assistant',
      subtitle: 'Always here to help',
      placeholder: 'Type your question...',
      send: 'Send',
      sources: 'Sources',
      feedback: 'Was this helpful?',
      escalateMessage: 'Would you like to speak with a representative?',
      escalateButton: 'Talk to a Human',
      suggested: 'Suggested questions:',
      disclaimer: 'Powered by AI - Information may not always be accurate',
      typing: 'Chat Core IQ is typing',
      today: 'Today',
      yesterday: 'Yesterday',
      clearHistory: 'Clear chat',
      quickActions: 'Quick Actions',
      transferCode: 'Have a transfer code?',
      transferCodeTitle: 'Continue Conversation',
      transferCodePlaceholder: 'Enter 6-character code',
      transferCodeButton: 'Continue',
      transferCodeCancel: 'Cancel',
      transferCodeSuccess: 'Conversation restored! You can continue where you left off.',
      transferCodeError: 'Invalid or expired code. Please try again.',
      transferCodeInstructions: 'Enter the code from your phone call or SMS to continue your conversation here.',
      suggestions: [
        'What are the city hall hours?',
        'How do I apply for a building permit?',
        'What events are coming up?',
        'Where are the parks located?'
      ],
      welcome: "Hello! I'm the Chat Core IQ Assistant. How can I help you today?",
      voiceOn: 'Voice enabled',
      voiceOff: 'Voice disabled',
      voiceToggle: 'Toggle voice assistant'
    },
    es: {
      title: 'Asistente Chat Core IQ',
      subtitle: 'Siempre aquí para ayudar',
      placeholder: 'Escriba su pregunta...',
      send: 'Enviar',
      sources: 'Fuentes',
      feedback: '¿Fue útil?',
      escalateMessage: '¿Le gustaría hablar con un representante?',
      escalateButton: 'Hablar con un Representante',
      suggested: 'Preguntas sugeridas:',
      disclaimer: 'Impulsado por IA - La información puede no ser siempre precisa',
      typing: 'Chat Core IQ está escribiendo',
      today: 'Hoy',
      yesterday: 'Ayer',
      clearHistory: 'Borrar chat',
      quickActions: 'Acciones Rápidas',
      transferCode: '¿Tiene un código de transferencia?',
      transferCodeTitle: 'Continuar Conversación',
      transferCodePlaceholder: 'Ingrese código de 6 caracteres',
      transferCodeButton: 'Continuar',
      transferCodeCancel: 'Cancelar',
      transferCodeSuccess: '¡Conversación restaurada! Puede continuar donde lo dejó.',
      transferCodeError: 'Código inválido o expirado. Por favor intente de nuevo.',
      transferCodeInstructions: 'Ingrese el código de su llamada telefónica o SMS para continuar su conversación aquí.',
      suggestions: [
        '¿Cuál es el horario del ayuntamiento?',
        '¿Cómo solicito un permiso de construcción?',
        '¿Qué eventos hay próximamente?',
        '¿Dónde están los parques?'
      ],
      welcome: '¡Hola! Soy el Asistente Chat Core IQ. ¿Cómo puedo ayudarle hoy?',
      voiceOn: 'Voz activada',
      voiceOff: 'Voz desactivada',
      voiceToggle: 'Alternar asistente de voz'
    },
    ht: {
      title: 'Asistan Chat Core IQ',
      subtitle: 'Toujou la pou ede ou',
      placeholder: 'Ekri kesyon ou...',
      send: 'Voye',
      sources: 'Sous',
      feedback: 'Èske sa te itil?',
      escalateMessage: 'Èske ou ta renmen pale ak yon reprezantan?',
      escalateButton: 'Pale ak yon Moun',
      suggested: 'Kesyon sijere:',
      disclaimer: 'Pouvwa IA - Enfòmasyon yo ka pa toujou egzat',
      typing: 'Chat Core IQ ap ekri',
      today: 'Jodi a',
      yesterday: 'Yè',
      clearHistory: 'Efase chat la',
      quickActions: 'Aksyon Rapid',
      transferCode: 'Ou gen yon kòd transfè?',
      transferCodeTitle: 'Kontinye Konvèsasyon',
      transferCodePlaceholder: 'Antre kòd 6 karaktè',
      transferCodeButton: 'Kontinye',
      transferCodeCancel: 'Anile',
      transferCodeSuccess: 'Konvèsasyon retabli! Ou ka kontinye kote ou te rete a.',
      transferCodeError: 'Kòd envalid oswa ekspire. Tanpri eseye ankò.',
      transferCodeInstructions: 'Antre kòd ki soti nan apèl telefòn oswa SMS ou pou kontinye konvèsasyon ou isit la.',
      suggestions: [
        'Ki lè Mezon Vil la ouvri?',
        'Kijan pou mwen aplike pou yon pèmi konstriksyon?',
        'Ki evènman ki gen k ap vini?',
        'Ki kote pak yo ye?'
      ],
      welcome: 'Bonjou! Mwen se Asistan Chat Core IQ. Kijan mwen ka ede ou jodi a?',
      voiceOn: 'Vwa aktive',
      voiceOff: 'Vwa dezaktive',
      voiceToggle: 'Chanje asistan vwa'
    }
  };

  // Quick Actions - 10 common topics from knowledge base
  const QUICK_ACTIONS = {
    en: [
      { id: 'permits', label: 'Building Permits', icon: '🏗️', query: 'How do I apply for a building permit?' },
      { id: 'utilities', label: 'Pay Utilities', icon: '💧', query: 'How do I pay my water bill?' },
      { id: 'hours', label: 'City Hall Hours', icon: '🕐', query: 'What are the City Hall hours?' },
      { id: 'parks', label: 'Parks & Rec', icon: '🌳', query: 'What parks and recreation programs are available?' },
      { id: 'report', label: 'Report Issue', icon: '📋', query: 'How do I report a pothole or issue?' },
      { id: 'police', label: 'Police Services', icon: '🚔', query: 'How do I contact Doral Police?' },
      { id: 'business', label: 'Business License', icon: '🏢', query: 'How do I get a business license?' },
      { id: 'events', label: 'City Events', icon: '📅', query: 'What events are coming up in Doral?' },
      { id: 'jobs', label: 'Job Openings', icon: '💼', query: 'What job opportunities are available with the city?' },
      { id: 'code', label: 'Code Compliance', icon: '📜', query: 'How do I report a code violation?' }
    ],
    es: [
      { id: 'permits', label: 'Permisos', icon: '🏗️', query: '¿Cómo solicito un permiso de construcción?' },
      { id: 'utilities', label: 'Pagar Servicios', icon: '💧', query: '¿Cómo pago mi factura de agua?' },
      { id: 'hours', label: 'Horario', icon: '🕐', query: '¿Cuál es el horario del Ayuntamiento?' },
      { id: 'parks', label: 'Parques', icon: '🌳', query: '¿Qué programas de parques y recreación hay?' },
      { id: 'report', label: 'Reportar', icon: '📋', query: '¿Cómo reporto un bache o problema?' },
      { id: 'police', label: 'Policía', icon: '🚔', query: '¿Cómo contacto a la Policía de Doral?' },
      { id: 'business', label: 'Licencia Comercial', icon: '🏢', query: '¿Cómo obtengo una licencia comercial?' },
      { id: 'events', label: 'Eventos', icon: '📅', query: '¿Qué eventos hay próximamente en Doral?' },
      { id: 'jobs', label: 'Empleos', icon: '💼', query: '¿Qué oportunidades de trabajo hay en la ciudad?' },
      { id: 'code', label: 'Códigos', icon: '📜', query: '¿Cómo reporto una violación de código?' }
    ],
    ht: [
      { id: 'permits', label: 'Pèmi', icon: '🏗️', query: 'Kijan pou mwen aplike pou yon pèmi konstriksyon?' },
      { id: 'utilities', label: 'Peye Sèvis', icon: '💧', query: 'Kijan pou mwen peye bòdwo dlo mwen an?' },
      { id: 'hours', label: 'Orè', icon: '🕐', query: 'Ki lè Mezon Vil la ouvri?' },
      { id: 'parks', label: 'Pak', icon: '🌳', query: 'Ki pwogram pak ak rekreyasyon ki disponib?' },
      { id: 'report', label: 'Rapòte', icon: '📋', query: 'Kijan pou mwen rapòte yon pwoblèm oswa twou?' },
      { id: 'police', label: 'Polis', icon: '🚔', query: 'Kijan pou mwen kontakte Polis Doral la?' },
      { id: 'business', label: 'Lisans Biznis', icon: '🏢', query: 'Kijan pou mwen jwenn yon lisans biznis?' },
      { id: 'events', label: 'Evènman', icon: '📅', query: 'Ki evènman ki gen k ap vini nan Doral?' },
      { id: 'jobs', label: 'Travay', icon: '💼', query: 'Ki opòtinite travay ki disponib nan vil la?' },
      { id: 'code', label: 'Kòd', icon: '📜', query: 'Kijan pou mwen rapòte yon vyolasyon kòd?' }
    ]
  };

  // Page-specific suggestions
  const PAGE_SUGGESTIONS = {
    en: {
      '/Government': [
        'Who is the Mayor of Doral?',
        'When is the next city council meeting?',
        'How can I contact my council member?'
      ],
      '/Departments': [
        'What departments does the city have?',
        'How do I reach the Building Department?',
        'What does Code Enforcement handle?'
      ],
      '/Residents': [
        'What services are available for residents?',
        'How do I sign up for utility services?',
        'Where can I find recycling information?'
      ],
      '/Business': [
        'How do I get a business license?',
        'What permits do I need to open a business?',
        'Are there business incentives available?'
      ],
      '/Parks': [
        'What parks are in Doral?',
        'What are the park hours?',
        'Can I reserve a pavilion?'
      ],
      '/Police': [
        'How do I contact Doral Police?',
        'Where is the police station?',
        'How do I file a police report?'
      ],
      default: [
        'What are the city hall hours?',
        'How do I apply for a building permit?',
        'How do I pay my water bill?',
        'What events are coming up?',
        'Where are the parks located?',
        'How do I report a pothole?',
        'How do I get a business license?',
        'What job openings are available?',
        'How do I contact Doral Police?',
        'How do I register for youth sports?'
      ]
    },
    es: {
      '/Government': [
        '¿Quién es el Alcalde de Doral?',
        '¿Cuándo es la próxima reunión del concejo?',
        '¿Cómo contacto a mi concejal?'
      ],
      '/Departments': [
        '¿Qué departamentos tiene la ciudad?',
        '¿Cómo contacto al Departamento de Construcción?',
        '¿Qué maneja Cumplimiento de Códigos?'
      ],
      '/Residents': [
        '¿Qué servicios hay para residentes?',
        '¿Cómo me registro para servicios públicos?',
        '¿Dónde encuentro información de reciclaje?'
      ],
      '/Business': [
        '¿Cómo obtengo una licencia comercial?',
        '¿Qué permisos necesito para un negocio?',
        '¿Hay incentivos para negocios?'
      ],
      '/Parks': [
        '¿Qué parques hay en Doral?',
        '¿Cuál es el horario de los parques?',
        '¿Puedo reservar un pabellón?'
      ],
      '/Police': [
        '¿Cómo contacto a la Policía de Doral?',
        '¿Dónde está la estación de policía?',
        '¿Cómo presento un reporte policial?'
      ],
      default: [
        '¿Cuál es el horario del ayuntamiento?',
        '¿Cómo solicito un permiso de construcción?',
        '¿Cómo pago mi factura de agua?',
        '¿Qué eventos hay próximamente?',
        '¿Dónde están los parques?',
        '¿Cómo reporto un bache?',
        '¿Cómo obtengo una licencia comercial?',
        '¿Qué empleos hay disponibles?',
        '¿Cómo contacto a la Policía de Doral?',
        '¿Cómo registro a mi hijo para deportes?'
      ]
    },
    ht: {
      '/Government': [
        'Ki moun ki Majistra Doral?',
        'Ki lè pwochen reyinyon konsèy vil la?',
        'Kijan pou mwen kontakte manm konsèy mwen an?'
      ],
      '/Departments': [
        'Ki depatman vil la genyen?',
        'Kijan pou mwen kontakte Depatman Konstriksyon an?',
        'Ki sa Konplizyans Kòd la jere?'
      ],
      '/Residents': [
        'Ki sèvis ki disponib pou rezidan yo?',
        'Kijan pou mwen enskri pou sèvis piblik yo?',
        'Ki kote mwen ka jwenn enfòmasyon sou resiklaj?'
      ],
      '/Business': [
        'Kijan pou mwen jwenn yon lisans biznis?',
        'Ki pèmi mwen bezwen pou ouvri yon biznis?',
        'Èske gen avantaj pou biznis yo?'
      ],
      '/Parks': [
        'Ki pak ki nan Doral?',
        'Ki orè pak yo?',
        'Èske mwen ka rezève yon pavilyon?'
      ],
      '/Police': [
        'Kijan pou mwen kontakte Polis Doral la?',
        'Ki kote estasyon polis la ye?',
        'Kijan pou mwen fè yon rapò polis?'
      ],
      default: [
        'Ki lè Mezon Vil la ouvri?',
        'Kijan pou mwen aplike pou yon pèmi konstriksyon?',
        'Kijan pou mwen peye bòdwo dlo mwen an?',
        'Ki evènman ki gen k ap vini?',
        'Ki kote pak yo ye?',
        'Kijan pou mwen rapòte yon twou?',
        'Kijan pou mwen jwenn yon lisans biznis?',
        'Ki travay ki disponib?',
        'Kijan pou mwen kontakte Polis Doral la?',
        'Kijan pou mwen enskri pitit mwen pou espò?'
      ]
    }
  };

  // SVG Icons (all with fill="currentColor" for proper rendering)
  const ICONS = {
    chat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    bot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5A2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5z"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    transfer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/><path d="M9 12l4-4v3h4v2h-4v3z"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
    speakerOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
    speakerOff: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
  };

  // State
  let state = {
    isOpen: false,
    language: CONFIG.defaultLanguage,
    messages: [],
    isLoading: false,
    sessionId: null,
    conversationId: null,
    lastActivity: null,
    activeWorkflow: null, // Track active workflow state
    workflowStep: 0,
    voiceEnabled: false, // Voice assistant disabled by default
    isSpeaking: false,  // Currently speaking
    currentAudio: null  // Current audio element for stopping
  };

  // DOM Elements
  let elements = {};

  // ==================== STORAGE FUNCTIONS ====================

  function getSession() {
    try {
      const stored = localStorage.getItem(CONFIG.sessionKey);
      if (stored) {
        const session = JSON.parse(stored);
        // Check if session is still valid (24h)
        if (Date.now() - session.createdAt < CONFIG.historyExpiry) {
          return session;
        }
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
    }
    // Create new session
    const newSession = {
      id: generateId('sess'),
      createdAt: Date.now()
    };
    localStorage.setItem(CONFIG.sessionKey, JSON.stringify(newSession));
    return newSession;
  }

  function loadConversation() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        // Check if history is still valid (24h)
        if (Date.now() - data.lastActivity < CONFIG.historyExpiry) {
          return {
            messages: data.messages.slice(-CONFIG.maxMessages),
            conversationId: data.conversationId,
            language: data.language || CONFIG.defaultLanguage
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load conversation:', e);
    }
    return null;
  }

  function saveConversation() {
    try {
      const data = {
        messages: state.messages.slice(-CONFIG.maxMessages),
        conversationId: state.conversationId,
        language: state.language,
        lastActivity: Date.now()
      };
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save conversation:', e);
    }
  }

  function clearConversation() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
      state.messages = [];
      state.conversationId = generateId('conv');
      elements.messages.innerHTML = '';
      addWelcomeMessage();
      updateSuggestionsForPage();
    } catch (e) {
      console.warn('Failed to clear conversation:', e);
    }
  }

  // ==================== TTS (TEXT-TO-SPEECH) FUNCTIONS ====================

  // Stop any currently playing audio
  function stopSpeaking() {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio.currentTime = 0;
      state.currentAudio = null;
    }
    state.isSpeaking = false;
    updateVoiceButtonUI();
  }

  // Speak text using ElevenLabs TTS API
  async function speakText(text) {
    if (!state.voiceEnabled || !text) return;

    // Stop any current speech first
    stopSpeaking();

    // Clean text for speech (remove markdown, links, etc.)
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links but keep text
      .replace(/#{1,6}\s/g, '')  // Remove headers
      .replace(/[•\-]\s/g, '')  // Remove bullets
      .replace(/\n+/g, '. ')  // Replace newlines with pauses
      .replace(/\s+/g, ' ')  // Normalize spaces
      // Apply pronunciation fixes: "Doral" -> "dough-ral"
      .replace(/\bDoral\b/g, 'dough-ral')
      .replace(/\bDORAL\b/g, 'DOUGH-RAL')
      .replace(/\bdoral\b/g, 'dough-ral')
      .trim();

    if (!cleanText) return;

    try {
      state.isSpeaking = true;
      updateVoiceButtonUI();

      const response = await fetch(CONFIG.ttsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          language: state.language
        })
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);
      state.currentAudio = audio;

      audio.onended = () => {
        state.isSpeaking = false;
        state.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        updateVoiceButtonUI();
      };

      audio.onerror = () => {
        console.warn('[DoralChat] Audio playback error');
        state.isSpeaking = false;
        state.currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        updateVoiceButtonUI();
      };

      await audio.play();

    } catch (error) {
      console.warn('[DoralChat] TTS error:', error);
      state.isSpeaking = false;
      updateVoiceButtonUI();
    }
  }

  // Toggle voice assistant on/off
  function toggleVoice() {
    state.voiceEnabled = !state.voiceEnabled;
    if (!state.voiceEnabled) {
      stopSpeaking();
    }
    updateVoiceButtonUI();
    // Save voice preference
    try {
      localStorage.setItem('doral_voice_enabled', state.voiceEnabled.toString());
    } catch (e) {
      console.warn('Failed to save voice preference:', e);
    }
  }

  // Load voice preference from localStorage
  function loadVoicePreference() {
    try {
      const stored = localStorage.getItem('doral_voice_enabled');
      if (stored !== null) {
        state.voiceEnabled = stored === 'true';
      }
    } catch (e) {
      console.warn('Failed to load voice preference:', e);
    }
  }

  // Update voice button UI to reflect current state
  function updateVoiceButtonUI() {
    if (!elements.voiceBtn) return;
    const labels = LABELS[state.language] || LABELS.en;

    elements.voiceBtn.innerHTML = state.voiceEnabled ? ICONS.speakerOn : ICONS.speakerOff;
    elements.voiceBtn.setAttribute('aria-label', state.voiceEnabled ? labels.voiceOn : labels.voiceOff);
    elements.voiceBtn.setAttribute('title', state.voiceEnabled ? labels.voiceOn : labels.voiceOff);
    elements.voiceBtn.classList.toggle('doral-voice-active', state.voiceEnabled);
    elements.voiceBtn.classList.toggle('doral-voice-speaking', state.isSpeaking);
  }

  // ==================== PAGE CONTEXT FUNCTIONS ====================

  function getCurrentPageContext() {
    const path = window.location.pathname;
    // Match page sections
    for (const key of Object.keys(PAGE_SUGGESTIONS.en)) {
      if (key !== 'default' && path.includes(key)) {
        return key;
      }
    }
    return 'default';
  }

  function getSuggestionsForPage() {
    const context = getCurrentPageContext();
    const langSuggestions = PAGE_SUGGESTIONS[state.language] || PAGE_SUGGESTIONS.en;
    return langSuggestions[context] || langSuggestions.default || PAGE_SUGGESTIONS.en.default;
  }

  function updateSuggestionsForPage() {
    const suggestions = getSuggestionsForPage();
    elements.suggestionsList.innerHTML = suggestions
      .map(q => `<button class="doral-chat-suggestion-btn">${q}</button>`)
      .join('');
  }

  // ==================== DATE/TIME FUNCTIONS ====================

  function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  function isYesterday(today, date) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(yesterday, date);
  }

  function formatMessageDate(timestamp) {
    const now = new Date();
    const msgDate = new Date(timestamp);
    const labels = LABELS[state.language] || LABELS.en;

    if (isSameDay(now, msgDate)) return labels.today;
    if (isYesterday(now, msgDate)) return labels.yesterday;

    // Map language codes to locale strings
    const localeMap = { en: 'en-US', es: 'es-ES', ht: 'fr-HT' };
    const locale = localeMap[state.language] || 'en-US';

    return msgDate.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric'
    });
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function shouldShowDateHeader(message, index) {
    if (index === 0) return true;
    const prevMsg = state.messages[index - 1];
    if (!prevMsg) return true;
    const prevDate = new Date(prevMsg.timestamp);
    const currDate = new Date(message.timestamp);
    return !isSameDay(prevDate, currDate);
  }

  // ==================== INITIALIZATION ====================

  async function init() {
    // Load admin settings first (async, non-blocking)
    await loadWidgetConfig();

    // Load voice preference from localStorage
    loadVoicePreference();

    // Set default language from config
    state.language = CONFIG.defaultLanguage;

    // Get or create session
    const session = getSession();
    state.sessionId = session.id;

    // Load existing conversation
    const savedConvo = loadConversation();
    if (savedConvo) {
      state.messages = savedConvo.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      state.conversationId = savedConvo.conversationId;
      state.language = savedConvo.language;
    } else {
      state.conversationId = generateId('conv');
    }

    createWidget();
    addEventListeners();

    // Render existing messages or add welcome
    if (state.messages.length > 0) {
      renderAllMessages();
    } else {
      addWelcomeMessage();
    }

    // Check for transfer code in URL parameter (IVR handoff)
    checkForTransferCodeInUrl();
  }

  // Check for ?transfer= URL parameter and auto-redeem
  async function checkForTransferCodeInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const transferCode = urlParams.get('transfer');
    const historyParam = urlParams.get('history');

    if (transferCode && transferCode.length === 6) {
      console.log('[DoralChat] Transfer code detected in URL:', transferCode);

      // Try to decode history from URL (for serverless environments)
      let urlHistory = null;
      if (historyParam) {
        try {
          // Safe UTF-8 base64 decode: base64 → binary string → percent-encoded → UTF-8
          const decoded = decodeURIComponent(escape(atob(decodeURIComponent(historyParam))));
          urlHistory = JSON.parse(decoded);
          console.log('[DoralChat] URL history decoded:', urlHistory.messages?.length, 'messages');
        } catch (e) {
          console.warn('[DoralChat] Failed to decode URL history:', e);
        }
      }

      // Clean up URL (remove the transfer and history parameters)
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);

      // Auto-open the chat widget
      if (!state.isOpen) {
        toggleChat();
      }

      // Small delay to ensure widget is rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Auto-redeem the transfer code (with fallback history from URL)
      await autoRedeemTransferCode(transferCode.toUpperCase(), urlHistory);
    }
  }

  // Auto-redeem transfer code (called from URL parameter)
  // urlHistory is a fallback for serverless environments where server may not have session data
  async function autoRedeemTransferCode(code, urlHistory) {
    const labels = LABELS[state.language] || LABELS.en;

    try {
      const response = await fetch(CONFIG.sessionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeem',
          token: code,
          targetChannel: 'web',
          targetUserId: state.sessionId
        })
      });

      const data = await response.json();

      // Use server data if available, otherwise fall back to URL history
      let messagesToRestore = [];
      let languageToUse = state.language;

      if (data.success && data.messages && data.messages.length > 0) {
        // Server has the messages
        console.log('[DoralChat] Using server messages:', data.messages.length);
        messagesToRestore = data.messages;
        languageToUse = data.language || state.language;
      } else if (urlHistory && urlHistory.messages && urlHistory.messages.length > 0) {
        // Fallback to URL history (serverless environment)
        console.log('[DoralChat] Using URL fallback messages:', urlHistory.messages.length);
        messagesToRestore = urlHistory.messages;
        languageToUse = urlHistory.language || state.language;
      }

      if (messagesToRestore.length > 0) {
        // Successfully restored - restore conversation
        // Clear existing messages
        state.messages = [];
        elements.messages.innerHTML = '';

        // Restore language from transferred session
        state.language = languageToUse;
        updateLabels();

        // Add transfer header banner
        renderTransferBanner();

        // Filter out IVR-specific instructions that don't apply to web chat
        const ivrPhrases = [
          'Press 1', 'Press 2', 'presione el', 'peze twa', 'peze de',
          'transfer code', 'código de transferencia', 'kòd transfè',
          'speak with a representative', 'hablar con un representante'
        ];

        const filteredMessages = messagesToRestore.filter(msg => {
          // Keep all user messages
          if (msg.role === 'user') return true;
          // Filter out assistant messages that are IVR-specific greetings
          const content = msg.content.toLowerCase();
          const isIvrGreeting = ivrPhrases.some(phrase => content.includes(phrase.toLowerCase()));
          return !isIvrGreeting;
        });

        // Add all transferred messages (marked as transferred)
        filteredMessages.forEach(msg => {
          const message = {
            id: generateId('msg'),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp || Date.now()),
            sources: [],
            escalate: false,
            feedback: null,
            actions: [],
            isTransferred: true // Mark as transferred for styling
          };
          state.messages.push(message);
        });

        // Render transferred messages with special styling
        renderTransferredMessages();

        // Add continuation divider
        renderContinuationDivider();

        // Save conversation locally
        state.conversationId = data.sessionId || generateId('conv');
        saveConversation();

        // Speak welcome (with delay to avoid overlap with IVR audio)
        if (state.voiceEnabled && filteredMessages.length > 0) {
          // Small delay to ensure IVR TTS has fully stopped
          setTimeout(() => {
            const welcomeSpoken = state.language === 'es'
              ? 'Bienvenido de vuelta. Su conversación ha sido restaurada. ¿En qué más puedo ayudarle?'
              : state.language === 'ht'
              ? 'Byenveni ankò. Konvèsasyon ou a te restore. Kijan mwen ka ede ou plis?'
              : 'Welcome back. Your conversation has been restored. How can I help you further?';
            speakText(welcomeSpoken);
          }, 500);
        }

        scrollToBottom();

      } else {
        // No messages to restore - show error
        console.warn('[DoralChat] Transfer code invalid or no messages:', code);
        addMessage('assistant', labels.transferCodeError, { skipVoice: false }, true);
      }
    } catch (error) {
      console.error('[DoralChat] Auto-transfer code error:', error);
      // Try URL history as last resort on error
      if (urlHistory && urlHistory.messages && urlHistory.messages.length > 0) {
        console.log('[DoralChat] API error, using URL fallback:', urlHistory.messages.length);
        // Restore from URL history
        state.messages = [];
        elements.messages.innerHTML = '';
        state.language = urlHistory.language || state.language;
        updateLabels();
        renderTransferBanner();

        urlHistory.messages.forEach(msg => {
          const message = {
            id: generateId('msg'),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(),
            sources: [],
            escalate: false,
            feedback: null,
            actions: [],
            isTransferred: true
          };
          state.messages.push(message);
        });
        renderTransferredMessages();
        renderContinuationDivider();
        saveConversation();
        scrollToBottom();
      } else {
        addMessage('assistant', labels.transferCodeError, { skipVoice: false }, true);
      }
    }
  }

  // Render the transfer banner at the top
  function renderTransferBanner() {
    const bannerText = {
      en: 'Conversation transferred from phone call',
      es: 'Conversación transferida desde llamada telefónica',
      ht: 'Konvèsasyon transfere soti nan apèl telefòn'
    };

    const bannerEl = document.createElement('div');
    bannerEl.className = 'doral-transfer-banner';
    bannerEl.innerHTML = `
      <div class="doral-transfer-banner-content">
        <svg class="doral-transfer-banner-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
        <span>${bannerText[state.language] || bannerText.en}</span>
      </div>
    `;
    elements.messages.appendChild(bannerEl);
  }

  // Render transferred messages with special styling
  function renderTransferredMessages() {
    state.messages.forEach((message, index) => {
      if (shouldShowDateHeader(message, index)) {
        renderDateHeader(message.timestamp);
      }
      renderTransferredMessage(message);
    });
  }

  // Render a single transferred message with phone indicator
  function renderTransferredMessage(message) {
    const isUser = message.role === 'user';

    const messageEl = document.createElement('div');
    messageEl.className = `doral-chat-message ${isUser ? 'doral-user' : 'doral-assistant'} doral-transferred-message`;
    messageEl.setAttribute('data-id', message.id);

    // Format content
    const formattedContent = isUser ? escapeHtml(message.content) : formatMarkdown(message.content);

    messageEl.innerHTML = `
      <div class="doral-chat-message-avatar">
        ${isUser ? ICONS.user : ICONS.bot}
      </div>
      <div class="doral-chat-message-content">
        <div class="doral-chat-bubble doral-transferred-bubble">${formattedContent}</div>
        <span class="doral-chat-time doral-transferred-time">
          <svg class="doral-phone-indicator" viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          ${formatTime(message.timestamp)}
        </span>
      </div>
    `;

    elements.messages.appendChild(messageEl);
  }

  // Render continuation divider
  function renderContinuationDivider() {
    const continueText = {
      en: 'Continue your conversation below',
      es: 'Continúe su conversación abajo',
      ht: 'Kontinye konvèsasyon ou anba a'
    };

    const dividerEl = document.createElement('div');
    dividerEl.className = 'doral-continuation-divider';
    dividerEl.innerHTML = `
      <div class="doral-divider-line"></div>
      <div class="doral-divider-content">
        <svg class="doral-divider-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
        </svg>
        <span>${continueText[state.language] || continueText.en}</span>
      </div>
      <div class="doral-divider-line"></div>
    `;
    elements.messages.appendChild(dividerEl);
  }

  // ==================== WIDGET CREATION ====================

  function createWidget() {
    // FAB Button
    const fab = document.createElement('button');
    fab.className = 'doral-chat-fab';
    fab.setAttribute('aria-label', 'Open chat');
    fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = `
      <span class="doral-chat-icon">${ICONS.chat}</span>
      <span class="doral-close-icon">${ICONS.close}</span>
    `;
    document.body.appendChild(fab);
    elements.fab = fab;

    // Chat Panel
    const panel = document.createElement('div');
    panel.className = 'doral-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Chat Core IQ Assistant');
    panel.setAttribute('aria-modal', 'true');
    panel.innerHTML = createPanelHTML();
    document.body.appendChild(panel);
    elements.panel = panel;

    // Cache elements
    elements.header = panel.querySelector('.doral-chat-header');
    elements.title = panel.querySelector('.doral-chat-title');
    elements.subtitle = panel.querySelector('.doral-chat-subtitle');
    elements.transferBtn = panel.querySelector('.doral-chat-transfer-btn');
    elements.voiceBtn = panel.querySelector('.doral-chat-voice-btn');
    elements.langDropdown = panel.querySelector('.doral-chat-lang-dropdown');
    elements.langBtn = panel.querySelector('.doral-chat-lang-btn');
    elements.langMenu = panel.querySelector('.doral-chat-lang-menu');
    elements.langOptions = panel.querySelectorAll('.doral-chat-lang-option');
    elements.clearBtn = panel.querySelector('.doral-chat-clear-btn');
    elements.closeBtn = panel.querySelector('.doral-chat-close-btn');
    elements.transferModal = panel.querySelector('.doral-transfer-modal');
    elements.transferModalBackdrop = panel.querySelector('.doral-transfer-modal-backdrop');
    elements.transferCodeInput = panel.querySelector('.doral-transfer-code-input');
    elements.transferError = panel.querySelector('.doral-transfer-error');
    elements.transferCancelBtn = panel.querySelector('.doral-transfer-cancel-btn');
    elements.transferSubmitBtn = panel.querySelector('.doral-transfer-submit-btn');
    elements.messages = panel.querySelector('.doral-chat-messages');
    elements.quickActions = panel.querySelector('.doral-chat-quick-actions');
    elements.quickActionsList = panel.querySelector('.doral-chat-quick-actions-list');
    elements.suggestions = panel.querySelector('.doral-chat-suggestions');
    elements.suggestionsLabel = panel.querySelector('.doral-chat-suggestions-label');
    elements.suggestionsList = panel.querySelector('.doral-chat-suggestions-list');
    elements.input = panel.querySelector('.doral-chat-input');
    elements.sendBtn = panel.querySelector('.doral-chat-send-btn');
    elements.disclaimer = panel.querySelector('.doral-chat-disclaimer');
  }

  function createPanelHTML() {
    const labels = LABELS[state.language] || LABELS.en;
    const actions = QUICK_ACTIONS[state.language] || QUICK_ACTIONS.en;
    const suggestions = getSuggestionsForPage();

    return `
      <div class="doral-chat-header">
        <div class="doral-chat-header-left">
          <div class="doral-chat-avatar">${ICONS.bot}</div>
          <div>
            <h2 class="doral-chat-title">${labels.title}</h2>
            <p class="doral-chat-subtitle">${labels.subtitle}</p>
          </div>
        </div>
        <div class="doral-chat-header-right">
          <button class="doral-chat-transfer-btn" aria-label="${labels.transferCode}" title="${labels.transferCode}">
            ${ICONS.key}
          </button>
          <button class="doral-chat-voice-btn ${state.voiceEnabled ? 'doral-voice-active' : ''}"
                  aria-label="${labels.voiceToggle}"
                  title="${state.voiceEnabled ? labels.voiceOn : labels.voiceOff}">
            ${state.voiceEnabled ? ICONS.speakerOn : ICONS.speakerOff}
          </button>
          <div class="doral-chat-lang-dropdown">
            <button class="doral-chat-lang-btn" aria-label="Select language" aria-expanded="false" aria-haspopup="listbox">
              ${ICONS.globe}
              <span class="doral-lang-code">${state.language.toUpperCase()}</span>
              <svg class="doral-lang-chevron" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
            </button>
            <div class="doral-chat-lang-menu" role="listbox" aria-label="Language options">
              <div class="doral-lang-menu-header">Select Language</div>
              <button class="doral-chat-lang-option" data-lang="en" role="option" aria-selected="${state.language === 'en'}">
                <span class="doral-lang-check">${state.language === 'en' ? '✓' : ''}</span>
                <div class="doral-lang-info">
                  <span class="doral-lang-name">English</span>
                  <span class="doral-lang-desc">Continue in English</span>
                </div>
              </button>
              <button class="doral-chat-lang-option" data-lang="es" role="option" aria-selected="${state.language === 'es'}">
                <span class="doral-lang-check">${state.language === 'es' ? '✓' : ''}</span>
                <div class="doral-lang-info">
                  <span class="doral-lang-name">Español</span>
                  <span class="doral-lang-sub">(Spanish)</span>
                  <span class="doral-lang-desc">Continuar en español</span>
                </div>
              </button>
              <button class="doral-chat-lang-option" data-lang="ht" role="option" aria-selected="${state.language === 'ht'}">
                <span class="doral-lang-check">${state.language === 'ht' ? '✓' : ''}</span>
                <div class="doral-lang-info">
                  <span class="doral-lang-name">Kreyòl Ayisyen</span>
                  <span class="doral-lang-sub">(Haitian Creole)</span>
                  <span class="doral-lang-desc">Kontinye nan Kreyòl</span>
                </div>
              </button>
            </div>
          </div>
          <button class="doral-chat-clear-btn" aria-label="${labels.clearHistory}" title="${labels.clearHistory}">
            ${ICONS.trash}
          </button>
          <button class="doral-chat-close-btn" aria-label="Close chat" title="Escape">
            ${ICONS.close}
          </button>
        </div>
      </div>
      <div class="doral-transfer-modal" aria-hidden="true" role="dialog" aria-labelledby="transfer-modal-title">
        <div class="doral-transfer-modal-backdrop"></div>
        <div class="doral-transfer-modal-content">
          <h3 id="transfer-modal-title" class="doral-transfer-modal-title">${labels.transferCodeTitle}</h3>
          <p class="doral-transfer-modal-instructions">${labels.transferCodeInstructions}</p>
          <input type="text"
                 class="doral-transfer-code-input"
                 placeholder="${labels.transferCodePlaceholder}"
                 maxlength="6"
                 autocomplete="off"
                 autocorrect="off"
                 autocapitalize="characters"
                 spellcheck="false"
                 aria-label="${labels.transferCodePlaceholder}">
          <p class="doral-transfer-error" aria-live="polite"></p>
          <div class="doral-transfer-modal-actions">
            <button type="button" class="doral-transfer-cancel-btn">${labels.transferCodeCancel}</button>
            <button type="button" class="doral-transfer-submit-btn" disabled>${labels.transferCodeButton}</button>
          </div>
        </div>
      </div>
      <div class="doral-chat-messages" aria-live="polite" role="log" aria-label="Chat messages"></div>
      <div class="doral-chat-quick-actions">
        <p class="doral-chat-quick-actions-label">${labels.quickActions}:</p>
        <div class="doral-chat-quick-actions-list">
          ${actions.map(a => `<button class="doral-chat-quick-action-btn" data-query="${escapeHtml(a.query)}" aria-label="${a.label}"><span class="doral-action-icon">${a.icon}</span><span>${a.label}</span></button>`).join('')}
        </div>
      </div>
      <div class="doral-chat-suggestions">
        <p class="doral-chat-suggestions-label">${labels.suggested}</p>
        <div class="doral-chat-suggestions-list">
          ${suggestions.map(q => `<button class="doral-chat-suggestion-btn">${q}</button>`).join('')}
        </div>
      </div>
      <div class="doral-chat-input-area">
        <div class="doral-chat-input-row">
          <form class="doral-chat-input-form">
            <input type="text" class="doral-chat-input" placeholder="${labels.placeholder}" aria-label="${labels.placeholder}">
            <button type="submit" class="doral-chat-send-btn" aria-label="${labels.send}" disabled>
              ${ICONS.send}
            </button>
          </form>
        </div>
        <p class="doral-chat-disclaimer">${labels.disclaimer}</p>
      </div>
    `;
  }

  // ==================== EVENT LISTENERS ====================

  function addEventListeners() {
    // FAB click
    elements.fab.addEventListener('click', toggleChat);

    // Language dropdown toggle
    elements.langBtn.addEventListener('click', toggleLanguageDropdown);

    // Language option selection
    elements.langOptions.forEach(option => {
      option.addEventListener('click', function() {
        const lang = this.dataset.lang;
        selectLanguage(lang);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!elements.langDropdown.contains(e.target)) {
        closeLanguageDropdown();
      }
    });

    // Clear history
    elements.clearBtn.addEventListener('click', clearConversation);

    // Voice toggle button
    elements.voiceBtn.addEventListener('click', toggleVoice);

    // Transfer code modal
    elements.transferBtn.addEventListener('click', openTransferModal);
    elements.transferModalBackdrop.addEventListener('click', closeTransferModal);
    elements.transferCancelBtn.addEventListener('click', closeTransferModal);
    elements.transferSubmitBtn.addEventListener('click', redeemTransferCode);
    elements.transferCodeInput.addEventListener('input', function() {
      const value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      this.value = value;
      elements.transferSubmitBtn.disabled = value.length !== 6;
      elements.transferError.textContent = '';
    });
    elements.transferCodeInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !elements.transferSubmitBtn.disabled) {
        redeemTransferCode();
      }
      if (e.key === 'Escape') {
        closeTransferModal();
      }
    });

    // Close button in header
    elements.closeBtn.addEventListener('click', toggleChat);

    // Input handling
    elements.input.addEventListener('input', function() {
      elements.sendBtn.disabled = !this.value.trim();
    });

    // Form submit
    elements.panel.querySelector('.doral-chat-input-form').addEventListener('submit', function(e) {
      e.preventDefault();
      sendMessage();
    });

    // Quick action clicks
    elements.quickActionsList.addEventListener('click', function(e) {
      const btn = e.target.closest('.doral-chat-quick-action-btn');
      if (btn) {
        const query = btn.dataset.query;
        elements.input.value = query;
        elements.sendBtn.disabled = false;
        sendMessage();
      }
    });

    // Suggestion clicks
    elements.suggestionsList.addEventListener('click', function(e) {
      if (e.target.classList.contains('doral-chat-suggestion-btn')) {
        elements.input.value = e.target.textContent;
        elements.sendBtn.disabled = false;
        sendMessage();
      }
    });

    // Horizontal mouse wheel scrolling for quick actions
    elements.quickActionsList.addEventListener('wheel', function(e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Horizontal mouse wheel scrolling for suggestions
    elements.suggestionsList.addEventListener('wheel', function(e) {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // Drag to scroll for quick actions and suggestions
    function enableDragScroll(element) {
      let isDown = false;
      let startX;
      let scrollLeft;

      element.addEventListener('mousedown', function(e) {
        isDown = true;
        element.classList.add('doral-dragging');
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
      });

      element.addEventListener('mouseleave', function() {
        isDown = false;
        element.classList.remove('doral-dragging');
      });

      element.addEventListener('mouseup', function() {
        isDown = false;
        element.classList.remove('doral-dragging');
      });

      element.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed multiplier
        element.scrollLeft = scrollLeft - walk;
      });
    }

    enableDragScroll(elements.quickActionsList);
    enableDragScroll(elements.suggestionsList);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      // Escape to close
      if (e.key === 'Escape' && state.isOpen) {
        toggleChat();
        elements.fab.focus();
      }
      // Ctrl+L to toggle language
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        toggleLanguage();
      }
    });

    // Focus trap when panel is open
    elements.panel.addEventListener('keydown', trapFocus);
  }

  // ==================== FOCUS MANAGEMENT ====================

  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = elements.panel.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ==================== CHAT FUNCTIONS ====================

  function toggleChat() {
    state.isOpen = !state.isOpen;
    elements.fab.classList.toggle('doral-chat-open', state.isOpen);
    elements.fab.setAttribute('aria-expanded', state.isOpen.toString());
    elements.panel.classList.toggle('doral-chat-visible', state.isOpen);

    if (state.isOpen) {
      elements.input.focus();
      scrollToBottom();
    }
  }

  function toggleLanguageDropdown(e) {
    e.stopPropagation();
    const isOpen = elements.langMenu.classList.contains('doral-lang-menu-visible');
    if (isOpen) {
      closeLanguageDropdown();
    } else {
      openLanguageDropdown();
    }
  }

  function openLanguageDropdown() {
    elements.langMenu.classList.add('doral-lang-menu-visible');
    elements.langBtn.setAttribute('aria-expanded', 'true');
  }

  function closeLanguageDropdown() {
    elements.langMenu.classList.remove('doral-lang-menu-visible');
    elements.langBtn.setAttribute('aria-expanded', 'false');
  }

  function selectLanguage(lang) {
    // Check if language is enabled
    if (!CONFIG.enabledLanguages.includes(lang)) return;

    state.language = lang;
    updateLabels();
    updateLanguageDropdownUI();
    closeLanguageDropdown();
    saveConversation();
  }

  function updateLanguageDropdownUI() {
    // Update the language code display
    const langCodeEl = elements.langBtn.querySelector('.doral-lang-code');
    if (langCodeEl) {
      langCodeEl.textContent = state.language.toUpperCase();
    }

    // Update selected state of options
    elements.langOptions.forEach(option => {
      const isSelected = option.dataset.lang === state.language;
      option.setAttribute('aria-selected', isSelected.toString());
      const checkEl = option.querySelector('.doral-lang-check');
      if (checkEl) {
        checkEl.textContent = isSelected ? '✓' : '';
      }
    });
  }

  // ==================== TRANSFER CODE FUNCTIONS ====================

  function openTransferModal() {
    elements.transferModal.classList.add('doral-transfer-modal-visible');
    elements.transferModal.setAttribute('aria-hidden', 'false');
    elements.transferCodeInput.value = '';
    elements.transferError.textContent = '';
    elements.transferSubmitBtn.disabled = true;
    elements.transferCodeInput.focus();
  }

  function closeTransferModal() {
    elements.transferModal.classList.remove('doral-transfer-modal-visible');
    elements.transferModal.setAttribute('aria-hidden', 'true');
    elements.transferCodeInput.value = '';
    elements.transferError.textContent = '';
  }

  async function redeemTransferCode() {
    const code = elements.transferCodeInput.value.trim().toUpperCase();
    const labels = LABELS[state.language] || LABELS.en;

    if (code.length !== 6) {
      elements.transferError.textContent = labels.transferCodeError;
      return;
    }

    // Show loading state
    elements.transferSubmitBtn.disabled = true;
    elements.transferSubmitBtn.textContent = '...';
    elements.transferCodeInput.disabled = true;

    try {
      const response = await fetch(CONFIG.sessionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeem',
          token: code,
          targetChannel: 'web',
          targetUserId: state.sessionId
        })
      });

      const data = await response.json();

      if (data.success && data.messages) {
        // Successfully redeemed - restore conversation
        closeTransferModal();

        // Clear existing messages
        state.messages = [];
        elements.messages.innerHTML = '';

        // Restore language from transferred session
        if (data.language) {
          state.language = data.language;
          updateLabels();
        }

        // Filter out IVR-specific instructions that don't apply to web chat
        const ivrPhrases = [
          'Press 1', 'Press 2', 'presione el', 'peze twa', 'peze de',
          'transfer code', 'código de transferencia', 'kòd transfè',
          'speak with a representative', 'hablar con un representante'
        ];

        const filteredMessages = data.messages.filter(msg => {
          // Keep all user messages
          if (msg.role === 'user') return true;
          // Filter out assistant messages that are IVR-specific greetings
          const content = msg.content.toLowerCase();
          const isIvrGreeting = ivrPhrases.some(phrase => content.includes(phrase.toLowerCase()));
          return !isIvrGreeting;
        });

        // Add all transferred messages
        filteredMessages.forEach(msg => {
          const message = {
            id: generateId('msg'),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            sources: [],
            escalate: false,
            feedback: null,
            actions: []
          };
          state.messages.push(message);
        });

        // Render all messages
        renderAllMessages();

        // Save conversation locally
        state.conversationId = data.sessionId || generateId('conv');
        saveConversation();

        // Add success notification as a system message (skip auto-speak for this one)
        addMessage('assistant', labels.transferCodeSuccess, { skipVoice: true }, true);

        // Speak welcome message (use filtered messages to avoid IVR-specific content)
        if (state.voiceEnabled && filteredMessages.length > 0) {
          // Find the last assistant message from filtered conversation
          const lastAssistantMsg = [...filteredMessages].reverse().find(m => m.role === 'assistant');
          // Build a simple welcome message
          const welcomeSpoken = state.language === 'es'
            ? 'Bienvenido de vuelta. Su conversación ha sido restaurada. ¿En qué más puedo ayudarle?'
            : state.language === 'ht'
            ? 'Byenveni ankò. Konvèsasyon ou a te restore. Kijan mwen ka ede ou plis?'
            : 'Welcome back. Your conversation has been restored. How can I help you further?';

          // Speak just the welcome, or include last relevant response if available
          if (lastAssistantMsg) {
            speakText(welcomeSpoken + ' ' + lastAssistantMsg.content);
          } else {
            speakText(welcomeSpoken);
          }
        }

      } else {
        // Invalid or expired token
        elements.transferError.textContent = labels.transferCodeError;
      }
    } catch (error) {
      console.error('[DoralChat] Transfer code error:', error);
      elements.transferError.textContent = labels.transferCodeError;
    } finally {
      // Reset button state
      elements.transferSubmitBtn.textContent = labels.transferCodeButton;
      elements.transferSubmitBtn.disabled = elements.transferCodeInput.value.length !== 6;
      elements.transferCodeInput.disabled = false;
    }
  }

  function updateLabels() {
    const labels = LABELS[state.language] || LABELS.en;
    const actions = QUICK_ACTIONS[state.language] || QUICK_ACTIONS.en;

    elements.title.textContent = labels.title;
    elements.subtitle.textContent = labels.subtitle;
    elements.input.placeholder = labels.placeholder;
    elements.clearBtn.setAttribute('aria-label', labels.clearHistory);
    elements.clearBtn.setAttribute('title', labels.clearHistory);
    elements.disclaimer.textContent = labels.disclaimer;

    // Update language dropdown UI
    updateLanguageDropdownUI();

    // Update quick actions
    elements.quickActionsList.innerHTML = actions
      .map(a => `<button class="doral-chat-quick-action-btn" data-query="${escapeHtml(a.query)}" aria-label="${a.label}"><span class="doral-action-icon">${a.icon}</span><span>${a.label}</span></button>`)
      .join('');

    // Update quick actions label
    const actionsLabel = elements.quickActions.querySelector('.doral-chat-quick-actions-label');
    if (actionsLabel) actionsLabel.textContent = labels.quickActions + ':';

    // Update suggestions
    elements.suggestionsLabel.textContent = labels.suggested;
    updateSuggestionsForPage();
  }

  function addWelcomeMessage() {
    const labels = LABELS[state.language] || LABELS.en;
    // Use custom welcome message from admin settings if available
    let welcomeMessage = labels.welcome;
    if (state.language === 'en' && CONFIG.welcomeMessageEn) {
      welcomeMessage = CONFIG.welcomeMessageEn;
    } else if (state.language === 'es' && CONFIG.welcomeMessageEs) {
      welcomeMessage = CONFIG.welcomeMessageEs;
    } else if (state.language === 'ht' && CONFIG.welcomeMessageHt) {
      welcomeMessage = CONFIG.welcomeMessageHt;
    }
    addMessage('assistant', welcomeMessage, { skipVoice: true }, false);
  }

  function addMessage(role, content, data = {}, save = true) {
    const message = {
      id: generateId('msg'),
      role,
      content,
      timestamp: new Date(),
      sources: data.sources || [],
      escalate: data.escalate || false,
      feedback: null,
      actions: data.actions || [], // Workflow action buttons
      workflowState: data.workflowState || null
    };
    state.messages.push(message);

    // Track workflow state
    if (data.workflowState) {
      state.activeWorkflow = data.workflowState.active ? data.workflowState.type : null;
      state.workflowStep = data.workflowState.step || 0;
    }

    // Get the index for date header check
    const index = state.messages.length - 1;

    // Add date header if needed
    if (shouldShowDateHeader(message, index)) {
      renderDateHeader(message.timestamp);
    }

    renderMessage(message);

    // Auto-speak assistant messages when voice is enabled
    if (role === 'assistant' && state.voiceEnabled && !data.skipVoice) {
      speakText(content);
    }

    // Save to localStorage
    if (save) {
      saveConversation();
    }
  }

  function renderAllMessages() {
    elements.messages.innerHTML = '';
    state.messages.forEach((message, index) => {
      if (shouldShowDateHeader(message, index)) {
        renderDateHeader(message.timestamp);
      }
      renderMessage(message);
    });
  }

  function renderDateHeader(timestamp) {
    const headerEl = document.createElement('div');
    headerEl.className = 'doral-chat-date-header';
    headerEl.setAttribute('role', 'separator');
    headerEl.innerHTML = `<span>${formatMessageDate(timestamp)}</span>`;
    elements.messages.appendChild(headerEl);
  }

  function renderMessage(message) {
    const labels = LABELS[state.language] || LABELS.en;
    const isUser = message.role === 'user';

    const messageEl = document.createElement('div');
    messageEl.className = `doral-chat-message ${isUser ? 'doral-user' : 'doral-assistant'}`;
    messageEl.setAttribute('data-id', message.id);

    // Format content: use markdown for bot, plain escape for user
    const formattedContent = isUser ? escapeHtml(message.content) : formatMarkdown(message.content);

    let html = `
      <div class="doral-chat-message-avatar">
        ${isUser ? ICONS.user : ICONS.bot}
      </div>
      <div class="doral-chat-message-content">
        <div class="doral-chat-bubble">${formattedContent}</div>
        <span class="doral-chat-time">${formatTime(message.timestamp)}</span>
    `;

    // Add sources for assistant messages (if enabled in admin settings)
    if (!isUser && message.sources && message.sources.length > 0 && CONFIG.showSources) {
      const sourceLinks = message.sources.slice(0, 3).map(s =>
        `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" class="doral-chat-source-link">${ICONS.external}<span>${escapeHtml(s.title.length > 30 ? s.title.substring(0, 30) + '...' : s.title)}</span></a>`
      ).join('');
      html += `
        <div class="doral-chat-sources">
          <span class="doral-chat-sources-label">${labels.sources}</span>
          <div class="doral-chat-sources-list">${sourceLinks}</div>
        </div>`;
    }

    // Add escalation for frustrated users
    if (!isUser && message.escalate) {
      html += `
        <div class="doral-chat-escalation">
          <div class="doral-chat-escalation-header">
            ${ICONS.warning}
            <span>${labels.escalateMessage}</span>
          </div>
          <button class="doral-chat-escalation-btn" onclick="window.location.href='tel:+13055936725'">
            ${ICONS.phone}
            ${labels.escalateButton}
          </button>
        </div>
      `;
    }

    // Add action buttons for workflow interactions
    if (!isUser && message.actions && message.actions.length > 0) {
      html += `<div class="doral-chat-actions">`;
      message.actions.forEach(action => {
        const label = state.language === 'es' && action.labelEs ? action.labelEs : action.label;
        const variantClass = action.variant === 'outline' ? 'doral-action-outline' :
                             action.variant === 'secondary' ? 'doral-action-secondary' : 'doral-action-primary';
        const actionData = action.data ? JSON.stringify(action.data) : '{}';

        if (action.type === 'link' && action.data && action.data.url) {
          html += `
            <a href="${escapeHtml(action.data.url)}" target="_blank" rel="noopener noreferrer"
               class="doral-chat-action-btn ${variantClass}">
              ${ICONS.external}
              <span>${escapeHtml(label)}</span>
            </a>`;
        } else {
          html += `
            <button class="doral-chat-action-btn ${variantClass}"
                    data-action-type="${action.type}"
                    data-action='${escapeHtml(actionData)}'>
              ${escapeHtml(label)}
            </button>`;
        }
      });
      html += `</div>`;
    }

    // Add feedback buttons for assistant messages (except welcome, if enabled in admin settings)
    const msgIndex = state.messages.indexOf(message);
    if (!isUser && msgIndex > 0 && CONFIG.showFeedback && (!message.actions || message.actions.length === 0)) {
      const feedbackClass = message.feedback ? `doral-feedback-given` : '';
      html += `
        <div class="doral-chat-feedback ${feedbackClass}">
          <span class="doral-chat-feedback-label">${labels.feedback}</span>
          <button class="doral-chat-feedback-btn doral-positive ${message.feedback === 'positive' ? 'doral-selected' : ''}"
                  data-feedback="positive" aria-label="Yes, helpful" ${message.feedback ? 'disabled' : ''}>
            ${ICONS.thumbUp}
          </button>
          <button class="doral-chat-feedback-btn doral-negative ${message.feedback === 'negative' ? 'doral-selected' : ''}"
                  data-feedback="negative" aria-label="No, not helpful" ${message.feedback ? 'disabled' : ''}>
            ${ICONS.thumbDown}
          </button>
        </div>
      `;
    }

    html += '</div>';
    messageEl.innerHTML = html;

    // Add feedback click handlers
    messageEl.querySelectorAll('.doral-chat-feedback-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (this.disabled) return;
        const feedback = this.dataset.feedback;
        handleFeedback(message, feedback);
        // Update UI
        messageEl.querySelectorAll('.doral-chat-feedback-btn').forEach(b => {
          b.classList.remove('doral-selected');
          b.disabled = true;
        });
        this.classList.add('doral-selected');
        messageEl.querySelector('.doral-chat-feedback').classList.add('doral-feedback-given');
      });
    });

    // Add action button click handlers
    messageEl.querySelectorAll('.doral-chat-action-btn[data-action-type]').forEach(btn => {
      btn.addEventListener('click', function() {
        if (this.disabled) return;
        const actionType = this.dataset.actionType;
        const actionData = JSON.parse(this.dataset.action || '{}');

        // Disable all action buttons in this message
        messageEl.querySelectorAll('.doral-chat-action-btn').forEach(b => {
          b.disabled = true;
          b.classList.add('doral-action-used');
        });

        // Handle the action
        handleActionClick(actionType, actionData);
      });
    });

    elements.messages.appendChild(messageEl);
  }

  // Handle workflow action button clicks
  async function handleActionClick(actionType, actionData) {
    let commandMessage = '';

    switch (actionType) {
      case 'start-appointment':
        commandMessage = actionData.configId
          ? `__START_APPOINTMENT__:${actionData.configId}`
          : '__START_APPOINTMENT__';
        break;

      case 'start-service-request':
        commandMessage = '__START_SERVICE_REQUEST__';
        break;

      case 'select-option':
        if (actionData.command && actionData.value) {
          commandMessage = `${actionData.command}:${actionData.value}`;
        } else if (actionData.value) {
          commandMessage = `__SELECT_OPTION__:${actionData.value}`;
        }
        break;

      case 'confirm':
        commandMessage = '__SELECT_OPTION__:confirm';
        break;

      case 'cancel':
        commandMessage = '__CANCEL_WORKFLOW__';
        break;

      default:
        console.warn('Unknown action type:', actionType);
        return;
    }

    if (commandMessage) {
      // Send the command as a message
      await sendWorkflowCommand(commandMessage);
    }
  }

  // Send workflow command (hidden from user's visible messages)
  async function sendWorkflowCommand(command) {
    if (state.isLoading) return;

    state.isLoading = true;
    showLoading();

    try {
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: command }],
          language: state.language,
          sessionId: state.sessionId,
          conversationId: state.conversationId,
          domain: window.location.hostname
        })
      });

      const data = await response.json();

      // Update language if detected differently
      if (data.language && data.language !== state.language) {
        state.language = data.language;
        updateLabels();
      }

      // Add assistant response with actions
      addMessage('assistant', data.message || getErrorMessage(), {
        sources: data.sources || [],
        escalate: data.escalate || false,
        actions: data.actions || [],
        workflowState: data.workflowState || null
      });

    } catch (error) {
      console.error('Workflow command error:', error);
      addMessage('assistant', getErrorMessage());
    } finally {
      state.isLoading = false;
      hideLoading();
      elements.input.focus();
    }
  }

  function showLoading() {
    const labels = LABELS[state.language] || LABELS.en;

    // Set aria-busy on messages container
    elements.messages.setAttribute('aria-busy', 'true');

    const loadingEl = document.createElement('div');
    loadingEl.className = 'doral-chat-message doral-assistant doral-chat-loading-container';
    loadingEl.setAttribute('aria-label', labels.typing);
    loadingEl.innerHTML = `
      <div class="doral-chat-message-avatar">${ICONS.bot}</div>
      <div class="doral-chat-loading-wrapper">
        <div class="doral-chat-loading">
          <div class="doral-chat-loading-dot"></div>
          <div class="doral-chat-loading-dot"></div>
          <div class="doral-chat-loading-dot"></div>
        </div>
        <span class="doral-chat-typing-text">${labels.typing}...</span>
      </div>
    `;
    elements.messages.appendChild(loadingEl);
  }

  function hideLoading() {
    elements.messages.setAttribute('aria-busy', 'false');
    const loading = elements.messages.querySelector('.doral-chat-loading-container');
    if (loading) loading.remove();
  }

  async function sendMessage() {
    const content = elements.input.value.trim();
    if (!content || state.isLoading) return;

    // Clear input
    elements.input.value = '';
    elements.sendBtn.disabled = true;

    // Add user message
    addMessage('user', content);

    // Show loading
    state.isLoading = true;
    showLoading();

    try {
      const response = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: state.messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          language: state.language,
          sessionId: state.sessionId,
          conversationId: state.conversationId,
          domain: window.location.hostname // Multi-URL support for doralpd.com
        })
      });

      const data = await response.json();

      // Update language if detected differently
      if (data.language && data.language !== state.language) {
        state.language = data.language;
        updateLabels();
      }

      // Add assistant response with actions
      addMessage('assistant', data.message || getErrorMessage(), {
        sources: data.sources || [],
        escalate: data.escalate || false,
        actions: data.actions || [],
        workflowState: data.workflowState || null
      });

      // Log conversation
      logConversation(data);

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('assistant', getErrorMessage());
    } finally {
      state.isLoading = false;
      hideLoading();
      elements.input.focus();
    }
  }

  // ==================== FEEDBACK & LOGGING ====================

  async function handleFeedback(message, feedbackType) {
    // Update message feedback
    message.feedback = feedbackType;
    saveConversation();

    // Find the user query that preceded this response
    const msgIndex = state.messages.indexOf(message);
    const userMessage = msgIndex > 0 ? state.messages[msgIndex - 1] : null;

    try {
      await fetch(CONFIG.feedbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          conversationId: state.conversationId,
          sessionId: state.sessionId,
          rating: feedbackType,
          query: userMessage ? userMessage.content : '',
          response: message.content,
          language: state.language,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to send feedback:', error);
    }
  }

  async function logConversation(responseData) {
    try {
      await fetch(CONFIG.logUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          conversationId: state.conversationId,
          messages: state.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString()
          })),
          language: state.language,
          sentiment: responseData.sentiment || 'neutral',
          escalated: responseData.escalate || false,
          pageUrl: window.location.href
        })
      });
    } catch (error) {
      console.warn('Failed to log conversation:', error);
    }
  }

  // ==================== UTILITY FUNCTIONS ====================

  function getErrorMessage() {
    if (state.language === 'es') {
      return 'Lo siento, tengo problemas para conectarme. Por favor intente de nuevo.';
    } else if (state.language === 'ht') {
      return 'Eskize mwen, mwen gen pwoblèm pou konekte. Tanpri eseye ankò.';
    }
    return 'I apologize, but I\'m having trouble connecting. Please try again.';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Format markdown for bot responses (bold headers, clean spacing, bullet lists)
  function formatMarkdown(text) {
    // First escape HTML for security
    let formatted = escapeHtml(text);

    // Convert **text** to <strong>text</strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Convert URLs to clickable links
    // Match full URLs (http/https) and domain-style URLs (e.g., cityofdoral.com/path)
    const urlPattern = /(\bhttps?:\/\/[^\s<]+)|(\b(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|gov|net|edu|io)(?:\/[^\s<]*)?)/gi;
    formatted = formatted.replace(urlPattern, function(match) {
      // Add https:// if not present
      const href = match.startsWith('http') ? match : 'https://' + match;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="doral-chat-inline-link">${match}</a>`;
    });

    // Process lines - convert bullets to proper HTML list items
    const lines = formatted.split('\n').map(line => line.trim()).filter(line => line);
    let result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

      if (isBullet) {
        // Clean the bullet prefix and create list item
        const bulletContent = line.replace(/^[•\-\*]\s*/, '');
        if (!inList) {
          result.push('<ul class="doral-bullet-list">');
          inList = true;
        }
        result.push(`<li>${bulletContent}</li>`);
      } else {
        // Close list if we were in one
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        // Regular line - add with paragraph spacing
        if (line.includes('<strong>')) {
          result.push(line); // Headers stay as-is
        } else {
          result.push(`<p class="doral-chat-para">${line}</p>`);
        }
      }
    }

    // Close any open list
    if (inList) {
      result.push('</ul>');
    }

    return result.join('');
  }

  function scrollToBottom() {
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  // ==================== INITIALIZE ====================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

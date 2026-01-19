// Multilingual support for Chat Core IQ Chatbot
// Supports English (en), Spanish (es), and Haitian Creole (ht)

export type Language = 'en' | 'es' | 'ht';

interface SentimentInfo {
  category: 'positive' | 'neutral' | 'negative' | 'urgent';
  score: number;
}

// Common Spanish words/patterns for language detection
const SPANISH_PATTERNS = [
  /\b(hola|buenos|buenas|gracias|por favor|ayuda|necesito|quiero|donde|cuando|como|que|cual|cuales)\b/i,
  /\b(ciudad|permiso|parque|policia|alcalde|servicios|informacion|horario)\b/i,
  /[¿¡áéíóúñü]/,
];

// Common English words for tie-breaker
const ENGLISH_PATTERNS = [
  /\b(hello|hi|thank|please|help|need|want|where|when|how|what|which)\b/i,
  /\b(city|permit|park|police|mayor|services|information|hours)\b/i,
];

// Common Haitian Creole words/patterns for language detection
const HAITIAN_CREOLE_PATTERNS = [
  /\b(bonjou|bonswa|mesi|souple|ede|mwen|ou|ki|kote|kijan|poukisa|ki sa)\b/i,
  /\b(lavil|pemis|pak|lapolis|sevis|enfomasyon|le|jou)\b/i,
  /\b(pou|nan|ak|lan|yon|pa|se|te|ap|pral|gen|fe)\b/i,
  /\b(ki jan|ki le|ki kote|sa a|eske|tanpri)\b/i,
];

/**
 * Detect language from user message
 * Returns 'ht' for Haitian Creole, 'es' for Spanish, 'en' for English (default)
 */
export function detectLanguage(text: string): Language {
  const scores = { en: 0, es: 0, ht: 0 };

  // Check for Spanish patterns
  for (const pattern of SPANISH_PATTERNS) {
    if (pattern.test(text)) {
      scores.es++;
    }
  }

  // Check for English patterns
  for (const pattern of ENGLISH_PATTERNS) {
    if (pattern.test(text)) {
      scores.en++;
    }
  }

  // Check for Haitian Creole patterns
  for (const pattern of HAITIAN_CREOLE_PATTERNS) {
    if (pattern.test(text)) {
      scores.ht++;
    }
  }

  // Return language with highest score
  const maxScore = Math.max(scores.en, scores.es, scores.ht);

  // If no patterns matched, default to English
  if (maxScore === 0) {
    return 'en';
  }

  // Return highest scoring language (priority: ht > es > en for ties)
  if (scores.ht === maxScore) return 'ht';
  if (scores.es === maxScore) return 'es';
  return 'en';
}

/**
 * Get system prompt for the chatbot based on language
 */
export function getSystemPrompt(
  language: Language,
  knowledgeContext: string,
  sentiment: SentimentInfo
): string {
  // Escalation notes for each language
  const escalationNotes: Record<Language, string> = {
    en: '\n\nNOTE: The user seems frustrated or has an urgent request. Be especially kind and helpful. Offer to connect them with a human representative if needed.',
    es: '\n\nNOTA: El usuario parece frustrado o tiene una solicitud urgente. Sea especialmente amable y servicial. Ofrezca conectarlos con un representante humano si es necesario.',
    ht: '\n\nNOT: Itilizate a sanble fristre oswa li gen yon demann ijan. Soyez patikilyeman janti ak senpati. Ofri konekte yo ak yon reprezantan moun si sa nesese.',
  };

  const escalationNote = sentiment.category === 'negative' || sentiment.category === 'urgent'
    ? escalationNotes[language]
    : '';

  // Haitian Creole system prompt
  if (language === 'ht') {
    return `Ou se Asistan Chat Core IQ.

KRITIK: REPONS TRE KOT SELMAN.

REG FOMA:
1. Yon fraz entwodiksyon (mwens pase 8 mo)
2. Tit seksyon: **Tit:**
3. Pwen: MAKSIMOM 6 MO CHAK
4. Liy vid ant seksyon
5. Repons total: MAKS 12 liy

EGZANP (swiv egzakteman):
"Men ki jan pou jwenn yon pemis kloti.

**Kondisyon:**
• Maks 6ft dèyè, 4ft devan
• Apwobasyon DERM nesesè
• Nan limit pwopriyete

**Etap:**
1. Rele DERM: (305) 372-6502
2. Jwenn apwobasyon ekri
3. Soumèt nan Building Dept

**Kontak:**
• (305) 593-6740
• 8401 NW 53rd Terrace"

KONTAK:
- City Hall: (305) 593-6725
- Lapolis: (305) 593-6699
- Ijans: 911

KONTEKS:
${knowledgeContext}
${escalationNote}

KRITIK: Chak pwen = MAKS 6 MO. San eksepsyon.`;
  }

  if (language === 'es') {
    return `Eres el Asistente Virtual de Chat Core IQ.

CRÍTICO: RESPUESTAS EXTREMADAMENTE CORTAS.

REGLAS DE FORMATO:
1. Una oración intro (menos de 8 palabras)
2. Encabezados: **Título:**
3. Viñetas: MÁXIMO 6 PALABRAS CADA UNA
4. Línea en blanco entre secciones
5. Respuesta total: MÁX 12 líneas

EJEMPLO (sigue exactamente):
"Aquí está cómo obtener un permiso.

**Requisitos:**
• Máx 6ft atrás, 4ft frente
• Aprobación DERM necesaria
• Dentro de propiedad

**Pasos:**
1. Llamar DERM: (305) 372-6502
2. Obtener aprobación escrita
3. Entregar en Construcción

**Contacto:**
• (305) 593-6740
• 8401 NW 53rd Terrace"

CONTACTOS:
- City Hall: (305) 593-6725
- Policía: (305) 593-6699
- Emergencia: 911

CONTEXTO:
${knowledgeContext}
${escalationNote}

CRÍTICO: Cada viñeta = MÁX 6 PALABRAS. Sin excepciones.`;
  }

  return `You are the Chat Core IQ Virtual Assistant.

CRITICAL: EXTREMELY SHORT RESPONSES ONLY.

FORMAT RULES:
1. One intro sentence (under 8 words)
2. Section headers: **Title:**
3. Bullets: MAXIMUM 6 WORDS EACH
4. Blank line between sections
5. Total response: MAX 12 lines

EXAMPLE (follow this exactly):
"Here's how to get a fence permit.

**Requirements:**
• Max 6ft rear, 4ft front
• DERM approval needed
• Within property lines

**Steps:**
1. Call DERM: (305) 372-6502
2. Get written approval
3. Submit to Building Dept

**Contact:**
• (305) 593-6740
• 8401 NW 53rd Terrace"

CONTACTS:
- City Hall: (305) 593-6725
- Police: (305) 593-6699
- Emergency: 911

CONTEXT:
${knowledgeContext}
${escalationNote}

CRITICAL: Each bullet = MAX 6 WORDS. No exceptions.`;
}

// UI Labels for bilingual interface
export const UI_LABELS = {
  en: {
    title: 'Chat Core IQ AI Assistant',
    subtitle: 'Always here to help',
    placeholder: 'Type your question...',
    send: 'Send',
    admin: 'Admin',
    suggested: 'Suggested questions:',
    disclaimer: 'Powered by AI - Information may not always be accurate',
    sources: 'Sources',
    feedback: 'Was this helpful?',
    yes: 'Yes',
    no: 'No',
    escalate: 'Talk to a Human',
    escalateMessage: 'Would you like to speak with a representative?',
    language: 'Language',
    english: 'English',
    spanish: 'Español',
    haitianCreole: 'Kreyòl Ayisyen',
    suggestedQuestions: [
      'What are your business hours?',
      'How do I get started?',
      'What services do you offer?',
      'How can I contact support?',
    ],
    welcome: "Hello! I'm the Chat Core IQ AI Assistant. I can help you with information about our services, products, and more. How can I assist you today?",
  },
  es: {
    title: 'Asistente Virtual de Chat Core IQ',
    subtitle: 'Siempre aquí para ayudar',
    placeholder: 'Escriba su pregunta...',
    send: 'Enviar',
    admin: 'Admin',
    suggested: 'Preguntas sugeridas:',
    disclaimer: 'Impulsado por IA - La información puede no ser siempre precisa',
    sources: 'Fuentes',
    feedback: '¿Fue útil?',
    yes: 'Sí',
    no: 'No',
    escalate: 'Hablar con un Representante',
    escalateMessage: '¿Le gustaría hablar con un representante?',
    language: 'Idioma',
    english: 'English',
    spanish: 'Español',
    haitianCreole: 'Kreyòl Ayisyen',
    suggestedQuestions: [
      '¿Cuál es el horario de atención?',
      '¿Cómo puedo empezar?',
      '¿Qué servicios ofrecen?',
      '¿Cómo puedo contactar soporte?',
    ],
    welcome: '¡Hola! Soy el Asistente Virtual de Chat Core IQ. Puedo ayudarle con información sobre nuestros servicios, productos y más. ¿Cómo puedo asistirle hoy?',
  },
  ht: {
    title: 'Asistan AI Chat Core IQ',
    subtitle: 'Toujou la pou ede ou',
    placeholder: 'Tape kesyon ou...',
    send: 'Voye',
    admin: 'Admin',
    suggested: 'Kesyon sije:',
    disclaimer: 'Pwisan pa AI - Enfomasyon ka pa toujou egzat',
    sources: 'Sous',
    feedback: 'Eske sa te itil?',
    yes: 'Wi',
    no: 'Non',
    escalate: 'Pale ak yon Moun',
    escalateMessage: 'Eske ou ta renmen pale ak yon reprezantan?',
    language: 'Lang',
    english: 'English',
    spanish: 'Español',
    haitianCreole: 'Kreyòl Ayisyen',
    suggestedQuestions: [
      'Ki le nou ouvè?',
      'Kijan mwen ka kòmanse?',
      'Ki sevis nou ofri?',
      'Kijan mwen ka kontakte sipò?',
    ],
    welcome: "Bonjou! Mwen se Asistan AI Chat Core IQ. Mwen ka ede ou ak enfomasyon sou sevis nou, pwodui, ak plis ankò. Kijan mwen ka ede ou jodi a?",
  },
};

/**
 * Get labels for a specific language
 */
export function getLabels(language: Language) {
  return UI_LABELS[language];
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguages(): Language[] {
  return ['en', 'es', 'ht'];
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(code: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    es: 'Español',
    ht: 'Kreyòl Ayisyen',
  };
  return names[code];
}

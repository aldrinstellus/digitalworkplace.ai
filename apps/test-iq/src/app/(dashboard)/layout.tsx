'use client';

import { useState, createContext, useContext, useMemo } from 'react';
import Sidebar from '@/components/dtq/Sidebar';
import { PersonaType } from '@/lib/dtq/types';
import { ChatProvider } from '@/contexts/ChatContext';
import { NavigationProvider } from '@/contexts/NavigationContext';
import ChatWidget from '@/components/dtq/ChatWidget';

interface PersonaContextType {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  persona: 'manager',
  setPersona: () => {},
});

export const usePersona = () => useContext(PersonaContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [persona, setPersona] = useState<PersonaType>('manager');
  const contextValue = useMemo(() => ({ persona, setPersona }), [persona]);

  return (
    <PersonaContext.Provider value={contextValue}>
      <ChatProvider>
        <NavigationProvider>
          <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Sidebar persona={persona} onPersonaChange={setPersona} />
            <main className="flex-1 overflow-auto">
              <div className="p-6 lg:p-8">
                {children}
              </div>
            </main>
          </div>
          <ChatWidget />
        </NavigationProvider>
      </ChatProvider>
    </PersonaContext.Provider>
  );
}

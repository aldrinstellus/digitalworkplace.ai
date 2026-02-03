'use client';

import { useState, createContext, useContext } from 'react';
import Sidebar from '@/components/dtq/Sidebar';
import { PersonaType } from '@/lib/dtq/types';

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

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Sidebar persona={persona} onPersonaChange={setPersona} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </PersonaContext.Provider>
  );
}

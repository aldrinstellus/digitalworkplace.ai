'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  FileText,
  Crown,
  Users,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonaType } from '@/lib/dtq/types';
import { TQLogo } from '@/components/brand/TQLogo';

interface SidebarProps {
  persona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Metrics History', href: '/history', icon: TrendingUp },
  { name: 'Test Reports', href: '/reports', icon: FileText },
];

const personaConfig = {
  csuite: { name: 'C-Suite', icon: Crown, color: 'var(--chart-tertiary)' },
  manager: { name: 'Manager', icon: Users, color: 'var(--accent-primary)' },
  techlead: { name: 'Tech Lead', icon: Code, color: 'var(--chart-secondary)' },
};

export default function Sidebar({ persona, onPersonaChange }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

  return (
    <aside
      className="sidebar w-64 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-card)' }}>
        <Link href="/dashboard">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <TQLogo size="lg" showText />
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider mb-2 px-3" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredItem === item.name;

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.div
                  className={cn(
                    'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative overflow-hidden',
                    isActive && 'active'
                  )}
                  style={{
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                  whileHover={!isActive ? { scale: 1.02 } : {}}
                >
                  {/* Sliding active indicator with glow */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 w-1 h-6 rounded-r-full"
                      style={{ background: 'var(--accent-primary)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Glow effect on active */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: 'linear-gradient(90deg, var(--accent-primary), transparent)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                    />
                  )}

                  <motion.div
                    animate={isHovered && !isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <item.icon
                      className="w-5 h-5"
                      style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}
                    />
                  </motion.div>
                  <span className="font-medium">{item.name}</span>

                  {/* Tooltip on hover */}
                  <AnimatePresence>
                    {isHovered && !isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="absolute right-3"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--accent-primary)' }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Personas */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3 px-3" style={{ color: 'var(--text-muted)' }}>
            Demo Personas
          </p>
          {(Object.keys(personaConfig) as PersonaType[]).map((key) => {
            const config = personaConfig[key];
            const isActive = persona === key;
            const isHovered = hoveredPersona === key;
            const Icon = config.icon;

            return (
              <motion.button
                key={key}
                onClick={() => onPersonaChange(key)}
                onMouseEnter={() => setHoveredPersona(key)}
                onMouseLeave={() => setHoveredPersona(null)}
                className={cn(
                  'sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left relative',
                  isActive && 'active'
                )}
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
                whileHover={!isActive ? { scale: 1.02 } : {}}
              >
                {/* Smooth transition icon container */}
                <motion.div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: isActive ? config.color : 'var(--bg-tertiary)',
                  }}
                  animate={{
                    scale: isActive ? 1 : isHovered ? 1.05 : 1,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </motion.div>

                <div className="flex-1">
                  <span className="font-medium block">{config.name}</span>
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Active
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selection indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: config.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer with enhanced live indicator */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border-card)' }}>
        <motion.div
          className="px-3 py-2 rounded-lg text-xs"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
          whileHover={{
            boxShadow: '0 0 15px rgba(52, 211, 153, 0.2)',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--status-success)' }}
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Ping effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--status-success)' }}
                animate={{
                  scale: [1, 2],
                  opacity: [0.5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
            <span>Live Dashboard</span>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}

'use client';

import { useState, memo } from 'react';
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
  ChevronDown,
  Check,
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

export default memo(function Sidebar({ persona, onPersonaChange }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentConfig = personaConfig[persona];
  const CurrentIcon = currentConfig.icon;

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

      {/* Persona Dropdown */}
      <div className="px-4 pt-4 pb-2 relative">
        <p className="text-xs font-medium uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
          Viewing as
        </p>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
        >
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: currentConfig.color }}
          >
            <CurrentIcon className="w-4 h-4 text-white" />
          </motion.div>
          <span className="font-medium flex-1 text-left">{currentConfig.name}</span>
          <motion.div
            animate={{ rotate: dropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <>
              {/* Invisible overlay to close dropdown on click outside */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-1 rounded-lg z-20 relative"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                {(Object.keys(personaConfig) as PersonaType[]).map((key) => {
                  const config = personaConfig[key];
                  const isActive = persona === key;
                  const Icon = config.icon;

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        onPersonaChange(key);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-elevated)] text-left"
                      style={{
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isActive ? config.color : 'transparent',
                          border: isActive ? 'none' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'white' : 'var(--text-muted)' }} />
                      </div>
                      <span className="font-medium flex-1">{config.name}</span>
                      {isActive && (
                        <Check className="w-4 h-4" style={{ color: config.color }} />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
            <div className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--status-success)' }} />
            <span>Live Dashboard</span>
          </div>
        </motion.div>
      </div>
    </aside>
  );
});

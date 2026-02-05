'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  BookOpen,
  Github,
  Headphones,
  MessageSquare,
  Cloud,
} from 'lucide-react';

const integrations = [
  { name: 'JIRA', icon: Ticket, color: '#0052CC', status: 'connected' as const },
  { name: 'Confluence', icon: BookOpen, color: '#0052CC', status: 'connected' as const },
  { name: 'GitHub / BitBucket', icon: Github, color: '#ffffff', status: 'connected' as const },
  { name: 'ServiceNow', icon: Headphones, color: '#81B5A1', status: 'connected' as const },
  { name: 'CI/CD (Jenkins)', icon: Cloud, color: '#D33833', status: 'connected' as const },
  { name: 'Slack', icon: MessageSquare, color: '#4A154B', status: 'connected' as const },
];

export default memo(function IntegrationBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="card rounded-xl px-5 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Integrations
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)' }}
          >
            6 connected
          </span>
        </div>
        <div className="flex items-center gap-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = integration.status === 'connected';

            return (
              <motion.div
                key={integration.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-default"
                style={{
                  background: isConnected
                    ? `${integration.color}10`
                    : 'var(--bg-tertiary)',
                  border: `1px solid ${isConnected ? `${integration.color}30` : 'var(--border-subtle)'}`,
                }}
                whileHover={{ y: -1, borderColor: isConnected ? integration.color : 'var(--border-subtle)' }}
                transition={{ duration: 0.15 }}
              >
                <Icon
                  className="w-3.5 h-3.5"
                  style={{
                    color: isConnected ? integration.color : 'var(--text-disabled)',
                  }}
                />
                <span
                  className="text-xs font-medium hidden sm:inline"
                  style={{
                    color: isConnected ? 'var(--text-secondary)' : 'var(--text-disabled)',
                  }}
                >
                  {integration.name}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isConnected ? 'var(--status-success)' : 'var(--text-disabled)',
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

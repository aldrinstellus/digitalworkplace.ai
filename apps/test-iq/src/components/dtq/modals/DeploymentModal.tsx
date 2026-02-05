'use client';

import { Cloud, Shield, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import BaseModal from './BaseModal';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const deploymentOptions = [
  {
    name: 'Cloud (AWS / Azure / GCP)',
    icon: Cloud,
    description: 'Fully managed cloud deployment with auto-scaling, CDN, and edge functions. Fastest deployment, pay-as-you-go.',
    active: true,
    color: 'var(--accent-primary)',
  },
  {
    name: 'Gov Cloud',
    icon: Shield,
    description: 'FedRAMP-compliant cloud environment for government agencies. SOC 2 Type II certified with data residency controls.',
    active: false,
    color: 'var(--chart-tertiary)',
  },
  {
    name: 'On-Premises / Air-Gapped',
    icon: Server,
    description: 'Full on-premises deployment for maximum data sovereignty. Supports air-gapped environments with offline operation.',
    active: false,
    color: 'var(--chart-secondary)',
  },
];

export default function DeploymentModal({ isOpen, onClose }: DeploymentModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Deployment Architecture"
      description="Choose your deployment model based on security and compliance requirements"
      size="sm"
    >
      <div className="space-y-3">
        {deploymentOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <motion.div
              key={option.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="rounded-xl p-4 relative"
              style={{
                background: option.active
                  ? 'var(--accent-primary-muted)'
                  : 'var(--bg-tertiary)',
                border: option.active
                  ? '1px solid var(--border-accent)'
                  : '1px solid var(--border-subtle)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: option.active
                      ? option.color
                      : 'var(--bg-elevated)',
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{
                      color: option.active ? 'white' : 'var(--text-muted)',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: option.active
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {option.name}
                    </p>
                    {option.active && (
                      <span className="badge-success text-[10px] py-0.5 px-2">
                        Active
                      </span>
                    )}
                  </div>
                  <p
                    className="text-xs mt-1 leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {option.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </BaseModal>
  );
}

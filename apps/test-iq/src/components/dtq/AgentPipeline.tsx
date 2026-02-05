'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Brain, Play, Sparkles, Server, Eye, RefreshCw, Zap, GraduationCap } from 'lucide-react';

interface AgentDef {
  number: number;
  title: string;
  description: string;
  Icon: typeof FileText;
  color: string;
  badges?: string[];
}

const agents: AgentDef[] = [
  {
    number: 1,
    title: 'Test Case Generation',
    description: 'Analyzes PRDs & User Stories',
    Icon: FileText,
    color: 'var(--accent-primary)',
  },
  {
    number: 2,
    title: 'Context Builder',
    description: 'Builds Smart Prompts from Knowledge Base',
    Icon: Brain,
    color: 'var(--chart-secondary)',
  },
  {
    number: 3,
    title: 'Execution Engine',
    description: 'Runs Tests on Browser via AI Vision',
    Icon: Play,
    color: 'var(--chart-tertiary)',
    badges: ['Self-Healing', 'K8s-Powered'],
  },
];

const capabilities = [
  { text: 'AI sees the application like a human tester', Icon: Eye },
  { text: 'Automatically adapts to UI changes', Icon: RefreshCw },
  { text: 'Self-healing test execution', Icon: Zap },
  { text: 'Continuous learning from each run', Icon: GraduationCap },
];

function AgentPipeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-5 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles
            className="w-5 h-5"
            style={{ color: 'var(--accent-primary)' }}
          />
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            The Intelligent Testing Pipeline
          </h3>
        </div>
        <p
          className="text-sm mt-1 ml-7"
          style={{ color: 'var(--text-muted)' }}
        >
          3-agent architecture powering autonomous test generation, context assembly, and execution
        </p>
      </div>

      {/* Pipeline Flow */}
      <div className="p-5">
        {/* Agent Cards Row */}
        <div
          className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0"
        >
          {agents.map((agent, index) => (
            <div
              key={agent.number}
              className="flex flex-col md:flex-row items-center"
            >
              {/* Agent Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.15 }}
                className="relative rounded-xl p-4 w-full md:w-56 transition-all duration-300"
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Agent Number Badge */}
                <div
                  className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: agent.color,
                    color: 'var(--bg-tertiary)',
                  }}
                >
                  {agent.number}
                </div>

                {/* Badges for Agent 3 */}
                {agent.badges && (
                  <div className="absolute -top-2.5 right-2 flex gap-1.5">
                    {agent.badges.map((badge) => (
                      <span
                        key={badge}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            badge === 'Self-Healing'
                              ? 'var(--chart-tertiary)'
                              : 'var(--chart-secondary)',
                          color: 'var(--bg-tertiary)',
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Icon Circle */}
                <div className="flex justify-center mb-3 mt-1">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `color-mix(in srgb, ${agent.color} 15%, transparent)`,
                      border: `1.5px solid color-mix(in srgb, ${agent.color} 40%, transparent)`,
                    }}
                  >
                    <agent.Icon
                      className="w-5 h-5"
                      style={{ color: agent.color }}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="text-center">
                  <h4
                    className="text-sm font-semibold mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {agent.title}
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {agent.description}
                  </p>
                </div>
              </motion.div>

              {/* Connecting Arrow (not after the last agent) */}
              {index < agents.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
                  className="flex items-center justify-center py-2 md:py-0 md:px-3"
                >
                  {/* Desktop: horizontal arrow */}
                  <span
                    className="hidden md:block text-lg font-mono tracking-tighter select-none"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ───▶
                  </span>
                  {/* Mobile: vertical arrow */}
                  <span
                    className="block md:hidden text-lg select-none"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ▼
                  </span>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Kubernetes-Powered Badge (bottom center) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="flex justify-center mt-4"
        >
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'color-mix(in srgb, var(--chart-secondary) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--chart-secondary) 30%, transparent)',
              color: 'var(--chart-secondary)',
            }}
          >
            <Server className="w-3 h-3" />
            Kubernetes-Powered Orchestration
          </div>
        </motion.div>

        {/* Capabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="mt-5 pt-4 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1.0 + i * 0.1 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--bg-tertiary)',
                }}
              >
                <cap.Icon
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {cap.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default memo(AgentPipeline);

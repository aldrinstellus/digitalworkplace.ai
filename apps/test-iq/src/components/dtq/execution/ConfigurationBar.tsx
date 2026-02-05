'use client';

import { memo } from 'react';
import { Monitor, Globe, Layers } from 'lucide-react';
import { ExecutionConfig } from '@/lib/dtq/types';

interface ConfigurationBarProps {
  config: ExecutionConfig;
  onChange: (config: ExecutionConfig) => void;
  disabled?: boolean;
}

export default memo(function ConfigurationBar({ config, onChange, disabled }: ConfigurationBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Environment */}
      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5" style={{ color: 'var(--chart-secondary)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Environment
        </span>
        <select
          value={config.environment}
          onChange={(e) => onChange({ ...config, environment: e.target.value as ExecutionConfig['environment'] })}
          disabled={disabled}
          className="text-xs px-2 py-1 rounded-md cursor-pointer outline-none disabled:opacity-50"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="staging">Staging</option>
          <option value="production">Production</option>
          <option value="development">Development</option>
        </select>
      </div>

      {/* Browser */}
      <div className="flex items-center gap-2">
        <Monitor className="w-3.5 h-3.5" style={{ color: 'var(--chart-secondary)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Browser
        </span>
        <select
          value={config.browser}
          onChange={(e) => onChange({ ...config, browser: e.target.value as ExecutionConfig['browser'] })}
          disabled={disabled}
          className="text-xs px-2 py-1 rounded-md cursor-pointer outline-none disabled:opacity-50"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="chromium">Chromium</option>
          <option value="firefox">Firefox</option>
          <option value="webkit">WebKit</option>
          <option value="all">All Browsers</option>
        </select>
      </div>

      {/* Parallel Instances */}
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5" style={{ color: 'var(--chart-secondary)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Parallel
        </span>
        <input
          type="range"
          min={1}
          max={20}
          value={config.parallelInstances}
          onChange={(e) => onChange({ ...config, parallelInstances: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-20 h-1 rounded-full appearance-none cursor-pointer disabled:opacity-50"
          style={{ accentColor: 'var(--chart-secondary)' }}
        />
        <span
          className="text-xs font-semibold w-5 text-center"
          style={{ color: 'var(--chart-secondary)' }}
        >
          {config.parallelInstances}
        </span>
      </div>
    </div>
  );
});

'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Play, ListOrdered, Clock, RotateCcw } from 'lucide-react';
import { ExecutionPhase } from '@/lib/dtq/types';

interface ActionButtonsProps {
  phase: ExecutionPhase;
  selectedCount: number;
  onExecute: () => void;
  onReset: () => void;
}

export default memo(function ActionButtons({ phase, selectedCount, onExecute, onReset }: ActionButtonsProps) {
  const canExecute = phase === 'idle' && selectedCount > 0;

  return (
    <div className="flex items-center gap-2">
      {phase === 'complete' ? (
        <motion.button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
          whileHover={{ scale: 1.02, borderColor: 'var(--chart-secondary)' }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          New Execution
        </motion.button>
      ) : (
        <>
          <motion.button
            onClick={onExecute}
            disabled={!canExecute}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canExecute
                ? 'linear-gradient(135deg, #0ea5e9, #22d3ee)'
                : 'var(--bg-tertiary)',
              color: canExecute ? 'white' : 'var(--text-muted)',
              boxShadow: canExecute ? '0 4px 15px rgba(34, 211, 238, 0.3)' : 'none',
            }}
            whileHover={canExecute ? { scale: 1.02 } : {}}
            whileTap={canExecute ? { scale: 0.98 } : {}}
          >
            <Play className="w-3.5 h-3.5" />
            Execute ({selectedCount})
          </motion.button>

          <motion.button
            disabled={!canExecute}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
            whileHover={canExecute ? { borderColor: 'var(--chart-secondary)' } : {}}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Queue
          </motion.button>

          <motion.button
            disabled={!canExecute}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
            whileHover={canExecute ? { borderColor: 'var(--chart-secondary)' } : {}}
          >
            <Clock className="w-3.5 h-3.5" />
            Schedule
          </motion.button>
        </>
      )}
    </div>
  );
});

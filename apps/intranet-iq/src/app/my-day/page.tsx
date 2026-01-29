'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Plus,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Sun,
  Target,
  AlertTriangle,
  MoreHorizontal,
  Tag,
  ListTodo,
  LayoutGrid,
  CalendarDays,
  Filter,
  Search,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  due_time?: string;
  tags: string[];
  completed_at?: string;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
}

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueToday: number;
}

const priorityColors: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
};

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

// Demo user ID
const userId = '550e8400-e29b-41d4-a716-446655440001';

export default function MyDayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarConnected, setCalendarConnected] = useState(false);
  const quickAddRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  useEffect(() => {
    if (showQuickAdd && quickAddRef.current) {
      quickAddRef.current.focus();
    }
  }, [showQuickAdd]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId, includeCompleted: 'false' });

      if (filter === 'today') {
        params.set('dueDate', new Date().toISOString().split('T')[0]);
      }

      const response = await fetch(`/diq/api/tasks?${params}`);
      if (response.ok) {
        const data = await response.json();
        let filteredTasks = data.tasks || [];

        // Apply client-side filtering for overdue/upcoming
        if (filter === 'overdue') {
          const today = new Date().toISOString().split('T')[0];
          filteredTasks = filteredTasks.filter((t: Task) =>
            t.due_date && t.due_date < today && t.status !== 'done'
          );
        } else if (filter === 'upcoming') {
          const today = new Date().toISOString().split('T')[0];
          filteredTasks = filteredTasks.filter((t: Task) =>
            t.due_date && t.due_date > today
          );
        }

        setTasks(filteredTasks);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Use demo data
      setTasks(getDemoTasks());
      setStats({
        total: 8,
        todo: 4,
        inProgress: 2,
        done: 2,
        overdue: 1,
        dueToday: 3,
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/diq/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: newTaskTitle,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => [data.task, ...prev]);
        setNewTaskTitle('');
        setNewTaskPriority('medium');
        setNewTaskDueDate('');
        setShowQuickAdd(false);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      // Optimistic add for demo
      const newTask: Task = {
        id: Date.now().toString(),
        user_id: userId,
        title: newTaskTitle,
        status: 'todo',
        priority: newTaskPriority,
        due_date: newTaskDueDate || undefined,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setShowQuickAdd(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await fetch('/diq/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      });

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, status, completed_at: status === 'done' ? new Date().toISOString() : undefined }
            : t
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/diq/api/tasks?id=${taskId}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const generateBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const response = await fetch('/diq/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a brief, motivational daily briefing for an employee. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. They have ${stats?.dueToday || 0} tasks due today, ${stats?.overdue || 0} overdue tasks, and ${stats?.inProgress || 0} tasks in progress. Keep it under 3 sentences, friendly and encouraging.`,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBriefing(data.response);
      }
    } catch (error) {
      console.error('Error generating briefing:', error);
      setBriefing(
        `Good ${getTimeOfDay()}! You have ${stats?.dueToday || 0} tasks to focus on today. Let's make it a productive one! 🚀`
      );
    } finally {
      setLoadingBriefing(false);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'done') return false;
    return task.due_date < new Date().toISOString().split('T')[0];
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Group tasks by status for board view
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(t => t.due_date === date);
  };

  const formatCalendarDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(calendarMonth);
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - startingDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)] text-white flex">
      <Sidebar />

      <main className="flex-1 ml-16 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">My Day</h1>
                  <p className="text-sm text-white/60">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-violet-500/20 text-violet-400' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ListTodo className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'board' ? 'bg-violet-500/20 text-violet-400' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowQuickAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>

          {/* Daily Briefing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-medium text-violet-300 mb-1">Daily Briefing</h3>
                  {briefing ? (
                    <p className="text-white/80">{briefing}</p>
                  ) : loadingBriefing ? (
                    <div className="flex items-center gap-2 text-white/60">
                      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      Generating your briefing...
                    </div>
                  ) : (
                    <button
                      onClick={generateBriefing}
                      className="text-violet-400 hover:text-violet-300 text-sm"
                    >
                      Generate AI briefing →
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats?.dueToday || 0}</div>
                  <div className="text-xs text-white/60">Due Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats?.overdue || 0}</div>
                  <div className="text-xs text-white/60">Overdue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats?.done || 0}</div>
                  <div className="text-xs text-white/60">Completed</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Calendar Widget */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="rounded-2xl bg-[var(--bg-charcoal)] border border-white/10 overflow-hidden">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Calendar</h3>
                        <p className="text-xs text-white/60">
                          {calendarConnected ? 'Connected to Google Calendar' : 'View tasks by date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!calendarConnected && (
                        <button
                          onClick={() => setCalendarConnected(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Connect Calendar
                        </button>
                      )}
                      {calendarConnected && (
                        <button
                          onClick={() => fetchTasks()}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                          title="Sync calendar"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                        title="Hide calendar"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="p-4">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-medium text-white">
                        {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs text-white/40 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, i) => {
                        if (day === null) {
                          return <div key={i} className="aspect-square" />;
                        }

                        const dateStr = formatCalendarDate(
                          calendarMonth.getFullYear(),
                          calendarMonth.getMonth(),
                          day
                        );
                        const dayTasks = getTasksForDate(dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];
                        const hasOverdue = dayTasks.some(t => isOverdue(t));
                        const hasUrgent = dayTasks.some(t => t.priority === 'urgent');

                        return (
                          <motion.button
                            key={i}
                            onClick={() => {
                              setNewTaskDueDate(dateStr);
                              setShowQuickAdd(true);
                            }}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center relative group transition-colors ${
                              isToday
                                ? 'bg-violet-500/20 border border-violet-500/50 text-violet-400'
                                : dayTasks.length > 0
                                ? 'bg-white/5 hover:bg-white/10'
                                : 'hover:bg-white/5'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className={`text-sm ${isToday ? 'font-medium' : 'text-white/70'}`}>
                              {day}
                            </span>
                            {dayTasks.length > 0 && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {dayTasks.slice(0, 3).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-1 h-1 rounded-full ${
                                      hasOverdue
                                        ? 'bg-red-400'
                                        : hasUrgent
                                        ? 'bg-orange-400'
                                        : 'bg-blue-400'
                                    }`}
                                  />
                                ))}
                                {dayTasks.length > 3 && (
                                  <span className="text-[10px] text-white/40">+</span>
                                )}
                              </div>
                            )}

                            {/* Tooltip */}
                            {dayTasks.length > 0 && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--bg-slate)] rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg border border-white/10">
                                {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Calendar Integration Options */}
                    {!calendarConnected && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-white/40 mb-3">Connect external calendars:</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCalendarConnected(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google Calendar
                          </button>
                          <button
                            onClick={() => setCalendarConnected(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition-colors"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0078D4">
                              <path d="M21.5 0h-19A2.5 2.5 0 000 2.5v19A2.5 2.5 0 002.5 24h19a2.5 2.5 0 002.5-2.5v-19A2.5 2.5 0 0021.5 0zM7 19H5v-9h2v9zm-1-10.2a1.2 1.2 0 110-2.4 1.2 1.2 0 010 2.4zM19 19h-2v-4.5c0-1.1-.4-1.8-1.4-1.8-.8 0-1.2.5-1.4 1-.1.2-.1.4-.1.7V19h-2v-9h2v1.2c.3-.4.9-1.2 2.2-1.2 1.6 0 2.7 1 2.7 3.2V19z"/>
                            </svg>
                            Outlook
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show Calendar Button (when hidden) */}
          {!showCalendar && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCalendar(true)}
              className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              Show Calendar
            </motion.button>
          )}

          {/* Quick Add Modal */}
          <AnimatePresence>
            {showQuickAdd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                onClick={() => setShowQuickAdd(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-lg bg-[var(--bg-charcoal)] rounded-2xl border border-white/10 p-6"
                >
                  <h3 className="text-lg font-semibold mb-4">Quick Add Task</h3>

                  <div className="space-y-4">
                    <input
                      ref={quickAddRef}
                      type="text"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createTask()}
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />

                    <div className="flex items-center gap-4">
                      {/* Priority */}
                      <div className="flex-1">
                        <label className="text-xs text-white/60 mb-1 block">Priority</label>
                        <div className="flex items-center gap-2">
                          {(['low', 'medium', 'high', 'urgent'] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => setNewTaskPriority(p)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                newTaskPriority === p
                                  ? `${priorityColors[p].bg} ${priorityColors[p].text}`
                                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                              }`}
                            >
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="text-xs text-white/60 mb-1 block">Due Date</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={e => setNewTaskDueDate(e.target.value)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setShowQuickAdd(false)}
                        className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createTask}
                        disabled={!newTaskTitle.trim()}
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-4 h-4 text-white/40" />
            {(['all', 'today', 'overdue', 'upcoming'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Tasks' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Task List View */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))
              ) : tasks.length === 0 ? (
                <div className="text-center py-16">
                  <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white/60">No tasks yet</h3>
                  <p className="text-sm text-white/40 mt-1">Add your first task to get started</p>
                  <button
                    onClick={() => setShowQuickAdd(true)}
                    className="mt-4 px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Task
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {tasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group p-4 rounded-xl transition-colors ${
                        task.status === 'done'
                          ? 'bg-white/[0.02] opacity-60'
                          : isOverdue(task)
                          ? 'bg-red-500/5 border border-red-500/20'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() =>
                            updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')
                          }
                          className="mt-0.5 flex-shrink-0"
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-white/40 hover:text-violet-400 transition-colors" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                task.status === 'done' ? 'line-through text-white/50' : 'text-white'
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                priorityColors[task.priority].bg
                              } ${priorityColors[task.priority].text}`}
                            >
                              {task.priority}
                            </span>

                            {/* Overdue Badge */}
                            {isOverdue(task) && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-sm text-white/50 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2">
                            {task.due_date && (
                              <span
                                className={`flex items-center gap-1 text-xs ${
                                  isOverdue(task) ? 'text-red-400' : 'text-white/40'
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.due_date)}
                                {task.due_time && ` at ${task.due_time}`}
                              </span>
                            )}

                            {task.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag className="w-3 h-3 text-white/40" />
                                {task.tags.slice(0, 2).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-white/5 rounded text-xs text-white/60"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Subtasks indicator */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <button
                                onClick={() => toggleTaskExpanded(task.id)}
                                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60"
                              >
                                {expandedTasks.has(task.id) ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                                {task.subtasks.filter(st => st.status === 'done').length}/
                                {task.subtasks.length} subtasks
                              </button>
                            )}
                          </div>

                          {/* Expanded Subtasks */}
                          <AnimatePresence>
                            {expandedTasks.has(task.id) && task.subtasks && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pl-4 border-l-2 border-white/10 space-y-2"
                              >
                                {task.subtasks.map(subtask => (
                                  <div
                                    key={subtask.id}
                                    className="flex items-center gap-3 text-sm"
                                  >
                                    <button
                                      onClick={() =>
                                        updateTaskStatus(
                                          subtask.id,
                                          subtask.status === 'done' ? 'todo' : 'done'
                                        )
                                      }
                                    >
                                      {subtask.status === 'done' ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-white/40" />
                                      )}
                                    </button>
                                    <span
                                      className={
                                        subtask.status === 'done'
                                          ? 'line-through text-white/40'
                                          : 'text-white/70'
                                      }
                                    >
                                      {subtask.title}
                                    </span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {task.status !== 'done' && task.status !== 'in_progress' && (
                            <button
                              onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              title="Start working"
                            >
                              <Clock className="w-4 h-4 text-white/60" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}

          {/* Board View */}
          {viewMode === 'board' && (
            <div className="grid grid-cols-3 gap-6">
              {(['todo', 'in_progress', 'done'] as const).map(status => (
                <div key={status} className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-medium text-white/80">{statusLabels[status]}</h3>
                    <span className="text-sm text-white/40">
                      {tasksByStatus[status].length}
                    </span>
                  </div>

                  <div className="space-y-2 min-h-[200px] p-2 bg-white/[0.02] rounded-xl">
                    {tasksByStatus[status].map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          isOverdue(task)
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            status === 'todo'
                              ? 'in_progress'
                              : status === 'in_progress'
                              ? 'done'
                              : 'todo'
                          )
                        }
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`text-sm font-medium ${
                              status === 'done' ? 'line-through text-white/50' : 'text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              task.priority === 'urgent'
                                ? 'bg-red-400'
                                : task.priority === 'high'
                                ? 'bg-orange-400'
                                : task.priority === 'medium'
                                ? 'bg-yellow-400'
                                : 'bg-blue-400'
                            }`}
                          />
                        </div>

                        {task.due_date && (
                          <span
                            className={`flex items-center gap-1 text-xs ${
                              isOverdue(task) ? 'text-red-400' : 'text-white/40'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                      </motion.div>
                    ))}

                    {tasksByStatus[status].length === 0 && (
                      <div className="text-center py-8 text-white/30 text-sm">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Demo tasks for development
function getDemoTasks(): Task[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return [
    {
      id: '1',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Review Q4 budget proposal',
      description: 'Go through the finance team\'s budget proposal and provide feedback',
      status: 'todo',
      priority: 'high',
      due_date: today,
      tags: ['finance', 'review'],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Complete onboarding documentation',
      description: 'Update the employee handbook with new remote work policies',
      status: 'in_progress',
      priority: 'medium',
      due_date: tomorrow,
      tags: ['hr', 'documentation'],
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Submit expense reports',
      status: 'todo',
      priority: 'urgent',
      due_date: yesterday,
      tags: ['finance'],
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '4',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Prepare presentation for team meeting',
      status: 'todo',
      priority: 'high',
      due_date: today,
      tags: ['meeting', 'presentation'],
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date().toISOString(),
      subtasks: [
        {
          id: '4a',
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Create slide deck',
          status: 'done',
          priority: 'medium',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4b',
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Add charts and graphs',
          status: 'todo',
          priority: 'medium',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4c',
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Practice presentation',
          status: 'todo',
          priority: 'low',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: '5',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Schedule 1:1 with manager',
      status: 'done',
      priority: 'low',
      due_date: today,
      tags: ['meeting'],
      completed_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Update project roadmap',
      status: 'in_progress',
      priority: 'medium',
      due_date: tomorrow,
      tags: ['planning'],
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

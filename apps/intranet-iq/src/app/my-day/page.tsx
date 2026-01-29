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

        // If API returns empty, use demo data for development
        if (filteredTasks.length === 0) {
          const demoTasks = getDemoTasks();
          const today = new Date().toISOString().split('T')[0];

          // Apply filtering to demo tasks
          if (filter === 'today') {
            filteredTasks = demoTasks.filter((t: Task) => t.due_date === today);
          } else if (filter === 'overdue') {
            filteredTasks = demoTasks.filter((t: Task) =>
              t.due_date && t.due_date < today && t.status !== 'done'
            );
          } else if (filter === 'upcoming') {
            filteredTasks = demoTasks.filter((t: Task) =>
              t.due_date && t.due_date > today
            );
          } else {
            filteredTasks = demoTasks;
          }

          setTasks(filteredTasks);
          setStats({
            total: demoTasks.length,
            todo: demoTasks.filter(t => t.status === 'todo').length,
            inProgress: demoTasks.filter(t => t.status === 'in_progress').length,
            done: demoTasks.filter(t => t.status === 'done').length,
            overdue: demoTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
            dueToday: demoTasks.filter(t => t.due_date === today).length,
          });
          return;
        }

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
      // Use demo data with accurate stats
      const demoTasks = getDemoTasks();
      const today = new Date().toISOString().split('T')[0];
      setTasks(demoTasks);
      setStats({
        total: demoTasks.length,
        todo: demoTasks.filter(t => t.status === 'todo').length,
        inProgress: demoTasks.filter(t => t.status === 'in_progress').length,
        done: demoTasks.filter(t => t.status === 'done').length,
        overdue: demoTasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
        dueToday: demoTasks.filter(t => t.due_date === today).length,
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

{/* Gmail-Style Calendar Widget with Event Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="rounded-2xl bg-[#0d1117] border border-white/[0.06] overflow-hidden shadow-2xl">
              {/* Calendar Header - Clean & Minimal */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#0d1117] to-[#131920]">
                <div className="flex items-center gap-4">
                  {/* Month Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-semibold text-white min-w-[160px] text-center">
                      {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCalendarMonth(new Date())}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Today
                  </button>
                </div>

                {/* Project Legend */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[4px] bg-rose-500"></span>
                      <span className="text-white/60">Urgent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[4px] bg-amber-500"></span>
                      <span className="text-white/60">High</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[4px] bg-sky-500"></span>
                      <span className="text-white/60">Medium</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-[4px] bg-emerald-500"></span>
                      <span className="text-white/60">Low</span>
                    </div>
                  </div>
                  {!calendarConnected && (
                    <button
                      onClick={() => setCalendarConnected(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Connect Calendar
                    </button>
                  )}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-white/40 uppercase tracking-wider py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days with Event Pills */}
                <div className="grid grid-cols-7 border-t border-l border-white/[0.06]">
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return (
                        <div
                          key={i}
                          className="min-h-[100px] border-r border-b border-white/[0.06] bg-white/[0.01]"
                        />
                      );
                    }

                    const dateStr = formatCalendarDate(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      day
                    );
                    const dayTasks = getTasksForDate(dateStr);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isPast = dateStr < new Date().toISOString().split('T')[0];
                    const isWeekend = i % 7 === 0 || i % 7 === 6;
                    const taskCount = dayTasks.length;

                    // Get color for task based on priority
                    const getTaskColor = (task: Task) => {
                      if (isOverdue(task)) return { bg: 'bg-rose-500', text: 'text-white', hover: 'hover:bg-rose-600' };
                      switch (task.priority) {
                        case 'urgent': return { bg: 'bg-rose-500', text: 'text-white', hover: 'hover:bg-rose-600' };
                        case 'high': return { bg: 'bg-amber-500', text: 'text-amber-950', hover: 'hover:bg-amber-400' };
                        case 'medium': return { bg: 'bg-sky-500', text: 'text-white', hover: 'hover:bg-sky-400' };
                        case 'low': return { bg: 'bg-emerald-500', text: 'text-white', hover: 'hover:bg-emerald-400' };
                        default: return { bg: 'bg-slate-500', text: 'text-white', hover: 'hover:bg-slate-400' };
                      }
                    };

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setNewTaskDueDate(dateStr);
                          setShowQuickAdd(true);
                        }}
                        className={`min-h-[100px] border-r border-b border-white/[0.06] p-1.5 cursor-pointer transition-all group ${
                          isToday
                            ? 'bg-emerald-500/[0.08]'
                            : isWeekend
                            ? 'bg-white/[0.02]'
                            : isPast
                            ? 'bg-transparent'
                            : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        {/* Day Number */}
                        <div className={`flex items-center justify-between mb-1`}>
                          <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                            isToday
                              ? 'bg-emerald-500 text-white'
                              : isPast && taskCount === 0
                              ? 'text-white/25'
                              : 'text-white/70 group-hover:text-white'
                          }`}>
                            {day}
                          </span>
                          {/* Add button on hover */}
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white/0 group-hover:text-white/40 hover:!text-emerald-400 hover:!bg-emerald-500/20 transition-all">
                            <Plus className="w-4 h-4" />
                          </span>
                        </div>

                        {/* Event Pills */}
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map((task, idx) => {
                            const colors = getTaskColor(task);
                            return (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`px-2 py-1 rounded-md text-[11px] font-medium truncate cursor-pointer transition-all ${colors.bg} ${colors.text} ${colors.hover}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Could open task detail modal here
                                }}
                                title={`${task.title}${task.due_time ? ` at ${task.due_time}` : ''}`}
                              >
                                {task.due_time && (
                                  <span className="opacity-80 mr-1">{task.due_time.slice(0, 5)}</span>
                                )}
                                {task.title}
                              </motion.div>
                            );
                          })}
                          {/* More indicator */}
                          {taskCount > 3 && (
                            <div className="px-2 py-0.5 text-[10px] font-medium text-white/50 hover:text-white/70 cursor-pointer transition-colors">
                              +{taskCount - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Footer - Connected Calendars */}
              <div className="px-5 py-3 bg-[#0a0d10] border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">Connected:</span>
                  {calendarConnected ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-white/70">Google Calendar</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <rect width="24" height="24" rx="4" fill="#0078D4"/>
                          <path d="M6 6h5v5H6V6zm7 0h5v5h-5V6zm-7 7h5v5H6v-5zm7 0h5v5h-5v-5z" fill="white" fillOpacity="0.9"/>
                        </svg>
                        <span className="text-white/70">Outlook</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">None - Click "Connect Calendar" above</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span>{tasks.filter(t => t.due_date && t.status !== 'done').length} events</span>
                  <span>•</span>
                  <span>{stats?.overdue || 0} overdue</span>
                </div>
              </div>
            </div>
          </motion.div>

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

// Demo tasks for development - comprehensive realistic data
function getDemoTasks(): Task[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Helper to get date string for X days from now (negative = past)
  const getDate = (daysOffset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  // Generate comprehensive task data across the entire month
  const tasks: Task[] = [];
  let taskId = 1;

  // Helper to create a task
  const createTask = (
    title: string,
    priority: Task['priority'],
    daysOffset: number,
    time?: string,
    status: Task['status'] = 'todo',
    tags: string[] = []
  ): Task => ({
    id: String(taskId++),
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    title,
    status,
    priority,
    due_date: getDate(daysOffset),
    due_time: time,
    tags,
    created_at: getDate(daysOffset - 5) + 'T09:00:00Z',
    updated_at: now.toISOString(),
    ...(status === 'done' ? { completed_at: getDate(daysOffset) + 'T17:00:00Z' } : {}),
  });

  // === JANUARY 1-5 (Past - beginning of month) ===
  tasks.push(createTask('New Year planning session', 'high', -28, '10:00', 'done', ['planning']));
  tasks.push(createTask('Q1 OKRs kickoff', 'urgent', -28, '14:00', 'done', ['planning', 'okr']));
  tasks.push(createTask('Team welcome back meeting', 'medium', -27, '09:00', 'done', ['meeting']));
  tasks.push(createTask('Review holiday backlog', 'high', -27, '11:00', 'done', ['engineering']));
  tasks.push(createTask('Update project roadmaps', 'medium', -26, '10:00', 'done', ['planning']));
  tasks.push(createTask('Security audit preparation', 'high', -26, '14:00', 'done', ['security']));
  tasks.push(createTask('Client check-in calls', 'medium', -25, '11:00', 'done', ['client']));
  tasks.push(createTask('Infrastructure review', 'low', -25, '15:00', 'done', ['engineering']));
  tasks.push(createTask('Budget planning meeting', 'high', -24, '09:00', 'done', ['finance']));

  // === JANUARY 6-10 ===
  tasks.push(createTask('Sprint 1 planning', 'high', -23, '10:00', 'done', ['agile']));
  tasks.push(createTask('Code review workshop', 'medium', -23, '14:00', 'done', ['engineering']));
  tasks.push(createTask('Design system updates', 'medium', -22, '11:00', 'done', ['design']));
  tasks.push(createTask('API versioning discussion', 'high', -22, '15:00', 'done', ['engineering']));
  tasks.push(createTask('Stakeholder presentation', 'urgent', -21, '09:00', 'done', ['meeting']));
  tasks.push(createTask('Performance optimization', 'high', -21, '13:00', 'done', ['engineering']));
  tasks.push(createTask('Documentation sprint', 'low', -20, '10:00', 'done', ['documentation']));
  tasks.push(createTask('Team 1:1s', 'medium', -20, '14:00', 'done', ['meeting']));
  tasks.push(createTask('Release planning', 'high', -19, '09:00', 'done', ['release']));
  tasks.push(createTask('QA sync meeting', 'medium', -19, '11:00', 'done', ['qa']));

  // === JANUARY 11-15 ===
  tasks.push(createTask('Customer feedback review', 'high', -18, '10:00', 'done', ['product']));
  tasks.push(createTask('Tech debt prioritization', 'medium', -18, '14:00', 'done', ['engineering']));
  tasks.push(createTask('Marketing sync', 'low', -17, '11:00', 'done', ['marketing']));
  tasks.push(createTask('Database migration prep', 'urgent', -17, '14:00', 'done', ['engineering']));
  tasks.push(createTask('Security training', 'high', -16, '09:00', 'done', ['hr', 'security']));
  tasks.push(createTask('Sprint review', 'medium', -16, '15:00', 'done', ['agile']));
  tasks.push(createTask('Product demo prep', 'high', -15, '10:00', 'done', ['product']));
  tasks.push(createTask('Hiring pipeline review', 'medium', -15, '13:00', 'done', ['hr']));
  tasks.push(createTask('Vendor contract review', 'low', -14, '11:00', 'done', ['legal']));
  tasks.push(createTask('Architecture review', 'high', -14, '14:00', 'done', ['engineering']));

  // === JANUARY 16-20 ===
  tasks.push(createTask('Sprint retrospective', 'medium', -13, '10:00', 'done', ['agile']));
  tasks.push(createTask('Onboarding new hire', 'high', -13, '14:00', 'done', ['hr']));
  tasks.push(createTask('Client demo', 'urgent', -12, '09:00', 'done', ['client', 'demo']));
  tasks.push(createTask('Feature flag cleanup', 'low', -12, '15:00', 'done', ['engineering']));
  tasks.push(createTask('Compliance audit', 'high', -11, '10:00', 'done', ['compliance']));
  tasks.push(createTask('Team building activity', 'low', -11, '16:00', 'done', ['team']));
  tasks.push(createTask('Roadmap presentation', 'high', -10, '11:00', 'done', ['product']));
  tasks.push(createTask('Partner integration call', 'medium', -10, '14:00', 'done', ['integration']));
  tasks.push(createTask('Performance reviews', 'urgent', -9, '09:00', 'done', ['hr']));
  tasks.push(createTask('Sprint 2 kickoff', 'high', -9, '14:00', 'done', ['agile']));

  // === JANUARY 21-25 ===
  tasks.push(createTask('CI/CD pipeline update', 'high', -8, '10:00', 'done', ['devops']));
  tasks.push(createTask('UX review session', 'medium', -8, '14:00', 'done', ['design']));
  tasks.push(createTask('Data analytics review', 'medium', -7, '11:00', 'done', ['analytics']));
  tasks.push(createTask('API documentation', 'low', -7, '15:00', 'done', ['documentation']));
  tasks.push(createTask('Executive briefing', 'urgent', -6, '09:00', 'done', ['meeting']));
  tasks.push(createTask('Code freeze review', 'high', -6, '14:00', 'done', ['release']));
  tasks.push(createTask('Bug triage session', 'medium', -5, '10:00', 'done', ['qa']));
  tasks.push(createTask('Incident response drill', 'high', -5, '14:00', 'done', ['security']));
  tasks.push(createTask('Client escalation call', 'urgent', -4, '09:00', 'done', ['client']));
  tasks.push(createTask('Knowledge base update', 'low', -4, '11:00', 'done', ['documentation']));

  // === JANUARY 26-28 (Recent past - some overdue) ===
  tasks.push(createTask('Submit Q4 expense reports', 'urgent', -3, undefined, 'todo', ['finance']));
  tasks.push(createTask('Update Jira tickets', 'low', -3, '16:00', 'done', ['admin']));
  tasks.push(createTask('Complete security training', 'high', -2, undefined, 'todo', ['hr', 'compliance']));
  tasks.push(createTask('Sprint retrospective', 'medium', -2, '17:00', 'done', ['agile']));
  tasks.push(createTask('Review pull request #847', 'high', -1, undefined, 'in_progress', ['engineering']));
  tasks.push(createTask('Prepare demo environment', 'medium', -1, '15:00', 'done', ['engineering']));

  // === TODAY (January 29) ===
  tasks.push(createTask('Sprint planning presentation', 'high', 0, '14:00', 'in_progress', ['meeting']));
  tasks.push(createTask('1:1 with Sarah', 'medium', 0, '10:30', 'todo', ['meeting', '1:1']));
  tasks.push(createTask('Deploy hotfix to production', 'urgent', 0, '16:00', 'todo', ['engineering']));
  tasks.push(createTask('Review team OKRs draft', 'medium', 0, undefined, 'todo', ['planning']));
  tasks.push(createTask('Morning standup', 'low', 0, '09:00', 'done', ['meeting']));
  tasks.push(createTask('Respond to client emails', 'medium', 0, undefined, 'done', ['communication']));

  // === JANUARY 30-31 ===
  tasks.push(createTask('Product roadmap review', 'high', 1, '10:00', 'todo', ['meeting', 'planning']));
  tasks.push(createTask('Update API documentation', 'medium', 1, undefined, 'todo', ['documentation']));
  tasks.push(createTask('Security patch deployment', 'urgent', 1, '15:00', 'todo', ['security']));
  tasks.push(createTask('All-hands meeting presentation', 'high', 2, '11:00', 'todo', ['meeting']));
  tasks.push(createTask('Monthly metrics review', 'medium', 2, '14:00', 'todo', ['analytics']));
  tasks.push(createTask('Client onboarding call', 'high', 2, '16:00', 'todo', ['client']));

  // === FEBRUARY 1-5 ===
  tasks.push(createTask('Performance review self-assessment', 'medium', 3, undefined, 'todo', ['hr']));
  tasks.push(createTask('Vendor demo - CI/CD tool', 'low', 3, '15:00', 'todo', ['vendor']));
  tasks.push(createTask('Database optimization', 'high', 3, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Code freeze preparation', 'high', 4, undefined, 'todo', ['release']));
  tasks.push(createTask('Feature flag audit', 'medium', 4, '11:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer success sync', 'low', 4, '14:00', 'todo', ['client']));
  tasks.push(createTask('Interview - Senior Engineer', 'medium', 5, '14:00', 'todo', ['hr']));
  tasks.push(createTask('Quarterly business review prep', 'medium', 5, undefined, 'todo', ['planning']));
  tasks.push(createTask('Infrastructure scaling review', 'high', 5, '10:00', 'todo', ['devops']));
  tasks.push(createTask('Team building event planning', 'low', 6, undefined, 'todo', ['team']));
  tasks.push(createTask('Sprint 3 preparation', 'medium', 6, '11:00', 'todo', ['agile']));
  tasks.push(createTask('Security audit follow-up', 'high', 6, '14:00', 'todo', ['security']));
  tasks.push(createTask('Architecture review - Microservices', 'high', 7, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing campaign review', 'low', 7, '14:00', 'todo', ['marketing']));

  // === FEBRUARY 6-10 ===
  tasks.push(createTask('Release v2.5 planning', 'urgent', 8, '09:00', 'todo', ['release']));
  tasks.push(createTask('UX research presentation', 'medium', 8, '14:00', 'todo', ['design']));
  tasks.push(createTask('Partner integration testing', 'high', 9, '10:00', 'todo', ['integration']));
  tasks.push(createTask('Legal compliance review', 'medium', 9, '15:00', 'todo', ['legal']));
  tasks.push(createTask('Engineering all-hands', 'high', 10, '11:00', 'todo', ['meeting']));
  tasks.push(createTask('Budget review meeting', 'medium', 10, '14:00', 'todo', ['finance']));
  tasks.push(createTask('Product demo to investors', 'urgent', 11, '10:00', 'todo', ['demo']));
  tasks.push(createTask('Tech debt sprint planning', 'high', 11, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer feedback workshop', 'medium', 12, '11:00', 'todo', ['product']));
  tasks.push(createTask('Mentorship program kickoff', 'low', 12, '15:00', 'todo', ['hr']));

  // === FEBRUARY 11-15 ===
  tasks.push(createTask('Quarterly OKR review', 'high', 13, '09:00', 'todo', ['planning']));
  tasks.push(createTask('System monitoring upgrade', 'medium', 13, '14:00', 'todo', ['devops']));
  tasks.push(createTask('Valentines team lunch', 'low', 14, '12:00', 'todo', ['team']));
  tasks.push(createTask('Security penetration test', 'urgent', 14, '10:00', 'todo', ['security']));
  tasks.push(createTask('Mobile app review', 'high', 15, '11:00', 'todo', ['product']));
  tasks.push(createTask('Data privacy training', 'medium', 15, '14:00', 'todo', ['compliance']));
  tasks.push(createTask('Sprint 3 retrospective', 'medium', 16, '10:00', 'todo', ['agile']));
  tasks.push(createTask('AWS cost optimization', 'high', 16, '14:00', 'todo', ['devops']));

  // === FEBRUARY 17-21 ===
  tasks.push(createTask('Board meeting preparation', 'urgent', 17, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('API rate limiting review', 'high', 17, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Employee engagement survey', 'medium', 18, '10:00', 'todo', ['hr']));
  tasks.push(createTask('Cloud infrastructure review', 'high', 18, '15:00', 'todo', ['devops']));
  tasks.push(createTask('Sprint 4 planning', 'high', 19, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Customer success metrics', 'medium', 19, '14:00', 'todo', ['analytics']));
  tasks.push(createTask('Design review - Dashboard', 'medium', 20, '11:00', 'todo', ['design']));
  tasks.push(createTask('Performance testing', 'high', 20, '14:00', 'todo', ['qa']));
  tasks.push(createTask('Legal document review', 'low', 21, '10:00', 'todo', ['legal']));
  tasks.push(createTask('Team sync - Frontend', 'medium', 21, '15:00', 'todo', ['engineering']));

  // === FEBRUARY 22-28 ===
  tasks.push(createTask('Release candidate testing', 'urgent', 22, '09:00', 'todo', ['release']));
  tasks.push(createTask('Marketing content review', 'low', 22, '13:00', 'todo', ['marketing']));
  tasks.push(createTask('Database backup audit', 'high', 23, '10:00', 'todo', ['devops']));
  tasks.push(createTask('Stakeholder update call', 'medium', 23, '14:00', 'todo', ['meeting']));
  tasks.push(createTask('Code quality review', 'high', 24, '11:00', 'todo', ['engineering']));
  tasks.push(createTask('Training material update', 'low', 24, '15:00', 'todo', ['hr']));
  tasks.push(createTask('End of month reporting', 'high', 25, '09:00', 'todo', ['finance']));
  tasks.push(createTask('Sprint 4 review', 'medium', 25, '14:00', 'todo', ['agile']));
  tasks.push(createTask('Compliance documentation', 'medium', 26, '10:00', 'todo', ['compliance']));
  tasks.push(createTask('Customer interviews', 'high', 26, '14:00', 'todo', ['product']));
  tasks.push(createTask('Infrastructure maintenance', 'low', 27, '08:00', 'todo', ['devops']));
  tasks.push(createTask('Product backlog refinement', 'medium', 27, '11:00', 'todo', ['product']));
  tasks.push(createTask('February wrap-up meeting', 'medium', 28, '10:00', 'todo', ['meeting']));
  tasks.push(createTask('Knowledge sharing session', 'low', 28, '15:00', 'todo', ['team']));

  // === MARCH 1-5 ===
  tasks.push(createTask('Q1 planning kickoff', 'urgent', 31, '09:00', 'todo', ['planning']));
  tasks.push(createTask('New hire orientation', 'high', 31, '14:00', 'todo', ['hr']));
  tasks.push(createTask('Architecture decision record', 'medium', 32, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing strategy review', 'high', 32, '14:00', 'todo', ['marketing']));
  tasks.push(createTask('Sprint 5 kickoff', 'high', 33, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Data migration planning', 'urgent', 33, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Vendor negotiations', 'medium', 34, '11:00', 'todo', ['vendor']));
  tasks.push(createTask('Security awareness training', 'high', 34, '15:00', 'todo', ['security']));
  tasks.push(createTask('Customer success review', 'medium', 35, '10:00', 'todo', ['client']));
  tasks.push(createTask('API documentation sprint', 'low', 35, '14:00', 'todo', ['documentation']));

  // === MARCH 6-10 ===
  tasks.push(createTask('Board presentation prep', 'urgent', 36, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Feature prioritization', 'high', 36, '14:00', 'todo', ['product']));
  tasks.push(createTask('DevOps pipeline review', 'high', 37, '10:00', 'todo', ['devops']));
  tasks.push(createTask('UX testing session', 'medium', 37, '14:00', 'todo', ['design']));
  tasks.push(createTask('Partner integration review', 'medium', 38, '11:00', 'todo', ['integration']));
  tasks.push(createTask('Code review standards', 'high', 38, '15:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer feedback analysis', 'medium', 39, '10:00', 'todo', ['product']));
  tasks.push(createTask('Infrastructure cost review', 'high', 39, '14:00', 'todo', ['finance']));
  tasks.push(createTask('Sprint 5 demo', 'high', 40, '11:00', 'todo', ['agile']));
  tasks.push(createTask('Team building workshop', 'low', 40, '15:00', 'todo', ['team']));

  // === MARCH 11-15 ===
  tasks.push(createTask('Quarterly planning', 'urgent', 41, '09:00', 'todo', ['planning']));
  tasks.push(createTask('Mobile app testing', 'high', 41, '14:00', 'todo', ['qa']));
  tasks.push(createTask('Client demo preparation', 'high', 42, '10:00', 'todo', ['client']));
  tasks.push(createTask('Documentation review', 'medium', 42, '14:00', 'todo', ['documentation']));
  tasks.push(createTask('Performance optimization', 'high', 43, '11:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing webinar', 'medium', 43, '15:00', 'todo', ['marketing']));
  tasks.push(createTask('Release planning v3.0', 'urgent', 44, '09:00', 'todo', ['release']));
  tasks.push(createTask('Employee feedback session', 'medium', 44, '14:00', 'todo', ['hr']));
  tasks.push(createTask('Weekend deployment prep', 'high', 45, '10:00', 'todo', ['devops']));
  tasks.push(createTask('Sprint 6 planning', 'medium', 45, '14:00', 'todo', ['agile']));

  // === MARCH 16-20 ===
  tasks.push(createTask('Executive strategy review', 'urgent', 46, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Tech debt assessment', 'high', 46, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Compliance audit prep', 'high', 47, '10:00', 'todo', ['compliance']));
  tasks.push(createTask('User research findings', 'medium', 47, '14:00', 'todo', ['design']));
  tasks.push(createTask('Database optimization', 'high', 48, '11:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales enablement training', 'medium', 48, '15:00', 'todo', ['sales']));
  tasks.push(createTask('Product launch checklist', 'urgent', 49, '09:00', 'todo', ['product']));
  tasks.push(createTask('Security incident drill', 'high', 49, '14:00', 'todo', ['security']));
  tasks.push(createTask('March all-hands meeting', 'high', 50, '11:00', 'todo', ['meeting']));
  tasks.push(createTask('Innovation lab session', 'low', 50, '15:00', 'todo', ['team']));

  // === MARCH 21-25 ===
  tasks.push(createTask('API gateway upgrade', 'high', 51, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer onboarding review', 'medium', 51, '14:00', 'todo', ['client']));
  tasks.push(createTask('Budget reforecast', 'urgent', 52, '09:00', 'todo', ['finance']));
  tasks.push(createTask('Design system update', 'medium', 52, '14:00', 'todo', ['design']));
  tasks.push(createTask('Partner webinar', 'medium', 53, '11:00', 'todo', ['marketing']));
  tasks.push(createTask('Load testing session', 'high', 53, '15:00', 'todo', ['qa']));
  tasks.push(createTask('Sprint 6 demo', 'high', 54, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Career development talks', 'low', 54, '14:00', 'todo', ['hr']));
  tasks.push(createTask('Infrastructure scaling', 'high', 55, '09:00', 'todo', ['devops']));
  tasks.push(createTask('Product analytics review', 'medium', 55, '14:00', 'todo', ['analytics']));

  // === MARCH 26-31 ===
  tasks.push(createTask('Q1 retrospective', 'high', 56, '10:00', 'todo', ['planning']));
  tasks.push(createTask('Documentation cleanup', 'low', 56, '15:00', 'todo', ['documentation']));
  tasks.push(createTask('Client success stories', 'medium', 57, '11:00', 'todo', ['marketing']));
  tasks.push(createTask('Code freeze review', 'urgent', 57, '14:00', 'todo', ['release']));
  tasks.push(createTask('End of Q1 reporting', 'urgent', 58, '09:00', 'todo', ['finance']));
  tasks.push(createTask('Team appreciation event', 'low', 58, '16:00', 'todo', ['team']));
  tasks.push(createTask('Sprint 7 planning', 'high', 59, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Security assessment', 'high', 59, '14:00', 'todo', ['security']));
  tasks.push(createTask('Q2 roadmap finalization', 'urgent', 60, '09:00', 'todo', ['product']));
  tasks.push(createTask('March metrics review', 'medium', 60, '14:00', 'todo', ['analytics']));
  tasks.push(createTask('Release v3.0 deployment', 'urgent', 61, '10:00', 'todo', ['release']));
  tasks.push(createTask('Q1 celebration', 'low', 61, '17:00', 'todo', ['team']));

  // === APRIL 1-5 ===
  tasks.push(createTask('Q2 kickoff meeting', 'urgent', 62, '09:00', 'todo', ['planning']));
  tasks.push(createTask('April Fools team event', 'low', 62, '15:00', 'todo', ['team']));
  tasks.push(createTask('Engineering sync', 'high', 63, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales pipeline review', 'medium', 63, '14:00', 'todo', ['sales']));
  tasks.push(createTask('New feature kickoff', 'high', 64, '11:00', 'todo', ['product']));
  tasks.push(createTask('DevOps automation', 'medium', 64, '15:00', 'todo', ['devops']));
  tasks.push(createTask('Customer feedback review', 'medium', 65, '10:00', 'todo', ['client']));
  tasks.push(createTask('UX workshop', 'high', 65, '14:00', 'todo', ['design']));
  tasks.push(createTask('Sprint 7 demo', 'high', 66, '11:00', 'todo', ['agile']));
  tasks.push(createTask('Friday learning session', 'low', 66, '15:00', 'todo', ['team']));

  // === APRIL 6-10 ===
  tasks.push(createTask('Board meeting', 'urgent', 67, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Performance reviews', 'high', 67, '14:00', 'todo', ['hr']));
  tasks.push(createTask('API versioning strategy', 'high', 68, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing campaign launch', 'medium', 68, '14:00', 'todo', ['marketing']));
  tasks.push(createTask('Data analytics deep dive', 'medium', 69, '11:00', 'todo', ['analytics']));
  tasks.push(createTask('Partner integration', 'high', 69, '15:00', 'todo', ['integration']));
  tasks.push(createTask('Sprint 8 kickoff', 'high', 70, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Legal compliance review', 'medium', 70, '14:00', 'todo', ['legal']));
  tasks.push(createTask('Infrastructure review', 'high', 71, '09:00', 'todo', ['devops']));
  tasks.push(createTask('Product demo to leads', 'medium', 71, '14:00', 'todo', ['demo']));

  // === APRIL 11-15 ===
  tasks.push(createTask('Tech stack evaluation', 'medium', 72, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer success planning', 'high', 72, '14:00', 'todo', ['client']));
  tasks.push(createTask('Security audit', 'urgent', 73, '09:00', 'todo', ['security']));
  tasks.push(createTask('Design sprint kick-off', 'medium', 73, '14:00', 'todo', ['design']));
  tasks.push(createTask('Budget review Q2', 'high', 74, '10:00', 'todo', ['finance']));
  tasks.push(createTask('Team lead sync', 'medium', 74, '15:00', 'todo', ['meeting']));
  tasks.push(createTask('Release planning v3.1', 'high', 75, '11:00', 'todo', ['release']));
  tasks.push(createTask('Employee training day', 'medium', 75, '14:00', 'todo', ['hr']));
  tasks.push(createTask('Sprint 8 demo', 'high', 76, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Knowledge transfer', 'low', 76, '14:00', 'todo', ['team']));

  // === APRIL 16-20 ===
  tasks.push(createTask('Strategic planning', 'urgent', 77, '09:00', 'todo', ['planning']));
  tasks.push(createTask('Code refactoring sprint', 'high', 77, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing analytics', 'medium', 78, '10:00', 'todo', ['marketing']));
  tasks.push(createTask('QA automation review', 'high', 78, '14:00', 'todo', ['qa']));
  tasks.push(createTask('Vendor management', 'medium', 79, '11:00', 'todo', ['vendor']));
  tasks.push(createTask('Product roadmap update', 'high', 79, '15:00', 'todo', ['product']));
  tasks.push(createTask('Engineering all-hands', 'high', 80, '10:00', 'todo', ['meeting']));
  tasks.push(createTask('Documentation sprint', 'low', 80, '14:00', 'todo', ['documentation']));
  tasks.push(createTask('Sprint 9 planning', 'high', 81, '09:00', 'todo', ['agile']));
  tasks.push(createTask('Friday retrospective', 'medium', 81, '15:00', 'todo', ['team']));

  // === APRIL 21-25 ===
  tasks.push(createTask('Client escalation review', 'urgent', 82, '09:00', 'todo', ['client']));
  tasks.push(createTask('Database migration', 'high', 82, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales training', 'medium', 83, '10:00', 'todo', ['sales']));
  tasks.push(createTask('UX review session', 'medium', 83, '14:00', 'todo', ['design']));
  tasks.push(createTask('Performance testing', 'high', 84, '11:00', 'todo', ['qa']));
  tasks.push(createTask('Partner webinar prep', 'medium', 84, '15:00', 'todo', ['marketing']));
  tasks.push(createTask('Executive update', 'urgent', 85, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Tech debt prioritization', 'high', 85, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Sprint 9 demo', 'high', 86, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Team building lunch', 'low', 86, '12:30', 'todo', ['team']));

  // === APRIL 26-30 ===
  tasks.push(createTask('Security patch deployment', 'urgent', 87, '08:00', 'todo', ['security']));
  tasks.push(createTask('Product metrics review', 'medium', 87, '14:00', 'todo', ['analytics']));
  tasks.push(createTask('HR policy update', 'medium', 88, '10:00', 'todo', ['hr']));
  tasks.push(createTask('Engineering sync', 'high', 88, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer success sync', 'medium', 89, '11:00', 'todo', ['client']));
  tasks.push(createTask('Documentation review', 'low', 89, '15:00', 'todo', ['documentation']));
  tasks.push(createTask('April wrap-up meeting', 'high', 90, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Sprint 10 planning', 'high', 90, '14:00', 'todo', ['agile']));
  tasks.push(createTask('Month-end reporting', 'urgent', 91, '10:00', 'todo', ['finance']));
  tasks.push(createTask('Knowledge sharing', 'low', 91, '15:00', 'todo', ['team']));

  // === MAY 1-5 ===
  tasks.push(createTask('May kickoff meeting', 'high', 92, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Product feature review', 'medium', 92, '14:00', 'todo', ['product']));
  tasks.push(createTask('API optimization', 'high', 93, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing strategy sync', 'medium', 93, '14:00', 'todo', ['marketing']));
  tasks.push(createTask('Infrastructure upgrade', 'urgent', 94, '08:00', 'todo', ['devops']));
  tasks.push(createTask('UX testing round 2', 'medium', 94, '14:00', 'todo', ['design']));
  tasks.push(createTask('Sprint 10 demo', 'high', 95, '11:00', 'todo', ['agile']));
  tasks.push(createTask('Compliance training', 'medium', 95, '15:00', 'todo', ['compliance']));
  tasks.push(createTask('Customer interviews', 'high', 96, '10:00', 'todo', ['client']));
  tasks.push(createTask('Friday team sync', 'low', 96, '16:00', 'todo', ['team']));

  // === MAY 6-10 ===
  tasks.push(createTask('Board report prep', 'urgent', 97, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Security review', 'high', 97, '14:00', 'todo', ['security']));
  tasks.push(createTask('Sales pipeline update', 'medium', 98, '10:00', 'todo', ['sales']));
  tasks.push(createTask('Engineering deep dive', 'high', 98, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Partner integration call', 'medium', 99, '11:00', 'todo', ['integration']));
  tasks.push(createTask('Design review', 'medium', 99, '15:00', 'todo', ['design']));
  tasks.push(createTask('Sprint 11 kickoff', 'high', 100, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Legal contract review', 'medium', 100, '14:00', 'todo', ['legal']));
  tasks.push(createTask('Release v3.2 prep', 'high', 101, '09:00', 'todo', ['release']));
  tasks.push(createTask('Team appreciation', 'low', 101, '16:00', 'todo', ['team']));

  // === MAY 11-15 ===
  tasks.push(createTask('Mothers Day team lunch', 'low', 102, '12:00', 'todo', ['team']));
  tasks.push(createTask('Product roadmap sync', 'high', 102, '14:00', 'todo', ['product']));
  tasks.push(createTask('Database performance', 'high', 103, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Marketing webinar', 'medium', 103, '14:00', 'todo', ['marketing']));
  tasks.push(createTask('HR compliance review', 'medium', 104, '11:00', 'todo', ['hr']));
  tasks.push(createTask('Tech stack update', 'high', 104, '15:00', 'todo', ['devops']));
  tasks.push(createTask('Customer success review', 'medium', 105, '10:00', 'todo', ['client']));
  tasks.push(createTask('Sprint 11 demo', 'high', 105, '14:00', 'todo', ['agile']));
  tasks.push(createTask('Budget midpoint review', 'urgent', 106, '09:00', 'todo', ['finance']));
  tasks.push(createTask('Innovation workshop', 'low', 106, '15:00', 'todo', ['team']));

  // === MAY 16-20 ===
  tasks.push(createTask('Executive sync', 'urgent', 107, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('API documentation', 'medium', 107, '14:00', 'todo', ['documentation']));
  tasks.push(createTask('Performance review cycle', 'high', 108, '10:00', 'todo', ['hr']));
  tasks.push(createTask('Engineering planning', 'high', 108, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales enablement', 'medium', 109, '11:00', 'todo', ['sales']));
  tasks.push(createTask('UX research findings', 'medium', 109, '15:00', 'todo', ['design']));
  tasks.push(createTask('Release deployment', 'urgent', 110, '08:00', 'todo', ['release']));
  tasks.push(createTask('Sprint 12 planning', 'high', 110, '14:00', 'todo', ['agile']));
  tasks.push(createTask('Partner success sync', 'medium', 111, '10:00', 'todo', ['integration']));
  tasks.push(createTask('Team retrospective', 'medium', 111, '15:00', 'todo', ['team']));

  // === MAY 21-25 ===
  tasks.push(createTask('Strategic review', 'urgent', 112, '09:00', 'todo', ['planning']));
  tasks.push(createTask('Security penetration test', 'high', 112, '14:00', 'todo', ['security']));
  tasks.push(createTask('Customer workshop', 'high', 113, '10:00', 'todo', ['client']));
  tasks.push(createTask('Marketing analytics', 'medium', 113, '14:00', 'todo', ['analytics']));
  tasks.push(createTask('Code quality audit', 'high', 114, '11:00', 'todo', ['engineering']));
  tasks.push(createTask('Vendor negotiations', 'medium', 114, '15:00', 'todo', ['vendor']));
  tasks.push(createTask('Product demo day', 'high', 115, '10:00', 'todo', ['demo']));
  tasks.push(createTask('Sprint 12 demo', 'high', 115, '14:00', 'todo', ['agile']));
  tasks.push(createTask('Memorial Day prep', 'low', 116, '11:00', 'todo', ['team']));
  tasks.push(createTask('Documentation sprint', 'medium', 116, '14:00', 'todo', ['documentation']));

  // === MAY 26-31 ===
  tasks.push(createTask('Memorial Day (US)', 'low', 117, undefined, 'todo', ['holiday']));
  tasks.push(createTask('Engineering sync', 'high', 118, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer success call', 'medium', 118, '14:00', 'todo', ['client']));
  tasks.push(createTask('Infrastructure review', 'high', 119, '11:00', 'todo', ['devops']));
  tasks.push(createTask('Product metrics', 'medium', 119, '15:00', 'todo', ['analytics']));
  tasks.push(createTask('Sprint 13 planning', 'high', 120, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Marketing campaign', 'medium', 120, '14:00', 'todo', ['marketing']));
  tasks.push(createTask('May wrap-up meeting', 'high', 121, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Month-end reporting', 'urgent', 121, '14:00', 'todo', ['finance']));
  tasks.push(createTask('End of May celebration', 'low', 122, '16:00', 'todo', ['team']));
  tasks.push(createTask('June planning prep', 'high', 122, '10:00', 'todo', ['planning']));

  // === JUNE 1-5 ===
  tasks.push(createTask('June kickoff', 'high', 123, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Q2 midpoint review', 'urgent', 123, '14:00', 'todo', ['planning']));
  tasks.push(createTask('Engineering roadmap', 'high', 124, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales quarterly sync', 'medium', 124, '14:00', 'todo', ['sales']));
  tasks.push(createTask('Product feature sprint', 'high', 125, '11:00', 'todo', ['product']));
  tasks.push(createTask('DevOps automation', 'medium', 125, '15:00', 'todo', ['devops']));
  tasks.push(createTask('Customer interviews', 'medium', 126, '10:00', 'todo', ['client']));
  tasks.push(createTask('UX design review', 'high', 126, '14:00', 'todo', ['design']));
  tasks.push(createTask('Sprint 13 demo', 'high', 127, '11:00', 'todo', ['agile']));
  tasks.push(createTask('Friday team sync', 'low', 127, '16:00', 'todo', ['team']));

  // === JUNE 6-10 ===
  tasks.push(createTask('Board presentation', 'urgent', 128, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Security compliance', 'high', 128, '14:00', 'todo', ['security']));
  tasks.push(createTask('Marketing strategy', 'medium', 129, '10:00', 'todo', ['marketing']));
  tasks.push(createTask('Engineering deep dive', 'high', 129, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Partner integration', 'medium', 130, '11:00', 'todo', ['integration']));
  tasks.push(createTask('HR policy review', 'medium', 130, '15:00', 'todo', ['hr']));
  tasks.push(createTask('Sprint 14 kickoff', 'high', 131, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Legal document review', 'medium', 131, '14:00', 'todo', ['legal']));
  tasks.push(createTask('Release v3.3 prep', 'high', 132, '09:00', 'todo', ['release']));
  tasks.push(createTask('Team building event', 'low', 132, '15:00', 'todo', ['team']));

  // === JUNE 11-15 ===
  tasks.push(createTask('Product strategy', 'urgent', 133, '09:00', 'todo', ['product']));
  tasks.push(createTask('Database optimization', 'high', 133, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales training', 'medium', 134, '10:00', 'todo', ['sales']));
  tasks.push(createTask('UX testing session', 'medium', 134, '14:00', 'todo', ['design']));
  tasks.push(createTask('Compliance audit', 'high', 135, '11:00', 'todo', ['compliance']));
  tasks.push(createTask('Customer success sync', 'medium', 135, '15:00', 'todo', ['client']));
  tasks.push(createTask('Sprint 14 demo', 'high', 136, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Fathers Day prep', 'low', 136, '14:00', 'todo', ['team']));
  tasks.push(createTask('Fathers Day (US)', 'low', 137, undefined, 'todo', ['holiday']));
  tasks.push(createTask('Knowledge sharing', 'medium', 137, '10:00', 'todo', ['team']));

  // === JUNE 16-20 ===
  tasks.push(createTask('Executive planning', 'urgent', 138, '09:00', 'todo', ['meeting']));
  tasks.push(createTask('Infrastructure scaling', 'high', 138, '14:00', 'todo', ['devops']));
  tasks.push(createTask('Marketing analytics', 'medium', 139, '10:00', 'todo', ['analytics']));
  tasks.push(createTask('Engineering sync', 'high', 139, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Partner webinar', 'medium', 140, '11:00', 'todo', ['marketing']));
  tasks.push(createTask('Security review', 'high', 140, '15:00', 'todo', ['security']));
  tasks.push(createTask('Sprint 15 planning', 'high', 141, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Budget review', 'medium', 141, '14:00', 'todo', ['finance']));
  tasks.push(createTask('Customer feedback', 'medium', 142, '11:00', 'todo', ['client']));
  tasks.push(createTask('Team retrospective', 'low', 142, '15:00', 'todo', ['team']));

  // === JUNE 21-25 ===
  tasks.push(createTask('Summer kickoff event', 'low', 143, '12:00', 'todo', ['team']));
  tasks.push(createTask('Product roadmap sync', 'high', 143, '14:00', 'todo', ['product']));
  tasks.push(createTask('API performance', 'high', 144, '10:00', 'todo', ['engineering']));
  tasks.push(createTask('Sales pipeline', 'medium', 144, '14:00', 'todo', ['sales']));
  tasks.push(createTask('Design sprint', 'medium', 145, '11:00', 'todo', ['design']));
  tasks.push(createTask('Vendor review', 'medium', 145, '15:00', 'todo', ['vendor']));
  tasks.push(createTask('Sprint 15 demo', 'high', 146, '10:00', 'todo', ['agile']));
  tasks.push(createTask('Documentation update', 'low', 146, '14:00', 'todo', ['documentation']));
  tasks.push(createTask('H1 retrospective', 'urgent', 147, '09:00', 'todo', ['planning']));
  tasks.push(createTask('Team celebration', 'low', 147, '16:00', 'todo', ['team']));

  // === JUNE 26-30 ===
  tasks.push(createTask('Q2 wrap-up planning', 'urgent', 148, '09:00', 'todo', ['planning']));
  tasks.push(createTask('Engineering review', 'high', 148, '14:00', 'todo', ['engineering']));
  tasks.push(createTask('Customer success review', 'medium', 149, '10:00', 'todo', ['client']));
  tasks.push(createTask('Marketing wrap-up', 'medium', 149, '14:00', 'todo', ['marketing']));
  tasks.push(createTask('Security assessment', 'high', 150, '11:00', 'todo', ['security']));
  tasks.push(createTask('Product metrics', 'medium', 150, '15:00', 'todo', ['analytics']));
  tasks.push(createTask('Sprint 16 planning', 'high', 151, '10:00', 'todo', ['agile']));
  tasks.push(createTask('H2 roadmap prep', 'urgent', 151, '14:00', 'todo', ['product']));
  tasks.push(createTask('End of Q2 reporting', 'urgent', 152, '09:00', 'todo', ['finance']));
  tasks.push(createTask('June wrap-up', 'high', 152, '14:00', 'todo', ['meeting']));
  tasks.push(createTask('H1 celebration', 'low', 152, '17:00', 'todo', ['team']));

  return tasks;
}

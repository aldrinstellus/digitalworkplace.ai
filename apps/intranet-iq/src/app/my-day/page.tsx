'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Command,
  X,
  Mic,
  MicOff,
  Lightbulb,
  ThumbsUp,
  Eye,
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
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarConnected, setCalendarConnected] = useState(false);
  const quickAddRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Natural Language Command state
  const [commandInput, setCommandInput] = useState('');
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [highlightedPriorityTasks, setHighlightedPriorityTasks] = useState(false);

  // Voice input state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // AI-suggested tasks state
  interface AISuggestion {
    id: string;
    text: string;
    reason: string;
    icon: 'view' | 'trend' | 'reminder';
  }
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([
    {
      id: 'sug-1',
      text: 'Create summary of Project X documentation',
      reason: 'You viewed this 5 times this week',
      icon: 'view',
    },
    {
      id: 'sug-2',
      text: 'Schedule follow-up with Design team',
      reason: 'Last meeting was 2 weeks ago',
      icon: 'reminder',
    },
    {
      id: 'sug-3',
      text: 'Review Q1 Analytics Dashboard updates',
      reason: 'Trending topic in your department',
      icon: 'trend',
    },
  ]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Local toast notification state (inline implementation)
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    description?: string;
  } | null>(null);

  // Command suggestions
  const commandSuggestions = [
    { command: 'add task: Review Q3 report', description: 'Create a new task' },
    { command: 'remind me to call Sarah tomorrow', description: 'Set a reminder' },
    { command: "what's my top priority", description: 'Show priority tasks' },
    { command: 'move task to Friday', description: 'Reschedule a task' },
  ];

  // Show toast notification
  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, description?: string) => {
    setToastMessage({ type, title, description });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Parse and execute natural language command
  const parseCommand = useCallback((input: string) => {
    const trimmedInput = input.trim().toLowerCase();

    // Pattern: "add task: [description]" or "create task [description]"
    const addTaskMatch = input.match(/^(?:add task:?\s*|create task\s+)(.+)/i);
    if (addTaskMatch) {
      const taskTitle = addTaskMatch[1].trim();
      if (taskTitle) {
        return { type: 'add_task' as const, title: taskTitle };
      }
    }

    // Pattern: "remind me [description] [date]" or "remind me about [description] [date]"
    const remindMatch = input.match(/^remind me(?:\s+(?:to|about))?\s+(.+?)\s+(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i);
    if (remindMatch) {
      const description = remindMatch[1].trim();
      const dayRef = remindMatch[2].toLowerCase();
      return { type: 'remind' as const, title: description, day: dayRef };
    }

    // Simpler remind pattern without day: "remind me [description]"
    const simpleRemindMatch = input.match(/^remind me(?:\s+(?:to|about))?\s+(.+)/i);
    if (simpleRemindMatch && !remindMatch) {
      const description = simpleRemindMatch[1].trim();
      return { type: 'remind' as const, title: description, day: 'today' };
    }

    // Pattern: "what's my priority" or "top tasks" or "show priority"
    const priorityMatch = trimmedInput.match(/^(?:what'?s my|show|view)\s*(?:top|priority|priorities|important)/i) ||
                          trimmedInput.match(/^top\s*(?:tasks?|priority|priorities)/i);
    if (priorityMatch) {
      return { type: 'show_priority' as const };
    }

    return null;
  }, []);

  // Get date from day reference
  const getDateFromDayRef = useCallback((dayRef: string): string => {
    const today = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    if (dayRef === 'today') {
      return today.toISOString().split('T')[0];
    }

    if (dayRef === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    // Handle day names (monday, tuesday, etc.)
    const targetDayIndex = dayNames.indexOf(dayRef.toLowerCase());
    if (targetDayIndex !== -1) {
      const currentDayIndex = today.getDay();
      let daysUntilTarget = targetDayIndex - currentDayIndex;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7; // Move to next week
      }
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      return targetDate.toISOString().split('T')[0];
    }

    return today.toISOString().split('T')[0];
  }, []);

  // Execute the parsed command
  const executeCommand = useCallback(async (command: ReturnType<typeof parseCommand>) => {
    if (!command) {
      showToast('error', 'Command not recognized', 'Try "add task: [description]" or "what\'s my priority"');
      return;
    }

    if (command.type === 'add_task') {
      // Create task via API or optimistically
      try {
        const response = await fetch('/diq/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: command.title,
            priority: 'medium',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(prev => [data.task, ...prev]);
          showToast('success', 'Task created', `"${command.title}" has been added to your tasks`);
        } else {
          throw new Error('API error');
        }
      } catch {
        // Optimistic add for demo
        const newTask: Task = {
          id: Date.now().toString(),
          user_id: userId,
          title: command.title,
          status: 'todo',
          priority: 'medium',
          tags: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTasks(prev => [newTask, ...prev]);
        showToast('success', 'Task created', `"${command.title}" has been added to your tasks`);
      }
    } else if (command.type === 'remind') {
      const dueDate = getDateFromDayRef(command.day);

      try {
        const response = await fetch('/diq/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: command.title,
            priority: 'medium',
            dueDate,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(prev => [data.task, ...prev]);
          showToast('success', 'Reminder set', `"${command.title}" scheduled for ${command.day}`);
        } else {
          throw new Error('API error');
        }
      } catch {
        // Optimistic add for demo
        const newTask: Task = {
          id: Date.now().toString(),
          user_id: userId,
          title: command.title,
          status: 'todo',
          priority: 'medium',
          due_date: dueDate,
          tags: ['reminder'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTasks(prev => [newTask, ...prev]);
        showToast('success', 'Reminder set', `"${command.title}" scheduled for ${command.day}`);
      }
    } else if (command.type === 'show_priority') {
      // Highlight priority tasks
      setHighlightedPriorityTasks(true);
      setFilter('all'); // Reset filter to show all tasks

      // Find high priority tasks
      const priorityTasks = tasks.filter(t =>
        (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'done'
      );

      showToast('info', 'Priority tasks highlighted',
        priorityTasks.length > 0
          ? `You have ${priorityTasks.length} high priority task${priorityTasks.length > 1 ? 's' : ''}`
          : 'No high priority tasks found'
      );

      // Remove highlight after 5 seconds
      setTimeout(() => setHighlightedPriorityTasks(false), 5000);
    }
  }, [showToast, getDateFromDayRef, tasks]);

  // Handle command submission
  const handleCommandSubmit = useCallback(() => {
    if (!commandInput.trim()) return;

    const command = parseCommand(commandInput);
    executeCommand(command);
    setCommandInput('');
    setShowCommandSuggestions(false);
  }, [commandInput, parseCommand, executeCommand]);

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as Window & typeof globalThis & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
                                (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  // Voice input function using Web Speech API
  const startVoiceInput = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as Window & typeof globalThis & { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ||
                              (window as Window & typeof globalThis & { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('error', 'Voice input not supported', 'Your browser does not support speech recognition');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: Event & { results: { [index: number]: { [index: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setCommandInput(transcript);
      setIsRecording(false);
      showToast('success', 'Voice captured', `"${transcript}"`);
      // Focus the command input so user can review/edit
      commandInputRef.current?.focus();
    };

    recognition.onerror = (event: Event & { error: string }) => {
      setIsRecording(false);
      if (event.error === 'no-speech') {
        showToast('info', 'No speech detected', 'Please try again and speak clearly');
      } else if (event.error === 'not-allowed') {
        showToast('error', 'Microphone access denied', 'Please allow microphone access in your browser settings');
      } else {
        showToast('error', 'Voice input error', `Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch {
      setIsRecording(false);
      showToast('error', 'Voice input failed', 'Could not start voice recognition');
    }
  }, [showToast]);

  // Handle accepting an AI suggestion
  const acceptSuggestion = useCallback(async (suggestion: AISuggestion) => {
    // Create a task from the suggestion
    try {
      const response = await fetch('/diq/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: suggestion.text,
          priority: 'medium',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => [data.task, ...prev]);
        showToast('success', 'Task created from suggestion', `"${suggestion.text}" has been added`);
      } else {
        throw new Error('API error');
      }
    } catch {
      // Optimistic add for demo
      const newTask: Task = {
        id: Date.now().toString(),
        user_id: userId,
        title: suggestion.text,
        status: 'todo',
        priority: 'medium',
        tags: ['ai-suggested'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      showToast('success', 'Task created from suggestion', `"${suggestion.text}" has been added`);
    }

    // Remove the suggestion
    setDismissedSuggestions(prev => new Set([...prev, suggestion.id]));
  }, [showToast]);

  // Handle dismissing an AI suggestion
  const dismissSuggestion = useCallback((suggestionId: string) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
    showToast('info', 'Suggestion dismissed', 'We\'ll show you different suggestions next time');
  }, [showToast]);

  // Get visible AI suggestions (not dismissed)
  const visibleSuggestions = aiSuggestions.filter(s => !dismissedSuggestions.has(s.id));

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

          {/* AI-Suggested Tasks Section */}
          {visibleSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="bg-[#121218] rounded-xl p-4 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-white/90">Suggested for you</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">AI</span>
                  </h3>
                  <span className="text-[10px] text-white/40">Based on your activity</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {visibleSuggestions.map((suggestion) => (
                      <motion.div
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          suggestion.icon === 'view' ? 'bg-blue-500/20' :
                          suggestion.icon === 'trend' ? 'bg-purple-500/20' : 'bg-amber-500/20'
                        }`}>
                          {suggestion.icon === 'view' ? (
                            <Eye className={`w-4 h-4 ${suggestion.icon === 'view' ? 'text-blue-400' : ''}`} />
                          ) : suggestion.icon === 'trend' ? (
                            <Target className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate">
                            {suggestion.text}
                          </p>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            {suggestion.reason}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => acceptSuggestion(suggestion)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            Accept
                          </button>
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* Compact Information-Dense Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="grid grid-cols-12 gap-4">
              {/* Mini Month Calendar - Compact with Task Dots */}
              <div className="col-span-4 rounded-xl bg-[#0a0d12] border border-white/[0.06] overflow-hidden">
                {/* Month Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCalendarMonth(new Date())}
                    className="text-sm font-medium text-white/90 hover:text-emerald-400 transition-colors"
                  >
                    {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Compact Day Grid */}
                <div className="p-2">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-center text-[10px] font-medium text-white/30 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-0.5">
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
                      const isPast = dateStr < new Date().toISOString().split('T')[0];
                      const taskCount = dayTasks.length;
                      const hasUrgent = dayTasks.some(t => t.priority === 'urgent' || isOverdue(t));
                      const hasHigh = dayTasks.some(t => t.priority === 'high');

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setNewTaskDueDate(dateStr);
                            setShowQuickAdd(true);
                          }}
                          className={`aspect-square rounded-md flex flex-col items-center justify-center relative group transition-all ${
                            isToday
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : isPast
                              ? 'text-white/25 hover:bg-white/5'
                              : taskCount > 0
                              ? 'bg-white/[0.03] text-white/80 hover:bg-white/[0.08]'
                              : 'text-white/50 hover:bg-white/5'
                          }`}
                        >
                          <span className={`text-[11px] font-medium ${isToday ? 'font-semibold' : ''}`}>
                            {day}
                          </span>
                          {/* Task indicator dots */}
                          {taskCount > 0 && !isToday && (
                            <div className="flex gap-0.5 mt-0.5">
                              {hasUrgent && <span className="w-1 h-1 rounded-full bg-rose-400" />}
                              {hasHigh && !hasUrgent && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                              {!hasUrgent && !hasHigh && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                              {taskCount > 1 && <span className="w-1 h-1 rounded-full bg-white/30" />}
                              {taskCount > 2 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                            </div>
                          )}
                          {isToday && taskCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-white text-emerald-600 text-[8px] font-bold flex items-center justify-center">
                              {taskCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Legend - Compact */}
                <div className="px-3 py-2 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[9px] text-white/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Urgent
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-white/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> High
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-white/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Other
                    </span>
                  </div>
                </div>
              </div>

              {/* Week Timeline + Upcoming Tasks */}
              <div className="col-span-8 rounded-xl bg-[#0a0d12] border border-white/[0.06] overflow-hidden">
                {/* Week Strip Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white/90">This Week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!calendarConnected ? (
                      <button
                        onClick={() => setCalendarConnected(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Sync
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-white/40">Synced</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Week Days Strip */}
                <div className="grid grid-cols-7 border-b border-white/[0.06]">
                  {(() => {
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());

                    return Array.from({ length: 7 }, (_, i) => {
                      const date = new Date(startOfWeek);
                      date.setDate(startOfWeek.getDate() + i);
                      const dateStr = date.toISOString().split('T')[0];
                      const dayTasks = getTasksForDate(dateStr);
                      const isToday = dateStr === today.toISOString().split('T')[0];
                      const isPast = dateStr < today.toISOString().split('T')[0];
                      const taskCount = dayTasks.length;
                      const urgentCount = dayTasks.filter(t => t.priority === 'urgent' || isOverdue(t)).length;
                      const highCount = dayTasks.filter(t => t.priority === 'high').length;

                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setNewTaskDueDate(dateStr);
                            setShowQuickAdd(true);
                          }}
                          className={`py-2.5 px-1 flex flex-col items-center gap-1 transition-all border-r border-white/[0.04] last:border-r-0 ${
                            isToday
                              ? 'bg-emerald-500/10'
                              : isPast
                              ? 'opacity-50'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <span className="text-[10px] font-medium text-white/40 uppercase">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                            isToday
                              ? 'bg-emerald-500 text-white'
                              : 'text-white/70'
                          }`}>
                            {date.getDate()}
                          </span>
                          {/* Task count bar */}
                          <div className="flex gap-0.5 h-1.5">
                            {urgentCount > 0 && (
                              <div
                                className="rounded-full bg-rose-500"
                                style={{ width: `${Math.min(urgentCount * 4, 12)}px` }}
                              />
                            )}
                            {highCount > 0 && (
                              <div
                                className="rounded-full bg-amber-500"
                                style={{ width: `${Math.min(highCount * 4, 12)}px` }}
                              />
                            )}
                            {taskCount - urgentCount - highCount > 0 && (
                              <div
                                className="rounded-full bg-emerald-500/60"
                                style={{ width: `${Math.min((taskCount - urgentCount - highCount) * 4, 12)}px` }}
                              />
                            )}
                            {taskCount === 0 && !isPast && (
                              <div className="w-1 h-1 rounded-full bg-white/10" />
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Today's Tasks List - Compact */}
                <div className="p-3 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const todayTasks = getTasksForDate(todayStr);
                    const upcomingTasks = tasks
                      .filter(t => t.due_date && t.due_date > todayStr && t.status !== 'done')
                      .slice(0, 3);
                    const allDisplayTasks = [...todayTasks, ...upcomingTasks].slice(0, 5);

                    if (allDisplayTasks.length === 0) {
                      return (
                        <div className="flex items-center justify-center py-6 text-white/30 text-sm">
                          <span>No tasks scheduled</span>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1.5">
                        {allDisplayTasks.map((task, idx) => {
                          const isTaskToday = task.due_date === todayStr;
                          const priorityColor = task.priority === 'urgent' || isOverdue(task)
                            ? 'bg-rose-500'
                            : task.priority === 'high'
                            ? 'bg-amber-500'
                            : task.priority === 'medium'
                            ? 'bg-sky-500'
                            : 'bg-emerald-500';

                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group ${
                                isTaskToday
                                  ? 'bg-white/[0.04] hover:bg-white/[0.08]'
                                  : 'hover:bg-white/[0.04]'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpanded(task.id);
                              }}
                            >
                              {/* Priority indicator */}
                              <span className={`w-1.5 h-6 rounded-full ${priorityColor} shrink-0`} />

                              {/* Task info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium truncate ${
                                    task.status === 'done' ? 'text-white/40 line-through' : 'text-white/90'
                                  }`}>
                                    {task.title}
                                  </span>
                                  {!isTaskToday && task.due_date && (
                                    <span className="text-[10px] text-white/30 shrink-0">
                                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                                {task.due_time && (
                                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {task.due_time.slice(0, 5)}
                                  </span>
                                )}
                              </div>

                              {/* Quick complete button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
                                }}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                  task.status === 'done'
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-white/20 text-transparent hover:border-emerald-400 hover:text-emerald-400'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Quick Stats Footer */}
                <div className="px-4 py-2 border-t border-white/[0.06] flex items-center justify-between bg-[#080a0e]">
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-white/40">
                      <span className="text-white/70 font-medium">{stats?.dueToday || 0}</span> today
                    </span>
                    <span className="text-white/40">
                      <span className="text-rose-400 font-medium">{stats?.overdue || 0}</span> overdue
                    </span>
                    <span className="text-white/40">
                      <span className="text-emerald-400 font-medium">{stats?.done || 0}</span> done
                    </span>
                  </div>
                  <span className="text-[10px] text-white/30">
                    {tasks.filter(t => t.status !== 'done').length} pending
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Today's Meetings - Zoom & Calendar Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="rounded-xl bg-[#0a0d12] border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white/90">Today&apos;s Meetings</span>
                </div>
                <span className="text-xs text-white/40">Zoom • Google Calendar</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">Z</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/90">Sprint Planning Meeting</div>
                    <div className="text-xs text-white/50">10:00 AM - 11:00 AM • Zoom Meeting</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 text-xs font-bold">G</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/90">Design Review Meeting</div>
                    <div className="text-xs text-white/50">2:00 PM - 3:00 PM • Google Meet</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 text-xs font-bold">Z</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/90">1:1 with Manager Meeting</div>
                    <div className="text-xs text-white/50">4:00 PM - 4:30 PM • Zoom Meeting</div>
                  </div>
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

          {/* Natural Language Command Input with Voice */}
          <div className="mb-6 relative">
            <div className="relative flex items-center gap-2">
              {/* Microphone Button */}
              {speechSupported && (
                <button
                  onClick={startVoiceInput}
                  disabled={isRecording}
                  className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                    isRecording
                      ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30'
                      : 'bg-white/10 hover:bg-white/15 hover:shadow-lg hover:shadow-emerald-500/10'
                  }`}
                  title={isRecording ? 'Listening...' : 'Voice input'}
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
              )}

              {/* Command Input Field */}
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <input
                  ref={commandInputRef}
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onFocus={() => setShowCommandSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCommandSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommandSubmit();
                    } else if (e.key === 'Escape') {
                      setCommandInput('');
                      setShowCommandSuggestions(false);
                      commandInputRef.current?.blur();
                    }
                  }}
                  placeholder={isRecording ? 'Listening... speak now' : "Type or speak a command... e.g., 'add task: Review Q3 report'"}
                  className={`w-full pl-12 pr-24 py-3.5 bg-[#1c1c24] border rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all ${
                    isRecording ? 'border-red-500/50 ring-1 ring-red-500/30' : 'border-white/[0.12]'
                  }`}
                />
                {commandInput && (
                  <button
                    onClick={() => setCommandInput('')}
                    className="absolute right-16 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleCommandSubmit}
                  disabled={!commandInput.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors"
                >
                  Run
                </button>
              </div>
            </div>

            {/* Command Suggestions Dropdown */}
            <AnimatePresence>
              {showCommandSuggestions && !commandInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#1c1c24] border border-white/[0.12] rounded-xl overflow-hidden shadow-xl z-20"
                >
                  <div className="px-3 py-2 border-b border-white/[0.08]">
                    <span className="text-xs text-white/40 font-medium">Suggested commands</span>
                  </div>
                  {commandSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setCommandInput(suggestion.command);
                        setShowCommandSuggestions(false);
                        commandInputRef.current?.focus();
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Command className="w-4 h-4 text-emerald-400/70" />
                        <span className="text-sm text-white/90">{suggestion.command}</span>
                      </div>
                      <span className="text-xs text-white/40">{suggestion.description}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
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
            {/* Task Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
              {taskSearchQuery && (
                <button
                  onClick={() => setTaskSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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
                  {tasks
                    .filter(task => {
                      if (!taskSearchQuery.trim()) return true;
                      const query = taskSearchQuery.toLowerCase();
                      return (
                        task.title.toLowerCase().includes(query) ||
                        task.description?.toLowerCase().includes(query) ||
                        task.tags?.some(tag => tag.toLowerCase().includes(query))
                      );
                    })
                    .map((task, index) => {
                    const isPriorityHighlighted = highlightedPriorityTasks &&
                      (task.priority === 'urgent' || task.priority === 'high') &&
                      task.status !== 'done';

                    return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isPriorityHighlighted ? {
                        opacity: 1,
                        y: 0,
                        scale: [1, 1.01, 1],
                        transition: { scale: { duration: 0.5, repeat: 2 } }
                      } : { opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group p-4 rounded-xl transition-all ${
                        isPriorityHighlighted
                          ? 'bg-emerald-500/15 border-2 border-emerald-500/50 ring-2 ring-emerald-500/20'
                          : task.status === 'done'
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
                    );
                  })}
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
                    {tasksByStatus[status].map(task => {
                      const isPriorityHighlighted = highlightedPriorityTasks &&
                        (task.priority === 'urgent' || task.priority === 'high') &&
                        task.status !== 'done';

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            isPriorityHighlighted
                              ? 'bg-emerald-500/20 border-2 border-emerald-500/50 ring-2 ring-emerald-500/30'
                              : isOverdue(task)
                              ? 'bg-red-500/10 border border-red-500/20'
                              : 'bg-white/5 hover:bg-white/10'
                          }`}
                          animate={isPriorityHighlighted ? {
                            scale: [1, 1.02, 1],
                            transition: { duration: 0.5, repeat: 2 }
                          } : {}}
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
                      );
                    })}

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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50, x: 50 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm ${
              toastMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : toastMessage.type === 'error'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-blue-500/10 border-blue-500/30'
            }`}>
              <div className={`p-1.5 rounded-lg ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-500/20'
                  : toastMessage.type === 'error'
                  ? 'bg-red-500/20'
                  : 'bg-blue-500/20'
              }`}>
                <CheckCircle2 className={`w-4 h-4 ${
                  toastMessage.type === 'success'
                    ? 'text-emerald-400'
                    : toastMessage.type === 'error'
                    ? 'text-red-400'
                    : 'text-blue-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0 max-w-xs">
                <p className="text-sm font-medium text-white">{toastMessage.title}</p>
                {toastMessage.description && (
                  <p className="mt-0.5 text-xs text-white/60">{toastMessage.description}</p>
                )}
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

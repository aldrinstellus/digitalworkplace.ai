"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/SessionContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import LanguagesSettings from "@/components/admin/LanguagesSettings";
import { apiUrl } from "@/lib/utils";
import {
  Settings,
  Save,
  Bell,
  Shield,
  Database,
  Palette,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Key,
  Bot,
  Clock,
  Sparkles,
  Loader2,
  Link2,
  FileText,
  History,
  User,
  Lock,
  Users,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Globe,
  Camera,
  Eye,
  EyeOff,
  UserPlus,
  MoreHorizontal,
  Check,
  X,
  MessageSquare,
  Smartphone,
} from "lucide-react";

interface ChatbotSettings {
  // General
  chatbotName: string;
  welcomeMessage: string;
  welcomeMessageEs: string;
  welcomeMessageHt: string;
  defaultLanguage: "en" | "es" | "ht";

  // Behavior
  enableSentimentAnalysis: boolean;
  enableAutoEscalation: boolean;
  escalationThreshold: number;
  maxMessagesPerSession: number;
  sessionTimeout: number;

  // Appearance
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  showSources: boolean;
  showFeedback: boolean;

  // LLM
  primaryLLM: "openai" | "claude";
  backupLLM: "openai" | "claude" | "none";
  temperature: number;
  maxTokens: number;

  // Notifications
  enableEmailAlerts: boolean;
  alertEmail: string;
  alertOnEscalation: boolean;
  alertOnNegativeFeedback: boolean;

  // CRM Integration (ITN 3.1.2 - Optional)
  crmEnabled: boolean;
  crmProvider: "salesforce" | "dynamics" | "none";

  // SharePoint Integration (ITN 3.2.5 - Optional)
  sharePointEnabled: boolean;
  sharePointSite: "city-documents" | "public-records" | "hr-documents" | "none";

  // IVR Integration
  ivrEnabled: boolean;
  ivrProvider: "twilio" | "vonage" | "amazon-connect" | "none";

  // SMS Integration
  smsEnabled: boolean;
  smsProvider: "twilio" | "messagebird" | "vonage" | "none";

  // Social Media Integrations
  facebookEnabled: boolean;
  facebookPageId: string;
  whatsappEnabled: boolean;
  whatsappBusinessId: string;
  instagramEnabled: boolean;
  instagramAccountId: string;

  // Tyler Technologies Integrations (RFP Requirements)
  // Civic Services
  tylerPermittingEnabled: boolean;
  tylerPermittingEnv: "production" | "staging" | "none";
  tyler311Enabled: boolean;
  tyler311Env: "production" | "staging" | "none";
  tylerEAMEnabled: boolean;
  tylerEAMEnv: "production" | "staging" | "none";
  tylerParksRecEnabled: boolean;
  tylerParksRecEnv: "production" | "staging" | "none";
  // Financial/ERP
  tylerMunisEnabled: boolean;
  tylerMunisEnv: "production" | "staging" | "none";
  tylerPaymentsEnabled: boolean;
  tylerPaymentsEnv: "production" | "staging" | "none";
  tylerCashieringEnabled: boolean;
  tylerCashieringEnv: "production" | "staging" | "none";
  // Public Safety
  tylerPublicSafetyEnabled: boolean;
  tylerPublicSafetyEnv: "production" | "staging" | "none";
  // Citizen Engagement
  tylerMyCivicEnabled: boolean;
  tylerMyCivicEnv: "production" | "staging" | "none";
  tylerContentManagerEnabled: boolean;
  tylerContentManagerEnv: "production" | "staging" | "none";
  // Records & Data
  tylerRecordsEnabled: boolean;
  tylerRecordsEnv: "production" | "staging" | "none";
  tylerDataInsightsEnabled: boolean;
  tylerDataInsightsEnv: "production" | "staging" | "none";
}

interface SettingsHistoryLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  adminUser: string;
  adminEmail: string;
}

// Main settings tabs
type MainSettingsTab = 'profile' | 'team' | 'permissions' | 'integrations' | 'chatbot';

// Language config interface for syncing with LanguagesSettings
interface EnabledLanguage {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  isDefault: boolean;
}

// Demo team member data
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  avatar?: string;
  lastActive: string;
}

const initialTeamMembers: TeamMember[] = [
  { id: '1', name: 'Maria Rodriguez', email: 'mrodriguez@cityofdoral.com', role: 'admin', status: 'active', lastActive: 'Just now' },
  { id: '2', name: 'Carlos Martinez', email: 'cmartinez@cityofdoral.com', role: 'editor', status: 'active', lastActive: '2 hours ago' },
  { id: '3', name: 'Ana Garcia', email: 'agarcia@cityofdoral.com', role: 'viewer', status: 'active', lastActive: 'Yesterday' },
  { id: '4', name: 'Luis Hernandez', email: 'lhernandez@cityofdoral.com', role: 'editor', status: 'pending', lastActive: '-' },
  { id: '5', name: 'Sofia Perez', email: 'sperez@cityofdoral.com', role: 'viewer', status: 'active', lastActive: '3 days ago' },
];

// Demo permissions matrix structure
interface PermissionRow {
  resource: string;
  admin: string[];
  editor: string[];
  viewer: string[];
}

const initialPermissions: PermissionRow[] = [
  { resource: 'Dashboard', admin: ['read', 'create', 'update', 'delete'], editor: ['read'], viewer: ['read'] },
  { resource: 'Content', admin: ['read', 'create', 'update', 'delete'], editor: ['read', 'create', 'update'], viewer: ['read'] },
  { resource: 'Conversations', admin: ['read', 'create', 'update', 'delete'], editor: ['read', 'update'], viewer: ['read'] },
  { resource: 'Escalations', admin: ['read', 'create', 'update', 'delete'], editor: ['read', 'update'], viewer: ['read'] },
  { resource: 'Analytics', admin: ['read', 'create', 'update', 'delete'], editor: ['read'], viewer: ['read'] },
  { resource: 'Settings', admin: ['read', 'create', 'update', 'delete'], editor: ['read'], viewer: [] },
  { resource: 'Audit Logs', admin: ['read', 'create', 'update', 'delete'], editor: ['read'], viewer: [] },
];

const defaultSettings: ChatbotSettings = {
  chatbotName: "Chat Core IQ Assistant",
  welcomeMessage: "Hello! I'm the Chat Core IQ Assistant. How can I help you today?",
  welcomeMessageEs: "¡Hola! Soy el Asistente de Chat Core IQ. ¿Cómo puedo ayudarte hoy?",
  welcomeMessageHt: "Bonjou! Mwen se Asistan Chat Core IQ. Kijan mwen ka ede ou jodi a?",
  defaultLanguage: "en",
  enableSentimentAnalysis: true,
  enableAutoEscalation: true,
  escalationThreshold: 2,
  maxMessagesPerSession: 50,
  sessionTimeout: 30,
  primaryColor: "#000080",
  position: "bottom-right",
  showSources: true,
  showFeedback: true,
  primaryLLM: "openai",
  backupLLM: "claude",
  temperature: 0.7,
  maxTokens: 1024,
  enableEmailAlerts: false,
  alertEmail: "",
  alertOnEscalation: true,
  alertOnNegativeFeedback: true,
  crmEnabled: true,
  crmProvider: "salesforce",
  sharePointEnabled: true,
  sharePointSite: "city-documents",
  ivrEnabled: true,
  ivrProvider: "twilio",
  smsEnabled: true,
  smsProvider: "twilio",
  facebookEnabled: true,
  facebookPageId: "cityofdoral",
  whatsappEnabled: true,
  whatsappBusinessId: "cityofdoral-wa",
  instagramEnabled: true,
  instagramAccountId: "cityofdoral",
  // Tyler Technologies - All enabled by default per RFP requirements
  // Civic Services
  tylerPermittingEnabled: true,
  tylerPermittingEnv: "production",
  tyler311Enabled: true,
  tyler311Env: "production",
  tylerEAMEnabled: true,
  tylerEAMEnv: "production",
  tylerParksRecEnabled: true,
  tylerParksRecEnv: "production",
  // Financial/ERP
  tylerMunisEnabled: true,
  tylerMunisEnv: "production",
  tylerPaymentsEnabled: true,
  tylerPaymentsEnv: "production",
  tylerCashieringEnabled: true,
  tylerCashieringEnv: "production",
  // Public Safety
  tylerPublicSafetyEnabled: true,
  tylerPublicSafetyEnv: "production",
  // Citizen Engagement
  tylerMyCivicEnabled: true,
  tylerMyCivicEnv: "production",
  tylerContentManagerEnabled: true,
  tylerContentManagerEnv: "production",
  // Records & Data
  tylerRecordsEnabled: true,
  tylerRecordsEnv: "production",
  tylerDataInsightsEnabled: true,
  tylerDataInsightsEnv: "production",
};

export default function SettingsPage() {
  const { t } = useLanguage();
  const { userEmail, userName, isSessionActive } = useSession();

  // Compute user profile from session or fallback to defaults
  const userProfile = useMemo(() => {
    if (isSessionActive && (userEmail || userName)) {
      const nameParts = userName?.split(' ') || [];
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';
      const initials = `${firstName[0] || 'A'}${lastName[0] || 'U'}`.toUpperCase();
      return {
        firstName,
        lastName,
        fullName: userName || 'Admin User',
        email: userEmail || 'admin@example.com',
        initials,
        role: 'Administrator',
      };
    }
    // Fallback for direct access - use admin defaults
    // When accessed directly (not via main dashboard), show admin identity
    return {
      firstName: 'Aldrin',
      lastName: '',
      fullName: 'Aldrin',
      email: 'aldrin@atc.xyz',
      initials: 'A',
      role: 'Administrator',
    };
  }, [userEmail, userName, isSessionActive]);

  const [settings, setSettings] = useState<ChatbotSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<ChatbotSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<MainSettingsTab>("profile");
  const [activeSection, setActiveSection] = useState<string>("general");
  const [historyLogs, setHistoryLogs] = useState<SettingsHistoryLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { confirm, DialogComponent } = useConfirmDialog();

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  // Permissions management state
  const [permissions, setPermissions] = useState<PermissionRow[]>(initialPermissions);
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState('');
  const [newPermissionAdmin, setNewPermissionAdmin] = useState<string[]>(['read', 'create', 'update', 'delete']);
  const [newPermissionEditor, setNewPermissionEditor] = useState<string[]>(['read']);
  const [newPermissionViewer, setNewPermissionViewer] = useState<string[]>(['read']);

  // Language management state (synced with LanguagesSettings)
  const [enabledLanguages, setEnabledLanguages] = useState<EnabledLanguage[]>([]);
  const [welcomeMessages, setWelcomeMessages] = useState<Record<string, string>>({
    en: defaultSettings.welcomeMessage,
    es: defaultSettings.welcomeMessageEs,
    ht: defaultSettings.welcomeMessageHt,
  });

  // Fetch enabled languages from API
  const fetchEnabledLanguages = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/languages"));
      if (response.ok) {
        const data = await response.json();
        const languages = data.languages || [];
        setEnabledLanguages(languages.filter((l: EnabledLanguage) => l.enabled));

        // Initialize welcome messages for any new languages
        setWelcomeMessages(prev => {
          const newMessages = { ...prev };
          languages.forEach((lang: EnabledLanguage) => {
            if (lang.enabled && !newMessages[lang.code]) {
              newMessages[lang.code] = "";
            }
          });
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  }, []);

  // Fetch languages on mount and when profile or chatbot tab is active
  useEffect(() => {
    if (activeMainTab === "chatbot" || activeMainTab === "profile") {
      fetchEnabledLanguages();
    }
  }, [activeMainTab, fetchEnabledLanguages]);

  // Main settings tabs configuration
  const mainTabs = [
    { id: 'profile' as MainSettingsTab, label: 'Profile', icon: User },
    { id: 'team' as MainSettingsTab, label: 'Team', icon: Users },
    { id: 'permissions' as MainSettingsTab, label: 'Permissions', icon: ShieldCheck },
    { id: 'integrations' as MainSettingsTab, label: 'Integrations', icon: Link2 },
    { id: 'chatbot' as MainSettingsTab, label: 'Chatbot', icon: Bot },
  ];

  // Fetch settings history
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(apiUrl("/api/audit-logs?resource=settings&days=30"));
      if (response.ok) {
        const data = await response.json();
        setHistoryLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch settings history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Fetch history when switching to history section
  useEffect(() => {
    if (activeSection === "history") {
      fetchHistory();
    }
  }, [activeSection, fetchHistory]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // Warn before browser navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(apiUrl("/api/settings"));
      if (response.ok) {
        const data = await response.json();
        // Map API settings to component settings - ALL fields
        const loadedSettings: ChatbotSettings = {
          // General
          chatbotName: data.general?.botName || defaultSettings.chatbotName,
          welcomeMessage: data.general?.welcomeMessage || defaultSettings.welcomeMessage,
          welcomeMessageEs: data.general?.welcomeMessageEs || defaultSettings.welcomeMessageEs,
          welcomeMessageHt: data.general?.welcomeMessageHt || defaultSettings.welcomeMessageHt,
          defaultLanguage: data.general?.defaultLanguage || defaultSettings.defaultLanguage,

          // Behavior (chatbot section in API)
          enableSentimentAnalysis: data.chatbot?.enableSentimentAnalysis ?? defaultSettings.enableSentimentAnalysis,
          enableAutoEscalation: data.chatbot?.autoEscalateNegative ?? defaultSettings.enableAutoEscalation,
          escalationThreshold: data.chatbot?.escalationThreshold ?? defaultSettings.escalationThreshold,
          maxMessagesPerSession: data.chatbot?.maxMessagesPerSession ?? defaultSettings.maxMessagesPerSession,
          sessionTimeout: data.chatbot?.sessionTimeout ?? defaultSettings.sessionTimeout,

          // Appearance
          primaryColor: data.appearance?.primaryColor || defaultSettings.primaryColor,
          position: data.appearance?.position || defaultSettings.position,
          showSources: data.appearance?.showSources ?? defaultSettings.showSources,
          showFeedback: data.appearance?.showFeedback ?? defaultSettings.showFeedback,

          // LLM
          primaryLLM: data.llm?.primaryLLM === 'gpt-4o-mini' || data.llm?.primaryLLM === 'gpt-4o' ? 'openai' :
                     (data.llm?.primaryLLM?.startsWith('claude') ? 'claude' : defaultSettings.primaryLLM),
          backupLLM: data.llm?.backupLLM === 'gpt-4o-mini' || data.llm?.backupLLM === 'gpt-4o' ? 'openai' :
                    (data.llm?.backupLLM === 'none' ? 'none' :
                     (data.llm?.backupLLM?.startsWith('claude') ? 'claude' : defaultSettings.backupLLM)),
          temperature: data.llm?.temperature ?? defaultSettings.temperature,
          maxTokens: data.llm?.maxTokens ?? defaultSettings.maxTokens,

          // Notifications
          enableEmailAlerts: data.notifications?.emailAlerts ?? defaultSettings.enableEmailAlerts,
          alertEmail: data.notifications?.escalationEmail || defaultSettings.alertEmail,
          alertOnEscalation: data.notifications?.alertOnEscalation ?? defaultSettings.alertOnEscalation,
          alertOnNegativeFeedback: data.notifications?.alertOnNegativeFeedback ?? defaultSettings.alertOnNegativeFeedback,

          // Integrations
          crmEnabled: data.integrations?.crmEnabled ?? defaultSettings.crmEnabled,
          crmProvider: data.integrations?.crmProvider || defaultSettings.crmProvider,
          sharePointEnabled: data.integrations?.sharePointEnabled ?? defaultSettings.sharePointEnabled,
          sharePointSite: data.integrations?.sharePointSite || defaultSettings.sharePointSite,
          ivrEnabled: data.integrations?.ivrEnabled ?? defaultSettings.ivrEnabled,
          ivrProvider: data.integrations?.ivrProvider || defaultSettings.ivrProvider,
          smsEnabled: data.integrations?.smsEnabled ?? defaultSettings.smsEnabled,
          smsProvider: data.integrations?.smsProvider || defaultSettings.smsProvider,
          facebookEnabled: data.integrations?.facebookEnabled ?? defaultSettings.facebookEnabled,
          facebookPageId: data.integrations?.facebookPageId || defaultSettings.facebookPageId,
          whatsappEnabled: data.integrations?.whatsappEnabled ?? defaultSettings.whatsappEnabled,
          whatsappBusinessId: data.integrations?.whatsappBusinessId || defaultSettings.whatsappBusinessId,
          instagramEnabled: data.integrations?.instagramEnabled ?? defaultSettings.instagramEnabled,
          instagramAccountId: data.integrations?.instagramAccountId || defaultSettings.instagramAccountId,
          // Tyler Technologies - Civic Services
          tylerPermittingEnabled: data.integrations?.tylerPermittingEnabled ?? defaultSettings.tylerPermittingEnabled,
          tylerPermittingEnv: data.integrations?.tylerPermittingEnv || defaultSettings.tylerPermittingEnv,
          tyler311Enabled: data.integrations?.tyler311Enabled ?? defaultSettings.tyler311Enabled,
          tyler311Env: data.integrations?.tyler311Env || defaultSettings.tyler311Env,
          tylerEAMEnabled: data.integrations?.tylerEAMEnabled ?? defaultSettings.tylerEAMEnabled,
          tylerEAMEnv: data.integrations?.tylerEAMEnv || defaultSettings.tylerEAMEnv,
          tylerParksRecEnabled: data.integrations?.tylerParksRecEnabled ?? defaultSettings.tylerParksRecEnabled,
          tylerParksRecEnv: data.integrations?.tylerParksRecEnv || defaultSettings.tylerParksRecEnv,
          // Tyler Technologies - Financial/ERP
          tylerMunisEnabled: data.integrations?.tylerMunisEnabled ?? defaultSettings.tylerMunisEnabled,
          tylerMunisEnv: data.integrations?.tylerMunisEnv || defaultSettings.tylerMunisEnv,
          tylerPaymentsEnabled: data.integrations?.tylerPaymentsEnabled ?? defaultSettings.tylerPaymentsEnabled,
          tylerPaymentsEnv: data.integrations?.tylerPaymentsEnv || defaultSettings.tylerPaymentsEnv,
          tylerCashieringEnabled: data.integrations?.tylerCashieringEnabled ?? defaultSettings.tylerCashieringEnabled,
          tylerCashieringEnv: data.integrations?.tylerCashieringEnv || defaultSettings.tylerCashieringEnv,
          // Tyler Technologies - Public Safety
          tylerPublicSafetyEnabled: data.integrations?.tylerPublicSafetyEnabled ?? defaultSettings.tylerPublicSafetyEnabled,
          tylerPublicSafetyEnv: data.integrations?.tylerPublicSafetyEnv || defaultSettings.tylerPublicSafetyEnv,
          // Tyler Technologies - Citizen Engagement
          tylerMyCivicEnabled: data.integrations?.tylerMyCivicEnabled ?? defaultSettings.tylerMyCivicEnabled,
          tylerMyCivicEnv: data.integrations?.tylerMyCivicEnv || defaultSettings.tylerMyCivicEnv,
          tylerContentManagerEnabled: data.integrations?.tylerContentManagerEnabled ?? defaultSettings.tylerContentManagerEnabled,
          tylerContentManagerEnv: data.integrations?.tylerContentManagerEnv || defaultSettings.tylerContentManagerEnv,
          // Tyler Technologies - Records & Data
          tylerRecordsEnabled: data.integrations?.tylerRecordsEnabled ?? defaultSettings.tylerRecordsEnabled,
          tylerRecordsEnv: data.integrations?.tylerRecordsEnv || defaultSettings.tylerRecordsEnv,
          tylerDataInsightsEnabled: data.integrations?.tylerDataInsightsEnabled ?? defaultSettings.tylerDataInsightsEnabled,
          tylerDataInsightsEnv: data.integrations?.tylerDataInsightsEnv || defaultSettings.tylerDataInsightsEnv,
        };
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map UI LLM selections to API model names
      const primaryLLMModel = settings.primaryLLM === 'claude' ? 'claude-3-haiku' : 'gpt-4o-mini';
      const backupLLMModel = settings.backupLLM === 'claude' ? 'claude-3-haiku' :
                            (settings.backupLLM === 'openai' ? 'gpt-4o-mini' : 'none');

      const response = await fetch(apiUrl("/api/settings"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          general: {
            botName: settings.chatbotName,
            welcomeMessage: settings.welcomeMessage,
            welcomeMessageEs: settings.welcomeMessageEs,
            defaultLanguage: settings.defaultLanguage,
            enableBilingual: true,
          },
          chatbot: {
            maxMessagesPerSession: settings.maxMessagesPerSession,
            sessionTimeout: settings.sessionTimeout,
            enableSentimentAnalysis: settings.enableSentimentAnalysis,
            autoEscalateNegative: settings.enableAutoEscalation,
            escalationThreshold: settings.escalationThreshold,
            responseDelay: 500,
          },
          appearance: {
            primaryColor: settings.primaryColor,
            position: settings.position,
            showSources: settings.showSources,
            showFeedback: settings.showFeedback,
          },
          llm: {
            primaryLLM: primaryLLMModel,
            backupLLM: backupLLMModel,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
          },
          notifications: {
            emailAlerts: settings.enableEmailAlerts,
            escalationEmail: settings.alertEmail,
            dailyDigest: true,
            alertOnEscalation: settings.alertOnEscalation,
            alertOnNegativeFeedback: settings.alertOnNegativeFeedback,
          },
          integrations: {
            crmEnabled: settings.crmEnabled,
            crmProvider: settings.crmProvider,
            sharePointEnabled: settings.sharePointEnabled,
            sharePointSite: settings.sharePointSite,
            ivrEnabled: settings.ivrEnabled,
            ivrProvider: settings.ivrProvider,
            smsEnabled: settings.smsEnabled,
            smsProvider: settings.smsProvider,
            facebookEnabled: settings.facebookEnabled,
            facebookPageId: settings.facebookPageId,
            whatsappEnabled: settings.whatsappEnabled,
            whatsappBusinessId: settings.whatsappBusinessId,
            instagramEnabled: settings.instagramEnabled,
            instagramAccountId: settings.instagramAccountId,
            // Tyler Technologies - Civic Services
            tylerPermittingEnabled: settings.tylerPermittingEnabled,
            tylerPermittingEnv: settings.tylerPermittingEnv,
            tyler311Enabled: settings.tyler311Enabled,
            tyler311Env: settings.tyler311Env,
            tylerEAMEnabled: settings.tylerEAMEnabled,
            tylerEAMEnv: settings.tylerEAMEnv,
            tylerParksRecEnabled: settings.tylerParksRecEnabled,
            tylerParksRecEnv: settings.tylerParksRecEnv,
            // Tyler Technologies - Financial/ERP
            tylerMunisEnabled: settings.tylerMunisEnabled,
            tylerMunisEnv: settings.tylerMunisEnv,
            tylerPaymentsEnabled: settings.tylerPaymentsEnabled,
            tylerPaymentsEnv: settings.tylerPaymentsEnv,
            tylerCashieringEnabled: settings.tylerCashieringEnabled,
            tylerCashieringEnv: settings.tylerCashieringEnv,
            // Tyler Technologies - Public Safety
            tylerPublicSafetyEnabled: settings.tylerPublicSafetyEnabled,
            tylerPublicSafetyEnv: settings.tylerPublicSafetyEnv,
            // Tyler Technologies - Citizen Engagement
            tylerMyCivicEnabled: settings.tylerMyCivicEnabled,
            tylerMyCivicEnv: settings.tylerMyCivicEnv,
            tylerContentManagerEnabled: settings.tylerContentManagerEnabled,
            tylerContentManagerEnv: settings.tylerContentManagerEnv,
            // Tyler Technologies - Records & Data
            tylerRecordsEnabled: settings.tylerRecordsEnabled,
            tylerRecordsEnv: settings.tylerRecordsEnv,
            tylerDataInsightsEnabled: settings.tylerDataInsightsEnabled,
            tylerDataInsightsEnv: settings.tylerDataInsightsEnv,
          },
        }),
      });
      if (response.ok) {
        setSaved(true);
        setOriginalSettings(settings); // Reset original to mark as saved
        setTimeout(() => setSaved(false), 3000);
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("An error occurred while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    confirm({
      title: "Reset Settings",
      description: "Reset all settings to their default values? This action cannot be undone.",
      confirmLabel: "Reset",
      variant: "warning",
      onConfirm: async () => {
        try {
          const response = await fetch(apiUrl("/api/settings"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset" }),
          });
          if (response.ok) {
            setSettings(defaultSettings);
            setOriginalSettings(defaultSettings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            toast.success("Settings reset to defaults");
          } else {
            toast.error("Failed to reset settings");
          }
        } catch (error) {
          console.error("Failed to reset settings:", error);
          toast.error("An error occurred while resetting settings");
        }
      },
    });
  };

  // Team management functions
  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!inviteEmail.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      lastActive: '-',
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('viewer');
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  const handleUpdateMemberRole = (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    setTeamMembers(teamMembers.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    ));
    setShowEditModal(false);
    setEditingMember(null);
    toast.success("Role updated successfully");
  };

  const handleRemoveMember = (member: TeamMember) => {
    confirm({
      title: "Remove Team Member",
      description: `Are you sure you want to remove ${member.name} from the team? This action cannot be undone.`,
      confirmLabel: "Remove",
      variant: "danger",
      onConfirm: () => {
        setTeamMembers(teamMembers.filter(m => m.id !== member.id));
        toast.success(`${member.name} has been removed`);
      },
    });
  };

  // Permissions management functions
  const togglePermission = (resourceIndex: number, role: 'admin' | 'editor' | 'viewer', action: string) => {
    setPermissions(permissions.map((row, idx) => {
      if (idx !== resourceIndex) return row;
      const currentPerms = [...row[role]];
      const actionIndex = currentPerms.indexOf(action);
      if (actionIndex > -1) {
        currentPerms.splice(actionIndex, 1);
      } else {
        currentPerms.push(action);
      }
      return { ...row, [role]: currentPerms };
    }));
    toast.success("Permission updated");
  };

  const handleAddPermission = () => {
    if (!newPermissionName.trim()) {
      toast.error("Please enter a resource name");
      return;
    }
    if (permissions.some(p => p.resource.toLowerCase() === newPermissionName.trim().toLowerCase())) {
      toast.error("A resource with this name already exists");
      return;
    }
    const newPermission: PermissionRow = {
      resource: newPermissionName.trim(),
      admin: [...newPermissionAdmin],
      editor: [...newPermissionEditor],
      viewer: [...newPermissionViewer],
    };
    setPermissions([...permissions, newPermission]);
    setShowAddPermissionModal(false);
    setNewPermissionName('');
    setNewPermissionAdmin(['read', 'create', 'update', 'delete']);
    setNewPermissionEditor(['read']);
    setNewPermissionViewer(['read']);
    toast.success(`Permission "${newPermissionName.trim()}" created`);
  };

  const handleDeletePermission = (resource: string) => {
    confirm({
      title: "Delete Permission",
      description: `Are you sure you want to delete the "${resource}" permission? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => {
        setPermissions(permissions.filter(p => p.resource !== resource));
        toast.success(`Permission "${resource}" deleted`);
      },
    });
  };

  const toggleNewPermission = (role: 'admin' | 'editor' | 'viewer', action: string) => {
    const setter = role === 'admin' ? setNewPermissionAdmin : role === 'editor' ? setNewPermissionEditor : setNewPermissionViewer;
    const current = role === 'admin' ? newPermissionAdmin : role === 'editor' ? newPermissionEditor : newPermissionViewer;
    if (current.includes(action)) {
      setter(current.filter(a => a !== action));
    } else {
      setter([...current, action]);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#000080] mx-auto mb-4" />
          <p className="text-[#666666]">{t("settings.loading")}</p>
        </div>
      </div>
    );
  }

  // Chatbot sub-sections (integrations moved to top-level tab)
  const chatbotSections = [
    { id: "general", label: "General", icon: Settings, gradient: "from-blue-500" },
    { id: "behavior", label: "Behavior", icon: Bot, gradient: "from-purple-500" },
    { id: "appearance", label: "Appearance", icon: Palette, gradient: "from-pink-500" },
    { id: "llm", label: "LLM Settings", icon: Database, gradient: "from-orange-500" },
    { id: "notifications", label: "Notifications", icon: Bell, gradient: "from-amber-500" },
    { id: "security", label: "Security", icon: Shield, gradient: "from-green-500" },
    { id: "languages", label: "Languages", icon: Globe, gradient: "from-teal-500" },
    { id: "history", label: "History", icon: History, gradient: "from-gray-500" },
  ];

  const inputClass = "w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200";
  const labelClass = "block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide";
  const textareaClass = "w-full px-4 py-3 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200 min-h-[100px] resize-none";

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {DialogComponent}
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">{t("settings.title")}</h1>
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="h-6 w-6 text-[#1D4F91]" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">
            {activeMainTab === 'profile' && t("settings.profileSubtitle")}
            {activeMainTab === 'team' && t("settings.teamSubtitle")}
            {activeMainTab === 'permissions' && t("settings.permissionsSubtitle")}
            {activeMainTab === 'integrations' && t("settings.integrationsSubtitle")}
            {activeMainTab === 'chatbot' && t("settings.chatbotSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-[#000080]/30 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.reset")}
          </motion.button>
          {hasUnsavedChanges && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-amber-700 text-sm font-medium flex items-center gap-1.5"
            >
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              {t("settings.unsavedChanges")}
            </motion.span>
          )}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className={`h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 ${
              hasUnsavedChanges ? "ring-2 ring-amber-400 ring-offset-2" : ""
            }`}
          >
            {saving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            ) : saved ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <CheckCircle2 className="h-4 w-4" />
              </motion.div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? t("common.saved") : t("common.saveChanges")}
          </motion.button>
        </div>
      </motion.div>

      {/* Main Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2">
          {mainTabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeMainTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.03 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveMainTab(tab.id)}
                className={`relative h-10 px-5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "text-white"
                    : "bg-white text-[#363535] hover:bg-gray-50 border border-[#E7EBF0]"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMainTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#000080] to-[#1D4F91] rounded-xl shadow-lg shadow-[#000080]/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Profile Tab */}
        {activeMainTab === 'profile' && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
          >
            <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              Profile Settings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center p-6 bg-gradient-to-br from-[#F5F9FD] to-blue-50/50 rounded-xl border border-[#E7EBF0]">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {userProfile.initials}
                </div>
                <h3 className="font-semibold text-[#000034]">{userProfile.fullName}</h3>
                <p className="text-sm text-[#666666]">{userProfile.role}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 px-4 py-2 bg-white border border-[#E7EBF0] rounded-lg text-sm font-medium text-[#363535] hover:border-[#000080]/30 transition-colors flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Change Photo
                </motion.button>
              </div>

              {/* Profile Form */}
              <div className="lg:col-span-2 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input type="text" defaultValue={userProfile.firstName} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input type="text" defaultValue={userProfile.lastName} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                    <input type="email" defaultValue={userProfile.email} className={`${inputClass} pl-10`} readOnly={isSessionActive} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                    <input type="tel" defaultValue="(305) 593-6725" className={`${inputClass} pl-10`} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Department</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                      <select defaultValue="it" className={`${inputClass} pl-10 cursor-pointer`}>
                        <option value="it">Information Technology</option>
                        <option value="admin">Administration</option>
                        <option value="comm">Communications</option>
                        <option value="public-works">Public Works</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Timezone</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                      <select defaultValue="est" className={`${inputClass} pl-10 cursor-pointer`}>
                        <option value="est">Eastern Time (ET)</option>
                        <option value="cst">Central Time (CT)</option>
                        <option value="mst">Mountain Time (MT)</option>
                        <option value="pst">Pacific Time (PT)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Preferred Language</label>
                  <select defaultValue="en" className={`${inputClass} cursor-pointer`}>
                    {enabledLanguages.length > 0 ? (
                      enabledLanguages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="ht">Haitian Creole</option>
                      </>
                    )}
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast.success("Profile updated successfully")}
                  className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </motion.button>
              </div>
            </div>

            {/* Password & Security Section */}
            <div className="mt-8 pt-8 border-t border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                Password & Security
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Password Change */}
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter current password" className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#666666]">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Enter new password" className={`${inputClass} pr-10`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#666666]">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <div className="h-1 flex-1 bg-green-500 rounded" />
                      <div className="h-1 flex-1 bg-green-500 rounded" />
                      <div className="h-1 flex-1 bg-green-500 rounded" />
                      <div className="h-1 flex-1 bg-gray-200 rounded" />
                    </div>
                    <p className="text-xs text-[#666666] mt-1">Password strength: Good</p>
                  </div>

                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input type={showPassword ? "text" : "password"} placeholder="Confirm new password" className={inputClass} />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toast.success("Password updated successfully")}
                    className="h-11 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-green-600/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Update Password
                  </motion.button>
                </div>

                {/* Security Settings */}
                <div className="space-y-4">
                  <AnimatedToggleCard
                    label="Two-Factor Authentication"
                    description="Add an extra layer of security to your account"
                    checked={true}
                    onChange={() => toast.info("2FA settings would be configured here")}
                  />

                  <div>
                    <label className={labelClass}>Session Timeout</label>
                    <select defaultValue="30" className={`${inputClass} cursor-pointer`}>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-[#F5F9FD] to-blue-50/50 rounded-xl border border-[#E7EBF0]">
                    <p className="text-sm text-[#666666]">
                      <span className="font-medium text-[#000034]">Last password change:</span> December 15, 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Team Tab */}
        {activeMainTab === 'team' && (
          <motion.div
            key="team-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white via-white to-purple-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#000034] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Team Members
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowInviteModal(true)}
                className="h-10 px-4 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </motion.button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E7EBF0]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Member</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Last Active</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member, idx) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-[#E7EBF0] hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center text-white text-sm font-medium">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-[#000034]">{member.name}</p>
                            <p className="text-sm text-[#666666]">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.role === 'admin' ? 'bg-[#000080] text-white' :
                          member.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#666666]">{member.lastActive}</td>
                      <td className="py-4 px-4 text-right relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === member.id ? null : member.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-[#666666]" />
                        </button>
                        {/* Action Dropdown Menu */}
                        <AnimatePresence>
                          {actionMenuOpen === member.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              className="absolute right-4 top-12 w-40 bg-white rounded-xl shadow-lg border border-[#E7EBF0] py-1 z-10"
                            >
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setShowEditModal(true);
                                  setActionMenuOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[#363535] hover:bg-gray-50 flex items-center gap-2"
                              >
                                <User className="h-4 w-4" />
                                Edit Role
                              </button>
                              <button
                                onClick={() => {
                                  setActionMenuOpen(null);
                                  handleRemoveMember(member);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <X className="h-4 w-4" />
                                Remove
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {teamMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-[#666666]">No team members yet</p>
                <p className="text-sm text-gray-500">Click &quot;Invite Member&quot; to add someone</p>
              </div>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                >
                  <h3 className="text-lg font-semibold text-[#000034] mb-4">Invite Team Member</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@cityofdoral.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Role</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => { setShowInviteModal(false); setInviteEmail(''); setInviteRole('viewer'); }} className="px-4 py-2 text-sm font-medium text-[#666666] hover:bg-gray-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleInviteMember} className="px-4 py-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg">
                      Send Invite
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Edit Role Modal */}
            {showEditModal && editingMember && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowEditModal(false); setEditingMember(null); }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                >
                  <h3 className="text-lg font-semibold text-[#000034] mb-4">Edit Role</h3>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center text-white text-sm font-medium">
                      {editingMember.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-[#000034]">{editingMember.name}</p>
                      <p className="text-sm text-[#666666]">{editingMember.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Select New Role</label>
                    <div className="space-y-2">
                      {(['admin', 'editor', 'viewer'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => handleUpdateMemberRole(editingMember.id, role)}
                          className={`w-full p-3 rounded-lg text-left border transition-all ${
                            editingMember.role === role
                              ? 'border-[#000080] bg-blue-50'
                              : 'border-[#E7EBF0] hover:border-[#000080]/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-[#000034]">{role.charAt(0).toUpperCase() + role.slice(1)}</p>
                              <p className="text-xs text-[#666666]">
                                {role === 'admin' && 'Full access to all features'}
                                {role === 'editor' && 'Can manage content and conversations'}
                                {role === 'viewer' && 'Read-only access'}
                              </p>
                            </div>
                            {editingMember.role === role && <Check className="h-5 w-5 text-[#000080]" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button onClick={() => { setShowEditModal(false); setEditingMember(null); }} className="px-4 py-2 text-sm font-medium text-[#666666] hover:bg-gray-100 rounded-lg transition-colors">
                      Close
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Permissions Tab */}
        {activeMainTab === 'permissions' && (
          <motion.div
            key="permissions-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white via-white to-amber-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#000034] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                Role Permissions
              </h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddPermissionModal(true)}
                className="h-10 px-4 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Add Permission
              </motion.button>
            </div>

            {/* Role Cards - Dynamic counts from team members */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { role: 'admin' as const, label: 'Admin', desc: 'Full access to all features', color: 'from-[#000080] to-[#1D4F91]' },
                { role: 'editor' as const, label: 'Editor', desc: 'Can manage content and conversations', color: 'from-blue-500 to-blue-600' },
                { role: 'viewer' as const, label: 'Viewer', desc: 'Read-only access', color: 'from-gray-400 to-gray-500' },
              ].map((item, idx) => {
                const count = teamMembers.filter(m => m.role === item.role).length;
                return (
                  <motion.div
                    key={item.role}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-white rounded-xl border border-[#E7EBF0] hover:shadow-md transition-shadow"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-[#000034]">{item.label}</h3>
                    <p className="text-sm text-[#666666] mt-1">{item.desc}</p>
                    <p className="text-xs text-[#6b6b6b] mt-2">{count} member{count !== 1 ? 's' : ''}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 mb-6">
              <div className="flex items-center gap-2 text-amber-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Click on any permission to toggle it (Demo Mode)</span>
              </div>
            </div>

            {/* Permissions Matrix - Interactive */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E7EBF0]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Resource</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#000080]"></span>
                        Admin
                      </span>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Editor
                      </span>
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Viewer
                      </span>
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-[#666666] uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((row, idx) => (
                    <motion.tr
                      key={row.resource}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-[#E7EBF0] hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-[#000034]">{row.resource}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1">
                          {['read', 'create', 'update', 'delete'].map(action => (
                            <button
                              key={action}
                              onClick={() => togglePermission(idx, 'admin', action)}
                              title={`${action.charAt(0).toUpperCase() + action.slice(1)} - Click to toggle`}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all hover:scale-110 cursor-pointer ${
                                row.admin.includes(action) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {row.admin.includes(action) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1">
                          {['read', 'create', 'update', 'delete'].map(action => (
                            <button
                              key={action}
                              onClick={() => togglePermission(idx, 'editor', action)}
                              title={`${action.charAt(0).toUpperCase() + action.slice(1)} - Click to toggle`}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all hover:scale-110 cursor-pointer ${
                                row.editor.includes(action) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {row.editor.includes(action) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-1">
                          {['read', 'create', 'update', 'delete'].map(action => (
                            <button
                              key={action}
                              onClick={() => togglePermission(idx, 'viewer', action)}
                              title={`${action.charAt(0).toUpperCase() + action.slice(1)} - Click to toggle`}
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all hover:scale-110 cursor-pointer ${
                                row.viewer.includes(action) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {row.viewer.includes(action) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePermission(row.resource)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete permission"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-[#6b6b6b]">Legend: R=Read, C=Create, U=Update, D=Delete</p>
              <button
                onClick={() => {
                  setPermissions(initialPermissions);
                  toast.success("Permissions reset to defaults");
                }}
                className="text-xs text-[#000080] hover:underline"
              >
                Reset to defaults
              </button>
            </div>

            {/* Add Permission Modal */}
            {showAddPermissionModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddPermissionModal(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl"
                >
                  <h3 className="text-lg font-semibold text-[#000034] mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-700" />
                    Add New Permission
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Resource Name</label>
                      <input
                        type="text"
                        value={newPermissionName}
                        onChange={(e) => setNewPermissionName(e.target.value)}
                        placeholder="e.g., Reports, Notifications, Billing"
                        className={inputClass}
                      />
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                      <p className="text-xs font-medium text-[#666666] uppercase tracking-wide">Set Permissions by Role</p>

                      {/* Admin Permissions */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-[#000080]"></span>
                          <span className="text-sm font-medium text-[#000034]">Admin</span>
                        </div>
                        <div className="flex gap-2">
                          {['read', 'create', 'update', 'delete'].map(action => (
                            <button
                              key={action}
                              onClick={() => toggleNewPermission('admin', action)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                newPermissionAdmin.includes(action)
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}
                            >
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Editor Permissions */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-sm font-medium text-[#000034]">Editor</span>
                        </div>
                        <div className="flex gap-2">
                          {['read', 'create', 'update', 'delete'].map(action => (
                            <button
                              key={action}
                              onClick={() => toggleNewPermission('editor', action)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                newPermissionEditor.includes(action)
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}
                            >
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Viewer Permissions */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          <span className="text-sm font-medium text-[#000034]">Viewer</span>
                        </div>
                        <div className="flex gap-2">
                          {['read', 'create', 'update', 'delete'].map(action => (
                            <button
                              key={action}
                              onClick={() => toggleNewPermission('viewer', action)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                newPermissionViewer.includes(action)
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-500 border border-gray-200'
                              }`}
                            >
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAddPermissionModal(false);
                        setNewPermissionName('');
                        setNewPermissionAdmin(['read', 'create', 'update', 'delete']);
                        setNewPermissionEditor(['read']);
                        setNewPermissionViewer(['read']);
                      }}
                      className="px-4 py-2 text-sm font-medium text-[#666666] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddPermission}
                      className="px-4 py-2 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg"
                    >
                      Add Permission
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Integrations Tab */}
        {activeMainTab === 'integrations' && (
          <motion.div
            key="integrations-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-white via-white to-cyan-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                External Integrations
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CRM Integration */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-[#1D4F91] mb-4">
                    <Database className="h-5 w-5" />
                    <span className="font-semibold">CRM Integration (ITN 3.1.2)</span>
                  </div>
                  <AnimatedToggleCard
                    label="Enable CRM Sync"
                    description="Sync escalated conversations to your CRM"
                    checked={settings.crmEnabled}
                    onChange={(checked) => setSettings({ ...settings, crmEnabled: checked })}
                  />
                  {settings.crmEnabled && (
                    <div className="mt-4">
                      <label className={labelClass}>CRM Provider</label>
                      <select
                        value={settings.crmProvider}
                        onChange={(e) => setSettings({ ...settings, crmProvider: e.target.value as "salesforce" | "dynamics" | "none" })}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="none">Select Provider...</option>
                        <option value="salesforce">Salesforce</option>
                        <option value="dynamics">Microsoft Dynamics 365</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* SharePoint Integration */}
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 text-[#006A52] mb-4">
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">SharePoint Integration (ITN 3.2.5)</span>
                  </div>
                  <AnimatedToggleCard
                    label="Enable SharePoint Sync"
                    description="Parse documents from SharePoint for knowledge base"
                    checked={settings.sharePointEnabled}
                    onChange={(checked) => setSettings({ ...settings, sharePointEnabled: checked })}
                  />
                  {settings.sharePointEnabled && (
                    <div className="mt-4">
                      <label className={labelClass}>SharePoint Site</label>
                      <select
                        value={settings.sharePointSite}
                        onChange={(e) => setSettings({ ...settings, sharePointSite: e.target.value as "city-documents" | "public-records" | "hr-documents" | "none" })}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="none">Select Site...</option>
                        <option value="city-documents">City Documents</option>
                        <option value="public-records">Public Records</option>
                        <option value="hr-documents">HR Documents</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* IVR Integration */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-700 mb-4">
                    <Phone className="h-5 w-5" />
                    <span className="font-semibold">IVR Integration</span>
                  </div>
                  <AnimatedToggleCard
                    label="Enable IVR System"
                    description="Connect chatbot to phone system"
                    checked={settings.ivrEnabled}
                    onChange={(checked) => setSettings({ ...settings, ivrEnabled: checked })}
                  />
                  {settings.ivrEnabled && (
                    <div className="mt-4">
                      <label className={labelClass}>IVR Provider</label>
                      <select
                        value={settings.ivrProvider}
                        onChange={(e) => setSettings({ ...settings, ivrProvider: e.target.value as "twilio" | "vonage" | "amazon-connect" | "none" })}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="none">Select Provider...</option>
                        <option value="twilio">Twilio</option>
                        <option value="vonage">Vonage</option>
                        <option value="amazon-connect">Amazon Connect</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* SMS Integration */}
                <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-700 mb-4">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-semibold">SMS Integration</span>
                  </div>
                  <AnimatedToggleCard
                    label="Enable SMS Support"
                    description="Allow users to interact via text messages"
                    checked={settings.smsEnabled}
                    onChange={(checked) => setSettings({ ...settings, smsEnabled: checked })}
                  />
                  {settings.smsEnabled && (
                    <div className="mt-4">
                      <label className={labelClass}>SMS Provider</label>
                      <select
                        value={settings.smsProvider}
                        onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value as "twilio" | "messagebird" | "vonage" | "none" })}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="none">Select Provider...</option>
                        <option value="twilio">Twilio</option>
                        <option value="messagebird">MessageBird</option>
                        <option value="vonage">Vonage</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                <div className="p-5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100 lg:col-span-2">
                  <div className="flex items-center gap-2 text-pink-700 mb-4">
                    <Smartphone className="h-5 w-5" />
                    <span className="font-semibold">Social Media Integrations</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Facebook */}
                    <div className="space-y-3">
                      <AnimatedToggleCard
                        label="Facebook Messenger"
                        description="Connect to Facebook Page"
                        checked={settings.facebookEnabled}
                        onChange={(checked) => setSettings({ ...settings, facebookEnabled: checked })}
                      />
                      {settings.facebookEnabled && (
                        <div>
                          <label className={labelClass}>Page ID</label>
                          <input
                            type="text"
                            value={settings.facebookPageId}
                            onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })}
                            placeholder="Enter Facebook Page ID"
                            className={inputClass}
                          />
                        </div>
                      )}
                    </div>

                    {/* WhatsApp */}
                    <div className="space-y-3">
                      <AnimatedToggleCard
                        label="WhatsApp Business"
                        description="Connect WhatsApp API"
                        checked={settings.whatsappEnabled}
                        onChange={(checked) => setSettings({ ...settings, whatsappEnabled: checked })}
                      />
                      {settings.whatsappEnabled && (
                        <div>
                          <label className={labelClass}>Business ID</label>
                          <input
                            type="text"
                            value={settings.whatsappBusinessId}
                            onChange={(e) => setSettings({ ...settings, whatsappBusinessId: e.target.value })}
                            placeholder="Enter WhatsApp Business ID"
                            className={inputClass}
                          />
                        </div>
                      )}
                    </div>

                    {/* Instagram */}
                    <div className="space-y-3">
                      <AnimatedToggleCard
                        label="Instagram DM"
                        description="Connect Instagram account"
                        checked={settings.instagramEnabled}
                        onChange={(checked) => setSettings({ ...settings, instagramEnabled: checked })}
                      />
                      {settings.instagramEnabled && (
                        <div>
                          <label className={labelClass}>Account ID</label>
                          <input
                            type="text"
                            value={settings.instagramAccountId}
                            onChange={(e) => setSettings({ ...settings, instagramAccountId: e.target.value })}
                            placeholder="Enter Instagram Account ID"
                            className={inputClass}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tyler Technologies Integrations - Full Spectrum (RFP Requirements) */}
            <div className="bg-gradient-to-br from-white via-white to-sky-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6">
              <h2 className="text-lg font-semibold text-[#000034] mb-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                Tyler Technologies Platform
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-700 rounded-full">RFP Required</span>
              </h2>
              <p className="text-sm text-gray-500 mb-6 ml-13">Full spectrum integration with Tyler Technologies municipal software suite</p>

              {/* Civic Services Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-sky-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                  Civic Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tyler Permitting System */}
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
                    <div className="flex items-center gap-2 text-sky-700 mb-3">
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold text-sm">Enterprise Permitting</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Permits, inspections, workflows</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerPermittingEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerPermittingEnabled: checked })}
                    />
                    {settings.tylerPermittingEnabled && (
                      <select
                        value={settings.tylerPermittingEnv}
                        onChange={(e) => setSettings({ ...settings, tylerPermittingEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Tyler 311 */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 mb-3">
                      <Phone className="h-4 w-4" />
                      <span className="font-semibold text-sm">Tyler 311</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Service requests & routing</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tyler311Enabled}
                      onChange={(checked) => setSettings({ ...settings, tyler311Enabled: checked })}
                    />
                    {settings.tyler311Enabled && (
                      <select
                        value={settings.tyler311Env}
                        onChange={(e) => setSettings({ ...settings, tyler311Env: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Enterprise Asset Management */}
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-700 mb-3">
                      <Settings className="h-4 w-4" />
                      <span className="font-semibold text-sm">Asset Management</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Infrastructure & assets</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerEAMEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerEAMEnabled: checked })}
                    />
                    {settings.tylerEAMEnabled && (
                      <select
                        value={settings.tylerEAMEnv}
                        onChange={(e) => setSettings({ ...settings, tylerEAMEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Parks & Recreation */}
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 mb-3">
                      <Globe className="h-4 w-4" />
                      <span className="font-semibold text-sm">Parks & Recreation</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Facilities & programs</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerParksRecEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerParksRecEnabled: checked })}
                    />
                    {settings.tylerParksRecEnabled && (
                      <select
                        value={settings.tylerParksRecEnv}
                        onChange={(e) => setSettings({ ...settings, tylerParksRecEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial/ERP Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-violet-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                  Financial & ERP
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Tyler Munis */}
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                    <div className="flex items-center gap-2 text-violet-700 mb-3">
                      <Database className="h-4 w-4" />
                      <span className="font-semibold text-sm">Tyler Munis (ERP)</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Budgeting & accounting</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerMunisEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerMunisEnabled: checked })}
                    />
                    {settings.tylerMunisEnabled && (
                      <select
                        value={settings.tylerMunisEnv}
                        onChange={(e) => setSettings({ ...settings, tylerMunisEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Tyler Payments */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-700 mb-3">
                      <Key className="h-4 w-4" />
                      <span className="font-semibold text-sm">Tyler Payments</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Online payment processing</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerPaymentsEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerPaymentsEnabled: checked })}
                    />
                    {settings.tylerPaymentsEnabled && (
                      <select
                        value={settings.tylerPaymentsEnv}
                        onChange={(e) => setSettings({ ...settings, tylerPaymentsEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Tyler Cashiering */}
                  <div className="p-4 bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-xl border border-fuchsia-100">
                    <div className="flex items-center gap-2 text-fuchsia-700 mb-3">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-semibold text-sm">Tyler Cashiering</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Point of sale & receipts</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerCashieringEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerCashieringEnabled: checked })}
                    />
                    {settings.tylerCashieringEnabled && (
                      <select
                        value={settings.tylerCashieringEnv}
                        onChange={(e) => setSettings({ ...settings, tylerCashieringEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Public Safety Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-red-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  Public Safety
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Enterprise Public Safety */}
                  <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 text-red-700 mb-3">
                      <Shield className="h-4 w-4" />
                      <span className="font-semibold text-sm">Enterprise Public Safety</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">CAD, RMS, dispatch systems</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerPublicSafetyEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerPublicSafetyEnabled: checked })}
                    />
                    {settings.tylerPublicSafetyEnabled && (
                      <select
                        value={settings.tylerPublicSafetyEnv}
                        onChange={(e) => setSettings({ ...settings, tylerPublicSafetyEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Citizen Engagement Section */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-cyan-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  Citizen Engagement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* My Civic */}
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border border-cyan-100">
                    <div className="flex items-center gap-2 text-cyan-700 mb-3">
                      <User className="h-4 w-4" />
                      <span className="font-semibold text-sm">My Civic Portal</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Citizen self-service portal</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerMyCivicEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerMyCivicEnabled: checked })}
                    />
                    {settings.tylerMyCivicEnabled && (
                      <select
                        value={settings.tylerMyCivicEnv}
                        onChange={(e) => setSettings({ ...settings, tylerMyCivicEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Content Manager */}
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 text-teal-700 mb-3">
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold text-sm">Content Manager</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Document management</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerContentManagerEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerContentManagerEnabled: checked })}
                    />
                    {settings.tylerContentManagerEnabled && (
                      <select
                        value={settings.tylerContentManagerEnv}
                        onChange={(e) => setSettings({ ...settings, tylerContentManagerEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Records & Data Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  Records & Data Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Enterprise Records */}
                  <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700 mb-3">
                      <History className="h-4 w-4" />
                      <span className="font-semibold text-sm">Enterprise Records</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Records management system</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerRecordsEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerRecordsEnabled: checked })}
                    />
                    {settings.tylerRecordsEnabled && (
                      <select
                        value={settings.tylerRecordsEnv}
                        onChange={(e) => setSettings({ ...settings, tylerRecordsEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>

                  {/* Data & Insights */}
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 mb-3">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-semibold text-sm">Data & Insights</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Analytics & reporting</p>
                    <AnimatedToggleCard
                      label="Enabled"
                      description=""
                      checked={settings.tylerDataInsightsEnabled}
                      onChange={(checked) => setSettings({ ...settings, tylerDataInsightsEnabled: checked })}
                    />
                    {settings.tylerDataInsightsEnabled && (
                      <select
                        value={settings.tylerDataInsightsEnv}
                        onChange={(e) => setSettings({ ...settings, tylerDataInsightsEnv: e.target.value as "production" | "staging" | "none" })}
                        className={`${inputClass} cursor-pointer mt-2 text-xs`}
                      >
                        <option value="none">Select Env...</option>
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chatbot Tab - Original Settings Content */}
        {activeMainTab === 'chatbot' && (
          <motion.div
            key="chatbot-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Section Navigation */}
              <motion.nav
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:w-56 flex-shrink-0"
              >
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {chatbotSections.map((section, idx) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-white"
                      : "bg-white text-[#363535] hover:bg-gray-50 border border-[#E7EBF0] hover:border-[#000080]/30"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSettingsSection"
                      className="absolute inset-0 bg-gradient-to-r from-[#000080] to-[#1D4F91] rounded-xl shadow-lg shadow-[#000080]/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`relative z-10 ${isActive ? "" : `w-7 h-7 rounded-lg bg-gradient-to-br ${section.gradient} to-transparent/50 flex items-center justify-center`}`}>
                    <Icon className={`h-4 w-4 ${isActive ? "" : "text-white"}`} />
                  </div>
                  <span className="relative z-10">{section.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>

        {/* Settings Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* General Settings */}
            {activeSection === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  General Settings
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Chatbot Name</label>
                    <input
                      type="text"
                      value={settings.chatbotName}
                      onChange={(e) => setSettings({ ...settings, chatbotName: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  {/* Dynamic welcome messages for all enabled languages */}
                  {enabledLanguages.length > 0 ? (
                    enabledLanguages.map((lang) => (
                      <div key={lang.code}>
                        <label className={labelClass}>
                          Welcome Message ({lang.name})
                          {lang.isDefault && (
                            <span className="ml-2 text-xs bg-[#000080]/10 text-[#000080] px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </label>
                        <textarea
                          value={
                            lang.code === 'en' ? settings.welcomeMessage :
                            lang.code === 'es' ? settings.welcomeMessageEs :
                            lang.code === 'ht' ? settings.welcomeMessageHt :
                            welcomeMessages[lang.code] || ''
                          }
                          onChange={(e) => {
                            if (lang.code === 'en') {
                              setSettings({ ...settings, welcomeMessage: e.target.value });
                            } else if (lang.code === 'es') {
                              setSettings({ ...settings, welcomeMessageEs: e.target.value });
                            } else if (lang.code === 'ht') {
                              setSettings({ ...settings, welcomeMessageHt: e.target.value });
                            } else {
                              setWelcomeMessages({ ...welcomeMessages, [lang.code]: e.target.value });
                            }
                          }}
                          placeholder={`Enter welcome message in ${lang.nativeName}...`}
                          className={textareaClass}
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      <div>
                        <label className={labelClass}>Welcome Message (English)</label>
                        <textarea
                          value={settings.welcomeMessage}
                          onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                          className={textareaClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Welcome Message (Spanish)</label>
                        <textarea
                          value={settings.welcomeMessageEs}
                          onChange={(e) => setSettings({ ...settings, welcomeMessageEs: e.target.value })}
                          className={textareaClass}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className={labelClass}>Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultLanguage: e.target.value as "en" | "es" | "ht" })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      {enabledLanguages.length > 0 ? (
                        enabledLanguages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name} {lang.isDefault ? "(Current Default)" : ""}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                        </>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage available languages in the Languages section below
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Behavior Settings */}
            {activeSection === "behavior" && (
              <motion.div
                key="behavior"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-purple-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  Behavior Settings
                </h2>

                <div className="space-y-5">
                  <AnimatedToggleCard
                    label="Sentiment Analysis"
                    description="Detect user emotions and adjust responses"
                    checked={settings.enableSentimentAnalysis}
                    onChange={(checked) => setSettings({ ...settings, enableSentimentAnalysis: checked })}
                  />

                  <AnimatedToggleCard
                    label="Auto Escalation"
                    description="Automatically escalate frustrated users"
                    checked={settings.enableAutoEscalation}
                    onChange={(checked) => setSettings({ ...settings, enableAutoEscalation: checked })}
                  />

                  <div>
                    <label className={labelClass}>Escalation Threshold (negative messages)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.escalationThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, escalationThreshold: parseInt(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Max Messages Per Session</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={settings.maxMessagesPerSession}
                      onChange={(e) =>
                        setSettings({ ...settings, maxMessagesPerSession: parseInt(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Session Timeout (minutes)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b6b6b]" />
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-pink-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  Appearance Settings
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Primary Color</label>
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="w-14 h-11 border border-[#E7EBF0] rounded-lg cursor-pointer shadow-sm"
                        />
                      </motion.div>
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Widget Position</label>
                    <select
                      value={settings.position}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          position: e.target.value as "bottom-right" | "bottom-left",
                        })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  <AnimatedToggleCard
                    label="Show Sources"
                    description="Display source links with responses"
                    checked={settings.showSources}
                    onChange={(checked) => setSettings({ ...settings, showSources: checked })}
                  />

                  <AnimatedToggleCard
                    label="Show Feedback Buttons"
                    description="Allow users to rate responses"
                    checked={settings.showFeedback}
                    onChange={(checked) => setSettings({ ...settings, showFeedback: checked })}
                  />
                </div>
              </motion.div>
            )}

            {/* LLM Settings */}
            {activeSection === "llm" && (
              <motion.div
                key="llm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-orange-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  LLM Settings
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Primary LLM</label>
                    <select
                      value={settings.primaryLLM}
                      onChange={(e) =>
                        setSettings({ ...settings, primaryLLM: e.target.value as "openai" | "claude" })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="openai">OpenAI (GPT-4o-mini)</option>
                      <option value="claude">Anthropic (Claude)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Backup LLM</label>
                    <select
                      value={settings.backupLLM}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backupLLM: e.target.value as "openai" | "claude" | "none",
                        })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="claude">Anthropic (Claude)</option>
                      <option value="openai">OpenAI (GPT-4o-mini)</option>
                      <option value="none">None (No Backup)</option>
                    </select>
                    <p className="text-xs text-[#6b6b6b] mt-2">
                      Used when primary LLM is unavailable (ITN 3.2.3)
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Temperature: <span className="font-bold text-[#000034]">{settings.temperature}</span>
                    </label>
                    <div className="relative pt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) =>
                          setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                        }
                        className="w-full h-2 bg-gradient-to-r from-blue-200 to-orange-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#000080] [&::-webkit-slider-thumb]:to-[#1D4F91] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#6b6b6b] mt-2">
                        <span>Precise (0)</span>
                        <span>Creative (1)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Max Response Tokens</label>
                    <input
                      type="number"
                      min="256"
                      max="4096"
                      value={settings.maxTokens}
                      onChange={(e) =>
                        setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center gap-2 text-[#1D4F91] mb-2">
                      <Key className="h-4 w-4" />
                      <span className="font-medium text-sm">API Keys</span>
                    </div>
                    <p className="text-sm text-[#666666]">
                      API keys are stored securely in environment variables. Update them in your
                      server configuration.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeSection === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-amber-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  Notification Settings
                </h2>

                <div className="space-y-5">
                  <AnimatedToggleCard
                    label="Email Alerts"
                    description="Receive email notifications for events"
                    checked={settings.enableEmailAlerts}
                    onChange={(checked) => setSettings({ ...settings, enableEmailAlerts: checked })}
                  />

                  <AnimatePresence>
                    {settings.enableEmailAlerts && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div>
                          <label className={labelClass}>Alert Email Address</label>
                          <input
                            type="email"
                            value={settings.alertEmail}
                            onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                            placeholder="admin@cityofdoral.com"
                            className={inputClass}
                          />
                        </div>

                        <AnimatedToggleCard
                          label="Alert on Escalation"
                          description="Notify when user is escalated"
                          checked={settings.alertOnEscalation}
                          onChange={(checked) => setSettings({ ...settings, alertOnEscalation: checked })}
                        />

                        <AnimatedToggleCard
                          label="Alert on Negative Feedback"
                          description="Notify when user gives thumbs down"
                          checked={settings.alertOnNegativeFeedback}
                          onChange={(checked) => setSettings({ ...settings, alertOnNegativeFeedback: checked })}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-green-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Security & Compliance
                </h2>

                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, title: "PII Encryption", desc: "All conversation data is encrypted at rest and in transit (ITN 3.1.3)", status: "success" },
                    { icon: CheckCircle2, title: "Audit Trail", desc: "All interactions are logged for compliance (ITN 3.1.3)", status: "success" },
                    { icon: CheckCircle2, title: "WCAG 2.1 Compliance", desc: "Chatbot meets accessibility standards (ITN 3.2.1)", status: "success" },
                    { icon: AlertTriangle, title: "Data Retention", desc: "Conversation logs are retained for 90 days. Configure data retention policies in your database settings.", status: "warning" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <ComplianceCard
                        icon={<item.icon className="h-4 w-4" />}
                        title={item.title}
                        description={item.desc}
                        status={item.status as "success" | "warning"}
                      />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-5 bg-gradient-to-br from-[#F5F9FD] to-blue-50/50 rounded-xl border border-[#E7EBF0]"
                  >
                    <h3 className="font-medium text-[#000034] mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1D4F91]" />
                      Compliance References
                    </h3>
                    <ul className="text-sm text-[#666666] space-y-2.5">
                      {["Florida Public Records Law (Ch. 119)", "Local, State, Federal Data Protection", "E-Verify Compliance"].map((item, idx) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#000080] to-[#1D4F91]" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Languages Section - Inside Chatbot Tab */}
            {activeSection === "languages" && (
              <motion.div
                key="languages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-teal-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <LanguagesSettings onLanguageChange={fetchEnabledLanguages} />
              </motion.div>
            )}

            {/* History Section */}
            {activeSection === "history" && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-gray-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-[#000034] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    Settings Change History
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={fetchHistory}
                    className="h-9 px-4 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingHistory ? "animate-spin" : ""}`} />
                    Refresh
                  </motion.button>
                </div>

                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#000080]" />
                  </div>
                ) : historyLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-[#666666]">No settings changes recorded yet</p>
                    <p className="text-sm text-gray-500 mt-1">Changes to settings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyLogs.slice(0, 20).map((log, idx) => {
                      const actionColors: Record<string, string> = {
                        UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
                        RESET: "bg-amber-100 text-amber-700 border-amber-200",
                        CREATE: "bg-green-100 text-green-700 border-green-200",
                        DELETE: "bg-red-100 text-red-700 border-red-200",
                      };
                      const color = actionColors[log.action] || "bg-gray-100 text-gray-700 border-gray-200";

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-start gap-4 p-4 bg-white border border-[#E7EBF0] rounded-xl hover:shadow-sm transition-shadow"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-[#000034]">{log.adminUser}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
                                {log.action}
                              </span>
                              <span className="text-xs text-gray-500">
                                {log.resourceId !== "global" && log.resourceId}
                              </span>
                            </div>
                            <p className="text-sm text-[#666666] truncate">
                              {log.details ? (
                                (() => {
                                  try {
                                    const parsed = JSON.parse(log.details);
                                    if (parsed.action === "reset_to_defaults") return "Reset all settings to defaults";
                                    const keys = Object.keys(parsed).filter(k => k !== "email");
                                    if (keys.length > 0) return `Modified: ${keys.join(", ")}`;
                                    return "Settings modified";
                                  } catch {
                                    return log.details;
                                  }
                                })()
                              ) : (
                                "Settings modified"
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Animated Toggle Card Component
function AnimatedToggleCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-5 bg-gradient-to-br from-[#F5F9FD] to-blue-50/30 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#000080]/10"
    >
      <div>
        <p className="font-medium text-[#000034]">{label}</p>
        <p className="text-sm text-[#666666]">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <motion.div
          animate={{ backgroundColor: checked ? "#000080" : "#E5E7EB" }}
          className="w-12 h-7 rounded-full transition-colors duration-300"
        />
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.label>
  );
}

// Compliance Card Component
function ComplianceCard({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "success" | "warning";
}) {
  const bgColor = status === "success" ? "from-green-50 to-emerald-50" : "from-amber-50 to-yellow-50";
  const borderColor = status === "success" ? "border-green-100" : "border-amber-100";
  const textColor = status === "success" ? "text-[#006A52]" : "text-amber-700";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-5 bg-gradient-to-br ${bgColor} rounded-xl border ${borderColor} transition-all duration-200`}
    >
      <div className={`flex items-center gap-2 ${textColor} mb-2`}>
        {icon}
        <span className="font-medium text-sm">{title}</span>
      </div>
      <p className="text-sm text-[#666666]">{description}</p>
    </motion.div>
  );
}

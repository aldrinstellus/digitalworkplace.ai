export interface Feature {
  id: string;
  name: string;
  category: string;
  coverage: number;
  status: 'fully_automated' | 'partially_automated';
  openDefects: number;
  closedDefects: number;
  riskScore: number;
  passRate: number;
  impactScore: number;
}

export interface Category {
  id: string;
  name: string;
  features: Feature[];
  avgCoverage: number;
  highRiskCount: number;
  totalDefects: number;
}

export interface TestRun {
  id: string;
  featureId: string;
  featureName: string;
  executedAt: Date;
  status: 'passed' | 'failed';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  issues?: TestIssue[];
}

export interface TestIssue {
  id: string;
  testCaseName: string;
  severity: 'high' | 'medium' | 'low';
  errorMessage: string;
  stackTrace: string;
}

export interface DailyMetric {
  date: string;
  passRate: number;
  firstRunPassRate: number;
  defectDetection: number;
  effectiveness: number;
  automationCoverage: number;
}

export interface PersonaMetric {
  key: string;
  label: string;
  value: string | number;
  unit: string;
  description: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  metrics: PersonaMetric[];
}

export type PersonaType = 'csuite' | 'manager' | 'techlead';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

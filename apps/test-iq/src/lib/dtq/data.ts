import { Feature, Category, TestRun, DailyMetric, Persona, PersonaMetric } from './types';

// Pre-generated static features data to avoid hydration mismatch
export const features: Feature[] = [
  // Advanced / Enterprise
  { id: 'f1', name: 'xAPI / LRS Integration', category: 'Advanced / Enterprise', coverage: 92, status: 'fully_automated', openDefects: 1, closedDefects: 5, riskScore: 45, passRate: 94, impactScore: 85 },
  { id: 'f2', name: 'Multi-Tenant Configuration', category: 'Advanced / Enterprise', coverage: 88, status: 'partially_automated', openDefects: 2, closedDefects: 8, riskScore: 32, passRate: 91, impactScore: 92 },
  { id: 'f3', name: 'Advanced Compliance Tracking', category: 'Advanced / Enterprise', coverage: 95, status: 'fully_automated', openDefects: 0, closedDefects: 4, riskScore: 18, passRate: 97, impactScore: 88 },
  { id: 'f4', name: 'Custom Branding Engine', category: 'Advanced / Enterprise', coverage: 78, status: 'partially_automated', openDefects: 1, closedDefects: 6, riskScore: 25, passRate: 89, impactScore: 65 },
  { id: 'f5', name: 'Enterprise SSO', category: 'Advanced / Enterprise', coverage: 96, status: 'fully_automated', openDefects: 0, closedDefects: 3, riskScore: 12, passRate: 98, impactScore: 95 },

  // Learning Experience
  { id: 'f6', name: 'Adaptive Learning Paths', category: 'Learning Experience', coverage: 85, status: 'partially_automated', openDefects: 3, closedDefects: 7, riskScore: 38, passRate: 88, impactScore: 90 },
  { id: 'f7', name: 'Personalized Recommendations', category: 'Learning Experience', coverage: 91, status: 'fully_automated', openDefects: 1, closedDefects: 5, riskScore: 22, passRate: 93, impactScore: 82 },
  { id: 'f8', name: 'Skill Gap Analysis', category: 'Learning Experience', coverage: 87, status: 'partially_automated', openDefects: 2, closedDefects: 9, riskScore: 28, passRate: 90, impactScore: 78 },
  { id: 'f9', name: 'Learning Goals Tracking', category: 'Learning Experience', coverage: 93, status: 'fully_automated', openDefects: 0, closedDefects: 4, riskScore: 15, passRate: 96, impactScore: 75 },

  // Reporting & Analytics
  { id: 'f10', name: 'Executive Dashboard', category: 'Reporting & Analytics', coverage: 94, status: 'fully_automated', openDefects: 1, closedDefects: 6, riskScore: 20, passRate: 95, impactScore: 92 },
  { id: 'f11', name: 'Custom Report Builder', category: 'Reporting & Analytics', coverage: 82, status: 'partially_automated', openDefects: 2, closedDefects: 8, riskScore: 35, passRate: 87, impactScore: 85 },
  { id: 'f12', name: 'Learning Analytics', category: 'Reporting & Analytics', coverage: 89, status: 'partially_automated', openDefects: 1, closedDefects: 5, riskScore: 42, passRate: 91, impactScore: 88 },
  { id: 'f13', name: 'Compliance Reports', category: 'Reporting & Analytics', coverage: 97, status: 'fully_automated', openDefects: 0, closedDefects: 3, riskScore: 10, passRate: 99, impactScore: 94 },
  { id: 'f14', name: 'Export Center', category: 'Reporting & Analytics', coverage: 90, status: 'fully_automated', openDefects: 1, closedDefects: 4, riskScore: 16, passRate: 94, impactScore: 70 },

  // Course Catalog & Enrollment
  { id: 'f15', name: 'Course Discovery', category: 'Course Catalog & Enrollment', coverage: 86, status: 'partially_automated', openDefects: 2, closedDefects: 7, riskScore: 30, passRate: 89, impactScore: 85 },
  { id: 'f16', name: 'Self-Enrollment', category: 'Course Catalog & Enrollment', coverage: 95, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 14, passRate: 97, impactScore: 90 },
  { id: 'f17', name: 'Manager-Assigned Learning', category: 'Course Catalog & Enrollment', coverage: 88, status: 'partially_automated', openDefects: 1, closedDefects: 6, riskScore: 24, passRate: 92, impactScore: 82 },
  { id: 'f18', name: 'Waitlist Management', category: 'Course Catalog & Enrollment', coverage: 79, status: 'partially_automated', openDefects: 1, closedDefects: 4, riskScore: 20, passRate: 86, impactScore: 60 },

  // Social & Collaboration
  { id: 'f19', name: 'Discussion Forums', category: 'Social & Collaboration', coverage: 83, status: 'partially_automated', openDefects: 2, closedDefects: 8, riskScore: 26, passRate: 88, impactScore: 75 },
  { id: 'f20', name: 'Peer Reviews', category: 'Social & Collaboration', coverage: 91, status: 'fully_automated', openDefects: 1, closedDefects: 5, riskScore: 18, passRate: 93, impactScore: 72 },
  { id: 'f21', name: 'Learning Groups', category: 'Social & Collaboration', coverage: 87, status: 'partially_automated', openDefects: 1, closedDefects: 6, riskScore: 22, passRate: 90, impactScore: 68 },
  { id: 'f22', name: 'Social Sharing', category: 'Social & Collaboration', coverage: 76, status: 'partially_automated', openDefects: 0, closedDefects: 3, riskScore: 15, passRate: 85, impactScore: 55 },

  // Course Creation & Management
  { id: 'f23', name: 'SCORM Import', category: 'Course Creation & Management', coverage: 94, status: 'fully_automated', openDefects: 1, closedDefects: 7, riskScore: 19, passRate: 95, impactScore: 88 },
  { id: 'f24', name: 'Content Authoring', category: 'Course Creation & Management', coverage: 81, status: 'partially_automated', openDefects: 2, closedDefects: 9, riskScore: 34, passRate: 86, impactScore: 92 },
  { id: 'f25', name: 'Assessment Builder', category: 'Course Creation & Management', coverage: 89, status: 'partially_automated', openDefects: 1, closedDefects: 5, riskScore: 28, passRate: 91, impactScore: 85 },
  { id: 'f26', name: 'Media Library', category: 'Course Creation & Management', coverage: 85, status: 'partially_automated', openDefects: 1, closedDefects: 4, riskScore: 21, passRate: 89, impactScore: 78 },
  { id: 'f27', name: 'Course Versioning', category: 'Course Creation & Management', coverage: 92, status: 'fully_automated', openDefects: 0, closedDefects: 6, riskScore: 16, passRate: 94, impactScore: 80 },

  // Admin & Configuration
  { id: 'f28', name: 'User Management', category: 'Admin & Configuration', coverage: 96, status: 'fully_automated', openDefects: 0, closedDefects: 4, riskScore: 12, passRate: 98, impactScore: 95 },
  { id: 'f29', name: 'Role-Based Access Control', category: 'Admin & Configuration', coverage: 93, status: 'fully_automated', openDefects: 1, closedDefects: 5, riskScore: 18, passRate: 96, impactScore: 94 },
  { id: 'f30', name: 'Notification Settings', category: 'Admin & Configuration', coverage: 84, status: 'partially_automated', openDefects: 1, closedDefects: 6, riskScore: 22, passRate: 88, impactScore: 65 },
  { id: 'f31', name: 'Integration Hub', category: 'Admin & Configuration', coverage: 78, status: 'partially_automated', openDefects: 2, closedDefects: 8, riskScore: 36, passRate: 85, impactScore: 88 },
  { id: 'f32', name: 'Audit Logs', category: 'Admin & Configuration', coverage: 97, status: 'fully_automated', openDefects: 0, closedDefects: 3, riskScore: 10, passRate: 99, impactScore: 90 },
  { id: 'f33', name: 'System Configuration', category: 'Admin & Configuration', coverage: 88, status: 'partially_automated', openDefects: 1, closedDefects: 5, riskScore: 24, passRate: 91, impactScore: 85 },

  // Assessments & Certification
  { id: 'f34', name: 'Quiz Engine', category: 'Assessments & Certification', coverage: 92, status: 'fully_automated', openDefects: 1, closedDefects: 7, riskScore: 20, passRate: 94, impactScore: 88 },
  { id: 'f35', name: 'Certification Paths', category: 'Assessments & Certification', coverage: 90, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 16, passRate: 93, impactScore: 92 },
  { id: 'f36', name: 'Proctoring Support', category: 'Assessments & Certification', coverage: 75, status: 'partially_automated', openDefects: 2, closedDefects: 4, riskScore: 32, passRate: 84, impactScore: 78 },
  { id: 'f37', name: 'Certificate Designer', category: 'Assessments & Certification', coverage: 86, status: 'partially_automated', openDefects: 1, closedDefects: 6, riskScore: 18, passRate: 90, impactScore: 70 },

  // Events & Live Sessions
  { id: 'f38', name: 'Webinar Integration', category: 'Events & Live Sessions', coverage: 82, status: 'partially_automated', openDefects: 1, closedDefects: 5, riskScore: 28, passRate: 87, impactScore: 82 },
  { id: 'f39', name: 'ILT Scheduling', category: 'Events & Live Sessions', coverage: 89, status: 'partially_automated', openDefects: 0, closedDefects: 7, riskScore: 22, passRate: 92, impactScore: 85 },
  { id: 'f40', name: 'Attendance Tracking', category: 'Events & Live Sessions', coverage: 94, status: 'fully_automated', openDefects: 0, closedDefects: 4, riskScore: 14, passRate: 96, impactScore: 78 },
  { id: 'f41', name: 'Virtual Classroom', category: 'Events & Live Sessions', coverage: 77, status: 'partially_automated', openDefects: 2, closedDefects: 6, riskScore: 38, passRate: 85, impactScore: 88 },

  // Core User Journeys
  { id: 'f42', name: 'User Onboarding', category: 'Core User Journeys', coverage: 91, status: 'fully_automated', openDefects: 1, closedDefects: 8, riskScore: 24, passRate: 93, impactScore: 95 },
  { id: 'f43', name: 'Course Completion Flow', category: 'Core User Journeys', coverage: 95, status: 'fully_automated', openDefects: 0, closedDefects: 5, riskScore: 12, passRate: 97, impactScore: 98 },
  { id: 'f44', name: 'Profile Management', category: 'Core User Journeys', coverage: 88, status: 'partially_automated', openDefects: 1, closedDefects: 4, riskScore: 18, passRate: 91, impactScore: 72 },
  { id: 'f45', name: 'Mobile Experience', category: 'Core User Journeys', coverage: 79, status: 'partially_automated', openDefects: 3, closedDefects: 7, riskScore: 42, passRate: 86, impactScore: 90 },
  { id: 'f46', name: 'Search & Discovery', category: 'Core User Journeys', coverage: 84, status: 'partially_automated', openDefects: 2, closedDefects: 6, riskScore: 30, passRate: 88, impactScore: 85 },
];

// Generate categories from features
const categoryNames = [...new Set(features.map(f => f.category))];
export const categories: Category[] = categoryNames.map((name, index) => {
  const categoryFeatures = features.filter(f => f.category === name);
  const avgCoverage = Math.round(categoryFeatures.reduce((sum, f) => sum + f.coverage, 0) / categoryFeatures.length);
  const highRiskCount = categoryFeatures.filter(f => f.riskScore >= 40).length;
  const totalDefects = categoryFeatures.reduce((sum, f) => sum + f.openDefects, 0);

  return {
    id: `category-${index + 1}`,
    name,
    features: categoryFeatures,
    avgCoverage,
    highRiskCount,
    totalDefects,
  };
});

// Pre-generated test runs (40 total to match reference)
export const testRuns: TestRun[] = [
  // Recent runs (last 7 days)
  { id: 'r1', featureId: 'f1', featureName: 'xAPI / LRS Integration', executedAt: new Date('2026-02-02'), status: 'failed', totalTests: 24, passedTests: 21, failedTests: 3, duration: 8, issues: [{ id: 'i1', testCaseName: 'Test Case 1 - xAPI / LRS Integration', severity: 'high', errorMessage: 'Expected element to be visible but timed out after 30000ms', stackTrace: 'Error: Timeout waiting for element\n    at waitForSelector (/tests/xapi-lrs.spec.ts:45:12)\n    at Object.<anonymous> (/tests/xapi-lrs.spec.ts:52:5)' }] },
  { id: 'r2', featureId: 'f2', featureName: 'Multi-Tenant Configuration', executedAt: new Date('2026-02-01'), status: 'passed', totalTests: 18, passedTests: 18, failedTests: 0, duration: 6 },
  { id: 'r3', featureId: 'f6', featureName: 'Adaptive Learning Paths', executedAt: new Date('2026-02-01'), status: 'failed', totalTests: 22, passedTests: 19, failedTests: 3, duration: 9, issues: [{ id: 'i2', testCaseName: 'Test Case 2 - Adaptive Learning', severity: 'medium', errorMessage: 'Assertion failed: expected 5 to equal 4', stackTrace: 'AssertionError: expected 5 to equal 4\n    at Context.<anonymous> (/tests/adaptive-learning.spec.ts:78:14)' }] },
  { id: 'r4', featureId: 'f10', featureName: 'Executive Dashboard', executedAt: new Date('2026-01-31'), status: 'passed', totalTests: 15, passedTests: 15, failedTests: 0, duration: 5 },
  { id: 'r5', featureId: 'f12', featureName: 'Learning Analytics', executedAt: new Date('2026-01-31'), status: 'passed', totalTests: 20, passedTests: 20, failedTests: 0, duration: 7 },
  { id: 'r6', featureId: 'f15', featureName: 'Course Discovery', executedAt: new Date('2026-01-30'), status: 'failed', totalTests: 16, passedTests: 14, failedTests: 2, duration: 6, issues: [{ id: 'i3', testCaseName: 'Test Case 1 - Search functionality', severity: 'high', errorMessage: 'Network request failed: GET /api/search returned 500', stackTrace: 'NetworkError: Request failed\n    at fetchSearch (/tests/course-discovery.spec.ts:33:8)' }] },
  { id: 'r7', featureId: 'f23', featureName: 'SCORM Import', executedAt: new Date('2026-01-30'), status: 'passed', totalTests: 12, passedTests: 12, failedTests: 0, duration: 4 },
  { id: 'r8', featureId: 'f28', featureName: 'User Management', executedAt: new Date('2026-01-29'), status: 'passed', totalTests: 25, passedTests: 25, failedTests: 0, duration: 8 },
  { id: 'r9', featureId: 'f34', featureName: 'Quiz Engine', executedAt: new Date('2026-01-29'), status: 'passed', totalTests: 30, passedTests: 30, failedTests: 0, duration: 10 },
  { id: 'r10', featureId: 'f42', featureName: 'User Onboarding', executedAt: new Date('2026-01-28'), status: 'passed', totalTests: 18, passedTests: 18, failedTests: 0, duration: 6 },
  // Week 2
  { id: 'r11', featureId: 'f45', featureName: 'Mobile Experience', executedAt: new Date('2026-01-28'), status: 'failed', totalTests: 22, passedTests: 18, failedTests: 4, duration: 8, issues: [{ id: 'i4', testCaseName: 'Test Case 3 - Responsive layout', severity: 'medium', errorMessage: 'Element not clickable at point (320, 480)', stackTrace: 'ElementClickInterceptedError: Element not clickable\n    at click (/tests/mobile.spec.ts:92:10)' }] },
  { id: 'r12', featureId: 'f3', featureName: 'Advanced Compliance Tracking', executedAt: new Date('2026-01-27'), status: 'passed', totalTests: 14, passedTests: 14, failedTests: 0, duration: 5 },
  { id: 'r13', featureId: 'f7', featureName: 'Personalized Recommendations', executedAt: new Date('2026-01-27'), status: 'passed', totalTests: 16, passedTests: 16, failedTests: 0, duration: 5 },
  { id: 'r14', featureId: 'f19', featureName: 'Discussion Forums', executedAt: new Date('2026-01-26'), status: 'passed', totalTests: 20, passedTests: 20, failedTests: 0, duration: 7 },
  { id: 'r15', featureId: 'f31', featureName: 'Integration Hub', executedAt: new Date('2026-01-26'), status: 'failed', totalTests: 18, passedTests: 15, failedTests: 3, duration: 7, issues: [{ id: 'i5', testCaseName: 'Test Case 2 - OAuth flow', severity: 'high', errorMessage: 'OAuth callback URL mismatch', stackTrace: 'OAuthError: Callback URL mismatch\n    at verifyCallback (/tests/integration-hub.spec.ts:67:8)' }] },
  { id: 'r16', featureId: 'f5', featureName: 'Enterprise SSO', executedAt: new Date('2026-01-25'), status: 'passed', totalTests: 20, passedTests: 20, failedTests: 0, duration: 7 },
  { id: 'r17', featureId: 'f8', featureName: 'Skill Gap Analysis', executedAt: new Date('2026-01-25'), status: 'passed', totalTests: 18, passedTests: 18, failedTests: 0, duration: 6 },
  { id: 'r18', featureId: 'f13', featureName: 'Compliance Reports', executedAt: new Date('2026-01-24'), status: 'passed', totalTests: 15, passedTests: 15, failedTests: 0, duration: 5 },
  { id: 'r19', featureId: 'f16', featureName: 'Self-Enrollment', executedAt: new Date('2026-01-24'), status: 'passed', totalTests: 22, passedTests: 22, failedTests: 0, duration: 7 },
  { id: 'r20', featureId: 'f20', featureName: 'Peer Reviews', executedAt: new Date('2026-01-23'), status: 'passed', totalTests: 14, passedTests: 14, failedTests: 0, duration: 5 },
  // Week 3
  { id: 'r21', featureId: 'f24', featureName: 'Content Authoring', executedAt: new Date('2026-01-23'), status: 'failed', totalTests: 28, passedTests: 24, failedTests: 4, duration: 9, issues: [{ id: 'i6', testCaseName: 'Test Case 4 - Rich text editor', severity: 'medium', errorMessage: 'Editor failed to initialize', stackTrace: 'EditorError: Failed to mount\n    at initEditor (/tests/content-authoring.spec.ts:45:8)' }] },
  { id: 'r22', featureId: 'f27', featureName: 'Course Versioning', executedAt: new Date('2026-01-22'), status: 'passed', totalTests: 16, passedTests: 16, failedTests: 0, duration: 5 },
  { id: 'r23', featureId: 'f29', featureName: 'Role-Based Access Control', executedAt: new Date('2026-01-22'), status: 'passed', totalTests: 24, passedTests: 24, failedTests: 0, duration: 8 },
  { id: 'r24', featureId: 'f32', featureName: 'Audit Logs', executedAt: new Date('2026-01-21'), status: 'passed', totalTests: 12, passedTests: 12, failedTests: 0, duration: 4 },
  { id: 'r25', featureId: 'f35', featureName: 'Certification Paths', executedAt: new Date('2026-01-21'), status: 'passed', totalTests: 20, passedTests: 20, failedTests: 0, duration: 7 },
  { id: 'r26', featureId: 'f38', featureName: 'Webinar Integration', executedAt: new Date('2026-01-20'), status: 'failed', totalTests: 18, passedTests: 15, failedTests: 3, duration: 6, issues: [{ id: 'i7', testCaseName: 'Test Case 1 - Zoom integration', severity: 'high', errorMessage: 'API authentication failed', stackTrace: 'AuthError: Invalid API key\n    at authenticateZoom (/tests/webinar.spec.ts:28:12)' }] },
  { id: 'r27', featureId: 'f40', featureName: 'Attendance Tracking', executedAt: new Date('2026-01-20'), status: 'passed', totalTests: 15, passedTests: 15, failedTests: 0, duration: 5 },
  { id: 'r28', featureId: 'f43', featureName: 'Course Completion Flow', executedAt: new Date('2026-01-19'), status: 'passed', totalTests: 22, passedTests: 22, failedTests: 0, duration: 7 },
  { id: 'r29', featureId: 'f46', featureName: 'Search & Discovery', executedAt: new Date('2026-01-19'), status: 'passed', totalTests: 18, passedTests: 18, failedTests: 0, duration: 6 },
  { id: 'r30', featureId: 'f4', featureName: 'Custom Branding Engine', executedAt: new Date('2026-01-18'), status: 'passed', totalTests: 14, passedTests: 14, failedTests: 0, duration: 5 },
  // Week 4
  { id: 'r31', featureId: 'f9', featureName: 'Learning Goals Tracking', executedAt: new Date('2026-01-18'), status: 'passed', totalTests: 16, passedTests: 16, failedTests: 0, duration: 5 },
  { id: 'r32', featureId: 'f11', featureName: 'Custom Report Builder', executedAt: new Date('2026-01-17'), status: 'failed', totalTests: 20, passedTests: 17, failedTests: 3, duration: 7, issues: [{ id: 'i8', testCaseName: 'Test Case 2 - Export function', severity: 'medium', errorMessage: 'PDF generation timeout', stackTrace: 'TimeoutError: PDF generation exceeded 30s\n    at generatePDF (/tests/report-builder.spec.ts:62:10)' }] },
  { id: 'r33', featureId: 'f14', featureName: 'Export Center', executedAt: new Date('2026-01-17'), status: 'passed', totalTests: 12, passedTests: 12, failedTests: 0, duration: 4 },
  { id: 'r34', featureId: 'f17', featureName: 'Manager-Assigned Learning', executedAt: new Date('2026-01-16'), status: 'passed', totalTests: 18, passedTests: 18, failedTests: 0, duration: 6 },
  { id: 'r35', featureId: 'f21', featureName: 'Learning Groups', executedAt: new Date('2026-01-16'), status: 'passed', totalTests: 14, passedTests: 14, failedTests: 0, duration: 5 },
  { id: 'r36', featureId: 'f25', featureName: 'Assessment Builder', executedAt: new Date('2026-01-15'), status: 'passed', totalTests: 22, passedTests: 22, failedTests: 0, duration: 7 },
  { id: 'r37', featureId: 'f30', featureName: 'Notification Settings', executedAt: new Date('2026-01-15'), status: 'passed', totalTests: 10, passedTests: 10, failedTests: 0, duration: 3 },
  { id: 'r38', featureId: 'f36', featureName: 'Proctoring Support', executedAt: new Date('2026-01-14'), status: 'failed', totalTests: 16, passedTests: 13, failedTests: 3, duration: 6, issues: [{ id: 'i9', testCaseName: 'Test Case 1 - Camera access', severity: 'high', errorMessage: 'Camera permission denied', stackTrace: 'PermissionError: Camera access denied\n    at requestCamera (/tests/proctoring.spec.ts:34:8)' }] },
  { id: 'r39', featureId: 'f39', featureName: 'ILT Scheduling', executedAt: new Date('2026-01-14'), status: 'passed', totalTests: 18, passedTests: 18, failedTests: 0, duration: 6 },
  { id: 'r40', featureId: 'f41', featureName: 'Virtual Classroom', executedAt: new Date('2026-01-13'), status: 'failed', totalTests: 20, passedTests: 16, failedTests: 4, duration: 8, issues: [{ id: 'i10', testCaseName: 'Test Case 3 - Screen sharing', severity: 'medium', errorMessage: 'Screen share failed to initialize', stackTrace: 'MediaError: getDisplayMedia not supported\n    at startScreenShare (/tests/virtual-classroom.spec.ts:78:12)' }] },
];

// Pre-generated daily metrics for 30 days
export const dailyMetrics: DailyMetric[] = [
  { date: '2026-01-05', passRate: 91, firstRunPassRate: 85, defectDetection: 82, effectiveness: 88, automationCoverage: 89 },
  { date: '2026-01-06', passRate: 93, firstRunPassRate: 87, defectDetection: 84, effectiveness: 90, automationCoverage: 89 },
  { date: '2026-01-07', passRate: 92, firstRunPassRate: 86, defectDetection: 83, effectiveness: 89, automationCoverage: 90 },
  { date: '2026-01-08', passRate: 94, firstRunPassRate: 88, defectDetection: 85, effectiveness: 91, automationCoverage: 90 },
  { date: '2026-01-09', passRate: 93, firstRunPassRate: 87, defectDetection: 84, effectiveness: 90, automationCoverage: 90 },
  { date: '2026-01-10', passRate: 95, firstRunPassRate: 89, defectDetection: 86, effectiveness: 92, automationCoverage: 91 },
  { date: '2026-01-11', passRate: 94, firstRunPassRate: 88, defectDetection: 85, effectiveness: 91, automationCoverage: 91 },
  { date: '2026-01-12', passRate: 92, firstRunPassRate: 86, defectDetection: 83, effectiveness: 89, automationCoverage: 91 },
  { date: '2026-01-13', passRate: 93, firstRunPassRate: 87, defectDetection: 84, effectiveness: 90, automationCoverage: 91 },
  { date: '2026-01-14', passRate: 95, firstRunPassRate: 90, defectDetection: 87, effectiveness: 93, automationCoverage: 92 },
  { date: '2026-01-15', passRate: 96, firstRunPassRate: 91, defectDetection: 88, effectiveness: 94, automationCoverage: 92 },
  { date: '2026-01-16', passRate: 94, firstRunPassRate: 89, defectDetection: 86, effectiveness: 92, automationCoverage: 92 },
  { date: '2026-01-17', passRate: 93, firstRunPassRate: 88, defectDetection: 85, effectiveness: 91, automationCoverage: 92 },
  { date: '2026-01-18', passRate: 95, firstRunPassRate: 90, defectDetection: 87, effectiveness: 93, automationCoverage: 92 },
  { date: '2026-01-19', passRate: 94, firstRunPassRate: 89, defectDetection: 86, effectiveness: 92, automationCoverage: 93 },
  { date: '2026-01-20', passRate: 96, firstRunPassRate: 91, defectDetection: 88, effectiveness: 94, automationCoverage: 93 },
  { date: '2026-01-21', passRate: 95, firstRunPassRate: 90, defectDetection: 87, effectiveness: 93, automationCoverage: 93 },
  { date: '2026-01-22', passRate: 93, firstRunPassRate: 88, defectDetection: 85, effectiveness: 91, automationCoverage: 93 },
  { date: '2026-01-23', passRate: 94, firstRunPassRate: 89, defectDetection: 86, effectiveness: 92, automationCoverage: 93 },
  { date: '2026-01-24', passRate: 96, firstRunPassRate: 91, defectDetection: 88, effectiveness: 94, automationCoverage: 93 },
  { date: '2026-01-25', passRate: 95, firstRunPassRate: 90, defectDetection: 87, effectiveness: 93, automationCoverage: 94 },
  { date: '2026-01-26', passRate: 94, firstRunPassRate: 89, defectDetection: 86, effectiveness: 92, automationCoverage: 94 },
  { date: '2026-01-27', passRate: 96, firstRunPassRate: 92, defectDetection: 89, effectiveness: 95, automationCoverage: 94 },
  { date: '2026-01-28', passRate: 95, firstRunPassRate: 91, defectDetection: 88, effectiveness: 94, automationCoverage: 94 },
  { date: '2026-01-29', passRate: 97, firstRunPassRate: 93, defectDetection: 90, effectiveness: 96, automationCoverage: 94 },
  { date: '2026-01-30', passRate: 94, firstRunPassRate: 90, defectDetection: 87, effectiveness: 93, automationCoverage: 94 },
  { date: '2026-01-31', passRate: 96, firstRunPassRate: 92, defectDetection: 89, effectiveness: 95, automationCoverage: 95 },
  { date: '2026-02-01', passRate: 95, firstRunPassRate: 91, defectDetection: 88, effectiveness: 94, automationCoverage: 95 },
  { date: '2026-02-02', passRate: 97, firstRunPassRate: 93, defectDetection: 90, effectiveness: 96, automationCoverage: 95 },
  { date: '2026-02-03', passRate: 96, firstRunPassRate: 92, defectDetection: 89, effectiveness: 95, automationCoverage: 95 },
];

// Persona-specific metrics
const managerMetrics: PersonaMetric[] = [
  { key: 'passRate', label: 'Test Pass Rate', value: 94.2, unit: '%', description: 'Last 30 days average', trend: 'up', trendValue: '+2.3%' },
  { key: 'autoManualRatio', label: 'Automated vs Manual', value: '8.5:1', unit: 'ratio', description: 'Test efficiency ratio', trend: 'up', trendValue: '+0.5' },
  { key: 'effectiveness', label: 'Test Case Effectiveness', value: 0.87, unit: 'score', description: 'Defects found per test', trend: 'stable', trendValue: '0.0' },
  { key: 'regressionTime', label: 'Regression Execution', value: 42, unit: 'min', description: 'Full suite duration', trend: 'down', trendValue: '-8 min' },
  { key: 'firstRunPass', label: 'First-Run Pass Rate', value: 87.5, unit: '%', description: 'New features pass rate', trend: 'up', trendValue: '+4.2%' },
  { key: 'escalationRate', label: 'Escalation Rate', value: 12.3, unit: '%', description: 'Auto to manual review', trend: 'down', trendValue: '-2.1%' },
  { key: 'testReuse', label: 'Test Case Reuse', value: 76.8, unit: '%', description: 'Across releases', trend: 'up', trendValue: '+5.3%' },
  { key: 'blockerDefects', label: 'Blocker Defects', value: 3, unit: 'count', description: 'Critical issues', trend: 'down', trendValue: '-2' },
  { key: 'envUptime', label: 'Environment Uptime', value: 99.2, unit: '%', description: 'Test env stability', trend: 'stable', trendValue: '0.0%' },
];

const csuiteMetrics: PersonaMetric[] = [
  { key: 'releaseVelocity', label: 'Release Velocity', value: '+35', unit: '%', description: 'More releases per quarter', trend: 'up', trendValue: '+8%' },
  { key: 'timeToMarket', label: 'Mean Time to Market', value: 12, unit: 'days', description: 'For new features', trend: 'down', trendValue: '-4 days' },
  { key: 'automationROI', label: 'Automation ROI', value: 285, unit: '%', description: 'Cost savings', trend: 'up', trendValue: '+45%' },
  { key: 'escapeRate', label: 'Defect Escape Rate', value: 2.1, unit: '%', description: 'Bugs reaching production', trend: 'down', trendValue: '-0.8%' },
  { key: 'incidentsPrevented', label: 'Incidents Prevented', value: 47, unit: 'count', description: 'Customer-impacting', trend: 'up', trendValue: '+12' },
  { key: 'riskReduction', label: 'Risk Reduction', value: 68, unit: '%', description: 'Business impact weighted', trend: 'up', trendValue: '+15%' },
  { key: 'capacityUnlocked', label: 'Capacity Unlocked', value: 42, unit: '%', description: 'QA time to innovation', trend: 'up', trendValue: '+8%' },
];

const techLeadMetrics: PersonaMetric[] = [
  { key: 'flakyRate', label: 'Flaky Test Rate', value: 3.2, unit: '%', description: 'Test stability', trend: 'down', trendValue: '-1.5%' },
  { key: 'avgExecution', label: 'Avg Execution Time', value: 4.2, unit: 'min', description: 'Per test suite', trend: 'down', trendValue: '-0.8 min' },
  { key: 'tokenCost', label: 'Token Usage Cost', value: 0.42, unit: '$', description: 'Per agentic run', trend: 'down', trendValue: '-$0.15' },
  { key: 'contextHitRate', label: 'Context Hit Rate', value: 94.5, unit: '%', description: 'Relevance score', trend: 'up', trendValue: '+2.3%' },
  { key: 'toolCallSuccess', label: 'Tool Call Success', value: 97.8, unit: '%', description: 'Click/type accuracy', trend: 'up', trendValue: '+1.2%' },
  { key: 'parallelEfficiency', label: 'Parallel Efficiency', value: 78.5, unit: '%', description: 'Speed-up vs theoretical', trend: 'up', trendValue: '+5%' },
  { key: 'automationCoverage', label: 'Automation Coverage', value: 93.3, unit: '%', description: 'Code + requirements', trend: 'up', trendValue: '+2.1%' },
  { key: 'totalTests', label: 'Total Test Cases', value: 1247, unit: 'count', description: 'Active tests', trend: 'up', trendValue: '+86' },
];

export const personas: Persona[] = [
  {
    id: 'csuite',
    name: 'C-Suite',
    title: 'Executive',
    description: 'Strategic business metrics and ROI insights',
    icon: 'crown',
    metrics: csuiteMetrics,
  },
  {
    id: 'manager',
    name: 'QA Manager',
    title: 'Manager',
    description: 'Team performance and operational effectiveness',
    icon: 'users',
    metrics: managerMetrics,
  },
  {
    id: 'techlead',
    name: 'Tech Lead',
    title: 'Engineer',
    description: 'Technical deep dive and engineering metrics',
    icon: 'code',
    metrics: techLeadMetrics,
  },
];

// Summary metrics
export const summaryMetrics = {
  totalFeatures: features.length,
  avgCoverage: Math.round(features.reduce((sum, f) => sum + f.coverage, 0) / features.length * 10) / 10,
  automationRate: Math.round(features.filter(f => f.status === 'fully_automated').length / features.length * 100),
  fullyAutomated: features.filter(f => f.status === 'fully_automated').length,
  riskDistribution: {
    high: features.filter(f => f.riskScore >= 40).length,
    medium: features.filter(f => f.riskScore >= 20 && f.riskScore < 40).length,
    low: features.filter(f => f.riskScore < 20).length,
  },
  openDefects: features.reduce((sum, f) => sum + f.openDefects, 0),
};

// High risk features
export const highRiskFeatures = features
  .filter(f => f.riskScore >= 40)
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 3);

// AI Assistant responses
export const aiResponses: Record<string, string> = {
  'high-risk': `## High-Risk Features Requiring Attention

Based on current metrics, here are the features that need immediate focus:

${highRiskFeatures.map((f, i) => `${i + 1}. **${f.name}**
   - Coverage: ${f.coverage}%
   - Risk Score: ${f.riskScore}
   - Open Defects: ${f.openDefects}
   - Pass Rate: ${f.passRate}%`).join('\n\n')}

### Recommended Actions:
- Prioritize automation for partially automated features
- Address open defects before next release
- Schedule targeted regression testing for high-impact areas`,

  'feature-status': `## Feature Coverage Summary

**Overall Statistics:**
- Total Features: ${summaryMetrics.totalFeatures}
- Average Coverage: ${summaryMetrics.avgCoverage}%
- Fully Automated: ${summaryMetrics.fullyAutomated} features

**By Category:**
${categories.slice(0, 5).map(c => `- **${c.name}**: ${c.avgCoverage}% coverage (${c.features.length} features)`).join('\n')}

### Areas for Improvement:
- Focus on categories with < 90% coverage
- Review partially automated features for full automation potential`,

  'automation-gaps': `## Automation Coverage Opportunities

**Current State:**
- Automation Rate: ${summaryMetrics.automationRate}%
- Partially Automated: ${summaryMetrics.totalFeatures - summaryMetrics.fullyAutomated} features

**Top Opportunities:**
${features.filter(f => f.status === 'partially_automated').slice(0, 5).map(f => `- **${f.name}**: ${f.coverage}% coverage - ${100 - f.coverage}% gap`).join('\n')}

### Recommendations:
- Prioritize high-impact features for full automation
- Consider AI-assisted test generation for complex scenarios
- Target 95% automation coverage by end of quarter`,

  'quality-summary': `## Executive Quality Summary

**Key Performance Indicators:**
- Test Pass Rate: **${dailyMetrics[dailyMetrics.length - 1].passRate}%** (30-day avg)
- Automation Coverage: **${summaryMetrics.avgCoverage}%**
- Open Defects: **${summaryMetrics.openDefects}** across all features

**Risk Assessment:**
- High Risk: ${summaryMetrics.riskDistribution.high} features
- Medium Risk: ${summaryMetrics.riskDistribution.medium} features
- Low Risk: ${summaryMetrics.riskDistribution.low} features

**Trend Analysis:**
Quality metrics show positive momentum with consistent improvement in pass rates and reduced defect escape rate.

### Strategic Recommendations:
1. Continue investment in automation infrastructure
2. Address high-risk features before major releases
3. Implement proactive monitoring for production defects`,
};

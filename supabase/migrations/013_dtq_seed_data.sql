-- =====================================================
-- dTQ (Test Pilot IQ) - Seed Data
-- =====================================================
-- Populates the dTQ tables with realistic demo data
-- - 46 features across 10 categories
-- - 40 test runs with issues
-- - 30 days of metrics
-- - 3 personas with role-specific metrics
-- =====================================================

-- =====================================================
-- SEED FEATURES (46 total)
-- =====================================================

INSERT INTO dtq.features (id, name, category, coverage, status, open_defects, closed_defects, risk_score, pass_rate, impact_score) VALUES
-- Advanced / Enterprise (5 features)
('f0000001-0000-0000-0000-000000000001', 'xAPI / LRS Integration', 'Advanced / Enterprise', 92, 'fully_automated', 1, 5, 45, 94, 85),
('f0000001-0000-0000-0000-000000000002', 'Multi-Tenant Configuration', 'Advanced / Enterprise', 88, 'partially_automated', 2, 8, 32, 91, 92),
('f0000001-0000-0000-0000-000000000003', 'Advanced Compliance Tracking', 'Advanced / Enterprise', 95, 'fully_automated', 0, 4, 18, 97, 88),
('f0000001-0000-0000-0000-000000000004', 'Custom Branding Engine', 'Advanced / Enterprise', 78, 'partially_automated', 1, 6, 25, 89, 65),
('f0000001-0000-0000-0000-000000000005', 'Enterprise SSO', 'Advanced / Enterprise', 96, 'fully_automated', 0, 3, 12, 98, 95),

-- Learning Experience (4 features)
('f0000001-0000-0000-0000-000000000006', 'Adaptive Learning Paths', 'Learning Experience', 85, 'partially_automated', 3, 7, 38, 88, 90),
('f0000001-0000-0000-0000-000000000007', 'Personalized Recommendations', 'Learning Experience', 91, 'fully_automated', 1, 5, 22, 93, 82),
('f0000001-0000-0000-0000-000000000008', 'Skill Gap Analysis', 'Learning Experience', 87, 'partially_automated', 2, 9, 28, 90, 78),
('f0000001-0000-0000-0000-000000000009', 'Learning Goals Tracking', 'Learning Experience', 93, 'fully_automated', 0, 4, 15, 96, 75),

-- Reporting & Analytics (5 features)
('f0000001-0000-0000-0000-000000000010', 'Executive Dashboard', 'Reporting & Analytics', 94, 'fully_automated', 1, 6, 20, 95, 92),
('f0000001-0000-0000-0000-000000000011', 'Custom Report Builder', 'Reporting & Analytics', 82, 'partially_automated', 2, 8, 35, 87, 85),
('f0000001-0000-0000-0000-000000000012', 'Learning Analytics', 'Reporting & Analytics', 89, 'partially_automated', 1, 5, 42, 91, 88),
('f0000001-0000-0000-0000-000000000013', 'Compliance Reports', 'Reporting & Analytics', 97, 'fully_automated', 0, 3, 10, 99, 94),
('f0000001-0000-0000-0000-000000000014', 'Export Center', 'Reporting & Analytics', 90, 'fully_automated', 1, 4, 16, 94, 70),

-- Course Catalog & Enrollment (4 features)
('f0000001-0000-0000-0000-000000000015', 'Course Discovery', 'Course Catalog & Enrollment', 86, 'partially_automated', 2, 7, 30, 89, 85),
('f0000001-0000-0000-0000-000000000016', 'Self-Enrollment', 'Course Catalog & Enrollment', 95, 'fully_automated', 0, 5, 14, 97, 90),
('f0000001-0000-0000-0000-000000000017', 'Manager-Assigned Learning', 'Course Catalog & Enrollment', 88, 'partially_automated', 1, 6, 24, 92, 82),
('f0000001-0000-0000-0000-000000000018', 'Waitlist Management', 'Course Catalog & Enrollment', 79, 'partially_automated', 1, 4, 20, 86, 60),

-- Social & Collaboration (4 features)
('f0000001-0000-0000-0000-000000000019', 'Discussion Forums', 'Social & Collaboration', 83, 'partially_automated', 2, 8, 26, 88, 75),
('f0000001-0000-0000-0000-000000000020', 'Peer Reviews', 'Social & Collaboration', 91, 'fully_automated', 1, 5, 18, 93, 72),
('f0000001-0000-0000-0000-000000000021', 'Learning Groups', 'Social & Collaboration', 87, 'partially_automated', 1, 6, 22, 90, 68),
('f0000001-0000-0000-0000-000000000022', 'Social Sharing', 'Social & Collaboration', 76, 'partially_automated', 0, 3, 15, 85, 55),

-- Course Creation & Management (5 features)
('f0000001-0000-0000-0000-000000000023', 'SCORM Import', 'Course Creation & Management', 94, 'fully_automated', 1, 7, 19, 95, 88),
('f0000001-0000-0000-0000-000000000024', 'Content Authoring', 'Course Creation & Management', 81, 'partially_automated', 2, 9, 34, 86, 92),
('f0000001-0000-0000-0000-000000000025', 'Assessment Builder', 'Course Creation & Management', 89, 'partially_automated', 1, 5, 28, 91, 85),
('f0000001-0000-0000-0000-000000000026', 'Media Library', 'Course Creation & Management', 85, 'partially_automated', 1, 4, 21, 89, 78),
('f0000001-0000-0000-0000-000000000027', 'Course Versioning', 'Course Creation & Management', 92, 'fully_automated', 0, 6, 16, 94, 80),

-- Admin & Configuration (6 features)
('f0000001-0000-0000-0000-000000000028', 'User Management', 'Admin & Configuration', 96, 'fully_automated', 0, 4, 12, 98, 95),
('f0000001-0000-0000-0000-000000000029', 'Role-Based Access Control', 'Admin & Configuration', 93, 'fully_automated', 1, 5, 18, 96, 94),
('f0000001-0000-0000-0000-000000000030', 'Notification Settings', 'Admin & Configuration', 84, 'partially_automated', 1, 6, 22, 88, 65),
('f0000001-0000-0000-0000-000000000031', 'Integration Hub', 'Admin & Configuration', 78, 'partially_automated', 2, 8, 36, 85, 88),
('f0000001-0000-0000-0000-000000000032', 'Audit Logs', 'Admin & Configuration', 97, 'fully_automated', 0, 3, 10, 99, 90),
('f0000001-0000-0000-0000-000000000033', 'System Configuration', 'Admin & Configuration', 88, 'partially_automated', 1, 5, 24, 91, 85),

-- Assessments & Certification (4 features)
('f0000001-0000-0000-0000-000000000034', 'Quiz Engine', 'Assessments & Certification', 92, 'fully_automated', 1, 7, 20, 94, 88),
('f0000001-0000-0000-0000-000000000035', 'Certification Paths', 'Assessments & Certification', 90, 'fully_automated', 0, 5, 16, 93, 92),
('f0000001-0000-0000-0000-000000000036', 'Proctoring Support', 'Assessments & Certification', 75, 'partially_automated', 2, 4, 32, 84, 78),
('f0000001-0000-0000-0000-000000000037', 'Certificate Designer', 'Assessments & Certification', 86, 'partially_automated', 1, 6, 18, 90, 70),

-- Events & Live Sessions (4 features)
('f0000001-0000-0000-0000-000000000038', 'Webinar Integration', 'Events & Live Sessions', 82, 'partially_automated', 1, 5, 28, 87, 82),
('f0000001-0000-0000-0000-000000000039', 'ILT Scheduling', 'Events & Live Sessions', 89, 'partially_automated', 0, 7, 22, 92, 85),
('f0000001-0000-0000-0000-000000000040', 'Attendance Tracking', 'Events & Live Sessions', 94, 'fully_automated', 0, 4, 14, 96, 78),
('f0000001-0000-0000-0000-000000000041', 'Virtual Classroom', 'Events & Live Sessions', 77, 'partially_automated', 2, 6, 38, 85, 88),

-- Core User Journeys (5 features)
('f0000001-0000-0000-0000-000000000042', 'User Onboarding', 'Core User Journeys', 91, 'fully_automated', 1, 8, 24, 93, 95),
('f0000001-0000-0000-0000-000000000043', 'Course Completion Flow', 'Core User Journeys', 95, 'fully_automated', 0, 5, 12, 97, 98),
('f0000001-0000-0000-0000-000000000044', 'Profile Management', 'Core User Journeys', 88, 'partially_automated', 1, 4, 18, 91, 72),
('f0000001-0000-0000-0000-000000000045', 'Mobile Experience', 'Core User Journeys', 79, 'partially_automated', 3, 7, 42, 86, 90),
('f0000001-0000-0000-0000-000000000046', 'Search & Discovery', 'Core User Journeys', 84, 'partially_automated', 2, 6, 30, 88, 85);

-- =====================================================
-- SEED TEST RUNS (40 total with issues)
-- =====================================================

-- Recent runs (last 7 days)
INSERT INTO dtq.test_runs (id, feature_id, feature_name, executed_at, status, total_tests, passed_tests, failed_tests, duration, source) VALUES
('r0000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'xAPI / LRS Integration', '2026-02-02 14:30:00+00', 'failed', 24, 21, 3, 8, 'ci'),
('r0000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000002', 'Multi-Tenant Configuration', '2026-02-01 10:15:00+00', 'passed', 18, 18, 0, 6, 'ci'),
('r0000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000006', 'Adaptive Learning Paths', '2026-02-01 09:00:00+00', 'failed', 22, 19, 3, 9, 'ci'),
('r0000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000010', 'Executive Dashboard', '2026-01-31 16:45:00+00', 'passed', 15, 15, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000012', 'Learning Analytics', '2026-01-31 11:30:00+00', 'passed', 20, 20, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000006', 'f0000001-0000-0000-0000-000000000015', 'Course Discovery', '2026-01-30 15:00:00+00', 'failed', 16, 14, 2, 6, 'ci'),
('r0000001-0000-0000-0000-000000000007', 'f0000001-0000-0000-0000-000000000023', 'SCORM Import', '2026-01-30 08:20:00+00', 'passed', 12, 12, 0, 4, 'ci'),
('r0000001-0000-0000-0000-000000000008', 'f0000001-0000-0000-0000-000000000028', 'User Management', '2026-01-29 14:00:00+00', 'passed', 25, 25, 0, 8, 'ci'),
('r0000001-0000-0000-0000-000000000009', 'f0000001-0000-0000-0000-000000000034', 'Quiz Engine', '2026-01-29 09:30:00+00', 'passed', 30, 30, 0, 10, 'ci'),
('r0000001-0000-0000-0000-000000000010', 'f0000001-0000-0000-0000-000000000042', 'User Onboarding', '2026-01-28 17:15:00+00', 'passed', 18, 18, 0, 6, 'ci'),

-- Week 2
('r0000001-0000-0000-0000-000000000011', 'f0000001-0000-0000-0000-000000000045', 'Mobile Experience', '2026-01-28 11:00:00+00', 'failed', 22, 18, 4, 8, 'ci'),
('r0000001-0000-0000-0000-000000000012', 'f0000001-0000-0000-0000-000000000003', 'Advanced Compliance Tracking', '2026-01-27 14:30:00+00', 'passed', 14, 14, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000013', 'f0000001-0000-0000-0000-000000000007', 'Personalized Recommendations', '2026-01-27 09:00:00+00', 'passed', 16, 16, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000014', 'f0000001-0000-0000-0000-000000000019', 'Discussion Forums', '2026-01-26 16:00:00+00', 'passed', 20, 20, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000015', 'f0000001-0000-0000-0000-000000000031', 'Integration Hub', '2026-01-26 10:30:00+00', 'failed', 18, 15, 3, 7, 'ci'),
('r0000001-0000-0000-0000-000000000016', 'f0000001-0000-0000-0000-000000000005', 'Enterprise SSO', '2026-01-25 15:45:00+00', 'passed', 20, 20, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000017', 'f0000001-0000-0000-0000-000000000008', 'Skill Gap Analysis', '2026-01-25 08:15:00+00', 'passed', 18, 18, 0, 6, 'ci'),
('r0000001-0000-0000-0000-000000000018', 'f0000001-0000-0000-0000-000000000013', 'Compliance Reports', '2026-01-24 14:00:00+00', 'passed', 15, 15, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000019', 'f0000001-0000-0000-0000-000000000016', 'Self-Enrollment', '2026-01-24 09:30:00+00', 'passed', 22, 22, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000020', 'f0000001-0000-0000-0000-000000000020', 'Peer Reviews', '2026-01-23 17:00:00+00', 'passed', 14, 14, 0, 5, 'ci'),

-- Week 3
('r0000001-0000-0000-0000-000000000021', 'f0000001-0000-0000-0000-000000000024', 'Content Authoring', '2026-01-23 11:30:00+00', 'failed', 28, 24, 4, 9, 'ci'),
('r0000001-0000-0000-0000-000000000022', 'f0000001-0000-0000-0000-000000000027', 'Course Versioning', '2026-01-22 15:00:00+00', 'passed', 16, 16, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000023', 'f0000001-0000-0000-0000-000000000029', 'Role-Based Access Control', '2026-01-22 09:15:00+00', 'passed', 24, 24, 0, 8, 'ci'),
('r0000001-0000-0000-0000-000000000024', 'f0000001-0000-0000-0000-000000000032', 'Audit Logs', '2026-01-21 16:30:00+00', 'passed', 12, 12, 0, 4, 'ci'),
('r0000001-0000-0000-0000-000000000025', 'f0000001-0000-0000-0000-000000000035', 'Certification Paths', '2026-01-21 10:00:00+00', 'passed', 20, 20, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000026', 'f0000001-0000-0000-0000-000000000038', 'Webinar Integration', '2026-01-20 14:45:00+00', 'failed', 18, 15, 3, 6, 'ci'),
('r0000001-0000-0000-0000-000000000027', 'f0000001-0000-0000-0000-000000000040', 'Attendance Tracking', '2026-01-20 08:30:00+00', 'passed', 15, 15, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000028', 'f0000001-0000-0000-0000-000000000043', 'Course Completion Flow', '2026-01-19 15:15:00+00', 'passed', 22, 22, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000029', 'f0000001-0000-0000-0000-000000000046', 'Search & Discovery', '2026-01-19 09:45:00+00', 'passed', 18, 18, 0, 6, 'ci'),
('r0000001-0000-0000-0000-000000000030', 'f0000001-0000-0000-0000-000000000004', 'Custom Branding Engine', '2026-01-18 16:00:00+00', 'passed', 14, 14, 0, 5, 'ci'),

-- Week 4
('r0000001-0000-0000-0000-000000000031', 'f0000001-0000-0000-0000-000000000009', 'Learning Goals Tracking', '2026-01-18 10:30:00+00', 'passed', 16, 16, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000032', 'f0000001-0000-0000-0000-000000000011', 'Custom Report Builder', '2026-01-17 14:15:00+00', 'failed', 20, 17, 3, 7, 'ci'),
('r0000001-0000-0000-0000-000000000033', 'f0000001-0000-0000-0000-000000000014', 'Export Center', '2026-01-17 08:00:00+00', 'passed', 12, 12, 0, 4, 'ci'),
('r0000001-0000-0000-0000-000000000034', 'f0000001-0000-0000-0000-000000000017', 'Manager-Assigned Learning', '2026-01-16 15:30:00+00', 'passed', 18, 18, 0, 6, 'ci'),
('r0000001-0000-0000-0000-000000000035', 'f0000001-0000-0000-0000-000000000021', 'Learning Groups', '2026-01-16 09:00:00+00', 'passed', 14, 14, 0, 5, 'ci'),
('r0000001-0000-0000-0000-000000000036', 'f0000001-0000-0000-0000-000000000025', 'Assessment Builder', '2026-01-15 16:45:00+00', 'passed', 22, 22, 0, 7, 'ci'),
('r0000001-0000-0000-0000-000000000037', 'f0000001-0000-0000-0000-000000000030', 'Notification Settings', '2026-01-15 10:15:00+00', 'passed', 10, 10, 0, 3, 'ci'),
('r0000001-0000-0000-0000-000000000038', 'f0000001-0000-0000-0000-000000000036', 'Proctoring Support', '2026-01-14 14:30:00+00', 'failed', 16, 13, 3, 6, 'ci'),
('r0000001-0000-0000-0000-000000000039', 'f0000001-0000-0000-0000-000000000039', 'ILT Scheduling', '2026-01-14 08:45:00+00', 'passed', 18, 18, 0, 6, 'ci'),
('r0000001-0000-0000-0000-000000000040', 'f0000001-0000-0000-0000-000000000041', 'Virtual Classroom', '2026-01-13 15:00:00+00', 'failed', 20, 16, 4, 8, 'ci');

-- =====================================================
-- SEED TEST ISSUES (for failed runs)
-- =====================================================

INSERT INTO dtq.test_issues (test_run_id, test_case_name, severity, error_message, stack_trace) VALUES
-- Run 1: xAPI / LRS Integration
('r0000001-0000-0000-0000-000000000001', 'Test Case 1 - xAPI Statement Send', 'high', 'Expected element to be visible but timed out after 30000ms', 'Error: Timeout waiting for element\n    at waitForSelector (/tests/xapi-lrs.spec.ts:45:12)\n    at Object.<anonymous> (/tests/xapi-lrs.spec.ts:52:5)'),
('r0000001-0000-0000-0000-000000000001', 'Test Case 2 - LRS Query', 'medium', 'LRS endpoint returned 503', 'Error: Service Unavailable\n    at fetchLRS (/tests/xapi-lrs.spec.ts:78:8)'),
('r0000001-0000-0000-0000-000000000001', 'Test Case 3 - Statement Validation', 'low', 'Invalid statement format', 'ValidationError: Missing actor field\n    at validate (/tests/xapi-lrs.spec.ts:92:12)'),

-- Run 3: Adaptive Learning Paths
('r0000001-0000-0000-0000-000000000003', 'Test Case 2 - Path Recommendation', 'medium', 'Assertion failed: expected 5 to equal 4', 'AssertionError: expected 5 to equal 4\n    at Context.<anonymous> (/tests/adaptive-learning.spec.ts:78:14)'),
('r0000001-0000-0000-0000-000000000003', 'Test Case 4 - Progress Calculation', 'medium', 'Progress not updating correctly', 'Error: Stale data\n    at updateProgress (/tests/adaptive-learning.spec.ts:112:8)'),
('r0000001-0000-0000-0000-000000000003', 'Test Case 5 - Skill Assessment', 'low', 'Skill level mismatch', 'Error: Expected intermediate, got beginner\n    at assessSkill (/tests/adaptive-learning.spec.ts:145:10)'),

-- Run 6: Course Discovery
('r0000001-0000-0000-0000-000000000006', 'Test Case 1 - Search Functionality', 'high', 'Network request failed: GET /api/search returned 500', 'NetworkError: Request failed\n    at fetchSearch (/tests/course-discovery.spec.ts:33:8)'),
('r0000001-0000-0000-0000-000000000006', 'Test Case 3 - Filter Application', 'medium', 'Filters not applying correctly', 'Error: Filter state mismatch\n    at applyFilters (/tests/course-discovery.spec.ts:67:12)'),

-- Run 11: Mobile Experience
('r0000001-0000-0000-0000-000000000011', 'Test Case 3 - Responsive Layout', 'medium', 'Element not clickable at point (320, 480)', 'ElementClickInterceptedError: Element not clickable\n    at click (/tests/mobile.spec.ts:92:10)'),
('r0000001-0000-0000-0000-000000000011', 'Test Case 5 - Touch Gestures', 'medium', 'Swipe not recognized', 'Error: Gesture failed\n    at swipe (/tests/mobile.spec.ts:128:8)'),
('r0000001-0000-0000-0000-000000000011', 'Test Case 6 - Orientation Change', 'low', 'Layout broken after rotation', 'Error: Element overflow\n    at rotate (/tests/mobile.spec.ts:156:12)'),
('r0000001-0000-0000-0000-000000000011', 'Test Case 8 - Offline Mode', 'high', 'Content not cached', 'Error: Network required\n    at checkCache (/tests/mobile.spec.ts:198:6)'),

-- Run 15: Integration Hub
('r0000001-0000-0000-0000-000000000015', 'Test Case 2 - OAuth Flow', 'high', 'OAuth callback URL mismatch', 'OAuthError: Callback URL mismatch\n    at verifyCallback (/tests/integration-hub.spec.ts:67:8)'),
('r0000001-0000-0000-0000-000000000015', 'Test Case 4 - Token Refresh', 'medium', 'Token refresh failed', 'Error: Invalid refresh token\n    at refreshToken (/tests/integration-hub.spec.ts:98:10)'),
('r0000001-0000-0000-0000-000000000015', 'Test Case 5 - Connection Test', 'medium', 'Connection timeout', 'TimeoutError: Connection timed out\n    at testConnection (/tests/integration-hub.spec.ts:122:8)'),

-- Run 21: Content Authoring
('r0000001-0000-0000-0000-000000000021', 'Test Case 4 - Rich Text Editor', 'medium', 'Editor failed to initialize', 'EditorError: Failed to mount\n    at initEditor (/tests/content-authoring.spec.ts:45:8)'),
('r0000001-0000-0000-0000-000000000021', 'Test Case 6 - Media Upload', 'high', 'Upload failed: file too large', 'Error: File size exceeds limit\n    at upload (/tests/content-authoring.spec.ts:89:12)'),
('r0000001-0000-0000-0000-000000000021', 'Test Case 7 - Auto-Save', 'medium', 'Auto-save not triggering', 'Error: Save interval not firing\n    at autoSave (/tests/content-authoring.spec.ts:112:8)'),
('r0000001-0000-0000-0000-000000000021', 'Test Case 9 - Preview Mode', 'low', 'Preview not rendering', 'Error: Template error\n    at renderPreview (/tests/content-authoring.spec.ts:145:10)'),

-- Run 26: Webinar Integration
('r0000001-0000-0000-0000-000000000026', 'Test Case 1 - Zoom Integration', 'high', 'API authentication failed', 'AuthError: Invalid API key\n    at authenticateZoom (/tests/webinar.spec.ts:28:12)'),
('r0000001-0000-0000-0000-000000000026', 'Test Case 3 - Meeting Creation', 'medium', 'Meeting creation failed', 'Error: Rate limit exceeded\n    at createMeeting (/tests/webinar.spec.ts:56:8)'),
('r0000001-0000-0000-0000-000000000026', 'Test Case 4 - Recording Access', 'medium', 'Recording not accessible', 'Error: Permission denied\n    at fetchRecording (/tests/webinar.spec.ts:78:10)'),

-- Run 32: Custom Report Builder
('r0000001-0000-0000-0000-000000000032', 'Test Case 2 - Export Function', 'medium', 'PDF generation timeout', 'TimeoutError: PDF generation exceeded 30s\n    at generatePDF (/tests/report-builder.spec.ts:62:10)'),
('r0000001-0000-0000-0000-000000000032', 'Test Case 5 - Chart Rendering', 'low', 'Chart not rendering correctly', 'RenderError: Canvas context lost\n    at renderChart (/tests/report-builder.spec.ts:98:8)'),
('r0000001-0000-0000-0000-000000000032', 'Test Case 6 - Data Aggregation', 'medium', 'Aggregation mismatch', 'Error: Sum does not match\n    at aggregate (/tests/report-builder.spec.ts:124:12)'),

-- Run 38: Proctoring Support
('r0000001-0000-0000-0000-000000000038', 'Test Case 1 - Camera Access', 'high', 'Camera permission denied', 'PermissionError: Camera access denied\n    at requestCamera (/tests/proctoring.spec.ts:34:8)'),
('r0000001-0000-0000-0000-000000000038', 'Test Case 3 - Screen Recording', 'medium', 'Screen capture failed', 'Error: getDisplayMedia not supported\n    at startCapture (/tests/proctoring.spec.ts:67:10)'),
('r0000001-0000-0000-0000-000000000038', 'Test Case 4 - Identity Verification', 'high', 'Face not detected', 'Error: No face in frame\n    at verifyIdentity (/tests/proctoring.spec.ts:89:12)'),

-- Run 40: Virtual Classroom
('r0000001-0000-0000-0000-000000000040', 'Test Case 3 - Screen Sharing', 'medium', 'Screen share failed to initialize', 'MediaError: getDisplayMedia not supported\n    at startScreenShare (/tests/virtual-classroom.spec.ts:78:12)'),
('r0000001-0000-0000-0000-000000000040', 'Test Case 5 - Whiteboard', 'low', 'Drawing tools not working', 'Error: Canvas not initialized\n    at initWhiteboard (/tests/virtual-classroom.spec.ts:112:8)'),
('r0000001-0000-0000-0000-000000000040', 'Test Case 7 - Breakout Rooms', 'medium', 'Room assignment failed', 'Error: User not found\n    at assignRoom (/tests/virtual-classroom.spec.ts:145:10)'),
('r0000001-0000-0000-0000-000000000040', 'Test Case 8 - Polls', 'high', 'Poll results not saving', 'Error: Database write failed\n    at savePoll (/tests/virtual-classroom.spec.ts:178:8)');

-- =====================================================
-- SEED DAILY METRICS (30 days)
-- =====================================================

INSERT INTO dtq.daily_metrics (date, pass_rate, first_run_pass_rate, defect_detection, effectiveness, automation_coverage) VALUES
('2026-01-05', 91, 85, 82, 88, 89),
('2026-01-06', 93, 87, 84, 90, 89),
('2026-01-07', 92, 86, 83, 89, 90),
('2026-01-08', 94, 88, 85, 91, 90),
('2026-01-09', 93, 87, 84, 90, 90),
('2026-01-10', 95, 89, 86, 92, 91),
('2026-01-11', 94, 88, 85, 91, 91),
('2026-01-12', 92, 86, 83, 89, 91),
('2026-01-13', 93, 87, 84, 90, 91),
('2026-01-14', 95, 90, 87, 93, 92),
('2026-01-15', 96, 91, 88, 94, 92),
('2026-01-16', 94, 89, 86, 92, 92),
('2026-01-17', 93, 88, 85, 91, 92),
('2026-01-18', 95, 90, 87, 93, 92),
('2026-01-19', 94, 89, 86, 92, 93),
('2026-01-20', 96, 91, 88, 94, 93),
('2026-01-21', 95, 90, 87, 93, 93),
('2026-01-22', 93, 88, 85, 91, 93),
('2026-01-23', 94, 89, 86, 92, 93),
('2026-01-24', 96, 91, 88, 94, 93),
('2026-01-25', 95, 90, 87, 93, 94),
('2026-01-26', 94, 89, 86, 92, 94),
('2026-01-27', 96, 92, 89, 95, 94),
('2026-01-28', 95, 91, 88, 94, 94),
('2026-01-29', 97, 93, 90, 96, 94),
('2026-01-30', 94, 90, 87, 93, 94),
('2026-01-31', 96, 92, 89, 95, 95),
('2026-02-01', 95, 91, 88, 94, 95),
('2026-02-02', 97, 93, 90, 96, 95),
('2026-02-03', 96, 92, 89, 95, 95);

-- =====================================================
-- SEED PERSONAS (3 types with metrics)
-- =====================================================

INSERT INTO dtq.personas (id, type, name, title, description, icon) VALUES
('p0000001-0000-0000-0000-000000000001', 'csuite', 'C-Suite', 'Executive', 'Strategic business metrics and ROI insights', 'crown'),
('p0000001-0000-0000-0000-000000000002', 'manager', 'QA Manager', 'Manager', 'Team performance and operational effectiveness', 'users'),
('p0000001-0000-0000-0000-000000000003', 'techlead', 'Tech Lead', 'Engineer', 'Technical deep dive and engineering metrics', 'code');

-- C-Suite Metrics (7)
INSERT INTO dtq.persona_metrics (persona_id, key, label, value, unit, description, trend, trend_value, sort_order) VALUES
('p0000001-0000-0000-0000-000000000001', 'releaseVelocity', 'Release Velocity', '+35', '%', 'More releases per quarter', 'up', '+8%', 1),
('p0000001-0000-0000-0000-000000000001', 'timeToMarket', 'Mean Time to Market', '12', 'days', 'For new features', 'down', '-4 days', 2),
('p0000001-0000-0000-0000-000000000001', 'automationROI', 'Automation ROI', '285', '%', 'Cost savings', 'up', '+45%', 3),
('p0000001-0000-0000-0000-000000000001', 'escapeRate', 'Defect Escape Rate', '2.1', '%', 'Bugs reaching production', 'down', '-0.8%', 4),
('p0000001-0000-0000-0000-000000000001', 'incidentsPrevented', 'Incidents Prevented', '47', 'count', 'Customer-impacting', 'up', '+12', 5),
('p0000001-0000-0000-0000-000000000001', 'riskReduction', 'Risk Reduction', '68', '%', 'Business impact weighted', 'up', '+15%', 6),
('p0000001-0000-0000-0000-000000000001', 'capacityUnlocked', 'Capacity Unlocked', '42', '%', 'QA time to innovation', 'up', '+8%', 7);

-- QA Manager Metrics (9)
INSERT INTO dtq.persona_metrics (persona_id, key, label, value, unit, description, trend, trend_value, sort_order) VALUES
('p0000001-0000-0000-0000-000000000002', 'passRate', 'Test Pass Rate', '94.2', '%', 'Last 30 days average', 'up', '+2.3%', 1),
('p0000001-0000-0000-0000-000000000002', 'autoManualRatio', 'Automated vs Manual', '8.5:1', 'ratio', 'Test efficiency ratio', 'up', '+0.5', 2),
('p0000001-0000-0000-0000-000000000002', 'effectiveness', 'Test Case Effectiveness', '0.87', 'score', 'Defects found per test', 'stable', '0.0', 3),
('p0000001-0000-0000-0000-000000000002', 'regressionTime', 'Regression Execution', '42', 'min', 'Full suite duration', 'down', '-8 min', 4),
('p0000001-0000-0000-0000-000000000002', 'firstRunPass', 'First-Run Pass Rate', '87.5', '%', 'New features pass rate', 'up', '+4.2%', 5),
('p0000001-0000-0000-0000-000000000002', 'escalationRate', 'Escalation Rate', '12.3', '%', 'Auto to manual review', 'down', '-2.1%', 6),
('p0000001-0000-0000-0000-000000000002', 'testReuse', 'Test Case Reuse', '76.8', '%', 'Across releases', 'up', '+5.3%', 7),
('p0000001-0000-0000-0000-000000000002', 'blockerDefects', 'Blocker Defects', '3', 'count', 'Critical issues', 'down', '-2', 8),
('p0000001-0000-0000-0000-000000000002', 'envUptime', 'Environment Uptime', '99.2', '%', 'Test env stability', 'stable', '0.0%', 9);

-- Tech Lead Metrics (8)
INSERT INTO dtq.persona_metrics (persona_id, key, label, value, unit, description, trend, trend_value, sort_order) VALUES
('p0000001-0000-0000-0000-000000000003', 'flakyRate', 'Flaky Test Rate', '3.2', '%', 'Test stability', 'down', '-1.5%', 1),
('p0000001-0000-0000-0000-000000000003', 'avgExecution', 'Avg Execution Time', '4.2', 'min', 'Per test suite', 'down', '-0.8 min', 2),
('p0000001-0000-0000-0000-000000000003', 'tokenCost', 'Token Usage Cost', '0.42', '$', 'Per agentic run', 'down', '-$0.15', 3),
('p0000001-0000-0000-0000-000000000003', 'contextHitRate', 'Context Hit Rate', '94.5', '%', 'Relevance score', 'up', '+2.3%', 4),
('p0000001-0000-0000-0000-000000000003', 'toolCallSuccess', 'Tool Call Success', '97.8', '%', 'Click/type accuracy', 'up', '+1.2%', 5),
('p0000001-0000-0000-0000-000000000003', 'parallelEfficiency', 'Parallel Efficiency', '78.5', '%', 'Speed-up vs theoretical', 'up', '+5%', 6),
('p0000001-0000-0000-0000-000000000003', 'automationCoverage', 'Automation Coverage', '93.3', '%', 'Code + requirements', 'up', '+2.1%', 7),
('p0000001-0000-0000-0000-000000000003', 'totalTests', 'Total Test Cases', '1247', 'count', 'Active tests', 'up', '+86', 8);

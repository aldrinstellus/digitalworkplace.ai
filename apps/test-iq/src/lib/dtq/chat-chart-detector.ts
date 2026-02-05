export interface DetectedChart {
  metricKey: 'passRate' | 'automationCoverage' | 'defectDetection' | 'effectiveness' | 'firstRunPassRate';
  label: string;
  color: string;
}

const patterns: { regex: RegExp; chart: DetectedChart }[] = [
  {
    regex: /pass\s*rate|test\s*pass/i,
    chart: { metricKey: 'passRate', label: 'Pass Rate', color: '#34d399' },
  },
  {
    regex: /coverage|automation/i,
    chart: { metricKey: 'automationCoverage', label: 'Automation Coverage', color: '#22d3ee' },
  },
  {
    regex: /defect\s*detect/i,
    chart: { metricKey: 'defectDetection', label: 'Defect Detection', color: '#fbbf24' },
  },
  {
    regex: /effectiveness/i,
    chart: { metricKey: 'effectiveness', label: 'Effectiveness', color: '#a78bfa' },
  },
  {
    regex: /first\s*(run|pass)/i,
    chart: { metricKey: 'firstRunPassRate', label: 'First Run Pass Rate', color: '#ff3366' },
  },
];

export function detectCharts(content: string): DetectedChart[] {
  const detected: DetectedChart[] = [];
  const seen = new Set<string>();

  for (const { regex, chart } of patterns) {
    if (regex.test(content) && !seen.has(chart.metricKey)) {
      seen.add(chart.metricKey);
      detected.push(chart);
      if (detected.length >= 2) break; // Max 2 charts per message
    }
  }

  return detected;
}

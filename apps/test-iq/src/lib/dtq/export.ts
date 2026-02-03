import { TestRun, Feature, DailyMetric } from './types';

// CSV Export functionality
export function exportTestRunsToCSV(testRuns: TestRun[]): void {
  const headers = ['ID', 'Feature', 'Status', 'Total Tests', 'Passed', 'Failed', 'Duration (s)', 'Executed At'];

  const rows = testRuns.map(run => [
    run.id,
    run.featureName,
    run.status,
    run.totalTests.toString(),
    run.passedTests.toString(),
    run.failedTests.toString(),
    run.duration.toString(),
    new Date(run.executedAt).toISOString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `test-reports-${formatDate(new Date())}.csv`, 'text/csv');
}

export function exportFeaturesToCSV(features: Feature[]): void {
  const headers = ['ID', 'Name', 'Category', 'Coverage %', 'Status', 'Open Defects', 'Closed Defects', 'Risk Score', 'Pass Rate %', 'Impact Score'];

  const rows = features.map(f => [
    f.id,
    f.name,
    f.category,
    f.coverage.toString(),
    f.status,
    f.openDefects.toString(),
    f.closedDefects.toString(),
    f.riskScore.toString(),
    f.passRate.toString(),
    f.impactScore.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `features-${formatDate(new Date())}.csv`, 'text/csv');
}

export function exportMetricsToCSV(metrics: DailyMetric[]): void {
  const headers = ['Date', 'Pass Rate %', 'First Run Pass Rate %', 'Defect Detection %', 'Effectiveness %', 'Automation Coverage %'];

  const rows = metrics.map(m => [
    m.date,
    m.passRate.toString(),
    m.firstRunPassRate.toString(),
    m.defectDetection.toString(),
    m.effectiveness.toString(),
    m.automationCoverage.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `metrics-${formatDate(new Date())}.csv`, 'text/csv');
}

// PDF Export functionality
export async function exportTestRunsToPDF(testRuns: TestRun[]): Promise<void> {
  // Create PDF content
  const totalRuns = testRuns.length;
  const passed = testRuns.filter(r => r.status === 'passed').length;
  const failed = testRuns.filter(r => r.status === 'failed').length;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Reports - Test IQ</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #ff3366; border-bottom: 2px solid #ff3366; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .summary { display: flex; gap: 40px; margin: 20px 0; }
        .stat { text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; min-width: 120px; }
        .stat-value { font-size: 32px; font-weight: bold; color: #333; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge-passed { background: #d1fae5; color: #065f46; }
        .badge-failed { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <h1>Test IQ - Test Reports</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>

      <div class="summary">
        <div class="stat">
          <div class="stat-value">${totalRuns}</div>
          <div class="stat-label">Total Runs</div>
        </div>
        <div class="stat">
          <div class="stat-value passed">${passed}</div>
          <div class="stat-label">Passed</div>
        </div>
        <div class="stat">
          <div class="stat-value failed">${failed}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat">
          <div class="stat-value">${Math.round((passed / totalRuns) * 100)}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
      </div>

      <h2>Test Execution History</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Status</th>
            <th>Tests</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Duration</th>
            <th>Executed</th>
          </tr>
        </thead>
        <tbody>
          ${testRuns.slice(0, 25).map(run => `
            <tr>
              <td>${run.featureName}</td>
              <td><span class="badge badge-${run.status}">${run.status}</span></td>
              <td>${run.totalTests}</td>
              <td>${run.passedTests}</td>
              <td>${run.failedTests}</td>
              <td>${run.duration}s</td>
              <td>${new Date(run.executedAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Test IQ - AI-Powered Testing Intelligence | Digital Workplace AI</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog (browser will handle PDF generation)
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

// Helper functions
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

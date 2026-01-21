"use client";

import { useState } from "react";
import {
  Table,
  BarChart2,
  FileText,
  Code,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  List,
  Grid3X3,
} from "lucide-react";

type OutputFormat = "table" | "list" | "summary" | "json" | "markdown";

interface StructuredOutputProps {
  data: any;
  title?: string;
  format?: OutputFormat;
  showFormatSelector?: boolean;
  onExport?: (format: "csv" | "json" | "md") => void;
}

interface TableData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
}

interface SummaryData {
  title: string;
  summary: string;
  keyPoints?: string[];
  metadata?: Record<string, string | number>;
}

// Convert any data to table format
function toTableData(data: any): TableData {
  if (Array.isArray(data)) {
    if (data.length === 0) return { headers: [], rows: [] };

    const sample = data[0];
    if (typeof sample === "object" && sample !== null) {
      const headers = Object.keys(sample);
      const rows = data.map((item) =>
        headers.map((h) => {
          const val = item[h];
          if (val === null || val === undefined) return "";
          if (typeof val === "object") return JSON.stringify(val);
          return val;
        })
      );
      return { headers, rows };
    }
    return { headers: ["Value"], rows: data.map((v) => [v]) };
  }

  if (typeof data === "object" && data !== null) {
    const headers = ["Property", "Value"];
    const rows = Object.entries(data).map(([key, val]) => [
      key,
      val === null || val === undefined
        ? ""
        : typeof val === "object"
        ? JSON.stringify(val)
        : val,
    ]);
    return { headers, rows: rows as any };
  }

  return { headers: ["Value"], rows: [[String(data)]] };
}

// Render table view
function TableView({ data }: { data: TableData }) {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const sortedRows = sortColumn !== null
    ? [...data.rows].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === "") return 1;
        if (bVal === null || bVal === "") return -1;
        const result = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortAsc ? result : -result;
      })
    : data.rows;

  const handleSort = (colIndex: number) => {
    if (sortColumn === colIndex) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(colIndex);
      setSortAsc(true);
    }
  };

  if (data.headers.length === 0) {
    return <p className="text-white/40 text-sm">No data available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {data.headers.map((header, i) => (
              <th
                key={i}
                onClick={() => handleSort(i)}
                className="text-left px-4 py-3 text-white/70 font-medium cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {header}
                  {sortColumn === i && (
                    sortAsc ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-white/5 hover:bg-white/5"
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-white/80">
                  {typeof cell === "boolean" ? (
                    cell ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <span className="text-white/30">-</span>
                    )
                  ) : (
                    String(cell || "-")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Render list view
function ListView({ data }: { data: any }) {
  const items = Array.isArray(data) ? data : Object.entries(data).map(([k, v]) => ({ key: k, value: v }));

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
        >
          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            {typeof item === "object" && item !== null ? (
              <div>
                {Object.entries(item).map(([key, val]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-white/50 text-sm">{key}:</span>
                    <span className="text-white text-sm">
                      {typeof val === "object"
                        ? JSON.stringify(val)
                        : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-white">{String(item)}</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Render summary view
function SummaryView({ data }: { data: SummaryData | any }) {
  const summary =
    typeof data === "object" && data !== null && "summary" in data
      ? data
      : { summary: typeof data === "string" ? data : JSON.stringify(data) };

  return (
    <div className="space-y-4">
      {summary.title && (
        <h4 className="text-lg font-medium text-white">{summary.title}</h4>
      )}
      <p className="text-white/80 leading-relaxed">{summary.summary}</p>
      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-white/60 mb-2">Key Points</h5>
          <ul className="space-y-2">
            {summary.keyPoints.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-white/70">
                <span className="text-green-400 mt-1">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
      {summary.metadata && Object.keys(summary.metadata).length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(summary.metadata).map(([key, val]) => (
              <div key={key}>
                <span className="text-xs text-white/40">{key}</span>
                <p className="text-white font-medium">{String(val)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Render JSON view
function JsonView({ data }: { data: any }) {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="p-4 rounded-lg bg-[#1a1a1f] text-sm text-green-400/80 overflow-x-auto font-mono">
        {jsonString}
      </pre>
    </div>
  );
}

// Render markdown view
function MarkdownView({ data }: { data: any }) {
  let markdown: string;

  if (typeof data === "string") {
    markdown = data;
  } else if (Array.isArray(data)) {
    const tableData = toTableData(data);
    const headerRow = `| ${tableData.headers.join(" | ")} |`;
    const separatorRow = `| ${tableData.headers.map(() => "---").join(" | ")} |`;
    const dataRows = tableData.rows
      .map((row) => `| ${row.map((c) => String(c || "")).join(" | ")} |`)
      .join("\n");
    markdown = `${headerRow}\n${separatorRow}\n${dataRows}`;
  } else {
    markdown = Object.entries(data)
      .map(([key, val]) => `**${key}:** ${val}`)
      .join("\n\n");
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <pre className="whitespace-pre-wrap text-white/80 font-sans">
        {markdown}
      </pre>
    </div>
  );
}

// Format selector icons
const FORMAT_OPTIONS: {
  value: OutputFormat;
  label: string;
  icon: typeof Table;
}[] = [
  { value: "table", label: "Table", icon: Grid3X3 },
  { value: "list", label: "List", icon: List },
  { value: "summary", label: "Summary", icon: FileText },
  { value: "json", label: "JSON", icon: Code },
  { value: "markdown", label: "Markdown", icon: BarChart2 },
];

export function StructuredOutput({
  data,
  title,
  format: initialFormat = "table",
  showFormatSelector = true,
  onExport,
}: StructuredOutputProps) {
  const [format, setFormat] = useState<OutputFormat>(initialFormat);
  const [expanded, setExpanded] = useState(true);

  const handleExport = (exportFormat: "csv" | "json" | "md") => {
    if (onExport) {
      onExport(exportFormat);
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    switch (exportFormat) {
      case "csv":
        const tableData = toTableData(data);
        content = [
          tableData.headers.join(","),
          ...tableData.rows.map((row) =>
            row.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");
        filename = "output.csv";
        mimeType = "text/csv";
        break;
      case "json":
        content = JSON.stringify(data, null, 2);
        filename = "output.json";
        mimeType = "application/json";
        break;
      case "md":
        const md = toTableData(data);
        const header = `| ${md.headers.join(" | ")} |`;
        const sep = `| ${md.headers.map(() => "---").join(" | ")} |`;
        const rows = md.rows
          .map((r) => `| ${r.map((c) => String(c || "")).join(" | ")} |`)
          .join("\n");
        content = `${header}\n${sep}\n${rows}`;
        filename = "output.md";
        mimeType = "text/markdown";
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (format) {
      case "table":
        return <TableView data={toTableData(data)} />;
      case "list":
        return <ListView data={data} />;
      case "summary":
        return <SummaryView data={data} />;
      case "json":
        return <JsonView data={data} />;
      case "markdown":
        return <MarkdownView data={data} />;
      default:
        return <JsonView data={data} />;
    }
  };

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Table className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">{title || "Output"}</h3>
            <p className="text-xs text-white/50">
              {Array.isArray(data) ? `${data.length} items` : "Structured data"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </div>
      </div>

      {expanded && (
        <>
          {/* Toolbar */}
          {showFormatSelector && (
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
              {/* Format Selector */}
              <div className="flex items-center gap-1">
                {FORMAT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormat(option.value);
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      format === option.value
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <option.icon className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Export Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport("csv");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport("json");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport("md");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  MD
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4">{renderContent()}</div>
        </>
      )}
    </div>
  );
}

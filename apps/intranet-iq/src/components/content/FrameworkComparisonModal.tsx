"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Scale,
  X,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Target,
  Wrench,
  Users,
  Check,
  Code,
  Zap,
  GitBranch,
  Layers,
  Box,
} from "lucide-react";

// Framework type definition (must match the one in page.tsx)
interface Framework {
  id: string;
  name: string;
  description: string;
  icon: "code" | "zap" | "gitbranch" | "layers" | "box";
  color: string;
  articleCount: number;
  tags: string[];
  status: "active" | "deprecated" | "experimental";
  version?: string;
  docsUrl?: string;
  assignedClients?: string[];
}

// Framework icon mapping
const frameworkIcons = {
  code: Code,
  zap: Zap,
  gitbranch: GitBranch,
  layers: Layers,
  box: Box,
};

// Mock comparison data for demo purposes
interface FrameworkComparison {
  techStack: { a: string; b: string };
  useCases: { a: string[]; b: string[] };
  pros: { a: string[]; b: string[] };
  cons: { a: string[]; b: string[] };
  bestFor: { a: string; b: string };
  aiSummary: string;
}

const generateMockComparison = (frameworkA: Framework, frameworkB: Framework): FrameworkComparison => {
  const comparisonData: Record<string, { techStack: string; useCases: string[]; pros: string[]; cons: string[]; bestFor: string }> = {
    "react-patterns": {
      techStack: "React 18+, TypeScript, State Management (Zustand/Redux)",
      useCases: ["Complex UI components", "Reusable design systems", "Large-scale SPAs"],
      pros: ["Component reusability", "Strong typing support", "Large ecosystem"],
      cons: ["Learning curve for patterns", "Overhead for small projects", "Bundle size concerns"],
      bestFor: "Frontend-heavy applications requiring scalable component architecture",
    },
    "api-design": {
      techStack: "Node.js, Express/Fastify, OpenAPI 3.0, JSON Schema",
      useCases: ["Public APIs", "Microservice communication", "Mobile backends"],
      pros: ["Industry standard", "Wide tooling support", "Clear documentation"],
      cons: ["Verbose for simple cases", "Version management complexity", "Over-fetching issues"],
      bestFor: "External-facing APIs and services requiring strict contracts",
    },
    "microservices": {
      techStack: "Docker, Kubernetes, gRPC/REST, Event Bus (Kafka/RabbitMQ)",
      useCases: ["Distributed systems", "Scalable architectures", "Independent deployments"],
      pros: ["Independent scaling", "Technology flexibility", "Fault isolation"],
      cons: ["Operational complexity", "Network latency", "Data consistency challenges"],
      bestFor: "Large teams needing independent deployment and scaling",
    },
    "data-pipeline": {
      techStack: "Apache Airflow, dbt, Spark, Snowflake/BigQuery",
      useCases: ["ETL processes", "Data warehousing", "Analytics pipelines"],
      pros: ["Scalable processing", "Audit trails", "Scheduling capabilities"],
      cons: ["Infrastructure requirements", "Debugging complexity", "Steep learning curve"],
      bestFor: "Data-intensive applications requiring reliable data transformation",
    },
    "testing-framework": {
      techStack: "Jest, Playwright, Cypress, Testing Library, k6",
      useCases: ["Unit testing", "E2E testing", "Performance testing"],
      pros: ["Quality assurance", "Regression prevention", "Documentation value"],
      cons: ["Time investment", "Maintenance overhead", "Flaky test challenges"],
      bestFor: "Teams prioritizing code quality and release confidence",
    },
    "security-baseline": {
      techStack: "OWASP ZAP, Snyk, HashiCorp Vault, Auth0/Okta",
      useCases: ["Security audits", "Compliance requirements", "Access management"],
      pros: ["Risk mitigation", "Compliance readiness", "Threat prevention"],
      cons: ["Implementation cost", "User friction", "Ongoing maintenance"],
      bestFor: "Regulated industries and applications handling sensitive data",
    },
    "legacy-patterns": {
      techStack: "SOAP, XML, Enterprise Service Bus, Legacy databases",
      useCases: ["Legacy integration", "Mainframe connectivity", "Data migration"],
      pros: ["Proven stability", "Enterprise support", "Transaction handling"],
      cons: ["Dated technology", "Limited flexibility", "Skill scarcity"],
      bestFor: "Organizations with significant legacy system investments",
    },
    "ai-ml-ops": {
      techStack: "Python, TensorFlow/PyTorch, MLflow, Kubeflow, Vector DBs",
      useCases: ["Model deployment", "ML pipelines", "AI feature development"],
      pros: ["Reproducibility", "Experiment tracking", "Automated retraining"],
      cons: ["Complexity", "Resource intensive", "Rapidly evolving"],
      bestFor: "Teams building production AI/ML capabilities",
    },
  };

  const dataA = comparisonData[frameworkA.id] || {
    techStack: "Various technologies",
    useCases: ["General purpose"],
    pros: ["Flexible", "Documented"],
    cons: ["May vary"],
    bestFor: "General use cases",
  };

  const dataB = comparisonData[frameworkB.id] || {
    techStack: "Various technologies",
    useCases: ["General purpose"],
    pros: ["Flexible", "Documented"],
    cons: ["May vary"],
    bestFor: "General use cases",
  };

  return {
    techStack: { a: dataA.techStack, b: dataB.techStack },
    useCases: { a: dataA.useCases, b: dataB.useCases },
    pros: { a: dataA.pros, b: dataB.pros },
    cons: { a: dataA.cons, b: dataB.cons },
    bestFor: { a: dataA.bestFor, b: dataB.bestFor },
    aiSummary: `Based on your team's needs, **${frameworkA.name}** is better suited for ${dataA.bestFor.toLowerCase()}, while **${frameworkB.name}** excels at ${dataB.bestFor.toLowerCase()}. Consider ${frameworkA.name} if your primary focus is ${frameworkA.tags[0]} development, or choose ${frameworkB.name} for ${frameworkB.tags[0]}-centric projects. Both frameworks are ${frameworkA.status === "active" && frameworkB.status === "active" ? "actively maintained and production-ready" : "available for use with varying support levels"}.`,
  };
};

interface FrameworkComparisonModalProps {
  frameworkA: Framework;
  frameworkB: Framework;
  onClose: () => void;
}

export function FrameworkComparisonModal({
  frameworkA,
  frameworkB,
  onClose,
}: FrameworkComparisonModalProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [comparison, setComparison] = useState<FrameworkComparison | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setComparison(generateMockComparison(frameworkA, frameworkB));
      setIsGenerating(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [frameworkA, frameworkB]);

  const IconA = frameworkIcons[frameworkA.icon];
  const IconB = frameworkIcons[frameworkB.icon];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[var(--bg-charcoal)] border border-[var(--border-default)] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[var(--border-subtle)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-medium text-[var(--text-primary)]">AI Framework Comparison</h2>
                <p className="text-sm text-[var(--text-muted)]">Powered by AI analysis</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-slate)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Framework Names Side by Side */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${frameworkA.color}`}>
                <IconA className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">{frameworkA.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">v{frameworkA.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${frameworkB.color}`}>
                <IconB className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-[var(--text-primary)]">{frameworkB.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">v{frameworkB.version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <p className="text-[var(--text-primary)] font-medium mb-2">Generating AI Comparison...</p>
              <p className="text-sm text-[var(--text-muted)]">Analyzing frameworks and generating insights</p>
            </div>
          ) : comparison ? (
            <div className="space-y-6">
              {/* Comparison Table */}
              <div className="bg-[var(--bg-slate)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)]">
                      <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)] w-1/5">Aspect</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--text-primary)] w-2/5">{frameworkA.name}</th>
                      <th className="text-left p-4 text-sm font-medium text-[var(--text-primary)] w-2/5">{frameworkB.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Tech Stack */}
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Wrench className="w-4 h-4" />
                          Tech Stack
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{comparison.techStack.a}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{comparison.techStack.b}</td>
                    </tr>

                    {/* Use Cases */}
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Target className="w-4 h-4" />
                          Use Cases
                        </div>
                      </td>
                      <td className="p-4">
                        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                          {comparison.useCases.a.map((uc, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {uc}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4">
                        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                          {comparison.useCases.b.map((uc, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              {uc}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Pros */}
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <ThumbsUp className="w-4 h-4" />
                          Pros
                        </div>
                      </td>
                      <td className="p-4">
                        <ul className="text-sm space-y-1">
                          {comparison.pros.a.map((pro, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-400">
                              <Check className="w-3.5 h-3.5" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4">
                        <ul className="text-sm space-y-1">
                          {comparison.pros.b.map((pro, i) => (
                            <li key={i} className="flex items-center gap-2 text-green-400">
                              <Check className="w-3.5 h-3.5" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Cons */}
                    <tr className="border-b border-[var(--border-subtle)]">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <ThumbsDown className="w-4 h-4" />
                          Cons
                        </div>
                      </td>
                      <td className="p-4">
                        <ul className="text-sm space-y-1">
                          {comparison.cons.a.map((con, i) => (
                            <li key={i} className="flex items-center gap-2 text-red-400">
                              <X className="w-3.5 h-3.5" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-4">
                        <ul className="text-sm space-y-1">
                          {comparison.cons.b.map((con, i) => (
                            <li key={i} className="flex items-center gap-2 text-red-400">
                              <X className="w-3.5 h-3.5" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Best For */}
                    <tr>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Users className="w-4 h-4" />
                          Best For
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{comparison.bestFor.a}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{comparison.bestFor.b}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-medium text-[var(--text-primary)]">AI Recommendation</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {comparison.aiSummary.split("**").map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-[var(--text-primary)]">{part}</strong> : part
                  )}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}

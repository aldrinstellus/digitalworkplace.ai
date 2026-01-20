"use client";

import { useState, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import { X, History, Clock, User, Eye, RotateCcw, Loader2 } from "lucide-react";

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  created_at: string;
  created_by?: {
    full_name: string;
    avatar?: string;
  };
  change_summary?: string;
}

interface VersionHistoryModalProps {
  articleId: string;
  currentTitle: string;
  onClose: () => void;
  onRestore: (version: Version) => Promise<void>;
}

export function VersionHistoryModal({
  articleId,
  currentTitle,
  onClose,
  onRestore,
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    // In production, fetch from API
    // For now, generate mock data
    const mockVersions: Version[] = [
      {
        id: "v1",
        version_number: 3,
        title: currentTitle,
        content: "<p>Current version content...</p>",
        created_at: new Date().toISOString(),
        created_by: { full_name: "You" },
        change_summary: "Updated introduction section",
      },
      {
        id: "v2",
        version_number: 2,
        title: currentTitle,
        content: "<p>Previous version content...</p>",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        created_by: { full_name: "Sarah Chen" },
        change_summary: "Fixed typos and formatting",
      },
      {
        id: "v3",
        version_number: 1,
        title: currentTitle,
        content: "<p>Original version content...</p>",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        created_by: { full_name: "Mike Johnson" },
        change_summary: "Initial creation",
      },
    ];

    setTimeout(() => {
      setVersions(mockVersions);
      setLoading(false);
    }, 500);
  }, [articleId, currentTitle]);

  const handleRestore = async (version: Version) => {
    setRestoring(true);
    try {
      await onRestore(version);
      onClose();
    } catch (error) {
      console.error("Failed to restore version:", error);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-[800px] max-h-[80vh] overflow-hidden flex">
        {/* Version List */}
        <div className="w-72 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-medium text-white">Version History</h2>
            </div>
            <p className="text-sm text-white/50 mt-1 truncate">{currentTitle}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No version history</p>
              </div>
            ) : (
              <div className="p-2">
                {versions.map((version, idx) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersion(version)}
                    className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
                      selectedVersion?.id === version.id
                        ? "bg-blue-500/20 border border-blue-500/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        Version {version.version_number}
                        {idx === 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                            Current
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Clock className="w-3 h-3" />
                      {new Date(version.created_at).toLocaleDateString()}
                    </div>
                    {version.created_by && (
                      <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                        <User className="w-3 h-3" />
                        {version.created_by.full_name}
                      </div>
                    )}
                    {version.change_summary && (
                      <p className="text-xs text-white/50 mt-2 line-clamp-2">
                        {version.change_summary}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Version Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              {selectedVersion ? (
                <>
                  <h3 className="text-white font-medium">
                    Version {selectedVersion.version_number}
                  </h3>
                  <p className="text-xs text-white/40">
                    {new Date(selectedVersion.created_at).toLocaleString()}
                  </p>
                </>
              ) : (
                <h3 className="text-white/50">Select a version to preview</h3>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedVersion && selectedVersion.version_number !== versions[0]?.version_number && (
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  disabled={restoring}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-sm transition-colors"
                >
                  {restoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Restore this version
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedVersion ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <h1>{selectedVersion.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedVersion.content) }} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40">Select a version from the left to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

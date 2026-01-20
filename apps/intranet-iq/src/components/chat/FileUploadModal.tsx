"use client";

import { useState, useCallback } from "react";
import {
  X,
  Upload,
  File,
  Image,
  FileText,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  preview?: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const fileTypeIcons: Record<string, typeof File> = {
  image: Image,
  pdf: FileText,
  document: FileText,
  default: File,
};

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return fileTypeIcons.image;
  if (type === "application/pdf") return fileTypeIcons.pdf;
  if (type.includes("document") || type.includes("word"))
    return fileTypeIcons.document;
  return fileTypeIcons.default;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadModal({
  isOpen,
  onClose,
  onUpload,
  maxFiles = 5,
  maxSizeMB = 64,
}: FileUploadModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const simulateUpload = useCallback((fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, progress: 100, status: "complete" } : f
          )
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }, 200);
  }, []);

  const validateAndAddFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      setError(null);

      const validFiles: UploadedFile[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];

        // Check max files
        if (files.length + validFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed`);
          break;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
          continue;
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "uploading",
        };

        // Generate preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? { ...f, preview: e.target?.result as string }
                  : f
              )
            );
          };
          reader.readAsDataURL(file);
        }

        validFiles.push(uploadedFile);

        // Simulate upload progress
        simulateUpload(uploadedFile.id);
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files.length, maxFiles, maxSizeMB, simulateUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      validateAndAddFiles(e.dataTransfer.files);
    },
    [validateAndAddFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = () => {
    // In production, this would actually upload the files
    onUpload([]);
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-[500px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Attach Files</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/20 hover:border-white/30"
            }`}
          >
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 mb-1">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-white/40">
              Up to {maxFiles} files, max {maxSizeMB}MB each
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    {/* Preview or Icon */}
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white/50" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{formatFileSize(file.size)}</span>
                        {file.status === "uploading" && (
                          <span className="text-blue-400">
                            {Math.round(file.progress)}%
                          </span>
                        )}
                        {file.status === "complete" && (
                          <span className="text-green-400">Complete</span>
                        )}
                      </div>
                      {/* Progress Bar */}
                      {file.status === "uploading" && (
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || files.some((f) => f.status === "uploading")}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            Attach {files.length > 0 && `(${files.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

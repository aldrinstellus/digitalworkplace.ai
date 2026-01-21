"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  File,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: "uploading" | "complete" | "error";
  progress?: number;
  error?: string;
}

interface FileAttachmentUploadProps {
  attachments: FileAttachment[];
  onAttachmentsChange: (attachments: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const FILE_ICONS: Record<string, typeof File> = {
  image: Image,
  video: Film,
  audio: Music,
  pdf: FileText,
  archive: Archive,
  default: File,
};

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return FILE_ICONS.image;
  if (type.startsWith("video/")) return FILE_ICONS.video;
  if (type.startsWith("audio/")) return FILE_ICONS.audio;
  if (type === "application/pdf") return FILE_ICONS.pdf;
  if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
    return FILE_ICONS.archive;
  return FILE_ICONS.default;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function FileAttachmentUpload({
  attachments,
  onAttachmentsChange,
  maxFiles = 10,
  maxSizeMB = 25,
  acceptedTypes = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".md",
    ".csv",
    ".json",
    ".xml",
    ".zip",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".mp4",
    ".mp3",
  ],
}: FileAttachmentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeBytes) {
        return `File exceeds ${maxSizeMB}MB limit`;
      }
      // Check file extension
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!acceptedTypes.some((t) => t.toLowerCase() === extension)) {
        return "File type not supported";
      }
      return null;
    },
    [maxSizeBytes, maxSizeMB, acceptedTypes]
  );

  const uploadFile = useCallback(
    async (file: File): Promise<void> => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Validate file
      const error = validateFile(file);
      if (error) {
        const newAttachment: FileAttachment = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "error",
          error,
        };
        onAttachmentsChange([...attachments, newAttachment]);
        return;
      }

      // Add file with uploading status
      const newAttachment: FileAttachment = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0,
      };
      onAttachmentsChange([...attachments, newAttachment]);

      // Simulate upload progress (in production, use actual upload with progress)
      try {
        // Simulate upload
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          onAttachmentsChange((prev) =>
            prev.map((a) =>
              a.id === fileId ? { ...a, progress } : a
            )
          );
        }

        // In production, upload to Supabase storage
        // const { data, error } = await supabase.storage
        //   .from('article-attachments')
        //   .upload(`${articleId}/${file.name}`, file);

        // Simulate success with mock URL
        onAttachmentsChange((prev) =>
          prev.map((a) =>
            a.id === fileId
              ? {
                  ...a,
                  status: "complete" as const,
                  progress: 100,
                  url: URL.createObjectURL(file), // Mock URL, use actual storage URL in production
                }
              : a
          )
        );
      } catch (err) {
        onAttachmentsChange((prev) =>
          prev.map((a) =>
            a.id === fileId
              ? {
                  ...a,
                  status: "error" as const,
                  error: "Upload failed",
                }
              : a
          )
        );
      }
    },
    [attachments, onAttachmentsChange, validateFile]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxFiles - attachments.length;

      if (fileArray.length > remainingSlots) {
        alert(`You can only add ${remainingSlots} more file(s)`);
        return;
      }

      // Upload each file
      for (const file of fileArray) {
        await uploadFile(file);
      }
    },
    [attachments.length, maxFiles, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeAttachment = useCallback(
    (id: string) => {
      onAttachmentsChange(attachments.filter((a) => a.id !== id));
    },
    [attachments, onAttachmentsChange]
  );

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-2 text-white/70">
          <Paperclip className="w-4 h-4" />
          <span className="text-sm font-medium">
            Attachments {attachments.length > 0 && `(${attachments.length})`}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/40" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/40" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <Upload
              className={`w-8 h-8 mx-auto mb-2 ${
                isDragging ? "text-blue-400" : "text-white/40"
              }`}
            />
            <p className="text-sm text-white/70">
              <span className="text-blue-400">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-white/40 mt-1">
              Max {maxSizeMB}MB per file • {maxFiles - attachments.length} slots
              remaining
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />

          {/* File List */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((attachment) => {
                const Icon = getFileIcon(attachment.type);
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {attachment.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">
                          {formatFileSize(attachment.size)}
                        </span>
                        {attachment.status === "uploading" && (
                          <div className="flex-1 max-w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${attachment.progress || 0}%` }}
                            />
                          </div>
                        )}
                        {attachment.status === "error" && (
                          <span className="text-xs text-red-400">
                            {attachment.error}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {attachment.status === "uploading" && (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      )}
                      {attachment.status === "complete" && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {attachment.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Accepted Types */}
          <p className="mt-3 text-xs text-white/30">
            Accepted: PDF, Word, Excel, PowerPoint, Images, Videos, Audio, Text
            files
          </p>
        </div>
      )}
    </div>
  );
}

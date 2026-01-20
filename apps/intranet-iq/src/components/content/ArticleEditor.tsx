"use client";

import { useState, useRef, useCallback } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Save,
  Eye,
  Edit3,
  X,
  Check,
  Loader2,
} from "lucide-react";

interface ArticleEditorProps {
  article?: {
    id: string;
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    status: string;
  };
  onSave: (data: {
    title: string;
    content: string;
    summary: string;
    tags: string[];
    status: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function ArticleEditor({ article, onSave, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [summary, setSummary] = useState(article?.summary || "");
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState(article?.status || "draft");
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async (saveStatus?: string) => {
    setSaving(true);
    try {
      await onSave({
        title,
        content: editorRef.current?.innerHTML || content,
        summary,
        tags,
        status: saveStatus || status,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save article:", error);
    } finally {
      setSaving(false);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: "bold", title: "Bold (Ctrl+B)" },
    { icon: Italic, command: "italic", title: "Italic (Ctrl+I)" },
    { icon: Underline, command: "underline", title: "Underline (Ctrl+U)" },
    { type: "divider" },
    { icon: Heading1, command: "formatBlock", value: "h1", title: "Heading 1" },
    { icon: Heading2, command: "formatBlock", value: "h2", title: "Heading 2" },
    { icon: Heading3, command: "formatBlock", value: "h3", title: "Heading 3" },
    { type: "divider" },
    { icon: List, command: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, command: "insertOrderedList", title: "Numbered List" },
    { type: "divider" },
    { icon: Quote, command: "formatBlock", value: "blockquote", title: "Quote" },
    { icon: Code, command: "formatBlock", value: "pre", title: "Code Block" },
    { type: "divider" },
    {
      icon: Link2,
      command: "createLink",
      prompt: true,
      title: "Insert Link",
    },
    { icon: Undo, command: "undo", title: "Undo (Ctrl+Z)" },
    { icon: Redo, command: "redo", title: "Redo (Ctrl+Y)" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-medium text-white">
              {article ? "Edit Article" : "New Article"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isPreview
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 text-sm transition-colors"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("pending_review")}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 text-yellow-400 text-sm flex items-center gap-2 transition-colors"
            >
              Submit for Review
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saving ? "Saving..." : saved ? "Saved!" : "Publish Direct"}
            </button>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="p-4 border-b border-white/10">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full bg-transparent text-2xl font-medium text-white placeholder-white/30 outline-none"
          />
        </div>

        {/* Summary */}
        <div className="px-4 py-3 border-b border-white/10">
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary (optional)..."
            className="w-full bg-transparent text-sm text-white/70 placeholder-white/30 outline-none"
          />
        </div>

        {/* Toolbar */}
        {!isPreview && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-white/5">
            {toolbarButtons.map((btn, idx) =>
              btn.type === "divider" ? (
                <div key={idx} className="w-px h-6 bg-white/10 mx-1" />
              ) : (
                <button
                  key={idx}
                  onClick={() => {
                    if (btn.prompt) {
                      const url = prompt("Enter URL:");
                      if (url) execCommand(btn.command!, url);
                    } else {
                      execCommand(btn.command!, btn.value);
                    }
                  }}
                  title={btn.title}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  {btn.icon && <btn.icon className="w-4 h-4" />}
                </button>
              )
            )}
          </div>
        )}

        {/* Editor / Preview */}
        <div className="flex-1 overflow-y-auto">
          {isPreview ? (
            <div className="p-6 max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold text-white mb-4">{title || "Untitled"}</h1>
              {summary && <p className="text-lg text-white/70 italic mb-6">{summary}</p>}
              <div
                className="prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editorRef.current?.innerHTML || content) }}
              />
            </div>
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setContent(e.currentTarget.innerHTML)}
              className="p-6 min-h-full text-white/80 outline-none prose prose-invert prose-sm max-w-3xl mx-auto"
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          )}
        </div>

        {/* Footer - Tags & Status */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Tags:</span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="bg-transparent text-xs text-white placeholder-white/30 outline-none w-24"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-[#1a1a1f] border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

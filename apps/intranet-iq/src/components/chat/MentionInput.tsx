"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Users, FileText, Hash } from "lucide-react";

interface MentionItem {
  id: string;
  type: "person" | "document" | "channel";
  name: string;
  subtitle?: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  className?: string;
}

// Mock data - in production this would come from the API
const mentionData: MentionItem[] = [
  { id: "1", type: "person", name: "Sarah Chen", subtitle: "Engineering Lead", avatar: "SC" },
  { id: "2", type: "person", name: "Mike Johnson", subtitle: "Senior Developer", avatar: "MJ" },
  { id: "3", type: "person", name: "Anna Lee", subtitle: "UX Designer", avatar: "AL" },
  { id: "4", type: "person", name: "James Park", subtitle: "Product Manager", avatar: "JP" },
  { id: "5", type: "person", name: "Lisa Wang", subtitle: "HR Manager", avatar: "LW" },
  { id: "6", type: "document", name: "Employee Handbook", subtitle: "HR Policy" },
  { id: "7", type: "document", name: "Engineering Guidelines", subtitle: "Development" },
  { id: "8", type: "document", name: "Vacation Policy", subtitle: "HR Policy" },
  { id: "9", type: "channel", name: "general", subtitle: "342 members" },
  { id: "10", type: "channel", name: "engineering", subtitle: "48 members" },
  { id: "11", type: "channel", name: "design", subtitle: "24 members" },
];

const typeIcons = {
  person: Users,
  document: FileText,
  channel: Hash,
};

const typeColors = {
  person: "text-green-400",
  document: "text-blue-400",
  channel: "text-purple-400",
};

export function MentionInput({
  value,
  onChange,
  onSend,
  placeholder = "Type a message...",
  className = "",
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect @ mentions
  useEffect(() => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's a space before the @ (or it's at the start)
      const charBeforeAt = textBeforeCursor[lastAtIndex - 1];
      const isValidMention = lastAtIndex === 0 || charBeforeAt === " " || charBeforeAt === "\n";

      if (isValidMention && !textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt.toLowerCase());
        setMentionStartIndex(lastAtIndex);

        // Filter suggestions
        const filtered = mentionData.filter(
          (item) =>
            item.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 6));
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionStartIndex(null);
  }, [value]);

  const insertMention = useCallback(
    (item: MentionItem) => {
      if (mentionStartIndex === null) return;

      const beforeMention = value.substring(0, mentionStartIndex);
      const afterMention = value.substring(
        (textareaRef.current?.selectionStart || 0)
      );
      const mentionText = item.type === "channel" ? `#${item.name}` : `@${item.name}`;
      const newValue = `${beforeMention}${mentionText} ${afterMention}`;

      onChange(newValue);
      setShowSuggestions(false);

      // Focus back on input
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = beforeMention.length + mentionText.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    },
    [mentionStartIndex, value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-white placeholder-white/40 outline-none resize-none text-sm leading-relaxed min-h-[24px] max-h-[120px]"
        rows={1}
      />

      {/* Mention Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#0f0f14] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-white/40 px-2 py-1 mb-1">
              {mentionSearch ? `Matching "${mentionSearch}"` : "Suggestions"}
            </p>
            {suggestions.map((item, index) => {
              const Icon = typeIcons[item.type];
              return (
                <button
                  key={item.id}
                  onClick={() => insertMention(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    index === selectedIndex
                      ? "bg-blue-500/20 text-white"
                      : "hover:bg-white/5 text-white/70"
                  }`}
                >
                  {item.type === "person" && item.avatar ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{item.avatar}</span>
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${typeColors[item.type]}`} />
                    </div>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.subtitle && (
                      <p className="text-xs text-white/40 truncate">{item.subtitle}</p>
                    )}
                  </div>
                  <span className={`text-xs ${typeColors[item.type]}`}>
                    {item.type === "channel" ? "#" : "@"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-white/10 px-3 py-2">
            <p className="text-xs text-white/30">
              ↑↓ to navigate, Enter to select, Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

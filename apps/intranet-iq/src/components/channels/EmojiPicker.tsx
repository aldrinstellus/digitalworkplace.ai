"use client";

import { useState } from "react";

const emojiCategories = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😋", "😛", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😒", "🙃", "😬", "🤫", "🤭", "🤗", "😱", "😨", "😰", "😢", "😭", "😤", "😠", "🤬"],
  },
  {
    name: "Gestures",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤙", "👋", "🖐️", "✋", "🤚", "👏", "🙌", "👐", "🤝", "🙏", "💪", "🦾", "🖕"],
  },
  {
    name: "Hearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"],
  },
  {
    name: "Objects",
    emojis: ["🎉", "🎊", "🎁", "🏆", "🥇", "🎯", "💡", "📌", "📍", "🔔", "📣", "💬", "💭", "🗨️", "✅", "❌", "❓", "❗", "⭐", "🌟", "✨", "🔥", "💯", "🚀", "⚡", "💻", "📱", "📧", "📅", "📊", "📈", "📉"],
  },
  {
    name: "Food",
    emojis: ["☕", "🍵", "🍺", "🍻", "🥂", "🍷", "🍾", "🍕", "🍔", "🍟", "🌭", "🍿", "🥗", "🍰", "🎂", "🍩", "🍪"],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmojis = searchQuery
    ? emojiCategories.flatMap((cat) => cat.emojis).filter((emoji) =>
        emoji.includes(searchQuery)
      )
    : emojiCategories[activeCategory].emojis;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full right-0 mb-2 w-80 bg-[var(--bg-charcoal)] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
        {/* Search */}
        <div className="p-2 border-b border-white/10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emoji..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-blue-500/50"
            autoFocus
          />
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex border-b border-white/10 px-1">
            {emojiCategories.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(idx)}
                className={`flex-1 py-2 text-xs transition-colors ${
                  activeCategory === idx
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {cat.emojis[0]}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div className="p-2 max-h-64 overflow-y-auto">
          {!searchQuery && (
            <div className="text-xs text-white/40 px-1 mb-2">
              {emojiCategories[activeCategory].name}
            </div>
          )}
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
          {filteredEmojis.length === 0 && (
            <div className="text-center py-8 text-white/40 text-sm">
              No emoji found
            </div>
          )}
        </div>

        {/* Frequently Used - could be implemented with localStorage */}
        <div className="p-2 border-t border-white/10">
          <div className="text-xs text-white/40 mb-2">Frequently Used</div>
          <div className="flex gap-1">
            {["👍", "❤️", "😀", "🎉", "🚀", "✅", "🔥", "💯"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

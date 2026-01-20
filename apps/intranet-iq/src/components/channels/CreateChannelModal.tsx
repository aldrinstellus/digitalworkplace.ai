"use client";

import { useState } from "react";
import { X, Hash, Lock, Loader2, Users } from "lucide-react";

interface CreateChannelModalProps {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => Promise<void>;
}

export function CreateChannelModal({ onClose, onCreate }: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const formatChannelName = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 80);
  };

  const handleCreate = async () => {
    const formattedName = formatChannelName(name);
    if (!formattedName) {
      setError("Channel name is required");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await onCreate({
        name: formattedName,
        description,
        isPrivate,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f14] border border-white/10 rounded-2xl w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Create Channel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Channel Type */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-3">
              Channel Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsPrivate(false)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  !isPrivate
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Hash className={`w-5 h-5 mb-2 ${!isPrivate ? "text-blue-400" : "text-white/50"}`} />
                <div className={`font-medium ${!isPrivate ? "text-white" : "text-white/70"}`}>
                  Public
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Anyone can join and view messages
                </p>
              </button>
              <button
                onClick={() => setIsPrivate(true)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  isPrivate
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <Lock className={`w-5 h-5 mb-2 ${isPrivate ? "text-blue-400" : "text-white/50"}`} />
                <div className={`font-medium ${isPrivate ? "text-white" : "text-white/70"}`}>
                  Private
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Only invited members can access
                </p>
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                {isPrivate ? <Lock className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., project-updates"
                className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors"
                autoFocus
              />
            </div>
            {name && (
              <p className="mt-1 text-xs text-white/40">
                Channel name: #{formatChannelName(name)}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>
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
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white flex items-center gap-2 transition-colors"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            {creating ? "Creating..." : "Create Channel"}
          </button>
        </div>
      </div>
    </div>
  );
}

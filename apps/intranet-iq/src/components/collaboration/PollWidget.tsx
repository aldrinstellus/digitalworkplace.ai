"use client";

import { useState, useCallback } from "react";
import {
  BarChart2,
  Check,
  Plus,
  X,
  Users,
  Clock,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Vote,
} from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters?: string[];
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  expiresAt?: string;
  isMultipleChoice?: boolean;
  isAnonymous?: boolean;
  userVote?: string | string[];
  status: "active" | "closed";
}

interface PollWidgetProps {
  poll?: Poll;
  onVote?: (pollId: string, optionIds: string[]) => Promise<void>;
  onDelete?: (pollId: string) => Promise<void>;
  onClose?: (pollId: string) => Promise<void>;
  isCreator?: boolean;
  compact?: boolean;
}

// Demo poll data
const DEMO_POLL: Poll = {
  id: "demo-poll-1",
  question: "What should our next team building activity be?",
  options: [
    { id: "opt-1", text: "Escape Room Challenge", votes: 12, voters: [] },
    { id: "opt-2", text: "Virtual Game Night", votes: 8, voters: [] },
    { id: "opt-3", text: "Outdoor Hiking Trip", votes: 15, voters: [] },
    { id: "opt-4", text: "Cooking Class Workshop", votes: 5, voters: [] },
  ],
  totalVotes: 40,
  createdBy: {
    id: "user-1",
    name: "Sarah Chen",
  },
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  isMultipleChoice: false,
  isAnonymous: false,
  status: "active",
};

export function PollWidget({
  poll = DEMO_POLL,
  onVote,
  onDelete,
  onClose,
  isCreator = false,
  compact = false,
}: PollWidgetProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    poll.userVote
      ? Array.isArray(poll.userVote)
        ? poll.userVote
        : [poll.userVote]
      : []
  );
  const [voting, setVoting] = useState(false);
  const [showVoters, setShowVoters] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!compact);

  const hasVoted = selectedOptions.length > 0 || !!poll.userVote;
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const canVote = poll.status === "active" && !isExpired && !hasVoted;

  const handleOptionSelect = (optionId: string) => {
    if (!canVote) return;

    if (poll.isMultipleChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || !onVote) return;
    setVoting(true);
    try {
      await onVote(poll.id, selectedOptions);
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setVoting(false);
    }
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getTimeRemaining = () => {
    if (!poll.expiresAt) return null;
    const expiry = new Date(poll.expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="bg-[#0f0f14] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 ${compact ? "cursor-pointer hover:bg-white/5" : ""}`}
        onClick={() => compact && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">
              {compact && !expanded
                ? poll.question.slice(0, 40) + (poll.question.length > 40 ? "..." : "")
                : poll.question}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {poll.totalVotes} votes
              </span>
              {poll.expiresAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {poll.status === "closed" && (
            <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/50">
              Closed
            </span>
          )}
          {isExpired && poll.status === "active" && (
            <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">
              Expired
            </span>
          )}
          {compact && (
            expanded ? (
              <ChevronUp className="w-5 h-5 text-white/40" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/40" />
            )
          )}
        </div>
      </div>

      {/* Poll Options */}
      {(!compact || expanded) && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {poll.options.map((option) => {
              const percentage = getPercentage(option.votes);
              const isSelected = selectedOptions.includes(option.id);
              const wasVoted =
                poll.userVote &&
                (Array.isArray(poll.userVote)
                  ? poll.userVote.includes(option.id)
                  : poll.userVote === option.id);

              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={!canVote}
                    className={`w-full relative p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10"
                        : wasVoted
                        ? "border-green-500/50 bg-green-500/10"
                        : canVote
                        ? "border-white/10 hover:border-white/20"
                        : "border-white/10"
                    }`}
                  >
                    {/* Progress bar background */}
                    {(hasVoted || isExpired || poll.status === "closed") && (
                      <div
                        className="absolute inset-0 rounded-lg bg-white/5 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {canVote && (
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-purple-500 bg-purple-500"
                                : "border-white/30"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        )}
                        {wasVoted && (
                          <Check className="w-4 h-4 text-green-400" />
                        )}
                        <span
                          className={`text-sm ${
                            wasVoted ? "text-white font-medium" : "text-white/80"
                          }`}
                        >
                          {option.text}
                        </span>
                      </div>
                      {(hasVoted || isExpired || poll.status === "closed") && (
                        <span className="text-sm text-white/50">
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Voters (if not anonymous) */}
                  {!poll.isAnonymous &&
                    option.voters &&
                    option.voters.length > 0 &&
                    showVoters === option.id && (
                      <div className="mt-1 p-2 bg-white/5 rounded-lg text-xs text-white/50">
                        {option.voters.join(", ")}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {canVote && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleVote}
                disabled={selectedOptions.length === 0 || voting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {voting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Vote className="w-4 h-4" />
                )}
                {voting ? "Voting..." : "Submit Vote"}
              </button>
            </div>
          )}

          {/* Poll Info */}
          <div className="mt-4 flex items-center justify-between text-xs text-white/40">
            <span>Created by {poll.createdBy.name}</span>
            <div className="flex items-center gap-2">
              {poll.isMultipleChoice && (
                <span className="px-2 py-0.5 rounded bg-white/5">
                  Multiple choice
                </span>
              )}
              {poll.isAnonymous && (
                <span className="px-2 py-0.5 rounded bg-white/5">Anonymous</span>
              )}
            </div>
          </div>

          {/* Creator Actions */}
          {isCreator && poll.status === "active" && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
              {onClose && (
                <button
                  onClick={() => onClose(poll.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  Close Poll
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(poll.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Poll Creator Component
interface CreatePollProps {
  onClose: () => void;
  onCreate: (poll: {
    question: string;
    options: string[];
    isMultipleChoice: boolean;
    isAnonymous: boolean;
    expiresAt?: string;
  }) => Promise<void>;
}

export function CreatePollModal({ onClose, onCreate }: CreatePollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [duration, setDuration] = useState("7"); // days
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;

    setCreating(true);
    try {
      const expiresAt =
        duration !== "none"
          ? new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString()
          : undefined;

      await onCreate({
        question: question.trim(),
        options: validOptions,
        isMultipleChoice,
        isAnonymous,
        expiresAt,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create poll:", error);
    } finally {
      setCreating(false);
    }
  };

  const validOptions = options.filter((o) => o.trim()).length;
  const canCreate = question.trim() && validOptions >= 2;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f14] border border-white/10 rounded-xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-medium text-white">Create Poll</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Question */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              Options ({validOptions} of {options.length})
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 outline-none focus:border-purple-500/50 transition-colors text-sm"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                onClick={addOption}
                className="mt-2 flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add option
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={isMultipleChoice}
                onChange={(e) => setIsMultipleChoice(e.target.checked)}
                className="rounded border-white/30"
              />
              <span className="text-sm text-white/70">Multiple choice</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-white/30"
              />
              <span className="text-sm text-white/70">Anonymous voting</span>
            </label>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#1a1a1f] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500/50 transition-colors text-sm"
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">1 week</option>
              <option value="14">2 weeks</option>
              <option value="30">1 month</option>
              <option value="none">No expiration</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart2 className="w-4 h-4" />
            )}
            {creating ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Hash,
  Plus,
  Search,
  Users,
  Lock,
  Globe,
  ChevronRight,
  MoreHorizontal,
  Star,
} from "lucide-react";

export interface ChatSpace {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isPublic: boolean;
  isFavorite?: boolean;
  lastActivity?: string;
}

// Alias for internal use
type Space = ChatSpace;

interface ChatSpacesProps {
  spaces: Space[];
  activeSpaceId?: string;
  onSelectSpace: (spaceId: string | null) => void;
  onCreateSpace: () => void;
}

// Demo spaces
const demoSpaces: Space[] = [
  {
    id: "1",
    name: "Engineering",
    description: "Engineering team discussions",
    memberCount: 24,
    isPublic: true,
    isFavorite: true,
    lastActivity: "2 min ago",
  },
  {
    id: "2",
    name: "Product",
    description: "Product planning and roadmap",
    memberCount: 12,
    isPublic: true,
    lastActivity: "15 min ago",
  },
  {
    id: "3",
    name: "HR Confidential",
    description: "HR team private space",
    memberCount: 5,
    isPublic: false,
    lastActivity: "1 hour ago",
  },
  {
    id: "4",
    name: "Marketing",
    description: "Marketing campaigns and content",
    memberCount: 8,
    isPublic: true,
    lastActivity: "3 hours ago",
  },
];

export function ChatSpaces({
  spaces = demoSpaces,
  activeSpaceId,
  onSelectSpace,
  onCreateSpace,
}: ChatSpacesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(true);

  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteSpaces = filteredSpaces.filter((s) => s.isFavorite);
  const otherSpaces = filteredSpaces.filter((s) => !s.isFavorite);

  return (
    <div className="border-b border-white/10 pb-4 mb-4">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-1 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`w-4 h-4 text-white/40 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
          <Hash className="w-4 h-4 text-white/60" />
          <span className="text-sm font-medium text-white/70">Spaces</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50">
            {spaces.length}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateSpace();
          }}
          className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="mt-2 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spaces..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Direct Messages (no space) */}
          <button
            onClick={() => onSelectSpace(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
              !activeSpaceId
                ? "bg-blue-500/20 text-blue-400"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Direct Messages</span>
          </button>

          {/* Favorite Spaces */}
          {favoriteSpaces.length > 0 && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider px-2 mb-1">
                Favorites
              </p>
              <div className="space-y-0.5">
                {favoriteSpaces.map((space) => (
                  <SpaceItem
                    key={space.id}
                    space={space}
                    isActive={activeSpaceId === space.id}
                    onSelect={() => onSelectSpace(space.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Spaces */}
          {otherSpaces.length > 0 && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider px-2 mb-1">
                All Spaces
              </p>
              <div className="space-y-0.5">
                {otherSpaces.map((space) => (
                  <SpaceItem
                    key={space.id}
                    space={space}
                    isActive={activeSpaceId === space.id}
                    onSelect={() => onSelectSpace(space.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredSpaces.length === 0 && (
            <p className="text-xs text-white/40 text-center py-2">
              No spaces found
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SpaceItem({
  space,
  isActive,
  onSelect,
}: {
  space: Space;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm transition-colors group cursor-pointer ${
        isActive
          ? "bg-blue-500/20 text-blue-400"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Hash className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{space.name}</span>
        {!space.isPublic && <Lock className="w-3 h-3 text-white/40" />}
        {space.isFavorite && (
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        )}
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-white/40">{space.memberCount}</span>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 rounded hover:bg-white/10"
        >
          <MoreHorizontal className="w-3 h-3 text-white/40" />
        </button>
      </div>
    </div>
  );
}

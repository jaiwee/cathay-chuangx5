"use client";

import { useState, useEffect } from "react";
import { Pencil, GripVertical, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ActivityData = {
  id: string;
  start_time: string;
  name: string;
  description: string;
  type: string;
  duration: number;
  cathay_shop_item: string | null;
};

type Props = {
  activity: ActivityData;
  onUpdate: (activity: ActivityData) => void;
  isFirst?: boolean;
  isLast?: boolean;
};

// Helper function to capitalize event type
function capitalizeEventType(type: string): string {
  if (!type) return "";
  // Capitalize first letter and handle special cases
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

export function ProposalFormActivity({ activity, onUpdate, isFirst = false, isLast = false }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedActivity, setEditedActivity] = useState<ActivityData>(activity);

  const isDraggable = !isFirst && !isLast && !isEditing;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: activity.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleChange = (field: keyof ActivityData, value: string) => {
    const updated = { ...editedActivity };
    if (field === "duration") {
      // Extract integer from input (remove "m" and any non-numeric characters)
      const numericValue = parseInt(value.replace(/[^0-9]/g, "")) || 0;
      updated.duration = numericValue;
    } else if (field === "name" || field === "description" || field === "start_time") {
      // eventType is not editable
      updated[field] = value;
    }
    setEditedActivity(updated);
    onUpdate(updated);
  };

  const handleEditClick = () => {
    if (isEditing) {
      // Save changes when exiting edit mode
      onUpdate(editedActivity);
    }
    setIsEditing(!isEditing);
  };

  // Sync local state when activity prop changes
  useEffect(() => {
    setEditedActivity(activity);
  }, [activity]);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, maxWidth: '100%' }}
      className="relative flex gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm w-full min-w-0 box-border"
    >
      {/* Drag Handle */}
      <div
        {...(isDraggable ? attributes : {})}
        {...(isDraggable ? listeners : {})}
        className={`flex items-start justify-center pt-0 flex-shrink-0 ${
          isDraggable
            ? "cursor-grab active:cursor-grabbing touch-none"
            : "cursor-not-allowed opacity-40"
        }`}
      >
        <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors mt-0.5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-2 min-w-0 overflow-hidden">
        {/* Time and Name Row */}
        <div className="flex items-start gap-2 min-w-0">
          {isEditing ? (
            <>
              <div className="w-20 flex-shrink-0 text-xl font-bold text-gray-800 px-2 py-1 bg-gray-50 rounded border border-gray-200 flex items-center">
                {editedActivity.start_time}
              </div>
              <Input
                type="text"
                value={editedActivity.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="flex-1 text-base font-bold text-gray-800 min-w-0 max-w-full"
                placeholder="Activity name"
              />
            </>
          ) : (
            <div className="flex items-start gap-2 min-w-0">
              <span className="text-xl font-bold text-gray-800 flex-shrink-0">
                {editedActivity.start_time}
              </span>
              <span className="text-base font-bold text-gray-800 break-words">
                {editedActivity.name}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {isEditing ? (
          <Textarea
            value={editedActivity.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="min-h-16 text-sm text-gray-800 w-full resize-y"
            placeholder="Activity description"
          />
        ) : (
          <>
            <p className="text-sm font-normal text-gray-800 leading-relaxed break-words">
              {editedActivity.description}
            </p>
            {editedActivity.cathay_shop_item && (
              <p className="text-xs font-bold text-[#014A43] mt-2 italic break-words">
                Featuring {editedActivity.cathay_shop_item} from Cathay Shop
              </p>
            )}
          </>
        )}

        {/* Activity Type and Duration */}
        {isEditing ? (
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 flex-wrap min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-600 whitespace-nowrap">Type:</span>
              <div className="w-40 h-8 text-xs px-3 py-1.5 bg-gray-50 rounded border border-gray-200 text-gray-800 flex-shrink-0">
                {capitalizeEventType(editedActivity.type)}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-600 whitespace-nowrap">Duration:</span>
              <div className="relative flex items-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={editedActivity.duration || ""}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className="w-20 h-8 text-xs pr-6 flex-shrink-0"
                  placeholder="30"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                  m
                </span>
              </div>
            </div>
          </div>
        ) : (
          (editedActivity.type || editedActivity.duration) && (
            <div className="flex items-center gap-4 pt-1 text-xs text-gray-500">
              {editedActivity.type && (
                <span>Type: {capitalizeEventType(editedActivity.type)}</span>
              )}
              {editedActivity.duration && (
                <span>Duration: {editedActivity.duration}m</span>
              )}
            </div>
          )
        )}
      </div>

      {/* Edit/Confirm Icon */}
      <button
        type="button"
        onClick={handleEditClick}
        className={`flex-shrink-0 self-start transition-colors ${
          isEditing
            ? "text-[#014A43] hover:text-[#013832]"
            : "text-red-600 hover:text-red-700"
        }`}
        aria-label={isEditing ? "Confirm changes" : "Edit activity"}
      >
        {isEditing ? (
          <Check className="h-4 w-4" />
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}


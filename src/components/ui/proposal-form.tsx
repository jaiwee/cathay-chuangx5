"use client";

import { useState } from "react";
import { Plane } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ProposalFormActivity, type ActivityData } from "@/components/ui/proposal-form-activity";
import { Button } from "@/components/ui/button";

// Flight times
const DEPARTURE_TIME = "09:20";
const ARRIVAL_TIME = "13:55";

// Calculate flight duration in minutes
function getFlightDurationMinutes(): number {
  const departure = parseTime(DEPARTURE_TIME);
  const arrival = parseTime(ARRIVAL_TIME);
  return arrival - departure;
}

// Format minutes to "Xh Ym" format
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
}

// Utility functions for time calculations
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function parseDuration(duration: number | string): number {
  // If it's already a number, return it
  if (typeof duration === "number") {
    return duration;
  }
  
  // Parse string formats like "5m", "45m", "1h", "1h 30m", "90m"
  const str = String(duration).trim().toLowerCase();
  let totalMinutes = 0;
  
  // Match hours and minutes
  const hourMatch = str.match(/(\d+)h/);
  const minuteMatch = str.match(/(\d+)m/);
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }
  
  return totalMinutes || 0;
}

function calculateActivityTimes(
  activities: ActivityData[],
  departureTime: string
): ActivityData[] {
  if (activities.length === 0) return activities;
  
  let currentTime = parseTime(departureTime);
  
  return activities.map((activity) => {
    const duration = parseDuration(activity.duration);
    const startTime = formatTime(currentTime);
    
    // Update currentTime for next activity
    currentTime += duration;
    
    return {
      ...activity,
      time: startTime,
    };
  });
}

export function ProposalForm() {
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize activities with calculated times
  const [activitiesState, setActivitiesState] = useState<ActivityData[]>(() => {
    const initial = [
      {
        id: "1",
        time: DEPARTURE_TIME,
        name: "Takeoff",
        description: "Captain welcomes guests; Flight plan and theme schedule via seat screens.",
        eventType: "takeoff",
        duration: 5,
      },
      {
        id: "2",
        time: "09:25",
        name: "Streaming Party",
        description: "Curated K-pop playlist begins with synchronized LED lighting in cabin.",
        eventType: "entertainment",
        duration: 45,
      },
      {
        id: "3",
        time: "10:10",
        name: '"Taste of Seoul" Meal',
        description: "Menu: Bibimbap, tteokbokki snacks, and themed beverages",
        eventType: "meal",
        duration: 60,
      },
      {
        id: "4",
        time: "11:10",
        name: "Korean Culture Workshop",
        description: "Interactive session on Korean traditions, language basics, and cultural etiquette.",
        eventType: "activity",
        duration: 30,
      },
      {
        id: "5",
        time: "11:40",
        name: "In-Flight Shopping",
        description: "Exclusive Korean beauty products and souvenirs available for purchase.",
        eventType: "activity",
        duration: 20,
      },
      {
        id: "6",
        time: "12:00",
        name: "Light Refreshments",
        description: "Traditional Korean snacks and beverages served.",
        eventType: "meal",
        duration: 30,
      },
      {
        id: "7",
        time: "12:30",
        name: "Entertainment: K-Drama Screening",
        description: "Watch popular Korean drama episodes with subtitles.",
        eventType: "entertainment",
        duration: 60,
      },
      {
        id: "8",
        time: "13:30",
        name: "Pre-Landing Preparation",
        description: "Cabin crew announcements and preparation for arrival in Seoul.",
        eventType: "landing",
        duration: 25,
      },
    ];
    return calculateActivityTimes(initial, DEPARTURE_TIME);
  });

  // Wrapper to ensure times are always calculated
  const setActivities = (updater: (prev: ActivityData[]) => ActivityData[]) => {
    setActivitiesState((prev) => {
      const updated = updater(prev);
      return calculateActivityTimes(updated, DEPARTURE_TIME);
    });
  };

  const activities = activitiesState;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleActivityUpdate = (updatedActivity: ActivityData) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === updatedActivity.id ? updatedActivity : activity
      )
    );
    // Clear validation error when activities are updated
    setValidationError(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // Clear validation error when activities are reordered
      setValidationError(null);
    }
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <div className="shrink-0">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Flight Itinerary</h1>
        
        <div className="mb-8 space-y-1 text-sm font-normal text-gray-800">
          <p><strong>Leaving from: </strong>Hong Kong (HKG)</p>
          <p><strong>Going to: </strong>Seoul (ICN)</p>
        </div>

        <div className="relative flex items-center py-2">
        {/* Departure Time */}
        <div className="flex flex-col items-start">
          <div className="text-3xl font-bold text-gray-800">{DEPARTURE_TIME}</div>
          <div className="mt-1 text-sm font-normal text-gray-800">HKG</div>
        </div>

        {/* Flight Timeline */}
        <div className="relative flex flex-1 items-center px-6">
          {/* Airplane Icon */}
          <div className="shrink-0">
            <Plane className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
          </div>

          {/* Horizontal Line */}
          <div className="relative flex-1 mx-4">
            <div className="h-px bg-gray-300"></div>
            
            {/* Flight Duration */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full pb-2 text-sm font-normal text-gray-800 whitespace-nowrap">
              {formatDuration(getFlightDurationMinutes())}
            </div>
            
            {/* Flight Number */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 pt-2 text-sm font-normal text-gray-800 whitespace-nowrap">
              CX410
            </div>
          </div>

          {/* End Circle */}
          <div className="shrink-0 h-2 w-2 rounded-full border border-gray-300 bg-white"></div>
        </div>

        {/* Arrival Time */}
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold text-gray-800">{ARRIVAL_TIME}</div>
          <div className="mt-1 text-sm font-normal text-gray-800">ICN</div>
        </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 min-h-0 mt-8 overflow-y-auto pr-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activities.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <ProposalFormActivity
                  key={activity.id}
                  activity={activity}
                  onUpdate={handleActivityUpdate}
                  isFirst={index === 0}
                  isLast={index === activities.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex-shrink-0 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{validationError}</p>
        </div>
      )}

      {/* Save Changes Button */}
      <div className="flex-shrink-0 mt-8 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            // Calculate total duration of all activities
            const totalDuration = activities.reduce((sum, activity) => {
              return sum + activity.duration;
            }, 0);

            const flightDuration = getFlightDurationMinutes();

            // Validate that total duration equals flight duration
            if (totalDuration !== flightDuration) {
              const difference = Math.abs(totalDuration - flightDuration);
              const formattedDifference = formatDuration(difference);
              if (totalDuration > flightDuration) {
                setValidationError(
                  `Total activity duration (${formatDuration(totalDuration)}) exceeds flight duration (${formatDuration(flightDuration)}) by ${formattedDifference}. Please adjust activity durations.`
                );
              } else {
                setValidationError(
                  `Total activity duration (${formatDuration(totalDuration)}) is ${formattedDifference} less than flight duration (${formatDuration(flightDuration)}). Please adjust activity durations.`
                );
              }
              return;
            }

            // Clear validation error if validation passes
            setValidationError(null);

            // Handle save - you can add your save logic here
            console.log("Saving activities:", activities);
            // You can add toast notification or API call here
          }}
          className="bg-[#014A43] text-white hover:bg-[#013832]"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
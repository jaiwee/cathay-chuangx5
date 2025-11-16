"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
import {
  ProposalFormActivity,
  type ActivityData,
} from "@/components/ui/proposal-form-activity";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type FlightData = {
  id: string;
  origin_country: string;
  origin_airport: string;
  destination_country: string;
  destination_airport: string;
  departure_time: string;
  arrival_time: string;
  flight_code: string;
  duration: number;
};

type ActivityFromDB = {
  id: number | string;
  name: string;
  description: string;
  type: string;
  duration: number;
  start_time?: string;
  cathay_shop_item?: string | null;
};

// Calculate flight duration in minutes from times
function getFlightDurationMinutes(
  departureTime: string,
  arrivalTime: string
): number {
  const departure = parseTime(departureTime);
  const arrival = parseTime(arrivalTime);
  return arrival - departure;
}

// Format time from database timestamp (extracts "HH:MM" format)
function formatTimeFromDB(timeStr: string): string {
  try {
    const date = new Date(timeStr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      // Fallback: try to extract time from string directly
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, "0");
        const minutes = timeMatch[2];
        return `${hours}:${minutes}`;
      }
      return timeStr.substring(0, 5); // Last resort: take first 5 chars
    }

    // Extract hours and minutes from Date object
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    // Fallback: try to extract time pattern from string
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, "0");
      const minutes = timeMatch[2];
      return `${hours}:${minutes}`;
    }
    return timeStr.substring(0, 5); // Last resort
  }
}

// Format date from database timestamp (e.g., "Mon 16 Nov")
function formatDateFromDB(timeStr: string): string {
  try {
    const date = new Date(timeStr);
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${weekday} ${day} ${month}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
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
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

function calculateActivityTimes(
  activities: ActivityData[],
  departureTime: string
): ActivityData[] {
  if (activities.length === 0) return activities;

  let currentTime = parseTime(departureTime);

  return activities.map((activity) => {
    const duration = activity.duration;
    const startTime = formatTime(currentTime);

    // Update currentTime for next activity
    currentTime += duration;

    return {
      ...activity,
      start_time: startTime,
    };
  });
}

export function ProposalForm() {
  const router = useRouter();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [isLoadingFlight, setIsLoadingFlight] = useState(true);
  const [activitiesState, setActivitiesState] = useState<ActivityData[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showGenerating, setShowGenerating] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<number | null>(null);

  // Fetch flight data from Supabase - get latest form by created_at
  useEffect(() => {
    async function fetchFlightData() {
      try {
        console.log("Fetching latest form by created_at...");

        // Get the LATEST form by created_at timestamp
        const { data: formData, error: formError } = await supabase
          .from("form")
          .select(
            "id, origin_country, destination_country, flight_id, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        console.log("Latest form data:", formData);

        if (formError) {
          console.error("Error fetching form data:", formError);
          setIsLoadingFlight(false);
          return;
        }

        if (!formData || !formData.flight_id) {
          console.error("No form data or flight_id found");
          setIsLoadingFlight(false);
          return;
        }

        // Store the current form ID for activities fetch
        setCurrentFormId(formData.id);
        console.log("Current form ID:", formData.id);

        // Then, fetch flight details using flight_id
        const { data: flightDetails, error: flightError } = await supabase
          .from("flight")
          .select(
            "destination_airport, origin_airport, departure_time, arrival_time, flight_code, duration"
          )
          .eq("id", formData.flight_id)
          .single();

        console.log("Flight details:", flightDetails);

        if (flightError) {
          console.error("Error fetching flight details:", flightError);
          setIsLoadingFlight(false);
          return;
        }

        if (flightDetails) {
          // Combine form data with flight details
          setFlightData({
            id: formData.flight_id,
            origin_country: formData.origin_country,
            origin_airport: flightDetails.origin_airport,
            destination_country: formData.destination_country,
            destination_airport: flightDetails.destination_airport,
            departure_time: flightDetails.departure_time,
            arrival_time: flightDetails.arrival_time,
            flight_code: flightDetails.flight_code,
            duration: flightDetails.duration,
          } as FlightData);
        }
      } catch (error) {
        console.error("Error fetching flight data:", error);
      } finally {
        setIsLoadingFlight(false);
      }
    }

    fetchFlightData();
  }, []);

  // Fetch activities from Supabase - get all activities with current form_id
  useEffect(() => {
    if (!currentFormId) return;

    async function fetchActivities() {
      try {
        console.log("Fetching activities for form_id:", currentFormId);

        // Fetch all activities with the current form_id, ordered by start_time
        const { data, error } = await supabase
          .from("proposed_flight_activity")
          .select("*")
          .eq("form_id", currentFormId)
          .order("start_time", { ascending: true, nullsFirst: false });

        console.log("Activities fetch result:", {
          data,
          error,
          count: data?.length,
        });

        if (error) {
          console.error("Error fetching activities:", error);
          setIsLoadingActivities(false);
          return;
        }

        if (data && Array.isArray(data)) {
          console.log(
            `Activities data received: ${data.length} items for form_id ${currentFormId}`
          );

          // Map database fields to ActivityData format
          const mappedActivities: ActivityData[] = data.map(
            (activity: ActivityFromDB) => {
              // Use start_time from database if available, formatted to "HH:MM"
              const timeFromDB = activity.start_time
                ? formatTimeFromDB(activity.start_time)
                : "";

              return {
                id: activity.id.toString(),
                start_time: timeFromDB,
                name: activity.name || "",
                description: activity.description || "",
                type: activity.type || "",
                duration: activity.duration || 0,
                cathay_shop_item: activity.cathay_shop_item || null,
              };
            }
          );

          console.log("Mapped activities:", mappedActivities);

          // If times are missing from database, calculate them based on departure time and durations
          const hasAllTimes = mappedActivities.every(
            (activity) => activity.start_time
          );
          if (!hasAllTimes && flightData) {
            const departureTime = formatTimeFromDB(flightData.departure_time);
            const calculatedActivities = calculateActivityTimes(
              mappedActivities,
              departureTime
            );
            console.log(
              "Calculated activities with times:",
              calculatedActivities
            );
            setActivitiesState(calculatedActivities);
          } else {
            setActivitiesState(mappedActivities);
          }
        } else {
          console.log("No data received or data is not an array:", data);
          setActivitiesState([]);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivitiesState([]);
      } finally {
        setIsLoadingActivities(false);
      }
    }

    fetchActivities();
  }, [currentFormId, flightData]);

  // Get departure time from flight data
  const departureTime = flightData
    ? formatTimeFromDB(flightData.departure_time)
    : "";

  // Wrapper to ensure times are always calculated
  const setActivities = (updater: (prev: ActivityData[]) => ActivityData[]) => {
    setActivitiesState((prev) => {
      const updated = updater(prev);
      return calculateActivityTimes(updated, departureTime);
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

        // Prevent first and last activities from being moved
        if (oldIndex === 0 || oldIndex === items.length - 1) {
          return items; // Don't move first or last activity
        }

        // Prevent moving any activity to first or last position
        if (newIndex === 0 || newIndex === items.length - 1) {
          return items; // Don't allow moving to first or last position
        }

        return arrayMove(items, oldIndex, newIndex);
      });
      // Clear validation error when activities are reordered
      setValidationError(null);
    }
  };

  const isLoading = isLoadingFlight || isLoadingActivities;

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden px-6 py-4 relative min-w-0">
      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014A43]"></div>
            <p className="text-sm font-normal text-gray-800">
              Loading flight itinerary...
            </p>
          </div>
        </div>
      )}
      <div className="flex-shrink-0">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          Flight Itinerary
        </h1>

        <div className="mb-2 space-y-1 text-sm font-normal text-gray-800">
          {isLoadingFlight ? (
            <p>Loading flight data...</p>
          ) : flightData ? (
            <>
              <h2 className="text-xl text-gray-800 break-words">
                {formatDateFromDB(flightData.departure_time)}
              </h2>
            </>
          ) : (
            <p>No flight data available</p>
          )}
        </div>

        {flightData && (
          <div className="relative flex items-center py-0">
            {/* Departure Time */}
            <div className="flex flex-col items-start">
              <div className="text-2xl font-bold text-gray-800">
                {formatTimeFromDB(flightData.departure_time)}
              </div>
              <div className="mt-1 text-sm font-normal text-gray-800 break-words">
                {flightData.origin_airport}
              </div>
            </div>

            {/* Flight Timeline */}
            <div className="relative flex flex-1 items-center px-6">
              {/* Airplane Icon */}
              <div className="flex-shrink-0">
                <Plane className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
              </div>

              {/* Horizontal Line */}
              <div className="relative flex-1 mx-4">
                <div className="h-px bg-gray-300"></div>

                {/* Flight Duration */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full pb-2 text-sm font-normal text-gray-800 whitespace-nowrap">
                  {formatDuration(
                    flightData.duration ||
                      getFlightDurationMinutes(
                        formatTimeFromDB(flightData.departure_time),
                        formatTimeFromDB(flightData.arrival_time)
                      )
                  )}
                </div>

                {/* Flight Code */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 pt-2 text-sm font-normal text-gray-800 whitespace-nowrap">
                  {flightData.flight_code}
                </div>
              </div>

              {/* End Circle */}
              <div className="flex-shrink-0 h-2 w-2 rounded-full border border-gray-300 bg-white"></div>
            </div>

            {/* Arrival Time */}
            <div className="flex flex-col items-end">
              <div className="text-3xl font-bold text-gray-800">
                {formatTimeFromDB(flightData.arrival_time)}
              </div>
              <div className="mt-1 text-sm font-normal text-gray-800 break-words">
                {flightData.destination_airport}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className="flex-1 min-h-0 mt-4 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {isLoadingActivities ? (
            <div className="p-4 text-sm text-gray-600">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">No activities found</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activities.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4 min-w-0 w-full box-border">
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
          )}
        </ScrollArea>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex-shrink-0 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{validationError}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex-shrink-0 mt-8 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            // Calculate total duration of all activities
            const totalDuration = activities.reduce((sum, activity) => {
              return sum + activity.duration;
            }, 0);

            if (!flightData) {
              setValidationError("Flight data is required to submit.");
              return;
            }

            const flightDuration =
              flightData.duration ||
              getFlightDurationMinutes(
                formatTimeFromDB(flightData.departure_time),
                formatTimeFromDB(flightData.arrival_time)
              );

            // Validate that total duration equals flight duration
            if (totalDuration !== flightDuration) {
              const difference = Math.abs(totalDuration - flightDuration);
              const formattedDifference = formatDuration(difference);
              if (totalDuration > flightDuration) {
                setValidationError(
                  `Total activity duration (${formatDuration(
                    totalDuration
                  )}) exceeds flight duration (${formatDuration(
                    flightDuration
                  )}) by ${formattedDifference}. Please adjust activity durations.`
                );
              } else {
                setValidationError(
                  `Total activity duration (${formatDuration(
                    totalDuration
                  )}) is ${formattedDifference} less than flight duration (${formatDuration(
                    flightDuration
                  )}). Please adjust activity durations.`
                );
              }
              return;
            }

            // Clear validation error if validation passes
            setValidationError(null);

            // Handle save - you can add your save logic here
            console.log("Saving activities:", activities);

            // Show success popup
            setShowSuccessPopup(true);
            setShowGenerating(false);

            // Show "Generating Smart Recommendations..." after 1.5 seconds
            setTimeout(() => {
              setShowGenerating(true);
            }, 1500);

            // Navigate to smart-recommendation page after 5 seconds total (3.5 seconds of generating)
            setTimeout(() => {
              router.push("/smart-recommendation");
            }, 5000);
          }}
          className="bg-[#014A43] text-white hover:bg-[#013832]"
        >
          Submit
        </Button>
      </div>

      {/* Success Popup - Overlay on entire page */}
      {showSuccessPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none backdrop-blur-sm"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-md mx-4 flex flex-col items-center space-y-4 pointer-events-auto">
            {!showGenerating ? (
              <>
                <CheckCircle className="h-14 w-14 text-[#014A43]" />
                <p className="text-xl font-bold text-gray-800">
                  Submission Success
                </p>
                <p className="text-sm font-normal text-gray-800 text-center leading-relaxed">
                  Your flight itinerary has been successfully submitted!
                </p>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-[#014A43]"></div>
                <p className="text-xl font-bold text-gray-800">
                  Generating Smart Recommendations...
                </p>
                <p className="text-sm font-normal text-gray-800 text-center leading-relaxed">
                  Please wait while we create personalized recommendations for
                  your post-flight journey.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

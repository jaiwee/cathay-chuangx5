"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PipelineInput = {
  theme: "sports" | "music" | "corporate";
  event_name: string;
  event_date: string;
  event_time: string;
  event_location: {
    country: string;
    address: string;
  };
  origin_country: string;
  destination_country: string;
  flight_timing_preference: "morning" | "afternoon" | "evening";
  group_size: number;
};

type PipelineOutput = {
  route: string;
  departure: string;
  arrival: string;
  flight_number: string;
};

export default function PipelinePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PipelineInput>({
    theme: "music",
    event_name: "",
    event_date: "",
    event_time: "",
    event_location: {
      country: "",
      address: "",
    },
    origin_country: "",
    destination_country: "",
    flight_timing_preference: "morning",
    group_size: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process pipeline");
      }

      setResult(data.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...((formData as Record<string, unknown>)[parent] as Record<
            string,
            unknown
          >),
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">LLM Flight Pipeline</h1>
          <p className="text-muted-foreground">
            Enter event details to get AI-powered flight recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={formData.theme}
                  onValueChange={(value) => handleInputChange("theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_name">Event Name</Label>
                <Input
                  id="event_name"
                  value={formData.event_name}
                  onChange={(e) =>
                    handleInputChange("event_name", e.target.value)
                  }
                  placeholder="e.g. Coachella"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      handleInputChange("event_date", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_time">Event Time</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) =>
                      handleInputChange("event_time", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_country">Event Country</Label>
                <Input
                  id="event_country"
                  value={formData.event_location.country}
                  onChange={(e) =>
                    handleInputChange("event_location.country", e.target.value)
                  }
                  placeholder="e.g. United States"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_address">Event Address</Label>
                <Input
                  id="event_address"
                  value={formData.event_location.address}
                  onChange={(e) =>
                    handleInputChange("event_location.address", e.target.value)
                  }
                  placeholder="e.g. Indio, California"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin_country">Origin Country</Label>
                  <Input
                    id="origin_country"
                    value={formData.origin_country}
                    onChange={(e) =>
                      handleInputChange("origin_country", e.target.value)
                    }
                    placeholder="e.g. Singapore"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination_country">
                    Destination Country
                  </Label>
                  <Input
                    id="destination_country"
                    value={formData.destination_country}
                    onChange={(e) =>
                      handleInputChange("destination_country", e.target.value)
                    }
                    placeholder="e.g. United States"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight_timing_preference">
                  Flight Timing Preference
                </Label>
                <Select
                  value={formData.flight_timing_preference}
                  onValueChange={(value) =>
                    handleInputChange("flight_timing_preference", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group_size">Group Size</Label>
                <Input
                  id="group_size"
                  type="number"
                  min="1"
                  value={formData.group_size}
                  onChange={(e) =>
                    handleInputChange("group_size", parseInt(e.target.value))
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Generate Flight Recommendation"}
              </Button>
            </form>
          </div>

          {/* Output Display */}
          <div className="space-y-4">
            <div className="border rounded-lg p-6 bg-muted/50">
              <h2 className="text-xl font-semibold mb-4">
                Flight Recommendation
              </h2>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    AI is generating your flight recommendation...
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">Route</p>
                    <p className="font-semibold text-lg">{result.route}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Departure
                      </p>
                      <p className="font-semibold">{result.departure}</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">
                        Arrival
                      </p>
                      <p className="font-semibold">{result.arrival}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border">
                    <p className="text-sm text-muted-foreground mb-1">
                      Flight Number
                    </p>
                    <p className="font-semibold text-lg">
                      {result.flight_number}
                    </p>
                  </div>
                </div>
              )}

              {!result && !loading && !error && (
                <p className="text-muted-foreground text-center py-8">
                  Fill out the form and click &quot;Generate Flight
                  Recommendation&quot; to see results
                </p>
              )}
            </div>

            <div className="text-sm text-muted-foreground border rounded-lg p-4">
              <p className="font-semibold mb-2">About this Pipeline:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Uses Vercel AI SDK with Google Gemini</li>
                <li>Model: gemini-2.5-flash</li>
                <li>Structured output with Zod schema</li>
                <li>Real-time flight recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

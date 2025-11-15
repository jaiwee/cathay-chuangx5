import { createClient } from "@supabase/supabase-js";

// Create server-side Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be set in environment variables"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Don't persist session on server-side
    },
  });
}

// Get the latest form ID from the form table
export async function getLatestFormId(): Promise<number> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("form")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching latest form ID from Supabase:", error);
    throw new Error(`Failed to fetch latest form ID: ${error.message}`);
  }

  if (!data || !data.id) {
    throw new Error("No form found in database");
  }

  return data.id;
}

// Get form by ID
export async function getFormById(formId: number) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("form")
    .select("*")
    .eq("id", formId)
    .single();

  if (error) {
    console.error("Error fetching form by ID from Supabase:", error);
    throw new Error(`Failed to fetch form: ${error.message}`);
  }

  return data;
}

// Get flight ID by flight code
export async function getFlightIdByFlightCode(
  flightCode: string
): Promise<string | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("flight")
    .select("id")
    .eq("flight_code", flightCode)
    .single();

  if (error) {
    // If no flight found, return null instead of throwing
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching flight by flight code from Supabase:", error);
    throw new Error(`Failed to fetch flight: ${error.message}`);
  }

  return data?.id || null;
}

// Update form with flight_id
export async function updateFormWithFlightId(
  formId: number,
  flightId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("form")
    .update({ flight_id: flightId })
    .eq("id", formId);

  if (error) {
    console.error("Error updating form with flight_id:", error);
    throw new Error(`Failed to update form: ${error.message}`);
  }
}

// Helper function to determine activity type from activity name
function getActivityType(activityName: string): string {
  const name = activityName.toLowerCase();

  if (name.includes("take off") || name.includes("takeoff")) {
    return "Takeoff";
  }
  if (name.includes("landing")) {
    return "Landing";
  }
  if (
    name.includes("taste") ||
    name.includes("meal") ||
    name.includes("culinary") ||
    name.includes("dining") ||
    name.includes("food")
  ) {
    return "Culinary Experience";
  }
  if (
    name.includes("entertainment") ||
    name.includes("movie") ||
    name.includes("music") ||
    name.includes("show")
  ) {
    return "Entertainment";
  }
  if (
    name.includes("merchandise") ||
    name.includes("shop") ||
    name.includes("store")
  ) {
    return "Merchandise";
  }

  // Default to "Meal" for activities that don't match above patterns
  return "Meal";
}

// Insert proposed flight activity
export async function insertProposedFlightActivity(
  formId: number,
  activity: {
    startTime: string;
    duration: number;
    activityName: string;
    description: string;
    featured_cathay_items?: string | null;
  }
): Promise<void> {
  const supabase = getSupabaseClient();

  const activityType = getActivityType(activity.activityName);

  const { error } = await supabase.from("proposed_flight_activity").insert({
    form_id: formId,
    start_time: activity.startTime,
    duration: activity.duration,
    type: activityType,
    name: activity.activityName,
    description: activity.description,
    cathay_shop_item: activity.featured_cathay_items || null,
  });

  if (error) {
    console.error("Error inserting proposed flight activity:", error);
    throw new Error(
      `Failed to insert proposed flight activity: ${error.message}`
    );
  }
}

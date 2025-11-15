import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.json();

    const { data, error } = await supabase.from("form").insert([formData]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ success: false, error: "Failed to submit plan" }, { status: 500 });
  }
}
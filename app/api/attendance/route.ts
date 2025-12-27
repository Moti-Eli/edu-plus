import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// שליפת רשומות - רק של המשתמש הנוכחי
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// הוספת רשומה
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { school_name, city, date, start_time, end_time, hours, instructor_name } = body;

  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      user_id: user.id,
      school_name,
      city: city || null,
      date,
      start_time,
      end_time,
      hours,
      instructor_name: instructor_name || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
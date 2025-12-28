import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// בדיקה אם תאריך הוא מהחודש הנוכחי
const isCurrentMonth = (date: string) => {
  const recordDate = new Date(date);
  const now = new Date();
  return recordDate.getMonth() === now.getMonth() && 
         recordDate.getFullYear() === now.getFullYear();
};

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
  const { school_name, city, date, hours, notes } = body;

  // בדיקה שהתאריך הוא מהחודש הנוכחי
  if (!isCurrentMonth(date)) {
    return NextResponse.json({ error: "לא ניתן להוסיף דיווחים לחודשים קודמים" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("attendance_records")
    .insert({
      user_id: user.id,
      school_name,
      city: city || null,
      date,
      hours,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// מחיקת רשומה
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // קודם נבדוק את התאריך של הרשומה
  const { data: record } = await supabase
    .from("attendance_records")
    .select("date")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!record) {
    return NextResponse.json({ error: "רשומה לא נמצאה" }, { status: 404 });
  }

  // בדיקה שהתאריך הוא מהחודש הנוכחי
  if (!isCurrentMonth(record.date)) {
    return NextResponse.json({ error: "לא ניתן למחוק דיווחים מחודשים קודמים" }, { status: 403 });
  }

  const { error } = await supabase
    .from("attendance_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
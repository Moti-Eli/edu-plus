import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // שליפת בתי ספר ייחודיים מטבלת מערכת השעות
  const { data, error } = await supabase
    .from("schedules")
    .select("school_name, city")
    .order("school_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // הסרת כפילויות
  const uniqueSchools = new Map();
  data?.forEach((item) => {
    if (!uniqueSchools.has(item.school_name)) {
      uniqueSchools.set(item.school_name, {
        id: item.school_name,
        name: item.school_name,
        cities: { name: item.city }
      });
    }
  });

  return NextResponse.json(Array.from(uniqueSchools.values()));
}
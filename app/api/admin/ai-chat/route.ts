import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // בדיקה שזה מנהל
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { message, apiKey, systemPrompt } = body;

  if (!apiKey) {
    return NextResponse.json({ error: "חסר מפתח API" }, { status: 400 });
  }

  try {
    // שליפת נתונים מהמערכת
    const [
      { data: users },
      { data: attendance },
      { data: adminAttendance },
      { data: schedules }
    ] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, role"),
      supabase.from("attendance_records").select("*, profiles(full_name, email)").order("date", { ascending: false }).limit(100),
      supabase.from("admin_attendance_records").select("*").order("date", { ascending: false }).limit(100),
      supabase.from("schedules").select("*")
    ]);

    // בניית context עם הנתונים
    const dataContext = `
נתוני המערכת:

משתמשים (${users?.length || 0}):
${users?.map(u => `- ${u.full_name || u.email} (${u.role})`).join("\n") || "אין"}

דיווחי נוכחות אחרונים (${attendance?.length || 0}):
${attendance?.map(r => `- ${r.profiles?.full_name || "?"}: ${r.school_name}, ${r.city}, ${new Date(r.date).toLocaleDateString("he-IL")}, ${r.hours} שעות`).join("\n") || "אין"}

דיווחי מנהל (${adminAttendance?.length || 0}):
${adminAttendance?.map(r => `- ${r.instructor_name}: ${r.school_name}, ${r.city}, ${new Date(r.date).toLocaleDateString("he-IL")}, ${r.hours} שעות`).join("\n") || "אין"}

מערכת שעות (${schedules?.length || 0}):
${schedules?.map(s => `- ${s.school_name} (${s.city}): ${s.day_of_week}, ${s.instructor_name || "ללא מדריך"}, ${s.hours_count} שעות`).join("\n") || "אין"}
`;

    const fullSystemPrompt = `${systemPrompt || "אתה עוזר למנהל מערכת נוכחות. ענה בעברית."}

${dataContext}

בהתבסס על הנתונים למעלה, ענה על שאלות המשתמש.`;

    // שליחה ל-OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const error = await openaiRes.json();
      return NextResponse.json({ error: error.error?.message || "שגיאה ב-OpenAI" }, { status: 500 });
    }

    const openaiData = await openaiRes.json();
    const response = openaiData.choices[0]?.message?.content || "לא התקבלה תשובה";

    return NextResponse.json({ response });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "שגיאה בתקשורת עם ה-AI" }, { status: 500 });
  }
}
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import AttendanceForm from "@/components/AttendanceForm";
import { Suspense } from "react";

async function InstructorContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const userName = profile?.full_name || user.email || "מדריך";

  return (
    <>
      <Header userName={userName} isAdmin={false} />
      <AttendanceForm />
    </>
  );
}

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <Suspense fallback={<div className="text-center p-8">טוען...</div>}>
        <InstructorContent />
      </Suspense>
    </div>
  );
}
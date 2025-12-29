"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function PortalPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      setUser(user);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profile);
      setLoading(false);
    }
    
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-xl text-gray-600">טוען...</div>
      </div>
    );
  }

  const role = profile?.role || "instructor";
  const fullName = profile?.full_name || user?.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Image src="/logo.png" alt="חינוך פלוס" width={120} height={45} className="object-contain" />
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">אזור אישי</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">שלום, {fullName}</span>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="text-gray-500 hover:text-red-600 transition-colors text-sm"
              >
                התנתק
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">שלום, {fullName} 👋</h1>
          <p className="text-gray-600">ברוכים הבאים לאזור האישי שלך במערכת חינוך פלוס</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(role === "instructor" || role === "admin") && (
            <Link href="/instructor" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">דיווח נוכחות</h3>
              <p className="text-gray-600 text-sm">דיווח שעות עבודה, צפייה בהיסטוריה ומעקב אחר שעות</p>
            </Link>
          )}

          {role === "admin" && (
            <Link href="/admin" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ניהול מערכת</h3>
              <p className="text-gray-600 text-sm">ניהול משתמשים, צפייה בדוחות ואישור שעות</p>
            </Link>
          )}

          <Link href="/auth/update-password" className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🔑</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">שינוי סיסמה</h3>
            <p className="text-gray-600 text-sm">עדכון סיסמה והגדרות אבטחה</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
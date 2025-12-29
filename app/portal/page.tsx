import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from 'next/cache';

export default async function PortalPage() {
  noStore();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // אם לא מחובר - הפנה ל-login
  if (!user) {
    redirect("/auth/login");
  }

  // קבל את פרטי המשתמש
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "instructor";
  const fullName = profile?.full_name || user.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Image 
                src="/logo.png" 
                alt="חינוך פלוס" 
                width={120} 
                height={45}
                className="object-contain"
              />
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">אזור אישי</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">שלום, {fullName}</span>
              <form action="/auth/logout" method="post">
                <button 
                  type="submit"
                  className="text-gray-500 hover:text-red-600 transition-colors text-sm"
                >
                  התנתק
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            שלום, {fullName} 👋
          </h1>
          <p className="text-gray-600">
            ברוכים הבאים לאזור האישי שלך במערכת חינוך פלוס
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* מערכת נוכחות - למדריכים */}
          {(role === "instructor" || role === "admin") && (
            <Link 
              href="/instructor"
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📋
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">דיווח נוכחות</h3>
              <p className="text-gray-600 text-sm">
                דיווח שעות עבודה, צפייה בהיסטוריה ומעקב אחר שעות
              </p>
              <div className="mt-4 text-emerald-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                כניסה למערכת
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          )}

          {/* לוח בקרה - למנהלים */}
          {role === "admin" && (
            <Link 
              href="/admin"
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ניהול מערכת</h3>
              <p className="text-gray-600 text-sm">
                ניהול משתמשים, צפייה בדוחות ואישור שעות
              </p>
              <div className="mt-4 text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                כניסה לניהול
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          )}

          {/* הגדרות חשבון */}
          <Link 
            href="/auth/update-password"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🔑
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">שינוי סיסמה</h3>
            <p className="text-gray-600 text-sm">
              עדכון סיסמה והגדרות אבטחה
            </p>
            <div className="mt-4 text-gray-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              לעדכון סיסמה
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>

          {/* תוכנית AI - בקרוב */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 opacity-60">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              🤖
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">תוכנית AI</h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">בקרוב</span>
            </div>
            <p className="text-gray-600 text-sm">
              כלים ומשאבים ללמידת בינה מלאכותית
            </p>
          </div>

          {/* פיזיקה - בקרוב */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 opacity-60">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-2xl mb-4">
              ⚛️
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900">פיזיקה</h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">בקרוב</span>
            </div>
            <p className="text-gray-600 text-sm">
              משאבים ותכנים לתוכנית הפיזיקה
            </p>
          </div>

        </div>

        {/* Info Box */}
        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold text-emerald-900 mb-1">צריכים עזרה?</h4>
              <p className="text-emerald-700 text-sm">
                לשאלות ותמיכה ניתן לפנות למנהל המערכת או לשלוח מייל ל-
                <a href="mailto:support@edu-plus.co.il" className="underline">support@edu-plus.co.il</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2025 חינוך פלוס. כל הזכויות שמורות.
        </div>
      </footer>
    </div>
  );
}
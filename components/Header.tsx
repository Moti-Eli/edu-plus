"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type HeaderProps = {
  userName?: string;
  isAdmin?: boolean;
};

export default function Header({ userName, isAdmin }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">👋 שלום, {userName || "משתמש"}!</h1>
        
        {isAdmin && (
          <nav className="flex gap-2 mr-4">
            <Link
              href="/admin"
              className={`px-3 py-1 rounded ${
                pathname === "/admin" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              ניהול
            </Link>
            <Link
              href="/instructor"
              className={`px-3 py-1 rounded ${
                pathname === "/instructor" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              דיווח שעות
            </Link>
          </nav>
        )}
      </div>
      
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        התנתק
      </button>
    </header>
  );
}
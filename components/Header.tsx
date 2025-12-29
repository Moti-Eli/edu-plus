"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

type HeaderProps = {
  userName?: string;
  isAdmin?: boolean;
};

export default function Header({ userName, isAdmin }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Image 
          src="/logo.png" 
          alt="חינוך פלוס" 
          width={120} 
          height={50}
          className="object-contain"
        />
        <h1 className="text-2xl font-bold"> שלום, {userName || "משתמש"}!</h1>
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
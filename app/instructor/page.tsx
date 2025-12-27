"use client";

import { useState, useEffect } from "react";
import Chat from "@/components/Chat";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

export default function InstructorPage() {
  const [profile, setProfile] = useState<{ full_name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center" dir="rtl">
        <p>טוען...</p>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-100 p-6" dir="rtl">
      <Header 
        userName={profile?.full_name || "מדריך"} 
        isAdmin={isAdmin} 
      />
      <Chat userName={isAdmin ? profile?.full_name : undefined} isAdmin={isAdmin} />
    </div>
  );
}
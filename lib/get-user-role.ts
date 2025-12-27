import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

export const getUserRole = cache(async (): Promise<'admin' | 'instructor' | null> => {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  return profile?.role || 'instructor';
});
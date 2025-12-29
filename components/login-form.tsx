"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/portal");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props} dir="rtl">
      {/* לוגו וכותרת */}
      <div className="text-center mb-4">
        <Link href="/" className="inline-block">
          <Image 
            src="/logo.png" 
            alt="חינוך פלוס" 
            width={180} 
            height={70}
            className="object-contain mx-auto mb-4 hover:opacity-80 transition-opacity"
          />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">כניסה לאזור אישי</h1>
        <p className="text-gray-500 text-sm">מערכת חינוך פלוס</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">התחברות</CardTitle>
          <CardDescription>הכנס את פרטי החשבון שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">סיסמה</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="mr-auto inline-block text-sm underline-offset-4 hover:underline text-blue-600"
                  >
                    שכחת סיסמה?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "מתחבר..." : "התחברות"}
              </Button>
            </div>
          </form>
          
          {/* הודעה למי שאין לו חשבון */}
          <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            <p>אין לך חשבון?</p>
            <p className="mt-1">פנה למנהל המערכת לקבלת פרטי גישה</p>
          </div>
        </CardContent>
      </Card>

      {/* קישור חזרה לדף הבית */}
      <div className="text-center">
        <Link 
          href="/"
          className="text-gray-500 hover:text-gray-700 text-sm inline-flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}
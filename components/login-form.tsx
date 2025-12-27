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
      router.push("/protected");
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
        <div className="text-5xl mb-2">📋</div>
        <h1 className="text-2xl font-bold text-gray-800">מערכת נוכחות</h1>
        <p className="text-gray-500 text-sm">ניהול שעות עבודה למדריכים</p>
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
            <div className="mt-4 text-center text-sm">
              אין לך חשבון?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 text-blue-600"
              >
                הרשמה
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("הסיסמאות לא תואמות");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
          <CardTitle className="text-2xl">הרשמה</CardTitle>
          <CardDescription>צור חשבון חדש למערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="ישראל ישראלי"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
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
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="לפחות 6 תווים"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">אימות סיסמה</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="הקלד שוב את הסיסמה"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "יוצר חשבון..." : "הרשמה"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              כבר יש לך חשבון?{" "}
              <Link href="/auth/login" className="underline underline-offset-4 text-blue-600">
                התחברות
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
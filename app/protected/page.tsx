import { getUserRole } from "@/lib/get-user-role";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const role = await getUserRole();
  
  if (!role) redirect("/auth/login");
  
  // הפניה לפי role
  if (role === "admin") {
    redirect("/admin");
  } else {
    redirect("/instructor");
  }
}
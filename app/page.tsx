import { redirect } from "next/navigation";

export default function RootPage() {
  // Simplemente redirigimos al usuario a la ruta de login
  redirect("/login");
}
export interface User {
  username: string
  password: string
  role: "propietario" | "asistente" | "tutor"
  name: string
}

export const users: User[] = [
  { username: "admin01", password: "1234", role: "propietario", name: "Admin Principal" },
  { username: "asistente01", password: "1234", role: "asistente", name: "Asistente de Ruta" },
  { username: "tutor01", password: "1234", role: "tutor", name: "Padre de Familia" },
]

export function validateCredentials(username: string, password: string): User | null {
  const user = users.find((u) => u.username === username && u.password === password)
  return user || null
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case "propietario":
      return "/dashboard/propietario"
    case "asistente":
      return "/dashboard/asistente"
    case "tutor":
      return "/dashboard/tutor"
    default:
      return "/"
  }
}

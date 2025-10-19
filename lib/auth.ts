export interface User {
  email: string
  password: string
  role: "propietario" | "asistente" | "tutor"
  name: string
}

export const users: User[] = [
  {
    email: "propietario@recorrido.com",
    password: "1234",
    role: "propietario",
    name: "Admin Principal",
  },
  {
    email: "asistente@recorrido.com",
    password: "1234",
    role: "asistente",
    name: "Asistente de Ruta",
  },
  {
    email: "tutor@recorrido.com",
    password: "1234",
    role: "tutor",
    name: "Padre de Familia",
  },
]

export function validateCredentials(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email && u.password === password)
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

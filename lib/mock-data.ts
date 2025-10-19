// Mock data for the application
export interface Alumno {
  id: string
  nombre: string
  tutor: string
  grado: string
  contacto: string
  activo: boolean
}

export interface Pago {
  id: string
  alumnoId: string
  alumnoNombre: string
  monto: number
  mes: string
  fecha: string
  estado: "pagado" | "pendiente"
}

export interface Personal {
  id: string
  nombre: string
  cargo: "chofer" | "asistente"
  telefono: string
  activo: boolean
}

export interface Vehiculo {
  id: string
  placa: string
  modelo: string
  choferId: string
  choferNombre: string
  estado: "operativo" | "mantenimiento"
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: "propietario" | "asistente" | "tutor"
  activo: boolean
}

export interface Aviso {
  id: string
  titulo: string
  mensaje: string
  fecha: string
  destinatarios: string[]
}

export interface Asistencia {
  id: string
  alumnoId: string
  alumnoNombre: string
  fecha: string
  presente: boolean
  hora: string
}

// Mock data
export const mockAlumnos: Alumno[] = [
  { id: "1", nombre: "Juan Pérez", tutor: "María Pérez", grado: "3° Primaria", contacto: "555-0101", activo: true },
  { id: "2", nombre: "Ana García", tutor: "Carlos García", grado: "5° Primaria", contacto: "555-0102", activo: true },
  {
    id: "3",
    nombre: "Luis Martínez",
    tutor: "Laura Martínez",
    grado: "2° Primaria",
    contacto: "555-0103",
    activo: true,
  },
]

export const mockPagos: Pago[] = [
  {
    id: "1",
    alumnoId: "1",
    alumnoNombre: "Juan Pérez",
    monto: 800,
    mes: "Enero 2025",
    fecha: "2025-01-05",
    estado: "pagado",
  },
  {
    id: "2",
    alumnoId: "2",
    alumnoNombre: "Ana García",
    monto: 800,
    mes: "Enero 2025",
    fecha: "2025-01-08",
    estado: "pagado",
  },
  {
    id: "3",
    alumnoId: "3",
    alumnoNombre: "Luis Martínez",
    monto: 800,
    mes: "Enero 2025",
    fecha: "",
    estado: "pendiente",
  },
]

export const mockPersonal: Personal[] = [
  { id: "1", nombre: "Roberto Sánchez", cargo: "chofer", telefono: "555-0201", activo: true },
  { id: "2", nombre: "Carmen López", cargo: "asistente", telefono: "555-0202", activo: true },
  { id: "3", nombre: "Diego Ramírez", cargo: "chofer", telefono: "555-0203", activo: true },
]

export const mockVehiculos: Vehiculo[] = [
  {
    id: "1",
    placa: "ABC-123",
    modelo: "Mercedes Sprinter 2020",
    choferId: "1",
    choferNombre: "Roberto Sánchez",
    estado: "operativo",
  },
  {
    id: "2",
    placa: "XYZ-789",
    modelo: "Ford Transit 2019",
    choferId: "3",
    choferNombre: "Diego Ramírez",
    estado: "operativo",
  },
]

export const mockUsuarios: Usuario[] = [
  { id: "1", nombre: "Admin Principal", email: "propietario@recorrido.com", rol: "propietario", activo: true },
  { id: "2", nombre: "Asistente de Ruta", email: "asistente@recorrido.com", rol: "asistente", activo: true },
  { id: "3", nombre: "Padre de Familia", email: "tutor@recorrido.com", rol: "tutor", activo: true },
]

export const mockAvisos: Aviso[] = [
  {
    id: "1",
    titulo: "Inicio de clases",
    mensaje: "Les recordamos que el inicio de clases es el 8 de enero.",
    fecha: "2025-01-02",
    destinatarios: ["tutores"],
  },
  {
    id: "2",
    titulo: "Mantenimiento de vehículo",
    mensaje: "El vehículo ABC-123 estará en mantenimiento el viernes.",
    fecha: "2025-01-10",
    destinatarios: ["personal"],
  },
]

export const mockAsistencias: Asistencia[] = [
  {
    id: "1",
    alumnoId: "1",
    alumnoNombre: "Juan Pérez",
    fecha: "2025-01-15",
    presente: true,
    hora: "07:30",
  },
  {
    id: "2",
    alumnoId: "2",
    alumnoNombre: "Ana García",
    fecha: "2025-01-15",
    presente: true,
    hora: "07:35",
  },
  {
    id: "3",
    alumnoId: "3",
    alumnoNombre: "Luis Martínez",
    fecha: "2025-01-15",
    presente: false,
    hora: "",
  },
]

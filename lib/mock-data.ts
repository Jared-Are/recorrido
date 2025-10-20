// --- DEFINICIÓN DE TIPOS UNIFICADA ---

export type Alumno = {
  id: string;
  nombre: string;
  tutor: string;
  grado: string;
  contacto: string;
  activo: boolean;
  precio?: number; // Opcional para la lógica de pagos
   direccion: string // <-- CAMPO AÑADIDO
  recorridoId: 'recorridoA' | 'recorridoB' // <-- TIPO ACTUALIZADO
};

export type Pago = {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  monto: number;
  mes: string;
  fecha: string; // Formato YYYY-MM-DD
  estado: "pagado" | "pendiente";
};

export type Personal = {
  id: string;
  nombre: string;
  cargo: "chofer" | "asistente";
  telefono: string;
  activo: boolean;
};

export type Vehiculo = {
  id: string;
  placa: string;
  modelo: string;
  choferId: string;
  choferNombre: string;
  estado: "operativo" | "mantenimiento";
};

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: "propietario" | "asistente" | "tutor";
  activo: boolean;
};

export type Aviso = {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string; // Formato YYYY-MM-DD
  destinatarios: ("tutores" | "personal" | "todos")[];
};

export type Asistencia = {
  id: string;
  alumnoId: string;
  alumnoNombre: string;
  fecha: string; // Formato YYYY-MM-DD
  presente: boolean;
  hora?: string;
};

export type Gasto = {
  id: string
  descripcion: string
  monto: number
  categoria: string
  fecha: string
  microbus?: string // 👈 agregado
}



// --- DATOS DE MUESTRA COMPLETOS ---

export const mockAlumnos: Alumno[] = [
  // --- CAMBIO AQUÍ: LOS 3 ALUMNOS AHORA PERTENECEN A "María Pérez" ---
  { id: "1", nombre: "Juan Pérez", tutor: "María Pérez", grado: "3° Primaria", contacto: "555-0101", activo: true, precio: 850, direccion: "Calle Ficticia 123, Zona A", recorridoId: 'recorridoA' },
  { id: "2", nombre: "Ana García", tutor: "María Pérez", grado: "5° Primaria", contacto: "555-0101", activo: true, precio: 850, direccion: "Calle Ficticia 123, Zona A", recorridoId: 'recorridoA' },
  { id: "3", nombre: "Luis Martínez", tutor: "María Pérez", grado: "2° Primaria", contacto: "555-0101", activo: false, precio: 850, direccion: "Calle Ficticia 123, Zona A", recorridoId: 'recorridoA' },
];

export const mockPagos: Pago[] = [
  { id: "p1", alumnoId: "1", alumnoNombre: "Juan Pérez", monto: 850, mes: "Octubre 2025", fecha: "2025-10-05", estado: "pagado" },
  { id: "p2", alumnoId: "1", alumnoNombre: "Juan Pérez", monto: 850, mes: "Noviembre 2025", fecha: "", estado: "pendiente" },
  { id: "p3", alumnoId: "2", alumnoNombre: "Ana García", monto: 850, mes: "Octubre 2025", fecha: "2025-10-03", estado: "pagado" },
  { id: "p4", alumnoId: "3", alumnoNombre: "Luis Martínez", monto: 850, mes: "Octubre 2025", fecha: "", estado: "pendiente" },
];

export const mockPersonal: Personal[] = [
  { id: "per1", nombre: "Roberto Sánchez", cargo: "chofer", telefono: "555-0201", activo: true },
  { id: "per2", nombre: "Carmen López", cargo: "asistente", telefono: "555-0202", activo: true },
  { id: "per3", nombre: "Diego Ramírez", cargo: "chofer", telefono: "555-0203", activo: true },
];

export const mockVehiculos: Vehiculo[] = [
  { id: "v1", placa: "ABC-123", modelo: "Mercedes Sprinter 2020", choferId: "per1", choferNombre: "Roberto Sánchez", estado: "operativo" },
  { id: "v2", placa: "XYZ-789", modelo: "Ford Transit 2019", choferId: "per3", choferNombre: "Diego Ramírez", estado: "operativo" },
];

export const mockUsuarios: Usuario[] = [
  { id: "u1", nombre: "Admin Principal", email: "propietario@recorrido.com", rol: "propietario", activo: true },
  { id: "u2", nombre: "Asistente de Ruta", email: "asistente@recorrido.com", rol: "asistente", activo: true },
  { id: "u3", nombre: "Padre de Familia", email: "tutor@recorrido.com", rol: "tutor", activo: true },
];

export const mockGastos: Gasto[] = [
  { id: 'g1', descripcion: 'Gasolina para Bus 01 y 02', monto: 1250, categoria: 'combustible', fecha: '2025-10-15', microbus: '01 y 02' },
  { id: 'g2', descripcion: 'Pago quincena a choferes', monto: 15000, categoria: 'salarios', fecha: '2025-10-15', microbus: 'Todos' },
  { id: 'g3', descripcion: 'Cambio de llantas Bus 03', monto: 4800, categoria: 'mantenimiento', fecha: '2025-10-10', microbus: '03' },
  { id: 'g4', descripcion: 'Compra de botiquín', monto: 550, categoria: 'otros', fecha: '2025-09-28', microbus: '01' },
];
export const mockAvisos: Aviso[] = [
  { id: "av1", titulo: "Suspensión de clases", mensaje: "Se les informa que el día de mañana se suspenden las clases.", fecha: "2025-10-25", destinatarios: ["tutores", "personal"] },
  { id: "av2", titulo: "Recordatorio de Pago", mensaje: "La fecha límite para el pago de Noviembre es el día 5.", fecha: "2025-10-28", destinatarios: ["tutores"] },
];

export const mockAsistencias: Asistencia[] = [
  { id: "a1", alumnoId: "1", alumnoNombre: "Juan Pérez", fecha: "2025-10-20", presente: true, hora: "07:05 AM" },
  { id: "a2", alumnoId: "1", alumnoNombre: "Juan Pérez", fecha: "2025-10-21", presente: false },
  { id: "a3", alumnoId: "2", alumnoNombre: "Ana García", fecha: "2025-10-20", presente: true, hora: "07:08 AM" },
  { id: "a4", alumnoId: "2", alumnoNombre: "Ana García", fecha: "2025-10-21", presente: true, hora: "07:06 AM" },
  { id: "a5", alumnoId: "3", alumnoNombre: "Luis Martínez", fecha: "2025-10-20", presente: true, hora: "07:10 AM" },
];


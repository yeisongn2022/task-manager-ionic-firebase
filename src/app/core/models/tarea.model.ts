export interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
  categoriaId: string;
  fecha: number; // Necesario para los filtros de Hoy/Semana
  prioridad: string; // 'alta', 'media', 'baja'
}
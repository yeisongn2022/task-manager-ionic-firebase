export interface Categoria {
  id: number;
  nombre: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
  categoriaId: number;
}
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { TareaService } from '../core/services/tarea.service';
import { CategoriaService } from '../core/services/categoria.service';
import { Tarea } from '../core/models/tarea.model';
import { Categoria } from '../core/models/categoria.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class HomePage implements OnInit {
  // Datos
  tareasOriginales: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  categorias: Categoria[] = [];

  // Filtros y Búsqueda
  textoBusqueda: string = '';
  filtroCategoriaId: any = -1; // -1 es "Todas las categorías"
  filtroTiempo: string = 'todas'; // Filtro de los segmentos

  // Modales
  isTaskModalOpen = false;
  tareaActual: any = null; // Sirve tanto para crear como para editar
  isModalCategoriasOpen = false;
  isCategoryCreateModalOpen = false;
  nuevaCatNombre: string = '';
  categoriaActual: any = { id: null, nombre: '' };
  fechaISO: string = '';

  // Inyección
  public tareaService = inject(TareaService);
  public categoriaService = inject(CategoriaService);
  private toastCtrl = inject(ToastController);

  ngOnInit() {
    this.categoriaService.getCategorias().subscribe(res => {
      this.categorias = res;
    });

    this.tareaService.getTareas().subscribe(res => {
      this.tareasOriginales = res;
      this.aplicarFiltro();
    });
  }

  // --- LÓGICA DE FILTROS ---
  aplicarFiltro() {
    let filtradas = this.tareasOriginales;

    // 1. Filtro por Buscador de Texto
    if (this.textoBusqueda.trim() !== '') {
      const texto = this.textoBusqueda.toLowerCase();
      filtradas = filtradas.filter(t => t.titulo.toLowerCase().includes(texto));
    }

    // 2. Filtro por Categoría (Sidebar)
    if (this.filtroCategoriaId !== -1) {
      filtradas = filtradas.filter(t => t.categoriaId === this.filtroCategoriaId);
    }

    // 3. Filtro por Segmentos (Tiempo/Estado)
    const hoy = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(hoy.getDate() - 7);

    switch (this.filtroTiempo) {
      case 'hoy':
        filtradas = filtradas.filter(t => {
          if (!t.fecha) return false;
          return new Date(t.fecha).toDateString() === hoy.toDateString();
        });
        break;
      case 'semana':
        filtradas = filtradas.filter(t => {
          if (!t.fecha) return false;
          return t.fecha >= haceUnaSemana.getTime();
        });
        break;
      case 'completadas':
        filtradas = filtradas.filter(t => t.completada === true);
        break;
      case 'prioridad':
        filtradas = filtradas.filter(t => t.prioridad === 'alta' || t.prioridad === 'media');
        break;
      case 'atrasadas':
        // Mayores a una semana, no completadas y sin prioridad alta/media
        filtradas = filtradas.filter(t => {
          if (!t.fecha) return false;
          const esVieja = t.fecha < haceUnaSemana.getTime();
          const noCompletada = !t.completada;
          const sinPrioridad = !t.prioridad || t.prioridad === 'baja';
          return esVieja && noCompletada && sinPrioridad;
        });
        break;
    }

    this.tareasFiltradas = filtradas;
  }

  // --- GESTIÓN DE TAREAS ---
  
  // Abre el modal tanto para Crear (sin pasar tarea) como para Editar (pasando tarea)
  abrirModalTarea(tarea?: Tarea) {
    if (tarea) {
      this.tareaActual = { ...tarea }; // Clonamos para editar
      this.fechaISO = new Date(this.tareaActual.fecha).toISOString();
    } else {
      // Valores por defecto para una nueva tarea
      this.tareaActual = { titulo: '', categoriaId: 0, prioridad: 'baja', completada: false, fecha: Date.now() };
      this.fechaISO = new Date().toISOString();
    }
    this.isTaskModalOpen = true;
  }

  cerrarModalTarea() {
    this.isTaskModalOpen = false;
    this.tareaActual = null;
  }

  async guardarTarea() {
    if (this.tareaActual && this.tareaActual.titulo.trim().length > 0) {
      try {
        this.tareaActual.fecha = new Date(this.fechaISO).getTime();
        if (this.tareaActual.id) {
          // Es una edición (Asegúrate de que tu servicio soporte esto)
          await this.tareaService.editarTarea(this.tareaActual.id, {
            titulo: this.tareaActual.titulo,
            categoriaId: this.tareaActual.categoriaId,
            prioridad: this.tareaActual.prioridad,
            fecha: this.tareaActual.fecha
          });
          this.presentToast('Tarea actualizada correctamente');
        } else {
          // Es una creación nueva (Asegúrate de que tu servicio acepte la prioridad)
          await this.tareaService.agregarTarea(this.tareaActual.titulo, this.tareaActual.categoriaId, this.tareaActual.prioridad, this.tareaActual.fecha);
          // Nota: Si agregas prioridad al servicio, sería: agregarTarea(titulo, categoriaId, prioridad)
          this.presentToast('¡Tarea agregada!');
        }
        
        this.cerrarModalTarea();
        this.aplicarFiltro();
      } catch (error) {
        this.presentToast('Error al procesar la tarea', 'danger');
      }
    }
  }

  async eliminar(id: any) {
    await this.tareaService.eliminarTarea(id);
    this.presentToast('Tarea eliminada', 'danger');
  }

  actualizarEstado(t: Tarea) {
    this.tareaService.actualizarEstado(t.id, t.completada);
  }

  // --- GESTIÓN DE CATEGORÍAS ---

  abrirModalCategoria(categoria?: Categoria) {
    if (categoria) {
      // Si recibimos una categoría, estamos editando
      this.categoriaActual = { ...categoria };
    } else {
      // Si no, estamos creando una nueva
      this.categoriaActual = { id: null, nombre: '' };
    }
    this.isCategoryCreateModalOpen = true;
  }
  
  setModalCategorias(isOpen: boolean) {
    this.isModalCategoriasOpen = isOpen;
  }

  abrirModalNuevaCategoria() {
    this.nuevaCatNombre = '';
    this.isCategoryCreateModalOpen = true;
  }

  cerrarModalCategoria() {
    this.isCategoryCreateModalOpen = false;
    this.categoriaActual = { id: null, nombre: '' };
  }

  getNombreCategoria(id: any) {
    const c = this.categorias.find(cat => cat.id === id);
    return c ? c.nombre : 'Sin categoría';
  }

  async guardarCategoria() {
    const nombreLimpio = this.categoriaActual.nombre.trim();
    
    if (nombreLimpio.length > 0) {
      try {
        if (this.categoriaActual.id) {
          // Lógica de Edición
          await this.categoriaService.editarCategoria(this.categoriaActual.id, nombreLimpio);
          this.presentToast('Categoría actualizada');
        } else {
          // Lógica de Creación
          await this.categoriaService.agregarCategoria(nombreLimpio);
          this.presentToast('Categoría creada con éxito');
        }
        this.cerrarModalCategoria();
      } catch (error) {
        this.presentToast('Error al procesar la categoría', 'danger');
      }
    }
  }

  async editarCat(cat: Categoria) {
    this.abrirModalCategoria(cat);
  }

  async borrarCat(cat: Categoria) {
    if (confirm(`¿Eliminar la categoría "${cat.nombre}" definitivamente?`)) {
      await this.categoriaService.eliminarCategoria(cat.id);
      this.filtroCategoriaId = -1;
      this.aplicarFiltro();
      this.presentToast('Categoría eliminada', 'warning');
    }
  }

  // ==========================================
  // LÓGICA DE LA BARRA DE PROGRESO (NUEVO)
  // ==========================================
  
  get totalTareas(): number {
    return this.tareasOriginales.length;
  }

  get tareasCompletadas(): number {
    return this.tareasOriginales.filter(t => t.completada).length;
  }

  get progreso(): number {
    return this.totalTareas === 0 ? 0 : this.tareasCompletadas / this.totalTareas;
  }

  get porcentajeProgreso(): number {
    return Math.round(this.progreso * 100);
  }

  // --- UTILIDADES ---
  async presentToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 1500,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }
}
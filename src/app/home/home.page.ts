import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { TodoService } from '../services/todo.service';
import { Tarea, Categoria } from '../models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule] 
})
export class HomePage implements OnInit {
  tareasOriginales: Tarea[] = []; // Para el filtrado
  tareasFiltradas: Tarea[] = [];
  categorias: Categoria[] = [];
  nuevaTarea: string = '';
  categoriaSeleccionada: any = 0;
  filtroSeleccionado: any = -1;
  isModalOpen = false;

  constructor(public todoService: TodoService, private toastCtrl: ToastController) {}

  ngOnInit() {
    // Sincronización automática de Categorías
    this.todoService.getCategorias().subscribe(res => {
      this.categorias = res;
    });

    // Sincronización automática de Tareas
    this.todoService.getTareas().subscribe(res => {
      this.tareasOriginales = res;
      this.aplicarFiltro(); // Se refresca solo cuando Firebase envía datos
    });
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  aplicarFiltro() {
    if (this.filtroSeleccionado == -1) {
      this.tareasFiltradas = this.tareasOriginales;
    } else {
      this.tareasFiltradas = this.tareasOriginales.filter(t => t.categoriaId == this.filtroSeleccionado);
    }
  }

  nombreCategoria(id: any) {
    const c = this.categorias.find(cat => cat.id === id);
    return c ? c.nombre : 'Sin categoría';
  }

  async agregar() {
    const tareaLimpia = this.nuevaTarea.trim();
    if (tareaLimpia.length > 0) {
      await this.todoService.agregarTarea(tareaLimpia, this.categoriaSeleccionada);
      this.nuevaTarea = '';
      this.presentToast('¡Tarea agregada!');
    }
  }

  async eliminar(id: any) {
    await this.todoService.eliminarTarea(id);
    this.presentToast('Tarea eliminada', 'danger');
  }

  actualizarEstado(t: Tarea) {
    this.todoService.actualizarEstadoTarea(t);
  }

  async nuevaCategoria() {
    const n = prompt('Nombre categoría:');
    if (n) await this.todoService.agregarCategoria(n);
  }

  async editarCat(cat: Categoria) {
    const n = prompt('Nuevo nombre:', cat.nombre);
    if (n) await this.todoService.editarCategoria(cat.id, n);
  }

  async borrarCat(cat: Categoria) {
    if (confirm('¿Eliminar?')) {
      await this.todoService.eliminarCategoria(cat.id);
      this.filtroSeleccionado = -1;
    }
  }

  async presentToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 1500,
      position: 'bottom',
      color: color,
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
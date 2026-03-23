import { inject, Injectable, signal, computed, runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from '@angular/fire/firestore';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';
import { Observable } from 'rxjs';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareaService {
  private _firestore = inject(Firestore);
  private _remoteConfig = inject(RemoteConfig);
  private _tareasCollection = collection(this._firestore, 'tareas');

  // --- FEATURE FLAGS (Remote Config) ---
  mostrarBotonEliminar = signal<boolean>(true);

  // Flag para controlar el botón de eliminar desde Firebase
  public showDeleteButton: boolean = true;

  // --- ESTADO DE TAREAS ---
  private _tareasRaw = signal<Tarea[]>([]);
  filtroCategoriaId = signal<string>('-1'); // '-1' para todas

  // --- TAREAS FILTRADAS (Computed) ---
  // Esta es la lista que usará tu HTML automáticamente
  tareasFiltradas = computed(() => {
    const tareas = this._tareasRaw();
    const filtro = this.filtroCategoriaId();
    
    if (filtro === '-1') return tareas;
    return tareas.filter(t => t.categoriaId === filtro);
  });

  constructor() {
    this.initializeRemoteConfig();
  }
  
  // Lógica de Feature Flag
  async initializeRemoteConfig() {
    try {
      // Trae los valores de la nube y los activa
      await fetchAndActivate(this._remoteConfig);
      // Obtenemos el valor de 'show_delete_option' (debes crearlo en la consola de Firebase)
      this.showDeleteButton = getValue(this._remoteConfig, 'show_delete_option').asBoolean();
    } catch (err) {
      console.error('Error cargando Remote Config', err);
    }
  }

  getTareas(): Observable<Tarea[]> {
    const q = query(collection(this._firestore, 'tareas'), orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  // --- CRUD EN ESPAÑOL ---
  async agregarTarea(titulo: string, categoriaId: string, prioridad: string, fecha: Date) {
    await addDoc(this._tareasCollection, {
      titulo,
      categoriaId,
      completada: false,
      fecha: fecha,
      prioridad
    });
  }

  // En tarea.service.ts
  async editarTarea(id: string, datos: Partial<Tarea>) {
    const docRef = doc(this._firestore, `tareas/${id}`);
    return await updateDoc(docRef, datos);
  }

  async actualizarEstado(id: string, completada: boolean) {
    const docRef = doc(this._firestore, `tareas/${id}`);
    await updateDoc(docRef, { completada });
  }

  async eliminarTarea(id: string) {
    await deleteDoc(doc(this._firestore, `tareas/${id}`));
  }
}
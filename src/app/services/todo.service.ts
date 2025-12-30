import { Injectable } from '@angular/core';
import { Tarea, Categoria } from '../models';
import { 
  Firestore, 
  collection, 
  collectionData, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from '@angular/fire/firestore';
// IMPORTANTE: Añadimos Remote Config
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // Flag para controlar el botón de eliminar desde Firebase
  public showDeleteButton: boolean = true;

  constructor(
    private firestore: Firestore,
    private remoteConfig: RemoteConfig // Inyectamos Remote Config
  ) {
    this.initializeRemoteConfig();
  }

  // Lógica de Feature Flag
  async initializeRemoteConfig() {
    try {
      // Trae los valores de la nube y los activa
      await fetchAndActivate(this.remoteConfig);
      // Obtenemos el valor de 'show_delete_option' (debes crearlo en la consola de Firebase)
      this.showDeleteButton = getValue(this.remoteConfig, 'show_delete_option').asBoolean();
      console.log('Feature Flag show_delete_option:', this.showDeleteButton);
    } catch (err) {
      console.error('Error cargando Remote Config', err);
    }
  }

  getTareas(): Observable<Tarea[]> {
    const tareasRef = collection(this.firestore, 'tareas');
    const q = query(tareasRef, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Tarea[]>;
  }

  getCategorias(): Observable<Categoria[]> {
    const catRef = collection(this.firestore, 'categorias');
    return collectionData(catRef, { idField: 'id' }) as Observable<Categoria[]>;
  }

  async agregarTarea(titulo: string, catId: any) {
    const tareasRef = collection(this.firestore, 'tareas');
    await addDoc(tareasRef, {
      titulo: titulo,
      completada: false,
      categoriaId: catId,
      fecha: Date.now()
    });
  }

  async eliminarTarea(id: any) {
    const docRef = doc(this.firestore, `tareas/${id}`);
    await deleteDoc(docRef);
  }

  async actualizarEstadoTarea(t: Tarea) {
    const docRef = doc(this.firestore, `tareas/${t.id}`);
    await updateDoc(docRef, { completada: t.completada });
  }

  async agregarCategoria(nombre: string) {
    const catRef = collection(this.firestore, 'categorias');
    await addDoc(catRef, { nombre });
  }

  async editarCategoria(id: any, nuevoNombre: string) {
    const docRef = doc(this.firestore, `categorias/${id}`);
    await updateDoc(docRef, { nombre: nuevoNombre });
  }

  async eliminarCategoria(id: any) {
    const docRef = doc(this.firestore, `categorias/${id}`);
    await deleteDoc(docRef);
  }
}
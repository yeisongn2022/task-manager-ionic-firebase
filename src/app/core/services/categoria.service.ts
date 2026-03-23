import { inject, Injectable, signal } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private _firestore = inject(Firestore);
  private _catCollection = collection(this._firestore, 'categorias');
  
  // Signal para tener las categorías siempre disponibles en la UI
  categorias = signal<Categoria[]>([]);

  constructor() {
    (collectionData(this._catCollection, { idField: 'id' }) as Observable<Categoria[]>)
      .subscribe(data => this.categorias.set(data));
  }

  getCategorias(): Observable<Categoria[]> {
    const catRef = collection(this._firestore, 'categorias');
    return collectionData(catRef, { idField: 'id' }) as Observable<Categoria[]>;
  }

  async agregarCategoria(nombre: string) {
    await addDoc(this._catCollection, { nombre });
  }

  async editarCategoria(id: string, nombre: string) {
    const docRef = doc(this._firestore, `categorias/${id}`);
    await updateDoc(docRef, { nombre });
  }

  async eliminarCategoria(id: string) {
    const docRef = doc(this._firestore, `categorias/${id}`);
    await deleteDoc(docRef);
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private dbName = 'RecordatoriosEnterpriseDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
  }

  private initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('solicitudes')) {
          db.createObjectStore('solicitudes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('configuracion')) {
          db.createObjectStore('configuracion', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('historial')) {
          db.createObjectStore('historial', { keyPath: 'idHistorial' });
        }
        if (!db.objectStoreNames.contains('adjuntos')) {
          db.createObjectStore('adjuntos', { keyPath: 'idAdjunto' });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB Error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  private normalizeItem(storeName: string, item: any): any {
    if (!item || typeof item !== 'object') return item;
    const normalized = { ...item };

    if (storeName === 'solicitudes') {
      normalized.id = normalized.id || normalized.Id || crypto.randomUUID();
    } else if (storeName === 'historial') {
      normalized.idHistorial = normalized.idHistorial || normalized.IdHistorial || crypto.randomUUID();
    } else if (storeName === 'adjuntos') {
      normalized.idAdjunto = normalized.idAdjunto || normalized.IdAdjunto || crypto.randomUUID();
    } else if (storeName === 'configuracion') {
      normalized.key = normalized.key || normalized.Clave || normalized.id || crypto.randomUUID();
    }
    return normalized;
  }

  async setItem<T>(storeName: string, item: T): Promise<void> {
    if (!item) return;
    const db = await this.initIndexedDB();
    const normalized = this.normalizeItem(storeName, item);

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(normalized);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async setItems<T>(storeName: string, items: T[]): Promise<void> {
    if (!items || !Array.isArray(items)) return;
    const db = await this.initIndexedDB();

    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();

      items.forEach(item => {
        if (item) {
          const normalized = this.normalizeItem(storeName, item);
          store.put(normalized);
        }
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.initIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async setMeta(key: string, value: any): Promise<void> {
    return this.setItem('meta', { key, value });
  }

  async getMeta(key: string): Promise<any> {
    const db = await this.initIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction('meta', 'readonly');
      const store = tx.objectStore('meta');
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  }
}

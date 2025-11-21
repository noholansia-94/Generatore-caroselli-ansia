import { MockupImage } from '../types';

const DB_NAME = 'CalmScrollDB';
const STORE_NAME = 'mockups';

// Apre il database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Salva una nuova immagine
export const saveMockup = async (dataUrl: string): Promise<MockupImage> => {
  const db = await initDB();
  const mockup: MockupImage = {
    id: crypto.randomUUID(),
    dataUrl,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(mockup);

    request.onsuccess = () => resolve(mockup);
    request.onerror = () => reject(request.error);
  });
};

// Ottieni tutte le immagini salvate
export const getMockups = async (): Promise<MockupImage[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      // Ordina per data (più recenti prima)
      const results = request.result as MockupImage[];
      resolve(results.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
};

// Cancella un'immagine
export const deleteMockup = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

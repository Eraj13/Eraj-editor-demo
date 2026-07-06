// utils/indexedDB.ts
import { openDB, IDBPDatabase } from 'idb';

let dbInstance: IDBPDatabase | null = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB('EditorDrafts', 1, {
    upgrade(db) {
      // Store for images
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', { keyPath: 'id' });
        store.createIndex('draftId', 'draftId', { unique: false });
        store.createIndex('uploaded', 'uploaded', { unique: false });
      }
      
      // Store for drafts metadata
      if (!db.objectStoreNames.contains('drafts')) {
        db.createObjectStore('drafts', { keyPath: 'id' });
      }
    },
  });
  
  return dbInstance;
};

export const saveImageToIndexedDB = async (
  imageId: string,
  base64?: string,
  // draftId: string
) => {
  if(!base64) return;
  const db = await getDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  
  await store.put({
    id: imageId,
    base64,
    // draftId,
    uploaded: false,
    timestamp: Date.now(),
  });
};

export const getImageFromIndexedDB = async (imageId: string) => {
  const db = await getDB();
  const tx = db.transaction('images', 'readonly');
  const store = tx.objectStore('images');
  return store.get(imageId);
};

export const getAllImagesForDraft = async (draftId: string) => {
  const db = await getDB();
  const tx = db.transaction('images', 'readonly');
  const store = tx.objectStore('images');
  const index = store.index('draftId');
  
  const images = await index.getAll(draftId);
  return images;
};

export const markImageAsUploaded = async (imageId: string, url: string) => {
  const db = await getDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  
  const image = await store.get(imageId);
  if (image) {
    await store.put({
      ...image,
      uploaded: true,
      uploadUrl: url,
    });
  }
};

export const deleteImagesForDraft = async (draftId: string) => {
  const db = await getDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  const index = store.index('draftId');
  
  const images = await index.getAll(draftId);
  for (const image of images) {
    await store.delete(image.id);
  }
};

export const clearAllImages = async () => {
  const db = await getDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  await store.clear();
};

export const deleteImageFromIndexedDB = async (imageId: string) => {
  const db = await getDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');
  
  await store.delete(imageId);
  
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
};

export const updateImageInIndexedDB = async(imageId?: string, newBase64?: string, newFilename?: string) => {
  if(!imageId || !newBase64) return;
  const db = await getDB();
  const tx = db.transaction('images', 'readwrite');
  const store = tx.objectStore('images');

  // Get existing image
  const exisiting = await store.get(imageId);
  if (!exisiting) {
    throw new Error(`Image ${imageId} not found in IndexDB`);
  }
  // Update with new data
  await store.put({
    ...exisiting,  base64: newBase64, fileName: newFilename || exisiting.filename, updatedAt: Date.now(), 
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
}
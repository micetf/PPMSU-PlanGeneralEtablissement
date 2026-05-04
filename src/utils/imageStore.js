/**
 * @fileoverview Stockage de l'image aérienne en IndexedDB
 * Pas de limite de quota contrairement à localStorage
 */

const DB_NAME = "ppms_legende";
const STORE_NAME = "images";
const DB_VERSION = 1;

/** @returns {Promise<IDBDatabase>} */
function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) =>
            e.target.result.createObjectStore(STORE_NAME);
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Sauvegarde les données image d'un projet
 * @param {string} projectId
 * @param {{ src:string, naturalWidth:number, naturalHeight:number, fileName:string }} imageData
 * @returns {Promise<void>}
 */
export async function storeImage(projectId, imageData) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(imageData, projectId);
        tx.oncomplete = resolve;
        tx.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Récupère les données image d'un projet
 * @param {string} projectId
 * @returns {Promise<object|null>}
 */
export async function retrieveImage(projectId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get(projectId);
        req.onsuccess = (e) => resolve(e.target.result ?? null);
        req.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Supprime les données image d'un projet
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function removeImage(projectId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(projectId);
        tx.oncomplete = resolve;
        tx.onerror = (e) => reject(e.target.error);
    });
}

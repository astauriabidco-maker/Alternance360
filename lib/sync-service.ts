/**
 * Offline Sync Service (IndexedDB)
 * Ensures that journal entries are saved even without internet.
 */

import { openDB, IDBPDatabase } from 'idb';
import { createJournalEntry } from '@/app/actions/journal';

const DB_NAME = 'antigravity_offline';
const STORE_NAME = 'journal_queue';

export interface OfflineEntry {
    id?: number;
    tempId: string;
    data: any;
    timestamp: number;
    status: 'pending' | 'syncing' | 'failed';
    file?: File; // Optional file to sync
}

class SyncService {
    private dbPromise: Promise<IDBPDatabase>;
    private listeners: (() => void)[] = [];

    constructor() {
        this.dbPromise = openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            },
        });
    }

    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l());
    }

    async queueEntry(data: any, file?: File | null) {
        const db = await this.dbPromise;
        const entry: OfflineEntry = {
            tempId: crypto.randomUUID(),
            data,
            timestamp: Date.now(),
            status: 'pending'
        };

        if (file) {
            entry.file = file;
        }

        const id = await db.add(STORE_NAME, entry);
        this.notify();

        if (navigator.onLine) {
            this.sync();
        }
        return id;
    }

    async getPendingCount() {
        const db = await this.dbPromise;
        const entries = await db.getAll(STORE_NAME);
        return entries.length;
    }

    async sync() {
        if (!navigator.onLine) return;
        const db = await this.dbPromise;
        const pending = await db.getAll(STORE_NAME);

        if (pending.length === 0) return;

        console.log(`[Sync] Starting sync for ${pending.length} entries`);

        for (const entry of pending) {
            try {
                console.log("[Sync] Synchronisation de l'entrée:", entry.tempId);

                const serverData = entry.data;
                let formData: FormData | undefined = undefined;

                if (entry.file) {
                    formData = new FormData();
                    formData.append('file', entry.file);
                }

                const result = await createJournalEntry(serverData, formData);

                if (result.success) {
                    await db.delete(STORE_NAME, entry.id!);
                    this.notify();
                } else {
                    console.error("[Sync] Server error:", result.error);
                }
            } catch (e) {
                console.error("[Sync] Network/Logic error:", e);
            }
        }
    }
}

export const syncService = typeof window !== 'undefined' ? new SyncService() : null;

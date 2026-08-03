import { get, set, del, clear } from 'idb-keyval';

/**
 * fileCache.ts
 * 
 * Utility for storing massive files (images, audio, JSON blobs) asynchronously.
 * This utilizes IndexedDB (via idb-keyval) allowing for gigabytes of storage 
 * without blocking the main game loop, and works identically across 
 * Electron, iOS, Android, and Web browsers.
 */

export const fileCache = {
  /**
   * Save a large file (Blob, ArrayBuffer, or huge object) to IndexedDB
   */
  async saveFile(key: string, data: any): Promise<void> {
    try {
      await set(key, data);
      console.log(`Saved ${key} to IndexedDB cache successfully.`);
    } catch (error) {
      console.error(`Failed to save ${key} to IndexedDB:`, error);
    }
  },

  /**
   * Retrieve a large file from IndexedDB
   */
  async getFile<T>(key: string): Promise<T | undefined> {
    try {
      const data = await get<T>(key);
      if (data !== undefined) {
        return data;
      }
      return undefined;
    } catch (error) {
      console.error(`Failed to retrieve ${key} from IndexedDB:`, error);
      return undefined;
    }
  },

  /**
   * Delete a specific file from the cache
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await del(key);
    } catch (error) {
      console.error(`Failed to delete ${key} from IndexedDB:`, error);
    }
  },

  /**
   * Clear the entire file cache
   */
  async clearAll(): Promise<void> {
    try {
      await clear();
      console.log('Cleared IndexedDB file cache.');
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
    }
  }
};

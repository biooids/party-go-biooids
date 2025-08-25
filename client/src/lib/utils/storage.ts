// src/lib/utils/storage.ts

/**
 * A simple, Promise-based wrapper around the browser's localStorage.
 * It now includes helpers for storing and retrieving objects as JSON.
 */
const storage = {
  /**
   * Saves a string key-value pair to localStorage.
   */
  setItem: async (key: string, value: string): Promise<void> => {
    return Promise.resolve(localStorage.setItem(key, value));
  },

  /**
   * Retrieves a string value from localStorage by its key.
   */
  getItem: async (key: string): Promise<string | null> => {
    return Promise.resolve(localStorage.getItem(key));
  },

  /**
   * Removes a key-value pair from localStorage.
   */
  removeItem: async (key: string): Promise<void> => {
    return Promise.resolve(localStorage.removeItem(key));
  },

  /**
   * NEW: Saves an object to localStorage after converting it to a JSON string.
   * @param key The key to save.
   * @param value The object to save.
   */
  setObject: async (key: string, value: object): Promise<void> => {
    const jsonValue = JSON.stringify(value);
    return Promise.resolve(localStorage.setItem(key, jsonValue));
  },

  /**
   * NEW: Retrieves an object from localStorage by its key and parses it from JSON.
   * @param key The key to retrieve.
   * @returns A Promise that resolves with the parsed object, or null if not found or invalid.
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    const jsonValue = await Promise.resolve(localStorage.getItem(key));
    if (jsonValue === null) {
      return null;
    }
    try {
      return JSON.parse(jsonValue) as T;
    } catch (e) {
      console.error("Failed to parse JSON from storage", e);
      return null;
    }
  },
};

export default storage;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryStore = new Map<string, string>();

export const AppStorage = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        raw = window.localStorage.getItem(key);
      } else {
        raw = await AsyncStorage.getItem(key);
      }

      if (raw === null && memoryStore.has(key)) {
        raw = memoryStore.get(key) || null;
      }

      if (raw === null) {
        return defaultValue;
      }

      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[AppStorage] Failed to read ${key}:`, error);
      const fallback = memoryStore.get(key);
      if (fallback) {
        try {
          return JSON.parse(fallback) as T;
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    memoryStore.set(key, raw);

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, raw);
      } else {
        await AsyncStorage.setItem(key, raw);
      }
    } catch (error) {
      console.warn(`[AppStorage] Failed to write ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryStore.delete(key);
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`[AppStorage] Failed to remove ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    memoryStore.clear();
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      } else {
        await AsyncStorage.clear();
      }
    } catch (error) {
      console.warn(`[AppStorage] Failed to clear:`, error);
    }
  },
};

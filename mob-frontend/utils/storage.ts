import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Store a string value in AsyncStorage
 */
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    if (value === null || value === undefined) {
      console.warn(`Skipping storage for ${key}: value is null/undefined`);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw error;
  }
};

/**
 * Get a string value from AsyncStorage
 */
export const getString = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    throw error;
  }
};

/**
 * Delete an item from AsyncStorage
 */
export const deleteItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    throw error;
  }
};

/**
 * Store a JSON object in AsyncStorage
 */
export const setJSON = async (key: string, value: object): Promise<void> => {
  try {
    if (value === null || value === undefined) {
      console.warn(`Skipping storage for JSON ${key}: value is null/undefined`);
      return;
    }
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing JSON ${key}:`, error);
    throw error;
  }
};

/**
 * Get a JSON object from AsyncStorage
 */
export const getJSON = async <T = any>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving JSON ${key}:`, error);
    throw error;
  }
};

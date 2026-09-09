import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_SESSION_KEY = '@farmconnect_user_session';

export const storageService = {
  // Save user profile & session object
  async saveUser(user) {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem(USER_SESSION_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to persist user session:', e);
    }
  },

  // Retrieve stored session
  async getUser() {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_SESSION_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Failed to load user session:', e);
      return null;
    }
  },

  // Clear session on logout
  async clearUser() {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
    } catch (e) {
      console.error('Failed to remove user session:', e);
    }
  },
};
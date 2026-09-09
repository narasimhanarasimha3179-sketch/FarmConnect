import AsyncStorage from '@react-native-async-storage/async-storage';

const SCANS_STORAGE_KEY = '@farmconnect_scan_history';

export const scanStorage = {
  async getScans() {
    try {
      const data = await AsyncStorage.getItem(SCANS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading scan records:', e);
      return [];
    }
  },

  async saveScan(scanRecord) {
    try {
      const existing = await this.getScans();
      const updated = [
        {
          id: 'scan_' + Date.now(),
          timestamp: new Date().toISOString(),
          ...scanRecord,
        },
        ...existing,
      ];
      await AsyncStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error archiving scan record:', e);
      return [];
    }
  },

  async clearScans() {
    try {
      await AsyncStorage.removeItem(SCANS_STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing scan records:', e);
    }
  },
};
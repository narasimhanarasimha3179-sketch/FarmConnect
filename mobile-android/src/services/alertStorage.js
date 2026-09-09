import AsyncStorage from '@react-native-async-storage/async-storage';

const ALERTS_STORAGE_KEY = '@farmconnect_price_alerts';

export const alertStorage = {
  async getAlerts() {
    try {
      const data = await AsyncStorage.getItem(ALERTS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to retrieve price alerts:', e);
      return [];
    }
  },

  async saveAlert(newAlert) {
    try {
      const existing = await this.getAlerts();
      const updated = [
        {
          id: 'alert_' + Date.now(),
          createdAt: new Date().toISOString(),
          isActive: true,
          ...newAlert,
        },
        ...existing,
      ];
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to persist price alert:', e);
      return [];
    }
  },

  async removeAlert(alertId) {
    try {
      const existing = await this.getAlerts();
      const updated = existing.filter((item) => item.id !== alertId);
      await AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to remove price alert:', e);
      return [];
    }
  },
};
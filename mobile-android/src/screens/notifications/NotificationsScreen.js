// FarmConnect Notification Inbox & Agronomic Alerts Screen (Phase 21)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme';
import { Header, Card, Badge, Button, EmptyState } from '../../components/common';
import apiClient from '../../services/apiClient';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error('fetchNotifications error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('markAllRead error:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ORDER':
        return '📦';
      case 'MANDI':
        return '📈';
      case 'WEATHER':
        return '🌦️';
      case 'SCHEME':
        return '🏛️';
      default:
        return '🔔';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleMarkAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconTxt}>{getTypeIcon(item.type)}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>
            {item.title}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timeText}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Notifications & Alerts"
        showBack
        onBack={() => navigation?.goBack?.()}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllTxt}>Mark All Read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No Notifications"
              description="You have no unread agronomic alerts or order notifications right now."
              icon="🔔"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  markAllTxt: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconTxt: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: 6,
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#9E9E9E',
  },
});

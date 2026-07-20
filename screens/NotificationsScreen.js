import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../theme';
import { useAppContext, IP_ADDRESS } from '../context/AppContext';

const ICONS_BY_TYPE = {
  SCAM_ALERT: { name: 'warning-outline', color: '#E74C3C' },
  PRICE_ALERT: { name: 'trending-up-outline', color: '#3478F6' },
  GENERAL: { name: 'notifications-outline', color: '#7E8494' },
};

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen({ navigation }) {
  const { currentUserEmail, refreshUnreadCount } = useAppContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(() => {
    if (!currentUserEmail) {
      setLoading(false);
      return;
    }
    setError(null);
    fetch(`http://${IP_ADDRESS}:8081/api/notifications?email=${encodeURIComponent(currentUserEmail)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setNotifications(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Notifications load error:', err.message);
        setError('Could not load notifications.');
        setLoading(false);
      });
  }, [currentUserEmail]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`http://${IP_ADDRESS}:8081/api/notifications/${id}/read`, { method: 'PUT' });
      refreshUnreadCount();
    } catch (err) {
      console.log('Mark as read error:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(
        `http://${IP_ADDRESS}:8081/api/notifications/read-all?email=${encodeURIComponent(currentUserEmail)}`,
        { method: 'PUT' }
      );
      refreshUnreadCount();
    } catch (err) {
      console.log('Mark all read error:', err.message);
    }
  };

  const renderItem = ({ item }) => {
    const icon = ICONS_BY_TYPE[item.type] || ICONS_BY_TYPE.GENERAL;
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        activeOpacity={0.7}
        onPress={() => !item.read && handleMarkAsRead(item.id)}
      >
        <View style={[styles.iconWrap, { backgroundColor: icon.color + '22' }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
          <Text style={styles.time}>{timeAgo(item.createdAt || item.timestamp)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.primary || '#3478F6'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary || '#3478F6'} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-outline" size={40} color={COLORS.textSecondary || '#7E8494'} />
          <Text style={styles.emptyText}>You're all caught up.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background || '#11141A' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: SIZES.padding || 16,
    paddingBottom: 16,
  },
  backBtn: { width: 40 },
  markAllBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  markAllText: { color: COLORS.primary || '#3478F6', fontSize: 13, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain || '#FFF' },

  listContent: { paddingHorizontal: SIZES.padding || 16, paddingBottom: 40 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface || '#1C212D',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border || '#2A3245',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardUnread: {
    borderColor: COLORS.primary || '#3478F6',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: COLORS.textMain || '#FFF', fontSize: 14, fontWeight: '700', flexShrink: 1 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary || '#3478F6' },
  message: { color: COLORS.textSecondary || '#7E8494', fontSize: 13, marginTop: 4, lineHeight: 18 },
  time: { color: COLORS.textSecondary || '#7E8494', fontSize: 11, marginTop: 6 },

  errorText: { color: COLORS.textSecondary || '#7E8494', fontSize: 14, textAlign: 'center', paddingHorizontal: 30 },
  emptyText: { color: COLORS.textSecondary || '#7E8494', fontSize: 14 },
});
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { getString } from "../../../utils/storage";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "grievance";
  read: boolean;
  grievanceId?: string;
  createdAt: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to get notification type based on status
  const getNotificationType = (status: string): "info" | "success" | "warning" | "grievance" => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "success";
      case "rejected":
        return "warning";
      case "submited":
      case "submitted":
        return "grievance";
      case "assigned":
      case "in progress":
      case "in review":
      default:
        return "info";
    }
  };

  // Helper function to generate notification title based on status
  const getNotificationTitle = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "submited":
      case "submitted":
        return "Grievance Submitted";
      case "assigned":
        return "Grievance Assigned";
      case "in progress":
        return "Work In Progress";
      case "in review":
        return "Under Review";
      case "resolved":
        return "Grievance Resolved";
      case "rejected":
        return "Grievance Rejected";
      case "completed":
        return "Work Completed";
      case "verified":
        return "Verified by Officer";
      default:
        return "Status Update";
    }
  };

  // Helper function to generate notification message
  const getNotificationMessage = (
    status: string,
    grievanceId: string,
    remark?: string
  ): string => {
    const baseMessage = (() => {
      switch (status?.toLowerCase()) {
        case "submited":
        case "submitted":
          return `Your grievance ${grievanceId} has been submitted successfully.`;
        case "assigned":
          return `Your grievance ${grievanceId} has been assigned to a staff member.`;
        case "in progress":
          return `Work is in progress for your grievance ${grievanceId}.`;
        case "in review":
          return `Your grievance ${grievanceId} is being reviewed.`;
        case "resolved":
          return `Good news! Your grievance ${grievanceId} has been resolved.`;
        case "rejected":
          return `Your grievance ${grievanceId} has been rejected.`;
        case "completed":
          return `Work has been completed for grievance ${grievanceId}.`;
        case "verified":
          return `Your grievance ${grievanceId} has been verified by the officer.`;
        default:
          return `Status updated for grievance ${grievanceId}.`;
      }
    })();

    return remark ? `${baseMessage} Remark: ${remark}` : baseMessage;
  };

  const fetchNotifications = async () => {
    try {
      const email = await getString("email");
      if (!email) {
        setLoading(false);
        return;
      }

      // Fetch citizen's grievances
      const res = await axios.post(
        `${API_BASE}/Citizen_gravince`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );

      const grievances = res.data.all || [];

      // Extract notifications from grievance history
      const allNotifications: Notification[] = [];

      grievances.forEach((grievance: any, gIndex: number) => {
        if (grievance.history && Array.isArray(grievance.history)) {
          grievance.history.forEach((historyItem: any, hIndex: number) => {
            allNotifications.push({
              _id: `${grievance.grevienceID}-${hIndex}`,
              title: getNotificationTitle(historyItem.status),
              message: getNotificationMessage(
                historyItem.status,
                grievance.grevienceID,
                historyItem.remark
              ),
              type: getNotificationType(historyItem.status),
              read: hIndex < grievance.history.length - 1, // Only latest is unread
              grievanceId: grievance.grevienceID,
              createdAt: historyItem.date || grievance.createdAt,
            });
          });
        }
      });

      // Sort by date (newest first)
      allNotifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification._id);
    if (notification.grievanceId) {
      router.push({
        pathname: "/(tabs)/Citizen_pages/Viewdetails",
        params: { id: notification.grievanceId },
      });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return { name: "checkmark-circle", color: "#4CAF50", bg: "#E8F5E9" };
      case "warning":
        return { name: "alert-circle", color: "#FF9800", bg: "#FFF3E0" };
      case "grievance":
        return { name: "document-text", color: "#1976D2", bg: "#E3F2FD" };
      default:
        return { name: "information-circle", color: "#2196F3", bg: "#E3F2FD" };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconConfig = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconConfig.bg }]}>
          <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.footerRow}>
            <Text style={styles.timeText}>{getTimeAgo(item.createdAt)}</Text>
            {item.grievanceId && (
              <View style={styles.grievanceTag}>
                <Text style={styles.grievanceTagText}>{item.grievanceId}</Text>
              </View>
            )}
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! New notifications will appear here.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1976D2"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingTop: isSmallDevice ? 40 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  badge: {
    backgroundColor: "#E53935",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: "#FAFBFF",
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: isTablet ? 16 : 15,
    fontWeight: "500",
    color: "#333",
  },
  unreadText: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1976D2",
  },
  notificationMessage: {
    fontSize: isTablet ? 14 : 13,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  grievanceTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  grievanceTagText: {
    fontSize: 11,
    color: "#1976D2",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});

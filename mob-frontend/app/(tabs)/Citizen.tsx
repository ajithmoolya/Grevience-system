import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { getString, deleteItem } from "../../utils/storage";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

export default function CitizenScreen() {
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [showProfile, setShowProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [total, setTotal] = useState("0");
  const [pending, setPending] = useState("0");
  const [resolved, setResolved] = useState("0");
  const [grievances, setGrievances] = useState<any[]>([]);

  // Get user details from storage
  const getUserDetails = async () => {
    const userName = await getString("name");
    const userEmail = await getString("email");
    setName(userName);
    setEmail(userEmail);
  };

  // Fetch grievances
  const fetchGrievances = async () => {
    if (!email) return;
    try {
      const res = await axios.post(
        `${API_BASE}/Citizen_gravince`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setGrievances(Array.isArray(res.data.all) ? res.data.all : []);
      setTotal(res.data.total_grievance || "0");
      setPending(res.data.total_pending || "0");
      // Calculate resolved
      const resolvedCount = res.data.all?.filter(
        (g: any) => g.status === "Resolved"
      ).length || 0;
      setResolved(resolvedCount.toString());
    } catch (error) {
      console.error("Failed to fetch grievances:", error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGrievances();
    setRefreshing(false);
  }, [email]);

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    if (email) {
      fetchGrievances();
    }
  }, [email]);

  useFocusEffect(
    useCallback(() => {
      if (email) {
        fetchGrievances();
      }
    }, [email])
  );

  const handleSubmitGrievance = () => {
    router.push("/(tabs)/Citizen_pages/GravienceForm");
  };

  const handleTrack = () => {
    router.push("/(tabs)/Citizen_pages/track");
  };

  const handleLogout = async () => {
    await deleteItem("token");
    await deleteItem("role");
    await deleteItem("name");
    await deleteItem("email");
    router.replace("/");
  };

  const handleViewDetails = (grievanceId: string) => {
    router.push({
      pathname: "/(tabs)/Citizen_pages/Viewdetails",
      params: { id: grievanceId },
    });
  };

  const handleViewAll = () => {
    router.push("/(tabs)/Citizen_pages/Allgrevience");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submited":
        return { bg: "#E3F2FD", text: "#1976D2" };
      case "Assigned":
        return { bg: "#FFF3E0", text: "#F57C00" };
      case "In progress":
        return { bg: "#FFF8E1", text: "#FFA000" };
      case "Resolved":
        return { bg: "#E8F5E9", text: "#388E3C" };
      case "completed":
      case "Verified":
        return { bg: "#E1F5FE", text: "#0288D1" };
      default:
        return { bg: "#F5F5F5", text: "#757575" };
    }
  };

  const getDisplayStatus = (status: string) => {
    if (status === "completed" || status === "Verified") {
      return "In Progress";
    }
    return status;
  };

  const handleNotifications = () => {
    router.push("/(tabs)/Citizen_pages/Notifications");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{name || "Citizen"}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleNotifications}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowProfile(true)}
            >
              <Ionicons name="person-circle" size={40} color="#1976D2" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Modal */}
      <Modal visible={showProfile} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setShowProfile(false)}
        >
          <View
            style={styles.profileModal}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.profileHeader}>
              <Ionicons name="person-circle" size={60} color="#1976D2" />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileEmail}>{email}</Text>
              </View>
            </View>
            <View style={styles.profileDivider} />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#E53935" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1976D2"]} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardTotal]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="document-text" size={24} color="#1976D2" />
            </View>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPending]}>
            <View style={[styles.statIconContainer, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="time" size={24} color="#F57C00" />
            </View>
            <Text style={styles.statNumber}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={[styles.statCard, styles.statCardResolved]}>
            <View style={[styles.statIconContainer, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="checkmark-circle" size={24} color="#388E3C" />
            </View>
            <Text style={styles.statNumber}>{resolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitGrievance}
          >
            <View style={styles.submitButtonIcon}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
            <View style={styles.submitButtonText}>
              <Text style={styles.submitButtonTitle}>Submit New Grievance</Text>
              <Text style={styles.submitButtonSubtitle}>File a new complaint</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.trackButton} onPress={handleTrack}>
            <Ionicons name="location" size={22} color="#1976D2" />
            <Text style={styles.trackButtonText}>Track Grievance Status</Text>
            <Ionicons name="chevron-forward" size={20} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Recent Grievances */}
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Grievances</Text>
            {grievances.length > 3 && (
              <TouchableOpacity onPress={handleViewAll}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {grievances.length > 0 ? (
            grievances.slice(0, 3).map((item, index) => {
              const statusColors = getStatusColor(item.status);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.grievanceCard}
                  onPress={() => handleViewDetails(item.grevienceID)}
                  activeOpacity={0.7}
                >
                  <View style={styles.grievanceHeader}>
                    <View style={styles.grievanceIdContainer}>
                      <Ionicons name="document-text-outline" size={18} color="#666" />
                      <Text style={styles.grievanceId}>{item.grevienceID}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors.bg },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {getDisplayStatus(item.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.grievanceTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View style={styles.grievanceFooter}>
                    <View style={styles.grievanceCategory}>
                      <Ionicons name="folder-outline" size={16} color="#888" />
                      <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    <View style={styles.grievanceDate}>
                      <Ionicons name="calendar-outline" size={16} color="#888" />
                      <Text style={styles.dateText}>
                        {item.createdAt?.split("T")[0]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.viewDetailsRow}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color="#1976D2" />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Grievances Yet</Text>
              <Text style={styles.emptyStateText}>
                Submit your first grievance to get started
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: isSmallDevice ? 40 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#888",
  },
  userName: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E53935",
  },
  profileButton: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  profileModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: isSmallDevice ? 90 : 100,
    marginRight: 16,
    width: isTablet ? 320 : 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#E53935",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardTotal: {},
  statCardPending: {},
  statCardResolved: {},
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1976D2",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    flex: 1,
    marginLeft: 16,
  },
  submitButtonTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
    color: "#fff",
  },
  submitButtonSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#1976D2",
    gap: 10,
  },
  trackButtonText: {
    flex: 1,
    fontSize: isTablet ? 16 : 15,
    fontWeight: "600",
    color: "#1976D2",
  },
  recentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  viewAllText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "600",
  },
  grievanceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  grievanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  grievanceIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  grievanceId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  grievanceTitle: {
    fontSize: isTablet ? 16 : 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  grievanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  grievanceCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    color: "#888",
  },
  grievanceDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: "#888",
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
});

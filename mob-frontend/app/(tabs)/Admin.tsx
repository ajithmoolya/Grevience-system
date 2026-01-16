import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Dimensions,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";

import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";

import { setItem, getString, deleteItem, getJSON } from "../../utils/storage";
import axios from "axios";

import categories from "./Admin_pages/categories";
import { useFocusEffect } from "@react-navigation/native";

export default function adminportal() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const [showMenu, setShowMenu] = useState(false);

  const router = useRouter();
  const [showmodal, setShowmodal] = useState(false);
  const [status, setStatus] = useState<string>("Submitted");
  const staff = ["staff1", "staff2", "staff3", "staff4"];

  const [email, setemail] = useState<string | null>(null);
  const [name, setname] = useState<string | null>(null);
  const [total, settotal] = useState<string | null>(null);
  const [pending, setpending] = useState<string | null>(null);
  const [assigned, setassinged] = useState<string | null>(null);
  const [Resolved, setResolved] = useState<string | null>(null);
  const [grevienceID, setgrevienceID] = useState<string | null>(null);

  const [grievances, setGrievances] = useState<any[]>([]);

  const [permissions, setPermissions] = useState<string[]>([]);

  const [active, setActive] = useState("All");

  const tabs = ["All", "Pending", "Assigned", "Resolved"];
  const [selected, setSelected] = useState("All");

  const [pending_data, setpending_data] = useState<any[]>([]);
  const [assigned_data, setassinged_data] = useState<any[]>([]);
  const [inreview_data, setinreview_data] = useState<any[]>([]);
  const [resolved_data, setresolved_data] = useState<any[]>([]);
  
  // New states for reopened grievances and notifications
  const [reopened_data, setReopened_data] = useState<any[]>([]);
  const [reopenedCount, setReopenedCount] = useState<number>(0);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await graivnece();
    if (email) await fetchNotificationCount();
    setRefreshing(false);
  }, [state, district, email]);

    const [state, setState] = useState<any[]>([]);
    const [district, setdistrict] = useState<any[]>([]);

  useEffect(() => {
    Profile();
  }, []);

  const Profile = async () => {
    const token = await getString("token");
     if (!token) {
    return;  
  }
    const res = await axios.get(`${API_BASE}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setemail(res.data.profile.email);
    setState(res.data.profile.state)
    setdistrict(res.data.profile.district)
    // console.log(res.data.profile.Permissions)

    setPermissions(res.data.profile.Permissions);
  };

useEffect(() => {
  if (state.length > 0 && district.length > 0) {
    graivnece();
  }
}, [state, district]);

// Refresh data when screen is focused
useFocusEffect(
  useCallback(() => {
    if (state.length > 0 && district.length > 0) {
      graivnece();
    }
    if (email) {
      fetchNotificationCount();
    }
  }, [state, district, email])
);

// Fetch notification count when email is available
useEffect(() => {
  if (email) {
    fetchNotificationCount();
  }
}, [email]);

// Fetch notification count for badge
const fetchNotificationCount = async () => {
  try {
    const res = await axios.get(`${API_BASE}/admin/notifications`, {
      params: { email },
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.data.success) {
      setNotificationCount(res.data.unreadCount || 0);
    }
  } catch (error) {
    console.log("Error fetching notification count:", error);
  }
};

// Navigate to notifications page
const handle_notifications = () => {
  setShowMenu(false);
  router.push("/(tabs)/Admin_pages/Notifications");
};



const graivnece = async () => {
  // console.log(state)
  // console.log(district)
  try {
  
    const res = await axios.get(`${API_BASE}/admin/Allgravinces`, {
      params: {
        state: state,          
        district: district,   
      },
      headers: { "Content-Type": "application/json" },
    });

    const data = res.data;
   

   
    setGrievances(Array.isArray(data.all) ? data.all : []);

    setpending_data(
      Array.isArray(data.Submited)
        ? data.Submited
        : data.Submited
        ? [data.Submited]
        : []
    );

    // Assigned list
    setassinged_data(
      Array.isArray(data.assigned)
        ? data.assigned
        : data.assigned
        ? [data.assigned]
        : []
    );

    // Reopened list
    setReopened_data(
      Array.isArray(data.reopened)
        ? data.reopened
        : data.reopened
        ? [data.reopened]
        : []
    );
    setReopenedCount(data.total_reopened || 0);

    // Resolved list
    setresolved_data(
      Array.isArray(data.resolved)
        ? data.resolved
        : data.resolved
        ? [data.resolved]
        : []
    );

    // Totals
    settotal(data.total || 0);
    setpending(data.total_pending || 0);
    setassinged(data.total_assigned || 0);
    setResolved(data.total_resolved || 0);

  }
  catch (error: any) {
    console.log("code eror")
   
  console.log("ERROR:", error?.response?.data || error);
}
};

// call function

  const handle_edit = (
    grevienceId: string,
    title: string,
    category: string,
  ) => {
    router.push({
      pathname: "/Admin_pages/UpdateGrevence",
      params: {
        id: grevienceId,
        title: title,
        category: category,
        state: state,
        district: district,
      },
    });
  };

const handle_allgreviences = () => {
  router.push({
    pathname: "/(tabs)/Admin_pages/allgreviences",
    params: {
      state: state,
      district: district,
    },
  });
};


  const handle_dassboard = () => {
    router.push("/Admin");
  };
  const handle_staff = () => {
    router.push("/(tabs)/Admin_pages/staff_management");
  };

  const handle_categories = () => {
    router.push("/(tabs)/Admin_pages/categories");
  };

  const hanlde_report = () => {
    router.push("/(tabs)/Admin_pages/Reports");
  };

  const handlelogout = async () => {
    await deleteItem("token");
    await deleteItem("role");
    router.replace("/");
  };

  const getFilteredData = () => {
    switch (selected) {
      case "All":
        return grievances;
      case "Pending":
        return pending_data;
      case "Assigned":
        return assigned_data;
      case "Reopened":
        return reopened_data;
      case "Resolved":
        return resolved_data;
      default:
        return grievances;
    }
  };

  const update_grev = (
    grevienceId: string,
    title: string,
    category: string,
    state: string,

    district: string,
    status: string,
    location: string,
    description: string,

    createdAt: string
  ) => {
    router.push({
      pathname: "/(tabs)/Admin_pages/UpdateGrevence",
      params: {
        id: grevienceId,
        title: title,
        category: category,
        state: state,
        district: district,
        status: status,
        location: location,
        description: description,

        createdAt: createdAt,
      },
    });
  };

  const handle_SubOfficer=()=>{
    router.push({
  pathname: "/(tabs)/Admin_pages/SubOfficer",
  params: { email }
});
  }

  return (
    <View style={style.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={style.header_container}>
        <TouchableOpacity 
          style={style.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Ionicons name="menu" size={26} color="#333" />
        </TouchableOpacity>
        
        <View style={style.headerCenter}>
          <Text style={style.headerTitle}>Taluk Admin</Text>
          <Text style={style.headerSubtitle}>Grievance Dashboard</Text>
        </View>
        
        {/* Notification Bell */}
        <TouchableOpacity 
          style={style.notificationButton}
          onPress={handle_notifications}
        >
          <Ionicons name="notifications-outline" size={26} color="#333" />
          {notificationCount > 0 && (
            <View style={style.notificationBadge}>
              <Text style={style.notificationBadgeText}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Side Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="none"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={style.menuOverlay}>
          <TouchableOpacity 
            style={style.menuBackdrop} 
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          />
          <View style={[style.menu_container, { width: Math.min(width * 0.75, 320) }]}>
            <View style={style.menuHeader}>
              <TouchableOpacity 
                style={style.menuCloseButton}
                onPress={() => setShowMenu(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={style.menuProfileSection}>
              <View style={style.menuAvatar}>
                <Ionicons name="person" size={32} color="#1976D2" />
              </View>
              <Text style={style.menuName}>{name}</Text>
              <Text style={style.menuEmail}>{email}</Text>
            </View>
            
            <View style={style.menuDivider} />

            <ScrollView style={style.menuScrollView} showsVerticalScrollIndicator={false}>
              <View style={style.menuItemsContainer}>
                <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_dassboard(); }}>
                  <Ionicons name="grid-outline" size={22} color="#333" />
                  <Text style={style.menuItemText}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_allgreviences(); }}>
                  <Ionicons name="list-outline" size={22} color="#333" />
                  <Text style={style.menuItemText}>All Grievances</Text>
                </TouchableOpacity>

                {permissions.includes("addStaff") && (
                  <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_staff(); }}>
                    <Ionicons name="people-outline" size={22} color="#333" />
                    <Text style={style.menuItemText}>Staff Management</Text>
                  </TouchableOpacity>
                )}
                
                {permissions.includes("assignStaff") && (
                  <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_SubOfficer(); }}>
                    <Ionicons name="person-add-outline" size={22} color="#333" />
                    <Text style={style.menuItemText}>Sub Officer</Text>
                  </TouchableOpacity>
                )}

                {permissions.includes("addCategory") && (
                  <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_categories(); }}>
                    <Ionicons name="pricetag-outline" size={22} color="#333" />
                    <Text style={style.menuItemText}>Categories</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); hanlde_report(); }}>
                  <Ionicons name="bar-chart-outline" size={22} color="#333" />
                  <Text style={style.menuItemText}>Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={style.menuItem} onPress={handle_notifications}>
                  <Ionicons name="notifications-outline" size={22} color="#333" />
                  <View style={style.menuNotificationRow}>
                    <Text style={style.menuItemText}>Notifications</Text>
                    {notificationCount > 0 && (
                      <View style={style.menuNotificationBadge}>
                        <Text style={style.menuNotificationBadgeText}>
                          {notificationCount > 9 ? "9+" : notificationCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={style.menuDivider} />

                <TouchableOpacity style={style.menuItemLogout} onPress={() => { setShowMenu(false); handlelogout(); }}>
                  <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
                  <Text style={style.menuItemLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView 
        style={style.ScrollView}
        contentContainerStyle={style.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1976D2"]} />
        }
      >
        {/* Stats Cards */}
        <View style={style.statsContainer}>
          <View style={style.statsRow}>
            <View style={[style.statCard, { borderLeftColor: "#1976D2" }]}>
              <View style={[style.statIconContainer, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="documents-outline" size={24} color="#1976D2" />
              </View>
              <Text style={style.statNumber}>{total || 0}</Text>
              <Text style={style.statLabel}>Total</Text>
            </View>
            
            <View style={[style.statCard, { borderLeftColor: "#F57C00" }]}>
              <View style={[style.statIconContainer, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="time-outline" size={24} color="#F57C00" />
              </View>
              <Text style={style.statNumber}>{pending || 0}</Text>
              <Text style={style.statLabel}>Pending</Text>
            </View>
          </View>
          
          <View style={style.statsRow}>
            <View style={[style.statCard, { borderLeftColor: "#7B1FA2" }]}>
              <View style={[style.statIconContainer, { backgroundColor: "#F3E5F5" }]}>
                <Ionicons name="person-outline" size={24} color="#7B1FA2" />
              </View>
              <Text style={style.statNumber}>{assigned || 0}</Text>
              <Text style={style.statLabel}>Assigned</Text>
            </View>
            
            <View style={[style.statCard, { borderLeftColor: "#388E3C" }]}>
              <View style={[style.statIconContainer, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#388E3C" />
              </View>
              <Text style={style.statNumber}>{Resolved || 0}</Text>
              <Text style={style.statLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {/* Reopened Alert Banner */}
        {reopenedCount > 0 && (
          <TouchableOpacity 
            style={style.reopenedBanner}
            onPress={() => setSelected("Reopened")}
          >
            <Ionicons name="refresh-circle" size={22} color="#F57C00" />
            <Text style={style.reopenedBannerText}>
              {reopenedCount} grievance{reopenedCount > 1 ? 's' : ''} reopened by citizens
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#F57C00" />
          </TouchableOpacity>
        )}

        {/* Tab Bar */}
        <View style={style.tabContainer}>
          <TouchableOpacity
            style={[style.tab, selected === "All" && style.activeTab]}
            onPress={() => setSelected("All")}
          >
            <Text style={[style.tabText, selected === "All" && style.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.tab, selected === "Pending" && style.activeTab]}
            onPress={() => setSelected("Pending")}
          >
            <Text style={[style.tabText, selected === "Pending" && style.activeTabText]}>
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.tab, selected === "Reopened" && style.reopenedTab]}
            onPress={() => setSelected("Reopened")}
          >
            <View style={style.tabWithBadge}>
              <Text style={[style.tabText, selected === "Reopened" && style.reopenedTabText]}>
                Reopened
              </Text>
              {reopenedCount > 0 && (
                <View style={style.tabBadge}>
                  <Text style={style.tabBadgeText}>{reopenedCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.tab, selected === "Resolved" && style.activeTab]}
            onPress={() => setSelected("Resolved")}
          >
            <Text style={[style.tabText, selected === "Resolved" && style.activeTabText]}>
              Resolved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grievance List */}
        <View style={style.grievanceListContainer}>
          {getFilteredData()?.length === 0 ? (
            <View style={style.emptyState}>
              <Ionicons name="document-text-outline" size={60} color="#ccc" />
              <Text style={style.emptyStateTitle}>No Grievances Found</Text>
              <Text style={style.emptyStateText}>
                {selected === "All" ? "No grievances yet" : `No ${selected.toLowerCase()} grievances`}
              </Text>
            </View>
          ) : (
            getFilteredData()?.map((items) => (
              <TouchableOpacity
                key={items._id}
                activeOpacity={0.9}
                onPress={() =>
                  update_grev(
                    items.grevienceID,
                    items.title,
                    items.category,
                    items.state,
                    items.district,
                    items.status,
                    items.location,
                    items.description,
                    items.createdAt
                  )
                }
              >
                <View style={style.grievanceCard}>
                  <View style={style.grievanceCardHeader}>
                    <View style={style.grievanceIdContainer}>
                      <Ionicons name="document-text-outline" size={18} color="#1976D2" />
                      <Text style={style.grievanceId}>{items.grevienceID}</Text>
                    </View>

                    <View
                      style={[
                        style.statusBadge,
                        {
                          backgroundColor:
                            items.status === "Submited" ? "#E3F2FD"
                            : items.status === "Assigned" ? "#FFF8E1"
                            : items.status === "In progress" ? "#FFF3E0"
                            : items.status === "completed" || items.status === "Completed" ? "#E0F2F1"
                            : items.status === "Resolved" ? "#E8F5E9"
                            : "#F5F5F5",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          style.statusBadgeText,
                          {
                            color:
                              items.status === "Submited" ? "#1976D2"
                              : items.status === "Assigned" ? "#F57F17"
                              : items.status === "In progress" ? "#E65100"
                              : items.status === "completed" || items.status === "Completed" ? "#00695C"
                              : items.status === "Resolved" ? "#388E3C"
                              : "#757575",
                          },
                        ]}
                      >
                        {items.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={style.grievanceDate}>
                    Submitted on {items.createdAt?.split("T")[0]}
                  </Text>

                  <View style={style.grievanceDivider} />

                  <Text style={style.grievanceTitle} numberOfLines={1}>
                    {items.title}
                  </Text>
                  <Text style={style.grievanceDescription} numberOfLines={2}>
                    {items.description}
                  </Text>

                  <View style={style.grievanceFooter}>
                    <View style={style.grievanceCategory}>
                      <Ionicons name="pricetag-outline" size={16} color="#666" />
                      <Text style={style.grievanceCategoryText}>{items.category}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header_container: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  ScrollView: {
    flex: 1,
    backgroundColor: "#f4f7f9",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Menu Styles
  menuOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menu_container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    minWidth: 260,
    backgroundColor: "#fff",
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  menuCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  menuScrollView: {
    flex: 1,
  },
  menuProfileSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  menuAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  menuName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  menuEmail: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
    marginVertical: 8,
  },
  menuItemsContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
    gap: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  menuNotificationRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuNotificationBadge: {
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: "center",
  },
  menuNotificationBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  menuItemLogout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    gap: 14,
  },
  menuItemLogoutText: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "500",
  },

  // Stats Styles
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginTop: 4,
  },

  // Tab Container
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#1976D2",
  },
  tabText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 13,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Grievance List
  grievanceListContainer: {
    marginBottom: 16,
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
  grievanceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  grievanceIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  grievanceId: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  grievanceDate: {
    fontSize: 12,
    color: "#888",
    marginBottom: 12,
  },
  grievanceDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  grievanceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  grievanceDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  grievanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  grievanceCategory: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  grievanceCategoryText: {
    fontSize: 13,
    color: "#666",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
  
  // Legacy styles (keeping for compatibility)
  menuitemcontainer: {
    marginTop: 50,
    marginStart: 20,
  },
  menuItems: {
    marginStart: 30,
    marginTop: 30,
  },
  Text: {
    fontSize: 18,
  },
  itemscontainer: {
    backgroundColor: "white",
    width: "48%",
    height: 120,
    marginVertical: 10,
    borderRadius: 15,
    padding: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  gravience_card: {
    backgroundColor: "white",
    width: 320,
    height: 150,
    marginTop: 20,
    marginStart: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 10,
    shadowRadius: 4,
    elevation: 10,
  },
  SearchInputbox: {
    width: 250,
    height: 50,
    borderWidth: 1,
    marginTop: 30,
    borderBlockColor: "gray",
    marginStart: 30,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    width: 150,
    height: 40,
    // paddingVertical: 8,
    // paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 15,
    color: "#000",
    marginStart: 40,
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 5,
    width: 150,
    marginTop: 368,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  graviencedetails: {
    backgroundColor: "white",
    // width: ,
    marginTop: 20,
    // marginStart: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
    height: 180,
  },
  statusbutton: {
    backgroundColor: "#ebe54084",
    width: 100,
    height: 25,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: "100%",
    backgroundColor: "gray",
    marginTop: 10,
    height: 1,
  },
  idstatus: {
    display: "flex",
    marginStart: 10,
    marginTop: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    paddingEnd: 20,
  },
  datesection: {
    marginStart: 10,
  },
  titlediscription: {
    marginStart: 10,
    marginTop: 10,
    gap: 10,
  },
  statustrack: {
    backgroundColor: "white",
    width: 330,
    marginTop: 20,
    marginStart: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
    height: 500,
  },
  updategravience: {
    backgroundColor: "white",
    height: "100%",
    marginStart: 10,
    width: 340,
    borderRadius: 10,
    marginTop: 100,
  },
  modeltext: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginStart: 30,
  },
  lines: {
    width: 310,
    backgroundColor: "gray",
    marginTop: 20,
    height: 1,
    marginStart: 10,
  },
  gravienceView: {
    width: 300,
    marginStart: 20,
    marginTop: 20,
    borderRadius: 10,
    height: 100,
    backgroundColor: "#cbddf5ff",
  },
  text_container: {
    marginStart: 10,
    marginTop: 10,
    gap: 10,
  },
  text: {
    fontWeight: "bold",
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 300,
    marginStart: 20,
    marginTop: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  response: {
    width: 300,
    height: 80,
    borderWidth: 1,
    borderBlockColor: "gray",
    borderRadius: 10,
    marginStart: 20,
    marginTop: 10,
  },
  submit_button: {
    backgroundColor: "#819aa2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: 140,
    height: 50,
  },
  submit_container: {
    display: "flex",
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
    marginStart: 20,
    gap: 10,
  },
  cancel_button: {
    width: 140,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e3e4ff",
    borderRadius: 10,
  },
  tab: {
    flex: 1, // each tab takes equal width
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0", // default tab background
  },
  activeTab: {
    backgroundColor: "#007AFF", // selected tab color
  },
  tabText: {
    color: "#333", // default text color
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff", // selected tab text color
    fontWeight: "600",
  },
  container: {
    flexDirection: "row", // horizontal layout
    borderWidth: 1, // border around the control
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    margin: 10,
  },
  
  // Notification styles
  notificationButton: {
    position: "relative",
    padding: 4,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  notificationModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  notificationModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  markAllReadButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
    marginTop: 8,
  },
  markAllReadText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "600",
  },
  reopenedAlert: {
    backgroundColor: "#FFF3E0",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F57C00",
  },
  reopenedAlertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reopenedAlertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
  },
  reopenedAlertText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  viewReopenedButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewReopenedButtonText: {
    color: "#F57C00",
    fontSize: 14,
    fontWeight: "600",
  },
  notificationList: {
    paddingHorizontal: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  notificationItemUnread: {
    backgroundColor: "#E3F2FD",
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#1976D2",
    marginLeft: 8,
  },
  noNotifications: {
    alignItems: "center",
    paddingVertical: 50,
  },
  noNotificationsText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  
  // Reopened banner and tab styles
  reopenedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    marginHorizontal: 10,
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#F57C00",
    gap: 10,
  },
  reopenedBannerText: {
    flex: 1,
    fontSize: 14,
    color: "#E65100",
    fontWeight: "600",
  },
  reopenedTab: {
    backgroundColor: "#F57C00",
  },
  reopenedTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  tabWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tabBadge: {
    backgroundColor: "#E53935",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
});

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
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import axios, { AxiosError } from "axios";

import { setItem, getString, deleteItem, getJSON } from "../../../utils/storage";


import categories from "../Admin_pages/categories";
import { useFocusEffect } from "@react-navigation/native";

export default function DistrictAdminPortal() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const tabs = ["All", "Pending", "Assigned", "Resolved","Escalated"];
  const [selected, setSelected] = useState("All");

  const [pending_data, setpending_data] = useState<any[]>([]);
  const [assigned_data, setassinged_data] = useState<any[]>([]);
  const [inreview_data, setinreview_data] = useState<any[]>([]);
  const [resolved_data, setresolved_data] = useState<any[]>([]);
  const [escalated_data, setescalated_data] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);


    const [state, setState] = useState<any[]>([]);
    const [district, setdistrict] = useState<any[]>([]);

  useEffect(() => {
    Profile();
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (state.length > 0 && district.length > 0) {
        graivnece();
      }
      if (email) {
        fetchNotificationCount(email);
      }
    }, [state, district, email])
  );

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

    setPermissions(res.data.profile.Permissions);
    
    // Fetch notification count
    fetchNotificationCount(res.data.profile.email);
  };

  const fetchNotificationCount = async (userEmail: string) => {
    try {
      const res = await axios.get(`${API_BASE}/admin/notifications`, {
        params: { email: userEmail },
      });
      if (res.data.success) {
        setUnreadNotifications(res.data.unreadCount || 0);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Profile();
    if (state.length > 0 && district.length > 0) {
      await graivnece();
    }
    setRefreshing(false);
  }, [state, district]);

useEffect(() => {
  if (state.length > 0 && district.length > 0) {
    graivnece();
  }
}, [state, district]);



const graivnece = async () => {

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

//escalated 
// Fetch escalated grievances
try {
  const esclate = await axios.get(`${API_BASE}/admin/escalated`, {
    params: {
      email:email
    },
  });

   const  esc=esclate.data.escalated


  setescalated_data(Array.isArray(esc) ? esc : esc ? [esc] : []);
 
} catch (err) {
  const error = err as AxiosError;
  console.log("Escalated fetch error:", error?.response?.data || error);
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
      email:email
    },
  });
};


  const handle_dassboard = () => {
    // Already on dashboard, just close menu
    setShowMenu(false);
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
    case "Resolved":
      return resolved_data;
    case "Escalated":
      return escalated_data; // NEW
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

  const handle_notifications = () => {
    setShowMenu(false);
    router.push("/(tabs)/Admin_pages/Notifications");
  };

  return (
    <SafeAreaView style={style.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={style.header}>
        <TouchableOpacity style={style.menuButton} onPress={() => setShowMenu(true)}>
          <Ionicons name="menu" size={26} color="#333" />
        </TouchableOpacity>
        
        <View style={style.headerCenter}>
          <Text style={style.headerTitle}>District Admin</Text>
          <Text style={style.headerSubtitle}>{district} District</Text>
        </View>
        
        <TouchableOpacity style={style.notificationButton} onPress={handle_notifications}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          {unreadNotifications > 0 && (
            <View style={style.notificationBadge}>
              <Text style={style.badgeText}>
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
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
                <Ionicons name="shield-checkmark" size={32} color="#7B1FA2" />
              </View>
              <Text style={style.menuName}>{name || "District Admin"}</Text>
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

                {permissions.includes("add staff") && (
                  <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_staff(); }}>
                    <Ionicons name="people-outline" size={22} color="#333" />
                    <Text style={style.menuItemText}>Staff Management</Text>
                  </TouchableOpacity>
                )}
                
                {permissions.includes("add admin") && (
                  <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_SubOfficer(); }}>
                    <Ionicons name="person-add-outline" size={22} color="#333" />
                    <Text style={style.menuItemText}>Sub Officer</Text>
                  </TouchableOpacity>
                )}

                {permissions.includes("add category") && (
                  <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); handle_categories(); }}>
                    <Ionicons name="pricetag-outline" size={22} color="#333" />
                    <Text style={style.menuItemText}>Categories</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={style.menuItem} onPress={handle_notifications}>
                  <Ionicons name="notifications-outline" size={22} color="#333" />
                  <View style={style.menuItemRow}>
                    <Text style={style.menuItemText}>Notifications</Text>
                    {unreadNotifications > 0 && (
                      <View style={style.menuBadge}>
                        <Text style={style.menuBadgeText}>{unreadNotifications}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={style.menuItem} onPress={() => { setShowMenu(false); hanlde_report(); }}>
                  <Ionicons name="bar-chart-outline" size={22} color="#333" />
                  <Text style={style.menuItemText}>Reports</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7B1FA2"]}
            tintColor="#7B1FA2"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={style.statsContainer}>
          <View style={[style.statCard, { borderLeftColor: "#1976D2" }]}>
            <View style={style.statIconContainer}>
              <Ionicons name="document-text" size={24} color="#1976D2" />
            </View>
            <Text style={style.statValue}>{total || 0}</Text>
            <Text style={style.statLabel}>Total</Text>
          </View>
          
          <View style={[style.statCard, { borderLeftColor: "#F57C00" }]}>
            <View style={style.statIconContainer}>
              <Ionicons name="time" size={24} color="#F57C00" />
            </View>
            <Text style={style.statValue}>{pending || 0}</Text>
            <Text style={style.statLabel}>Pending</Text>
          </View>
          
          <View style={[style.statCard, { borderLeftColor: "#7B1FA2" }]}>
            <View style={style.statIconContainer}>
              <Ionicons name="person" size={24} color="#7B1FA2" />
            </View>
            <Text style={style.statValue}>{assigned || 0}</Text>
            <Text style={style.statLabel}>Assigned</Text>
          </View>
          
          <View style={[style.statCard, { borderLeftColor: "#388E3C" }]}>
            <View style={style.statIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#388E3C" />
            </View>
            <Text style={style.statValue}>{Resolved || 0}</Text>
            <Text style={style.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={style.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[style.tab, selected === tab && style.activeTab]}
                onPress={() => setSelected(tab)}
              >
                <Text style={[style.tabText, selected === tab && style.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Grievance Cards */}
        <View style={style.grievanceList}>
          {getFilteredData()?.length === 0 ? (
            <View style={style.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#BDBDBD" />
              <Text style={style.emptyStateTitle}>No Grievances</Text>
              <Text style={style.emptyStateText}>
                No {selected.toLowerCase()} grievances found
              </Text>
            </View>
          ) : (
            getFilteredData()?.map((items) => (
              <TouchableOpacity
                key={items._id}
                activeOpacity={0.7}
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
                  <View style={style.cardHeader}>
                    <Text style={style.grievanceId}>{items.grevienceID}</Text>
                    <View
                      style={[
                        style.statusBadge,
                        {
                          backgroundColor:
                            items.status === "Submited" ? "#E3F2FD"
                            : items.status === "Assigned" ? "#FFF8E1"
                            : items.status?.toLowerCase() === "in progress" ? "#FFF3E0"
                            : items.status?.toLowerCase() === "completed" ? "#E0F2F1"
                            : items.status === "Resolved" ? "#E8F5E9"
                            : items.escalated ? "#FCE4EC"
                            : "#F5F5F5",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          style.statusText,
                          {
                            color:
                              items.status === "Submited" ? "#1976D2"
                              : items.status === "Assigned" ? "#F57F17"
                              : items.status?.toLowerCase() === "in progress" ? "#E65100"
                              : items.status?.toLowerCase() === "completed" ? "#00695C"
                              : items.status === "Resolved" ? "#388E3C"
                              : items.escalated ? "#C2185B"
                              : "#757575",
                          },
                        ]}
                      >
                        {items.escalated ? "Escalated" : items.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={style.grievanceTitle} numberOfLines={1}>{items.title}</Text>
                  <Text style={style.grievanceDescription} numberOfLines={2}>
                    {items.description}
                  </Text>

                  <View style={style.cardFooter}>
                    <View style={style.categoryBadge}>
                      <Ionicons name="pricetag-outline" size={14} color="#666" />
                      <Text style={style.categoryText}>{items.category}</Text>
                    </View>
                    <Text style={style.dateText}>
                      {items.createdAt?.split("T")[0]}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
    backgroundColor: "#F3E5F5",
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
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
    fontWeight: "500",
  },
  menuBadge: {
    backgroundColor: "#D32F2F",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  menuItemLogout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  menuItemLogoutText: {
    fontSize: 16,
    color: "#D32F2F",
    marginLeft: 16,
    fontWeight: "500",
  },
  
  // ScrollView
  ScrollView: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  statLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  
  // Tab Bar
  tabContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#7B1FA2",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },
  
  // Grievance Cards
  grievanceList: {
    marginBottom: 16,
  },
  grievanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  grievanceId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  grievanceTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  grievanceDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
  },
  
  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 12,
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

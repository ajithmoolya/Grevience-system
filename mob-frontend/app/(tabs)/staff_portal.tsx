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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";

import { getString, deleteItem } from "../../utils/storage";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function staff() {
  const router = useRouter();
  const [showprofile, setshowprofile] = useState(false);
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [name, setname] = useState<string | null>(null);
  const [email, setemail] = useState<string | null>(null);
  const [staffId, setstaffId] = useState<string | null>(null);

  const [assignments, setassignments] = useState<Array<any>>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState(""); // SEARCH INPUT
  const [status, setstatus] = useState(""); // STATUS FILTER

  useEffect(() => {
    const get_details_from_token = async () => {
      const token = await getString("token");

      try {
        const res = await axios.get(`${API_BASE}/profile`, {
          headers: { Authorization: token },
        });

        setname(res.data.profile.name);
        setemail(res.data.profile.email);
        setstaffId(res.data.profile.staffId);
      } catch (error) {
        console.log("Error fetching details:", error);
      }
    };
    get_details_from_token();
  }, []);

  useEffect(() => {
    const get_assignments = async () => {
      if (!staffId) return;

      const res = await axios.get(`${API_BASE}/staff/assignment`, {
        params: {
          staff_id: staffId,
        },
      });

      setassignments(res.data.assignement);
    };
    get_assignments();
  }, [staffId]);

  const onRefresh = useCallback(async () => {
    if (!staffId) return;
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/staff/assignment`, {
        params: { staff_id: staffId },
      });
      setassignments(res.data.assignement);
    } catch (error) {
      console.log("Error refreshing:", error);
    }
    setRefreshing(false);
  }, [staffId]);

  const handle_update_status = (assignment: any) => {
    router.push({
      pathname: "/(tabs)/staff_pages/Upadate_Status",
      params: {
        id: assignment.grevienceID,
        title: assignment.title,
        location: assignment.location,
        paststatus: assignment.status,
      },
    });
  };

  const status_list = [
    { label: "All", value: "" },
    { label: "Assigned", value: "Assigned" },  
    { label: "In progress", value: "In progress" },
    { label: "Completed", value: "Completed" },
  ];

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Pending":
        return { bg: "#FFF3E0", text: "#F57C00" };
      case "In Review":
        return { bg: "#E3F2FD", text: "#1976D2" };
      case "Assigned":
        return { bg: "#E8EAF6", text: "#3949AB" };
      case "In progress":
      case "In Progress":
        return { bg: "#FFF8E1", text: "#FFA000" };
      case "Completed":
      case "completed":
        return { bg: "#E8F5E9", text: "#388E3C" };
      case "Resolved":
        return { bg: "#E8F5E9", text: "#388E3C" };
      case "Rejected":
        return { bg: "#FFEBEE", text: "#D32F2F" };
      default:
        return { bg: "#F5F5F5", text: "#757575" };
    }
  };

  const handlelogout = async () => {
    await deleteItem("token");
    await deleteItem("role");
    router.replace("/");
  };

  // 🔥 CASE-INSENSITIVE SEARCH + STATUS FILTER
  const filteredAssignments = assignments.filter((a) => {
    const statusMatch = status === "" || a.status?.toLowerCase() === status.toLowerCase();

    const searchLower = searchText.trim().toLowerCase();
    const idLower = a.grevienceID?.toString().toLowerCase() || "";

    const searchMatch = idLower.includes(searchLower);

    return statusMatch && searchMatch;
  });

  return (
    <View style={style.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={style.header_container}>
        <View>
          <Text style={style.headerTitle}>Staff Portal</Text>
          <Text style={style.headerSubtitle}>Grievance Management System</Text>
        </View>

        <TouchableOpacity
          style={style.profileButton}
          onPress={() => setshowprofile((prev) => !prev)}
        >
          <Ionicons name="person-circle" size={40} color="#1976D2" />
        </TouchableOpacity>

        {showprofile && (
          <Modal visible={showprofile} transparent animationType="fade">
            <TouchableOpacity
              activeOpacity={1}
              style={style.modalBackground}
              onPress={() => setshowprofile(false)}
            >
              <View style={style.profile} onStartShouldSetResponder={() => true}>
                <View style={style.profileHeader}>
                  <Ionicons name="person-circle" size={50} color="#1976D2" />
                  <View style={style.profileInfo}>
                    <Text style={style.profileName}>{name}</Text>
                    <Text style={style.profileEmail}>{email}</Text>
                  </View>
                </View>

                <View style={style.profileDivider} />

                <TouchableOpacity onPress={handlelogout} style={style.logout}>
                  <Ionicons name="log-out-outline" size={24} color="#D32F2F" />
                  <Text style={style.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>

      {/* SCROLL */}
      <ScrollView 
        style={style.ScrollView}
        contentContainerStyle={style.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1976D2"]} />
        }
      >
        {/* SEARCH + FILTER */}
        <View style={style.filterContainer}>
          <View style={style.searchContainer}>
            <Ionicons name="search" size={20} color="#888" style={style.searchIcon} />
            <TextInput
              style={style.searchInput}
              placeholder="Search by Grievance ID"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          </View>

          <Dropdown
            style={style.dropdown}
            placeholderStyle={style.dropdownPlaceholder}
            selectedTextStyle={style.dropdownSelected}
            data={status_list}
            labelField="label"
            valueField="value"
            placeholder="Filter"
            value={status}
            onChange={(item) => setstatus(item.value)}
          />
        </View>

        {/* Assignment Count */}
        <View style={style.countContainer}>
          <Text style={style.countText}>
            {filteredAssignments.length} Assignment{filteredAssignments.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* LIST OF FILTERED GRIEVANCES */}
        {filteredAssignments.length === 0 ? (
          <View style={style.emptyState}>
            <Ionicons name="document-text-outline" size={60} color="#ccc" />
            <Text style={style.emptyStateTitle}>No Assignments Found</Text>
            <Text style={style.emptyStateText}>
              {searchText || status ? "Try adjusting your filters" : "You don't have any assignments yet"}
            </Text>
          </View>
        ) : (
          filteredAssignments.map((assignment, index) => (
            <View key={index} style={style.grievanceCard}>
              <View style={style.cardHeader}>
                <View style={style.idContainer}>
                  <Ionicons name="document-text-outline" size={18} color="#1976D2" />
                  <Text style={style.grievanceId}>{assignment.grevienceID}</Text>
                </View>

                <View
                  style={[
                    style.statusBadge,
                    { backgroundColor: getStatusColor(assignment.status).bg },
                  ]}
                >
                  <Text style={[style.statusText, { color: getStatusColor(assignment.status).text }]}>
                    {assignment.status}
                  </Text>
                </View>
              </View>

              <Text style={style.grievanceTitle}>{assignment.title}</Text>

              <View style={style.detailRow}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={style.detailText}>{assignment.location}</Text>
              </View>

              <View style={style.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={style.detailText}>
                  {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>

              <View style={style.cardActions}>
                <TouchableOpacity
                  style={style.proofButton}
                  onPress={() =>
                    router.push({
                      pathname: "/staff_pages/View_Proof",
                      params: { id: assignment.grevienceID },
                    })
                  }
                >
                  <Ionicons name="eye-outline" size={18} color="#fff" />
                  <Text style={style.proofButtonText}>View Proof</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={style.updateButton}
                  onPress={() => handle_update_status(assignment)}
                >
                  <Ionicons name="create-outline" size={18} color="#1976D2" />
                  <Text style={style.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header_container: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 22,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  profileButton: {
    padding: 4,
  },
  ScrollView: {
    flex: 1,
    backgroundColor: "#f4f7f9",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profile: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 16,
    marginTop: 100,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  profileEmail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  profileDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#D32F2F",
    fontWeight: "500",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  dropdown: {
    width: 120,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: "#888",
  },
  dropdownSelected: {
    fontSize: 14,
    color: "#333",
  },
  countContainer: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  idContainer: {
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
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  grievanceTitle: {
    fontSize: isTablet ? 16 : 15,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 12,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  proofButton: {
    flex: 1,
    backgroundColor: "#1976D2",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  proofButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  updateButtonText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 20,
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
    textAlign: "center",
  },
});

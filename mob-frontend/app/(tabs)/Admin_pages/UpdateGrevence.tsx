import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";



export default function UpdateGrevence() {
  const {
    id,
    title,
    category,
    state,
    district,
    status,
    location,
    description,
    createdAt,
  } = useLocalSearchParams();
  const router = useRouter();

  const handle_back = () => {
    router.back()
  };

  useFocusEffect(
    useCallback(() => {
    
    }, [])
  );

  const handle_assign = () => {
    router.push({
      pathname:"/(tabs)/Admin_pages/AssignStaff",
      params: {
        id:id,  
        title: title,
        category: category,
        state: state,
        district: district,
      },
    });
  };

  const handle_reject = () => {
    router.push("/(tabs)/Admin_pages/correctionRequest")
  }
  
  const verification = () => {
    router.push({
      pathname: "/(tabs)/Admin_pages/Verification_page",
      params: {
        id: id,
      },
    });
  };

  const getStatusColor = (statusValue: string | string[]) => {
    const s = Array.isArray(statusValue) ? statusValue[0] : statusValue;
    const statusLower = s?.toLowerCase();
    switch (statusLower) {
      case "submited": return { bg: "#FFF3E0", text: "#E65100", label: "Submitted" };
      case "assigned": return { bg: "#E3F2FD", text: "#1565C0", label: "Assigned" };
      case "in progress": return { bg: "#FFF8E1", text: "#F57F17", label: "In Progress" };
      case "completed": return { bg: "#E0F2F1", text: "#00695C", label: "Completed" };
      case "resolved": return { bg: "#E8F5E9", text: "#1B5E20", label: "Resolved" };
      default: return { bg: "#F5F5F5", text: "#616161", label: s };
    }
  };

  // Helper to check status case-insensitively
  const isStatus = (checkStatus: string) => {
    const currentStatus = Array.isArray(status) ? status[0] : status;
    return currentStatus?.toString().toLowerCase() === checkStatus.toLowerCase();
  };

  const statusInfo = getStatusColor(status);

  return (
    <SafeAreaView style={style.container}>
      {/* Header */}
      <View style={style.header_container}>
        <TouchableOpacity onPress={handle_back} style={style.backButton}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={style.headerTextContainer}>
          <Text style={style.headerTitle}>Grievance Details</Text>
          <Text style={style.headerSubtitle}>{id}</Text>
        </View>
      </View>

      <ScrollView 
        style={style.scrollView}
        contentContainerStyle={style.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={style.statusCard}>
          <View style={style.statusRow}>
            <Text style={style.statusLabel}>Current Status</Text>
            <View style={[style.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[style.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
            </View>
          </View>
          <Text style={style.grievanceId}>{id}</Text>
        </View>

        {/* Details Section */}
        <View style={style.detailsCard}>
          <View style={style.detailItem}>
            <Text style={style.detailLabel}>Title</Text>
            <Text style={style.detailValue}>{title}</Text>
          </View>

          <View style={style.divider} />

          <View style={style.detailItem}>
            <Text style={style.detailLabel}>Category</Text>
            <Text style={style.detailValue}>{category}</Text>
          </View>

          <View style={style.divider} />

          <View style={style.detailItem}>
            <Text style={style.detailLabel}>Location</Text>
            <Text style={style.detailValue}>{location}</Text>
          </View>

          <View style={style.divider} />

          <View style={style.detailItem}>
            <Text style={style.detailLabel}>Description</Text>
            <Text style={style.detailValue}>{description}</Text>
          </View>

          <View style={style.divider} />

          <View style={style.detailItem}>
            <Text style={style.detailLabel}>Date Submitted</Text>
            <Text style={style.detailValue}>
              {(Array.isArray(createdAt) ? createdAt[0] : createdAt)?.split("T")[0]}
            </Text>
          </View>
        </View>

        {/* View Files Button */}
        <TouchableOpacity
          style={style.files_button}
          onPress={() =>
            router.push({
              pathname: "/Admin_pages/CitizenFiles",
              params: { id: id },
            })
          }
        >
          <Ionicons name="document-text-outline" size={22} color="white" />
          <Text style={style.filesButtonText}>View Submitted Files</Text>
        </TouchableOpacity>

        {/* Action Section based on Status */}
        {isStatus("Submited") && (
          <View style={style.actionContainer}>
            <TouchableOpacity style={style.assign_button} onPress={handle_assign}>
              <Ionicons name="person-add-outline" size={22} color="white" />
              <Text style={style.assignButtonText}>Assign to Staff</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={style.reject_button} onPress={handle_reject}>
              <Ionicons name="close-circle-outline" size={22} color="#D32F2F" />
              <Text style={style.rejectButtonText}>Request Correction</Text>
            </TouchableOpacity>
          </View>
        )}

        {isStatus("Assigned") && (
          <View style={style.assignedContainer}>
            <Text style={style.sectionTitle}>Assignment Status</Text>
            <View style={style.assign_info_card}>
              <View style={style.assignedIconContainer}>
                <Ionicons name="person-circle-outline" size={40} color="#1565C0" />
              </View>
              <View style={style.assignedDetails}>
                <Text style={style.assignedLabel}>Assigned to Staff</Text>
                <Text style={style.assignedDept}>{category} Department</Text>
                <View style={style.waitingBadge}>
                  <Ionicons name="time-outline" size={14} color="#F57F17" />
                  <Text style={style.waitingText}>Waiting for completion</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {isStatus("In progress") && (
          <View style={style.assignedContainer}>
            <Text style={style.sectionTitle}>Work In Progress</Text>
            <View style={style.assign_info_card}>
              <View style={[style.assignedIconContainer, { backgroundColor: "#FFF8E1" }]}>
                <Ionicons name="construct-outline" size={40} color="#F57F17" />
              </View>
              <View style={style.assignedDetails}>
                <Text style={style.assignedLabel}>Staff is working on it</Text>
                <Text style={style.assignedDept}>{category} Department</Text>
                <View style={[style.waitingBadge, { backgroundColor: "#FFF8E1" }]}>
                  <Ionicons name="sync-outline" size={14} color="#F57F17" />
                  <Text style={[style.waitingText, { color: "#F57F17" }]}>Work in progress</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {isStatus("completed") && (
          <View style={style.actionContainer}>
            <Text style={style.sectionTitle}>Staff has completed the work</Text>
            <Text style={style.sectionSubtitle}>Please verify the proof and mark as resolved</Text>
            
            <TouchableOpacity 
              style={style.viewProofButton} 
              onPress={() => router.push({
                pathname: "/Admin_pages/Verification_page",
                params: { id: id },
              })}
            >
              <Ionicons name="eye-outline" size={22} color="#1976D2" />
              <Text style={style.viewProofButtonText}>View Staff Proof</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={style.verfy_button} onPress={verification}>
              <Feather name="check-circle" size={24} color="white" />
              <Text style={style.verifyButtonText}>Verify & Resolve</Text>
            </TouchableOpacity>
          </View>
        )}

        {isStatus("Resolved") && (
          <View style={style.resolvedContainer}>
            <View style={style.resolve_box}>
              <Feather name="check-circle" size={32} color="#1B5E20" />
              <Text style={style.resolvedText}>Resolved</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header_container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#f5f7fa",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  grievanceId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
  },
  files_button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90A4",
    borderRadius: 12,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20,
  },
  filesButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  actionContainer: {
    gap: 12,
  },
  assign_button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  reject_button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D32F2F",
  },
  rejectButtonText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  assignedContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  assign_info_card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#1565C0",
  },
  assignedIconContainer: {
    marginRight: 14,
  },
  assignedDetails: {
    flex: 1,
  },
  assignedLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  assignedDept: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  waitingBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  waitingText: {
    fontSize: 12,
    color: "#F57F17",
    marginLeft: 4,
    fontWeight: "500",
  },
  verfy_button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    backgroundColor: "#5C6BC0",
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  viewProofButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBDEFB",
    marginBottom: 12,
    gap: 8,
  },
  viewProofButtonText: {
    color: "#1976D2",
    fontSize: 15,
    fontWeight: "600",
  },
  resolvedContainer: {
    marginTop: 8,
  },
  resolve_box: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  resolvedText: {
    fontWeight: "700",
    fontSize: 18,
    color: "#1B5E20",
  },
});

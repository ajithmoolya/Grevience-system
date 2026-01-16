import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

import {
  setItem,
  getString,
  deleteItem,
  getJSON,
  saveStaffProof,
  getStaffProofs,
  clearStaffProofKey ,
} from "../../../utils/storage";


import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function upadate_grevience() {
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id, title, location, paststatus } = useLocalSearchParams();

  const [staffs, setstaffs] = useState<any[]>([]);

  const [assignedTo, setAssignedTo] = useState("");

  const [remark, setremark] = useState("");

  const get_details = async () => {
    const Token = await getString("token");
   
  };
  get_details();

  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);


    useFocusEffect(
    useCallback(() => {
      // fetchGrievanceStatus();
    }, [])
  );


  useEffect(() => {
   
    const get_staff = async () => {
      const role = "staff";
      const active = true;
      const res = await axios.get(`${API_BASE}/staff`, {
        params: { role, active,location },
      });
      const names = res.data.staff.map((item: { name: string }) => item.name);
      // setstaffs(names)
      setstaffs(res.data.staff);

    };
    get_staff();
  }, []);


  const handle_back = () => {
    router.back();
  };

  const canUpdate = status !== "";



const handlePickImage = async () => {
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.8,
  });
  
  if (r.canceled) return;
  
  const asset = r.assets[0];
  const file = {
    uri: asset.uri,
    name: asset.fileName || `image_${Date.now()}.jpg`,
    mimeType: asset.mimeType || "image/jpeg",
  };
  
  setSelectedFiles(prev => [...prev, file]);
};






const ID = Array.isArray(id) ? id[0] : id ?? "";

const uploadAllFiles = async () => {
  const formData = new FormData();

  selectedFiles.forEach((file: any) => {
    formData.append(
      "files",
      {
        uri: file.uri,
        name: file.name,
        type: file.mimeType
      } as any
    );
  });

  formData.append("grievanceID", ID);

  try {
    await axios.post(`${API_BASE}/staff/uploadproof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    console.log("Upload error", error);
  }
};



const handlePickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",   // pick only one at a time
    multiple: false
  });

  if (result.canceled) return;

  const file = result.assets[0];
  setSelectedFiles(prev => [...prev, file]);
};


const update = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  
  const editedby = "staff";
  
  try {
    await axios.put(`${API_BASE}/admin/update_gravince`, {
      grevienceID: id,
      status: status,
      by: editedby,
      remark: remark,
      assignedTo: assignedTo,
    });

    await uploadAllFiles();

    Alert.alert(
      "Success",
      "Grievance updated successfully!",
      [{ text: "OK", onPress: () => router.back() }]
    );
  } catch (error) {
    Alert.alert("Error", "Failed to update grievance. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <View style={style.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={style.header}>
        <TouchableOpacity onPress={handle_back} style={style.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={style.headerTitle}>Update Grievance</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView 
          style={style.scrollView}
          contentContainerStyle={style.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Grievance Info Card */}
          <View style={style.infoCard}>
            <View style={style.infoHeader}>
              <Ionicons name="document-text" size={24} color="#1976D2" />
              <Text style={style.infoHeaderText}>Grievance Details</Text>
            </View>
            
            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Grievance ID</Text>
              <Text style={style.infoValue}>{id}</Text>
            </View>

            <View style={style.divider} />

            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Title</Text>
              <Text style={style.infoValue}>{title}</Text>
            </View>

            <View style={style.divider} />

            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Location</Text>
              <Text style={style.infoValue}>{location}</Text>
            </View>

            <View style={style.divider} />

            <View style={style.infoRow}>
              <Text style={style.infoLabel}>Current Status</Text>
              <View style={style.currentStatusBadge}>
                <Text style={style.currentStatusText}>{paststatus}</Text>
              </View>
            </View>
          </View>

          {/* Status Update Section */}
          <View style={style.section}>
            <Text style={style.sectionTitle}>Update Status</Text>
            <Text style={style.sectionSubtitle}>Select the new status for this grievance</Text>
            
            <View style={style.pickerWrapper}>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                mode="dropdown"
                style={style.picker}
                dropdownIconColor="#1976D2"
              >
                <Picker.Item label="Select Status..." value="" color="#999" />
                <Picker.Item label="In Progress" value="In progress" />
                <Picker.Item label="Completed" value="Completed" />
              </Picker>
            </View>
          </View>

          {/* Response Section */}
          <View style={style.section}>
            <Text style={style.sectionTitle}>Add Response</Text>
            <Text style={style.sectionSubtitle}>Optional message for the citizen</Text>
            
            <TextInput
              style={style.responseInput}
              placeholder="Enter your response here..."
              placeholderTextColor="#999"
              value={remark}
              onChangeText={setremark}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Upload Section - Show when status is not Completed/Resolved */}
          {paststatus?.toString().toLowerCase() !== "completed" && 
           paststatus?.toString().toLowerCase() !== "resolved" && (
            <View style={style.section}>
              <Text style={style.sectionTitle}>Upload Proof</Text>
              <Text style={style.sectionSubtitle}>Attach images or documents as proof of work</Text>
              
              <View style={style.uploadButtons}>
                <TouchableOpacity style={style.uploadButton} onPress={handlePickImage}>
                  <View style={style.uploadIconContainer}>
                    <Ionicons name="image-outline" size={24} color="#1976D2" />
                  </View>
                  <Text style={style.uploadButtonText}>Upload Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={style.uploadButton} onPress={handlePickDocument}>
                  <View style={style.uploadIconContainer}>
                    <Ionicons name="document-text-outline" size={24} color="#1976D2" />
                  </View>
                  <Text style={style.uploadButtonText}>Upload Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <View style={style.section}>
              <Text style={style.sectionTitle}>Selected Files ({selectedFiles.length})</Text>
              
              {selectedFiles.map((file, index) => (
                <View key={index} style={style.fileItem}>
                  <View style={style.fileInfo}>
                    <Ionicons 
                      name={file.mimeType?.includes("image") ? "image" : "document"} 
                      size={20} 
                      color="#388E3C" 
                    />
                    <Text style={style.fileName} numberOfLines={1}>{file.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={style.removeFileButton}
                    onPress={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={style.actionButtons}>
            <TouchableOpacity 
              style={style.cancelButton} 
              onPress={handle_back}
            >
              <Text style={style.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                style.submitButton,
                !canUpdate && style.submitButtonDisabled,
              ]}
              onPress={update}
              disabled={!canUpdate || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={style.submitButtonText}>Updating...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={style.submitButtonText}>Update & Notify</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f4f7f9",
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  infoHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  currentStatusBadge: {
    backgroundColor: "#E8EAF6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  currentStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3949AB",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#888",
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  picker: {
    height: 56,
    width: "100%",
  },
  responseInput: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    padding: 16,
    fontSize: 15,
    color: "#333",
  },
  uploadButtons: {
    flexDirection: "row",
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBDEFB",
    borderStyle: "dashed",
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1976D2",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    marginTop: 10,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: "#388E3C",
    fontWeight: "500",
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    height: 52,
    backgroundColor: "#1976D2",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});



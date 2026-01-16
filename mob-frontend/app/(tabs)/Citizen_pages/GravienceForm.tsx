import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { getString } from "../../../utils/storage";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

export default function GrievanceForm() {
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  // Validation
  const isFormValid = title && selectedCategory && description && location;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/getcategory`);
        const names = res.data.exsiting_data.map((cat: any) => cat.name);
        setCategoryList(names);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const uploadAllFiles = async (grievanceID: string) => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);
    });
    formData.append("grievanceID", grievanceID);

    try {
      await axios.post(`${API_BASE}/citizen/uploadproof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err: any) {
      console.error("Upload error:", err.response?.data || err.message);
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: false,
    });

    if (result.canceled) return;
    const file = result.assets[0];
    setSelectedFiles((prev) => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      const userEmail = await getString("email");
      const grievanceID = "GRV" + Math.floor(Math.random() * 10000);
      const createdAt = new Date();

      await uploadAllFiles(grievanceID);

      const res = await axios.post(
        `${API_BASE}/gravienceForm`,
        {
          email: userEmail,
          grevienceID: grievanceID,
          title,
          category: selectedCategory,
          description,
          location,
          status: "Submited",
          createdAt,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.message === "Submited") {
        Alert.alert(
          "Success! 🎉",
          `Your grievance has been submitted successfully.\n\nGrievance ID: ${grievanceID}\n\nYou can track your grievance using this ID.`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Grievance</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, styles.progressDotActive]}>
                <Ionicons name="create" size={16} color="#fff" />
              </View>
              <Text style={styles.progressLabel}>Details</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, selectedFiles.length > 0 && styles.progressDotActive]}>
                <Ionicons name="attach" size={16} color={selectedFiles.length > 0 ? "#fff" : "#999"} />
              </View>
              <Text style={styles.progressLabel}>Evidence</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressDot}>
                <Ionicons name="checkmark" size={16} color="#999" />
              </View>
              <Text style={styles.progressLabel}>Submit</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="document-text-outline" size={16} color="#1976D2" /> Grievance Title
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Brief title for your grievance"
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Category Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="folder-outline" size={16} color="#1976D2" /> Category
              </Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                inputSearchStyle={styles.dropdownSearchInput}
                iconStyle={styles.dropdownIcon}
                data={categoryList.map((item) => ({ label: item, value: item }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select a category"
                searchPlaceholder="Search categories..."
                value={selectedCategory}
                onChange={(item) => setSelectedCategory(item.value)}
                renderLeftIcon={() => (
                  <Ionicons name="list-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                )}
              />
            </View>

            {/* Description Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="chatbubble-outline" size={16} color="#1976D2" /> Description
              </Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe your grievance in detail. Include all relevant information that will help us address your concern."
                  placeholderTextColor="#999"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="location-outline" size={16} color="#1976D2" /> Location
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pin-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Address or landmark"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            {/* File Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="attach-outline" size={16} color="#1976D2" /> Evidence (Optional)
              </Text>
              <TouchableOpacity style={styles.uploadArea} onPress={handlePickDocument}>
                <View style={styles.uploadIconContainer}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#1976D2" />
                </View>
                <Text style={styles.uploadTitle}>Tap to upload files</Text>
                <Text style={styles.uploadSubtitle}>Images, PDFs, or documents</Text>
              </TouchableOpacity>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <View style={styles.filesContainer}>
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <View style={styles.fileInfo}>
                        <Ionicons
                          name={
                            file.mimeType?.includes("image")
                              ? "image-outline"
                              : "document-outline"
                          }
                          size={20}
                          color="#1976D2"
                        />
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeFileButton}
                        onPress={() => removeFile(index)}
                      >
                        <Ionicons name="close-circle" size={22} color="#E53935" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            disabled={!isFormValid || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Grievance</Text>
                <Ionicons name="send" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Your grievance will be reviewed and assigned to the appropriate department within 24-48 hours.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isTablet ? "10%" : 16,
    paddingTop: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  progressDotActive: {
    backgroundColor: "#1976D2",
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 8,
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: isTablet ? 30 : 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    height: isTablet ? 56 : 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: isTablet ? 16 : 15,
    color: "#333",
  },
  textAreaContainer: {
    height: 120,
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    width: "100%",
    fontSize: isTablet ? 16 : 15,
    color: "#333",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    height: isTablet ? 56 : 50,
  },
  dropdownPlaceholder: {
    fontSize: isTablet ? 16 : 15,
    color: "#999",
  },
  dropdownSelectedText: {
    fontSize: isTablet ? 16 : 15,
    color: "#333",
  },
  dropdownSearchInput: {
    height: 44,
    fontSize: isTablet ? 16 : 15,
    borderRadius: 8,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#1976D2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#888",
  },
  filesContainer: {
    marginTop: 12,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  removeFileButton: {
    padding: 4,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 16,
    height: isTablet ? 60 : 54,
    marginTop: 24,
    gap: 10,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#B0BEC5",
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
});

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
import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import { getString } from "../../../utils/storage";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

const REOPEN_REASONS = [
  { label: "Issue not fully resolved", value: "Issue not fully resolved" },
  { label: "Same problem occurred again", value: "Same problem occurred again" },
  { label: "Incorrect resolution provided", value: "Incorrect resolution provided" },
  { label: "Work quality unsatisfactory", value: "Work quality unsatisfactory" },
  { label: "Partial resolution only", value: "Partial resolution only" },
  { label: "Different issue found", value: "Different issue found" },
  { label: "Other", value: "Other" },
];

export default function ReopenGrievance() {
  const router = useRouter();
  const { id, title: grievanceTitle, reopenCount: existingReopenCount } = useLocalSearchParams();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentReopenCount = parseInt(existingReopenCount as string) || 0;
  const maxReopens = 2;
  const canReopen = currentReopenCount < maxReopens;

  const isFormValid = selectedReason && explanation.trim().length >= 20;

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Incomplete Form",
        "Please select a reason and provide a detailed explanation (at least 20 characters)."
      );
      return;
    }

    if (!canReopen) {
      Alert.alert(
        "Reopen Limit Reached",
        "This grievance has already been reopened the maximum number of times (2). Please submit a new grievance instead."
      );
      return;
    }

    Alert.alert(
      "Confirm Reopen",
      "Are you sure you want to reopen this grievance? It will be reassigned to the officer for review.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reopen",
          onPress: async () => {
            setIsLoading(true);
            try {
              const email = await getString("email");

              const res = await axios.post(
                `${API_BASE}/grievance/reopen`,
                {
                  grievanceId: id,
                  reason: selectedReason,
                  explanation,
                  email
                },
                { headers: { "Content-Type": "application/json" } }
              );

              if (res.data.success) {
                Alert.alert(
                  "Grievance Reopened",
                  "Your grievance has been reopened and will be reviewed by the assigned officer. You will receive updates on the progress.",
                  [{ text: "OK", onPress: () => router.replace("/(tabs)/Citizen") }]
                );
              } else {
                Alert.alert("Error", res.data.message || "Failed to reopen grievance.");
              }
            } catch (error: any) {
              Alert.alert(
                "Request Failed",
                error?.response?.data?.message || "Something went wrong. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reopen Grievance</Text>
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
          {/* Warning Banner */}
          {!canReopen ? (
            <View style={styles.errorBanner}>
              <Ionicons name="close-circle" size={24} color="#D32F2F" />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Reopen Limit Reached</Text>
                <Text style={styles.bannerText}>
                  This grievance has been reopened {currentReopenCount} times. Maximum allowed is {maxReopens}. Please submit a new grievance.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.warningBanner}>
              <Ionicons name="alert-circle" size={24} color="#F57C00" />
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>Before You Reopen</Text>
                <Text style={styles.bannerText}>
                  Reopening is for cases where the resolution was unsatisfactory. You can reopen a grievance maximum {maxReopens} times.
                  {currentReopenCount > 0 && ` (${maxReopens - currentReopenCount} remaining)`}
                </Text>
              </View>
            </View>
          )}

          {/* Grievance Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>Grievance Details</Text>
              <View style={styles.reopenBadge}>
                <Text style={styles.reopenBadgeText}>
                  Reopened: {currentReopenCount}/{maxReopens}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color="#666" />
              <Text style={styles.infoLabel}>ID:</Text>
              <Text style={styles.infoValue}>{id}</Text>
            </View>
            {grievanceTitle && (
              <View style={styles.infoRow}>
                <Ionicons name="chatbubble-outline" size={18} color="#666" />
                <Text style={styles.infoLabel}>Title:</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{grievanceTitle}</Text>
              </View>
            )}
          </View>

          {canReopen && (
            <>
              {/* Reason Selection */}
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="help-circle-outline" size={18} color="#1976D2" /> Why are you reopening?
                </Text>
                <Text style={styles.requiredText}>* Required</Text>

                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  data={REOPEN_REASONS}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select a reason"
                  value={selectedReason}
                  onChange={(item) => setSelectedReason(item.value)}
                  renderLeftIcon={() => (
                    <Ionicons name="list-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                  )}
                />
              </View>

              {/* Explanation Input */}
              <View style={styles.formCard}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="create-outline" size={18} color="#1976D2" /> Explain the Issue
                </Text>
                <Text style={styles.requiredText}>* Required (minimum 20 characters)</Text>

                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Please describe in detail why the resolution was unsatisfactory. Include specific issues, what was expected vs what was delivered, and any evidence if applicable."
                    placeholderTextColor="#999"
                    value={explanation}
                    onChangeText={setExplanation}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={1000}
                  />
                </View>
                <View style={styles.charCountContainer}>
                  <Text style={[
                    styles.charCount,
                    explanation.length < 20 && styles.charCountWarning
                  ]}>
                    {explanation.length}/1000
                    {explanation.length < 20 && ` (${20 - explanation.length} more needed)`}
                  </Text>
                </View>
              </View>

              {/* What Happens Next */}
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>
                  <Ionicons name="information-circle" size={18} color="#1976D2" /> What happens next?
                </Text>
                <View style={styles.infoBoxItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.infoBoxText}>Your grievance status will change to "Reopened"</Text>
                </View>
                <View style={styles.infoBoxItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.infoBoxText}>The assigned officer will be notified immediately</Text>
                </View>
                <View style={styles.infoBoxItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.infoBoxText}>A new timeline will start for resolution</Text>
                </View>
                <View style={styles.infoBoxItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.infoBoxText}>You'll receive updates on progress</Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isFormValid && styles.submitButtonDisabled
                ]}
                disabled={!isFormValid || isLoading}
                onPress={handleSubmit}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Reopen Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

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
  warningBanner: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F57C00",
  },
  errorBanner: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#D32F2F",
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  reopenBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reopenBadgeText: {
    fontSize: 12,
    color: "#F57C00",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  formCard: {
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
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 4,
  },
  requiredText: {
    fontSize: 12,
    color: "#E53935",
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dropdownPlaceholder: {
    color: "#999",
    fontSize: 15,
  },
  dropdownSelectedText: {
    color: "#333",
    fontSize: 15,
  },
  textAreaContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    padding: 16,
    fontSize: 15,
    color: "#333",
    minHeight: 150,
  },
  charCountContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
  },
  charCountWarning: {
    color: "#E53935",
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 12,
  },
  infoBoxItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bulletPoint: {
    color: "#1976D2",
    marginRight: 8,
    fontSize: 14,
  },
  infoBoxText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F57C00",
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: "#F57C00",
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    alignItems: "center",
    padding: 16,
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#666",
  },
});

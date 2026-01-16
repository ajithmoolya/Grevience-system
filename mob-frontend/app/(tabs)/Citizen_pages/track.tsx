import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

export default function TrackScreen() {
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();

  const [grievanceId, setGrievanceId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [latest, setLatest] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleTrack = async () => {
    if (!grievanceId.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_BASE}/gravienceForm/Track`,
        { grevienceID: grievanceId },
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.data || !res.data.data) {
        setStatusData(null);
        setLatest([]);
        setTitle(null);
        setCategory(null);
        setDate(null);
        setDescription(null);
        setError("No grievance found with this ID");
        return;
      }

      const data = res.data.data;
      setStatusData(res.data);
      setTitle(data.title);
      setCategory(data.category);
      setDate(data.createdAt?.split("T")[0]);
      setDescription(data.description);

      if (data.history) {
        type HistoryItem = {
          _id: string;
          by: string;
          date: string;
          remark: string;
          status: string;
        };

        const historyArray = data.history as HistoryItem[];
        const latestItems = Object.values(
          historyArray.reduce<Record<string, HistoryItem>>((acc, item) => {
            if (
              !acc[item.status] ||
              new Date(item.date) > new Date(acc[item.status].date)
            ) {
              acc[item.status] = item;
            }
            return acc;
          }, {})
        );
        setLatest(latestItems);
      }
    } catch (err) {
      setError("Failed to fetch grievance. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setGrievanceId("");
    setStatusData(null);
    setLatest([]);
    setError(null);
  };

  const timelineSteps = [
    {
      status: "Submited",
      color: "#1976D2",
      desc: "Grievance received",
      icon: "document-text",
    },
    {
      status: "Assigned",
      color: "#FF9800",
      desc: "Assigned to officer",
      icon: "person",
    },
    {
      status: "In progress",
      color: "#9C27B0",
      desc: "Being addressed",
      icon: "construct",
    },
    {
      status: "Resolved",
      color: "#4CAF50",
      desc: "Issue resolved",
      icon: "checkmark-done",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Grievance</Text>
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
          {/* Search Card */}
          <View style={styles.searchCard}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={32} color="#1976D2" />
            </View>
            <Text style={styles.searchTitle}>Track Your Grievance</Text>
            <Text style={styles.searchSubtitle}>
              Enter your grievance ID to view current status and updates
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter Grievance ID (e.g., GRV1234)"
                placeholderTextColor="#999"
                value={grievanceId}
                onChangeText={setGrievanceId}
                autoCapitalize="characters"
              />
              {grievanceId.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.trackButton, !grievanceId.trim() && styles.trackButtonDisabled]}
              onPress={handleTrack}
              disabled={!grievanceId.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="locate" size={20} color="#fff" />
                  <Text style={styles.trackButtonText}>Track Status</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#E53935" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Results */}
          {statusData && (
            <View style={styles.resultsContainer}>
              {/* Grievance Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoHeader}>
                  <View style={styles.infoIdContainer}>
                    <Text style={styles.infoIdLabel}>Grievance ID</Text>
                    <Text style={styles.infoId}>{grievanceId}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {latest.length > 0 ? latest[latest.length - 1]?.status : "Submitted"}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoBody}>
                  <Text style={styles.infoTitle}>{title}</Text>
                  <Text style={styles.infoDescription} numberOfLines={3}>
                    {description}
                  </Text>

                  <View style={styles.infoMeta}>
                    <View style={styles.infoMetaItem}>
                      <Ionicons name="folder-outline" size={16} color="#666" />
                      <Text style={styles.infoMetaText}>{category}</Text>
                    </View>
                    <View style={styles.infoMetaItem}>
                      <Ionicons name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.infoMetaText}>{date}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Timeline Card */}
              <View style={styles.timelineCard}>
                <Text style={styles.timelineTitle}>Status Timeline</Text>

                {timelineSteps.map((step, index) => {
                  const isCompleted = latest.some(
                    (i) => i.status.toLowerCase() === step.status.toLowerCase()
                  );
                  const stepDate = latest.find(
                    (i) => i.status.toLowerCase() === step.status.toLowerCase()
                  )?.date;

                  return (
                    <View key={index} style={styles.timelineStep}>
                      {/* Timeline Line */}
                      <View style={styles.timelineLineContainer}>
                        {index > 0 && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: isCompleted ? step.color : "#E0E0E0" },
                            ]}
                          />
                        )}
                        <View
                          style={[
                            styles.timelineCircle,
                            {
                              backgroundColor: isCompleted ? step.color : "#E0E0E0",
                              borderColor: isCompleted ? step.color : "#E0E0E0",
                            },
                          ]}
                        >
                          <Ionicons
                            name={step.icon as any}
                            size={16}
                            color={isCompleted ? "#fff" : "#999"}
                          />
                        </View>
                      </View>

                      {/* Step Content */}
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineStepTitle,
                            { color: isCompleted ? step.color : "#999" },
                          ]}
                        >
                          {step.status}
                        </Text>
                        <Text style={styles.timelineStepDesc}>{step.desc}</Text>
                        {isCompleted && stepDate && (
                          <Text style={styles.timelineStepDate}>
                            {new Date(stepDate).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        )}
                      </View>

                      {/* Completed Check */}
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={20} color={step.color} />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Empty State */}
          {!statusData && !error && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="location-outline" size={50} color="#ccc" />
              </View>
              <Text style={styles.emptyTitle}>Track Your Complaint</Text>
              <Text style={styles.emptySubtitle}>
                Enter your grievance ID above to see the current status and timeline
              </Text>
            </View>
          )}

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
  searchCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: isTablet ? 22 : 20,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
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
    width: "100%",
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: isTablet ? 16 : 15,
    color: "#333",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 12,
    height: isTablet ? 54 : 50,
    width: "100%",
    gap: 8,
  },
  trackButtonDisabled: {
    backgroundColor: "#B0BEC5",
  },
  trackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: "#E53935",
    fontSize: 14,
  },
  resultsContainer: {
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  infoIdContainer: {},
  infoIdLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  infoId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976D2",
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 13,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  infoBody: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 16,
  },
  infoMeta: {
    flexDirection: "row",
    gap: 20,
  },
  infoMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoMetaText: {
    fontSize: 13,
    color: "#666",
  },
  timelineCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 20,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  timelineLineContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineLine: {
    position: "absolute",
    top: -24,
    width: 3,
    height: 24,
    borderRadius: 2,
  },
  timelineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  timelineStepDesc: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  timelineStepDate: {
    fontSize: 12,
    color: "#1976D2",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    marginTop: 20,
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
    fontSize: 18,
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
});

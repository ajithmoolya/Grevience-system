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
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { getString } from "../../../utils/storage";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

export default function FeedbackForm() {
  const router = useRouter();
  const { id, title: grievanceTitle } = useLocalSearchParams();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const ratingLabels = [
    "",
    "Very Poor",
    "Poor",
    "Average",
    "Good",
    "Excellent"
  ];

  const ratingColors = [
    "#ccc",
    "#E53935",
    "#FF7043",
    "#FFB300",
    "#7CB342",
    "#43A047"
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }

    setIsLoading(true);
    try {
      const email = await getString("email");
      
      const res = await axios.post(
        `${API_BASE}/grievance/feedback`,
        {
          grievanceId: id,
          rating,
          feedback,
          email
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        Alert.alert(
          "Thank You! 🙏",
          "Your feedback has been submitted successfully. We appreciate your input!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Error", res.data.message || "Failed to submit feedback.");
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

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={isTablet ? 48 : 40}
            color={i <= rating ? ratingColors[rating] : "#D1D5DB"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
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
          {/* Grievance Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#1976D2" />
              <Text style={styles.infoLabel}>Grievance ID:</Text>
              <Text style={styles.infoValue}>{id}</Text>
            </View>
            {grievanceTitle && (
              <View style={styles.infoRow}>
                <Ionicons name="chatbubble-outline" size={20} color="#1976D2" />
                <Text style={styles.infoLabel}>Title:</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{grievanceTitle}</Text>
              </View>
            )}
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#43A047" />
              <Text style={styles.statusText}>Resolved</Text>
            </View>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>How satisfied are you?</Text>
            <Text style={styles.sectionSubtitle}>
              Your feedback helps us improve our services
            </Text>

            <View style={styles.starsContainer}>
              {renderStars()}
            </View>

            {rating > 0 && (
              <View style={[styles.ratingLabelContainer, { backgroundColor: ratingColors[rating] + "20" }]}>
                <Text style={[styles.ratingLabel, { color: ratingColors[rating] }]}>
                  {ratingLabels[rating]}
                </Text>
              </View>
            )}
          </View>

          {/* Feedback Text Section */}
          <View style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="chatbox-outline" size={18} color="#1976D2" /> Share Your Feedback
            </Text>
            <Text style={styles.optionalText}>(Optional)</Text>

            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about your experience. What went well? What could be improved?"
                placeholderTextColor="#999"
                value={feedback}
                onChangeText={setFeedback}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>
            <Text style={styles.charCount}>{feedback.length}/500</Text>
          </View>

          {/* Quick Feedback Options */}
          <View style={styles.quickFeedbackCard}>
            <Text style={styles.quickFeedbackTitle}>Quick Feedback</Text>
            <View style={styles.tagsContainer}>
              {[
                "Quick Response",
                "Professional Staff",
                "Good Communication",
                "Timely Resolution",
                "Needs Improvement",
                "Delayed Response"
              ].map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tag,
                    feedback.includes(tag) && styles.tagSelected
                  ]}
                  onPress={() => {
                    if (feedback.includes(tag)) {
                      setFeedback(feedback.replace(tag + ", ", "").replace(tag, ""));
                    } else {
                      setFeedback(feedback ? feedback + ", " + tag : tag);
                    }
                  }}
                >
                  <Text style={[
                    styles.tagText,
                    feedback.includes(tag) && styles.tagTextSelected
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              rating === 0 && styles.submitButtonDisabled
            ]}
            disabled={rating === 0 || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Skip Option */}
          <TouchableOpacity style={styles.skipButton} onPress={handleBack}>
            <Text style={styles.skipButtonText}>Maybe Later</Text>
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
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
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
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    color: "#43A047",
    fontWeight: "600",
  },
  ratingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: isTablet ? 16 : 12,
  },
  starButton: {
    padding: 4,
  },
  ratingLabelContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  feedbackCard: {
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
  optionalText: {
    fontSize: 13,
    color: "#999",
    marginTop: -4,
    marginBottom: 16,
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
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 8,
  },
  quickFeedbackCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickFeedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tagSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1976D2",
  },
  tagText: {
    fontSize: 13,
    color: "#666",
  },
  tagTextSelected: {
    color: "#1976D2",
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 16,
    padding: 18,
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  skipButton: {
    alignItems: "center",
    padding: 16,
  },
  skipButtonText: {
    fontSize: 15,
    color: "#666",
  },
});

import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";

export default function viewdetails() {
  const { id } = useLocalSearchParams();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [statusdata, setstatusdata] = useState<any>(null);
  const [latest, setLatest] = useState<any[]>([]);

  const [title, settitle] = useState<string | null>(null);
  const [description, setdescription] = useState<string | null>(null);
  const [category, setcategory] = useState<string | null>(null);
  const [date, setdate] = useState<string | null>(null);
  const [status, setstatus] = useState<string | null>(null);
  
  // New states for feedback and reopen
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [reopenCount, setReopenCount] = useState(0);
  const [citizenRating, setCitizenRating] = useState<number | null>(null);

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  // Navigate to feedback form
  const handleFeedback = () => {
    router.push({
      pathname: "/(tabs)/Citizen_pages/FeedbackForm",
      params: { id, title }
    });
  };

  // Navigate to reopen form
  const handleReopen = () => {
    router.push({
      pathname: "/(tabs)/Citizen_pages/ReopenGrievance",
      params: { id, title, reopenCount: reopenCount.toString() }
    });
  };

  useEffect(() => {
    const history = async () => {
      const res = await axios.post(
        `${API_BASE}/gravienceForm/Track`,
        { grevienceID: id },
        { headers: { "Content-Type": "application/json" } }
      );
      setstatusdata(res.data);
      settitle(res.data.data.title);
      setcategory(res.data.data.category);
      setdate(res.data.data.createdAt);
      setdescription(res.data.data.description);
      setstatus(res.data.data.status);
      
      // Set feedback and reopen data
      setIsFeedbackSubmitted(res.data.data.isFeedbackSubmitted || false);
      setReopenCount(res.data.data.reopenCount || 0);
      setCitizenRating(res.data.data.citizenRating || null);
    };
    history();
  }, []);

  // ✅ Run timeline logic only after statusdata is fetched
  useEffect(() => {
    if (!statusdata || !statusdata.data || !statusdata.data.history) return;

    const his = statusdata.data.history;

    type HistoryItem = {
      _id: string;
      by: string;
      date: string;
      remark: string;
      status: string;
    };

    const historyArray = his as HistoryItem[];

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
  }, [statusdata]);

  // color props
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "submited":
        return "#748fd2ff"; 
      case "in progress":
        return "#FF5722"; 
      case "assigned":
        return "#FFC107"; 
      case "resolved":
        return "#49df5fff";
      case "reopened":
        return "#F57C00";
      default:
        return "#fdfbfbff"; 
    }
  };

  // Check if grievance is resolved and can show action buttons
  const isResolved = status?.toLowerCase() === "resolved";
  const canReopen = isResolved && reopenCount < 2;
  const canGiveFeedback = isResolved && !isFeedbackSubmitted;

  return (
    <View>
      <View style={style.headercontainer}>
        <View style={style.headeritems}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={style.headertext}>Grievance Details</Text>
        </View>
      </View>

      <ScrollView style={style.ScrollView}>
        <View style={{ minHeight: 900 }}>

          <View style={{paddingHorizontal:10}}>
            <View style={style.graviencedetails}>
              <View>
                <View style={style.idstatus}>
                  <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                    Grievance ID:{id}
                  </Text>
                  <View
                    style={[
                      style.statusbutton,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  >


                   <Text style={{ fontWeight: "bold" }}>
  {status?.toLowerCase() === "completed" || status?.toLowerCase() === "verified"
    ? "In progress"
    : status}
</Text>

                    



                  </View>
                </View>
                
                <View>
                  <Text style={style.datesection}>
                    Submited on {date?.split("T")[0]}
                  </Text>

                  <View style={style.line}></View>

                  <View style={style.titlediscription}>
                    <View>
                      <Text style={{ fontWeight: "bold" }}>{title}</Text>
                    </View>

                    <View style={{ width: "95%" }}>
                      <Text style={{ textAlign: "justify", lineHeight: 25 }}>
                        {description}
                      </Text>
                    </View>

                    <Text style={{ marginBottom: "5%" }}>
                      <Ionicons
                        name="document-text-outline"
                        size={20}
                        color="#374151"
                      />{" "}
                      {category}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons for Resolved Grievances */}
            {isResolved && (
              <View style={style.actionButtonsContainer}>
                {/* Feedback Button */}
                {canGiveFeedback ? (
                  <TouchableOpacity 
                    style={style.feedbackButton}
                    onPress={handleFeedback}
                  >
                    <Ionicons name="star" size={20} color="#fff" />
                    <Text style={style.feedbackButtonText}>Rate Your Experience</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={style.feedbackSubmittedContainer}>
                    <View style={style.feedbackSubmittedBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#43A047" />
                      <Text style={style.feedbackSubmittedText}>Feedback Submitted</Text>
                    </View>
                    {citizenRating && (
                      <View style={style.ratingDisplay}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= citizenRating ? "star" : "star-outline"}
                            size={18}
                            color={star <= citizenRating ? "#FFB300" : "#ccc"}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Reopen Button */}
                {canReopen && (
                  <TouchableOpacity 
                    style={style.reopenButton}
                    onPress={handleReopen}
                  >
                    <Ionicons name="refresh" size={20} color="#F57C00" />
                    <Text style={style.reopenButtonText}>Not Satisfied? Reopen Grievance</Text>
                  </TouchableOpacity>
                )}

                {/* Reopen limit message */}
                {!canReopen && reopenCount >= 2 && (
                  <View style={style.reopenLimitContainer}>
                    <Ionicons name="information-circle" size={18} color="#666" />
                    <Text style={style.reopenLimitText}>
                      Reopen limit reached ({reopenCount}/2). Please submit a new grievance if needed.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Show reopened info if status is Reopened */}
            {status?.toLowerCase() === "reopened" && (
              <View style={style.reopenedInfoContainer}>
                <View style={style.reopenedInfoHeader}>
                  <Ionicons name="refresh-circle" size={24} color="#F57C00" />
                  <Text style={style.reopenedInfoTitle}>Grievance Reopened</Text>
                </View>
                <Text style={style.reopenedInfoText}>
                  This grievance has been reopened and is being reviewed again. (Reopened {reopenCount} time{reopenCount > 1 ? 's' : ''})
                </Text>
              </View>
            )}

            <View style={style.statustrack}>
              <Text style={style.timelineTitle}>Status Timeline</Text>

              <View style={{ marginTop: 25 }}>
                {[
                  {
                    status: "Submited",
                    color: "#0e318cff",
                    desc: "Request received",
                    icon: "checkmark-circle",
                  },
                  {
                    status: "Assigned",
                    color: "#FFC107",
                    desc: "Assigned to staff",
                    icon: "radio-button-on",
                  },
                  {
                    status: "In progress",
                    color: "#FF5722",
                    desc: "Being reviewed",
                    icon: "ellipse",
                  },
                  {
                    status: "Resolved",
                    color: "#3f7747ff",
                    desc: "Issue resolved",
                    icon: "ellipse",
                  },
                ].map((step, index) => {
                  const isCompleted = latest.some(
                    (i) => i.status.toLowerCase() === step.status.toLowerCase()
                  );
                  const date = latest.find(
                    (i) => i.status.toLowerCase() === step.status.toLowerCase()
                  )?.date;
                  return (
                    <View key={index} style={style.stepContainer}>
                      {/* Left timeline connector */}
                      <View style={style.timelineColumn}>
                        {index !== 0 && (
                          <View
                            style={[
                              style.verticalLine,
                              {
                                backgroundColor: isCompleted
                                  ? step.color
                                  : "#d1d5db",
                              },
                            ]}
                          />
                        )}
                        <View
                          style={[
                            style.statusCircle,
                            {
                              backgroundColor: isCompleted
                                ? step.color
                                : "#e5e7eb",
                            },
                          ]}
                        >
                          <Ionicons
                            name={step.icon as any}
                            size={20}
                            color={isCompleted ? "white" : "#6b7280"}
                          />
                        </View>
                      </View>

                      {/* Right content */}
                      <View style={style.statusContent}>
                        <Text
                          style={[
                            style.statusTitle,
                            { color: isCompleted ? step.color : "#6b7280" },
                          ]}
                        >
                          {step.status}
                        </Text>
                        <Text style={style.statusDesc}>{step.desc}</Text>
                        {isCompleted && (
                          <Text style={style.statusDate}>
                            {new Date(date).toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  headercontainer: {
    backgroundColor: "White",
    height: 100,
    alignContent: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  headeritems: {
    flexDirection: "row",
    alignItems: "center",
    marginStart: "5%",
    gap: 15,
  },
  headertext: {
    color: "black",
    fontWeight: "bold",
    fontSize: 20,
  },
  ScrollView: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f4f7f9ff",
  },

  graviencedetails: {
    backgroundColor: "white",

    marginTop: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
  },
  statusbutton: {
    backgroundColor: "#ebe54084",
    width: 100,
    height: 25,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: "5%",
  },
  line: {
    backgroundColor: "gray",
    marginTop: 10,
    height: 1,
  },
  idstatus: {
    display: "flex",
    alignItems: "center",
    marginTop: 15,
    flexDirection: "row",
    marginStart: "5%",
    justifyContent: "space-between",
  },
  datesection: {
    marginStart: "5%",
  },
  titlediscription: {
    marginStart: "5%",
    marginTop: 10,
    gap: 10,
  },
  
  // Action Buttons Styles
  actionButtonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    shadowColor: "#1976D2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  feedbackSubmittedContainer: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feedbackSubmittedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackSubmittedText: {
    color: "#43A047",
    fontSize: 15,
    fontWeight: "600",
  },
  ratingDisplay: {
    flexDirection: "row",
    gap: 2,
  },
  reopenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: "#F57C00",
  },
  reopenButtonText: {
    color: "#F57C00",
    fontSize: 15,
    fontWeight: "600",
  },
  reopenLimitContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  reopenLimitText: {
    color: "#666",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  reopenedInfoContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F57C00",
  },
  reopenedInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reopenedInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
  },
  reopenedInfoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  
  statustrack: {
    backgroundColor: "white",
    marginTop: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
    paddingBottom: 20,
  },

  timelineTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 20,
    marginLeft: 20,
    color: "#111827",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: "5%",
    marginLeft: 20,
  },
  timelineColumn: {
    alignItems: "center",
    marginRight: 15,
  },
  verticalLine: {
    position: "absolute",
    top: -50,
    height: 50,
    width: 3,
    zIndex: -1,
    borderRadius: 2,
  },
  statusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusDesc: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 2,
  },
  statusDate: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
});

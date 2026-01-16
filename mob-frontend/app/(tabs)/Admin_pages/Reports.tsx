import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";
import { useRouter } from "expo-router";
import axios from "axios";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Buffer } from "buffer";

global.Buffer = global.Buffer || Buffer;

const COLORS = {
  primary: "#1a73e8",
  primaryDark: "#1557b0",
  secondary: "#34a853",
  danger: "#ea4335",
  warning: "#fbbc04",
  background: "#f5f7fa",
  white: "#ffffff",
  text: "#202124",
  textSecondary: "#5f6368",
  border: "#dadce0",
  cardShadow: "#00000015",
};

export default function Report() {
  const [date, setDate] = useState(new Date());
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const [enddate, setEndDate] = useState(new Date());
  const router = useRouter();

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const [pickedstartDate, setPickedstartDate] = useState("");
  const [pickedendDate, setPickedendDate] = useState("");

  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const convertToBackendDate = (dateString: any) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`;
  };

  const validateDates = () => {
    if (!pickedstartDate || !pickedendDate) {
      Alert.alert("Missing Dates", "Please select both start and end dates.");
      return false;
    }
    return true;
  };

  const export_excel = async () => {
    if (!validateDates()) return;
    setLoadingExcel(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/report/excel`, {
        params: {
          start: convertToBackendDate(pickedstartDate),
          end: convertToBackendDate(pickedendDate),
          status: status,
        },
        responseType: "arraybuffer",
      });
      const base64Data = Buffer.from(response.data, "binary").toString("base64");

      const fileUri = FileSystem.documentDirectory + "report.xlsx";

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: "base64",
      });

      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.log("Error downloading file:", err);
      Alert.alert("Error", "Failed to export Excel report. Please try again.");
    } finally {
      setLoadingExcel(false);
    }
  };

  const status_list = [
    { label: "All Status", value: "" },
    { label: "Submitted", value: "Submited" },
    { label: "In Review", value: "In Review" },
    { label: "Assigned", value: "Assigned" },
    { label: "In Progress", value: "In Progress" },
    { label: "Resolved", value: "Resolved" },
    { label: "Closed", value: "Closed" },
  ];

  const [status, setStatus] = useState("");

  const onChangestart = (event: any, selectedDate?: Date) => {
    setShowStart(false);

    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString("en-GB");
      setPickedstartDate(formatted);
      setDate(selectedDate);
    }
  };

  const onChangeend = (event: any, selectedDate?: Date) => {
    setShowEnd(false);

    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString("en-GB");
      setPickedendDate(formatted);
      setEndDate(selectedDate);
    }
  };

  const export_pdf = async () => {
    if (!validateDates()) return;
    setLoadingPdf(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/report/pdf`, {
        params: {
          start: convertToBackendDate(pickedstartDate),
          end: convertToBackendDate(pickedendDate),
          status: status,
        },
        responseType: "arraybuffer",
      });

      const base64Data = Buffer.from(response.data, "binary").toString("base64");

      const fileUri = FileSystem.documentDirectory + "report.pdf";

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.log("PDF download error:", err);
      Alert.alert("Error", "Failed to export PDF report. Please try again.");
    } finally {
      setLoadingPdf(false);
    }
  };

  const handle_back = () => {
    router.back();
  };

  const clearFilters = () => {
    setPickedstartDate("");
    setPickedendDate("");
    setStatus("");
    setDate(new Date());
    setEndDate(new Date());
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handle_back} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="file-chart" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Generate Reports</Text>
        </View>
        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
          <Ionicons name="refresh" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.infoText}>
            Select a date range and optionally filter by status to generate grievance reports.
          </Text>
        </View>

        {/* Filters Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Report Filters</Text>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="calendar" size={16} color={COLORS.primary} /> Start Date
            </Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStart(true)}
              activeOpacity={0.7}
            >
              <TextInput
                placeholder="Select start date"
                placeholderTextColor={COLORS.textSecondary}
                value={pickedstartDate}
                editable={false}
                style={styles.dateText}
                pointerEvents="none"
              />
              <View style={styles.calendarIcon}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
            {showStart && (
              <DateTimePicker
                value={date}
                mode="date"
                onChange={onChangestart}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="calendar" size={16} color={COLORS.primary} /> End Date
            </Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEnd(true)}
              activeOpacity={0.7}
            >
              <TextInput
                placeholder="Select end date"
                placeholderTextColor={COLORS.textSecondary}
                value={pickedendDate}
                editable={false}
                style={styles.dateText}
                pointerEvents="none"
              />
              <View style={styles.calendarIcon}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
            {showEnd && (
              <DateTimePicker
                value={enddate}
                mode="date"
                onChange={onChangeend}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Status Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="filter" size={16} color={COLORS.primary} /> Status Filter
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.dropdownItemText}
              data={status_list}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="All Status"
              value={status}
              onChange={(item) => setStatus(item.value)}
              renderLeftIcon={() => (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={COLORS.textSecondary}
                  style={{ marginRight: 8 }}
                />
              )}
            />
          </View>
        </View>

        {/* Export Options Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Options</Text>

          {/* PDF Button */}
          <TouchableOpacity
            style={[styles.exportButton, styles.pdfButton]}
            onPress={export_pdf}
            disabled={loadingPdf || loadingExcel}
            activeOpacity={0.8}
          >
            {loadingPdf ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <View style={styles.exportIconContainer}>
                  <MaterialCommunityIcons name="file-pdf-box" size={28} color={COLORS.white} />
                </View>
                <View style={styles.exportTextContainer}>
                  <Text style={styles.exportButtonTitle}>Export as PDF</Text>
                  <Text style={styles.exportButtonSubtitle}>Generate printable report</Text>
                </View>
                <Ionicons name="download-outline" size={24} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>

          {/* Excel Button */}
          <TouchableOpacity
            style={[styles.exportButton, styles.excelButton]}
            onPress={export_excel}
            disabled={loadingPdf || loadingExcel}
            activeOpacity={0.8}
          >
            {loadingExcel ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <View style={styles.exportIconContainer}>
                  <MaterialCommunityIcons name="microsoft-excel" size={28} color={COLORS.white} />
                </View>
                <View style={styles.exportTextContainer}>
                  <Text style={styles.exportButtonTitle}>Export as Excel</Text>
                  <Text style={styles.exportButtonSubtitle}>Generate spreadsheet data</Text>
                </View>
                <Ionicons name="download-outline" size={24} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f0fe",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  dateInput: {
    height: 52,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.background,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  calendarIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdown: {
    height: 52,
    borderColor: COLORS.border,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
  },
  dropdownItemText: {
    fontSize: 15,
    color: COLORS.text,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  pdfButton: {
    backgroundColor: "#dc3545",
  },
  excelButton: {
    backgroundColor: "#198754",
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  exportTextContainer: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
  exportButtonSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
});

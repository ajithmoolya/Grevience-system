import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
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
} from "../../../utils/storage";

export default function AssignStaff() {
  const [status, setStatus] = useState<string>("Assigned");

  const { id, title, category, state, district } = useLocalSearchParams();

  const [staffs, setstaffs] = useState<any[]>([]);

  const [assignedTo, setAssignedTo] = useState("");

  const [remark, setremark] = useState("");

  const get_details = async () => {
    const Token = await getString("token");
  };
  get_details();

  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const get_staff = async () => {
      const role = "staff";
      const active = true;
      const res = await axios.get(`${API_BASE}/staff`, {
        params: { role, active, state, district, category },
      });
      setstaffs(res.data.staff);
    };
    get_staff();
  }, []);

  const update = async () => {
    const editedby = "staff";
    console.log(assignedTo);
    const res = await axios.put(`${API_BASE}/admin/update_gravince`, {
      grevienceID: id,
      status: status,
      by: editedby,
      remark: remark,
      assignedTo: assignedTo,
    });
    Alert.alert(res.data.message);
    router.back();
    router.back();
  };

  const handle_back = () => {
    router.back();
  };

  const canUpdate = status !== "" && assignedTo !== "" && remark.trim() !== "";

  return (
    <SafeAreaView style={style.container}>
      <ScrollView 
        style={style.scrollView}
        contentContainerStyle={style.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={style.header_container}>
          <TouchableOpacity onPress={handle_back} style={style.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={style.headerTitle}>Assign Staff</Text>
        </View>

        {/* Grievance Info Card */}
        <View style={style.gravienceView}>
          <View style={style.text_container}>
            <View style={style.infoRow}>
              <Text style={style.label}>Grievance ID:</Text>
              <Text style={style.value}>{id}</Text>
            </View>

            <View style={style.infoRow}>
              <Text style={style.label}>Title:</Text>
              <Text style={style.value} numberOfLines={2}>{title}</Text>
            </View>

            <View style={style.infoRow}>
              <Text style={style.label}>Category:</Text>
              <Text style={style.value}>{category}</Text>
            </View>
          </View>
        </View>

        {/* Status Picker */}
        <Text style={style.sectionLabel}>Status</Text>
        <View style={style.pickerWrapper}>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue) => setStatus(itemValue)}
            mode="dropdown"
            style={style.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item label="Submitted" value="Submited" />
            <Picker.Item label="Assigned" value="Assigned" />
            <Picker.Item label="In Progress" value="In Progress" />
            <Picker.Item label="Resolved" value="Resolved" />
          </Picker>
        </View>

        {/* Staff Assignment Picker */}
        <Text style={style.sectionLabel}>Assign To Staff</Text>
        <View style={style.pickerWrapper}>
          <Picker
            selectedValue={assignedTo}
            onValueChange={(itemValue) => setAssignedTo(itemValue)}
            style={style.picker}
            dropdownIconColor="#333"
          >
            <Picker.Item label="-- Select Staff --" value="" />
            {staffs.map((staff) => (
              <Picker.Item
                key={staff._id}
                label={`${staff.name} (${staff.staffId})`}
                value={staff.staffId}
              />
            ))}
          </Picker>
        </View>

        {/* Response Input */}
        <Text style={style.sectionLabel}>Add Remark</Text>
        <TextInput
          style={style.response}
          placeholder="Enter remark or instructions for staff..."
          placeholderTextColor="#999"
          value={remark}
          onChangeText={setremark}
          multiline
          textAlignVertical="top"
        />

        {/* Buttons */}
        <View style={style.submit_container}>
          <TouchableOpacity
            style={[
              style.submit_button,
              { backgroundColor: canUpdate ? "#4A90A4" : "#B8C4C8" },
            ]}
            onPress={update}
            disabled={!canUpdate}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={style.submitButtonText}>Assign & Notify</Text>
          </TouchableOpacity>

          <TouchableOpacity style={style.cancel_button} onPress={handle_back}>
            <Ionicons name="close-circle-outline" size={20} color="#555" style={{ marginRight: 8 }} />
            <Text style={style.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header_container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  gravienceView: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4A90A4",
  },
  text_container: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  label: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
    width: 100,
  },
  value: {
    flex: 1,
    color: "#333",
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 24,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    height: 55,
    width: "100%",
  },
  response: {
    height: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 14,
    fontSize: 15,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  submit_container: {
    flexDirection: "row",
    marginTop: 32,
    gap: 12,
  },
  submit_button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cancel_button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e8eaed",
    borderRadius: 10,
    height: 52,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },
});

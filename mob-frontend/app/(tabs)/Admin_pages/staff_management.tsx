import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

export default function StaffManagement() {
  const router = useRouter();
  const [state, setState] = useState<any[]>([]);
  const [district, setdistrict] = useState<any[]>([]);
  const [statecode, setstatecode] = useState(null);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [Selected_state, setSelected_state] = useState(null);
  const [Selected_district, setSelected_district] = useState(null);
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [mobile, setmobile] = useState("");
  const [category, setcategory] = useState("");

  const [categorydrop, setcategorydrop] = useState<any[]>([]);

  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const categorylist = async () => {
      const res = await axios.get(`${API_BASE}/getcategory`);
      const names = res.data.exsiting_data.map((cat: any) => cat.name);
      setcategorydrop(names);
    };
    categorylist();
  }, []);

  const handle_save = async () => {
    if (!name || !email || !category || !Selected_state || !Selected_district || !mobile) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const Password = name + "@staff" + Math.floor(100 + Math.random() * 900);
    const role = "staff";
    const staff_id = "STF" + Math.floor(10000 + Math.random() * 90000);

    const res = await axios.post(`${API_BASE}/admin/staff`, {
      name: name,
      email: email,
      password: Password,
      state: Selected_state,
      district: Selected_district,
      category: category,
      mobile: mobile,
      role: role,
      staffId: staff_id,
    });

    if (res.data.message) {
      Alert.alert("Staff Registered", `Password: ${res.data.password}`);
    }

    setname("");
    setemail("");
    setcategory("");
    setmobile("");
    setSelected_state(null);
    setSelected_district(null);
    setstatecode(null);
    setValue(null);
  };

  useEffect(() => {
    const fetchStates = async () => {
      const res = await axios.get(`${API_BASE}/state`);
      const formatted = res.data.map((item: any) => ({
        label: item["State Name"],
        value: item["State Code"],
      }));
      setState(formatted);
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const dist = async () => {
      if (!statecode) return;
      const response = await axios.get(`${API_BASE}/districts/${statecode}`);
      const Dist_data = response.data.map((item: any) => ({
        label: item["District Name"],
        value: item["District Code"],
      }));
      setdistrict(Dist_data);
    };
    dist();
  }, [statecode]);

  const handleback = () => {
    router.back();
  };

  const canSave = name && email && category && Selected_state && Selected_district && mobile;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleback} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Staff</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Icon Header */}
            <View style={styles.iconHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add-outline" size={32} color="#4A90A4" />
              </View>
              <Text style={styles.formTitle}>Staff Information</Text>
              <Text style={styles.formSubtitle}>
                Fill in the details to register a new staff member
              </Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setname}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setemail}
              />
            </View>

            {/* Department */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Department</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                data={categorydrop.map((item) => ({ label: item, value: item }))}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select department"
                searchPlaceholder="Search..."
                value={category}
                onChange={(item) => setcategory(item.value)}
              />
            </View>

            {/* State */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>State</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={state}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select state"
                searchPlaceholder="Search..."
                value={statecode}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setstatecode(item.value);
                  setSelected_state(item.label);
                  setValue(null);
                  setSelected_district(null);
                }}
              />
            </View>

            {/* District */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>District</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={district}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select district"
                searchPlaceholder="Search..."
                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={(item) => {
                  setValue(item.value);
                  setSelected_district(item.label);
                }}
              />
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setmobile}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: canSave ? "#2E7D32" : "#A5D6A7" },
              ]}
              onPress={handle_save}
              disabled={!canSave}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Save Staff</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleback}>
              <Ionicons name="close-circle-outline" size={22} color="#555" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f7fa",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  iconHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  dropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fafafa",
  },
  placeholderStyle: {
    fontSize: 15,
    color: "#999",
  },
  selectedTextStyle: {
    fontSize: 15,
    color: "#333",
  },
  inputSearchStyle: {
    height: 42,
    fontSize: 15,
    borderRadius: 8,
  },
  iconStyle: {
    width: 22,
    height: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    borderRadius: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    backgroundColor: "#e8eaed",
    borderRadius: 12,
    gap: 10,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
});

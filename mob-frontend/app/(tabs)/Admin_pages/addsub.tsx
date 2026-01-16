import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

type PermissionKey = "addStaff" | "assignStaff" | "addCategory";

const AddSubOfficer = () => {
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const params = useLocalSearchParams();

  const [adminData, setAdminData] = useState(null);

  const get_details = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/getadmin`, {
        params: { email: params.email },
      });

      setAdminData(res.data);
    } catch (error: any) {
      console.log("Fetch Admin Error:", error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (params.email) get_details();
  }, [params.email]);

  // -------------------------------
  // FORM STATES
  // -------------------------------
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  const [role, setRole] = useState("");

  const [permissions, setPermissions] = useState<
    Record<PermissionKey, boolean>
  >({
    addStaff: false,
    assignStaff: false,
    addCategory: false,
  });

  const togglePermission = (key: PermissionKey) => {
    setPermissions({ ...permissions, [key]: !permissions[key] });
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !mobile || !role) {
      Alert.alert("Error", "All fields including Role are required");
      return;
    }

    const permissionArray = Object.keys(permissions).filter(
      (key) => permissions[key as PermissionKey] === true
    );

    

    try {
      await axios.post(`${API_BASE}/admin/adminregister`, {
        name,
        email,
        password,
        mobile,
        Permissions: permissionArray,
        createdby: "Distrct admin",
        state: params.state,
        district: params.district,
        active: true,
        category: "",
        role,
      });

      Alert.alert("Success", "Sub-Officer Added Successfully");
      router.back();
    } catch (error: any) {
      console.log("ERROR:", error?.response?.data || error);
      Alert.alert("Error", "Failed to add Sub-Officer");
    }
  };

  // FIXED TYPED PERMISSION LIST
  const permissionList: { key: PermissionKey; label: string }[] = [
    { key: "addStaff", label: "Add Staff" },
    { key: "assignStaff", label: "Assign Staff" },
    { key: "addCategory", label: "Add Category" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.Header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add Sub-Officer</Text>
      </View>

      <ScrollView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="numeric"
        />

        {/* ROLE DROPDOWN */}
        <Text style={styles.permissionTitle}>Select Role</Text>

        <View style={styles.dropdownBox}>
          <Picker
            selectedValue={role}
            onValueChange={(value) => setRole(value)}
          >
            <Picker.Item label="Select Role" value="" />
            <Picker.Item label="Panchayat Officer" value="panchayat_officer" />
            <Picker.Item label="Taluk Officer" value="Taluk Officer" />
          </Picker>
        </View>

        {/* PERMISSIONS */}
        <Text style={styles.permissionTitle}>Permissions</Text>

        {permissionList.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={styles.checkboxContainer}
            onPress={() => togglePermission(key)}
          >
            <View
              style={[
                styles.checkbox,
                permissions[key] && { backgroundColor: "#4285F4" },
              ]}
            >
              {permissions[key] && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
            <Text style={styles.permissionText}>{label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Save Sub-Officer</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default AddSubOfficer;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  Header: {
    marginTop: 55,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    marginStart: 10,
    fontWeight: "bold",
    fontSize: 22,
  },

  input: {
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    backgroundColor: "#F8F9FA",
    fontSize: 16,
  },

  permissionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#3C4043",
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: "#DADCE0",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "#F8F9FA",
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: "#4285F4",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  permissionText: {
    fontSize: 16,
    color: "#202124",
  },

  submitBtn: {
    backgroundColor: "#1A73E8",
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },

  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});

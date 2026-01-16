import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { Dropdown } from "react-native-element-dropdown";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

export default function RegisterScreen() {
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenum, setPhonenum] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Location dropdowns
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | null>(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);

  // Errors
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const role = "Citizen";

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axios.get(`${API_BASE}/state`);
        const formatted = res.data.map((item: any) => ({
          label: item["State Name"],
          value: item["State Code"],
        }));
        setStates(formatted);
      } catch (error) {
        console.error("Failed to fetch states:", error);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedStateCode) {
        setDistricts([]);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE}/districts/${selectedStateCode}`);
        const formatted = response.data.map((item: any) => ({
          label: item["District Name"],
          value: item["District Code"],
        }));
        setDistricts(formatted);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      }
    };
    fetchDistricts();
  }, [selectedStateCode]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!phonenum.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phonenum)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!selectedStateCode) {
      newErrors.state = "Please select a state";
    }

    if (!selectedDistrictCode) {
      newErrors.district = "Please select a district";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/register`,
        {
          name,
          email,
          password,
          mobile: phonenum,
          role,
          state: selectedStateName,
          district: selectedDistrictName,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.message) {
        Alert.alert("Success", res.data.message, [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error?.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleLogin}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={isTablet ? 50 : 40} color="#1976d2" />
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Register as a citizen to submit grievances</Text>
        </View>

        {/* Registration Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[styles.inputContainer, errors.name && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#999"
                    value={phonenum}
                    onChangeText={setPhonenum}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* State Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>State</Text>
                <Dropdown
                  style={[styles.dropdown, errors.state && styles.inputError]}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  inputSearchStyle={styles.dropdownSearchInput}
                  iconStyle={styles.dropdownIcon}
                  data={states}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select your state"
                  searchPlaceholder="Search states..."
                  value={selectedStateCode}
                  onChange={(item) => {
                    setSelectedStateCode(item.value);
                    setSelectedStateName(item.label);
                    setSelectedDistrictCode(null);
                    setSelectedDistrictName(null);
                  }}
                  renderLeftIcon={() => (
                    <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                  )}
                />
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
              </View>

              {/* District Dropdown */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District</Text>
                <Dropdown
                  style={[styles.dropdown, errors.district && styles.inputError]}
                  placeholderStyle={styles.dropdownPlaceholder}
                  selectedTextStyle={styles.dropdownSelectedText}
                  inputSearchStyle={styles.dropdownSearchInput}
                  iconStyle={styles.dropdownIcon}
                  data={districts}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={selectedStateCode ? "Select your district" : "Select state first"}
                  searchPlaceholder="Search districts..."
                  value={selectedDistrictCode}
                  disable={!selectedStateCode}
                  onChange={(item) => {
                    setSelectedDistrictCode(item.value);
                    setSelectedDistrictName(item.label);
                  }}
                  renderLeftIcon={() => (
                    <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
                  )}
                />
                {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="Create a password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login Link */}
              <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
                <Text style={styles.loginLinkText}>
                  Already have an account?{" "}
                  <Text style={styles.loginLinkHighlight}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: isSmallDevice ? 40 : 50,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  headerSection: {
    alignItems: "center",
    paddingTop: isSmallDevice ? 15 : 20,
    paddingBottom: isSmallDevice ? 15 : 20,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    borderRadius: isTablet ? 50 : 40,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: isTablet ? 15 : 14,
    color: "#666",
    textAlign: "center",
  },
  cardContainer: {
    paddingHorizontal: isTablet ? "15%" : 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  formContainer: {
    padding: isTablet ? 30 : 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: isTablet ? 15 : 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 14,
    height: isTablet ? 56 : 50,
  },
  inputError: {
    borderColor: "#e53935",
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: isTablet ? 16 : 15,
    color: "#333",
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dropdown: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976d2",
    borderRadius: 12,
    height: isTablet ? 56 : 50,
    gap: 8,
    marginTop: 8,
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    color: "#999",
    paddingHorizontal: 16,
    fontSize: 13,
  },
  loginLink: {
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: isTablet ? 15 : 14,
    color: "#666",
  },
  loginLinkHighlight: {
    color: "#1976d2",
    fontWeight: "600",
  },
});

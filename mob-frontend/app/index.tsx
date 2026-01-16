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
import { useRouter } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { setItem, getString, setJSON } from "../utils/storage";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;
const isSmallDevice = height < 700;

export default function HomeScreen() {
  const [activetab, setactivetab] = useState("citizen");
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [email, setemail] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [password, setpassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifytoken = async () => {
      const Token = await getString("token");
      const role = await getString("role");

      if (Token && role == "Citizen") {
        router.replace("/(tabs)/Citizen");

      } 
        else if (Token && role == "Taluk Officer") {
        router.replace("/(tabs)/Admin");
      }

       else if (Token && role == "DistrictAdmin") {
        router.replace("/(tabs)/Admin_pages/DistrictAdmin");
      }
      
       else if (Token && role === "staff") {
       router.replace("/(tabs)/staff_portal");
      }
    };
    verifytoken();
  }, []);


  const hangdlecitizen = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/login/`,
        { email: email, password: password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = res.data.token;
      if (token) {
        await setItem("token", token);
      }

      await setItem("role", res.data.role);
      await setItem("name", res.data.name);
      await setItem("email", res.data.email);

      if (
        res.data.message == "Log in succussfull" &&
        res.data.role == "Citizen"
      ) {
        router.push("/(tabs)/Citizen");
      } else {
        Alert.alert("Login Failed", "Invalid credentials.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdmin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/login/`,
        { email: email, password: password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = res.data.token;
      await setItem("token", token);
      await setItem("role", res.data.role);

      const Permission = res.data.Permissions;
      await setJSON("Permissions", Permission);

      if (res.data.message == "Log in succussfull" && res.data.role == "admin") {
        router.push("./(tabs)/Admin");
      } else if (
        res.data.message == "Log in succussfull" &&
        res.data.role == "staff"
      ) {
        router.push("/staff_portal");
      } else if (
        res.data.message == "Log in succussfull" &&
        res.data.role == "DistrictAdmin"
      ) {
        router.push("/(tabs)/Admin_pages/DistrictAdmin");
      } else if (
        res.data.message == "Log in succussfull" &&
        res.data.role == "Taluk Officer"
      ) {
        router.push("/(tabs)/Admin");
      } else {
        Alert.alert("Login Failed", "Invalid credentials.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle_register = () => {
    router.push("/(tabs)/Login_page/register");
  };

  const handle_forgot_password = () => {
    router.push("/(tabs)/Login_page/forgot-password");
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
        {/* Header */}
        <View style={styles.headerSection}>
          <Ionicons name="shield-checkmark" size={isTablet ? 80 : 60} color="#1976d2" />
          <Text style={styles.headerTitle}>Grievance System</Text>
          <Text style={styles.headerSubtitle}>Submit and track your complaints</Text>
        </View>

        {/* Login Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activetab === "citizen" && styles.activeTab,
                ]}
                onPress={() => setactivetab("citizen")}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={activetab === "citizen" ? "#1976d2" : "#666"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activetab === "citizen" && styles.activeTabText,
                  ]}
                >
                  Citizen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  activetab === "admin" && styles.activeTab,
                ]}
                onPress={() => setactivetab("admin")}
              >
                <Ionicons
                  name="briefcase"
                  size={20}
                  color={activetab === "admin" ? "#1976d2" : "#666"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activetab === "admin" && styles.activeTabText,
                  ]}
                >
                  Admin/Staff
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Indicator */}
            <View style={styles.tabIndicatorContainer}>
              <View
                style={[
                  styles.tabIndicator,
                  activetab === "admin" && { marginLeft: "50%" },
                ]}
              />
            </View>

            {/* Form Content */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email or Mobile Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email or mobile"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setemail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setpassword}
                    secureTextEntry={!showpassword}
                  />
                  <TouchableOpacity
                    onPress={() => setshowpassword(!showpassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showpassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
              </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordBtn} onPress={handle_forgot_password}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={activetab === "citizen" ? hangdlecitizen : handleAdmin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Login</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Register Link (Citizen only) */}
              {activetab === "citizen" && (
                <TouchableOpacity style={styles.registerButton} onPress={handle_register}>
                  <Text style={styles.registerText}>
                    Don't have an account?{" "}
                    <Text style={styles.registerLink}>Create Account</Text>
                  </Text>
                </TouchableOpacity>
              )}
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
  headerSection: {
    alignItems: "center",
    paddingTop: isSmallDevice ? 40 : 60,
    paddingBottom: isSmallDevice ? 20 : 30,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: isTablet ? 32 : 26,
    fontWeight: "bold",
    color: "#1a1a2e",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: "#666",
    marginTop: 6,
  },
  cardContainer: {
    paddingHorizontal: isTablet ? "20%" : 20,
    marginTop: isSmallDevice ? 20 : 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  tabContainer: {
    flexDirection: "row",
    paddingTop: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "rgba(25, 118, 210, 0.05)",
  },
  tabText: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#1976d2",
  },
  tabIndicatorContainer: {
    height: 3,
    backgroundColor: "#e0e0e0",
  },
  tabIndicator: {
    width: "50%",
    height: "100%",
    backgroundColor: "#1976d2",
  },
  formContainer: {
    padding: isTablet ? 30 : 24,
  },
  inputGroup: {
    marginBottom: 20,
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
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#1976d2",
    fontSize: isTablet ? 14 : 13,
    fontWeight: "500",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976d2",
    borderRadius: 12,
    height: isTablet ? 56 : 50,
    gap: 8,
    shadowColor: "#1976d2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
  registerButton: {
    alignItems: "center",
  },
  registerText: {
    fontSize: isTablet ? 15 : 14,
    color: "#666",
  },
  registerLink: {
    color: "#1976d2",
    fontWeight: "600",
  },
});

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

// =========================================
// TYPE FOR ADMINS
// =========================================
interface AdminType {
  _id: string;
  name: string;
  email: string;
  Permissions?: string[];
  state?: string;
  district?: string;
}

const SubOfficer = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [state, setState] = useState<string>("");
  const [district, setdistrict] = useState<string>("");

  const [subOfficers, setSubOfficers] = useState<AdminType[]>([]);

  // ======================= EDIT MODAL =======================
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const openEditModal = (item: AdminType) => {
    setEditId(item._id);
    setEditName(item.name);
    setEditEmail(item.email);
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE}/superadmin/admin/${editId}`, {
        name: editName,
        email: editEmail,
      });

      setModalVisible(false);
      fetchSubOfficers();
    } catch (error: any) {
      console.log("UPDATE ERROR:", error?.response?.data || error);
    }
  };

  // ======================= DELETE =======================
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/superadmin/admin/${id}`);
      fetchSubOfficers();
    } catch (error: any) {
      console.log("DELETE ERROR:", error?.response?.data || error);
    }
  };

  // ======================= FETCH ADMINS =======================
  const fetchSubOfficers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/subofficer`);
      setSubOfficers(res.data.admin || []);
    } catch (error: any) {
      console.log("FETCH ERROR:", error?.response?.data || error);
    }
  };

  // ======================= FETCH STATE & DISTRICT =======================
  const get_details = async () => {
    const res = await axios.get(`${API_BASE}/admin/getadmin`, {
      params: { email: params.email },
    });

    setState(res.data.state);
    setdistrict(res.data.district);
  };

  useFocusEffect(
    useCallback(() => {
      get_details();
      fetchSubOfficers();
    }, [])
  );

  const handle_add = () => {
    router.push({
      pathname: "/Admin_pages/addsub",
      params: { state, district },
    });
  };

  const handle_back = () => {
    router.back();
  };

  return (
    <View>
      <View style={styles.Header}>
        <TouchableOpacity onPress={handle_back}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>SubOfficer Management</Text>
      </View>

      <View style={styles.addContainer}>
        <TouchableOpacity style={styles.add_button} onPress={handle_add}>
          <Text style={styles.addBtnText}>Add Sub-Officer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>All Sub-Officers</Text>

      <FlatList
        data={subOfficers}
        keyExtractor={(item) => item._id}
        style={{ marginTop: 10, paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="create-outline" size={22} color="#444" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDelete(item._id)}
            >
              <Ionicons name="trash-outline" size={22} color="#d00000" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ======================= EDIT MODAL (same UI) ======================= */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeader}>Edit Sub-Officer</Text>

            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
            />

            <TextInput
              style={styles.input}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
            />

            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SubOfficer;

// ======================= SAME UI STYLES (NO CHANGES) =======================
const styles = StyleSheet.create({
  Header: {
    marginTop: 60,
    marginStart: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginStart: 10,
    fontWeight: "bold",
    fontSize: 20,
  },

  addContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  add_button: {
    height: 50,
    backgroundColor: "#1a73e8",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  heading: {
    marginStart: 20,
    marginTop: 20,
    fontSize: 19,
    fontWeight: "bold",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 45,
    backgroundColor: "#e8f0fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a73e8",
  },

  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  email: {
    fontSize: 14,
    color: "#777",
    marginTop: 2,
  },

  iconBtn: {
    marginLeft: 15,
  },

  modalWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: "#1a73e8",
    padding: 14,
    flex: 1,
    borderRadius: 10,
    marginRight: 10,
  },
  saveText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "#d00000",
    padding: 14,
    flex: 1,
    borderRadius: 10,
  },
  cancelText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

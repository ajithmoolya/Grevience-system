import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";

// -------------------- TYPES --------------------
interface ProofFile {
  fileName: string;
  fileURL: string;
  fileType: string;
}

export default function CitizenFiles() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [proofs, setProofs] = useState<ProofFile[]>([]);

  // -------------------- LOAD FILES --------------------
  const loadFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/citizen/getproof`, {
        params: { grievanceID: id, uploadedBy: "Citizen" },
      });

      setProofs(res.data.files || []);
    } catch (err) {
      console.log("Error loading files:", err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Citizen Files: {id}</Text>
      </View>

      {/* Scroll */}
      <ScrollView style={{ paddingHorizontal: 20, marginTop: 20 }}>
        <Text style={styles.sectionTitle}>
          Uploaded Files ({proofs.length})
        </Text>

        {/* NO FILES */}
        {proofs.length === 0 && (
          <Text style={{ color: "gray", marginTop: 10 }}>
            No files uploaded by citizen.
          </Text>
        )}

        {/* FILE LIST */}
        {proofs.map((file, index) => {
          const isImage = file.fileType?.startsWith("image");

          return (
            <View key={index} style={styles.fileCard}>
              {/* FILE HEADER */}
              <View style={styles.fileHeader}>
                <View
                  style={[
                    styles.fileIconBox,
                    { backgroundColor: isImage ? "#D6B3FF" : "#FFB3B3" },
                  ]}
                >
                  <Ionicons
                    name={isImage ? "image" : "document"}
                    size={26}
                    color="white"
                  />
                </View>

                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.fileName}>{file.fileName}</Text>
                  <Text style={styles.fileType}>
                    {isImage ? "IMAGE DOCUMENT" : "PDF DOCUMENT"}
                  </Text>
                </View>
              </View>

              {/* OPEN BUTTON */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/Admin_pages/View_pdf",
                    params: { url: file.fileURL },
                  })
                }
                style={styles.openButton}
              >
                <Ionicons name="eye-outline" size={20} color="white" />
                <Text style={styles.openButtonText}>OPEN DOCUMENT</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  fileCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
    elevation: 3,
  },

  fileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  fileName: {
    fontSize: 15,
    fontWeight: "600",
  },

  fileType: {
    color: "gray",
    fontSize: 13,
  },

  openButton: {
    backgroundColor: "#1a365cff",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    height: 40,
  },

  openButtonText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
});

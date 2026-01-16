import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { setItem, getString, deleteItem } from "../../../utils/storage";

export default function Allgrevience() {
  const [email, setemail] = useState<string | null>(null);
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const [grievances, setGrievances] = useState<any[]>([]);

  const router = useRouter();

  const parameters = async () => {
    const email = await getString("email");


    const res = await axios.post(
      `${API_BASE}/Citizen_gravince`,
      { email: email },
      { headers: { "Content-Type": "application/json" } }
    );

    setGrievances(Array.isArray(res.data.all) ? res.data.all : []);
  };

  parameters();

  const handle_back = () => {
    router.back();
  };

  const handleviewdetails = (grievanceId: string) => {
  router.push({
    pathname: "/(tabs)/Citizen_pages/Viewdetails",
    params: { id: grievanceId }, // passing grievance ID to next page
  });
};


  return (
    <View>
      <View style={styles.headercontainer}>
        <View style={styles.headeritems}>
          <TouchableOpacity onPress={handle_back}>
            <Ionicons name="chevron-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headertext}>All Grievances</Text>
        </View>
      </View>

      <View>
        <ScrollView style={styles.ScrollView}>
          <View style={{height:1500}}>
          {Array.isArray(grievances) && grievances.length > 0 ? (
            grievances.map((item, index) => (
              <View key={index} style={styles.gravienceItems}>
                <View style={styles.gravienceItemText}>
                  <View style={styles.GravienceTitle}>
                    <Text style={styles.GravienceTitleText}>{item.grevienceID}</Text>
                    <View
                      style={[
                        styles.statusbutton,
                        {
                          backgroundColor:
                            item.status === "Submited"
                              ? "#3699ebff" // yellow
                              : item.status === "Assigned"
                              ? "#3699ebff" // blue
                              : item.status === "In Progress" ||
                                item.status?.toLowerCase() === "completed" ||
                                item.status?.toLowerCase() === "verified"
                              ? "#FFB74D" // orange
                              : item.status === "Resolved"
                              ? "#81C784" // green
                              : "#E0E0E0", // default grey
                        },
                      ]}
                    >
                     <Text>
                          {item.status?.toLowerCase() === "completed" ||
                          item.status?.toLowerCase() === "verified"
                            ? "In progress"
                            : item.status}
                        </Text>

                    </View>
                  </View>

                  <Text>{item.title}</Text>

                  <View style={{ flexDirection: "row", marginTop: 5 }}>


                    <View style={{width:"65%"}}>
                    <Text>{item.category}</Text>
                    </View>


                    <Text style={{ marginStart: "5%" }}>
                      {item.createdAt?.split("T")[0]}
                    </Text>
                  </View>

    
                      <TouchableOpacity
                        style={styles.ViewDetailsButton}
                        // onPress={handleviewdetails}
                        onPress={()=>handleviewdetails(item.grevienceID)}
                        
                      >
                        <Text style={styles.ViewDetailsButtonText}>
                          View Details
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="blue" />
                      </TouchableOpacity>


                </View>
              </View>
            ))
          ) : (
            <Text style={{ marginStart:"10%", marginTop: 10 }}>
              No grievances found
            </Text>
          )}
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  menuContainer: {
    display: "flex",
    height: 100,
    backgroundColor: "white",
  },

  ScrollView: {
    width: "100%",
    height: "100%",

    backgroundColor: "#f4f7f9ff",
  },

  gravienceItems: {
    backgroundColor: "white",
    width: "92%",
    marginTop: 20,
    marginStart: "4%",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
    height: 130,
  },
  gravienceItemText: {
    marginStart: "5%",
    marginTop: 15,
  },
  GravienceTitle: {
    flexDirection: "row",
    alignItems: "center",
   justifyContent: "space-between",
   marginEnd:"5%"
  },
  GravienceTitleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusbutton: {
    backgroundColor: "#ebe54084",
    width: "30%",
    height: 25,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
    marginStart:"40%"
  },

  ViewDetailsButton: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  ViewDetailsButtonText: {
    color: "blue",
    fontWeight: "bold",
  },

});




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
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import axios, { AxiosError } from "axios";


import {
  setItem,
  getString,
  deleteItem,
  getJSON,
} from "../../../utils/storage";


export default function adminportal() {
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;
  const [showMenu, setShowMenu] = useState(false);

  const router = useRouter();
  const [showmodal, setShowmodal] = useState(false);
  const [status, setStatus] = useState<string>("Submitted");
  const staff = ["staff1", "staff2", "staff3", "staff4"];

  const [grievances, setGrievances] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  // const [active, setActive] = useState("All");
  // const tabs = ["All", "Pending", "Assigned", "Resolved"];

  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState("All");
  const [pending_data, setpending_data] = useState<any[]>([]);
  const [assigned_data, setassinged_data] = useState<any[]>([]);
  const [resolved_data, setresolved_data] = useState<any[]>([]);

  


  useEffect(() => {
    const fetchPermissions = async () => {
      const savedPermissions = await getJSON("Permissions"); // array of strings
      if (savedPermissions) {
        setPermissions(savedPermissions);
      }
    };
    fetchPermissions();
    graivnece();
  }, []);



const params = useLocalSearchParams();

const state = String(params.state);
const email=String(params.email)
const district = String(params.district);
const [escalated_data, setescalated_data] = useState<any[]>([]);

const graivnece = async () => {

  try {
  
    const res = await axios.get(`${API_BASE}/admin/Allgravinces`, {
      params: {
        state: state,          
        district: district,   
      },
      headers: { "Content-Type": "application/json" },
    });

    const data = res.data;

   
    setGrievances(Array.isArray(data.all) ? data.all : []);

    setpending_data(
      Array.isArray(data.Submited)
        ? data.Submited
        : data.Submited
        ? [data.Submited]
        : []
    );

    // Assigned list
    setassinged_data(
      Array.isArray(data.assigned)
        ? data.assigned
        : data.assigned
        ? [data.assigned]
        : []
    );

    // Resolved list
    setresolved_data(
      Array.isArray(data.resolved)
        ? data.resolved
        : data.resolved
        ? [data.resolved]
        : []
    );
  }
  catch (error: any) {
    console.log("code eror")
    
  console.log("ERROR:", error?.response?.data || error);
}

//escalated 
// Fetch escalated grievances
try {
  const esclate = await axios.get(`${API_BASE}/admin/escalated`, {
    params: {
      email:email
    },
  });

   const  esc=esclate.data.escalated


  setescalated_data(Array.isArray(esc) ? esc : esc ? [esc] : []);
 
} catch (err) {
  const error = err as AxiosError;
  console.log("Escalated fetch error:", error?.response?.data || error);
}
};

// call it



 



  
const getFilteredData = () => {
  switch (selected) {
    case "All":
      return grievances;
    case "Pending":
      return pending_data;
    case "Assigned":
      return assigned_data;
    case "Resolved":
      return resolved_data;
    case "Escalated":
      return escalated_data; // NEW
  }
};

  // 🔍 Apply Search Filtering
  const filteredSearchData = getFilteredData()?.filter(item =>
    item.grevienceID?.toLowerCase().includes(search.toLowerCase())
  );

  const handle_back = () => {
    router.push("/");
  };

  const update_grev = (
    grevienceId: string,
    title: string,
    category: string,
    state: string,
   
    district: string,
    status:string,
    location:string,
    description:string,
    
    createdAt:string
    
  ) => {
    router.push({
      pathname: "/(tabs)/Admin_pages/UpdateGrevence",
      params: {
        id: grevienceId,
        title: title,
        category: category,
        state: state,
        district: district,
        status:status,
        location:location,
        description:description,
        
createdAt:createdAt
      },
    });
  };


  return (
    <View>
      <View style={style.header_container}>
        <TouchableOpacity onPress={handle_back}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={{ color: "black", fontWeight: "bold", fontSize: 20 }}>
          All Grievances
        </Text>
      </View>

      <ScrollView style={style.ScrollView}>
        <View style={{ height: 2000 }}>

          <View style={{paddingHorizontal:10}}>
          <View style={style.search_Container}>
            <Ionicons
              name="search"
              size={24}
              color="grey"
              style={{ marginStart: 20 }}
            />
            <TextInput
              style={style.search}
              placeholder="Enter Grievience ID"
              value={search}
              onChangeText={setSearch}
            ></TextInput>
          </View>
          </View>




          <View style={style.container}>
                      <TouchableOpacity
                        style={[style.tab, selected === "All" && style.activeTab]}
                        onPress={() => setSelected("All")}
                      >
                        <Text
                          style={[
                            style.tabText,
                            selected === "All" && style.activeTabText,
                          ]}
                        >
                          All
                        </Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity
                        style={[style.tab, selected === "Pending" && style.activeTab]}
                        onPress={() => setSelected("Pending")}
                      >
                        <Text
                          style={[
                            style.tabText,
                            selected === "Pending" && style.activeTabText,
                          ]}
                        >
                          Pending
                        </Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity
                        style={[style.tab, selected === "Assigned" && style.activeTab]}
                        onPress={() => setSelected("Assigned")}
                      >
                        <Text
                          style={[
                            style.tabText,
                            selected === "Assigned" && style.activeTabText,
                          ]}
                        >
                          Assigned
                        </Text>
                      </TouchableOpacity>
          
                      <TouchableOpacity
                        style={[style.tab, selected === "Resolved" && style.activeTab]}
                        onPress={() => setSelected("Resolved")}
                      >
                        <Text
                          style={[
                            style.tabText,
                            selected === "Resolved" && style.activeTabText,
                          ]}
                        >
                          Resolved
                        </Text>
                      </TouchableOpacity>


                      
                                  <TouchableOpacity
                                      style={[style.tab, selected === "Escalated" && style.activeTab]}
                                      onPress={() => setSelected("Escalated")}
                                    >
                                      <Text
                                        style={[
                                          style.tabText,
                                          selected === "Escalated" && style.activeTabText,
                                        ]}
                                      >
                                        Escalated
                                      </Text>
                                    </TouchableOpacity>

                    </View>
                    <TouchableOpacity activeOpacity={0.9}>
                      {filteredSearchData?.map((items) => (
                        <View  key={items._id} style={{ paddingHorizontal: 10 }}>
                          <TouchableOpacity  activeOpacity={0.9} 
                                      onPress={() =>
                                          update_grev(
                                            items.grevienceID,
                                            items.title,
                                            items.category,
                                            items.state,
                                            items.district,
                                            items.status,
                                            items.location,
                                            items.description,
                                            items.createdAt
                                          )
                                        }
                          >
                          <View key={items._id} style={style.graviencedetails}>
                            <View>
                              <View style={style.idstatus}>
                                <View style={{ width: 180 }}>
                                  <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                                    {items.grevienceID}
                                  </Text>
                                </View>
          
                                <View
                                  style={[
                                    style.statusbutton,
                                    {
                                      backgroundColor:
                                        items.status === "Submited"
                                          ? "#3699ebff" // yellow
                                          : items.status === "Assigned"
                                          ? "#3699ebff" // blue
                                          : items.status === "completed"
                                          ? "#E0E0E0" // orange
                                          : items.status === "Resolved"
                                          ? "#81C784" // green
                                          : "#E0E0E0", // default grey
                                    },
                                  ]}
                                >
                                  <Text>{items.status}</Text>
                                </View>
                              </View>
          
                              <View>
                                <Text style={style.datesection}>
                                  Submited on {items.createdAt?.split("T")[0]}
                                </Text>
          
                                <View style={style.line}></View>
          
                                <View style={style.titlediscription}>
                                  <Text style={{ fontWeight: "bold" }}>
                                    {items.title}
                                  </Text>
                                  <Text style={{ textAlign: "justify", marginEnd: 10 }}>
                                    {items.description}
                                  </Text>
          
                                  <View
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      alignItems: "center",
                                    }}
                                  >
                                    <View style={{ width: 250 }}>
                                      <Text>
                                        <Ionicons
                                          name="document-text-outline"
                                          size={20}
                                          color="#374151"
                                        />
                                        {items.category}
                                      </Text>
                                    </View>
          
                               
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </TouchableOpacity>
          
                  </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
   header_container: {
    marginStart: 30,
    marginTop: 50,
    display: "flex",
    flexDirection: "row",
    gap: 20,
  },
  ScrollView: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f4f7f9ff",
  },

  menu_container: {
    height: "100%",
    width: 250,
    position: "absolute",
    backgroundColor: "#eef1f2ff",
    borderRadius: 8,
    zIndex: 10,
  },
  menuitemcontainer: {
    marginTop: 50,
    marginStart: 20,
  },
  menuItems: {
    marginStart: 30,
    marginTop: 30,
  },
  Text: {
    fontSize: 18,
  },
  itemscontainer: {
    backgroundColor: "white",
    width: "48%", // makes 2 cards per row ALWAYS
    height: 120,
    marginVertical: 10,
    borderRadius: 15,
    padding: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  gravience_card: {
    backgroundColor: "white",
    width: 320,
    height: 150,
    marginTop: 20,
    marginStart: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 10,
    shadowRadius: 4,
    elevation: 10,
  },
  SearchInputbox: {
    width: 250,
    height: 50,
    borderWidth: 1,
    marginTop: 30,
    borderBlockColor: "gray",
    marginStart: 30,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
  },

  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    width: 150,
    height: 40,
    // paddingVertical: 8,
    // paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 15,
    color: "#000",
    marginStart: 40,
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 6,
    elevation: 5,
    width: 150,
    marginTop: 368,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  graviencedetails: {
    backgroundColor: "white",
    // width: ,
    marginTop: 20,
    // marginStart: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
    height: 180,
  },
  statusbutton: {
    backgroundColor: "#ebe54084",
    width: 100,
    height: 25,
    borderRadius: 10,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    width: "100%",
    backgroundColor: "gray",
    marginTop: 10,
    height: 1,
  },
  idstatus: {
    display: "flex",
    marginStart: 10,
    marginTop: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    paddingEnd: 20,
  },
  datesection: {
    marginStart: 10,
  },
  titlediscription: {
    marginStart: 10,
    marginTop: 10,
    gap: 10,
  },
  statustrack: {
    backgroundColor: "white",
    width: 330,
    marginTop: 20,
    marginStart: 15,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    borderRadius: 15,
    shadowRadius: 4,
    elevation: 10,
    height: 500,
  },
  updategravience: {
    backgroundColor: "white",
    height: "100%",
    marginStart: 10,
    width: 340,
    borderRadius: 10,
    marginTop: 100,
  },
  modeltext: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginStart: 30,
  },
  lines: {
    width: 310,
    backgroundColor: "gray",
    marginTop: 20,
    height: 1,
    marginStart: 10,
  },
  gravienceView: {
    width: 300,
    marginStart: 20,
    marginTop: 20,
    borderRadius: 10,
    height: 100,
    backgroundColor: "#cbddf5ff",
  },
  text_container: {
    marginStart: 10,
    marginTop: 10,
    gap: 10,
  },
  text: {
    fontWeight: "bold",
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: 300,
    marginStart: 20,
    marginTop: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  response: {
    width: 300,
    height: 80,
    borderWidth: 1,
    borderBlockColor: "gray",
    borderRadius: 10,
    marginStart: 20,
    marginTop: 10,
  },
  submit_button: {
    backgroundColor: "#819aa2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: 140,
    height: 50,
  },
  submit_container: {
    display: "flex",
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
    marginStart: 20,
    gap: 10,
  },
  cancel_button: {
    width: 140,
    height: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e3e4ff",
    borderRadius: 10,
  },
  tab: {
    flex: 1, // each tab takes equal width
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0", // default tab background
  },
  activeTab: {
    backgroundColor: "#007AFF", // selected tab color
  },
  tabText: {
    color: "#333", // default text color
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff", // selected tab text color
    fontWeight: "600",
  },
  container: {
    flexDirection: "row", // horizontal layout
    borderWidth: 1, // border around the control
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    margin: 10,
  },
  
  search_Container: {
   
    height: 50,
    display: "flex",
    backgroundColor: "white",
   
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBlockColor: "black",
    borderWidth: 0.5,
    borderRadius: 7,
  },

  search: {
    width: 300,
  },
});

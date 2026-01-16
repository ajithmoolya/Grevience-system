import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,

}
 from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getStaffProofs } from "../../../utils/storage"; 
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";



export default function verify() {
  const {
    id,
  } = useLocalSearchParams();

  const router = useRouter();
  const [resolved, setResolved] = useState(false);
  const [proofs, setProofs] = useState<any>(null);

  const [pdf,setpdf]= useState<string | null>(null);

 
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const handleResolve = async() => {
    const selected_status="Resolved"
    const res=await axios.put(`${API_BASE}/admin/update_gravince`,
        {grevienceID:id, status:selected_status})
    setResolved(true);
  };

  const handle_back = () => {
    router.push("/(tabs)/Admin")
  };

  useFocusEffect(
  useCallback(() => {
    console.log("Screen focused");
  }, [])
);


   useEffect(() => {
    getFiles();
  }, []);

  const getFiles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/staff/getproof`, {
        params: { grievanceID: id, uploadedBy: "staff" },
      });
      setProofs(res.data.files);
      console.log(res.data.files)

      console.log(res.data.count)
    } catch (err) {
      console.log(err);
    }
  };



  const View_pdf=async()=>{
    router.push({
      pathname:"/Admin_pages/View_pdf",
    params:{id:id}})
  }

  return (
    <View>
      <View style={style.header_container}>
        <TouchableOpacity onPress={handle_back}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={{ color: "black", fontSize: 22 }}>{id}</Text>
      </View>
      <ScrollView>
        <View style={{ height: 900 }}>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 20 }}>
              Verify Completion
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <Text
              style={{ marginStart: 10, fontWeight: "bold", marginTop: 10 }}
            >
              STAFF COMMENTS
            </Text>
            <View style={style.comment}>
              <Text
                style={{
                  textAlign: "justify",
                  lineHeight: 20,
                  fontSize: 16,
                  marginTop: 10,
                  marginBottom: 10,
                  paddingHorizontal: 10,
                }}
              >
                Street light has been repaired and is now functional. New bulb
                installed and tested. Surrounding area is well-lit
              </Text>
            </View>

            <View style={style.status}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  marginTop: 10,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>COMPLETED BY</Text>
                <Text style={{ fontWeight: "bold" }}>DATE</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  marginTop: 20,
                }}
              >
                <Text>COMPLETED BY</Text>
                <Text>DATE</Text>
              </View>

              
            </View>
            <Text style={{fontSize:18,marginTop:20,marginStart:10,fontWeight:"bold"}}>Uploaded Files (3)</Text>

            {proofs && proofs.map((file: any, index: number) => {
  const isImage = file.fileType.startsWith("image");

  return (
    <View
      key={index}
      style={{
        backgroundColor: "white",
        padding: 15,
        borderRadius: 15,
        marginTop: 15,
        elevation: 3,
      }}
    >
      {/* FILE HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: isImage ? "#D6B3FF" : "#FFB3B3",
          }}
        >
          <Ionicons
            name={isImage ? "image" : "document"}
            size={26}
            color="white"
          />
        </View>

        <View style={{ marginLeft: 12 }}>
          <Text style={{ fontSize: 15}}>
            {file.fileName}
          </Text>
          <Text style={{ color: "gray" }}>
            {isImage ? "IMAGE DOCUMENT" : "PDF DOCUMENT"}
          </Text>
        </View>
      </View>

      {/* OPEN BUTTON */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/Admin_pages/View_pdf",
            params: { url: file.fileURL },
          })
        }
        style={{
          backgroundColor: "#1a365cff",
          // padding: 15,
          borderRadius: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 15,
          height:40,
          
          
        }}
      >
        <Ionicons name="eye-outline" size={20} color="white" />
        <Text style={{ color: "white", marginLeft: 8, fontWeight: "bold" }}>
          OPEN DOCUMENT
        </Text>
      </TouchableOpacity>
    </View>
  );
})}






            


            {!resolved ?(
                   <View style={{marginTop:10}}>
                <TouchableOpacity style={style.resolve_button} onPress={handleResolve}>
                    <Feather name="check-circle" size={28} color="white" />
                    <Text style={{fontSize:18,fontWeight:"bold",color:"white",marginStart:10}}>Mark as Resolved</Text>
                </TouchableOpacity>
            </View>
            ):(
                <View>

                <View style={style.successBox}>
                    <Feather name="check-circle" size={28} color="#0c780cff" />
                    <Text style={{fontSize:16,fontWeight:"bold",color:"black",marginStart:10}}>Successfully marked as resolved!</Text>
                </View>   

                </View>
            )}

           <View >
                <TouchableOpacity style={style.goback} onPress={handle_back}>
                      <Feather name="arrow-left" size={28} color="#374151" />
                    <Text style={{fontSize:18,fontWeight:"bold",marginStart:10}}>Go Back</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


const style = StyleSheet.create({
  header_container: {
    marginStart: 20,
    marginTop: 70,

    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  deatails: {
    borderBlockColor: "grey",
    borderWidth: 0.8,
    height: 100,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: "10%",
    alignItems: "center",
  },
  assign_button: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(17, 81, 12, 0.81)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reject_button: {
    width: "100%",
    height: 50,
    borderBlockColor: "black",
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    display: "flex",
    flexDirection: "row",
  },
  assign_container: {
    borderBlockColor: "#0c0c0cff",
    height: 100,
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  verfy_button: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    backgroundColor: "#3f0affff",
    borderRadius: 30,
    marginTop: 20,
  },
  preview_box: {
    height: 300,
    backgroundColor: "#dfdcdcff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  comment: {
    backgroundColor: "#dfdcdcff",
    borderRadius: 10,
    marginTop: 10,
  },
  status: {
    backgroundColor: "#dfdcdcff",
    borderRadius: 10,
    marginTop: 10,
    height: 80,
  },
  resolve_button:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    marginTop:20,
    backgroundColor:"#3c8a08ff",
    height:50,
    borderRadius:10
  },
  goback:{
     display:"flex",
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    marginTop:20,
    backgroundColor:"#f3f3f3ff",
    height:50,
    borderRadius:10,borderBlockColor:"#d8d2d2ff",borderWidth:1,
    borderColor:"#d8d2d2ff"
  },
    successBox: {
    backgroundColor: "#E6F9EE", // light green
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A8EEC1",
    marginTop:20,
  },
});

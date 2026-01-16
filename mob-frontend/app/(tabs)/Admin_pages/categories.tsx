import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";

export default function Categories() {
  const router = useRouter();
  const API_BASE = process.env.EXPO_PUBLIC_API_URL;

  const [category, setCategory] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [catName, setCatName] = useState("");

  const [items, setItems] = useState<string[]>([""]);

  const handleBack = () => router.back();

  useEffect(() => {
    const getCategory = async () => {
      const res = await axios.get(`${API_BASE}/getcategory`);
      setCategory(res.data.exsiting_data);
    };
    getCategory();
  }, []);

  // Expand / Collapse individual category
  const toggleExpand = (index: number) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Dynamic Items Handlers
  const addItem = () => setItems([...items, ""]);

  const updateItem = (text: string, index: number) => {
    const updated = [...items];
    updated[index] = text;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

   const add_category=async()=>{


    const res = await axios.post(`${API_BASE}/categories`,
      {name: catName,items: items,},
      {headers: {"Content-Type": "application/json"},})
      console.log(res.data)
      setCatName("");
      setItems([""]);
    }




  return (
    
    <View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Categories</Text>
      </View>

      <ScrollView style={styles.ScrollView}>
        <View style={{height:1800}}>

        <View style={{paddingHorizontal:20}}>
          {/* Show Add Category Button */}
        {!showAdd && (
          <TouchableOpacity
            style={styles.add_button}
            onPress={() => setShowAdd(true)}
          >
            <Text style={{ color: "white", fontSize: 17 }}>Add Category</Text>
          </TouchableOpacity>
        )}

        {/* Add Category Panel */}
        {showAdd && (
          <View style={styles.show_add}>

            <View style={{display:"flex",flexDirection:"row"}}>
            <Text style={styles.sectionTitle}>Create New Category</Text>

            </View>

            <Text style={styles.label}>Category Name</Text>

            <View style={{paddingHorizontal:20}}>
            <View style={styles.text_input}>
              <TextInput
                placeholder="eg., Building & Construction"
                value={catName}
                onChangeText={setCatName}
              />
            </View>
            </View>

            {/* Dynamic Category Items */}
            <Text style={styles.label}>Category Items</Text>

            {items.map((itm, idx) => (
              <View key={idx} style={styles.dynamicRow}>
                <TextInput
                  value={itm}
                  onChangeText={(t) => updateItem(t, idx)}
                  placeholder="Enter item"
                  style={styles.dynamicInput}
                />

                {idx > -1 && (
                  <TouchableOpacity onPress={() => removeItem(idx)} style={{marginTop:7,marginEnd:10,marginStart:10}}>
                    <Ionicons name="close" size={24} color="black" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Add More Item */}
            <TouchableOpacity onPress={addItem}>
              <Text style={styles.addItemText}>+ Add Item</Text>
            </TouchableOpacity>


            <View style={{display:"flex",flexDirection:"row",gap:10,marginStart:10,marginTop:30}}>

            <TouchableOpacity style={{ width:140, backgroundColor: "#3b7df0",opacity: catName ? 1 : 0.4 ,height:50,justifyContent:"center",borderRadius:6,alignItems:"center"
                }} onPress={add_category} 
                disabled={!catName}>
              <Text>Create Category</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles. cancel_button}
               onPress={()=>setShowAdd(false)}>
              <Text>Cancel</Text>
            </TouchableOpacity>

             </View>

          </View>

    
        )}
        </View>
        {/* Category List */}
        {category.map((item, index) => (
          <View key={index} style={{paddingHorizontal:20}}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => toggleExpand(index)}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={22}
                  color="#555"
                />
              </View>
            </TouchableOpacity>

            {/* Expanded Items */}
            {expandedIndex === index && (
              <View style={styles.itemsBox}>
                {item.items?.map((itm: any, idx: number) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.itemText}>{itm}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        
    </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 60,
    marginStart: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginStart: 10,
  },
  ScrollView: {
    backgroundColor: "#f4f7f9ff",
  },
  card: {
    marginTop: 20,
    backgroundColor: "white",
    height: 60,
    borderWidth: 1,
    borderColor: "gray",
    justifyContent: "center",
    borderRadius: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  cardTitle: { fontSize: 17 },
  itemsBox: {
    
    backgroundColor: "white",
   
    borderColor: "gray",
    borderWidth: 1,
    paddingBottom: 10,
    borderRadius: 8,
  },
  itemRow: {
    flexDirection: "row",
    marginStart: 25,
    marginTop: 8,
  },
  bullet: { fontSize: 25 },
  itemText: { marginTop: 8, marginStart: 10, fontSize: 14 },

  add_button: {

    height: 60,
    backgroundColor: "#3b7df0",

    marginTop: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  show_add: {
   
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 20,
 
    paddingBottom: 20,
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginStart: 10,
    marginTop: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginStart: 10,
    marginTop: 15,
    
  },

  text_input: {
 
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 10,
  
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
    text_input1: {
    borderWidth: 1,
    borderColor: "gray",
    marginTop: 10,
    
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
  },


  dynamicRow: {
    flexDirection: "row",
 
    marginTop:10,
    marginStart: 10,

  },

  dynamicInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
  
    borderRadius: 6,
  },

  addItemText: {
    color: "#3b7df0",
    
    marginStart: 10,
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  create_button:{
 width:140,backgroundColor:"#3b7df0",height:50,justifyContent:"center",borderRadius:6,alignItems:"center"
 
  },
  cancel_button:{
    width:150,backgroundColor:"#aeb0b5ff",height:50,justifyContent:"center",borderRadius:6,alignItems:"center"
  }
 
});

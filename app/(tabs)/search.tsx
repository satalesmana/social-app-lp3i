import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";

// --- START: MODIFIKASI DATA TOPIK ---
const allTopics = {
  "Olahraga": [
    "Indonesia vs Thailand", 
    "Piala Asia U23", 
    "Liga Champions", 
    "Messi", 
    "Ronaldo",
  ],
  "Berita": [
    "Kwitang", 
    "Jakarta Selatan", 
    "Pemilu 2025", 
    "Isu Politik", 
  ],
  "Sedang Tren": [
    "Teknologi AI", 
    "Startup Lokal", 
    "Investasi Saham", 
    "Game Mobile", 
    "Film Baru", 
    // Tambahkan beberapa dari 'Berita' atau 'Olahraga' untuk kesan 'trending'
    // "Pemilu 2025", "Liga Champions" 
  ],
  // 'Untuk Anda' akan berisi campuran atau semua topik
};

// Gabungan semua topik untuk keperluan default dan acak
const allTrendingTopics = [
    ...allTopics["Olahraga"], 
    ...allTopics["Berita"], 
    ...allTopics["Sedang Tren"]
];

// --- END: MODIFIKASI DATA TOPIK ---

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState("Untuk Anda");
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Filter topik sesuai tab & search
  const getCurrentTopics = () => {
    let topics = [];

    if (activeTab === "Untuk Anda") {
      // Untuk Anda: Tampilkan campuran acak dari semua topik
      const shuffled = [...allTrendingTopics].sort(() => 0.5 - Math.random());
      topics = shuffled.slice(0, 8); // Tampilkan 8 topik acak
    } else {
      // Tampilkan topik spesifik berdasarkan kategori
      topics = allTopics[activeTab] || [];
      // Acak urutan topiknya agar terlihat dinamis
      topics = topics.sort(() => 0.5 - Math.random());
    }

    // Terapkan filter pencarian jika ada teks
    if (searchText) {
      topics = topics.filter((t) =>
        t.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Batasi jumlah yang ditampilkan (misal maks 10 jika bukan dari search)
    if (!searchText) {
        topics = topics.slice(0, 10); 
    }

    return topics;
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Di sini kita hanya menunggu sebentar, tapi pemanggilan getCurrentTopics() 
    // akan mengacak topik lagi, memberikan kesan 'refresh'
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trendItem}
      onPress={() => router.push({ pathname: "/detail", params: { title: item } })}
    >
      <Text style={styles.trendTitle}>{item}</Text>
      <Text style={styles.trendSubtitle}>Lihat berita terbaru</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Cari topik..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {/* Pastikan nama tab sesuai dengan key di objek allTopics */}
        {["Untuk Anda", "Sedang Tren", "Berita", "Olahraga"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trending List */}
      <FlatList
        // Kita menggunakan keyExtractor yang sudah baik, tidak perlu perubahan
        data={getCurrentTopics()}
        keyExtractor={(item) => item} 
        renderItem={renderItem}
        style={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.noResult}>Tidak ada hasil</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
// ... (styles tetap sama)
  container: { flex: 1, backgroundColor: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabText: { fontSize: 14, color: "#555" },
  activeTabText: { fontWeight: "bold", color: "#000" },
  list: { flex: 1, padding: 10 },
  trendItem: { marginBottom: 15, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  trendTitle: { fontSize: 16, fontWeight: "bold" },
  trendSubtitle: { fontSize: 12, color: "#777" },
  noResult: { textAlign: "center", marginTop: 20, fontSize: 14, color: "#888" },
});
// app/detail.tsx
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase, uploadImage } from "../lib/supabase";

/* ------------------ URL SUPABASE (URL PUBLIK PERMANEN) ------------------ */

// // URL ini diambil dari URL Anda, diubah ke format publik permanen
// // (tanpa token 'sign/' dan '?token=...')
// const SUPABASE_GAME_MOBILE_URL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/public/social-apps/game%20mobile.jpg";


/* ---------- dummy data ---------- */
const TOPICS = [
  "Kwitang", "Qodari", "Jakarta Selatan", "Pemilu 2025",
  "Teknologi AI", "Startup Lokal", "Investasi Saham",
  "Festival Musik", "Film Baru", "Game Mobile", // Target URL Supabase
  "Kementerian Agraria", "Harga BBM", "Isu Politik",
  "Ekonomi Global", "Perubahan Iklim", "Indonesia vs Thailand",
  "Piala Asia U23", "Liga Champions", "Messi", "Ronaldo",
];

const generateNewsContent = (topic: string) => {
  switch (topic) {
    // TOPIC OLAHRAGA
        case "Indonesia vs Thailand":
            return `Timnas Indonesia U23 berhasil menahan imbang Thailand 1-1 di laga kualifikasi Piala Asia #${topic.replace(/\s+/g,'')}`;
        case "Piala Asia U23":
            return `Indonesia resmi lolos ke babak semifinal Piala Asia U23 untuk pertama kalinya dalam sejarah #${topic.replace(/\s+/g,'')}`;
        case "Liga Champions":
            return `Real Madrid melaju ke final Liga Champions setelah mengalahkan Manchester City 3-1 #${topic.replace(/\s+/g,'')}`;
        case "Messi":
            return `Lionel Messi mencetak hat-trick untuk Inter Miami dan membawa timnya ke puncak klasemen MLS #${topic.replace(/\s+/g,'')}`;
        case "Ronaldo":
            return `Cristiano Ronaldo menjadi top skor Liga Arab Saudi setelah menambah dua gol di laga terakhir #${topic.replace(/\s+/g,'')}`;
            
    // TOPIC BERITA
        case "Kwitang":
            return `Pasar buku bekas di Kwitang kembali ramai menjelang tahun ajaran baru. Banyak mahasiswa dan pelajar berburu buku langka dengan harga murah #${topic.replace(/\s+/g,'')}`;
        case "Jakarta Selatan":
            return `Banjir rob melanda beberapa titik di Jakarta Selatan setelah hujan deras semalaman. BPBD mengerahkan tim evakuasi#${topic.replace(/\s+/g,'')}`;
        case "Pemilu 2025":
            return `Update terbaru Pemilu 2025: hasil survei dan prediksi calon legislatif. #${topic.replace(/\s+/g,'')}`;
        case "Isu Politik":
            return `Isu reshuffle kabinet kembali mencuat setelah Presiden memberi sinyal perubahan di jajaran menteri #${topic.replace(/\s+/g,'')}`;

    // TOPIC SEDANG TREN
        case "Teknologi AI":
            return `Inovasi AI terbaru menghadirkan peluang baru di dunia teknologi dan bisnis. #${topic.replace(/\s+/g,'')}`;
        case "Startup Lokal":
            return `Sebuah startup lokal bidang agritech mendapat pendanaan seri A senilai USD 10 juta dari investor Singapura #${topic.replace(/\s+/g,'')}`;
        case "Investasi Saham":
            return `IHSG hari ini melemah 1,2% dipicu sentimen global, saham sektor teknologi jadi yang paling terdampak #${topic.replace(/\s+/g,'')}`;
        case "Game Mobile":
            return `Game mobile buatan developer Indonesia tembus 10 juta unduhan di Google Play Store #${topic.replace(/\s+/g,'')}`;
        case "Film Baru":
            return `Film terbaru menarik perhatian penonton di bioskop. Review dan jadwal tayang #${topic.replace(/\s+/g,'')}`;
        
        default:
            return `Konten tidak ditemukan untuk topik: ${topic}.`;
  }
};

// LOGIKA MOCK_POSTS DIMODIFIKASI
const MOCK_POSTS = TOPICS.map((topic, index) => {
  let imageURL = `https://source.unsplash.com/1200x800/?${encodeURIComponent(topic)}`;

  // Gunakan URL Supabase untuk topik 
   // --- TOPIC SEDANG TREN ---
  if (topic === "Game Mobile") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/game%20mobile%20II.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9nYW1lIG1vYmlsZSBJSS5qcGciLCJpYXQiOjE3NTk2MzQ3ODcsImV4cCI6MTc5MTE3MDc4N30.Kh04Ht02DEi4fUYfg75wvwa0gwx-lyn0iOcxjvqSRRY"; 
  }
  if (topic === "Teknologi AI") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/Ai.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9BaS5qcGciLCJpYXQiOjE3NTk2MzQ5MTksImV4cCI6MTc5MTE3MDkxOX0.DGeHZKeknNSpJdSzsoc0I8HuY_SoYAfyYSOm1U8bSyQ"; 
  }
  if (topic === "Startup Lokal") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/startup.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9zdGFydHVwLmpwZyIsImlhdCI6MTc1OTYzNTA3MCwiZXhwIjoxNzkxMTcxMDcwfQ.A7BbjFKOtFX3FR3wyE40n_ehS81kmbN6CaFeF8Gs7H0"; 
  }
  if (topic === "Investasi Saham") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/investasi%20saham.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9pbnZlc3Rhc2kgc2FoYW0uanBnIiwiaWF0IjoxNzU5NjM1MTM3LCJleHAiOjE3OTExNzExMzd9.w807cxZwH5wzH__iBSBMdl_6Fqq6vvWSuEKgxYLNP-k"; 
  }
  if (topic === "Film Baru") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/film.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9maWxtLmpwZyIsImlhdCI6MTc1OTYzNTIyNSwiZXhwIjoxNzkxMTcxMjI1fQ.lB6DI4YT9ZfjXyboxxASFBkDPOHUcV-gma_Og0vIP9M"; 
  }
  // --- TOPIC BERITA ---
  if (topic === "Kwitang") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/Libary%20Kwitang.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9MaWJhcnkgS3dpdGFuZy5qcGciLCJpYXQiOjE3NTk2MzUyNzcsImV4cCI6MTc5MTE3MTI3N30.aLj6G5cBMya2hLWU3ySi-SWfccjvdzTZNfWaSFpx0NE";
  }
  if (topic === "Jakarta Selatan") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/Banjir%20di%20Jakarta%20Selatan.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9CYW5qaXIgZGkgSmFrYXJ0YSBTZWxhdGFuLmpwZyIsImlhdCI6MTc1OTYzNTc2NiwiZXhwIjoxNzkxMTcxNzY2fQ.fB_xUGZV2iTUi4boKItXt7cRg2HQ4vDfTzNFIegC6OE"; 
  }
  if (topic === "Pemilu 2025") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/pemilu%202025.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9wZW1pbHUgMjAyNS5qcGciLCJpYXQiOjE3NTk2MzU5NDEsImV4cCI6MTc5MTE3MTk0MX0.wm_uqQ6p-LOgVHIe3Rm2JTh1W5i1Q1HW8wxkNoUI3mI"; 
  }
  if (topic === "Isu Politik") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/isu%20politik.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9pc3UgcG9saXRpay5qcGciLCJpYXQiOjE3NTk2MzYwOTEsImV4cCI6MTc5MTE3MjA5MX0.nMQqUo2gTJlN7IuLKSRAhmqYRmQlZxArjbhuZSlAP4w"; 
  }
  // --- TOPIC OLAHRAGA ---
  if (topic === "Indonesia vs Thailand") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/Timnas%20Indonesia%20vs%20Timnas%20Thailand.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9UaW1uYXMgSW5kb25lc2lhIHZzIFRpbW5hcyBUaGFpbGFuZC5qcGciLCJpYXQiOjE3NTk2MzYzODgsImV4cCI6MTc5MTE3MjM4OH0.ieTJMS4PRAUHXEoa1GT4go7uXRltww2Ab3D4UVdu4bU"; 
  }
  if (topic === "Piala Asia U23") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/piala%20asia%20u23.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9waWFsYSBhc2lhIHUyMy5qcGciLCJpYXQiOjE3NTk2MzY0NzEsImV4cCI6MTc5MTE3MjQ3MX0.tMNlNV8hUEvhnxOBNWn_I7rUF3Han6SkihyQe0cfsTw"; 
  }
  if (topic === "Liga Champions") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/UEFA%20Champions%20League.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9VRUZBIENoYW1waW9ucyBMZWFndWUuanBnIiwiaWF0IjoxNzU5NjM2NjA0LCJleHAiOjE3OTExNzI2MDR9.QK5N2WLIybG49a9D5uwP00x0UrcmNmXjgfZ1e2DsMDA"; 
  }
  if (topic === "Messi") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/Messi.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9NZXNzaS5qcGciLCJpYXQiOjE3NTk2MzY2NjMsImV4cCI6MTc5MTE3MjY2M30.NhR4OYprWclCBdkMwOX-DYzMYeRbjCxu6zb9K6D5f1g"; 
  }
  if (topic === "Ronaldo") {
    imageURL = "https://miyttagoybwpulrlymas.supabase.co/storage/v1/object/sign/social-apps/ronaldo.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDZlNTJiYy1mMDc4LTRkOTQtOTYyNi03NjFjYWRmZTc0ZWQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb2NpYWwtYXBwcy9yb25hbGRvLmpwZyIsImlhdCI6MTc1OTYzNjczMCwiZXhwIjoxNzkxMTcyNzMwfQ.k1tr_H8_G9Hrwvo2vE4G-wdrkjU9JqxVZr10OP2SAeQ";
  }


  return {
    id: topic,
    username: `Berita ${index+1}`,
    handle: `@berita${index+1}`,
    time: `${index+1}h`,
    fullTime: `0${index+1}:00 AM · Oct 2, 2025`,
    postContent: generateNewsContent(topic),
    postImage: imageURL,
    stats: {
      comments: Math.floor(Math.random() * 1000),
      retweets: Math.floor(Math.random() * 5000),
      likes: Math.floor(Math.random() * 20000),
      views: Math.floor(Math.random() * 100000),
    },
  };
});

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 10000) return (num / 1000).toFixed(1) + "K";
  if (num >= 1000) return (num / 1000).toFixed(1) + " rb";
  return num.toString();
};

/* ------------------ Detail page ------------------ */
export default function DetailPage() {
  const { title } = useLocalSearchParams();
  const router = useRouter();

  const topicId = Array.isArray(title) ? title[0] : title;
  const postData = MOCK_POSTS.find((p) => p.id === topicId) || MOCK_POSTS[0];

  const AVATAR_URL = `https://i.pravatar.cc/100?u=${postData.handle}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={styles.headerRight} />
        </View>

        {/* USER INFO */}
        <View style={styles.userInfoRow}>
          <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
          <View style={styles.userMeta}>
            <Text style={styles.username}>{postData.username}</Text>
            <Text style={styles.handle}>{postData.handle} · {postData.time}</Text>
          </View>
        </View>

        {/* TOPIC TAGS */}
        <View style={styles.topicContainer}>
          {String(postData.id).split(" ").map((w, i) => (
            <TouchableOpacity key={i} activeOpacity={0.7}>
              <Text style={styles.topicTag}>#{w}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* POST TEXT */}
        <Text style={styles.postContentText}>{postData.postContent}</Text>

        {/* IMAGE */}
        {postData.postImage ? (
          <View style={styles.imageOuter}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: postData.postImage }}
                // Menggunakan style yang diperbaiki
                style={styles.postImage_Fixed} 
                resizeMode="cover"
              />
            </View>
          </View>
        ) : null}

        {/* TIMESTAMP & VIEWS */}
        <View style={styles.timestampViewsRow}>
          <Text style={styles.fullTimeText}>
            {postData.fullTime} · {formatNumber(postData.stats.views)} Views
          </Text>
        </View>

        <View style={styles.separator} />

        {/* ACTION ROW */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#333" />
            <Text style={styles.actionText}>{formatNumber(postData.stats.comments)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="repeat-outline" size={20} color="#333" />
            <Text style={styles.actionText}>{formatNumber(postData.stats.retweets)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="heart-outline" size={20} color="#333" />
            <Text style={styles.actionText}>{formatNumber(postData.stats.likes)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="share-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------ styles ------------------ */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    paddingBottom: 24,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  headerIcon: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "600", flex: 1 },
  headerRight: { width: 36 },

  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: "#ddd" },
  userMeta: { flexDirection: "column" },
  username: { fontSize: 16, fontWeight: "700" },
  handle: { color: "#666", marginTop: 2 },

  topicContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, marginTop: 10 },
  topicTag: { color: "#1DA1F2", marginRight: 8, marginBottom: 6, fontWeight: "600" },

  postContentText: { fontSize: 17, lineHeight: 24, paddingHorizontal: 12, marginTop: 8 },

  imageOuter: { paddingHorizontal: 12, marginTop: 10 },
  imageWrapper: {
    width: "95%", // Diperbesar
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#eee",
    alignSelf: "center",
  },
  // Style lama (tidak digunakan lagi, hanya referensi)
  postImage: {
    width: "70%",
    aspectRatio: 15 / 8,
  },
  // Style baru yang wajib digunakan untuk gambar eksternal
  postImage_Fixed: {
    width: "100%", // Penting: Mengambil lebar penuh parent
    height: 300,   // Penting: Tinggi tetap untuk rendering
  },


  timestampViewsRow: { paddingHorizontal: 12, marginTop: 12 },
  fullTimeText: { color: "#666" },

  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd", marginTop: 12 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
  },
  actionItem: { flexDirection: "row", alignItems: "center" },
  actionText: { marginLeft: 8, color: "#333" },
});
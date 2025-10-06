import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { supabase } from "../../lib/supabase";

export default function RepostsScreen() {
  const [reposts, setReposts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReposts();
  }, []);

  const fetchReposts = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Gagal mengambil user:", userError);
        setLoading(false);
        return;
      }

      const user = userData.user;

      const { data: repostData, error } = await supabase
        .from("reposts")
        .select(`
          id,
          created_at,
          posts (
            id,
            content,
            image_url,
            users ( username )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetch repost:", error.message);
        setReposts([]);
      } else {
        console.log("Reposts fetched:", repostData);
        setReposts(repostData || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const post = item?.posts;
    const username = post?.users?.username || "Unknown User";

    return (
      <View
        style={{
          padding: 12,
          borderBottomWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
        }}
      >
        <Text style={{ color: "gray", fontSize: 12 }}>
          Reposted from {username}
        </Text>
        <Text style={{ marginTop: 4, fontSize: 15, color: "#333" }}>
          {post?.content || "Tanpa konten"}
        </Text>
        {post?.image_url ? (
          <Image
            source={{ uri: post.image_url }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 8,
              marginTop: 8,
            }}
          />
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Text style={{ color: "gray" }}>Memuat repost kamu...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#ddd",
          backgroundColor: "#fafafa",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>🔁 My Reposts</Text>
      </View>

      <FlatList
        data={reposts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 40,
              color: "gray",
              fontSize: 15,
            }}
          >
            Belum ada repost 
          </Text>
        }
      />
    </View>
  );
}

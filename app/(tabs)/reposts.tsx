import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { supabase } from  "../../lib/supabase";

export default function RepostsScreen() {
  const [reposts, setReposts] = useState([]);

  useEffect(() => {
    fetchReposts();
  }, []);

  const fetchReposts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
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

    if (error) console.error(error);
    else setReposts(data);
  };

  const renderItem = ({ item }) => (
    <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Text style={{ color: "gray", fontSize: 12 }}>
        Reposted from {item.posts?.users?.username}
      </Text>
      <Text style={{ marginTop: 4 }}>{item.posts?.content}</Text>
      {item.posts?.image_url && (
        <Image
          source={{ uri: item.posts.image_url }}
          style={{ width: "100%", height: 180, borderRadius: 8, marginTop: 8 }}
        />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderColor: "#ddd" }}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>My Reposts</Text>
      </View>

      <FlatList
        data={reposts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, color: "gray" }}>
            Belum ada repost.
          </Text>
        }
      />
    </View>
  );
}

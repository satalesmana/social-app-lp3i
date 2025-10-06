// lib/api/comment.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getCommentsByPostId(postId: string) {
  try {
    const all = await AsyncStorage.getItem("comments");
    const comments = all ? JSON.parse(all) : {};
    return comments[postId] || [];
  } catch (error) {
    console.error("getCommentsByPostId error:", error);
    return [];
  }
}

export async function addComment(postId: string, content: string, user: any) {
  try {
    const all = await AsyncStorage.getItem("comments");
    const comments = all ? JSON.parse(all) : {};

    const newComment = {
      id: Date.now().toString(),
      post_id: postId,
      user_name: user?.name || "Anon",
      user_avatar: user?.avatar_url || "",
      content,
      created_at: new Date().toISOString(),
    };

    if (!comments[postId]) comments[postId] = [];
    comments[postId].push(newComment);

    await AsyncStorage.setItem("comments", JSON.stringify(comments));
    return newComment;
  } catch (error) {
    console.error("addComment error:", error);
    throw error;
  }
}

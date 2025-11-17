import { View, FlatList, TextInput, Button, KeyboardAvoidingView, SafeAreaView, Platform } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { supabase } from "../../../../lib/supabase";
import { useState, useEffect } from "react";
import { PostDetailCard } from "../../../../components/module/post/DetailCard";
import { CommentsCard } from "../../../../components/module/comments/Card";
import { Session } from "@supabase/supabase-js"; 

export default function CommentsPage(){
    const { id } = useLocalSearchParams(); // Ini adalah post_id
    
    // State untuk data
    const [posts, setPost]= useState<Array<any>>([]);
    const [comments, setComments]= useState<Array<any>>([]);
    
    // State untuk input & session
    const [session, setSession] = useState<Session | null>(null);
    const [commentInput, setCommentInput] = useState("");

    const onLoadPost = async ()=>{
        const { data, error } = await supabase
              .schema('public')
              .from("post")
              .select("id, created_at, text, createdby, handle, image")
              .eq("id", id);
        if(data){setPost(data)}
    }

    const onLoadComments = async ()=>{
        const { data, error } = await supabase
              .schema('public')
              .from("post_comments")
              // Ambil juga email untuk ditampilkan
              .select("id, comments, image, created_at, email") 
              .order("created_at", { ascending: false })
              .eq("post_id", id);
              
        console.log('onLoadComments', error)
        if(data){setComments(data)}
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        onLoadPost();
        onLoadComments();
    },[]);
    
    const handleSendComment = async () => {
        if (!commentInput.trim() || !session) return;
        
        const dataToInsert = {
            post_id: id as string,
            user_id: session.user.id, 
            email: session.user.email, // <-- Ini sudah benar
            comments: commentInput,
        };

        // Kirim ke Supabase
        const { error } = await supabase
            .schema('public')
            .from("post_comments")
            .insert(dataToInsert);

        if (error) {
            console.error("Error sending comment:", error);
        } else {
            setCommentInput(""); 
            onLoadComments(); 
        }
    };

    
    return(
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                <FlatList
                    data={comments}
                    renderItem={({item}) => <CommentsCard 
                    data={item}  />}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={
                        posts.length > 0 ? <PostDetailCard data={posts[0]}/> : null
                    }
                />
                
                <View className="border-t border-neutral-200 p-4 flex-row items-center">
                    <TextInput
                        value={commentInput}
                        onChangeText={setCommentInput}
                        placeholder="Tulis komentar..."
                        className="flex-1 border border-neutral-300 rounded-2xl px-3 py-2 mr-2"
                        multiline
                    />
                    <Button 
                        title="Kirim" 
                        onPress={handleSendComment} 
                        disabled={!commentInput.trim()} 
                    />
                </View>

            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}
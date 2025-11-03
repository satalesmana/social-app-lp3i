import { View, FlatList } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import { supabase } from "../../../../lib/supabase";
import { useState, useEffect } from "react";
import { PostDetailCard } from "../../../../components/module/post/DetailCard"
import { CommentsCard } from "../../../../components/module/comments/Card"

export default function CommentsPage(){
    const { id } = useLocalSearchParams();
    const [posts, setPost]= useState<Array<any>>([])
    const [comments, setComments]= useState<Array<any>>([])

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
              .select("id, comments, image")
              .order("created_at", { ascending: false })
              .eq("post_id", id);
              
        console.log('onLoadComments', error)
        if(data){setComments(data)}
    }

    useEffect(() => {
        onLoadPost()
        onLoadComments()
    },[]);
    
    return(
        <View>
            {posts.length > 0 && 
                <PostDetailCard data={posts[0]}/>
            }

            <FlatList
                data={comments}
                renderItem={({item}) => <CommentsCard 
                data={item}  />}
                keyExtractor={item => item.id} />
        </View>
    )
}
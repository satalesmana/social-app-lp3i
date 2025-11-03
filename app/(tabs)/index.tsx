import { useState, useEffect } from "react";
import { FlatList, Platform} from "react-native";
import { FloatingButton } from "../../components/global/Button";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "../../components/module/post/Card";
import { FormInputPost } from "../../components/module/post/FormInput";
import { supabase } from "../../lib/supabase";
import { Session } from '@supabase/supabase-js'
import "../../global.css"


export default function HomeScreen(){
  const [session, setSession] = useState<Session | null>(null)
  const [isFormVisible, setFormVisible] = useState(false);
  const [posts, setPost]= useState<Array<any>>([])

  const onLoad= async()=>{
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
    }).catch((error) => {
        console.error("Error getting session:", error)
    })

    const { data, error } = await supabase
      .schema('public')
      .from("post")
      .select("id, created_at, text, createdby, handle, image, comments, shares, post_like(id, post_id, user_id, created_at)")
      .order("created_at", { ascending: false })
      .limit(50);
    console.log('sf', data)
    // console.log('sf', error)
    if(data){setPost(data);}
  }

  useEffect(() => {
    onLoad()
  },[]);

  const onlikeAction=async(post_id:string, hasLike:Boolean)=>{
    console.log('hasLike', hasLike)
    if(!hasLike){
       const { error } =  await supabase
        .schema('public')
        .from("post_like")
        .insert({
          post_id: post_id,
          user_id: session?.user.id
        })
    }else{
       const { error } =  await supabase
      .schema('public')
      .from("post_like")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", session?.user.id);

      console.log('error=>', error)
    }
  
    onLoad()
  }

  return(
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1}}>
        {Platform.OS !== "web" && (
          <FloatingButton onPress={() => setFormVisible(true)} iconName="add"/>
        )}

        <FormInputPost 
          visible={isFormVisible} 
          onClose={() => setFormVisible(false)}
          onSubmitedPost={onLoad} />

        <FlatList
          data={posts}
          renderItem={({item}) => <PostCard 
            data={item} 
            onlikeAction={(value, hasLike)=> onlikeAction(value, hasLike)}
            userId={session?.user.id as string} />}
          keyExtractor={item => item.id} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
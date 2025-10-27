import { useState, useEffect } from "react";
import { FlatList, Platform} from "react-native";
import { FloatingButton } from "../../components/global/Button";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "../../components/module/post/Card";
import { FormInputPost } from "../../components/module/post/FormInput";
import { supabase } from "../../lib/supabase";
import "../../global.css"


export default function HomeScreen(){
  const [isFormVisible, setFormVisible] = useState(false);
  const [posts, setPost]= useState<Array<any>>([])

  const onLoad= async()=>{
    const { data } = await supabase
      .schema('public')
      .from("post")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if(data){setPost(data);}
  }

  useEffect(() => {
    onLoad()
  },[]);

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
          renderItem={({item}) => <PostCard data={item} />}
          keyExtractor={item => item.id} />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
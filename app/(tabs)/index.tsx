import { FlatList} from "react-native";
import { FloatingButton } from "../../components/global/Button";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PostCard } from "../../components/module/post/Card";
import "../../global.css"

const posts = [
  {
    id: 1,
    user: "Devon Lane",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/300",
    likes: [],
    comments: [],
    shares: [],
  },
  {
    id: 2,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/301",
    likes: [],
    comments: [],
    shares: [],
  },
  {
    id: 3,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/301",
    likes: [],
    comments: [],
    shares: [],
  },
  {
    id: 4,
    user: "Darlene Robertson",
    handle: "@johndue",
    text: "Tom is in a big hurry.",
    image: "https://picsum.photos/500/301",
    likes: [],
    comments: [],
    shares: [],
  },
];

export default function HomeScreen(){
    return(
      <SafeAreaProvider>
        <SafeAreaView style={{flex:1}}>
          <FloatingButton onPress={() => {}} iconName="add"/>
            <FlatList
              data={posts}
              renderItem={({item}) => <PostCard data={item} />}
              keyExtractor={item => item.id} />
        </SafeAreaView>
      </SafeAreaProvider>
    )
}
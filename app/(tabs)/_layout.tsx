import { useState, useEffect } from 'react';
import { Tabs, Stack, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions, Image, Modal, TextInput, Keyboard, SafeAreaView, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import "../../global.css"

// Komponen untuk avatar di header mobile
const HeaderAvatar = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single();
        setUser(profile);
      }
    };
    fetchUser();
  }, []);
  return (
    <Pressable onPress={() => router.push('/account')} className="ml-4">
      <Image source={{ uri: user?.avatar_url || 'https://avatar.iran.liara.run/public' }} className="w-8 h-8 rounded-full bg-gray-200" />
    </Pressable>
  );
};

// Komponen untuk profil di sidebar desktop
const DesktopProfileSection = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('avatar_url, full_name, username').eq('id', session.user.id).single();
        setUser(profile);
      }
    };
    fetchUser();
  }, []);
  if (!user) return null;
  return (
    <Pressable className="mt-auto">
      <View className="flex-row items-center">
        <Image source={{ uri: user.avatar_url || 'https://avatar.iran.liara.run/public' }} className="w-10 h-10 rounded-full bg-gray-200" />
        <View className="ml-3">
          <Text className="font-bold">{user.full_name}</Text>
          <Text className="text-gray-500">@{user.username}</Text>
        </View>
        <FontAwesome name="ellipsis-h" size={16} color="gray" className="ml-auto" />
      </View>
    </Pressable>
  );
};

// Komponen pop-up untuk membuat post di DESKTOP
const DesktopCreatePostModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_CHARACTERS = 300;

  useEffect(() => {
    if (visible) {
      const fetchUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single();
          setUser(profile);
        }
      };
      fetchUser();
    } else {
      setContent(''); setImageUri(null); setIsSubmitting(false);
    }
  }, [visible]);

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const fileName = `${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('posts').upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(fileName);
    return publicUrl;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!content && !imageUri) return;
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined = undefined;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("User not found");
      await supabase.from('posts').insert([{ content, user_id: currentUser.id, image_url: imageUrl }]);
      onClose();
    } catch (error: any) {
      console.error('Error posting:', error.message);
    } finally {
      setIsSubmitting(false);
      Keyboard.dismiss();
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose} statusBarTranslucent={true}>
      <Pressable onPress={onClose} className="flex-1 justify-center items-center bg-black/60 p-4">
        <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-2xl flex flex-col" style={{ minHeight: 350 }}>
          <View className="flex-row justify-between items-center p-4">
            <Pressable onPress={onClose} className="rounded-full px-5 py-2 border border-blue-500">
              <Text className="font-bold text-base text-gray-500">Cancel</Text>
            </Pressable>
            <Pressable onPress={handlePost} disabled={(content.length === 0 && !imageUri) || isSubmitting} className={`rounded-full px-5 py-2 ${(content.length > 0 || imageUri) && !isSubmitting ? 'bg-blue-500' : 'bg-blue-300'}`}>
              {isSubmitting ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold text-base">Post</Text>}
            </Pressable>
          </View>

          <View className="p-4 pt-0 flex-1 flex-row">
            <Image source={{ uri: user?.avatar_url || 'https://avatar.iran.liara.run/public' }} className="w-12 h-12 rounded-full mr-4 bg-gray-200" />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What's happening?"
              className="flex-1 text-lg outline-none" 
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </View>
          {imageUri && (
            <View className="px-4 pb-4 ml-16 relative w-1/2">
              <Image source={{ uri: imageUri }} className="w-full h-32 rounded-xl" />
              <Pressable onPress={() => setImageUri(null)} className="absolute top-2 right-2 bg-black/60 rounded-full p-1"><Feather name="x" size={16} color="white" /></Pressable>
            </View>
          )}

          <View className="p-4 flex-row items-center border-t border-gray-200">
            <View className="flex-row items-center">
              <Pressable onPress={pickImage}><Feather name="image" size={24} color="rgb(29, 155, 240)" /></Pressable>
              <Pressable className="ml-4 border border-blue-400 rounded px-2 py-1"><Text className="text-blue-400 font-bold text-sm">GIF</Text></Pressable>
            </View>
            <View className="flex-row items-center ml-auto">
              <Text className="text-gray-500">{MAX_CHARACTERS - content.length} Character left</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isDesktopModalVisible, setDesktopModalVisible] = useState(false);

  if (isDesktop) {
    return (
      <>
        <View className="flex-row justify-center">
          <View className="w-1/5 h-screen p-4 flex flex-col">
            <View>
              <FontAwesome name="twitter" size={30} color="rgb(29, 155, 240)" className="mb-5 ml-3" />

              {/* ========== PERUBAHAN TAMPILAN SIDEBAR ========== */}
              <Pressable onPress={() => router.push("/")} className="flex-row items-center mb-2 p-3 rounded-full hover:bg-gray-200 transition-colors duration-200">
                <Ionicons name="home-outline" size={28} color="black" />
                <Text className="text-xl font-bold ml-5">Home</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/message")} className="flex-row items-center mb-2 p-3 rounded-full hover:bg-gray-200 transition-colors duration-200">
                <Ionicons name="mail-outline" size={28} color="black" />
                <Text className="text-xl font-bold ml-5">Message</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/account")} className="flex-row items-center mb-2 p-3 rounded-full hover:bg-gray-200 transition-colors duration-200">
                <Ionicons name="person-outline" size={28} color="black" />
                <Text className="text-xl font-bold ml-5">Account</Text>
              </Pressable>

              {/* ========== PERUBAHAN TOMBOL TWEET ========== */}
              <TouchableOpacity
                onPress={() => setDesktopModalVisible(true)}
                activeOpacity={0.85}
                style={{
                  marginTop: 16,
                  borderRadius: 999,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 4,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={['#1DA1F2', '#0d8ddb']}
                  start={[0, 0]}
                  end={[1, 1]}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 999,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Tweet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <DesktopProfileSection />
          </View>
          <View className="w-2/5 h-screen border-x border-gray-200">
            <Stack>
              <Stack.Screen 
                name='index' 
                options={{
                  title: "Home",
                  headerShown: true,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                  },
                  headerRight: () => (
                    <Pressable className="mr-4">
                      <Ionicons name="sparkles-outline" size={24} color="black" />
                    </Pressable>
                  ),
                }} 
              />
              <Stack.Screen name='message' options={{ title: "Message" }} />
              <Stack.Screen name='account' options={{ title: "Account" }} />
            </Stack>
          </View>
          <View className="w-1/4 h-screen p-4">
            <Text className="font-bold text-xl">Trends for you</Text>
          </View>
        </View>
        <DesktopCreatePostModal visible={isDesktopModalVisible} onClose={() => setDesktopModalVisible(false)} />
      </>
    )
  }

  // Mobile layout
  return (
    <>
      <Stack.Screen name="create-post" options={{ presentation: 'modal', headerShown: false }} />
      <Tabs screenOptions={{
        tabBarActiveTintColor: 'blue',
        tabBarShowLabel: false,
      }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: true,
            headerTitleAlign: 'center',
            headerTitle: () => (
              <FontAwesome name="twitter" size={24} color="rgb(29, 155, 240)" />
            ),
            headerLeft: () => <HeaderAvatar />,
            headerRight: () => (
              <Pressable className="mr-4">
                <Ionicons name="sparkles-outline" size={24} color="black" />
              </Pressable>
            ),
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            title: 'Message',
            tabBarIcon: ({ color, size }) => (
              <Feather name="message-square" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
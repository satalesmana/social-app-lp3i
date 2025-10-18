// app/(tabs)/_layout.tsx — layout mobile & desktop + Composer bottom-sheet
import "react-native-url-polyfill/auto"; // ⬅️ penting: polyfill URL untuk Supabase di RN
import "react-native-get-random-values";

import React, { useEffect, useRef, useState } from "react";
import { Tabs, Stack, router, usePathname } from "expo-router";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Alert,
  Animated,
  Easing,
  Keyboard,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Svg, G, Path, Line } from "react-native-svg";
import "../../global.css";

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Supabase + utils
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from "uuid";

const ACTIVE_COLOR = "#1d9bf0";
const INACTIVE_COLOR = "#111827";

/* ==================== Composer Modal (Tweet) ==================== */
function ComposerModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;

  // Refs untuk fokus saat tap placeholder
  const inputRefDesktop = useRef<TextInput>(null);
  const inputRefMobile = useRef<TextInput>(null);

  // UI const
  const AVATAR_SIZE = 36;
  const AVATAR_GAP = 12;
  const BOX_PADDING = 10;
  const BOX_RADIUS = 10;
  const BOX_MIN_HEIGHT = 130;
  const SHEET_HEIGHT = Math.min(500, Math.max(400, Math.round(height * 0.58)));
  const MAX = 300;

  // Desktop constants for alignment (avatar-centered)
  const DESK_LINE_HEIGHT = 28;
  const DESKTOP_ALIGN_TOP = (AVATAR_SIZE - DESK_LINE_HEIGHT) / 2;

  // Mobile constants for alignment (avatar-centered)
  const MOBILE_LINE_HEIGHT = 22;
  const MOBILE_ALIGN_TOP = (AVATAR_SIZE - MOBILE_LINE_HEIGHT) / 2;

  const remaining = MAX - text.length;
  const canPost =
    (text.trim().length > 0 || images.length > 0) && remaining >= 0 && !posting;

  async function pickImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"] as any,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.8,
    });

    if (!res.canceled && "assets" in res) {
      const uris = res.assets.map((a: any) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 4));
    }
  }

  function removeImage(uri: string) {
    setImages((prev) => prev.filter((u) => u !== uri));
  }

  // --- helper deteksi ekstensi & mime dari uri ---
  function detectExtMime(uri: string) {
    const clean = uri.split("?")[0];
    const ext = (clean.split(".").pop() || "").toLowerCase();
    if (ext === "png") return { ext: "png", mime: "image/png" };
    if (ext === "webp") return { ext: "webp", mime: "image/webp" };
    if (ext === "heic" || ext === "heif") return { ext: "heic", mime: "image/heic" };
    return { ext: "jpg", mime: "image/jpeg" };
  }

  // ✅ stabil: FileSystem → Buffer(base64)
  async function uploadImage(uri: string) {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = Buffer.from(base64, "base64");

    const { ext, mime } = detectExtMime(uri);
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage
      .from("social-apps")
      .upload(filePath, bytes, { contentType: mime, upsert: false });

    if (error) throw error;

    const { data: pub } = supabase.storage.from("social-apps").getPublicUrl(filePath);
    return pub.publicUrl as string;
  }

  async function postNow() {
    if (!canPost) return;
    try {
      setPosting(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        Alert.alert("Butuh login", "Silakan login terlebih dahulu.");
        return;
      }

      let imageUrl: string | null = null;
      if (images.length > 0) imageUrl = await uploadImage(images[0]);

      const payload = {
        id: uuidv4(),
        user_id: user.id,
        email: user.email ?? "anon@local",
        content: text.trim(),
        image_url: imageUrl,
      } as const;

      const { error } = await supabase.from("postingan").insert(payload);
      if (error) throw error;

      setText("");
      setImages([]);
      onClose();
    } catch (e: any) {
      Alert.alert("Gagal memposting", e?.message ?? "Terjadi kesalahan.");
    } finally {
      setPosting(false);
    }
  }

  // ===== Desktop composer =====
  if (!isMobile) {
    const cardWidth = Math.min(700, width - 48);
    const extraLeftBias = 87;
    const marginLeft = Math.max(
      0,
      Math.floor((width - cardWidth) / 2) - extraLeftBias
    );

    return (
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />
        <View className="flex-1 justify-center p-4">
          <View style={{ width: cardWidth, marginLeft }} className="rounded-2xl bg-white shadow-lg">
            {/* header */}
            <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
              <TouchableOpacity onPress={onClose} className="rounded-full border border-gray-200 px-3 py-1">
                <Text className="text-[13px] text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!canPost}
                onPress={postNow}
                className={`rounded-full px-3.5 py-1.5 ${canPost ? "bg-sky-500" : "bg-sky-300"}`}
              >
                <Text className="text-white font-semibold">
                  {posting ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* body */}
            <View className="px-6 pb-6">
              <View className="flex-row items-start gap-3">
                <Image source={{ uri: "https://i.pravatar.cc/100?img=12" }} className="h-10 w-10 rounded-full" />
                <View className="flex-1 pr-2">
                  {/* Editor + placeholder custom */}
                  <View style={{ position: "relative" }}>
                    {text.length === 0 && (
                      <Pressable
                        onPress={() => inputRefDesktop.current?.focus()}
                        style={{ position: "absolute", left: 0, top: DESKTOP_ALIGN_TOP, paddingRight: 8, zIndex: 1 }}
                      >
                        <Text style={{ color: "#94a3b8", fontSize: 18, lineHeight: DESK_LINE_HEIGHT }}>
                          What's happening?
                        </Text>
                      </Pressable>
                    )}

                    <TextInput
                      ref={inputRefDesktop}
                      multiline
                      value={text}
                      onChangeText={setText}
                      placeholder=""
                      maxLength={MAX}
                      className="text-[18px] leading-7 text-gray-900 px-0 focus:outline-none"
                      style={{
                        minHeight: 160,
                        paddingTop: DESKTOP_ALIGN_TOP,
                        outlineStyle: "none" as any,
                        outlineWidth: 0,
                        outlineColor: "transparent",
                      }}
                      underlineColorAndroid="transparent"
                    />
                  </View>

                  {images.length > 0 && (
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {images.map((uri) => (
                        <View key={uri} className="relative">
                          <Image source={{ uri }} className="h-24 w-24 rounded-lg" />
                          <TouchableOpacity
                            onPress={() => removeImage(uri)}
                            className="absolute -right-2 -top-2 rounded-full bg-black/70 px-1"
                          >
                            <Text className="text-xs text-white">✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <View className="mt-6 h-px bg-[#E6ECF0]" />

                  {/* bar bawah */}
                  <View className="mt-3 flex-row items-center pr-1">
                    <View
                      style={{
                        marginLeft: -(AVATAR_SIZE + AVATAR_GAP),
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Ionicons name="image-outline" size={20} color={ACTIVE_COLOR} onPress={pickImages} />
                      <MaterialIcons name="gif" size={26} color={ACTIVE_COLOR} />
                    </View>
                    <View style={{ flex: 1 }} />
                    <Text className={`text-[12px] ${remaining < 0 ? "text-red-500" : "text-gray-500"}`}>
                      {remaining} Character left
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ===== Mobile composer =====
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="absolute inset-0 bg-black/40" />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: SHEET_HEIGHT,
          backgroundColor: "white",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 12,
        }}
      >
        {/* grabber */}
        <View
          style={{
            alignSelf: "center",
            width: 56,
            height: 4,
            borderRadius: 2,
            backgroundColor: "#E5E7EB",
            marginBottom: 10,
          }}
        />

        {/* bar atas */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <TouchableOpacity onPress={pickImages} activeOpacity={0.8} style={{ padding: 4 }}>
              <Ionicons name="image-outline" size={20} color={ACTIVE_COLOR} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}} activeOpacity={0.8} style={{ padding: 2 }}>
              <MaterialIcons name="gif" size={26} color={ACTIVE_COLOR} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} />
          <Text className={`text-[12px] ${remaining < 0 ? "text-red-500" : "text-gray-500"}`}>
            {remaining} Character left
          </Text>
        </View>

        {/* editor dalam kotak */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
            flex: 1,
            borderWidth: 1,
            borderColor: "#E6ECF0",
            borderRadius: BOX_RADIUS,
            padding: BOX_PADDING,
          }}
        >
          <Image
            source={{ uri: "https://i.pravatar.cc/100?img=12" }}
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: 999 }}
          />

          {/* RIGHT: input + placeholder */}
          <View style={{ flex: 1, paddingRight: 2, position: "relative" }}>
            {text.length === 0 && (
              <Pressable
                onPress={() => inputRefMobile.current?.focus()}
                style={{ position: "absolute", left: 0, top: MOBILE_ALIGN_TOP, paddingRight: 6, zIndex: 1 }}
              >
                <Text
                  style={{
                    color: "#94a3b8",
                    fontSize: 16,
                    lineHeight: MOBILE_LINE_HEIGHT,
                    includeFontPadding: false as any,
                  }}
                >
                  What's happening?
                </Text>
              </Pressable>
            )}

            <TextInput
              ref={inputRefMobile}
              multiline
              value={text}
              onChangeText={setText}
              placeholder=""
              maxLength={MAX}
              underlineColorAndroid="transparent"
              style={{
                minHeight: BOX_MIN_HEIGHT,
                fontSize: 16,
                lineHeight: MOBILE_LINE_HEIGHT,
                color: "#111827",
                paddingTop: MOBILE_ALIGN_TOP,
                paddingHorizontal: 0,
                textAlignVertical: "top" as any,
                outlineStyle: "none" as any,
                outlineWidth: 0,
                outlineColor: "transparent",
                includeFontPadding: false as any,
              }}
            />

            {images.length > 0 && (
              <View style={{ marginTop: 8, flexDirection: "row", flexWrap: "wrap", gap: 8 as any }}>
                {images.map((uri) => (
                  <View key={uri} style={{ position: "relative" }}>
                    <Image source={{ uri }} style={{ width: 88, height: 88, borderRadius: 10 }} />
                    <TouchableOpacity
                      onPress={() => removeImage(uri)}
                      style={{
                        position: "absolute",
                        right: -6,
                        top: -6,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        borderRadius: 999,
                        paddingHorizontal: 5,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* tombol post & cancel */}
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            disabled={!canPost}
            onPress={postNow}
            activeOpacity={0.9}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 999,
              backgroundColor: canPost ? ACTIVE_COLOR : "#9cd4fa",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>
              {posting ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.9}
            style={{
              marginTop: 10,
              width: "100%",
              height: 42,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#6b7280", fontWeight: "700" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/* ==================== Item Nav Sidebar (Desktop) ==================== */
function NavItem({
  href,
  label,
  renderIcon,
}: {
  href: string;
  label: string;
  renderIcon: (isActive: boolean, color: string) => React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/" && pathname === "/");
  const iconColor = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable onPress={() => router.push(href)} className="relative mb-1 rounded-full">
      <View className="flex-row items-center gap-4 px-5 py-3 pl-6">
        {renderIcon(isActive, iconColor)}
        <Text className={`text-[16px] font-bold ${isActive ? "text-sky-600" : "text-black"}`}>{label}</Text>
      </View>
    </Pressable>
  );
}

/* ==================== Header Helpers (Mobile) ==================== */
const AVATAR_URL = "https://i.pravatar.cc/100?img=12";
const HeaderAvatar = () => (
  <TouchableOpacity
    onPress={() => router.push("/account")}
    style={{ marginLeft: 14, borderRadius: 999, overflow: "hidden" }}
    activeOpacity={0.8}
  >
    <Image source={{ uri: AVATAR_URL }} style={{ width: 28, height: 28, borderRadius: 999 }} />
  </TouchableOpacity>
);

const HeaderLogo = () => <Ionicons name="logo-twitter" size={22} color={ACTIVE_COLOR} />;

/* ==================== Custom Tab Bar (Mobile) ==================== */
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "white" }}>
      <SafeAreaView edges={["bottom"]}>
        <View style={{ height: 58, flexDirection: "row" }}>
          {state.routes.slice(0, 4).map((route, index) => {
            const isFocused = state.index === index;
            const color = isFocused ? ACTIVE_COLOR : "#9ca3af";

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name as never);
            };

            let iconName: any = "home-outline";
            if (route.name === "index") iconName = isFocused ? "home" : "home-outline";
            else if (route.name === "search") iconName = isFocused ? "search" : "search-outline";
            else if (route.name === "notifications") iconName = isFocused ? "notifications" : "notifications-outline";
            else if (route.name === "message") iconName = isFocused ? "mail" : "mail-outline";

            return (
              <TouchableOpacity key={route.key} onPress={onPress} activeOpacity={0.8} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={iconName} size={26} color={color} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ==================== Right Sidebar (Desktop) ==================== */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: "white",
          borderRadius: 16,
          paddingVertical: 10,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 3,
          borderWidth: 1,
          borderColor: "#eef1f4",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f1419", paddingHorizontal: 14, paddingVertical: 6 }}>
      {title}
    </Text>
  );
}
function Divider() {
  return <View style={{ height: 1, backgroundColor: "#eef1f4" }} />;
}
function TrendingItem({
  cover,
  category,
  time,
  title,
  tag,
}: {
  cover: string;
  category: string;
  time: string;
  title: string;
  tag: string;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 12 }}>
      <Image source={{ uri: cover }} style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: "#f3f4f6" }} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#6b7280", fontSize: 12, marginBottom: 2 }}>
          {category} · {time}
        </Text>
        <Text numberOfLines={2} style={{ color: "#0f1419", fontSize: 14, fontWeight: "700" }}>
          {title}
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 2 }}>
          Trending with <Text style={{ color: ACTIVE_COLOR }}>{tag}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}
function FollowItem({ avatar, name, handle }: { avatar: string; name: string; handle: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12 }}>
      <Image source={{ uri: avatar }} style={{ width: 40, height: 40, borderRadius: 999 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f1419" }}>{name}</Text>
        <Text style={{ fontSize: 12, color: "#6b7280" }}>{handle}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        style={{ paddingHorizontal: 14, height: 34, borderRadius: 999, backgroundColor: "#0ea5e9", alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "white", fontWeight: "800", fontSize: 12 }}>Follow</Text>
      </TouchableOpacity>
    </View>
  );
}
function ShowMore() {
  return (
    <TouchableOpacity activeOpacity={0.8} style={{ padding: 14 }}>
      <Text style={{ color: ACTIVE_COLOR, fontWeight: "700", fontSize: 14 }}>Show more</Text>
    </TouchableOpacity>
  );
}
function RightSidebar() {
  return (
    <View style={{ flex: 1, paddingRight: 8 }}>
      {/* Search */}
      <View style={{ paddingHorizontal: 8, marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#f3f4f6",
            paddingHorizontal: 14,
            height: 40,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <MCI name="magnify" size={18} color="#6b7280" />
          <TextInput
            placeholder="Search Twitter"
            placeholderTextColor="#9ca3af"
            style={{
              flex: 1,
              fontSize: 14,
              color: "#111827",
              paddingVertical: 0,
              outlineStyle: "none" as any,
              outlineWidth: 0,
              outlineColor: "transparent",
            }}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>

      {/* What's happening */}
      <Card style={{ marginHorizontal: 8 }}>
        <SectionHeader title="What's happening" />
        <Divider />
        <TrendingItem
          cover="https://images.unsplash.com/photo-1581091870622-7b1c1ae7a9a5?q=80&w=300"
          category="COVID19"
          time="Last night"
          title="England’s Chief Medical Officer says the UK is at the most dangerous time of the pandemic"
          tag="#covid19"
        />
        <Divider />
        <TrendingItem
          cover="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=300"
          category="US news"
          time="4h ago"
          title="Parler may go offline following suspensions by Amazon, Apple and Google"
          tag="#trump"
        />
        <Divider />
        <TrendingItem
          cover="https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=300"
          category="India"
          time="1h ago"
          title="India vs Australia: India hold on to earn a draw on Day 5 in Sydney Test"
          tag="#sport"
        />
        <Divider />
        <ShowMore />
      </Card>

      {/* Who to follow */}
      <Card style={{ marginHorizontal: 8, marginTop: 14 }}>
        <SectionHeader title="Who to follow" />
        <Divider />
        <FollowItem avatar="https://i.pravatar.cc/100?img=32" name="Bessie Cooper" handle="@alessandrovrenovazi" />
        <Divider />
        <FollowItem avatar="https://i.pravatar.cc/100?img=47" name="Jenny Wilson" handle="@gabrielcantarin" />
        <Divider />
        <ShowMore />
      </Card>

      {/* Footer tiny links */}
      <View style={{ marginTop: 12, paddingHorizontal: 12 }}>
        <Text style={{ color: "#9ca3af", fontSize: 11, lineHeight: 16 }}>
          Terms of Service · Privacy Policy · Cookies Policy{"\n"}
          Ads info · More © 2025 Twitter, Inc.
        </Text>
      </View>
    </View>
  );
}

/* ==================== Mobile FAB ==================== */
function MobileFAB({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.select({ ios: "keyboardWillShow", android: "keyboardDidShow" })!,
      () => setVisible(false)
    );
    const hide = Keyboard.addListener(
      Platform.select({ ios: "keyboardWillHide", android: "keyboardDidHide" })!,
      () => setVisible(true)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!visible) return null;

  const pressIn = () =>
    Animated.timing(scale, { toValue: 0.96, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true });
  const pressOut = () =>
    Animated.timing(scale, { toValue: 1, duration: 120, easing: Easing.out(Easing.back(2)), useNativeDriver: true });

  const SIZE = 60;
  const GAP = 16;

  return (
    <Animated.View style={{ position: "absolute", right: GAP, bottom: (insets.bottom || 0) + 56 + GAP, transform: [{ scale }] }}>
      <View
        pointerEvents="none"
        style={{ position: "absolute", right: -6, top: SIZE / 2 - 12, width: 8, height: 24, borderRadius: 8, backgroundColor: "#ff3db8", opacity: 0.9 }}
      />
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(255,255,255,0.25)", borderless: false }}
        style={{
          height: SIZE,
          width: SIZE,
          borderRadius: 999,
          backgroundColor: ACTIVE_COLOR,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.18,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
        accessibilityRole="button"
        accessibilityLabel="Tulis posting baru"
      >
        <Svg width={38} height={38} viewBox="0 0 30 30">
          <G transform="translate(8.6,8.6)">
            <Line x1="0" y1="0" x2="0" y2="8.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <Line x1="-4.1" y1="4.1" x2="4.1" y2="4.1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </G>
          <G transform="translate(6,5) rotate(-18 9 9) scale(1.28)">
            <Path d="M 3 14 Q 9 6, 18 5 Q 13 9, 9 14 Q 6 17, 3 14 Z" fill="#fff" />
            <Path d="M 6 14 Q 10 10, 16 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
            <Path d="M 3 14 L 1.5 17.2 L 4.3 15.7 Z" fill="#fff" />
          </G>
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

/* ==================== Layout ==================== */
export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [composerOpen, setComposerOpen] = useState(false);

  if (isDesktop) {
    return (
      <View className="flex flex-row justify-center bg-white">
        {/* LEFT SIDEBAR */}
        <View className="h-screen w-[18%] px-3 py-4">
          <View className="mb-6 px-5">
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-twitter" size={34} color={ACTIVE_COLOR} />
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <NavItem href="/" label="Home" renderIcon={(a, c) => <Ionicons name={a ? "home" : "home-outline"} size={24} color={c} />} />
            <NavItem href="/search" label="Explore" renderIcon={(_a, c) => <Feather name="hash" size={24} color={c} />} />
            <NavItem href="/notifications" label="Notifications" renderIcon={(a, c) => <MCI name={a ? "bell" : "bell-outline"} size={24} color={c} />} />
            <NavItem href="/message" label="Messages" renderIcon={(a, c) => <MCI name={a ? "email" : "email-outline"} size={24} color={c} />} />
            <NavItem href="/bookmarks" label="Bookmarks" renderIcon={(a, c) => <MCI name={a ? "bookmark" : "bookmark-outline"} size={24} color={c} />} />
            <NavItem href="/lists" label="Lists" renderIcon={(a, c) => <MCI name={a ? "text-box" : "text-box-outline"} size={24} color={c} />} />
            <NavItem href="/account" label="Profile" renderIcon={(a, c) => <MCI name={a ? "account" : "account-outline"} size={24} color={c} />} />
            <NavItem
              href="/more"
              label="More"
              renderIcon={(a, c) => <MCI name={a ? "dots-horizontal-circle" : "dots-horizontal-circle-outline"} size={24} color={c} />}
            />
          </ScrollView>

          {/* Tweet -> buka modal */}
          <TouchableOpacity onPress={() => setComposerOpen(true)} className="mt-3 rounded-full bg-sky-500 py-3 px-4 active:opacity-90">
            <Text className="text-center text-base font-semibold text-white">Tweet</Text>
          </TouchableOpacity>

          <View className="mt-6 flex-row items-center gap-3 rounded-2xl px-3 py-2">
            <Image source={{ uri: "https://i.pravatar.cc/100?img=12" }} className="h-9 w-9 rounded-full" />
            <View className="flex-1">
              <Text className="text-[14px] font-semibold">Jerome Bell</Text>
              <Text className="text-xs text-gray-500">@afonesiocerinte</Text>
            </View>
            <MCI name="dots-horizontal" size={18} color="#6b7280" />
          </View>

          <ComposerModal open={composerOpen} onClose={() => setComposerOpen(false)} />
        </View>

        {/* CENTER */}
        <View className="mx-4 h-screen w-[44%] border-x border-gray-200">
          <View className="border-b border-[#E6ECF0]">
            <View className="flex-row items-center justify-between px-4 py-2.5">
              <Text className="text-[18px] font-extrabold text-black">Home</Text>
              <Ionicons name="sparkles-outline" size={18} color={ACTIVE_COLOR} />
            </View>
          </View>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </View>

        {/* RIGHT SIDEBAR */}
        <View className="h-screen w-[26%] py-4 pr-2">
          <RightSidebar />
        </View>
      </View>
    );
  }

  /* ==================== MOBILE: Tabs + FAB + Composer ==================== */
  return (
    <View className="flex-1 bg-white">
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "white" },
          headerTitleStyle: { fontWeight: "800", fontSize: 18, color: "#111827" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "",
            headerLeft: () => <HeaderAvatar />,
            headerTitle: () => <HeaderLogo />,
            headerRight: () => <Ionicons name="sparkles-outline" size={18} color={ACTIVE_COLOR} style={{ marginRight: 14 }} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Explore",
            headerLeft: () => <HeaderAvatar />,
            headerTitle: () => <HeaderLogo />,
            headerRight: () => <Ionicons name="sparkles-outline" size={18} color={ACTIVE_COLOR} style={{ marginRight: 14 }} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            headerLeft: () => <HeaderAvatar />,
            headerTitle: () => <HeaderLogo />,
            headerRight: () => <Ionicons name="sparkles-outline" size={18} color={ACTIVE_COLOR} style={{ marginRight: 14 }} />,
          }}
        />
        <Tabs.Screen
          name="message"
          options={{
            title: "Messages",
            headerLeft: () => <HeaderAvatar />,
            headerTitle: () => <HeaderLogo />,
            headerRight: () => <Ionicons name="sparkles-outline" size={18} color={ACTIVE_COLOR} style={{ marginRight: 14 }} />,
          }}
        />
        <Tabs.Screen name="account" options={{ tabBarButton: () => null, headerShown: false }} />
      </Tabs>

      {/* FAB compose */}
      <MobileFAB onPress={() => setComposerOpen(true)} />

      {/* Modal composer */}
      <ComposerModal open={composerOpen} onClose={() => setComposerOpen(false)} />
    </View>
  );
}

import { Stack } from "expo-router";
import { TweetModalProvider } from "../context/TweetModalContext";

export default function RootLayout() {
    return(
        <TweetModalProvider>
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="edit-profile" options={{ title:"Edit Profile" }} />
        </Stack>
        </TweetModalProvider>
    )
}
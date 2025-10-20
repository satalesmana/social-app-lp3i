import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Account", headerShown: false }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{ title: "Edit Profile", presentation: "card" }}
      />
    </Stack>
  );
}

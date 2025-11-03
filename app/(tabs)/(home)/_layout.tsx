import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Home"}}
      />
      <Stack.Screen
        name="comments/[id]"
        options={{ title: "Comments", presentation: "card" }}
      />
    </Stack>
  );
}

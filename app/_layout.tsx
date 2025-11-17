import React from 'react';
import { Stack } from "expo-router";
import { Provider } from 'react-redux';
import { store } from '../store/store';

export default function RootLayout() {
    return(
        <Provider store={store}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="edit-profile" options={{ title:"Edit Profile" }} />
            </Stack>
        </Provider>
    )
}
import { View, Text } from "react-native";
import { useState, useEffect } from 'react'
import { router } from 'expo-router';
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function SplashScreen(){
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        }).catch((error) => {
            console.error("Error getting session:", error)
            router.replace("login")
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (!session) {
                router.replace("login")
            }else{
                router.replace("(tabs)/(home)")
            }
        })
    }, [])

    return(
        <View className='items-center justify-center flex-1 max-w-screen-sm mx-auto'>
            <Text>Welcome to the app!</Text>
        </View>
    )
}
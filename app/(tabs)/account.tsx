import { Button, View } from 'react-native'
import { supabase } from '../../lib/supabase';
import { router } from "expo-router"


export default function AccountPage(){
    const onSignOut=async()=>{
        const { error } = await supabase.auth.signOut({ scope: 'local' })

        if(!error){
            router.replace("login")
        }
    }

    return(
        <View>
            <Button 
                title='Sign Out'
                onPress={onSignOut}/>
        </View>
    )
}
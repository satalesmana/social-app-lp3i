import React, { useState } from 'react'
import {  StyleSheet, View, AppState } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { AlertDialog } from "./global/Alert"

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [alertTitle, setAlertTitile]= useState("")

  async function signInWithEmail() {
    try{
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error){
        throw new Error(error.message)
      }
    }catch(err){
      const msg = err?.message ? err.message : "message undefine";
      setAlertTitile("Error")
      setErrMsg(msg)
      setVisible(true)
      console.log('err', err)
    }finally{
      setLoading(false)
    }
  }

  async function signUpWithEmail() {
    try{
      setLoading(true)
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error){
        throw new Error(error.message)
      }

      if (!session){
        setAlertTitile("Info")
        setErrMsg('Please check your inbox for email verification!')
        setVisible(true)
      }
    }catch(err){
      const msg = err?.message ? err.message : "message undefine";
      setAlertTitile("Error")
      setErrMsg(msg)
      setVisible(true)
      console.log('err', err)
    }finally{
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign in" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
      </View>

      <AlertDialog
        visible={visible}
        title={alertTitle}
        message={errMsg}
        onClose={() => setVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
})
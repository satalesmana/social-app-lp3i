import React, { useState } from 'react';
import { StyleSheet, View, AppState, Button, TextInput } from 'react-native';
// Pastikan updateProfile di-import dari lib/supabase
import { supabase, updateProfile } from '../lib/supabase'; 
import { AlertDialog } from "./global/Alert";

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  async function signInWithEmail() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err: any) {
      const msg = err?.message ? err.message : "An unknown error occurred";
      setAlertTitle("Error");
      setErrMsg(msg);
      setVisible(true);
      console.log('err', err);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    try {
      setLoading(true);
      // Kita ambil 'user' dan 'session' dari dalam 'data'
      const { data: { user, session }, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Tarik data user sign up ke db kedua
      if (user) {
        await updateProfile(user.id, {
          email: user.email, // Mencantumkan email ke DB kedua
        });
      }

      if (!session) {
        setAlertTitle("Info");
        setErrMsg('Please check your inbox for email verification!');
        setVisible(true);
      }
    } catch (err: any) {
      const msg = err?.message ? err.message : "An unknown error occurred";
      setAlertTitle("Error");
      setErrMsg(msg);
      setVisible(true);
      console.log('err', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          style={styles.input} // Tambahkan style agar terlihat
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          style={styles.input} // Tambahkan style agar terlihat
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
  );
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  }
});
import React, { useState } from "react";
import { StyleSheet, View, AppState, Button, TextInput } from "react-native";
import { supabase } from "../lib/supabase";
import { AlertDialog } from "./global/Alert";

// Auto refresh session Supabase
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [alertTitle, setAlertTitle] = useState("");

  // --- Sign In ---
  async function signInWithEmail() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
    } catch (err: any) {
      const msg = err?.message || "Message undefined";
      setAlertTitle("Error");
      setErrMsg(msg);
      setVisible(true);
      console.log("err", err);
    } finally {
      setLoading(false);
    }
  }

  // --- Sign Up ---
  async function signUpWithEmail() {
    try {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (!session) {
        setAlertTitle("Info");
        setErrMsg("Please check your inbox for email verification!");
        setVisible(true);
      }
    } catch (err: any) {
      const msg = err?.message || "Message undefined";
      setAlertTitle("Error");
      setErrMsg(msg);
      setVisible(true);
      console.log("err", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Input Email */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
      </View>

      {/* Input Password */}
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          placeholder="Password"
          autoCapitalize="none"
        />
      </View>

      {/* Sign In */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={signInWithEmail}
        />
      </View>

      {/* Sign Up */}
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={signUpWithEmail}
        />
      </View>

      {/* Alert Dialog */}
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
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});

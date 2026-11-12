import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { PawPrint, Mail, Lock, User as UserIcon, Sparkles } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Alex Morgan");
  const [username, setUsername] = useState("alex.morgan");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        router.replace("/(tabs)/");
      } else {
        await signup(name, email, username);
        router.replace("/onboarding");
      }
    } catch (e: any) {
      Alert.alert("Authentication Error", e.message || "Unable to authenticate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Branding Logo */}
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/icon.png")}
            style={{ width: 84, height: 84, borderRadius: 20, marginBottom: 12 }}
            resizeMode="cover"
          />
          <Text style={styles.logoTitle}>
            Animandler
          </Text>
          <Text style={styles.logoSub}>The premier video community for pets & pet parents</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === "login" && styles.tabBtnActive]}
            onPress={() => setMode("login")}
          >
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, mode === "signup" && styles.tabBtnActive]}
            onPress={() => setMode("signup")}
          >
            <Text style={[styles.tabText, mode === "signup" && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.formGroup}>
          {mode === "signup" && (
            <>
              <View style={styles.inputWrapper}>
                <UserIcon size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name (e.g. Alex Morgan)"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              <View style={styles.inputWrapper}>
                <UserIcon size={18} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Username (e.g. alex.morgan)"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </>
          )}

          <View style={styles.inputWrapper}>
            <Mail size={18} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={18} color="#64748b" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Sparkles size={18} color="#ffffff" />
          <Text style={styles.submitBtnText}>
            {loading ? "Authenticating..." : mode === "login" ? "Sign In to AnimalTok" : "Create Account"}
          </Text>
        </TouchableOpacity>

        {/* Quick Demo Login */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => {
            login("demo@animaltok.com", "demo123");
            router.replace("/(tabs)/");
          }}
        >
          <Text style={styles.demoBtnText}>⚡ Continue with Instant Demo Account</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#06b6d4",
    marginBottom: 10,
  },
  logoTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
  },
  logoSub: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: "#06b6d4",
  },
  tabText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  formGroup: {
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  input: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 10,
    fontSize: 14,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    height: 50,
    borderRadius: 25,
    marginBottom: 12,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  demoBtnText: {
    color: "#8b5cf6",
    fontSize: 13,
    fontWeight: "600",
  },
});

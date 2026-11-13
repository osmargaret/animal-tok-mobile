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
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PawPrint, Mail, Lock, User as UserIcon, Sparkles, Stethoscope, Store, ShieldCheck, Building } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(params.mode === "signup" ? "signup" : "login");
  const [accountType, setAccountType] = useState<"handler" | "vet" | "business">("handler");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [specialization, setSpecialization] = useState("");
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
        await signup(name, email, username, accountType, clinicName, specialization);
        router.replace("/(tabs)/profile");
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
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding Logo */}
          <View style={styles.logoBox}>
            <Image
              source={require("../assets/icon.png")}
              style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 8 }}
              resizeMode="cover"
            />
            <Text style={styles.logoTitle}>Animandler</Text>
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
                {/* Account Persona Selector */}
                <Text style={styles.personaLabel}>I am signing up as:</Text>
                <View style={styles.personaRow}>
                  <TouchableOpacity
                    style={[styles.personaPill, accountType === "handler" && styles.personaPillActive]}
                    onPress={() => setAccountType("handler")}
                  >
                    <PawPrint size={13} color={accountType === "handler" ? "#06b6d4" : "#94a3b8"} />
                    <Text style={[styles.personaText, accountType === "handler" && styles.personaTextActive]}>
                      Handler
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.personaPill, accountType === "vet" && styles.personaPillActive]}
                    onPress={() => setAccountType("vet")}
                  >
                    <Stethoscope size={13} color={accountType === "vet" ? "#06b6d4" : "#94a3b8"} />
                    <Text style={[styles.personaText, accountType === "vet" && styles.personaTextActive]}>
                      Veterinarian
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.personaPill, accountType === "business" && styles.personaPillActive]}
                    onPress={() => setAccountType("business")}
                  >
                    <Store size={13} color={accountType === "business" ? "#06b6d4" : "#94a3b8"} />
                    <Text style={[styles.personaText, accountType === "business" && styles.personaTextActive]}>
                      Business
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder={
                      accountType === "vet"
                        ? "Dr. Full Name (e.g. Dr. Emily Chen)"
                        : accountType === "business"
                        ? "Business Representative Name"
                        : "Full Name (e.g. Alex Morgan)"
                    }
                    placeholderTextColor="#64748b"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder="Username (e.g. alex.morgan)"
                    placeholderTextColor="#64748b"
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>

                {accountType === "vet" && (
                  <>
                    <View style={styles.inputWrapper}>
                      <Building size={16} color="#64748b" />
                      <TextInput
                        style={styles.input}
                        placeholder="Clinic / Hospital Name"
                        placeholderTextColor="#64748b"
                        value={clinicName}
                        onChangeText={setClinicName}
                      />
                    </View>
                    <View style={styles.inputWrapper}>
                      <Stethoscope size={16} color="#64748b" />
                      <TextInput
                        style={styles.input}
                        placeholder="Specialization (e.g. Surgery, Small Pets)"
                        placeholderTextColor="#64748b"
                        value={specialization}
                        onChangeText={setSpecialization}
                      />
                    </View>
                  </>
                )}

                {accountType === "business" && (
                  <View style={styles.inputWrapper}>
                    <Building size={16} color="#64748b" />
                    <TextInput
                      style={styles.input}
                      placeholder="Business / Brand Name (e.g. Pawsome Treats)"
                      placeholderTextColor="#64748b"
                      value={clinicName}
                      onChangeText={setClinicName}
                    />
                  </View>
                )}
              </>
            )}

            <View style={styles.inputWrapper}>
              <Mail size={16} color="#64748b" />
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
              <Lock size={16} color="#64748b" />
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
            <Sparkles size={16} color="#ffffff" />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: "center",
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  logoSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 3,
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: "#06b6d4",
  },
  tabText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  personaLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  personaRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  personaPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  personaPillActive: {
    backgroundColor: "rgba(6, 182, 212, 0.15)",
    borderColor: "#06b6d4",
  },
  personaText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  personaTextActive: {
    color: "#06b6d4",
    fontWeight: "700",
  },
  formGroup: {
    gap: 10,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  input: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 13.5,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#06b6d4",
    height: 48,
    borderRadius: 24,
    marginBottom: 10,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  demoBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  demoBtnText: {
    color: "#a855f7",
    fontSize: 12.5,
    fontWeight: "600",
  },
});

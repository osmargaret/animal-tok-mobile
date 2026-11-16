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
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PawPrint, Mail, Lock, User as UserIcon, Sparkles, X, KeyRound, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(params.mode === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    if (mode === "signup") {
      if (!name.trim()) {
        Alert.alert("Missing Name", "Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Weak Password", "Password must be at least 6 characters long.");
        return;
      }
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password.trim());
        router.replace("/(tabs)/");
      } else {
        const cleanBase = name.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        const autoUsername = cleanBase
          ? `@${cleanBase}`
          : `@user${Math.floor(1000 + Math.random() * 9000)}`;

        await signup(name.trim(), email.trim(), autoUsername, "handler", undefined, undefined, password.trim());
        router.replace("/(tabs)/profile");
      }
    } catch (e: any) {
      Alert.alert("Authentication Failed", e.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP to email
  const handleRequestOtp = async () => {
    if (!resetEmail.trim() || !resetEmail.includes("@")) {
      Alert.alert("Valid Email Required", "Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    try {
      await api.forgotPassword(resetEmail.trim());
      Alert.alert("Code Sent! 📬", `We've sent a 6-digit verification code to ${resetEmail.trim()}. Please check your inbox.`);
      setForgotStep(2);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to send verification code. Please make sure the email is registered.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!resetOtp.trim() || resetOtp.trim().length !== 6) {
      Alert.alert("Invalid Code", "Please enter the full 6-digit verification code sent to your email.");
      return;
    }
    setForgotLoading(true);
    try {
      await api.verifyOtp(resetEmail.trim(), resetOtp.trim());
      setForgotStep(3);
    } catch (e: any) {
      Alert.alert("Verification Failed", e.message || "Invalid or expired code. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert("Password Too Short", "Your new password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match. Please re-enter.");
      return;
    }
    setForgotLoading(true);
    try {
      await api.resetPassword(resetEmail.trim(), resetOtp.trim(), newPassword.trim());
      Alert.alert("Success! 🎉", "Your password has been reset successfully! Please log in with your new password.");
      setEmail(resetEmail.trim());
      setPassword("");
      setForgotModalVisible(false);
      setForgotStep(1);
      setResetOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (e: any) {
      Alert.alert("Reset Error", e.message || "Could not reset password. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setForgotStep(1);
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
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
              <View style={styles.inputWrapper}>
                <UserIcon size={16} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name (e.g. Alex Morgan)"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                />
              </View>
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
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {mode === "login" && (
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => {
                  setResetEmail(email.trim());
                  setForgotStep(1);
                  setForgotModalVisible(true);
                }}
              >
                <Text style={styles.forgotBtnText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Sparkles size={16} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  {mode === "login" ? "Sign In to Animandler" : "Create Account"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick Demo Login */}
          <TouchableOpacity
            style={styles.demoBtn}
            onPress={async () => {
              try {
                await login("demo@animaltok.com", "demo123");
                router.replace("/(tabs)/");
              } catch (e: any) {
                Alert.alert("Demo Account Notice", e.message || "Please register your account to continue.");
              }
            }}
          >
            <Text style={styles.demoBtnText}>⚡ Continue with Instant Demo Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeForgotModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <KeyRound size={20} color="#06b6d4" />
                <Text style={styles.modalTitle}>
                  {forgotStep === 1
                    ? "Reset Password"
                    : forgotStep === 2
                    ? "Verify Code"
                    : "Create New Password"}
                </Text>
              </View>
              <TouchableOpacity onPress={closeForgotModal} style={styles.closeBtn}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Step Indicators */}
            <View style={styles.stepRow}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.stepBar,
                    forgotStep >= s && styles.stepBarActive,
                  ]}
                />
              ))}
            </View>

            {/* Step 1: Request OTP */}
            {forgotStep === 1 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Enter your registered email address. We'll send you a 6-digit verification code to reset your password.
                </Text>
                <View style={styles.modalInputWrapper}>
                  <Mail size={16} color="#64748b" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748b"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.modalActionBtn, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleRequestOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.modalActionText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Verify Code */}
            {forgotStep === 2 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Enter the 6-digit code sent to <Text style={{ color: "#06b6d4", fontWeight: "bold" }}>{resetEmail}</Text>:
                </Text>
                <View style={styles.modalInputWrapper}>
                  <KeyRound size={16} color="#64748b" />
                  <TextInput
                    style={[styles.modalInput, { letterSpacing: 6, fontSize: 18, fontWeight: "bold" }]}
                    placeholder="123456"
                    placeholderTextColor="#64748b"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={resetOtp}
                    onChangeText={setResetOtp}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.modalActionBtn, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleVerifyOtp}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.modalActionText}>Verify Code</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={handleRequestOtp}
                  disabled={forgotLoading}
                >
                  <Text style={styles.resendBtnText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: Set New Password */}
            {forgotStep === 3 && (
              <View style={styles.modalBody}>
                <Text style={styles.modalDesc}>
                  Enter a strong new password for your Animandler account.
                </Text>
                <View style={styles.modalInputWrapper}>
                  <Lock size={16} color="#64748b" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="New password (min 6 chars)"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>
                <View style={styles.modalInputWrapper}>
                  <Lock size={16} color="#64748b" />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Confirm new password"
                    placeholderTextColor="#64748b"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.modalActionBtn, forgotLoading && { opacity: 0.6 }]}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.modalActionText}>Set New Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  forgotBtnText: {
    color: "#06b6d4",
    fontSize: 12.5,
    fontWeight: "600",
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#161b22",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  stepRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#21262d",
  },
  stepBarActive: {
    backgroundColor: "#06b6d4",
  },
  modalBody: {
    gap: 12,
  },
  modalDesc: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 19,
  },
  modalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d1117",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  modalInput: {
    flex: 1,
    color: "#ffffff",
    marginLeft: 8,
    fontSize: 14,
  },
  modalActionBtn: {
    backgroundColor: "#06b6d4",
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  modalActionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resendBtnText: {
    color: "#06b6d4",
    fontSize: 12.5,
  },
});

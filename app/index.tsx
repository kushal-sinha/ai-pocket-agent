import Colors from "@/shared/Colors";
import { useAuth, useSSO, useUser } from "@clerk/clerk-expo";
import * as AuthSession from 'expo-auth-session';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import LottieView from "lottie-react-native";
import { useCallback, useEffect } from "react";
import { Dimensions, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Logic to warm up the browser goes here
    void WebBrowser.warmUpAsync();
    return () => {
      // Logic to cool down the browser goes here
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

WebBrowser.maybeCompleteAuthSession();


export default function Index() {

  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { user } = useUser();
  console.log(user?.primaryEmailAddress?.emailAddress);

  useEffect(() => {
    if (isSignedIn) {
      // redirect to home screen
    }
  }, [isSignedIn])


  useWarmUpBrowser()

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO()
  const onLoginPress = useCallback(async () => {
    try {
      console.log("Starting Google login…");

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({ scheme: "aipocketagent" }),
      });

      console.log("SSO response:", createdSessionId);

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.push("/");
      } else {
        console.log("No session created, missing MFA or other requirements.");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  }, []);

  return (
    <LinearGradient
      colors={["#0A1D37", "#1E3C72", "#2A5298"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />

        <View style={styles.animationWrapper}>
          <LinearGradient
            colors={["#5B86E5", "#36D1DC"]}
            style={styles.glowCircle}
          >
            <LottieView
              source={require("../assets/images/login_lottie.json")}
              autoPlay
              loop
              style={styles.animation}
            />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Welcome to AI Pocket Agent!</Text>

        <Text style={styles.subtitle}>
          Your ultimate AI Personal Agent to make life easier.{"\n"}
          Try it today, completely free!
        </Text>

        <TouchableOpacity onPress={onLoginPress} activeOpacity={0.8} style={styles.buttonWrapper}>
          <LinearGradient
            colors={["#36D1DC", "#5B86E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 30 : 40,
  },
  animationWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  glowCircle: {
    width: Dimensions.get("screen").width * 0.7,
    height: Dimensions.get("screen").width * 0.7,
    borderRadius: Dimensions.get("screen").width * 0.35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#36D1DC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 15,
  },
  animation: {
    width: Dimensions.get("screen").width * 0.55,
    height: Dimensions.get("screen").width * 0.55,
  },
  title: {
    flex: 1,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: Colors.WHITE,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#D6E6F2",
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  button: {
    padding: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.WHITE,
  },
});

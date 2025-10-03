import Colors from "@/shared/Colors";
import LottieView from "lottie-react-native";
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth, useSSO, useUser } from "@clerk/clerk-expo";
import { useCallback, useEffect } from "react";
import * as WebBrowser from 'expo-web-browser';
import { router, useRouter } from "expo-router";
import * as AuthSession from 'expo-auth-session';

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
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({
          session: createdSessionId,
          // Check for session tasks and navigate to custom UI to help users resolve them
          // See https://clerk.com/docs/guides/development/custom-flows/overview#session-tasks
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log(session?.currentTask)
              router.push('/sign-in/tasks')
              return
            }

            router.push('/')
          },
        })
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // See https://clerk.com/docs/guides/development/custom-flows/authentication/oauth-connections#handle-missing-requirements
      }
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])
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

import { Dimensions, Text, Platform, StyleSheet, Button, View } from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/shared/Colors";

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <LottieView
        source={require("../assets/images/login_lottie.json")}
        autoPlay
        loop
        style={styles.animation}
      />
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: Colors.PRIMARY }}>Welcome to AI Pocket Agent!</Text>
      <Text style={{ fontSize: 18, textAlign: 'center', color: Colors.GREY }}>Your ultimate AI Personal Agent to make life easier
        Try it today, Completely Free!</Text>

      <View style={{ width: '100%', padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 12, marginTop: 30 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: Colors.WHITE }}>Get Started</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,

    paddingTop: Platform.OS === "android" ? 30 : 40,
  },
  animation: {
    width: Dimensions.get("screen").width * 0.9,
    height: 280,
    marginTop: 50
  },
});
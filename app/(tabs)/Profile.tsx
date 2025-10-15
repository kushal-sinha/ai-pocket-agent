import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Linking
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { fireStoreDb } from "@/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { user } = useUser();
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState<string>("https://randomuser.me/api/portraits/men/75.jpg");
    const [email, setEmail] = useState<string>("");

    const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const ensureMediaPermission = useCallback(async (): Promise<boolean> => {
        const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (existing.granted) return true;

        const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (requested.granted) return true;

        if (!requested.canAskAgain) {
            Alert.alert(
                "Permission required",
                "Enable Photos permission in Settings.",
                [{ text: "Open Settings", onPress: () => Linking.openSettings?.() }]
            );
        } else {
            Alert.alert("Permission required", "We need access to your photos.");
        }
        return false;
    }, []);

    const onPressChangePhoto = useCallback(async () => {
        try {
            if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
                Alert.alert("Cloudinary not configured");
                return;
            }

            const ok = await ensureMediaPermission();
            if (!ok) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.9,
            });

            if (result.canceled || !result.assets?.length) return;

            const asset = result.assets[0];
            const uri = asset.uri;

            setProfileImage(uri);
            setUploading(true);

            const formData = new FormData();
            const fileName = asset.fileName || `profile_${Date.now()}.jpg`;
            const mimeType = asset.mimeType || "image/jpeg";

            formData.append("file", { uri, type: mimeType, name: fileName } as any);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
            const res = await fetch(uploadUrl, { method: "POST", body: formData });
            const data = await res.json();
            if (data.secure_url) setProfileImage(data.secure_url);
        } catch (e: any) {
            Alert.alert("Upload error", e?.message || "Could not upload image");
        } finally {
            setUploading(false);
        }
    }, [CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, ensureMediaPermission]);

    useEffect(() => {
        const fetchEmail = async () => {
            if (!user?.id) return;
            const ref = doc(fireStoreDb, "users", user.id);
            const snap = await getDoc(ref);
            const data = snap.exists() ? (snap.data() as any) : null;
            const emailFromDb = data?.email;
            const fallback = user.primaryEmailAddress?.emailAddress || "";
            setEmail(emailFromDb || fallback || "");
        };
        fetchEmail();
    }, [user?.id]);

    return (
        <LinearGradient
            colors={["#141E30", "#243B55"]}
            style={styles.gradientBackground}
        >
            <ScrollView contentContainerStyle={styles.container}>
                {/* Profile Card */}
                <View style={styles.glassCard}>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    <TouchableOpacity style={styles.changePhotoBtn} onPress={onPressChangePhoto}>
                        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.changePhotoText}>Change</Text>}
                    </TouchableOpacity>
                    <Text style={styles.nameText}>{user?.fullName || "User"}</Text>
                    <Text style={styles.emailText}>{email}</Text>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    {["Create Agent", "Explore", "My History", "Logout"].map((item, index) => (
                        <LinearGradient
                            key={index}
                            colors={["#5B86E5", "#36D1DC"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.menuButton}
                        >
                            <TouchableOpacity
                                onPress={async () => {
                                    if (item === "Create Agent") router.push("/create-agent");
                                    else if (item === "Explore") router.push("/(tabs)/Explore");
                                    else if (item === "My History") router.push("/(tabs)/History");
                                    else if (item === "Logout") {
                                        await signOut();
                                        router.replace("/");
                                    }
                                }}
                                style={styles.menuButtonInner}
                            >
                                <Text style={styles.menuText}>{item}</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    ))}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
    container: {
        alignItems: "center",
        paddingVertical: 50,
    },
    glassCard: {
        width: "90%",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 20,
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        backdropFilter: "blur(10px)",
    },
    profileImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.6)",
        marginBottom: 15,
    },
    changePhotoBtn: {
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 10,
    },
    changePhotoText: {
        color: "#fff",
        fontWeight: "600",
    },
    nameText: {
        fontSize: 20,
        color: "#fff",
        fontWeight: "700",
    },
    emailText: {
        fontSize: 14,
        color: "rgba(255,255,255,0.7)",
        marginTop: 4,
    },
    menuSection: {
        width: "90%",
    },
    menuButton: {
        borderRadius: 14,
        marginVertical: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    menuButtonInner: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    menuText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 0.5,
    },
});

// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDAaoD3NiAN3KsR9ixCa0FyqOOU4eCt-hg",
    authDomain: "aihub-28052.firebaseapp.com",
    projectId: "aihub-28052",
    storageBucket: "aihub-28052.firebasestorage.app",
    messagingSenderId: "121304665721",
    appId: "1:121304665721:web:00f66dddbc46b267fe8ea8",
    measurementId: "G-7XX3PS8WQV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const fireStoreDb = getFirestore(app);
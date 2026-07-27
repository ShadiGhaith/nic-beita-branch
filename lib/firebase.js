// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-s-kIyhyHkvNXbHekCsfskKetG-RRnTM",
  authDomain: "nic-beita.firebaseapp.com",
  projectId: "nic-beita",
  storageBucket: "nic-beita.firebasestorage.app",
  messagingSenderId: "520181014477",
  appId: "1:520181014477:web:2a8d4f2ba1e528b0542e84",
  measurementId: "G-7NHVYZ0C7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase config (copied from console)
const firebaseConfig = {
  apiKey: "AIzaSyCvhQ1WFvYOMBizqp-N56kinT_whirLoh0",
  authDomain: "realestate-f4f32.firebaseapp.com",
  projectId: "realestate-f4f32",
  storageBucket: "realestate-f4f32.firebasestorage.app",
  messagingSenderId: "337517718325",
  appId: "1:337517718325:web:8178e022c7c44754b5fa7c",
  measurementId: "G-4FJ54R7GSN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth
export const auth = getAuth(app);

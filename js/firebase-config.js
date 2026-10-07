import{initializeApp}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import{getAuth}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import{getFirestore}from"https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const cfg={
  apiKey: "AIzaSyDqRtLoMvNt3y3e2tqnGMYuuxIz3tKYgGQ",
  authDomain: "class-update-5309e.firebaseapp.com",
  projectId: "class-update-5309e",
  storageBucket: "class-update-5309e.firebasestorage.app",
  messagingSenderId: "836831707691",
  appId: "1:836831707691:web:706c1be3e189dfa889206e",
};

const app=initializeApp(cfg);
export const auth=getAuth(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFPeY0UtXdPhyqnO2Rp9--crBwlsNlePk",
  authDomain: "districtos-d5293.firebaseapp.com",
  projectId: "districtos-d5293",
  storageBucket: "districtos-d5293.firebasestorage.app",
  messagingSenderId: "697857133584",
  appId: "1:697857133584:web:839ab551c3554f3e394e95"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

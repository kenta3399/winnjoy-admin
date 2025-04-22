// pages/_app.js

import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function App({ Component, pageProps }) {
  const [menus, setMenus] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const emailPrefix = u.email.split("@")[0];
        setUser({ email: u.email, username: emailPrefix });
      }
    });

    loadMenus();

    return () => unsub();
  }, []);

  const loadMenus = async () => {
    const snapshot = await getDocs(collection(db, "menus"));
    const all = [];
    snapshot.forEach((doc) => all.push({ id: doc.id, ...doc.data() }));
    setMenus(all);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: 220, background: "#f4f4f4", padding: 20 }}>
        <h3>เมนู</h3>
        {menus.map((menu, index) => (
          <div key={index}>📌 {menu.name}</div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <Component {...pageProps} user={user} menus={menus} />
      </div>
    </div>
  );
}

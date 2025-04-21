import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBYFOEq8BHaZalIxz1x6DVzjBNt1JjFYnM",
  authDomain: "winnjoy-admin.firebaseapp.com",
  projectId: "winnjoy-admin",
  storageBucket: "winnjoy-admin.appspot.com",
  messagingSenderId: "999732827140",
  appId: "1:999732827140:web:83693c5f373bb790d2d151",
  measurementId: "G-1836QJLX1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const allowedUsers = [
  'jodigame4@gmail.com'
];

export default function Home() {
  const [user, setUser] = useState(null);

  const allowEmails = [
    "kenta@winnjoy.com",
    "admin@soza.com",
    "jodigame4@gmail.com"
  ];

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = result.user;

      if (!allowEmails.includes(userData.email)) {
        alert("⛔ คุณไม่มีสิทธิ์เข้าใช้งานระบบนี้");
        await signOut(auth);
        return;
      }

      setUser(userData);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {user ? (
        <>
          <h1>🎉 ยินดีต้อนรับ {user.displayName}</h1>
          <p>เข้าสู่ระบบด้วย: {user.email}</p>
          <button onClick={logout}>ออกจากระบบ</button>
        </>
      ) : (
        <>
          <h1>🔐 เข้าสู่ระบบแอดมิน</h1>
          <button onClick={login}>ล็อกอินด้วย Google</button>
        </>
      )}
    </div>
  );
}

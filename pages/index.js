import { useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

// ✅ firebaseConfig ที่ใช้งานจริงของเคนตะ
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
const auth = getAuth(app);
const db = getFirestore(app);

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login"); // login / register

  const fakeEmail = `${username}@local.fake`;

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const userData = result.user;

      // ✅ ตรวจสอบสิทธิ์ approved
      const ref = doc(db, "users", userData.uid);
      const snap = await getDoc(ref);

      if (!snap.exists() || snap.data().approved !== true) {
        alert("❌ บัญชียังไม่ได้รับการอนุมัติจากผู้ดูแลระบบ");
        await signOut(auth);
        return;
      }

      setUser(userData);
    } catch (err) {
      alert("เข้าสู่ระบบไม่สำเร็จ: " + err.message);
    }
  };

  const register = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      const userData = result.user;

      await setDoc(doc(db, "users", userData.uid), {
        username,
        email: userData.email,
        approved: false
      });

      alert("✅ สมัครสำเร็จ! กรุณารอแอดมินอนุมัติ");
      await signOut(auth);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("สมัครไม่สำเร็จ: " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? (
        <>
          <h1>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h1>
          <input
            type="text"
            placeholder="ชื่อผู้ใช้ (เช่น Admin1)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: "block", marginBottom: "1rem", padding: "0.5rem" }}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", marginBottom: "1rem", padding: "0.5rem" }}
          />
          <button onClick={mode === "login" ? login : register}>
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
          <p style={{ marginTop: "1rem" }}>
            {mode === "login" ? (
              <>
                ยังไม่มีบัญชี?{" "}
                <a href="#" onClick={() => setMode("register")}>สมัครสมาชิก</a>
              </>
            ) : (
              <>
                มีบัญชีแล้ว?{" "}
                <a href="#" onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <h2>🎉 ยินดีต้อนรับ {user.email.split("@")[0]}</h2>
          <p>เข้าสู่ระบบสำเร็จ</p>
        </>
      )}
    </div>
  );
}

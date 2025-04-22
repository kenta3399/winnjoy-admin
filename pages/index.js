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
            placeholder="ชื่อผู้ใช้ (เช่น kenta)"
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

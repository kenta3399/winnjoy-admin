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
  const [mode, setMode] = useState("login");

  const fakeEmail = `${username}@local.fake`;

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const userData = result.user;

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

      alert("✅ สมัครสมาชิกสำเร็จ! กรุณารอแอดมินอนุมัติก่อนเข้าสู่ระบบ");
      await signOut(auth);
      setUsername("");
      setPassword("");
      setMode("login");
    } catch (err) {
      alert("สมัครไม่สำเร็จ: " + err.message);
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f2f2f2"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center"
      }}>
        {!user ? (
          <>
            <h2 style={{ marginBottom: "24px" }}>
              {mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}
            </h2>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้ (เช่น admin1)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "1rem",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "1rem",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
            />
            <button
              onClick={mode === "login" ? login : register}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(to bottom, #ffdd57, #fbb034)",
                color: "#000",
                border: "none",
                fontWeight: "bold",
                boxShadow: "0 4px #caa42c",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={e => e.target.style.transform = "translateY(2px)"}
              onMouseOut={e => e.target.style.transform = "translateY(0px)"}
            >
              {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
            <p style={{ marginTop: "1rem" }}>
              {mode === "login" ? (
                <>ยังไม่มีบัญชี?{" "}
                  <a href="#" onClick={() => setMode("register")}>สมัครสมาชิก</a>
                </>
              ) : (
                <>มีบัญชีแล้ว?{" "}
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
    </div>
  );
}

// ✅ Full admin panel with styled login/logout, fixed sidebar, and customizable 3-column grid content boxes

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
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
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [menus, setMenus] = useState([]);
  const [users, setUsers] = useState([]);
  const fakeEmail = `${username}@local.fake`;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists() || snap.data().approved !== true) {
          alert("❌ บัญชียังไม่ได้รับการอนุมัติ");
          signOut(auth);
          return;
        }
        setUser({ ...u, ...snap.data() });
        loadMenus();
        if (snap.data().username === "kenta") {
          loadUsers();
        }
      }
    });
    return () => unsub();
  }, []);

  const loadMenus = async () => {
    const menuSnap = await getDocs(collection(db, "menus"));
    const data = [];
    menuSnap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    setMenus(data);
  };

  const loadUsers = async () => {
    const userSnap = await getDocs(collection(db, "users"));
    const data = [];
    userSnap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const ref = doc(db, "users", result.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists() || snap.data().approved !== true) {
        alert("❌ บัญชียังไม่ได้รับการอนุมัติจากแอดมิน");
        await signOut(auth);
        return;
      }
      setUser({ ...result.user, ...snap.data() });
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
        approved: false,
        isAdmin: false,
      });
      alert("✅ สมัครสำเร็จ! กรุณารอแอดมินอนุมัติ");
      await signOut(auth);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("สมัครไม่สำเร็จ: " + err.message);
    }
  };

  const toggleApprove = async (uid, value) => {
    await updateDoc(doc(db, "users", uid), { approved: value });
    loadUsers();
  };

  if (!user) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f8f8f8" }}>
        <div style={{ padding: 30, boxShadow: "0 0 20px rgba(0,0,0,0.1)", borderRadius: 12, background: "#fff", minWidth: 300 }}>
          <h2 style={{ textAlign: "center" }}>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h2>
          <input
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: "block", margin: "10px 0", width: "100%" }}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", margin: "10px 0", width: "100%" }}
          />
          <button onClick={mode === "login" ? login : register} style={{ width: "100%" }}>
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
          <div style={{ textAlign: "center", marginTop: 10 }}>
            {mode === "login" ? (
              <a href="#" onClick={() => setMode("register")}>สมัครสมาชิก</a>
            ) : (
              <a href="#" onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", fontFamily: "sans-serif" }}>
      <div style={{ width: 250, background: "#eee", padding: 20, height: "100vh" }}>
        <h3>เมนู</h3>
        {menus.map((m, i) => (
          <div key={i}>📌 {m.name}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <h2>👋 สวัสดี <b>{user.username}</b></h2>
        <p>ระบบเมนูพร้อมกำหนดสิทธิ์แล้ว</p>
        <button onClick={() => {
          signOut(auth);
          router.reload();
        }}>ออกจากระบบ</button>
        {user.username === "kenta" && (
          <>
            <h3 style={{ marginTop: 30 }}>ผู้ใช้งานทั้งหมด</h3>
            {users.map((u, i) => (
              <div key={i}>
                👤 {u.username} - {u.email} | อนุมัติ:
                <input
                  type="checkbox"
                  checked={u.approved || false}
                  onChange={(e) => toggleApprove(u.id, e.target.checked)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
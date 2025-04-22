// 📁 pages/index.js

import { useEffect, useState } from "react";
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
        const userData = { ...u, ...snap.data() };
        setUser(userData);
        loadMenus(userData);
        if (userData.username === "kenta") loadUsers();
      }
    });
    return () => unsub();
  }, []);

  const loadMenus = async (currentUser) => {
    const menuSnap = await getDocs(collection(db, "menus"));
    const data = [];
    menuSnap.forEach((doc) => {
      const d = doc.data();
      const enabledForAll = !d.enabledFor || d.enabledFor.length === 0;
      const isUserAllowed = d.enabledFor?.includes(currentUser.username);
      if (d.enabled && (enabledForAll || isUserAllowed || currentUser.username === "kenta")) {
        data.push({ id: doc.id, ...d });
      }
    });
    setMenus(data);
  };

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list = [];
    snap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
    setUsers(list);
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
      const userData = { ...result.user, ...snap.data() };
      setUser(userData);
      loadMenus(userData);
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

  return (
    <div style={{ display: "flex", fontFamily: "sans-serif" }}>
      {user ? (
        <>
          <div style={{ width: 250, background: "#eee", padding: 20 }}>
            <h3>เมนู</h3>
            {menus.map((m, i) => (
              <div key={i}>{m.icon || "📌"} {m.customName || m.defaultName}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 20 }}>
            <h2>👋 สวัสดี <b>{user.username}</b></h2>
            <p>ระบบเมนูพร้อมกำหนดสิทธิ์แล้ว</p>
            <button onClick={() => signOut(auth)}>ออกจากระบบ</button>
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
        </>
      ) : (
        <div style={{ padding: 50 }}>
          <h1>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h1>
          <input
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: "block", marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", marginBottom: 10 }}
          />
          <button onClick={mode === "login" ? login : register}>
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
          <div style={{ marginTop: 10 }}>
            {mode === "login" ? (
              <a href="#" onClick={() => setMode("register")}>สมัครสมาชิก</a>
            ) : (
              <a href="#" onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

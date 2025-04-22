// ✅ แก้ไขจากโค้ดก่อนหน้า โดยเพิ่มระบบเปิด/ปิดสิทธิ์แต่ละเมนูได้

import { useState, useEffect } from "react";
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
  collection,
  getDocs,
  updateDoc,
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
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // login/register

  const fakeEmail = `${username}@local.fake`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists() || snap.data().approved !== true) return;
        const data = snap.data();
        const menusSnap = await getDocs(collection(db, "menus"));
        const menuData = menusSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUser({ ...data, uid: user.uid });
        setMenus(menuData);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const ref = doc(db, "users", result.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists() || snap.data().approved !== true) {
        alert("ยังไม่ได้รับอนุมัติ");
        await signOut(auth);
        return;
      }
      const data = snap.data();
      const menusSnap = await getDocs(collection(db, "menus"));
      const menuData = menusSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUser({ ...data, uid: result.user.uid });
      setMenus(menuData);
    } catch (err) {
      alert("เข้าสู่ระบบล้มเหลว: " + err.message);
    }
  };

  const register = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      await setDoc(doc(db, "users", result.user.uid), {
        username,
        email: result.user.email,
        approved: false,
        role: "user",
      });
      alert("สมัครแล้ว รออนุมัติ");
      await signOut(auth);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("สมัครล้มเหลว: " + err.message);
    }
  };

  const toggleMenu = async (id, value) => {
    const ref = doc(db, "menus", id);
    await updateDoc(ref, { enabled: value });
    setMenus(menus.map((m) => (m.id === id ? { ...m, enabled: value } : m)));
  };

  return (
    <div style={{ display: "flex", padding: 20, gap: 40 }}>
      {!user ? (
        <div>
          <h3>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h3>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          <button onClick={mode === "login" ? login : register}>
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
        </div>
      ) : (
        <>
          <div>
            <h3>เมนู</h3>
            <ul>
              {menus.filter((m) => m.enabled).map((m) => (
                <li key={m.id}>🏠 {m.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>👋 สวัสดี <b>{user.username}</b></h2>
            <p>ระบบเมนูพร้อมกำหนดสิทธิ์แล้ว</p>
            {user.username === "kenta" && (
              <>
                <h4>กำหนดสิทธิ์เมนู</h4>
                {menus.map((menu) => (
                  <div key={menu.id}>
                    <input
                      value={menu.label}
                      onChange={async (e) => {
                        await updateDoc(doc(db, "menus", menu.id), { label: e.target.value });
                        setMenus(menus.map((m) => (m.id === menu.id ? { ...m, label: e.target.value } : m)));
                      }}
                    />
                    <input
                      type="checkbox"
                      checked={menu.enabled}
                      onChange={(e) => toggleMenu(menu.id, e.target.checked)}
                    />
                  </div>
                ))}
              </>
            )}
            <button onClick={() => signOut(auth)}>ออกจากระบบ</button>
          </div>
        </>
      )}
    </div>
  );
}
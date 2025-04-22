import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc
} from "firebase/firestore";

// 🔐 config จาก .env
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
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editingMenuName, setEditingMenuName] = useState("");

  const fakeEmail = `${username}@local.fake`;

  const login = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, fakeEmail, password);
      setUser(result.user);
    } catch (err) {
      alert("เข้าสู่ระบบไม่ได้: " + err.message);
    }
  };

  const register = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, fakeEmail, password);
      await signOut(auth);
      alert("✅ สมัครสำเร็จแล้ว กรุณาเข้าสู่ระบบ");
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("สมัครไม่สำเร็จ: " + err.message);
    }
  };

  const loadMenus = async () => {
    const snapshot = await getDocs(collection(db, "menus"));
    if (snapshot.empty) {
      // ไม่มีเมนู สร้างตัวอย่าง
      await setDoc(doc(db, "menus", "menu_1"), {
        id: "menu_1",
        defaultName: "หน้าหลัก",
        customName: "หน้าหลัก",
        icon: "🏠",
        path: "/dashboard",
        enabledFor: ["kenta"]
      });
      return loadMenus();
    }
    const all = [];
    snapshot.forEach((doc) => all.push(doc.data()));
    setMenus(all);
  };

  useEffect(() => {
    if (user) {
      loadMenus();
    }
  }, [user]);

  const saveCustomName = async (id) => {
    const menuRef = doc(db, "menus", id);
    await updateDoc(menuRef, { customName: editingMenuName });
    setEditingMenuId(null);
    loadMenus();
  };

  return (
    <div style={{ display: "flex", fontFamily: "sans-serif" }}>
      {/* เมนูด้านซ้าย */}
      {user && (
        <div style={{ width: "240px", background: "#eee", padding: "1rem" }}>
          <h3>เมนู</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {menus
              .filter((m) => m.enabledFor.includes(user.email.split("@")[0]))
              .map((m) => (
                <li key={m.id} style={{ marginBottom: "1rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{m.icon}</span>{" "}
                  {editingMenuId === m.id ? (
                    <>
                      <input
                        value={editingMenuName}
                        onChange={(e) => setEditingMenuName(e.target.value)}
                      />
                      <button onClick={() => saveCustomName(m.id)}>💾</button>
                    </>
                  ) : (
                    <>
                      <strong>{m.customName}</strong>
                      {user.email.startsWith("kenta@") && (
                        <button
                          onClick={() => {
                            setEditingMenuId(m.id);
                            setEditingMenuName(m.customName);
                          }}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          ✏️
                        </button>
                      )}
                    </>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* กลางจอ */}
      <div style={{ flex: 1, padding: "2rem" }}>
        {!user ? (
          <>
            <h2>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h2>
            <input
              placeholder="ชื่อผู้ใช้"
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
                  ยังไม่มีบัญชี? <a onClick={() => setMode("register")}>สมัครสมาชิก</a>
                </>
              ) : (
                <>
                  มีบัญชีแล้ว? <a onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
                </>
              )}
            </p>
          </>
        ) : (
          <>
            <h2>👋 สวัสดี {user.email.split("@")[0]}</h2>
            <p>ระบบเมนูพร้อมกำหนดสิทธิ์แล้ว</p>
            <button onClick={() => signOut(auth).then(() => setUser(null))}>
              ออกจากระบบ
            </button>
          </>
        )}
      </div>
    </div>
  );
}

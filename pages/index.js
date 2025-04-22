// pages/index.js
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [menus, setMenus] = useState([]);
  const [menuEdits, setMenuEdits] = useState({});

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

      setUser({ ...userData, ...snap.data() });
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
        role: "user",
      });
      alert("✅ สมัครสำเร็จ! กรุณารอแอดมินอนุมัติ");
      await signOut(auth);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("สมัครไม่สำเร็จ: " + err.message);
    }
  };

  const fetchMenus = async () => {
    const querySnapshot = await getDocs(collection(db, "menus"));
    const loadedMenus = [];
    querySnapshot.forEach((doc) => {
      loadedMenus.push({ id: doc.id, ...doc.data() });
    });
    setMenus(loadedMenus);
  };

  const updateMenus = async () => {
    for (const menuId in menuEdits) {
      const newLabel = menuEdits[menuId];
      await updateDoc(doc(db, "menus", menuId), { label: newLabel });
    }
    alert("✅ บันทึกเมนูสำเร็จแล้ว");
    setMenuEdits({});
    fetchMenus();
  };

  useEffect(() => {
    if (user) {
      fetchMenus();
    }
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h2>
        <input
          placeholder="ชื่อผู้ใช้"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="รหัสผ่าน"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={mode === "login" ? login : register}>
          {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
        </button>
        <p>
          {mode === "login" ? (
            <a href="#" onClick={() => setMode("register")}>สมัครสมาชิก</a>
          ) : (
            <a href="#" onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
          )}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 300, background: "#eee", padding: 20 }}>
        <h3>เมนู</h3>
        {menus.map((menu) => (
          <div key={menu.id}>
            <span>🏠 </span>
            <input
              value={menuEdits[menu.id] ?? menu.label}
              onChange={(e) =>
                setMenuEdits((prev) => ({ ...prev, [menu.id]: e.target.value }))
              }
            />
          </div>
        ))}
        <button onClick={updateMenus}>💾 บันทึกเมนู</button>
      </div>
      <div style={{ padding: 40 }}>
        <h2>
          👋 สวัสดี <b>{user.username}</b>
        </h2>
        <p>ระบบเมนูพร้อมกำหนดสิทธิ์แล้ว</p>
        <button onClick={() => signOut(auth).then(() => setUser(null))}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

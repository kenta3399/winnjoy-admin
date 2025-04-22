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
  const [userData, setUserData] = useState(null);
  const [mode, setMode] = useState("login");
  const [allUsers, setAllUsers] = useState([]);

  const fakeEmail = `${username}@local.fake`;

  useEffect(() => {
    if (user?.uid && userData?.role === "admin") {
      loadAllUsers();
    }
  }, [user, userData]);

  const loadAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    setAllUsers(users);
  };

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
      setUserData(snap.data());
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
        role: "staff",
        permissions: {},
      });
      alert("✅ สมัครสำเร็จ! กรุณารอแอดมินอนุมัติ");
      await signOut(auth);
      setUsername("");
      setPassword("");
    } catch (err) {
      alert("สมัครไม่สำเร็จ: " + err.message);
    }
  };

  const togglePermission = async (uid, key) => {
    const updated = allUsers.map((u) => {
      if (u.id === uid) {
        const updatedPermissions = {
          ...u.permissions,
          [key]: !u.permissions?.[key],
        };
        updateDoc(doc(db, "users", uid), { permissions: updatedPermissions });
        return { ...u, permissions: updatedPermissions };
      }
      return u;
    });
    setAllUsers(updated);
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      {!user ? (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <h1>{mode === "login" ? "🔐 เข้าสู่ระบบ" : "📝 สมัครสมาชิก"}</h1>
          <input
            placeholder="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginBottom: 10 }}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginBottom: 10 }}
          />
          <button
            style={{
              width: "100%",
              padding: 10,
              background: "linear-gradient(to bottom, #4CAF50, #2E7D32)",
              color: "white",
              borderRadius: 8,
              border: "none",
              fontWeight: "bold",
              boxShadow: "0 4px #1B5E20",
              cursor: "pointer",
            }}
            onClick={mode === "login" ? login : register}
          >
            {mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>
          <p style={{ textAlign: "center", marginTop: 10 }}>
            {mode === "login" ? (
              <>
                ยังไม่มีบัญชี? <a href="#" onClick={() => setMode("register")}>สมัครสมาชิก</a>
              </>
            ) : (
              <>
                มีบัญชีแล้ว? <a href="#" onClick={() => setMode("login")}>เข้าสู่ระบบ</a>
              </>
            )}
          </p>
        </div>
      ) : (
        <div>
          <h2>👋 สวัสดี {userData?.username}</h2>
          {userData?.role === "admin" && (
            <div>
              <h3>สิทธิ์ผู้ใช้งาน</h3>
              {allUsers.map((u) => (
                <div key={u.id} style={{ borderBottom: "1px solid #ccc", padding: "0.5rem 0" }}>
                  <strong>{u.username}</strong>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {Object.keys({ a: true, b: true, c: true }).map((key) => (
                      <label key={key}>
                        <input
                          type="checkbox"
                          checked={u.permissions?.[key] || false}
                          onChange={() => togglePermission(u.id, key)}
                        /> {key}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

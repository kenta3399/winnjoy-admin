// ✅ _app.js: ครอบ layout + sidebar ทุกหน้า
import "../styles.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) return setUser(null);
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists() || !snap.data().approved) {
        signOut(auth);
        return;
      }
      setUser({ ...u, ...snap.data() });
    });
  }, []);

  const logout = () => {
    signOut(auth);
    router.push("/");
  };

  return (
    <div style={{ display: "flex", fontFamily: "sans-serif" }}>
      {user && (
        <Sidebar user={user} />
      )}
      <div style={{ flex: 1, padding: 20 }}>
        <Component {...pageProps} user={user} logout={logout} />
      </div>
    </div>
  );
}

function Sidebar({ user }) {
  const [open, setOpen] = useState({});
  const router = useRouter();

  const websites = [
    "JZSPIN", "PROSPIN999", "megarich88", "betman999", "tem-graph", "siamautobet",
    "fiwfun", "mafinx", "soza88", "zocool88", "sanook99", "oppa55", "orca55",
    "fullhouse88", "jokerfun88", "loving88", "luckykid168", "playboy55",
    "maxmo168", "jadnak"
  ];

  const toggle = (key) => setOpen({ ...open, [key]: !open[key] });

  return (
    <div style={{ width: 260, background: "#f2f2f2", padding: 20 }}>
      <h3>เมนู</h3>
      <div style={{ marginBottom: 10 }}>🏠 หน้าหลัก</div>
      <div>
        <div style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => toggle("all")}>🌐 เว็บทั้งหมด</div>
        {open["all"] && (
          <ul style={{ listStyle: "none", paddingLeft: 15 }}>
            {websites.map((name, i) => (
              <li key={i}>
                <span onClick={() => toggle(name)} style={{ cursor: "pointer" }}>📂 {name}</span>
                {open[name] && (
                  <ul style={{ paddingLeft: 20 }}>
                    <li onClick={() => router.push(`/${name}/promo`)}>• โปรโมชั่น</li>
                    <li onClick={() => router.push(`/${name}/pattern`)}>• แพทเทิ้ล</li>
                    <li onClick={() => router.push(`/${name}/web`)}>• หน้าเว็บ</li>
                    <li onClick={() => router.push(`/${name}/line`)}>• หน้าไลน์</li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
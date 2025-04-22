// pages/menu.js
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebaseClient";

const db = getFirestore(app);
const auth = getAuth(app);

export default function MenuManager() {
  const [menus, setMenus] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDocs(collection(db, "users"));
        const found = snap.docs.find((u) => u.data().email === user.email);
        if (found && found.data().username === "kenta") {
          setCurrentUser(found.data());
          loadMenus();
        } else {
          alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        }
      }
    });
    return () => unsub();
  }, []);

  const loadMenus = async () => {
    const snap = await getDocs(collection(db, "menus"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMenus(data);
  };

  const toggleEnabled = async (id, value) => {
    await updateDoc(doc(db, "menus", id), { enabled: value });
    loadMenus();
  };

  const updateName = async (id, name) => {
    await updateDoc(doc(db, "menus", id), { customName: name });
    loadMenus();
  };

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h2>🧩 จัดการเมนู (เฉพาะ kenta เท่านั้น)</h2>
      {menus.map((menu) => (
        <div
          key={menu.id}
          style={{ padding: 10, borderBottom: "1px solid #ccc" }}
        >
          <b>🪪 ID:</b> {menu.id} <br />
          <b>🖋 ชื่อ:</b>{" "}
          <input
            defaultValue={menu.customName || menu.label}
            onBlur={(e) => updateName(menu.id, e.target.value)}
          />
          <br />
          <label>
            ✅ เปิดการใช้งาน:
            <input
              type="checkbox"
              checked={menu.enabled || false}
              onChange={(e) => toggleEnabled(menu.id, e.target.checked)}
            />
          </label>
        </div>
      ))}
    </div>
  );
}

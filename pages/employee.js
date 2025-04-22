// ✅ employee.js — จัดการสิทธิ์พนักงาน (สำหรับ kenta เท่านั้น)
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseClient";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDocs(collection(db, "users"));
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const me = all.find((x) => x.id === u.uid);
        setCurrentUser(me);
        setUsers(all);
      }
    });
    return () => unsub();
  }, []);

  const update = async (uid, field, value) => {
    await updateDoc(doc(db, "users", uid), { [field]: value });
    setUsers((prev) =>
      prev.map((u) => (u.id === uid ? { ...u, [field]: value } : u))
    );
  };

  if (!currentUser || currentUser.username !== "kenta") {
    return <div style={{ padding: 40 }}>⛔️ คุณไม่มีสิทธิ์เข้าหน้านี้</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>👥 จัดการสิทธิ์พนักงาน</h2>
      <table style={{ marginTop: 20, width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th style={{ padding: 10 }}>ชื่อผู้ใช้</th>
            <th style={{ padding: 10 }}>สิทธิ์ใช้งาน</th>
            <th style={{ padding: 10 }}>สิทธิ์แก้ไข</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td style={{ padding: 10 }}>{u.username}</td>
              <td style={{ padding: 10 }}>
                <input
                  type="checkbox"
                  checked={u.approved || false}
                  onChange={(e) => update(u.id, "approved", e.target.checked)}
                /> ใช้งาน
              </td>
              <td style={{ padding: 10 }}>
                <input
                  type="checkbox"
                  checked={u.canEdit || false}
                  onChange={(e) => update(u.id, "canEdit", e.target.checked)}
                /> แก้ไข
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

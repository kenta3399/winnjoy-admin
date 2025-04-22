// ✅ pages/staff.js — หน้าพนักงานแบบตาราง แก้ไขสิทธิ์ได้ เฉพาะ user=kenta
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function StaffPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDocs(collection(db, "users"));
        const current = snap.docs.find((d) => d.id === user.uid);
        if (!current || current.data().username !== "kenta") {
          router.push("/");
        } else {
          setCurrentUser(current.data());
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setUsers(list);
        }
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, []);

  const toggle = async (uid, field, value) => {
    await updateDoc(doc(db, "users", uid), { [field]: value });
    setUsers((prev) =>
      prev.map((u) => (u.id === uid ? { ...u, [field]: value } : u))
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 จัดการพนักงาน</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>ชื่อผู้ใช้</th>
            <th style={th}>อีเมล</th>
            <th style={th}>สิทธิ์ใช้งาน</th>
            <th style={th}>สิทธิ์แก้ไข</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={td}>{u.username}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <input
                  type="checkbox"
                  checked={u.approved || false}
                  onChange={(e) => toggle(u.id, "approved", e.target.checked)}
                />
              </td>
              <td style={td}>
                <input
                  type="checkbox"
                  checked={u.canEdit || false}
                  onChange={(e) => toggle(u.id, "canEdit", e.target.checked)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: 10, borderBottom: "2px solid #ddd", textAlign: "left" };
const td = { padding: 10, borderBottom: "1px solid #eee" };

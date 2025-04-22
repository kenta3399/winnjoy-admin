// ✅ HeaderBar.js - แสดงชื่อพนักงาน + ปุ่มออกจากระบบแบบ 3D สีแดง
import { signOut } from "firebase/auth";
import { auth } from "../firebaseClient";
import { useRouter } from "next/router";

export default function HeaderBar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // กลับไปหน้าล็อกอิน
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "10px 30px",
      background: "#fff",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      gap: "12px"
    }}>
      <div style={{ fontWeight: "bold" }}>👤 {user?.username}</div>
      <button
        onClick={handleLogout}
        style={{
          background: "linear-gradient(to bottom, #ff5f5f, #d60000)",
          color: "white",
          padding: "10px 18px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(255, 0, 0, 0.3)",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "transform 0.2s ease"
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ออกจากระบบ
      </button>
    </div>
  );
}

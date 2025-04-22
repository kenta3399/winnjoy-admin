// ✅ Sidebar.js — ปรับ UI + ปุ่ม Logout + ชื่อพนักงาน ด้านขวาบน
import Link from "next/link";
import { useRouter } from "next/router";

const sites = [
  "JZSPIN", "PROSPIN999", "megarich88", "betman999", "tem-graph", "siamautobet",
  "fiwfun", "mafinx", "soza88", "zocool88", "sanook99", "oppa55", "orca55",
  "fullhouse88", "jokerfun88", "loving88", "luckykid168", "playboy55", "maxmo168", "jadnak"
];

const Sidebar = ({ user, onLogout }) => {
  const router = useRouter();
  const { site, section } = router.query;

  const isActive = (s, sec) => s === site && sec === section;
  const menus = ["โปรโมชั่น", "แพทเทิ้ล", "หน้าเว็บ", "หน้าไลน์"];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: 250,
      padding: 16,
      background: "#1f1f1f",
      color: "white",
      minHeight: "100vh",
      boxShadow: "3px 0 5px rgba(0,0,0,0.2)",
      position: "relative",
    }}>
      <h2 style={{ marginBottom: 20 }}>เมนู</h2>

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "bold", marginBottom: 6 }}>🏠 หน้าหลัก</div>
        {user?.username === "kenta" && (
          <Link href="/employee">
            <div style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: isActive("employee") ? "#444" : "transparent",
              marginBottom: 6,
              cursor: "pointer",
              transition: "0.2s",
              color: "#fff"
            }}>
              👥 พนักงาน
            </div>
          </Link>
        )}

        <div style={{ fontWeight: "bold", marginTop: 20 }}>🌐 เว็บทั้งหมด</div>
        {sites.map((s) => (
          <div key={s}>
            <div style={{ marginTop: 8, fontWeight: 500 }}>{s}</div>
            {menus.map((m) => (
              <Link href={`/${s}/${m}`} key={m}>
                <div style={{
                  marginLeft: 16,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: isActive(s, m) ? "#555" : "transparent",
                  color: isActive(s, m) ? "#fff" : "#aaa",
                  cursor: "pointer",
                  transition: "0.2s",
                  border: isActive(s, m) ? "1px solid #ccc" : "none"
                }}>
                  {m}
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* 👤 ชื่อยูสเซอร์ + ปุ่ม logout */}
      <div style={{
        marginTop: "auto",
        paddingTop: 16,
        borderTop: "1px solid #444",
        textAlign: "center",
      }}>
        <div style={{ marginBottom: 8, fontSize: 14 }}>👤 {user?.username}</div>
        <button
          onClick={onLogout}
          style={{
            background: "linear-gradient(to bottom, #ff5555, #cc0000)",
            border: "none",
            color: "white",
            padding: "6px 12px",
            borderRadius: 12,
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
          }}
        >
          🚪 ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

// ✅ HeaderBar.js — แถบบนพร้อมชื่อยูสและปุ่ม Logout 3D
import React from "react";

const HeaderBar = ({ user, onLogout }) => {
  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "10px 20px",
      background: "#f0f0f0",
      borderBottom: "1px solid #ddd",
      position: "sticky",
      top: 0,
      zIndex: 1000,
    }}>
      <span style={{ marginRight: 20, fontWeight: "bold" }}>👤 {user?.username}</span>
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
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
        }}
      >
        🚪 ออกจากระบบ
      </button>
    </div>
  );
};

export default HeaderBar;

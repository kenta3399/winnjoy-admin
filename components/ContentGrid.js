// ✅ components/ContentGrid.js
import { useState } from "react";

export default function ContentGrid({ items, canEdit, onEdit, onDelete }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginTop: 20
    }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 10, textAlign: "center" }}>
          {item.image && (
            <img src={item.image} alt="pic" style={{ width: "100%", borderRadius: 6 }} />
          )}
          <p style={{ marginTop: 10 }}>{item.text}</p>
          {canEdit && (
            <div style={{ marginTop: 10 }}>
              <button onClick={() => onEdit(idx)}>✏️ แก้ไข</button>
              <button onClick={() => onDelete(idx)} style={{ marginLeft: 10, color: "red" }}>🗑 ลบ</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

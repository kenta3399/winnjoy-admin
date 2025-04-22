// ✅ components/ContentEditor.js (ใช้เสริมได้ถ้าอยากให้แยก editor ใน popup ภายหลัง)
// ตอนนี้เราแก้ inline ในหน้า [site]/[section].js แล้ว ถ้ายังไม่ใช้ สามารถข้ามได้

import { useState } from "react";

export default function ContentEditor({ data, onSave, onCancel }) {
  const [text, setText] = useState(data.text || "");
  const [image, setImage] = useState(data.image || "");

  return (
    <div style={{ padding: 15, border: "1px solid #aaa", borderRadius: 8 }}>
      <h4>📝 แก้ไขกล่อง</h4>
      <input
        type="text"
        placeholder="ลิงก์รูปภาพ"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 10 }}
      />
      <textarea
        placeholder="ข้อความ"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />
      <button onClick={() => onSave({ text, image })}>💾 บันทึก</button>
      <button onClick={onCancel} style={{ marginLeft: 10 }}>❌ ยกเลิก</button>
    </div>
  );
}

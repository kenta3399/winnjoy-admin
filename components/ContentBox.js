// ✅ ContentBox.js — กล่องข้อมูลแบบลากได้ + รองรับ preview รูปและขยายภาพ
import { useRef } from "react";
import { Rnd } from "react-rnd";

const ContentBox = ({ index, item, canEdit, onEdit, onDelete }) => {
  const inputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onEdit(index, "image", event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Rnd
      default={{ x: 0, y: 0, width: 300, height: 'auto' }}
      bounds="parent"
      enableResizing={false}
      disableDragging={!canEdit}
      style={{ marginBottom: 20 }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 12,
          padding: 16,
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        {item.image && (
          <img
            src={item.image}
            alt="preview"
            style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8, cursor: "zoom-in" }}
            onClick={() => window.open(item.image, "_blank")}
          />
        )}

        {canEdit && (
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            style={{ display: "block", margin: "10px auto" }}
            onChange={handleImageChange}
          />
        )}

        {canEdit ? (
          <textarea
            value={item.text}
            onChange={(e) => onEdit(index, "text", e.target.value)}
            placeholder="พิมพ์ข้อความที่นี่..."
            rows={4}
            style={{ width: "100%", padding: 8, borderRadius: 8, resize: "vertical" }}
          />
        ) : (
          <div
            style={{ marginTop: 10, whiteSpace: "pre-wrap", textAlign: "left" }}
            dangerouslySetInnerHTML={{ __html: item.text }}
          ></div>
        )}

        {canEdit && (
          <button
            onClick={() => onDelete(index)}
            style={{ marginTop: 8, background: "#f33", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px" }}
          >
            🗑 ลบ
          </button>
        )}
      </div>
    </Rnd>
  );
};

export default ContentBox;
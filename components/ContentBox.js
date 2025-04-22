// ✅ components/ContentBox.js
import { useRef } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

export default function ContentBox({ index, item, canEdit, onEdit, onDelete }) {
  const fileInputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    onEdit(index, "image", url);
  };

  return (
    <div className="content-box">
      <img src={item.image} className="content-image" alt="img" />
      {canEdit ? (
        <>
          <input
            value={item.text}
            onChange={(e) => onEdit(index, "text", e.target.value)}
            placeholder="ข้อความ..."
            className="input-text"
          />
          <input
            type="text"
            value={item.image}
            onChange={(e) => onEdit(index, "image", e.target.value)}
            placeholder="ลิงก์รูปภาพ..."
            className="input-url"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <button onClick={() => fileInputRef.current.click()}>📤 อัปโหลดรูป</button>
          <button onClick={() => onDelete(index)}>🗑️ ลบ</button>
        </>
      ) : (
        <div className="text-preview">{item.text}</div>
      )}
    </div>
  );
}

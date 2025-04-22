// ✅ pages/[site]/[section].js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebaseClient";
import {
  doc, getDoc, setDoc
} from "firebase/firestore";
import ContentGrid from "../../components/ContentGrid";

export default function SectionPage({ user }) {
  const router = useRouter();
  const { site, section } = router.query;
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState({ text: "", image: "" });
  const [canEdit, setCanEdit] = useState(false);

  const contentKey = `${site}_${section}`;

  useEffect(() => {
    if (!site || !section || !user) return;
    loadData();
    setCanEdit(user?.canEditContent === true || user?.username === "kenta");
  }, [site, section, user]);

  const loadData = async () => {
    const ref = doc(db, "contents", contentKey);
    const snap = await getDoc(ref);
    if (snap.exists()) setItems(snap.data().items || []);
  };

  const saveData = async (newItems) => {
    await setDoc(doc(db, "contents", contentKey), { items: newItems });
    setItems(newItems);
    setEditingIndex(null);
    setEditingData({ text: "", image: "" });
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setEditingData(items[idx]);
  };

  const handleDelete = (idx) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    saveData(newItems);
  };

  const handleSaveEdit = () => {
    const newItems = [...items];
    newItems[editingIndex] = editingData;
    saveData(newItems);
  };

  const handleAddNew = () => {
    const newItems = [...items, { text: "", image: "" }];
    setEditingIndex(newItems.length - 1);
    setEditingData({ text: "", image: "" });
  };

  return (
    <div>
      <h2>📁 {site} / {section}</h2>
      {canEdit && (
        <button onClick={handleAddNew}>➕ เพิ่มกล่องใหม่</button>
      )}

      <ContentGrid
        items={items}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {editingIndex !== null && (
        <div style={{ marginTop: 20, border: "1px solid #aaa", padding: 15 }}>
          <h4>✏️ แก้ไขกล่องที่ {editingIndex + 1}</h4>
          <input
            type="text"
            placeholder="ลิงก์รูปภาพ"
            value={editingData.image}
            onChange={(e) => setEditingData({ ...editingData, image: e.target.value })}
            style={{ display: "block", marginBottom: 10, width: "100%" }}
          />
          <textarea
            placeholder="ข้อความ"
            value={editingData.text}
            onChange={(e) => setEditingData({ ...editingData, text: e.target.value })}
            style={{ display: "block", width: "100%", height: 100 }}
          />
          <button onClick={handleSaveEdit} style={{ marginTop: 10 }}>💾 บันทึก</button>
        </div>
      )}
    </div>
  );
}

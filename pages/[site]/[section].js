import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebaseClient"; // ✅ ใช้ firebaseClient ที่มีการตรวจ duplicate แล้ว
import ContentBox from "../../components/ContentBox";
import MenuDropdown from "../../components/MenuDropdown";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function SectionPage() {
  const router = useRouter();
  const { site, section } = router.query;
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.data();
        setUser(data);
        setCanEdit(data?.canEdit || data?.username === "kenta");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!site || !section) return;
    const loadData = async () => {
      const docRef = doc(db, "contents", `${site}_${section}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setItems(snap.data().items || []);
      }
      setLoading(false);
    };
    loadData();
  }, [site, section]);

  const updateFirestore = async (newItems) => {
    await setDoc(doc(db, "contents", `${site}_${section}`), {
      items: newItems,
    });
    setItems(newItems);
  };

  const logAction = async (action) => {
    if (!user) return;
    const logRef = doc(db, "logs", `${Date.now()}_${user.username}`);
    await setDoc(logRef, {
      site,
      section,
      user: user.username,
      action,
      timestamp: new Date().toISOString(),
    });
  };

  const handleEdit = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    updateFirestore(updated);
    logAction(`edit item ${index}`);
  };

  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index);
    updateFirestore(updated);
    logAction(`delete item ${index}`);
  };

  const handleAdd = () => {
    const updated = [...items, { text: "", image: "" }];
    updateFirestore(updated);
    logAction("add item");
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="section-container">
      <div className="section-header">
        <h2>{site?.toUpperCase()} / {section}</h2>
        {canEdit && <MenuDropdown site={site} current={section} />}
      </div>

      <div className="content-grid">
        {items.map((item, index) => (
          <ContentBox
            key={index}
            index={index}
            item={item}
            canEdit={canEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {canEdit && (
        <div className="add-button-wrap">
          <button className="add-button" onClick={handleAdd}>➕ เพิ่มกล่องใหม่</button>
        </div>
      )}
    </div>
  );
}

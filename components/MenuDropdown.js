// ✅ MenuDropdown.js — สลับเมนูย่อยแบบ Dropdown
import { useRouter } from "next/router";

const sections = ["โปรโมชั่น", "แพทเทิ้ล", "หน้าเว็บ", "หน้าไลน์"];

export default function MenuDropdown({ site, current }) {
  const router = useRouter();

  const handleChange = (e) => {
    const selected = e.target.value;
    router.push(`/${site}/${selected}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #ccc",
        fontSize: 16,
        marginLeft: 10,
      }}
    >
      {sections.map((sec) => (
        <option key={sec} value={sec}>
          {sec}
        </option>
      ))}
    </select>
  );
}

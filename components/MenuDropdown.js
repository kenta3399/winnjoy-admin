// ✅ components/MenuDropdown.js
import { useRouter } from "next/router";

const sections = ["โปรโมชั่น", "แพทเทิ้ล", "หน้าเว็บ", "หน้าไลน์"];

export default function MenuDropdown({ site, current }) {
  const router = useRouter();

  const handleChange = (e) => {
    const newSection = e.target.value;
    router.push(`/${site}/${newSection}`);
  };

  return (
    <select value={current} onChange={handleChange} className="menu-dropdown">
      {sections.map((sec, i) => (
        <option key={i} value={sec}>{sec}</option>
      ))}
    </select>
  );
}

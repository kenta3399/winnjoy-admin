// pages/_app.js
import '@/styles/globals.css';
import Link from 'next/link';

const webList = [
  'JZSPIN', 'PROSPIN999', 'megarich88', 'betman999', 'tem-graph',
  'siamautobet', 'fiwfun', 'mafinx', 'soza88', 'zocool88',
  'sanook99', 'oppa55', 'orca55', 'fullhouse88', 'jokerfun88',
  'loving88', 'luckykid168', 'playboy55', 'maxmo168', 'jadnak'
];

export default function App({ Component, pageProps }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{ width: 260, background: '#111', color: '#fff', padding: 20, position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <h3 style={{ color: '#fff' }}>📌 เมนูหลัก</h3>
        <Link href="/" style={{ display: 'block', margin: '10px 0', color: '#ccc', textDecoration: 'none' }}>🏠 หน้าหลัก</Link>

        <details open style={{ marginTop: 20 }}>
          <summary style={{ cursor: 'pointer', color: '#ccc' }}>🌐 เว็บทั้งหมด</summary>
          <ul style={{ listStyle: 'none', paddingLeft: 10 }}>
            {webList.map((web) => (
              <li key={web} style={{ marginTop: 5 }}>
                <details>
                  <summary style={{ color: '#ccc', cursor: 'pointer' }}>{web}</summary>
                  <ul style={{ listStyle: 'none', paddingLeft: 15 }}>
                    <li><Link href={`/${web}/promotion`} style={{ color: '#ccc', textDecoration: 'none' }}>• โปรโมชั่น</Link></li>
                    <li><Link href={`/${web}/pattern`} style={{ color: '#ccc', textDecoration: 'none' }}>• แพทเทิ้ล</Link></li>
                    <li><Link href={`/${web}/website`} style={{ color: '#ccc', textDecoration: 'none' }}>• หน้าเว็บ</Link></li>
                    <li><Link href={`/${web}/line`} style={{ color: '#ccc', textDecoration: 'none' }}>• หน้าไลน์</Link></li>
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        </details>
      </aside>

      <main style={{ marginLeft: 260, padding: 20, flex: 1, background: '#f4f4f4' }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}
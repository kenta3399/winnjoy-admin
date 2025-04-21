import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSy8BYFOEq8BHaZallzx1x6DVzjBN1IJjFYnM",
  authDomain: "winnjoy-admin.firebaseapp.com",
  projectId: "winnjoy-admin",
  appId: "1:999732827140:web:83693c5f373bb790d2d151"
};

initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const allowedUsers = [
  'kenta3399@gmail.com'
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user && allowedUsers.includes(user.email)) {
        setUser(user);
        setAccessDenied(false);
      } else if (user) {
        setAccessDenied(true);
        setUser(null);
      }
    });
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <p style={{ padding: 40 }}>กำลังโหลด...</p>;
  if (accessDenied) return <p style={{ padding: 40, color: 'red' }}>⛔ ไม่ได้รับสิทธิ์เข้าใช้งาน</p>;

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      {!user ? (
        <>
          <h1>🔐 เข้าสู่ระบบแอดมิน</h1>
          <button onClick={handleLogin}>ล็อกอินด้วย Google</button>
        </>
      ) : (
        <>
          <h1>🎉 ยินดีต้อนรับ, {user.displayName}</h1>
          <p>{user.email}</p>
          <button onClick={handleLogout}>ออกจากระบบ</button>
        </>
      )}
    </div>
  );
}

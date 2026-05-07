import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin/dashboard');
    } catch {
      setError('אימייל או סיסמה לא נכונים');
    }
  }

  return (
    <main className="admin-shell small">
      <form className="panel" onSubmit={handleLogin}>
        <h1>כניסת מנהל</h1>
        <label>אימייל</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>סיסמה</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">כניסה</button>
      </form>
    </main>
  );
}

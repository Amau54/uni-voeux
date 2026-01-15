'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (e: any) {
      setError('Email ou mot de passe incorrect.');
      console.error("Erreur lors de la connexion:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="text-2xl font-bold mb-4 text-center">Connexion</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

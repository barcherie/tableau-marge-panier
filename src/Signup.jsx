// 📄 Signup.jsx — création de compte simple
import React, { useState } from 'react';
import supabase from './services/supabaseClient';
import './App.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('🆕 Signup response:', { data, error });

      if (error) {
        setMessage(`❌ Erreur : ${error.message}`);
      } else {
        setMessage('✅ Compte créé. Vérifie ta boîte mail si la confirmation est requise.');
      }
    } catch (err) {
      console.error('💥 Exception :', err);
      setMessage('❌ Une erreur est survenue.');
    }
  };

  return (
    <div className="login-container">
      <h2>Créer un compte</h2>
      <form className="login-form" onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Créer le compte</button>
        {message && <div className="error-msg">{message}</div>}
      </form>
    </div>
  );
}

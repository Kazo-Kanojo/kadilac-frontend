import React, { useState } from 'react';
import api from '../api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chama a rota de login do backend SaaS
      const response = await api.post('/api/login', { username, password });
      
      const { token, username: user, store_id } = response.data;

      // Salva os dados críticos no navegador
      localStorage.setItem('kadilac_token', token);
      localStorage.setItem('kadilac_user', JSON.stringify({ user, store_id }));

      // Avisa o App.jsx que logou com sucesso
      if (onLogin) onLogin();

    } catch (err) {
      console.error(err);
      setError('Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Kadilac<span className="text-red-600">SaaS</span></h1>
          <p className="text-gray-400 text-sm mt-2">Sistema de Gestão de Veículos</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Usuário</label>
            <input
              type="text"
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-red-500"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Senha</label>
            <input
              type="password"
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-red-500"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
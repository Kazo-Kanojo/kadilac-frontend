import React, { useState } from 'react';
import api from '../api';
import { Car } from 'lucide-react';

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
      const response = await api.post('/login', { username, password });
      const { token, username: user, store_id } = response.data;

      localStorage.setItem('kadilac_token', token);
      localStorage.setItem('kadilac_user', JSON.stringify({ user, store_id }));

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
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-96 border border-gray-700">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-red-600 p-3 rounded-full mb-4 shadow-lg">
             <Car size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide uppercase">Portal do Lojista</h1>
          <p className="text-gray-400 text-sm mt-2">Sistema de Gestão Automotiva</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">Usuário</label>
            <input
              type="text"
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="Digite seu usuário..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wide">Senha</label>
            <input
              type="password"
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg transform hover:scale-[1.02]"
          >
            {loading ? 'Validando Acesso...' : 'Entrar no Sistema'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Sistema de Gestão v1.0
        </div>
      </div>
    </div>
  );
};

export default Login;
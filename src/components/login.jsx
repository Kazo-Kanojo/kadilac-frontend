import React, { useState } from 'react';
import { User, Lock, Loader2, AlertCircle } from 'lucide-react';
import api from '../api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Envia os dados para o backend (note que usamos 'username')
      const response = await api.post('/login', { 
        username: username, 
        password: password 
      });

      // 2. Extrai os dados da resposta
      const { token, role, store_id, store_name, store_logo, username: userReturn } = response.data;

      // 3. Salva tudo no localStorage para o sistema usar depois
      localStorage.setItem('kadilac_token', token);
      localStorage.setItem('kadilac_user', userReturn);
      localStorage.setItem('kadilac_user_role', role); // Importante para o Super Admin

      // Lógica para salvar dados da loja (se não for admin sem loja)
      if (store_id) {
          if (store_name) localStorage.setItem('store_name', store_name);
          if (store_logo) localStorage.setItem('store_logo', store_logo);
      } else {
          // Limpa dados de loja se for Super Admin "global"
          localStorage.removeItem('store_name');
          localStorage.removeItem('store_logo');
      }

      // 4. Avisa o App.jsx que o login deu certo
      onLogin(); 

    } catch (err) {
      console.error("Erro no login:", err);
      // Pega a mensagem de erro exata do backend (ex: "Senha incorreta")
      const msg = err.response?.data?.error || 'Erro ao conectar ao servidor.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        
        {/* Cabeçalho do Login */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D80000] rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
            K
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acesso ao Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">Gestão Kadilac Veículos</p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 animate-pulse">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D80000] focus:border-[#D80000] transition-colors outline-none"
                placeholder="Seu usuário de acesso"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D80000] focus:border-[#D80000] transition-colors outline-none"
                placeholder="Sua senha secreta"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#D80000] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Validando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Kadilac System. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};

export default Login;
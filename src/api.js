import axios from 'axios';

// --- CONFIGURAÇÃO DINÂMICA DA URL ---
// O import.meta.env.VITE_API_URL pega o valor do arquivo .env
// O '||' serve de fallback: se não tiver .env, tenta localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Exportamos a constante para quem precisa da string pura (ex: Dashboard, Imagens)
export const API_BASE_URL = API_URL;

// Debug para você conferir no console do navegador se pegou certo
console.log('--- AMBIENTE KADILAC ---');
console.log('Conectando na API:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Adiciona o Token automaticamente em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kadilac_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Trata erros globais (Token expirado ou servidor fora)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error(`ERRO CRÍTICO: Não foi possível conectar ao servidor em ${API_URL}`);
      // Opcional: alert("Sem conexão com o servidor. Verifique sua internet.");
    } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Se o erro for de autenticação e NÃO for na tela de login, desloga o usuário
      const isLoginPage = window.location.pathname.includes('/login');
      
      if (!isLoginPage) {
          console.warn('Sessão expirada. Redirecionando para login...');
          localStorage.removeItem('kadilac_token');
          localStorage.removeItem('kadilac_user');
          window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
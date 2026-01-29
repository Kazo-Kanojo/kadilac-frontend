import axios from 'axios';

// --- CONFIGURAÇÃO DEFINITIVA DA URL ---
// Apontando diretamente para o IP da sua VPS na porta 5001
const API_URL = 'http://72.60.244.108:5001';

// --- CORREÇÃO DO ERRO DO DASHBOARD ---
// Exportamos a URL também com o nome 'API_BASE_URL' para satisfazer 
// os arquivos que importam ela (como o Dashboard.jsx)
export const API_BASE_URL = API_URL;

console.log('--- DEBUG KADILAC ---');
console.log('API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kadilac_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error(`ERRO DE CONEXÃO: Não foi possível contactar o servidor em ${API_URL}`);
    } else if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Sessão expirada. Limpando dados...');
      localStorage.removeItem('kadilac_token');
      localStorage.removeItem('kadilac_user');
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
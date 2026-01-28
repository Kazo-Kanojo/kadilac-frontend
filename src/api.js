import axios from 'axios';

// Garante que a URL aponte para sua VPS (ou localhost se estiver testando local)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Ajuste a porta se seu backend rodar na 3001 ou 5000

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR (O SEGREDO DO SAAS) ---
// Antes de enviar qualquer pedido, insere o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kadilac_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tratamento de erro global (Se o token expirar, desloga o usuário)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Se der erro de autenticação, limpa o token e recarrega para ir pro login
      localStorage.removeItem('kadilac_token');
      localStorage.removeItem('kadilac_user');
      // window.location.href = '/'; // Opcional: força recarregamento
    }
    return Promise.reject(error);
  }
);

export default api;
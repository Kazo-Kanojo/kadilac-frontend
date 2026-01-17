

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Função auxiliar para montar URLs completas
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
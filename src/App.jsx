import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Estoque from './components/Estoque';
import Clientes from './components/clientes';
import NovaFicha from './components/NovaFicha';
import Financeiro from './components/Financeiro';
import Configuracoes from './components/Configuracoes';
import Login from './components/login';
import { Menu } from 'lucide-react';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  // [MUDANÇA 1] Estado para o Logo
  const [storeName, setStoreName] = useState('Sistema de Gestão'); 
  const [storeLogo, setStoreLogo] = useState(null); 

  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('kadilac_token');
    if (token) setIsAuthenticated(true);
    setIsLoadingAuth(false);
  }, []);

  const refreshStoreData = () => {
    if (isAuthenticated) {
        api.get('/config')
           .then(res => {
               if (res.data) {
                   // Atualiza Nome
                   if (res.data.nome_loja) {
                       setStoreName(res.data.nome_loja);
                       localStorage.setItem('store_name', res.data.nome_loja);
                   }
                   // [MUDANÇA 2] Atualiza Logo
                   if (res.data.logo) {
                       setStoreLogo(res.data.logo);
                       localStorage.setItem('store_logo', res.data.logo);
                   }
               }
           })
           .catch(console.error);
    }
  };

  useEffect(() => {
    refreshStoreData();
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('kadilac_token');
    localStorage.removeItem('kadilac_user');
    localStorage.removeItem('store_name');
    localStorage.removeItem('store_logo');
    setIsAuthenticated(false);
    setActiveScreen('dashboard');
    setStoreName('Sistema de Gestão');
    setStoreLogo(null);
  };

  if (isLoadingAuth) return <div className="h-screen bg-gray-900 flex items-center justify-center text-white">Carregando...</div>;

  if (!isAuthenticated) return <Login onLogin={handleLoginSuccess} />;

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans text-gray-800">
      
      {/* [MUDANÇA 3] Passando o storeLogo para a Sidebar */}
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        storeName={storeName} 
        storeLogo={storeLogo}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-100 w-full">
        <header className="h-16 bg-white shadow-sm flex items-center px-4 md:px-6 z-10 flex-shrink-0 gap-4">
           <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
             <Menu size={24} />
           </button>
           <h2 className="text-xl font-bold text-gray-700 capitalize mt-1">
             {activeScreen === 'nova-ficha' ? 'Nova Ficha' : activeScreen}
           </h2>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className="h-full max-w-7xl mx-auto flex flex-col">
            {activeScreen === 'dashboard' && <Dashboard setActiveScreen={setActiveScreen} />}
            {activeScreen === 'estoque' && <Estoque />}
            {activeScreen === 'clientes' && <Clientes />}
            {activeScreen === 'nova-ficha' && <NovaFicha />}
            {activeScreen === 'financeiro' && <Financeiro />} 
            {activeScreen === 'config' && <Configuracoes onUpdate={refreshStoreData} />}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Estoque from './components/Estoque';
import Clientes from './components/clientes';
import NovaFicha from './components/NovaFicha';
import Financeiro from './components/Financeiro';
import Configuracoes from './components/Configuracoes';
import { Settings, Menu } from 'lucide-react';

function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans text-gray-800">
      
      <Sidebar 
        activeScreen={activeScreen} 
        setActiveScreen={setActiveScreen} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-100 w-full">
        {/* Header (mantive igual) */}
        <header className="h-16 bg-white shadow-sm flex items-center px-4 md:px-6 z-10 flex-shrink-0 gap-4">
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
           >
             <Menu size={24} />
           </button>

           <h2 className="text-xl font-bold text-gray-700 capitalize flex items-center gap-2">
             <span className="mt-1">
               {activeScreen === 'nova-ficha' ? 'Nova Ficha' : activeScreen}
             </span>
           </h2>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className="h-full max-w-7xl mx-auto flex flex-col">
            {activeScreen === 'dashboard' && <Dashboard setActiveScreen={setActiveScreen} />}
            {activeScreen === 'estoque' && <Estoque />}
            {activeScreen === 'clientes' && <Clientes />}
            {activeScreen === 'nova-ficha' && <NovaFicha />}
            {activeScreen === 'financeiro' && <Financeiro />} 
            {activeScreen === 'config' && <Configuracoes />}
            {['config'].includes(activeScreen) && (
               <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Settings size={64} className="opacity-20"/>
                  <h3 className="text-lg font-medium mt-4">Em Desenvolvimento</h3>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App;
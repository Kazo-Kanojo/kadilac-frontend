import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Estoque from './components/Estoque';
import Clientes from './pages/Clientes';
import { LayoutDashboard, Car, Users, Settings } from 'lucide-react';

function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans text-gray-800">
      
      {/* Sidebar isolada */}
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-100">
        {/* Header (Pode virar componente também depois) */}
        <header className="h-16 bg-white shadow-sm flex justify-between items-center px-6 z-10 flex-shrink-0">
           <h2 className="text-xl font-bold text-gray-700 capitalize flex items-center gap-2">
             <span className="mt-1">{activeScreen}</span>
           </h2>
           {/* ... resto do header ... */}
        </header>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full max-w-7xl mx-auto flex flex-col">
            {activeScreen === 'dashboard' && <Dashboard />}
            {activeScreen === 'estoque' && <Estoque />}
            {activeScreen === 'clientes' && <Clientes />}
            
            {['financeiro', 'config'].includes(activeScreen) && (
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
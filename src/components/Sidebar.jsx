import React from 'react';
import { 
  LayoutDashboard, Car, Users, DollarSign, Settings, LogOut, 
  X, UserCircle, ShieldAlert 
} from 'lucide-react';

const Sidebar = ({ activeScreen, setActiveScreen, isOpen, onClose, onLogout, storeName, storeLogo }) => {
  
  // Verifica se é Super Admin
  const userRole = localStorage.getItem('kadilac_user_role');
  const isSuperAdmin = userRole === 'super_admin';

  const menuItems = isSuperAdmin ? [
      // MENU DO SUPER ADMIN ATUALIZADO
      { id: 'super-admin', label: 'Painel Master', icon: ShieldAlert },
      { id: 'super-admin-config', label: 'Configurações', icon: Settings }, // <--- NOVO
  ] : [
      // ... menu normal das lojas ...
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'estoque', label: 'Estoque', icon: Car },
      { id: 'clientes', label: 'Clientes', icon: Users },
      { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
      { id: 'config', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Overlay para Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-kadilac-500 text-white border-r border-kadilac-600 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col h-full shadow-xl
      `}>
        
        {/* Header da Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-kadilac-400 bg-kadilac-600">
          <div className="flex items-center gap-2">
             {storeLogo && !isSuperAdmin ? (
                 <img src={storeLogo} alt="Logo" className="h-8 w-auto object-contain brightness-0 invert" />
             ) : (
                 <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold border border-white/20">
                    {isSuperAdmin ? 'S' : 'K'}
                 </div>
             )}
             <span className="font-bold text-white text-sm truncate max-w-[120px] tracking-wide">
                {isSuperAdmin ? 'SUPER ADMIN' : (storeName || 'KADILAC')}
             </span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id);
                  onClose(); // Fecha sidebar no mobile ao clicar
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-kadilac-400 text-white shadow-md border-l-4 border-white' 
                    : 'text-gray-300 hover:bg-kadilac-400 hover:text-white'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer do Usuário */}
        <div className="p-4 border-t border-kadilac-400 bg-kadilac-600">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-kadilac-400 rounded-full flex items-center justify-center text-gray-300 border border-kadilac-300">
                  <UserCircle size={24} />
              </div>
              <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">
                      {isSuperAdmin ? 'Administrador' : 'Usuário'}
                  </p>
                  <p className="text-xs text-green-400 flex items-center gap-1 font-medium">
                      ● Online
                  </p>
              </div>
           </div>
           
           <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 text-red-300 hover:bg-white/10 hover:text-white py-2 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-white/10"
           >
              <LogOut size={18} />
              Sair do Sistema
           </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
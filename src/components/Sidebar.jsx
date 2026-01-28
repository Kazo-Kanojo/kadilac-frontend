import { LayoutDashboard, Car, Users, Wallet, Settings, LogOut, X, FilePlus } from 'lucide-react';

// Adicionei 'onLogout' nas props recebidas
const Sidebar = ({ activeScreen, setActiveScreen, isOpen, onClose, onLogout }) => {
  
  const MenuItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveScreen(id);
        if (onClose) onClose(); // Fecha o menu ao clicar (no mobile)
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 border-l-4 ${
        activeScreen === id 
          ? 'bg-kadilac-400 border-kadilac-100 text-white shadow-inner' 
          : 'border-transparent text-gray-300 hover:bg-kadilac-400/50 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <>
      {/* Backdrop Escuro (Fundo para clicar e fechar no mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-kadilac-500 text-white flex flex-col shadow-2xl transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-kadilac-400 bg-kadilac-500 shadow-sm relative">
          <div className="text-center w-full">
            <h1 className="text-2xl font-extrabold tracking-widest text-white">KADILAC</h1>
            <p className="text-[10px] text-kadilac-200 uppercase tracking-widest mt-1">SISTEMA V3.0</p>
          </div>
          {/* Botão Fechar (Só mobile) */}
          <button 
            onClick={onClose} 
            className="md:hidden absolute right-4 text-kadilac-200 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <MenuItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          
          {/* 2. Botão Nova Ficha */}
          <MenuItem id="nova-ficha" icon={FilePlus} label="Nova Ficha" />
          
          <MenuItem id="estoque" icon={Car} label="Veículos" />
          <MenuItem id="clientes" icon={Users} label="Clientes" />
          <MenuItem id="financeiro" icon={Wallet} label="Financeiro" />
          <MenuItem id="config" icon={Settings} label="Configurações" />
        </nav>

        {/* RODAPÉ COM BOTÃO DE SAIR ATIVO */}
        <div className="p-4 border-t border-kadilac-400 bg-kadilac-500">
          <button 
            onClick={onLogout} // <--- A MÁGICA ACONTECE AQUI
            className="flex items-center gap-3 text-kadilac-200 hover:text-white transition-colors w-full text-sm justify-center md:justify-start"
          >
            <LogOut size={16} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
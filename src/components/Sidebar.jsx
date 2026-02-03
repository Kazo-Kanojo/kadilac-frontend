import React from 'react';
import { LayoutDashboard, Car, Users, Wallet, Settings, LogOut, X, FilePlus, Store, ShieldCheck } from 'lucide-react';

// Recebendo 'storeLogo' nas props
const Sidebar = ({ activeScreen, setActiveScreen, isOpen, onClose, onLogout, storeName, storeLogo }) => {
  
  // Recupera o usuário salvo para verificar se é o Admin Mestre
  const user = JSON.parse(localStorage.getItem('kadilac_user') || '{}');

  const MenuItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveScreen(id);
        if (onClose) onClose(); 
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-kadilac-500 text-white flex flex-col shadow-2xl transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* HEADER COM LOGO + NOME */}
        <div className="min-h-24 px-4 py-6 border-b border-kadilac-400 bg-kadilac-500 shadow-sm relative flex items-center justify-center">
            
            <div className="flex flex-col items-center gap-3 text-center w-full">
                {/* Lógica: Se tiver logo, mostra imagem. Se não, mostra ícone padrão */}
                {storeLogo ? (
                    <img 
                        src={storeLogo} 
                        alt="Logo" 
                        className="h-12 w-auto object-contain max-w-[180px] rounded-md bg-white/10 p-1" 
                    />
                ) : (
                   <div className="bg-white/10 p-2 rounded-full">
                       <Store size={32} className="text-kadilac-100" />
                   </div>
                )}
                
                <div>
                    <h1 className="text-lg font-extrabold tracking-wider text-white uppercase leading-tight break-words px-2">
                        {storeName || 'SISTEMA'}
                    </h1>
                    <p className="text-[10px] text-kadilac-200 uppercase tracking-widest mt-1">
                        Painel de Gestão
                    </p>
                </div>
            </div>

            <button onClick={onClose} className="md:hidden absolute right-4 top-4 text-kadilac-200 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* MENU DE NAVEGAÇÃO */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <MenuItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <MenuItem id="nova-ficha" icon={FilePlus} label="Nova Ficha" />
          <MenuItem id="estoque" icon={Car} label="Veículos" />
          <MenuItem id="clientes" icon={Users} label="Clientes" />
          <MenuItem id="financeiro" icon={Wallet} label="Financeiro" />
          <MenuItem id="config" icon={Settings} label="Configurações" />

          {/* ITEM EXCLUSIVO DO SUPER ADMIN */}
          {user.username === 'admin' && (
            <div className="pt-4 mt-4 border-t border-kadilac-400">
               <button
                 onClick={() => {
                   setActiveScreen('super-admin');
                   if (onClose) onClose();
                 }}
                 className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 border-l-4 ${
                    activeScreen === 'super-admin'
                    ? 'bg-red-900/50 border-red-500 text-red-100'
                    : 'border-transparent text-red-200/70 hover:bg-red-900/30 hover:text-red-100'
                 }`}
               >
                 <ShieldCheck size={20} />
                 <span className="font-medium tracking-wide">Super Admin</span>
               </button>
            </div>
          )}
        </nav>

        {/* FOOTER - SAIR */}
        <div className="p-4 border-t border-kadilac-400 bg-kadilac-500">
          <button onClick={onLogout} className="flex items-center gap-3 text-kadilac-200 hover:text-white transition-colors w-full text-sm justify-center md:justify-start">
            <LogOut size={16} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
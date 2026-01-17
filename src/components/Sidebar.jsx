/* eslint-disable react/prop-types */
import { LayoutDashboard, Car, Users, Wallet, Settings, LogOut, } from 'lucide-react';

const Sidebar = ({ activeScreen, setActiveScreen }) => {
  const MenuItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveScreen(id)}
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
    <aside className="w-64 bg-kadilac-500 text-white flex flex-col shadow-2xl z-20 flex-shrink-0">
        <div className="h-20 flex items-center justify-center border-b border-kadilac-400 bg-kadilac-500 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold tracking-widest text-white">KADILAC</h1>
            <p className="text-[10px] text-kadilac-200 uppercase tracking-widest mt-1">SISTEMA V3.0</p>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <MenuItem id="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <MenuItem id="estoque" icon={Car} label="Veículos" />
          <MenuItem id="clientes" icon={Users} label="Clientes" />
          <MenuItem id="financeiro" icon={Wallet} label="Financeiro" />
          <MenuItem id="config" icon={Settings} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-kadilac-400 bg-kadilac-500">
          <button className="flex items-center gap-3 text-kadilac-200 hover:text-white transition-colors w-full text-sm">
            <LogOut size={16} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>
  );
};


export default Sidebar;
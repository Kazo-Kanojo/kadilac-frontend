import { useState } from 'react'
import { Car, DollarSign, LayoutDashboard, PlusCircle, Settings, LogOut } from 'lucide-react' // Ícones legais

// Componentes internos (depois você pode mover para arquivos separados)
const Dashboard = () => (
  <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-kadilac-300">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Visão Geral</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <p className="text-gray-500 text-sm">Carros em Estoque</p>
        <p className="text-3xl font-bold text-kadilac-400">12</p>
      </div>
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <p className="text-gray-500 text-sm">Vendas no Mês</p>
        <p className="text-3xl font-bold text-green-600">4</p>
      </div>
      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <p className="text-gray-500 text-sm">Faturamento</p>
        <p className="text-3xl font-bold text-gray-800">R$ 145k</p>
      </div>
    </div>
  </div>
);

const CadastroCarro = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <PlusCircle className="text-kadilac-300" /> Cadastrar Novo Veículo
    </h2>
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input type="text" placeholder="Marca" className="border p-2 rounded w-full" />
      <input type="text" placeholder="Modelo" className="border p-2 rounded w-full" />
      <input type="number" placeholder="Ano" className="border p-2 rounded w-full" />
      <input type="text" placeholder="Placa" className="border p-2 rounded w-full" />
      <input type="text" placeholder="Cor" className="border p-2 rounded w-full" />
      <input type="number" placeholder="Preço de Compra (R$)" className="border p-2 rounded w-full" />
      <input type="number" placeholder="Preço de Venda (R$)" className="border p-2 rounded w-full" />
      
      <div className="md:col-span-2 mt-4">
        <button className="bg-kadilac-300 hover:bg-kadilac-400 text-white px-6 py-2 rounded font-semibold transition-colors w-full md:w-auto">
          Salvar Veículo
        </button>
      </div>
    </form>
  </div>
);

const Estoque = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Estoque de Carros</h2>
    <p className="text-gray-500">A tabela de carros virá aqui...</p>
  </div>
);

function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  // Função auxiliar para renderizar o menu
  const MenuItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveScreen(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
        activeScreen === id 
          ? 'bg-kadilac-400 text-white border-r-4 border-kadilac-100' 
          : 'text-kadilac-100 hover:bg-kadilac-400/30'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      
      {/* ASIDE (Lateral) */}
      <aside className="w-64 bg-kadilac-500 text-white flex flex-col shadow-2xl">
        <div className="p-6 text-center border-b border-kadilac-400">
          <h1 className="text-2xl font-bold tracking-wider">KADILAC</h1>
          <span className="text-xs text-kadilac-100 uppercase">Sistema de Gestão</span>
        </div>

        <nav className="flex-1 mt-6">
          <MenuItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <MenuItem id="estoque" icon={Car} label="Estoque" />
          <MenuItem id="cadastrar-carro" icon={PlusCircle} label="Cadastrar Carro" />
          <MenuItem id="vendas" icon={DollarSign} label="Registrar Venda" />
          <MenuItem id="config" icon={Settings} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-kadilac-400">
          <button className="flex items-center gap-2 text-kadilac-200 hover:text-white transition-colors text-sm">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* MAIN (Conteúdo Central) */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-kadilac-500 capitalize">
            {activeScreen.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-bold text-gray-700">Olá, Cliente</p>
                <p className="text-xs text-gray-500">Admin</p>
             </div>
             <div className="h-10 w-10 bg-kadilac-200 rounded-full flex items-center justify-center text-white font-bold">
                C
             </div>
          </div>
        </header>

        {/* Renderização Condicional do Conteúdo */}
        <div className="fade-in">
          {activeScreen === 'dashboard' && <Dashboard />}
          {activeScreen === 'cadastrar-carro' && <CadastroCarro />}
          {activeScreen === 'estoque' && <Estoque />}
          {activeScreen === 'vendas' && <div className="bg-white p-6 rounded shadow">Tela de Vendas em construção...</div>}
        </div>
      </main>
    </div>
  )
}

export default App
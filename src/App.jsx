/* eslint-disable react/prop-types */
import { useState } from 'react'
import { 
  Car, DollarSign, LayoutDashboard, PlusCircle, Settings, LogOut, 
  Search, Users, Calendar, ChevronDown, ChevronUp, Wallet, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'

// --- DADOS FAKES PARA TESTE (Baseado nas suas fotos) ---
const MOCK_VEHICLES = [
  { id: 1, entrada: '27/06/2025', modelo: 'HYUNDAI/HB20S 1.6A CONF', cor: 'Prata', ano: '14/15', placa: 'ORE-9528', status: 'Em estoque', valor: 55000, custo: 45000 },
  { id: 2, entrada: '02/07/2025', modelo: 'GM / CLASSIC LS', cor: 'Bege', ano: '10/11', placa: 'EPP-2415', status: 'Vendido', valor: 22000, custo: 18000 },
  { id: 3, entrada: '04/07/2025', modelo: 'VW / GOL CITY', cor: 'Vermelha', ano: '13/14', placa: 'DMN-9829', status: 'Em estoque', valor: 35000, custo: 29000 },
  { id: 4, entrada: '11/07/2025', modelo: 'GURGEL X12', cor: 'Cinza', ano: '88/88', placa: 'BOR-4137', status: 'Manutenção', valor: 15000, custo: 10000 },
  { id: 5, entrada: '15/07/2025', modelo: 'RENAULT/SANDERO STEP', cor: 'Cinza', ano: '11/12', placa: 'FAH-6457', status: 'Em estoque', valor: 38900, custo: 32000 },
];

// --- COMPONENTE: DASHBOARD FINANCEIRO (Baseado na foto do Levantamento Gerencial) ---
const Dashboard = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Levantamento Gerencial</h2>
      <div className="flex gap-2 bg-white p-2 rounded shadow-sm text-sm">
        <span className="text-gray-500">Período:</span>
        <span className="font-bold text-kadilac-500">01/01/2026 à 16/01/2026</span>
      </div>
    </div>

    {/* Cards Principais */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
        <p className="text-sm text-gray-500 mb-1">Total Receitas</p>
        <p className="text-2xl font-bold text-gray-800">R$ 973.342</p>
        <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
          <ArrowUpCircle size={14} /> +12% vs mês anterior
        </div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
        <p className="text-sm text-gray-500 mb-1">Total Gastos</p>
        <p className="text-2xl font-bold text-gray-800">R$ 469.328</p>
        <div className="text-xs text-gray-400 mt-2">Inclui compras e despesas</div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500 bg-green-50">
        <p className="text-sm text-green-700 mb-1 font-bold">LUCRO DO PERÍODO</p>
        <p className="text-3xl font-bold text-green-700">R$ 504.014</p>
        <div className="text-xs text-green-600 mt-2">Margem apurada: 51%</div>
      </div>
      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-kadilac-300">
        <p className="text-sm text-gray-500 mb-1">Veículos em Estoque</p>
        <p className="text-2xl font-bold text-kadilac-500">95 Unidades</p>
        <div className="text-xs text-gray-400 mt-2">Valor Total: R$ 3.5M</div>
      </div>
    </div>

    {/* Detalhamento (Tabela Resumida) */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ArrowDownCircle className="text-blue-500" size={20} /> Entradas de Veículos
        </h3>
        <div className="flex justify-between border-b py-2 text-sm">
          <span>Veículos Comprados (19)</span>
          <span className="font-bold">R$ 354.021</span>
        </div>
        <div className="flex justify-between border-b py-2 text-sm">
          <span>Veículos Consignados (4)</span>
          <span className="font-bold">R$ 114.500</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <ArrowUpCircle className="text-green-500" size={20} /> Saídas de Veículos
        </h3>
        <div className="flex justify-between border-b py-2 text-sm">
          <span>Venda de Próprios (20)</span>
          <span className="font-bold text-blue-600">R$ 659.342</span>
        </div>
        <div className="flex justify-between py-2 text-sm">
          <span>Lucro sobre Vendas</span>
          <span className="font-bold text-green-600 bg-green-100 px-2 rounded">R$ 144.800</span>
        </div>
      </div>
    </div>
  </div>
);

// --- COMPONENTE: ESTOQUE (Mestre-Detalhe) ---
const Estoque = () => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState('detalhes'); // detalhes, financeiro, despesas

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      {/* BARRA DE TOPO DO ESTOQUE */}
      <div className="bg-white p-4 rounded shadow-sm flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-gray-50 flex-1 max-w-md">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Buscar por placa, modelo..." className="bg-transparent outline-none text-sm w-full" />
        </div>
        <div className="flex gap-2">
           <select className="border rounded p-2 text-sm bg-white">
             <option>Todos os Status</option>
             <option>Em Estoque</option>
             <option>Vendidos</option>
           </select>
           <button className="bg-kadilac-300 text-white px-4 py-2 rounded text-sm hover:bg-kadilac-400 transition-colors">
             + Novo Carro
           </button>
        </div>
      </div>

      {/* LISTA DE VEÍCULOS (TABELA) */}
      <div className="bg-white rounded shadow-sm overflow-auto flex-1 border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 font-semibold">
            <tr>
              <th className="p-3 border-b">Entrada</th>
              <th className="p-3 border-b">Veículo</th>
              <th className="p-3 border-b">Cor</th>
              <th className="p-3 border-b">Ano</th>
              <th className="p-3 border-b">Placa</th>
              <th className="p-3 border-b">Valor Venda</th>
              <th className="p-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MOCK_VEHICLES.map((car) => (
              <tr 
                key={car.id} 
                onClick={() => setSelectedCar(car)}
                className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedCar?.id === car.id ? 'bg-blue-100' : ''}`}
              >
                <td className="p-3">{car.entrada}</td>
                <td className="p-3 font-medium text-gray-800">{car.modelo}</td>
                <td className="p-3">{car.cor}</td>
                <td className="p-3">{car.ano}</td>
                <td className="p-3 uppercase font-mono">{car.placa}</td>
                <td className="p-3 font-medium text-kadilac-400">R$ {car.valor.toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    car.status === 'Em estoque' ? 'bg-green-100 text-green-700' :
                    car.status === 'Vendido' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {car.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAINEL DE DETALHES (BOTTOM PANEL) - Só aparece se selecionar um carro */}
      {selectedCar && (
        <div className="bg-white h-80 rounded-t-lg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex flex-col border-t-2 border-kadilac-300 animate-slide-up">
          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            <button 
              onClick={() => setActiveTab('detalhes')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'detalhes' ? 'bg-white border-t-2 border-kadilac-500 text-kadilac-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Detalhes do Veículo
            </button>
            <button 
              onClick={() => setActiveTab('financeiro')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'financeiro' ? 'bg-white border-t-2 border-kadilac-500 text-kadilac-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Resumo Financeiro
            </button>
            <button 
              onClick={() => setActiveTab('despesas')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'despesas' ? 'bg-white border-t-2 border-kadilac-500 text-kadilac-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Despesas e Receitas
            </button>
            <div className="flex-1 flex justify-end items-center pr-4">
               <button onClick={() => setSelectedCar(null)} className="text-gray-400 hover:text-red-500"><ChevronDown/></button>
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6 overflow-auto flex-1">
            {activeTab === 'detalhes' && (
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="space-y-3">
                   <div><span className="text-gray-500 block">Modelo</span> <span className="font-bold">{selectedCar.modelo}</span></div>
                   <div><span className="text-gray-500 block">Placa</span> <span className="font-bold">{selectedCar.placa}</span></div>
                   <div><span className="text-gray-500 block">Cor</span> <span>{selectedCar.cor}</span></div>
                </div>
                <div className="space-y-3">
                   <div><span className="text-gray-500 block">Renavam</span> <span>12345678900</span></div>
                   <div><span className="text-gray-500 block">Chassi</span> <span>9BFZE55H198...</span></div>
                   <div><span className="text-gray-500 block">Proprietário Anterior</span> <span className="text-blue-600 underline cursor-pointer">ENESIO FAGUNDES</span></div>
                </div>
                <div>
                   <span className="text-gray-500 block mb-1">Observações</span>
                   <textarea className="w-full h-24 border rounded p-2 text-xs bg-gray-50" defaultValue="Veículo impecável. Pneus novos. Trocado óleo recentemente."></textarea>
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
               <div className="grid grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                     <h4 className="text-red-600 font-bold border-b border-red-200 pb-2 mb-3">Operação de Entrada</h4>
                     <div className="flex justify-between text-sm mb-1"><span>Valor de Compra:</span> <span className="font-bold">R$ {selectedCar.custo.toLocaleString()}</span></div>
                     <div className="flex justify-between text-sm mb-1"><span>Despesas Totais:</span> <span className="font-bold">R$ 1.200,00</span></div>
                     <div className="flex justify-between text-sm font-bold text-gray-800 pt-2 border-t mt-2"><span>Custo Total:</span> <span>R$ {(selectedCar.custo + 1200).toLocaleString()}</span></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                     <h4 className="text-blue-600 font-bold border-b border-blue-200 pb-2 mb-3">Operação de Saída (Previsão)</h4>
                     <div className="flex justify-between text-sm mb-1"><span>Valor Pretendido:</span> <span className="font-bold">R$ {selectedCar.valor.toLocaleString()}</span></div>
                     <div className="flex justify-between text-sm font-bold text-green-600 pt-2 border-t mt-2">
                        <span>Lucro Estimado:</span> 
                        <span>R$ {(selectedCar.valor - (selectedCar.custo + 1200)).toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'despesas' && (
              <div className="w-full">
                 <div className="flex gap-2 mb-3">
                    <button className="bg-white border border-gray-300 text-xs px-3 py-1 rounded shadow-sm hover:bg-gray-50">+ Incluir Despesa</button>
                 </div>
                 <table className="w-full text-xs text-left border">
                    <thead className="bg-gray-100">
                       <tr><th className="p-2 border">Data</th><th className="p-2 border">Histórico</th><th className="p-2 border">Valor</th></tr>
                    </thead>
                    <tbody>
                       <tr><td className="p-2 border">10/07/2025</td><td className="p-2 border">Martelinho de Ouro</td><td className="p-2 border text-red-600">- R$ 400,00</td></tr>
                       <tr><td className="p-2 border">12/07/2025</td><td className="p-2 border">Lavagem Completa</td><td className="p-2 border text-red-600">- R$ 150,00</td></tr>
                       <tr><td className="p-2 border">12/07/2025</td><td className="p-2 border">Polimento</td><td className="p-2 border text-red-600">- R$ 650,00</td></tr>
                    </tbody>
                 </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE: CLIENTES (Nova tela pedida) ---
const Clientes = () => (
   <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
         <h2 className="font-bold text-gray-700 flex items-center gap-2"><Users size={20}/> Lista de Clientes</h2>
         <input placeholder="Buscar cliente..." className="border p-2 rounded text-sm w-64"/>
      </div>
      <div className="flex-1 overflow-auto p-4">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
               <div key={i} className="border p-4 rounded hover:shadow-md cursor-pointer transition-shadow bg-white flex items-center gap-3">
                  <div className="h-10 w-10 bg-kadilac-100 text-kadilac-500 rounded-full flex items-center justify-center font-bold">C{i}</div>
                  <div>
                     <p className="font-bold text-gray-800 text-sm">Cliente Exemplo {i}</p>
                     <p className="text-xs text-gray-500">Vendedor • (11) 99999-9999</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   </div>
);


// --- APP PRINCIPAL ---
function App() {
  const [activeScreen, setActiveScreen] = useState('dashboard');

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
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans text-gray-800">
      
      {/* ASIDE */}
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

      {/* CONTEÚDO */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-100">
        
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex justify-between items-center px-6 z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-700 capitalize flex items-center gap-2">
            {activeScreen === 'dashboard' && <LayoutDashboard size={24} className="text-kadilac-300"/>}
            {activeScreen === 'estoque' && <Car size={24} className="text-kadilac-300"/>}
            {activeScreen === 'clientes' && <Users size={24} className="text-kadilac-300"/>}
            <span className="mt-1">{activeScreen.charAt(0).toUpperCase() + activeScreen.slice(1)}</span>
          </h2>
          
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-700">Enzo R.</p>
                <p className="text-[10px] text-kadilac-300 font-semibold uppercase">Admin</p>
             </div>
             <div className="h-8 w-8 bg-kadilac-300 rounded-full flex items-center justify-center text-white font-bold text-xs shadow hover:bg-kadilac-200 cursor-pointer">
                ER
             </div>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full max-w-7xl mx-auto flex flex-col">
            {activeScreen === 'dashboard' && <Dashboard />}
            {activeScreen === 'estoque' && <Estoque />}
            {activeScreen === 'clientes' && <Clientes />}
            
            {/* Telas em construção */}
            {['financeiro', 'config', 'cadastrar-carro'].includes(activeScreen) && (
               <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
                  <Settings size={64} className="mb-4 opacity-20"/>
                  <h3 className="text-lg font-medium">Módulo em Desenvolvimento</h3>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
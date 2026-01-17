/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Search, ChevronDown, Camera, Plus, Pencil, LockKeyhole, Filter, RefreshCw } from 'lucide-react';
import VehicleModal from '../components/VehicleModal';
import CloseFileModal from '../components/CloseFileModal';

// Dados iniciais (Mock)
const INITIAL_VEHICLES = [
  { id: 1, entrada: '2025-06-27', modelo: 'HYUNDAI/HB20S 1.6A CONF', cor: 'Prata', ano: '14/15', placa: 'ORE-9528', status: 'Em estoque', valor: 55000, custo: 45000 },
  { id: 2, entrada: '2025-07-02', modelo: 'GM / CLASSIC LS', cor: 'Bege', ano: '10/11', placa: 'EPP-2415', status: 'Vendido', valor: 22000, custo: 18000 },
  { id: 3, entrada: '2025-07-04', modelo: 'VW / GOL CITY', cor: 'Vermelha', ano: '13/14', placa: 'DMN-9829', status: 'Em estoque', valor: 35000, custo: 29000 },
];

const Estoque = () => {
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para controlar o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'

  // --- AÇÕES DA BARRA DE FERRAMENTAS ---

  const handleNewCar = () => {
    setSelectedCar(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCar = () => {
    if (!selectedCar) return;
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseFicha = () => {
    if (!selectedCar) return;
    setIsCloseModalOpen(true);
  };

  const handleSaveVehicle = (data) => {
    if (modalMode === 'create') {
        const newId = vehicles.length + 1;
        setVehicles([ ...vehicles, { ...data, id: newId } ]);
    } else {
        const updatedList = vehicles.map(v => v.id === selectedCar.id ? { ...data, id: selectedCar.id } : v);
        setVehicles(updatedList);
        setSelectedCar({ ...data, id: selectedCar.id });
    }
    setIsModalOpen(false);
  };

  const confirmCloseFicha = (saleData) => {
     const updatedList = vehicles.map(v => 
       v.id === selectedCar.id ? { 
           ...v, 
           status: 'Vendido',
           ...saleData 
       } : v
     );
     setVehicles(updatedList);
     setSelectedCar({ ...selectedCar, status: 'Vendido', ...saleData });
     setIsCloseModalOpen(false);
  };

  // Filtro simples
  const filteredVehicles = vehicles.filter(car => 
    car.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    car.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-100 animate-fade-in relative">
      
      {/* HEADER SUPERIOR */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estoque de Veículos</h1>
            <p className="text-sm text-gray-500">Gerenciamento completo da frota</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-gray-100 px-3 py-1 rounded-md text-xs font-medium text-gray-600">
                Total: {vehicles.length}
             </div>
          </div>
      </header>

      {/* BARRA DE FERRAMENTAS (Estilo Clientes) */}
      <div className="bg-white px-8 py-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0 shadow-sm z-10">
         
         {/* Botões de Ação */}
         <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
                onClick={handleNewCar} 
                className="flex items-center gap-2 bg-[#D80000] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
            >
                <Plus size={18} />
                Nova Ficha
            </button>
            
            <button 
                onClick={handleEditCar} 
                disabled={!selectedCar}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border shadow-sm text-sm font-medium ${
                    selectedCar 
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
            >
                <Pencil size={18} />
                Alterar
            </button>

            <button 
                onClick={handleCloseFicha} 
                disabled={!selectedCar}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border shadow-sm text-sm font-medium ${
                    selectedCar 
                      ? 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50' 
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
            >
                <LockKeyhole size={18} />
                Fechar Ficha
            </button>
         </div>
         
         {/* Barra de Pesquisa e Filtros */}
         <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D80000] transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar veículo..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent transition-all"
                />
             </div>
             
             <div className="h-8 w-px bg-gray-300 mx-1"></div>

             <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
                 <Filter size={16} className="text-gray-400 mr-2"/>
                 <select className="bg-transparent text-sm outline-none text-gray-700 font-medium cursor-pointer">
                     <option>Todos</option>
                     <option>Estoque</option>
                     <option>Vendidos</option>
                 </select>
             </div>
         </div>
      </div>

      {/* LISTA DE VEÍCULOS */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="w-12 px-4 py-3 text-center"></th>
                <th className="px-6 py-3 font-semibold text-gray-600">Entrada</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Veículo</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Cor</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Ano</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Placa</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Valor Venda</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-center">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((car) => {
                const isSelected = selectedCar?.id === car.id;
                return (
                    <tr 
                        key={car.id} 
                        onClick={() => { setSelectedCar(car); setActiveTab('detalhes'); }}
                        className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                        }`}
                    >
                    <td className="px-4 py-4 text-center">
                        <input 
                            type="radio" 
                            checked={isSelected}
                            onChange={() => setSelectedCar(car)}
                            className="accent-[#D80000] w-4 h-4 cursor-pointer"
                        />
                    </td>
                    <td className="px-6 py-4 text-gray-600">{car.entrada}</td>
                    <td className={`px-6 py-4 font-bold ${isSelected ? 'text-[#D80000]' : 'text-gray-800'}`}>
                        {car.modelo}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{car.cor}</td>
                    <td className="px-6 py-4 text-gray-600">{car.ano}</td>
                    <td className="px-6 py-4 uppercase font-mono text-gray-700">{car.placa}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">R$ {Number(car.valor).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            car.status === 'Em estoque' ? 'bg-green-100 text-green-700' :
                            car.status === 'Vendido' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {car.status}
                        </span>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>

      {/* PAINEL DE DETALHES (BOTTOM PANEL) */}
      {selectedCar && (
        <div className="bg-white h-80 flex flex-col border-t-4 border-[#D80000] animate-slide-up shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          {/* Menu de Abas */}
          <div className="flex border-b bg-gray-50">
            {['Detalhes', 'Financeiro', 'Despesas'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.toLowerCase() 
                    ? 'bg-white text-[#D80000] border-t-2 border-t-[#D80000] -mt-1' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab === 'Financeiro' ? 'Resumo Financeiro' : tab}
              </button>
            ))}
            <button 
              onClick={() => setActiveTab('fotos')}
              className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'fotos' 
                  ? 'bg-white text-[#D80000] border-t-2 border-t-[#D80000] -mt-1' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Camera size={16}/> Fotos
            </button>
            
            <div className="flex-1 flex justify-end items-center pr-4">
               <button onClick={() => setSelectedCar(null)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                   <ChevronDown size={20}/>
               </button>
            </div>
          </div>

          {/* Conteúdo das Abas (Visualização Apenas Leitura) */}
          <div className="p-6 overflow-auto flex-1 bg-white">
            
            {activeTab === 'detalhes' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div className="space-y-3">
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Modelo:</span> <span className="font-bold text-gray-800">{selectedCar.modelo}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Placa:</span> <span className="font-bold uppercase text-gray-800">{selectedCar.placa}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Cor:</span> <span className="text-gray-800">{selectedCar.cor}</span></div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Renavam:</span> <span className="text-gray-800">{selectedCar.renavam || '-'}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Chassi:</span> <span className="text-gray-800">{selectedCar.chassi || '-'}</span></div>
                </div>
                <div className="bg-yellow-50 p-3 border border-yellow-100 rounded-lg text-sm text-gray-600 italic">
                   <span className="font-semibold block mb-1 text-yellow-700">Observações:</span>
                   {selectedCar.observacoes || "Sem observações cadastradas."}
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
                <div className="flex gap-8 items-start">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 w-1/3">
                     <h4 className="text-red-700 font-bold border-b border-red-200 pb-2 mb-3 text-xs uppercase tracking-wide">Operação de Entrada</h4>
                     <div className="flex justify-between text-sm text-gray-700"><span>Custo Compra:</span> <span className="font-bold text-lg">R$ {Number(selectedCar.custo).toLocaleString()}</span></div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 w-1/3">
                     <h4 className="text-green-700 font-bold border-b border-green-200 pb-2 mb-3 text-xs uppercase tracking-wide">Operação de Saída</h4>
                     <div className="flex justify-between text-sm text-gray-700"><span>Preço Venda:</span> <span className="font-bold text-lg">R$ {Number(selectedCar.valor).toLocaleString()}</span></div>
                  </div>
               </div>
            )}

            {activeTab === 'fotos' && (
              <div className="flex gap-4">
                  <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 text-xs hover:border-[#D80000] hover:text-[#D80000] transition-colors cursor-pointer">
                      + Adicionar Foto Principal
                  </div>
                  <div className="w-48 h-32 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200 text-gray-300 text-xs">
                      Sem foto adicional
                  </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAIS */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveVehicle}
        initialData={selectedCar}
        mode={modalMode}
      />

      <CloseFileModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={confirmCloseFicha}
        vehicle={selectedCar}
      />
    </div>
  );
};

export default Estoque;
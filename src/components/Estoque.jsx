/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Search, ChevronDown, Camera, FilePlus, Edit, LockKeyhole, Filter } from 'lucide-react';
import VehicleModal from './VehicleModal'; // Importando o modal que criamos
import CloseFileModal from './CloseFileModal';

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
  
  // Estados para controlar o Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'

  // --- AÇÕES DA BARRA DE FERRAMENTAS ---

  // 1. Nova Ficha
  const handleNewCar = () => {
    setSelectedCar(null); // Limpa seleção
    setModalMode('create');
    setIsModalOpen(true);
  };

  // 2. Alterar Ficha
  const handleEditCar = () => {
    if (!selectedCar) return alert("Selecione um veículo na lista para alterar.");
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // 3. Fechar Ficha (Vender)
// Apenas abre o modal, não salva nada ainda
const handleCloseFicha = () => {
  if (!selectedCar) return alert("Selecione um veículo para fechar a ficha.");
  setIsCloseModalOpen(true);
};

  // Salvar (Vindo do Modal)
  const handleSaveVehicle = (data) => {
    if (modalMode === 'create') {
        // Simula ID novo
        const newId = vehicles.length + 1;
        setVehicles([ ...vehicles, { ...data, id: newId } ]);
    } else {
        // Atualiza existente
        const updatedList = vehicles.map(v => v.id === selectedCar.id ? { ...data, id: selectedCar.id } : v);
        setVehicles(updatedList);
        setSelectedCar({ ...data, id: selectedCar.id });
    }
    setIsModalOpen(false);
  };
// Essa função será chamada quando clicar em "Fecha" no modal
const confirmCloseFicha = (saleData) => {
   const updatedList = vehicles.map(v => 
     v.id === selectedCar.id ? { 
         ...v, 
         status: 'Vendido',
         ...saleData // Adiciona os dados da venda (comprador, valor final, etc) ao objeto
     } : v
   );
   setVehicles(updatedList);
   setSelectedCar({ ...selectedCar, status: 'Vendido', ...saleData });
   setIsCloseModalOpen(false);
};
  return (
    <div className="flex flex-col h-full animate-fade-in relative">
      
      {/* BARRA DE FERRAMENTAS SUPERIOR (Estilo Sistema Desktop) */}
      <div className="bg-white p-2 rounded-t-lg shadow-sm border-b border-gray-200 flex gap-2 items-center mb-2">
         <button onClick={handleNewCar} className="flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all group">
            <FilePlus size={24} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Nova Ficha</span>
         </button>
         <div className="w-px h-10 bg-gray-300 mx-1"></div>
         <button onClick={handleEditCar} className={`flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <Edit size={24} className="text-orange-500 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Alterar Ficha</span>
         </button>
         <button onClick={handleCloseFicha} className={`flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <LockKeyhole size={24} className="text-red-500 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Fechar Ficha</span>
         </button>
         
         <div className="flex-1"></div>
         
         {/* Filtro Rápido */}
         <div className="flex items-center bg-gray-100 rounded px-2 py-1 border border-gray-200">
             <Filter size={16} className="text-gray-400 mr-2"/>
             <span className="text-xs text-gray-500 mr-2">Filtro:</span>
             <select className="bg-transparent text-sm outline-none text-gray-700 font-medium">
                 <option>Todos</option>
                 <option>Em Estoque</option>
                 <option>Vendidos</option>
             </select>
         </div>
      </div>

      {/* LISTA DE VEÍCULOS */}
      <div className="bg-white rounded shadow-sm overflow-auto flex-1 border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 font-semibold shadow-sm z-10">
            <tr>
              <th className="p-3 border-b">Entrada</th>
              <th className="p-3 border-b">Veículo</th>
              <th className="p-3 border-b">Cor</th>
              <th className="p-3 border-b">Ano</th>
              <th className="p-3 border-b">Placa</th>
              <th className="p-3 border-b">Valor Venda</th>
              <th className="p-3 border-b text-center">St</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vehicles.map((car) => (
              <tr 
                key={car.id} 
                onClick={() => { setSelectedCar(car); setActiveTab('detalhes'); }}
                className={`cursor-pointer transition-colors ${selectedCar?.id === car.id ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                <td className="p-3">{car.entrada}</td>
                <td className="p-3">{car.modelo}</td>
                <td className="p-3">{car.cor}</td>
                <td className="p-3">{car.ano}</td>
                <td className="p-3 uppercase font-mono">{car.placa}</td>
                <td className="p-3">R$ {Number(car.valor).toLocaleString()}</td>
                <td className="p-3 text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto ${
                    car.status === 'Em estoque' ? 'bg-green-500' :
                    car.status === 'Vendido' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} title={car.status}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAINEL DE DETALHES (BOTTOM PANEL) */}
      {selectedCar && (
        <div className="bg-white h-80 flex flex-col border-t-4 border-kadilac-300 animate-slide-up shadow-inner mt-2">
          {/* Menu de Abas */}
          <div className="flex border-b bg-gray-100">
            {['Detalhes', 'Financeiro', 'Despesas'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-2 text-sm font-bold border-r border-gray-300 ${activeTab === tab.toLowerCase() ? 'bg-white text-kadilac-500 border-t-2 border-t-kadilac-500' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                {tab === 'Financeiro' ? 'Resumo Financeiro' : tab}
              </button>
            ))}
            <button 
              onClick={() => setActiveTab('fotos')}
              className={`px-6 py-2 text-sm font-bold border-r border-gray-300 flex items-center gap-2 ${activeTab === 'fotos' ? 'bg-white text-kadilac-500 border-t-2 border-t-kadilac-500' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <Camera size={14}/> Fotos
            </button>
            
            <div className="flex-1 flex justify-end items-center pr-4 bg-gray-100">
               <button onClick={() => setSelectedCar(null)} className="text-gray-500 hover:text-red-600"><ChevronDown/></button>
            </div>
          </div>

          {/* Conteúdo das Abas (Visualização Apenas Leitura) */}
          <div className="p-4 overflow-auto flex-1 bg-white">
            
            {activeTab === 'detalhes' && (
               <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Modelo:</span> <span className="font-bold">{selectedCar.modelo}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Placa:</span> <span className="font-bold uppercase">{selectedCar.placa}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Cor:</span> <span>{selectedCar.cor}</span></div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Renavam:</span> <span>{selectedCar.renavam || '-'}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Chassi:</span> <span>{selectedCar.chassi || '-'}</span></div>
                </div>
                <div className="bg-yellow-50 p-2 border border-yellow-100 rounded text-xs text-gray-600 italic">
                   {selectedCar.observacoes || "Sem observações cadastradas."}
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
                <div className="flex gap-8 items-start">
                  <div className="bg-red-50 p-4 rounded border border-red-100 w-1/3">
                     <h4 className="text-red-700 font-bold border-b border-red-200 pb-1 mb-2 text-xs uppercase">Operação de Entrada</h4>
                     <div className="flex justify-between text-sm"><span>Custo Compra:</span> <span className="font-bold">R$ {Number(selectedCar.custo).toLocaleString()}</span></div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-100 w-1/3">
                     <h4 className="text-blue-700 font-bold border-b border-blue-200 pb-1 mb-2 text-xs uppercase">Operação de Saída</h4>
                     <div className="flex justify-between text-sm"><span>Preço Venda:</span> <span className="font-bold">R$ {Number(selectedCar.valor).toLocaleString()}</span></div>
                  </div>
               </div>
            )}

            {activeTab === 'fotos' && (
              <div className="flex gap-4">
                  <div className="w-48 h-32 bg-gray-200 rounded flex items-center justify-center border text-gray-400 text-xs">Foto Principal</div>
                  <div className="w-48 h-32 bg-gray-100 rounded flex items-center justify-center border text-gray-300 text-xs">Sem foto adicional</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPONENTE MODAL (Fica oculto até ser chamado) */}
      
        <VehicleModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveVehicle}
            initialData={selectedCar}
            mode={modalMode}
        />

        {/* NOVO MODAL DE FECHAR FICHA */}
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
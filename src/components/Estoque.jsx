/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Search, ChevronDown, Camera, FilePlus, Edit, LockKeyhole, Filter, Trash2 } from 'lucide-react';
import VehicleModal from '../components/VehicleModal';
import CloseFileModal from '../components/CloseFileModal';

const API_URL = 'http://localhost:5000';

const Estoque = () => {
  const [vehicles, setVehicles] = useState([]); // Começa vazio, carrega da API
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  // --- CARREGAR DADOS DA API ---
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/veiculos`);
      const data = await response.json();
      setVehicles(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao buscar veículos:", error);
      alert("Erro ao conectar com o servidor.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // --- AÇÕES ---

  const handleNewCar = () => {
    setSelectedCar(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditCar = () => {
    if (!selectedCar) return alert("Selecione um veículo para alterar.");
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseFicha = () => {
    if (!selectedCar) return alert("Selecione um veículo para fechar a ficha.");
    setIsCloseModalOpen(true);
  };

  const handleDeleteCar = async () => {
    if (!selectedCar) return;
    if (confirm(`Tem certeza que deseja excluir o veículo ${selectedCar.modelo}?`)) {
        try {
            await fetch(`${API_URL}/veiculos/${selectedCar.id}`, { method: 'DELETE' });
            setVehicles(vehicles.filter(v => v.id !== selectedCar.id));
            setSelectedCar(null);
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    }
  };

  // Salvar (POST ou PUT)
  const handleSaveVehicle = async (data) => {
    try {
        if (modalMode === 'create') {
            const response = await fetch(`${API_URL}/veiculos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newVehicle = await response.json();
            setVehicles([newVehicle, ...vehicles]); // Adiciona na lista visual
        } else {
            // Atualizar
            await fetch(`${API_URL}/veiculos/${selectedCar.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            // Atualiza lista visual
            setVehicles(vehicles.map(v => v.id === selectedCar.id ? { ...data, id: selectedCar.id } : v));
            setSelectedCar({ ...data, id: selectedCar.id });
        }
        setIsModalOpen(false);
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar dados.");
    }
  };

  // Fechar Ficha (PUT status = Vendido)
  const confirmCloseFicha = async (saleData) => {
     try {
        const updatedData = { ...selectedCar, status: 'Vendido', ...saleData };
        
        await fetch(`${API_URL}/veiculos/${selectedCar.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        setVehicles(vehicles.map(v => v.id === selectedCar.id ? updatedData : v));
        setSelectedCar(updatedData);
        setIsCloseModalOpen(false);
     } catch (error) {
        console.error("Erro ao fechar ficha:", error);
     }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-gray-50">
      
      {/* BARRA DE FERRAMENTAS */}
      <div className="bg-white p-2 rounded-t-lg shadow-sm border-b border-gray-200 flex gap-2 items-center mb-2">
         <button onClick={handleNewCar} className="flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all group">
            <FilePlus size={24} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Nova Ficha</span>
         </button>
         <div className="w-px h-10 bg-gray-300 mx-1"></div>
         <button onClick={handleEditCar} disabled={!selectedCar} className={`flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <Edit size={24} className="text-orange-500 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Alterar</span>
         </button>
         <button onClick={handleCloseFicha} disabled={!selectedCar} className={`flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <LockKeyhole size={24} className="text-green-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Fechar Ficha</span>
         </button>
         
         <div className="w-px h-10 bg-gray-300 mx-1"></div>
         
         <button onClick={handleDeleteCar} disabled={!selectedCar} className={`flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <Trash2 size={24} className="text-red-500 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Excluir</span>
         </button>

         <div className="flex-1"></div>
         
         {/* Filtro Rápido */}
         <div className="flex items-center bg-gray-100 rounded px-2 py-1 border border-gray-200">
             <Filter size={16} className="text-gray-400 mr-2"/>
             <span className="text-xs text-gray-500 mr-2">Filtro:</span>
             <select className="bg-transparent text-sm outline-none text-gray-700 font-medium cursor-pointer">
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
            {isLoading ? (
               <tr><td colSpan="7" className="p-4 text-center">Carregando estoque...</td></tr>
            ) : vehicles.length === 0 ? (
               <tr><td colSpan="7" className="p-4 text-center text-gray-400">Nenhum veículo cadastrado.</td></tr>
            ) : (
              vehicles.map((car) => (
                <tr 
                  key={car.id} 
                  onClick={() => { setSelectedCar(car); setActiveTab('detalhes'); }}
                  className={`cursor-pointer transition-colors ${selectedCar?.id === car.id ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-blue-50 text-gray-700'}`}
                >
                  <td className="p-3">{car.data_entrada ? new Date(car.data_entrada).toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="p-3 uppercase">{car.modelo}</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAINEL INFERIOR (Mantido igual, apenas lendo dados reais) */}
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
            <button onClick={() => setActiveTab('fotos')} className={`px-6 py-2 text-sm font-bold border-r border-gray-300 flex items-center gap-2 ${activeTab === 'fotos' ? 'bg-white text-kadilac-500 border-t-2 border-t-kadilac-500' : 'text-gray-500 hover:bg-gray-200'}`}>
              <Camera size={14}/> Fotos
            </button>
            <div className="flex-1 flex justify-end items-center pr-4 bg-gray-100">
               <button onClick={() => setSelectedCar(null)} className="text-gray-500 hover:text-red-600"><ChevronDown/></button>
            </div>
          </div>

          <div className="p-4 overflow-auto flex-1 bg-white">
            {activeTab === 'detalhes' && (
               <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="space-y-2">
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Modelo:</span> <span className="font-bold uppercase">{selectedCar.modelo}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Placa:</span> <span className="font-bold uppercase">{selectedCar.placa}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Combustível:</span> <span>{selectedCar.combustivel}</span></div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Renavam:</span> <span>{selectedCar.renavam || '-'}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Proprietário Ant:</span> <span className="uppercase">{selectedCar.proprietario_anterior || '-'}</span></div>
                </div>
                <div className="bg-yellow-50 p-2 border border-yellow-100 rounded text-xs text-gray-600 italic">
                   {selectedCar.observacoes || "Sem observações cadastradas."}
                </div>
              </div>
            )}
            {activeTab === 'financeiro' && (
                <div className="flex gap-8 items-start">
                  <div className="bg-red-50 p-4 rounded border border-red-100 w-1/3">
                     <h4 className="text-red-700 font-bold border-b border-red-200 pb-1 mb-2 text-xs uppercase">Entrada</h4>
                     <div className="flex justify-between text-sm"><span>Custo:</span> <span className="font-bold">R$ {Number(selectedCar.custo).toLocaleString()}</span></div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded border border-blue-100 w-1/3">
                     <h4 className="text-blue-700 font-bold border-b border-blue-200 pb-1 mb-2 text-xs uppercase">Saída</h4>
                     <div className="flex justify-between text-sm"><span>Venda:</span> <span className="font-bold">R$ {Number(selectedCar.valor).toLocaleString()}</span></div>
                  </div>
               </div>
            )}
            {activeTab === 'fotos' && (
              <div className="flex gap-4">
                  <div className="w-48 h-32 bg-gray-200 rounded flex items-center justify-center border text-gray-400 text-xs">Foto Principal</div>
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
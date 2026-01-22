/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { Search, ChevronDown, Camera, FilePlus, Edit, LockKeyhole, Filter, Trash2, User, Fuel, Wrench, DollarSign, TrendingUp, FileText } from 'lucide-react';
import VehicleModal from '../components/VehicleModal';
import CloseFileModal from '../components/CloseFileModal';
import DespesasModal from './DespesasModal';
import { API_BASE_URL } from '../api';

const Estoque = () => {
  // Estados de Dados
  const [vehicles, setVehicles] = useState([]); 
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [clients, setClients] = useState([]); // Lista de clientes para o autocomplete/modal
  
  // Estados de Interface
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  // Estado para controlar o modal de despesas
  const [selectedVehicleForExpenses, setSelectedVehicleForExpenses] = useState(null);
  
  // Estado para guardar o resumo financeiro (Despesas carregadas)
  const [financeiroData, setFinanceiroData] = useState({ despesas: [], totalDespesas: 0 });

  // --- CARREGAR DADOS DA API (Veículos e Clientes) ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Busca veículos e clientes em paralelo para otimizar
      const [vehiclesRes, clientsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/veiculos`),
        fetch(`${API_BASE_URL}/clientes`)
      ]);

      if (!vehiclesRes.ok || !clientsRes.ok) throw new Error('Erro ao buscar dados');

      const vehiclesData = await vehiclesRes.json();
      const clientsData = await clientsRes.json();

      setVehicles(vehiclesData);
      setFilteredVehicles(vehiclesData);
      setClients(clientsData); // Salva clientes para passar aos modais
      
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- BUSCAR DESPESAS QUANDO A ABA FINANCEIRO É ABERTA ---
  useEffect(() => {
    if (selectedCar && activeTab === 'financeiro') {
        const fetchDespesas = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/veiculos/${selectedCar.id}/despesas`);
                const data = await res.json();
                const total = data.reduce((acc, item) => acc + Number(item.valor), 0);
                setFinanceiroData({ despesas: data, totalDespesas: total });
            } catch (error) {
                console.error("Erro ao carregar financeiro", error);
            }
        };
        fetchDespesas();
    }
  }, [selectedCar, activeTab]);

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
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Tem certeza que deseja excluir o veículo ${selectedCar.modelo}?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/veiculos/${selectedCar.id}`, { 
                method: 'DELETE' 
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'O servidor recusou a exclusão.');
            }
            
            const updatedList = vehicles.filter(v => v.id !== selectedCar.id);
            setVehicles(updatedList);
            setFilteredVehicles(updatedList);
            setSelectedCar(null);
            
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir: " + error.message);
        }
    }
  };

  const handleSaveVehicle = async (data) => {
    try {
        let updatedList;
        // Se modalMode for 'create', cria novo (POST)
        if (modalMode === 'create') {
            const response = await fetch(`${API_BASE_URL}/veiculos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newVehicle = await response.json();
            updatedList = [newVehicle, ...vehicles];
        } 
        // Se modalMode for 'edit', atualiza existente (PUT)
        else {
            if (!selectedCar || !selectedCar.id) {
                alert("Erro: Nenhum veículo selecionado para edição.");
                return;
            }

            await fetch(`${API_BASE_URL}/veiculos/${selectedCar.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const updatedCar = { ...selectedCar, ...data }; 
            updatedList = vehicles.map(v => v.id === selectedCar.id ? updatedCar : v);
            setSelectedCar(updatedCar);
        }
        
        setVehicles(updatedList);
        setFilteredVehicles(updatedList);
        setIsModalOpen(false);
        
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar dados.");
    }
  };

  // --- FUNÇÃO ATUALIZADA DE FECHAMENTO DE VENDA ---
  const confirmCloseFicha = async (saleData) => {
     try {
        // Prepara o objeto para a tabela de VENDAS
        const payload = {
            veiculo_id: selectedCar.id,
            cliente_id: saleData.cliente_id,
            valor_venda: parseFloat(saleData.valor_venda),
            data_venda: saleData.data_venda,
            vendedor: saleData.vendedor, // Salva quem vendeu
            metodo_pagamento: saleData.metodo_pagamento,
            entrada: 0, 
            financiado: 0,
            observacoes: `Venda Fechada via Estoque. Obs: ${saleData.observacoes || ''}`
        };

        // Chama a rota POST /vendas (que cria a venda E marca o carro como vendido)
        const response = await fetch(`${API_BASE_URL}/vendas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Erro ao registrar venda");

        // Atualiza a lista localmente para refletir a mudança de status
        const updatedList = vehicles.map(v => 
            v.id === selectedCar.id ? { ...v, status: 'Vendido' } : v
        );
        
        setVehicles(updatedList);
        setFilteredVehicles(updatedList);
        
        // Atualiza o carro selecionado para mostrar que foi vendido
        setSelectedCar({ ...selectedCar, status: 'Vendido' });
        
        setIsCloseModalOpen(false);
        alert("Venda registrada com sucesso!");

     } catch (error) {
        console.error("Erro ao fechar ficha:", error);
        alert("Erro ao fechar o negócio. Verifique os dados.");
     }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-gray-50">
      
      {/* BARRA DE FERRAMENTAS */}
      <div className="bg-white p-2 rounded-t-lg shadow-sm border-b border-gray-200 flex flex-wrap gap-2 items-center mb-2">
         <button onClick={handleNewCar} className="flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all group min-w-[80px]">
            <FilePlus size={24} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Nova</span>
         </button>
         
         <div className="hidden md:block w-px h-10 bg-gray-300 mx-1"></div>
         
         {/* Botão de Custos / Despesas */}
         <button 
            onClick={() => {
                if (!selectedCar) return alert("Selecione um veículo para gerenciar custos.");
                setSelectedVehicleForExpenses(selectedCar);
            }}
            disabled={!selectedCar}
            className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-50 hover:border-yellow-200'}`}
         >
            <Wrench size={24} className="text-yellow-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Custos</span>
         </button>

         <button onClick={handleEditCar} disabled={!selectedCar} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <Edit size={24} className="text-orange-500 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Alterar</span>
         </button>
         
         <button onClick={handleCloseFicha} disabled={!selectedCar} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <LockKeyhole size={24} className="text-green-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Fechar</span>
         </button>
         
         <div className="hidden md:block w-px h-10 bg-gray-300 mx-1"></div>
         
         <button onClick={handleDeleteCar} disabled={!selectedCar} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}>
            <Trash2 size={24} className="text-red-500 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Excluir</span>
         </button>

         <div className="w-full md:flex-1"></div>
         
         <div className="w-full md:w-auto flex items-center bg-gray-100 rounded px-2 py-1 border border-gray-200 mt-2 md:mt-0">
             <Filter size={16} className="text-gray-400 mr-2"/>
             <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">Filtro:</span>
             <select className="bg-transparent text-sm outline-none text-gray-700 font-medium cursor-pointer flex-1 md:flex-none w-full">
                 <option>Todos</option>
                 <option>Em Estoque</option>
                 <option>Vendidos</option>
             </select>
         </div>
      </div>

      {/* LISTA DE VEÍCULOS */}
      <div className="bg-white rounded shadow-sm overflow-hidden flex-1 border border-gray-200 relative">
        <div className="absolute inset-0 overflow-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
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
                ) : filteredVehicles.length === 0 ? (
                   <tr><td colSpan="7" className="p-4 text-center text-gray-400">Nenhum veículo cadastrado.</td></tr>
                ) : (
                  filteredVehicles.map((car) => (
                    <tr 
                      key={car.id} 
                      onClick={() => { setSelectedCar(car); setActiveTab('detalhes'); }}
                      className={`cursor-pointer transition-colors ${selectedCar?.id === car.id ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-blue-50 text-gray-700'}`}
                    >
                      <td className="p-3">
                        {car.data_entrada 
                           ? new Date(car.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                           : car.dataEntrada 
                               ? new Date(car.dataEntrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                               : '-'}
                      </td>
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
      </div>

      {/* PAINEL INFERIOR DE DETALHES */}
      {selectedCar && (
        <div className="bg-white h-auto md:h-80 flex flex-col border-t-4 border-kadilac-300 animate-slide-up shadow-inner mt-2 z-20">
          <div className="flex border-b bg-gray-100 overflow-x-auto">
            {['Detalhes', 'Financeiro'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-3 text-sm font-bold border-r border-gray-300 whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'bg-white text-kadilac-500 border-t-2 border-t-kadilac-500' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                {tab === 'Financeiro' ? 'Financeiro / Despesas' : tab}
              </button>
            ))}
            <button 
              onClick={() => setActiveTab('fotos')}
              className={`px-6 py-3 text-sm font-bold border-r border-gray-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'fotos' ? 'bg-white text-kadilac-500 border-t-2 border-t-kadilac-500' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              <Camera size={14}/> Fotos
            </button>
            <div className="flex-1 flex justify-end items-center pr-4 bg-gray-100 min-w-[50px]">
               <button onClick={() => setSelectedCar(null)} className="text-gray-500 hover:text-red-600"><ChevronDown/></button>
            </div>
          </div>

          <div className="p-4 overflow-auto flex-1 bg-white max-h-[40vh] md:max-h-none">
            {activeTab === 'detalhes' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                
                {/* Coluna 1: Dados Principais */}
                <div className="space-y-2">
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Modelo:</span> <span className="font-bold uppercase">{selectedCar.modelo}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Placa:</span> <span className="font-bold uppercase">{selectedCar.placa}</span></div>
                   
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500 flex items-center gap-1"><Fuel size={12}/> Combustível:</span> 
                        <span>{selectedCar.combustivel || '-'}</span>
                   </div>
                   
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                       <span className="text-gray-500">Entrada:</span> 
                       <span className="font-bold">
                           {selectedCar.data_entrada ? new Date(selectedCar.data_entrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}
                       </span>
                   </div>
                </div>

                {/* Coluna 2: Dados de Origem e Doc */}
                <div className="space-y-2">
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500 flex items-center gap-1"><User size={12}/> Proprietário Ant.:</span> 
                        <span className="uppercase text-gray-700 font-medium">{selectedCar.proprietario_anterior || '-'}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-100 pb-1">
                       <span className="text-gray-500">Vendedor (Origem):</span> 
                       <span className="text-gray-700">{selectedCar.vendedor || '-'}</span>
                   </div>

                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Renavam:</span> <span>{selectedCar.renavam || '-'}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Chassi:</span> <span>{selectedCar.chassi || '-'}</span></div>
                   
                   {/* CAMPO DE VISUALIZAÇÃO: CERTIFICADO */}
                   <div className="flex justify-between border-b border-gray-100 pb-1 bg-blue-50 px-1 rounded">
                       <span className="text-blue-700 flex items-center gap-1 font-bold"><FileText size={12}/> Certificado:</span> 
                       <span className="font-bold text-gray-800">{selectedCar.certificado || '-'}</span>
                   </div>
                </div>

                {/* Coluna 3: Observações */}
                <div className="bg-yellow-50 p-2 border border-yellow-100 rounded text-xs text-gray-600 italic">
                   <span className="font-semibold block mb-1">Observações:</span>
                   {selectedCar.observacoes || "Sem observações cadastradas."}
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Valor de Compra */}
                  <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <DollarSign size={16} /> <span className="text-xs uppercase font-bold">Valor de Compra</span>
                      </div>
                      <span className="text-xl font-bold text-gray-800">
                          R$ {Number(selectedCar.custo || 0).toLocaleString()}
                      </span>
                  </div>

                  {/* Card 2: Despesas (Clicável) */}
                  <div 
                    onClick={() => setSelectedVehicleForExpenses(selectedCar)}
                    className="bg-red-50 p-4 rounded border border-red-100 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-red-100 transition-colors"
                  >
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                          <Wrench size={16} /> <span className="text-xs uppercase font-bold">Total Despesas</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xl font-bold text-red-700">
                            + R$ {financeiroData.totalDespesas.toLocaleString()}
                        </span>
                        <span className="text-[10px] bg-red-200 text-red-800 px-2 py-1 rounded">Ver Detalhes</span>
                      </div>
                  </div>

                  {/* Card 3: Custo Real Total */}
                  <div className="bg-gray-800 text-white p-4 rounded shadow-md flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                          <DollarSign size={16} /> <span className="text-xs uppercase font-bold">Custo Total Real</span>
                      </div>
                      <span className="text-2xl font-bold text-white">
                          R$ {(Number(selectedCar.custo || 0) + financeiroData.totalDespesas).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1">Compra + Despesas</span>
                  </div>

                  {/* Card 4: Preço de Venda / Lucro */}
                  <div className="bg-green-50 p-4 rounded border border-green-100 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                          <TrendingUp size={16} /> <span className="text-xs uppercase font-bold">Venda Esperada</span>
                      </div>
                      <span className="text-xl font-bold text-green-700">
                          R$ {Number(selectedCar.valor || 0).toLocaleString()}
                      </span>
                      <div className="border-t border-green-200 mt-2 pt-1 flex justify-between">
                          <span className="text-xs text-green-800">Lucro Est.:</span>
                          <span className="text-sm font-bold text-green-800">
                              R$ {(Number(selectedCar.valor || 0) - (Number(selectedCar.custo || 0) + financeiroData.totalDespesas)).toLocaleString()}
                          </span>
                      </div>
                  </div>

                </div>
            )}

            {activeTab === 'fotos' && (
              <div className="flex flex-wrap gap-4">
                  <div className="w-full md:w-48 h-32 bg-gray-200 rounded flex items-center justify-center border text-gray-400 text-xs overflow-hidden relative border-gray-300">
                      {selectedCar.foto ? (
                          <img 
                            src={selectedCar.foto} 
                            alt="Foto do Veículo" 
                            className="w-full h-full object-cover"
                          />
                      ) : (
                          <div className="flex flex-col items-center">
                              <Camera size={24} className="mb-1 text-gray-300"/>
                              <span>Sem Foto</span>
                          </div>
                      )}
                  </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO DO VEÍCULO */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveVehicle}
        initialData={selectedCar}
        mode={modalMode}
        clientsList={clients} // Passa lista de clientes para o autocomplete de proprietário
      />

      {/* MODAL DE FECHAMENTO DE VENDA (Com Vendedor) */}
      <CloseFileModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={confirmCloseFicha}
        vehicle={selectedCar}
        clientsList={clients} // Passa lista de clientes para escolher o comprador
      />
      
      {/* MODAL DE DESPESAS */}
      {selectedVehicleForExpenses && (
        <DespesasModal 
            vehicle={selectedVehicleForExpenses}
            onClose={() => {
                setSelectedVehicleForExpenses(null);
                // Força recarregar os dados do financeiro ao fechar o modal
                if(selectedCar && activeTab === 'financeiro') {
                    const fetchDespesas = async () => {
                        const res = await fetch(`${API_BASE_URL}/veiculos/${selectedCar.id}/despesas`);
                        const data = await res.json();
                        const total = data.reduce((acc, item) => acc + Number(item.valor), 0);
                        setFinanceiroData({ despesas: data, totalDespesas: total });
                    };
                    fetchDespesas();
                }
            }}
        />
      )}
    </div>
  );
};

export default Estoque;
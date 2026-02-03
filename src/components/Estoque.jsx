/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { ChevronDown, Camera, FilePlus, Edit, LockKeyhole, Filter, Trash2, User, Fuel, Wrench, DollarSign, TrendingUp, FileText, Paperclip, Plus } from 'lucide-react';
import VehicleModal from '../components/VehicleModal';
import CloseFileModal from '../components/CloseFileModal';
import DespesasModal from './DespesasModal';
import DocumentosModal from './DocumentosModal';
import api from '../api'; 

const Estoque = () => {
  // Estados de Dados
  const [vehicles, setVehicles] = useState([]); 
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [clients, setClients] = useState([]); 
  const [storeConfig, setStoreConfig] = useState(null); // Estado para Config da Loja
  
  // Estados de Interface
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedVehicleDocs, setSelectedVehicleDocs] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  
  // Estado para controlar o modal de despesas
  const [selectedVehicleForExpenses, setSelectedVehicleForExpenses] = useState(null);
  
  // Estado para guardar o resumo financeiro (para exibição na aba)
  const [financeiroData, setFinanceiroData] = useState({ despesas: [], totalDespesas: 0 });
  const [vehicleDocsList, setVehicleDocsList] = useState([]);

  // --- CARREGAR DADOS DA API ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Agora buscamos TUDO: Veículos, Clientes e Configuração da Loja
      const [vehiclesRes, clientsRes, configRes] = await Promise.all([
        api.get('/veiculos'),
        api.get('/clientes'),
        api.get('/config') 
      ]);

      setVehicles(vehiclesRes.data);
      setFilteredVehicles(vehiclesRes.data);
      setClients(clientsRes.data);
      setStoreConfig(configRes.data); // Salva a config para usar na impressão
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- BUSCAR DADOS SOB DEMANDA (Abas) ---
  useEffect(() => {
    if (!selectedCar) return;

    if (activeTab === 'financeiro') {
        const fetchDespesas = async () => {
            try {
                const res = await api.get(`/veiculos/${selectedCar.id}/despesas`);
                const data = res.data;
                const total = data.reduce((acc, item) => acc + Number(item.valor), 0);
                setFinanceiroData({ despesas: data, totalDespesas: total });
            } catch (error) { console.error(error); }
        };
        fetchDespesas();
    }

    if (activeTab === 'documentos') {
        const fetchDocs = async () => {
            try {
                const res = await api.get(`/veiculos/${selectedCar.id}/documentos`);
                setVehicleDocsList(Array.isArray(res.data) ? res.data : []);
            } catch (error) { console.error("Erro ao buscar docs", error); }
        };
        fetchDocs();
    }
  }, [selectedCar, activeTab]);

  const handleOpenDoc = (doc) => {
    const win = window.open();
    win.document.write(
        `<iframe src="${doc.arquivo}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  };

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
    if (selectedCar.status === 'Vendido') return alert("Este veículo já está vendido.");
    setIsCloseModalOpen(true);
  };

  const handleDeleteCar = async () => {
    if (!selectedCar) return;
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Tem certeza que deseja excluir o veículo ${selectedCar.modelo}?`)) {
        try {
            await api.delete(`/veiculos/${selectedCar.id}`);
            const updatedList = vehicles.filter(v => v.id !== selectedCar.id);
            setVehicles(updatedList);
            setFilteredVehicles(updatedList);
            setSelectedCar(null);
        } catch (error) {
            alert("Erro ao excluir: " + (error.response?.data?.message || error.message));
        }
    }
  };

  const handleSaveVehicle = async (data) => {
    try {
        let updatedList;
        if (modalMode === 'create') {
            const response = await api.post('/veiculos', data);
            updatedList = [response.data, ...vehicles];
        } else {
            if (!selectedCar || !selectedCar.id) return;
            await api.put(`/veiculos/${selectedCar.id}`, data);
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

  const confirmCloseFicha = async (saleData) => {
     try {
        const payload = {
            veiculo_id: selectedCar.id,
            cliente_id: saleData.cliente_id,
            valor_venda: parseFloat(saleData.valor_venda),
            data_venda: saleData.data_venda,
            vendedor: saleData.vendedor,
            metodo_pagamento: saleData.metodo_pagamento,
            entrada: 0, financiado: 0,
            observacoes: `Venda Fechada via Estoque. Obs: ${saleData.observacoes || ''}`
        };

        await api.post('/vendas', payload);
        
        const clientComprador = clients.find(c => c.id === parseInt(saleData.cliente_id));
        const updatedCar = { 
            ...selectedCar, 
            status: 'Vendido',
            cliente_nome: clientComprador ? clientComprador.nome : 'Cliente',
            valor: saleData.valor_venda,
            vendedor: saleData.vendedor
        };

        const updatedList = vehicles.map(v => v.id === selectedCar.id ? updatedCar : v);
        setVehicles(updatedList);
        setFilteredVehicles(updatedList);
        setSelectedCar(updatedCar);
        setIsCloseModalOpen(false);
        alert("Venda registrada com sucesso!");
     } catch (error) {
        console.error(error);
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
         
         <button 
            onClick={() => {
                if (!selectedCar) return alert("Selecione um veículo.");
                setSelectedVehicleForExpenses(selectedCar);
            }}
            disabled={!selectedCar}
            className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-50 hover:border-yellow-200'}`}
         >
            <Wrench size={24} className="text-yellow-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Custos</span>
         </button>

         <button 
              onClick={() => {
                if (!selectedCar) return alert("Selecione um veículo.");
                setSelectedVehicleDocs(selectedCar);
              }}
              disabled={!selectedCar}
              className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 hover:border-indigo-200'}`}
              title="Gerenciar Documentos">
              <Paperclip size={24} className='mb-1 text-indigo-600 group-hover:scale-110 transition-transform'/>
              <span className='text-xs font-bold text-gray-600'>Docs</span>
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
                           : car.dataEntrada ? new Date(car.dataEntrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </td>
                      <td className="p-3 uppercase">{car.modelo}</td>
                      <td className="p-3">{car.cor}</td>
                      <td className="p-3">{car.ano}</td>
                      <td className="p-3 uppercase font-mono">{car.placa}</td>
                      <td className="p-3">R$ {Number(car.valor).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto ${car.status === 'Em estoque' ? 'bg-green-500' : car.status === 'Vendido' ? 'bg-red-500' : 'bg-yellow-500'}`} title={car.status}></div>
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
        <div className="bg-white h-auto md:h-80 flex flex-col border-t-4 border-kadilac-300 animate-slide-up shadow-[0_-5px_20px_rgba(0,0,0,0.1)] mt-2 z-20">
          
          {/* ABAS DO PAINEL */}
          <div className="flex border-b bg-gray-50 overflow-x-auto">
            {['Detalhes', 'Financeiro'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-3 text-sm font-bold border-r border-gray-200 whitespace-nowrap transition-colors ${activeTab === tab.toLowerCase() ? 'bg-white text-kadilac-600 border-t-2 border-t-kadilac-600' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {tab === 'Financeiro' ? 'Financeiro / Despesas' : tab}
              </button>
            ))}
            <button 
              onClick={() => setActiveTab('fotos')}
              className={`px-6 py-3 text-sm font-bold border-r border-gray-200 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'fotos' ? 'bg-white text-kadilac-600 border-t-2 border-t-kadilac-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Camera size={14}/> Fotos
            </button>
            
            <button 
              onClick={() => setActiveTab('documentos')}
              className={`px-6 py-3 text-sm font-bold border-r border-gray-200 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'documentos' ? 'bg-white text-indigo-600 border-t-2 border-t-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <Paperclip size={14}/> Arquivos
            </button>

            <div className="flex-1 flex justify-end items-center pr-4 bg-gray-50 min-w-[50px]">
               <button onClick={() => setSelectedCar(null)} className="text-gray-400 hover:text-red-600 p-1 hover:bg-gray-200 rounded transition-colors"><ChevronDown/></button>
            </div>
          </div>

          {/* CONTEÚDO DO PAINEL */}
          <div className="p-4 overflow-auto flex-1 bg-white max-h-[40vh] md:max-h-none">
            
            {/* 1. DETALHES */}
            {activeTab === 'detalhes' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm animate-fade-in h-full">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Modelo:</span> <span className="font-bold uppercase">{selectedCar.modelo}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Placa:</span> <span className="font-bold uppercase">{selectedCar.placa}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500 flex items-center gap-1"><Fuel size={12}/> Combustível:</span> <span>{selectedCar.combustivel || '-'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Entrada:</span> <span className="font-bold">{selectedCar.data_entrada ? new Date(selectedCar.data_entrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</span></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500 flex items-center gap-1"><User size={12}/> Proprietário Ant.:</span> <span className="uppercase text-gray-700 font-medium">{selectedCar.proprietario_anterior || '-'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Vendedor:</span> <span className="text-gray-700">{selectedCar.vendedor || '-'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1 bg-blue-50 px-1 rounded"><span className="text-blue-700 flex items-center gap-1 font-bold"><FileText size={12}/> Certificado:</span> <span className="font-bold text-gray-800">{selectedCar.certificado || '-'}</span></div>
                    {selectedCar.status === 'Vendido' && (
                        <div className="flex justify-between border-b border-green-200 bg-green-50 px-1 rounded pb-1">
                            <span className="text-green-700 font-bold">Comprador:</span> <span className="text-green-900 font-bold uppercase">{selectedCar.cliente_nome || '-'}</span>
                        </div>
                    )}
                  </div>
                  
                  <div className="bg-yellow-50 p-2 border border-yellow-100 rounded text-xs text-gray-600 italic">
                    <span className="font-semibold block mb-1">Observações:</span>
                    {selectedCar.observacoes || "Sem observações cadastradas."}
                  </div>
               </div>
            )}

            {/* 2. FINANCEIRO */}
            {activeTab === 'financeiro' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                  <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-gray-500 mb-2"><DollarSign size={16} /> <span className="text-xs uppercase font-bold">Valor de Compra</span></div>
                      <span className="text-xl font-bold text-gray-800">R$ {Number(selectedCar.custo || 0).toLocaleString()}</span>
                  </div>
                  <div onClick={() => setSelectedVehicleForExpenses(selectedCar)} className="bg-red-50 p-4 rounded border border-red-100 shadow-sm flex flex-col justify-between cursor-pointer hover:bg-red-100 transition-colors">
                      <div className="flex items-center gap-2 text-red-600 mb-2"><Wrench size={16} /> <span className="text-xs uppercase font-bold">Total Despesas</span></div>
                      <div className="flex justify-between items-end"><span className="text-xl font-bold text-red-700">+ R$ {financeiroData.totalDespesas.toLocaleString()}</span><span className="text-[10px] bg-red-200 text-red-800 px-2 py-1 rounded">Ver Detalhes</span></div>
                  </div>
                  <div className="bg-gray-800 text-white p-4 rounded shadow-md flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-gray-400 mb-2"><DollarSign size={16} /> <span className="text-xs uppercase font-bold">Custo Total Real</span></div>
                      <span className="text-2xl font-bold text-white">R$ {(Number(selectedCar.custo || 0) + financeiroData.totalDespesas).toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 mt-1">Compra + Despesas</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-100 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-green-700 mb-2"><TrendingUp size={16} /> <span className="text-xs uppercase font-bold">Venda Esperada</span></div>
                      <span className="text-xl font-bold text-green-700">R$ {Number(selectedCar.valor || 0).toLocaleString()}</span>
                      <div className="border-t border-green-200 mt-2 pt-1 flex justify-between"><span className="text-xs text-green-800">Lucro Est.:</span><span className="text-sm font-bold text-green-800">R$ {(Number(selectedCar.valor || 0) - (Number(selectedCar.custo || 0) + financeiroData.totalDespesas)).toLocaleString()}</span></div>
                  </div>
                </div>
            )}

            {/* 3. FOTOS */}
            {activeTab === 'fotos' && (
              <div className="flex flex-wrap gap-4 animate-fade-in">
                  <div className="w-full md:w-48 h-32 bg-gray-200 rounded flex items-center justify-center border text-gray-400 text-xs overflow-hidden relative border-gray-300">
                      {selectedCar.foto ? <img src={selectedCar.foto} alt="Foto" className="w-full h-full object-cover"/> : <div className="flex flex-col items-center"><Camera size={24} className="mb-1 text-gray-300"/><span>Sem Foto</span></div>}
                  </div>
              </div>
            )}

            {/* 4. DOCUMENTOS (LISTA DE ARQUIVOS) */}
            {activeTab === 'documentos' && (
                <div className="animate-fade-in h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            <Paperclip size={16} className="text-indigo-500"/> Arquivos Anexados
                        </h3>
                        <button 
                            onClick={() => setSelectedVehicleDocs(selectedCar)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <Plus size={14}/> Gerenciar Documentos
                        </button>
                    </div>

                    {vehicleDocsList.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 text-gray-400">
                            <FileText size={32} className="mb-2 opacity-50"/>
                            <p className="text-xs">Nenhum documento encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {vehicleDocsList.map((doc) => (
                                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className={`p-2 rounded ${doc.tipo && doc.tipo.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                            <FileText size={20}/>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-xs text-gray-700 truncate" title={doc.titulo}>{doc.titulo}</p>
                                            <p className="text-[10px] text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-1 border-t pt-2 border-gray-100">
                                        <button 
                                            onClick={() => handleOpenDoc(doc)}
                                            className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 py-1 rounded transition-colors"
                                            title="Visualizar"
                                        >
                                            <FileText size={12}/> Ver
                                        </button>
                                        <a 
                                            href={doc.arquivo} 
                                            download={doc.titulo}
                                            className="flex-1 flex items-center justify-center gap-1 text-[10px] bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-600 py-1 rounded transition-colors"
                                            title="Baixar"
                                        >
                                            <Camera size={12}/> Baixar
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAIS --- */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveVehicle}
        initialData={selectedCar}
        mode={modalMode}
        clientsList={clients} 
      />

      <CloseFileModal 
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={confirmCloseFicha}
        vehicle={selectedCar}
        clientsList={clients}
      />

      {/* Aqui passamos as Props para o DocumentosModal */}
      {selectedVehicleDocs && (
        <DocumentosModal 
            vehicle={selectedVehicleDocs} 
            storeConfig={storeConfig} // <-- IMPORTANTE
            clients={clients}         // <-- IMPORTANTE
            onClose={() => {
                setSelectedVehicleDocs(null);
                if (activeTab === 'documentos' && selectedCar) {
                    const fetchDocs = async () => {
                        const res = await api.get(`/veiculos/${selectedCar.id}/documentos`);
                        setVehicleDocsList(res.data);
                    };
                    fetchDocs();
                }
            }} 
        />
      )}
      
      {selectedVehicleForExpenses && (
        <DespesasModal 
            vehicle={selectedVehicleForExpenses}
            onClose={() => {
                setSelectedVehicleForExpenses(null);
                if(selectedCar && activeTab === 'financeiro') {
                    const fetchDespesas = async () => {
                        const res = await api.get(`/veiculos/${selectedCar.id}/despesas`);
                        const data = res.data;
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
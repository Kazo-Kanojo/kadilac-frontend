/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
// ADICIONADO: Trash2 na importação abaixo
import { ChevronDown, Camera, FilePlus, Edit, LockKeyhole, Filter, Wrench, TrendingUp, FileText, Paperclip, Plus, ArrowRightLeft, ArrowRight, Trash2, Search, Share2 } from 'lucide-react';
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
  const [storeConfig, setStoreConfig] = useState(null); 
  
  // Estados de Interface
  const [selectedCar, setSelectedCar] = useState(null);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedVehicleDocs, setSelectedVehicleDocs] = useState(null);
  const [selectedVehicleForExpenses, setSelectedVehicleForExpenses] = useState(null);
  const [tradeInInfo, setTradeInData] = useState(null);
  
  // Estado financeiro
  const [financeiroData, setFinanceiroData] = useState({ despesas: [], totalDespesas: 0, totalReceitas: 0 });
  const [vehicleDocsList, setVehicleDocsList] = useState([]);

  // --- CARREGAR DADOS ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [vehiclesRes, clientsRes, configRes] = await Promise.all([
        api.get('/veiculos'),
        api.get('/clientes'),
        api.get('/config') 
      ]);

      setVehicles(vehiclesRes.data);
      setClients(clientsRes.data);
      setStoreConfig(configRes.data);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DO FILTRO ---
  useEffect(() => {
    let filtered = vehicles;

    // 1. Filtrar por Status
    if (filterStatus === 'Em Estoque') {
      filtered = filtered.filter(v => v.status === 'Em estoque' || v.status === 'Disponível');
    } else if (filterStatus === 'Vendidos') {
      filtered = filtered.filter(v => v.status === 'Vendido');
    }

    // 2. Filtrar por Termo de Busca (Placa, Modelo, Ano ou Cor)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        (v.modelo && v.modelo.toLowerCase().includes(lowerTerm)) ||
        (v.placa && v.placa.toLowerCase().includes(lowerTerm)) ||
        (v.ano && String(v.ano).includes(lowerTerm)) ||
        (v.cor && v.cor.toLowerCase().includes(lowerTerm))
      );
    }

    setFilteredVehicles(filtered);
  }, [filterStatus, searchTerm, vehicles]);

  // --- EFEITO PARA CARREGAR DADOS DAS ABAS ---
  useEffect(() => {
    if (!selectedCar) return;

    // Carrega dados tanto na aba de Despesas quanto na Financeiro
    if (activeTab === 'despesas' || activeTab === 'financeiro') {
        const fetchDespesas = async () => {
            try {
                const res = await api.get(`/veiculos/${selectedCar.id}/despesas`);
                const data = res.data;
                const despesasTotal = data.filter(d => d.tipo !== 'receita').reduce((acc, item) => acc + Number(item.valor), 0);
                const receitasTotal = data.filter(d => d.tipo === 'receita').reduce((acc, item) => acc + Number(item.valor), 0);
                
                setFinanceiroData({ despesas: data, totalDespesas: despesasTotal, totalReceitas: receitasTotal });
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
  // --- ALTERAÇÃO AQUI: LÓGICA DE SUCESSO DO VEÍCULO ---
  const handleVehicleSuccess = (savedData) => {
    fetchData(); // Atualiza a lista
    setIsModalOpen(false); // Fecha o modal de cadastro

    // SE FOR UMA TROCA, INICIA O FLUXO INTELIGENTE
    if (savedData && savedData.isTradeIn && savedData.tradeInTargetId) {
        const targetCar = vehicles.find(v => v.id === parseInt(savedData.tradeInTargetId));

        if (targetCar) {
            // 2. Define ele como o carro selecionado
            setSelectedCar(targetCar);
            setTradeInData({
                model: savedData.modelo,
                value: Number(savedData.preco_compra || savedData.tradeInValue || 0) // Valor que entrou
            });
            setTimeout(() => {
                setIsCloseModalOpen(true);
            }, 300);
        }
    }
  };
  const handleNewCar = () => { setSelectedCar(null); setIsModalOpen(true); };
  const handleEditCar = () => { if (!selectedCar) return alert("Selecione um veículo."); setIsModalOpen(true); };
  const handleCloseFicha = () => { if (!selectedCar) return alert("Selecione um veículo."); if (selectedCar.status === 'Vendido') return alert("Já vendido."); setIsCloseModalOpen(true); };

  const confirmCloseFicha = async (saleData) => {
     try {
        const payload = { ...saleData, veiculo_id: selectedCar.id };
        await api.post('/vendas', payload);
        fetchData(); 
        setIsCloseModalOpen(false);
        alert(`${saleData.operacao} registrada com sucesso!`);
     } catch (error) {
        alert("Erro ao processar operação.");
     }
  };
// --- EXPORTAR CATÁLOGO WHATSAPP ---
  const handleExportCatalog = () => {
    const availableCars = vehicles.filter(v => v.status === 'Em estoque' || v.status === 'Disponível');

    if (availableCars.length === 0) {
        return alert("Não existem veículos disponíveis no momento para gerar o catálogo.");
    }

    const nomeLoja = storeConfig?.nome || 'Nossa Loja';
    let catalogText = `🚗 *Estoque Atualizado - ${nomeLoja}* 🚗\n\n`;

    availableCars.forEach(car => {
        const valorFormatado = Number(car.valor).toLocaleString('pt-BR');
        catalogText += `🔹 *${car.modelo.toUpperCase()}* (${car.ano}) - R$ ${valorFormatado}\n`;
    });

    catalogText += `\n📲 *Interessado? Responda a esta mensagem para mais detalhes!*`;

    navigator.clipboard.writeText(catalogText)
        .then(() => alert("Catálogo copiado com sucesso! Agora é só colar no WhatsApp ou Instagram."))
        .catch(err => {
            console.error('Erro ao copiar', err);
            alert("Não foi possível copiar automaticamente. Verifique as permissões do navegador.");
        });
  };
  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-gray-50">
      
      {/* BARRA DE FERRAMENTAS */}
      <div className="bg-white p-2 rounded-t-lg shadow-sm border-b border-gray-200 flex flex-wrap gap-2 items-center mb-2 shrink-0">
         <button onClick={handleNewCar} className="flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all group min-w-[80px]">
            <FilePlus size={24} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Nova</span>
         </button>
         <button onClick={handleExportCatalog} className="flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] hover:bg-green-50 hover:border-green-200" title="Copiar Catálogo para WhatsApp">
            <Share2 size={24} className="text-[#25D366] mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Catálogo</span>
         </button>

         <div className="hidden md:block w-px h-10 bg-gray-300 mx-1"></div>
         
         <div className="hidden md:block w-px h-10 bg-gray-300 mx-1"></div>
         
         <button onClick={() => { if (!selectedCar) return alert("Selecione um veículo."); setSelectedVehicleForExpenses(selectedCar); }} disabled={!selectedCar} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-50 hover:border-yellow-200'}`}>
            <Wrench size={24} className="text-yellow-600 mb-1 group-hover:scale-110 transition-transform"/>
            <span className="text-xs font-bold text-gray-600">Custos</span>
         </button>

         <button onClick={() => { if (!selectedCar) return alert("Selecione um veículo."); setSelectedVehicleDocs(selectedCar); }} disabled={!selectedCar} className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedCar ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 hover:border-indigo-200'}`} title="Gerenciar Documentos">
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
         
         <div className="w-full md:flex-1"></div>
         
         {/* FILTRO */}
         {/* FILTROS E BUSCA */}
         <div className="w-full md:w-auto flex flex-col md:flex-row gap-2 items-center mt-2 md:mt-0">
             
             {/* Busca de texto */}
             <div className="relative w-full md:w-64">
                <input
                    type="text"
                    placeholder="Buscar modelo, placa, ano..."
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2 text-gray-400" size={16} />
             </div>

             {/* Filtro de Status */}
             <div className="w-full md:w-auto flex items-center bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
                 <Filter size={16} className="text-gray-400 mr-2"/>
                 <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">Status:</span>
                 <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-sm outline-none text-gray-700 font-bold cursor-pointer flex-1 md:flex-none w-full"
                 >
                     <option value="Todos">Todos</option>
                     <option value="Em Estoque">Em Estoque</option>
                     <option value="Vendidos">Vendidos</option>
                 </select>
             </div>
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
                   <tr><td colSpan="7" className="p-4 text-center text-gray-400">Nenhum veículo encontrado no filtro.</td></tr>
                ) : (
                  filteredVehicles.map((car) => (
                    <tr key={car.id} onClick={() => { setSelectedCar(car); setActiveTab('detalhes'); }} className={`cursor-pointer transition-colors ${selectedCar?.id === car.id ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-blue-50 text-gray-700'}`}>
                      <td className="p-3">{car.data_entrada ? new Date(car.data_entrada).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                      <td className="p-3 uppercase">{car.modelo}</td>
                      <td className="p-3">{car.cor}</td>
                      <td className="p-3">{car.ano}</td>
                      <td className="p-3 uppercase font-mono">{car.placa}</td>
                      <td className="p-3">R$ {Number(car.valor).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto ${car.status === 'Em estoque' || car.status === 'Disponível' ? 'bg-green-500' : car.status === 'Vendido' ? 'bg-red-500' : 'bg-yellow-500'}`} title={car.status}></div>
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
        <div className="bg-white h-auto md:h-80 flex flex-col border-t-4 border-blue-500 animate-slide-up shadow-[0_-5px_20px_rgba(0,0,0,0.1)] mt-2 z-20 shrink-0">
          
          {/* ABAS DO PAINEL */}
          <div className="flex border-b bg-gray-50 overflow-x-auto">
            {['Detalhes', 'Despesas', 'Financeiro'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab.toLowerCase())} className={`px-6 py-3 text-sm font-bold border-r border-gray-200 whitespace-nowrap transition-colors ${activeTab === tab.toLowerCase() ? 'bg-white text-blue-700 border-t-2 border-t-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'despesas' ? '/ Receitas' : ''}
              </button>
            ))}
            <button onClick={() => setActiveTab('fotos')} className={`px-6 py-3 text-sm font-bold border-r border-gray-200 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'fotos' ? 'bg-white text-blue-700 border-t-2 border-t-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Camera size={14}/> Fotos
            </button>
            <button onClick={() => setActiveTab('documentos')} className={`px-6 py-3 text-sm font-bold border-r border-gray-200 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'documentos' ? 'bg-white text-indigo-600 border-t-2 border-t-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}>
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
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 border-b">Veículo & Fluxo</h3>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Modelo:</span> <span className="font-bold uppercase text-gray-700">{selectedCar.modelo}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Placa:</span> <span className="font-bold uppercase text-gray-700">{selectedCar.placa}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Ano/Cor:</span> <span className="font-bold">{selectedCar.ano} • {selectedCar.cor}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Operação Entrada:</span> <span className={`font-bold ${selectedCar.operacao === 'Troca' ? 'text-blue-600' : 'text-gray-700'}`}>{selectedCar.operacao || 'Compra'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Operação Saída</span> <span className={`font-bold ${selectedCar.status === 'Vendido' ? 'text-red-600' : 'text-green-600'}`}>{selectedCar.status === 'Vendido' ? (selectedCar.operacao_saida || 'Venda') : 'Em Estoque'}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Entrada em:</span> <span className="font-bold">{selectedCar.data_entrada ? new Date(selectedCar.data_entrada).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</span></div>
                    {selectedCar.status === 'Vendido' && (
                        <div className="flex justify-between border-b border-green-100 bg-green-50 px-1 rounded pb-1"><span className="text-green-700 font-bold">Saída em:</span> <span className="font-bold text-green-800">{selectedCar.data_venda ? new Date(selectedCar.data_venda).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</span></div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 border-b">Pessoas & Acessórios</h3>
                    <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Proprietário Ant.:</span> <span className="uppercase text-gray-700 font-medium">{selectedCar.proprietario_anterior || '-'}</span></div>
                    {selectedCar.status === 'Vendido' && (
                        <>
                            <div className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">Quem Vendeu (Loja):</span> <span className="text-gray-700 font-bold">{selectedCar.vendedor || '-'}</span></div>
                            <div className="flex justify-between border-b border-indigo-100 bg-indigo-50 px-1 rounded pb-1"><span className="text-indigo-700 font-bold">Comprador / Destino:</span> <span className="text-indigo-900 font-bold uppercase">{selectedCar.cliente_nome || '-'}</span></div>
                        </>
                    )}
                    <div className="mt-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Opcionais Selecionados:</p>
                        <div className="flex flex-wrap gap-1">
                            {selectedCar.opcionais && selectedCar.opcionais.length > 0 ? (
                                selectedCar.opcionais.map((opt, idx) => (<span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase" title={opt.name}>{opt.code}</span>))
                            ) : (<span className="text-gray-400 italic text-[11px]">Nenhum opcional</span>)}
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 border-b">Observações Gerais</h3>
                    <div className="bg-yellow-50 p-3 border border-yellow-100 rounded text-xs text-gray-600 italic flex-1 overflow-y-auto custom-scrollbar">
                        {selectedCar.observacoes || selectedCar.descricao || "Sem observações cadastradas."}
                    </div>
                  </div>
              </div>
            )}

            {/* 2. DESPESAS (COM A CORREÇÃO DO TRASH2) */}
            {activeTab === 'despesas' && (
                <div className="animate-fade-in h-full flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2"><Wrench size={16} className="text-orange-500"/> Lançamentos do Veículo</h3>
                        <button onClick={() => setSelectedVehicleForExpenses(selectedCar)} className="bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-sm"><Plus size={14}/> Lançar Custo/Receita</button>
                    </div>
                    <div className="flex-1 overflow-auto border rounded-lg bg-white shadow-sm">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 sticky top-0 border-b font-bold uppercase">
                                <tr>
                                    <th className="p-3 w-24">Data</th>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3 w-24 text-center">Tipo</th>
                                    <th className="p-3 w-32">Valor</th>
                                    <th className="p-3 w-20 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {financeiroData.despesas.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 italic">Nenhum gasto ou receita registrado.</td></tr>
                                ) : (
                                    financeiroData.despesas.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-gray-500">{new Date(item.data_despesa).toLocaleDateString()}</td>
                                            <td className="p-3 font-medium text-gray-700 uppercase">{item.descricao}</td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.tipo || 'despesa'}</span>
                                            </td>
                                            <td className={`p-3 font-bold text-sm ${item.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>{item.tipo === 'receita' ? '+ ' : '- '}{Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => setSelectedVehicleForExpenses({ ...selectedCar, editExpense: item })} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all" title="Editar"><Edit size={14}/></button>
                                                    <button onClick={async () => {
                                                        if(window.confirm("Deseja realmente excluir este lançamento?")) {
                                                            try {
                                                                await api.delete(`/despesas/${item.id}`);
                                                                const res = await api.get(`/veiculos/${selectedCar.id}/despesas`);
                                                                const data = res.data;
                                                                const totalD = data.filter(d => d.tipo !== 'receita').reduce((acc, i) => acc + Number(i.valor), 0);
                                                                const totalR = data.filter(d => d.tipo === 'receita').reduce((acc, i) => acc + Number(i.valor), 0);
                                                                setFinanceiroData({ despesas: data, totalDespesas: totalD, totalReceitas: totalR });
                                                            } catch (e) { alert("Erro ao excluir."); }
                                                        }
                                                    }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Excluir"><Trash2 size={14}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. FINANCEIRO */}
            {activeTab === 'financeiro' && (
                <div className="animate-fade-in h-full flex flex-col lg:flex-row gap-4 p-4 overflow-y-auto custom-scrollbar">
                    
                    {/* COLUNA ESQUERDA: ENTRADA */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                        
                        <div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <ArrowRightLeft size={16}/> Operação de Entrada
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                    <span className="text-gray-600 text-xs sm:text-sm">Valor de Compra</span>
                                    <span className="font-bold text-gray-800 text-sm sm:text-base">R$ {Number(selectedCar.custo || 0).toLocaleString()}</span>
                                </div>
                                
                                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                    <span className="text-gray-600 text-xs sm:text-sm">Total Despesas (+)</span>
                                    <span className="font-bold text-red-600 text-sm sm:text-base">R$ {financeiroData.totalDespesas.toLocaleString()}</span>
                                </div>

                                {selectedCar.operacao === 'Troca' && (
                                    <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100 text-xs">
                                        <p className="text-blue-700 font-bold mb-1">Origem: Troca</p>
                                        <p className="text-gray-600">Ref: <span className="font-bold">{selectedCar.veiculo_troca || 'Veículo anterior'}</span></p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Custo Total Acumulado</p>
                            <p className="text-xl sm:text-2xl font-black text-gray-800 break-all leading-tight">
                                R$ {(Number(selectedCar.custo || 0) + financeiroData.totalDespesas).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center text-gray-300 shrink-0 py-2 lg:py-0">
                        <ChevronDown size={24} className="lg:hidden"/> 
                        <ArrowRight size={32} className="hidden lg:block"/>
                    </div>

                    {/* COLUNA DIREITA: SAÍDA */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${selectedCar.status === 'Vendido' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        
                        <div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TrendingUp size={16}/> {selectedCar.status === 'Vendido' ? 'Operação de Saída' : 'Expectativa de Saída'}
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                    <span className="text-gray-600 text-xs sm:text-sm">{selectedCar.status === 'Vendido' ? 'Valor Final Venda' : 'Preço de Venda (Meta)'}</span>
                                    <span className="font-bold text-green-700 text-sm sm:text-base">R$ {Number(selectedCar.valor || 0).toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                                    <span className="text-gray-600 text-xs sm:text-sm">Receitas Extras (+)</span>
                                    <span className="font-bold text-green-600 text-sm sm:text-base">R$ {financeiroData.totalReceitas.toLocaleString()}</span>
                                </div>

                                {selectedCar.operacao_saida === 'Troca' && (
                                    <div className="bg-orange-50 p-2 sm:p-3 rounded-lg border border-orange-100 text-xs">
                                        <p className="text-orange-700 font-bold mb-1">Saída com Troca</p>
                                        <p className="text-gray-600">Entrada de outro veículo como parte.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                                {selectedCar.status === 'Vendido' ? 'Lucro Real Consolidado' : 'Projeção de Lucro'}
                            </p>
                            <p className={`text-xl sm:text-2xl font-black break-all leading-tight ${selectedCar.status === 'Vendido' ? 'text-green-600' : 'text-blue-600'}`}>
                                R$ {(Number(selectedCar.valor || 0) + financeiroData.totalReceitas - (Number(selectedCar.custo || 0) + financeiroData.totalDespesas)).toLocaleString()}
                            </p>
                        </div>
                    </div>

                </div>
            )}

            {/* 4. FOTOS */}
            {activeTab === 'fotos' && (
              <div className="flex flex-wrap gap-4 animate-fade-in">
                  <div className="w-full md:w-48 h-32 bg-gray-200 rounded flex items-center justify-center border text-gray-400 text-xs overflow-hidden relative border-gray-300">
                      {selectedCar.foto ? <img src={selectedCar.foto} alt="Foto" className="w-full h-full object-cover"/> : <div className="flex flex-col items-center"><Camera size={24} className="mb-1 text-gray-300"/><span>Sem Foto</span></div>}
                  </div>
              </div>
            )}

            {/* 5. DOCUMENTOS */}
            {activeTab === 'documentos' && (
                <div className="animate-fade-in h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2"><Paperclip size={16} className="text-indigo-500"/> Arquivos Anexados</h3>
                        <button onClick={() => setSelectedVehicleDocs(selectedCar)} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"><Plus size={14}/> Gerenciar Documentos</button>
                    </div>
                    {vehicleDocsList.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50 text-gray-400">
                            <FileText size={32} className="mb-2 opacity-50"/><p className="text-xs">Nenhum documento encontrado.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {vehicleDocsList.map((doc) => (
                                <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                                    <div className="flex items-start gap-3 mb-2 overflow-hidden">
                                        <div className={`p-2 rounded shrink-0 ${doc.tipo && doc.tipo.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}><FileText size={20}/></div>
                                        <div className="truncate"><p className="font-bold text-xs text-gray-700 truncate" title={doc.titulo}>{doc.titulo}</p><p className="text-[10px] text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p></div>
                                    </div>
                                    <div className="flex gap-2 mt-1 border-t pt-2 border-gray-100">
                                        <button onClick={() => handleOpenDoc(doc)} className="flex-1 text-[10px] bg-gray-50 hover:bg-indigo-50 text-gray-600 py-1 rounded transition-colors">Ver</button>
                                        <a href={doc.arquivo} download={doc.titulo} className="flex-1 text-center text-[10px] bg-gray-50 hover:bg-green-50 text-gray-600 py-1 rounded transition-colors">Baixar</a>
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
      {isModalOpen && (
        <VehicleModal 
            vehicle={selectedCar} 
            clients={clients} 
            vehiclesList={vehicles}
            onClose={() => setIsModalOpen(false)} 
            onSuccess={handleVehicleSuccess} // <--- Função Atualizada
        />
      )}

      <CloseFileModal 
        isOpen={isCloseModalOpen}
        onClose={() => {
            setIsCloseModalOpen(false);
            setTradeInData(null); // Limpa a troca ao fechar
        }}
        onConfirm={confirmCloseFicha}
        vehicle={selectedCar}
        clientsList={clients}
        tradeInInfo={tradeInInfo} // <--- Passando a nova Prop
      />

      {selectedVehicleDocs && (
        <DocumentosModal 
            vehicle={selectedVehicleDocs} 
            storeConfig={storeConfig}
            clients={clients}
            onClose={() => {
                setSelectedVehicleDocs(null);
                if (activeTab === 'documentos' && selectedCar) fetchData();
            }} 
        />
      )}
      
      {selectedVehicleForExpenses && (
        <DespesasModal 
            vehicle={selectedVehicleForExpenses}
            onClose={() => {
                setSelectedVehicleForExpenses(null);
                if(selectedCar && (activeTab === 'financeiro' || activeTab === 'despesas')) fetchData();
            }}
        />
      )}
    </div>
  );
};

export default Estoque;
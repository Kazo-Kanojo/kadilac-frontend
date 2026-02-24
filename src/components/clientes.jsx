import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit, Briefcase, User, Phone, MapPin, History, Car, ChevronDown, Calendar, Mail, MessageCircle, Send, X, MessageSquare } from 'lucide-react';
import ClientModal from './ClientModal';
import api from '../api'; 

// --- NOVO COMPONENTE: MODAL DE MENSAGENS DO WHATSAPP ---
const WhatsAppModal = ({ isOpen, onClose, client }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (isOpen) setText(''); // Limpa o texto ao abrir
    }, [isOpen]);

    if (!isOpen || !client) return null;

    // Modelos de mensagens prontos
    const templates = [
        {
            id: 1,
            label: 'Boas-vindas',
            content: `Olá ${client.nome}, tudo bem? Aqui é da Kadilac Veículos.\n\nComo posso ajudar você hoje na busca do seu novo carro?`
        },
        {
            id: 2,
            label: 'Proposta / Simulação',
            content: `Olá ${client.nome}, tudo bem?\n\nConforme conversamos, segue a proposta/simulação do veículo. Qualquer dúvida, estou à disposição para fecharmos negócio!`
        },
        {
            id: 3,
            label: 'Pós-Venda',
            content: `Olá ${client.nome}! Parabéns pela aquisição.\n\nEstou passando apenas para saber se está tudo bem com o veículo e me colocar à disposição para o que precisar.`
        }
    ];

    const handleSend = () => {
        if (!text.trim()) return alert('Digite uma mensagem antes de enviar.');
        if (!client.telefone) return alert('Este cliente não tem telefone cadastrado.');

        const cleanPhone = client.telefone.replace(/\D/g, '');
        // Adiciona o 55 do Brasil se o número tiver 11 ou 10 dígitos
        const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
        
        // Codifica o texto para formato de URL (preservando quebras de linha)
        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="bg-[#25D366] text-white px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <MessageCircle size={20} /> Enviar Mensagem
                        </h2>
                        <p className="text-sm text-green-100 mt-0.5">Para: {client.nome}</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 bg-gray-50 flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensagens Rápidas (Modelos)</label>
                        <div className="flex flex-wrap gap-2">
                            {templates.map(tpl => (
                                <button 
                                    key={tpl.id}
                                    onClick={() => setText(tpl.content)}
                                    className="bg-white border border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm"
                                >
                                    {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sua Mensagem</label>
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Escreva sua mensagem aqui ou escolha um modelo acima..."
                            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] outline-none text-sm resize-none shadow-inner bg-white"
                        />
                    </div>
                </div>

                <div className="bg-white border-t px-6 py-4 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                    <button 
                        onClick={handleSend}
                        className="px-6 py-2 bg-[#25D366] text-white font-bold rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 shadow-md shadow-green-200"
                    >
                        <Send size={16}/> Enviar via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
};
// --------------------------------------------------------------

const Clientes = () => {
  // --- ESTADOS ---
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [clientHistory, setClientHistory] = useState([]); 

  // Estados de Interface
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null); 
  const [activeTab, setActiveTab] = useState('dados'); 

  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // <-- NOVO ESTADO

  // --- CARREGAMENTO INICIAL ---
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/clientes');
      setClients(response.data);
      setFilteredClients(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setClients([]);
      setFilteredClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // --- CARREGAR HISTÓRICO AO SELECIONAR CLIENTE ---
  useEffect(() => {
    if (selectedClient && activeTab === 'historico') {
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/clientes/${selectedClient.id}/vendas`);
                setClientHistory(res.data);
            } catch (error) {
                console.error("Erro ao buscar histórico", error);
                setClientHistory([]); 
            }
        };
        fetchHistory();
    }
  }, [selectedClient, activeTab]);

  // --- FILTRO DE BUSCA ---
  useEffect(() => {
    if (!Array.isArray(clients)) return;

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = clients.filter(client => 
      (client.nome && client.nome.toLowerCase().includes(lowerTerm)) ||
      (client.cpf_cnpj && client.cpf_cnpj.includes(searchTerm)) || 
      (client.telefone && client.telefone.includes(searchTerm))
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // --- HANDLERS ---
  const handleSelectClient = (client) => {
      setSelectedClient(client);
      setActiveTab('dados'); 
  };

  const handleNewClient = () => {
    setSelectedClient(null); 
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditClient = () => {
    if (!selectedClient) return alert("Selecione um cliente para editar.");
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleShowDeals = () => {
    if (!selectedClient) return;
    setActiveTab('historico');
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (modalMode === 'edit' && selectedClient) {
        await api.put(`/clientes/${selectedClient.id}`, clientData);
      } else {
        await api.post('/clientes', clientData);
      }

      await fetchClients(); 
      setIsModalOpen(false);
      
      if (modalMode === 'create') setSelectedClient(null);
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar cliente.');
    }
  };

  // --- FUNÇÃO ABERTURA DIRETA WHATSAPP (Usada na tabela) ---
  const openWhatsAppDirect = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${finalPhone}`, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-gray-50">
      
      {/* BARRA DE FERRAMENTAS */}
      <div className="bg-white p-2 rounded-t-lg shadow-sm border-b border-gray-200 flex flex-wrap gap-2 items-center mb-2">
        
        <button 
            onClick={handleNewClient}
            className="flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all group min-w-[80px]"
        >
            <UserPlus size={24} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-gray-600">Novo</span>
        </button>

        <div className="hidden md:block w-px h-10 bg-gray-300 mx-1"></div>

        <button 
            onClick={handleEditClient} 
            disabled={!selectedClient}
            className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedClient ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}
        >
            <Edit size={24} className="text-orange-500 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-gray-600">Editar</span>
        </button>

        <button 
            onClick={handleShowDeals} 
            disabled={!selectedClient}
            className={`flex-1 md:flex-none flex flex-col items-center justify-center px-4 py-2 rounded border border-transparent transition-all group min-w-[80px] ${!selectedClient ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}
        >
            <Briefcase size={24} className="text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-gray-600">Negócios</span>
        </button>

        <div className="w-full md:flex-1"></div>

        <div className="relative w-full md:w-64 mt-2 md:mt-0">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou tel..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* LISTA DE CLIENTES */}
      <div className="bg-white rounded shadow-sm overflow-hidden flex-1 border border-gray-200 relative">
        <div className="absolute inset-0 overflow-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 font-semibold shadow-sm z-10">
                <tr>
                <th className="p-3 border-b">Nome</th>
                <th className="p-3 border-b">CPF/CNPJ</th>
                <th className="p-3 border-b">Telefone</th>
                <th className="p-3 border-b">Cidade/UF</th>
                <th className="p-3 border-b">E-mail</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {isLoading ? (
                    <tr><td colSpan="5" className="p-4 text-center">Carregando clientes...</td></tr>
                ) : !filteredClients || filteredClients.length === 0 ? (
                    <tr><td colSpan="5" className="p-4 text-center text-gray-400">Nenhum cliente encontrado.</td></tr>
                ) : (
                    filteredClients.map((client) => (
                    <tr 
                        key={client.id} 
                        onClick={() => handleSelectClient(client)}
                        className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-blue-100 text-blue-900 font-medium' : 'hover:bg-blue-50 text-gray-700'}`}
                    >
                        <td className="p-3">
                            <div className="font-bold text-gray-800">{client.nome}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide 
                                ${client.categoria === 'Vendedor' ? 'bg-purple-100 text-purple-700' : 
                                  client.categoria === 'Comprador' ? 'bg-orange-100 text-orange-700' : 
                                  'bg-gray-100 text-gray-600'}`}>
                                {client.categoria || 'Cliente'}
                            </span>
                        </td>
                        <td className="p-3">{client.cpf_cnpj}</td>
                        <td className="p-3 flex items-center gap-2">
                            <span>{client.telefone}</span>
                            {client.telefone && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openWhatsAppDirect(client.telefone);
                                    }}
                                    className="p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-full hover:bg-[#25D366] hover:text-white transition-colors"
                                    title="Abrir WhatsApp Direto"
                                >
                                    <MessageCircle size={14} />
                                </button>
                            )}
                        </td>
                        <td className="p-3">{client.cidade} - {client.estado}</td>
                        <td className="p-3 text-gray-500">{client.email || '-'}</td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* PAINEL INFERIOR (DETALHES) */}
      {selectedClient && (
        <div className="bg-white h-auto md:h-80 flex flex-col border-t-4 border-blue-500 animate-slide-up shadow-inner mt-2 z-20">
            <div className="flex border-b bg-gray-100 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('dados')}
                    className={`px-6 py-3 text-sm font-bold border-r border-gray-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'dados' ? 'bg-white text-blue-700 border-t-2 border-t-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <User size={16}/> Dados Pessoais
                </button>
                <button 
                    onClick={() => setActiveTab('historico')}
                    className={`px-6 py-3 text-sm font-bold border-r border-gray-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'historico' ? 'bg-white text-blue-700 border-t-2 border-t-blue-700' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                    <Briefcase size={16}/> Negócios deste Cliente
                </button>
                <div className="flex-1 flex justify-end items-center pr-4 bg-gray-100 min-w-[50px]">
                    <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-red-600"><ChevronDown/></button>
                </div>
            </div>

            <div className="p-4 overflow-auto flex-1 bg-white max-h-[40vh] md:max-h-none">
                
                {activeTab === 'dados' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-500 font-bold border-b pb-1">
                                <User size={16}/> Identificação
                            </div>
                            <p><span className="text-gray-500 w-24 inline-block">Nome:</span> <strong className="text-lg">{selectedClient.nome}</strong></p>
                            <p><span className="text-gray-500 w-24 inline-block">Função:</span> <span className="font-bold text-[#D80000] uppercase">{selectedClient.categoria || 'Cliente'}</span></p>
                            <p><span className="text-gray-500 w-24 inline-block">CPF/CNPJ:</span> {selectedClient.cpf_cnpj}</p>
                            <p><span className="text-gray-500 w-24 inline-block">RG:</span> {selectedClient.rg || '-'}</p>
                            <p><span className="text-gray-500 w-24 inline-block">Nascimento:</span> {formatDate(selectedClient.data_nascimento)}</p>
                        </div>

                        <div className="space-y-3 flex flex-col items-start">
                            <div className="flex items-center gap-2 text-gray-500 font-bold border-b pb-1 w-full">
                                <Phone size={16}/> Contato
                            </div>
                            
                            <p><span className="text-gray-500 w-24 inline-block">Telefone:</span> <span className="font-medium">{selectedClient.telefone}</span></p>
                            
                            {/* BOTAO PARA ABRIR O MODAL DE MENSAGENS */}
                            {selectedClient.telefone && (
                                <button 
                                    onClick={() => setIsMessageModalOpen(true)}
                                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm mt-1 w-full max-w-[200px]"
                                >
                                    <MessageSquare size={16} fill="currentColor" /> Enviar Mensagem
                                </button>
                            )}

                            <p className="flex items-center gap-1 mt-2">
                                <span className="text-gray-500 w-24 inline-block">Email:</span> 
                                {selectedClient.email ? (
                                    <a href={`mailto:${selectedClient.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                        <Mail size={12}/> {selectedClient.email}
                                    </a>
                                ) : '-'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-500 font-bold border-b pb-1">
                                <MapPin size={16}/> Endereço
                            </div>
                            <p>{selectedClient.endereco}, {selectedClient.numero}</p>
                            <p>{selectedClient.bairro}</p>
                            <p>{selectedClient.cidade} - {selectedClient.estado}</p>
                            <p className="text-gray-500">CEP: {selectedClient.cep}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'historico' && (
                    <div className="h-full">
                        {clientHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <History size={48} className="mb-2 opacity-20"/>
                                <p>Nenhum negócio realizado com este cliente ainda.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0">
                                    <tr>
                                        <th className="p-3">Data</th>
                                        <th className="p-3">Veículo</th>
                                        <th className="p-3">Placa</th>
                                        <th className="p-3">Valor Negociado</th>
                                        <th className="p-3">Pagamento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {clientHistory.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-blue-50">
                                            <td className="p-3 flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400"/>
                                                {formatDate(sale.data_venda)}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Car size={16} className="text-blue-600"/>
                                                    <span className="font-bold uppercase">{sale.modelo}</span>
                                                    <span className="text-xs text-gray-500">({sale.cor})</span>
                                                </div>
                                            </td>
                                            <td className="p-3 font-mono uppercase">{sale.placa}</td>
                                            <td className="p-3 font-bold text-green-700">R$ {Number(sale.valor_venda).toLocaleString()}</td>
                                            <td className="p-3 text-xs bg-gray-100 rounded w-fit px-2 py-1 mx-3 inline-block">
                                                {sale.metodo_pagamento}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

            </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        initialData={modalMode === 'edit' ? selectedClient : null}
      />

      {/* NOVO: MODAL DO WHATSAPP */}
      <WhatsAppModal 
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
};

export default Clientes;
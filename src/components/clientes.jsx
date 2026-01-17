import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ClientModal from './ClientModal';
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../api';



const Clientes = ({ activeScreen, setActiveScreen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar Clientes
 const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`);
      if (!response.ok) throw new Error('Erro ao buscar clientes');
      const data = await response.json();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenModal = (client = null) => {
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
        if (currentClient) {
            // Editar
            await fetch(`${API_URL}/clientes/${currentClient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
            setClients(clients.map(c => c.id === currentClient.id ? { ...clientData, id: c.id } : c));
        } else {
            // Criar
            const res = await fetch(`${API_URL}/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            });
            const newClient = await res.json();
            setClients([newClient, ...clients]);
        }
        setIsModalOpen(false);
        setCurrentClient(null);
        setSelectedClientId(null);
    } catch (error) {
        alert("Erro ao salvar cliente.");
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClientId) return;
    if (confirm('Tem certeza que deseja excluir o cliente selecionado?')) {
      try {
          await fetch(`${API_URL}/clientes/${selectedClientId}`, { method: 'DELETE' });
          setClients(clients.filter(c => c.id !== selectedClientId));
          setSelectedClientId(null);
      } catch (error) {
          alert("Erro ao excluir cliente.");
      }
    }
  };

  const handleEditClient = () => {
    if (!selectedClientId) return;
    const clientToEdit = clients.find(c => c.id === selectedClientId);
    handleOpenModal(clientToEdit);
  };

  // ... (O restante do código de renderização/HTML permanece IGUAL ao anterior)
  // Certifique-se apenas de usar a variável `clients` filtrada abaixo:
  
  const filteredClients = clients.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf_cnpj.includes(searchTerm)
  );

  return (
    // ... Copie o retorno do JSX do código anterior de Clientes.jsx
    // Apenas certifique-se de que os botões chamam as funções acima (handleSaveClient, handleDeleteClient)
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Superior */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Clientes</h1>
            <p className="text-sm text-gray-500">Base de contatos e parceiros</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-gray-100 px-3 py-1 rounded-md text-xs font-medium text-gray-600">
                Total: {clients.length}
             </div>
          </div>
        </header>

        {/* Barra de Ferramentas (Toolbar) */}
        <div className="bg-white px-8 py-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center flex-shrink-0 shadow-sm z-10">
          
          {/* Botões de Ação */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#D80000] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
            >
              <Plus size={18} />
              Novo
            </button>
            
            <button 
              onClick={handleEditClient}
              disabled={!selectedClientId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border shadow-sm text-sm font-medium ${
                selectedClientId 
                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Pencil size={18} />
              Editar
            </button>

            <button 
              onClick={handleDeleteClient}
              disabled={!selectedClientId}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border shadow-sm text-sm font-medium ${
                selectedClientId 
                  ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Trash2 size={18} />
              Excluir
            </button>
          </div>

          {/* Barra de Pesquisa */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D80000] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome, CPF/CNPJ..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchClients} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600" title="Atualizar">
                <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3 text-center">
                    {/* Checkbox Cabeçalho (Opcional) */}
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome / Razão Social</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cidade</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                    <tr><td colSpan="6" className="p-4 text-center">Carregando clientes...</td></tr>
                ) : filteredClients.map((client) => {
                  const isSelected = selectedClientId === client.id;
                  return (
                    <tr 
                      key={client.id} 
                      onClick={() => setSelectedClientId(isSelected ? null : client.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input 
                          type="radio" 
                          name="clientSelect"
                          checked={isSelected}
                          onChange={() => setSelectedClientId(client.id)}
                          className="accent-[#D80000] w-4 h-4"
                        />
                      </td>
                      <td className={`px-6 py-4 font-medium ${isSelected ? 'text-[#D80000]' : 'text-gray-800'}`}>
                        {client.nome}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{client.cpf_cnpj}</td>
                      <td className="px-6 py-4 text-gray-600">{client.cidade}</td>
                      <td className="px-6 py-4 text-gray-600">{client.telefone}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            client.tipo === 'PJ' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                            {client.tipo}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveClient}
        initialData={currentClient}
      />
    </div>
  );
};

export default Clientes;
import React, { useState } from 'react';
import { 
  Search, Plus, Edit, Briefcase, Phone, Printer, 
  MapPin, Mail, ChevronDown, User, FileText, DollarSign 
} from 'lucide-react';

// --- DADOS FAKES (MOCK) ---
const MOCK_CLIENTS = [
  { id: 1, nome: 'Enesio Fagundes', telefone: '(11) 98877-6655', email: 'enesio@email.com', cidade: 'Ibiúna, SP', status: 'Ativo', tipo: 'Comprador' },
  { id: 2, nome: 'Mariana Silva', telefone: '(11) 99988-7766', email: 'mariana@email.com', cidade: 'São Roque, SP', status: 'Interessado', tipo: 'Visitante' },
  { id: 3, nome: 'Carlos Oliveira', telefone: '(15) 97766-5544', email: 'carlos.o@email.com', cidade: 'Sorocaba, SP', status: 'Inativo', tipo: 'Vendedor' },
  { id: 4, nome: 'Fernanda Souza', telefone: '(11) 91234-5678', email: 'fer.souza@email.com', cidade: 'Cotia, SP', status: 'Ativo', tipo: 'Comprador' },
  { id: 5, nome: 'Roberto Mendes', telefone: '(11) 98765-4321', email: 'roberto@email.com', cidade: 'Ibiúna, SP', status: 'Bloqueado', tipo: 'Comprador' },
];

const Clientes = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('dados'); 

  // Função auxiliar para manter o estilo dos botões secundários igual ao do <select> do Estoque
  const ActionButton = ({ icon: Icon, label, onClick, primary = false }) => (
    <button 
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors border
        ${primary 
          ? 'bg-kadilac-300 text-white border-kadilac-300 hover:bg-kadilac-400' // Estilo igual ao "+ Novo Carro"
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' // Estilo neutro para os outros
        }
      `}
    >
      <Icon size={16} />
      <span className="uppercase text-xs font-bold tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      
      {/* --- BARRA DE TOPO (IGUAL AO ESTOQUE/VENDAS) --- */}
      <div className="bg-white p-4 rounded shadow-sm flex flex-wrap gap-4 justify-between items-center">
        
        {/* Lado Esquerdo: Busca (Idêntico ao Estoque) */}
        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-gray-50 flex-1 max-w-md">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF..." 
            className="bg-transparent outline-none text-sm w-full text-gray-600 placeholder-gray-400" 
          />
        </div>

        {/* Lado Direito: Botões de Ação */}
        <div className="flex gap-2 flex-wrap">
           <ActionButton icon={Plus} label="Inclui" primary={true} onClick={() => alert('Incluir')} />
           <ActionButton icon={Edit} label="Altera" onClick={() => alert('Alterar')} />
           <ActionButton icon={Briefcase} label="Negócios" onClick={() => alert('Negócios')} />
           <ActionButton icon={Phone} label="Telefonar" onClick={() => alert('Telefonar')} />
           <ActionButton icon={Printer} label="Etiqueta" onClick={() => alert('Etiqueta')} />
        </div>
      </div>

      {/* --- LISTA DE CLIENTES (TABELA - Estilo Consistente) --- */}
      <div className="bg-white rounded shadow-sm overflow-auto flex-1 border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 font-semibold z-10 shadow-sm">
            <tr>
              <th className="p-3 pl-6 border-b w-16">ID</th>
              <th className="p-3 border-b">Nome</th>
              <th className="p-3 border-b">Contatos</th>
              <th className="p-3 border-b">Localização</th>
              <th className="p-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_CLIENTS.map((client) => (
              <tr 
                key={client.id} 
                onClick={() => setSelectedClient(client)}
                className={`cursor-pointer hover:bg-blue-50 transition-colors group ${
                  selectedClient?.id === client.id ? 'bg-blue-100' : ''
                }`}
              >
                <td className="p-3 pl-6 text-gray-400 font-mono text-xs">{client.id}</td>
                <td className="p-3">
                  <div className="font-bold text-gray-800">{client.nome}</div>
                  <div className="text-xs text-gray-500 uppercase">{client.tipo}</div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-gray-700 font-medium">
                      <Phone size={12} className="text-kadilac-300"/> {client.telefone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Mail size={12}/> {client.email}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400"/> {client.cidade}
                  </div>
                </td>
                <td className="p-3">
                   <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${
                    client.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-100' :
                    client.status === 'Interessado' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    'bg-gray-50 text-gray-500 border-gray-200'
                  }`}>
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PAINEL DE DETALHES (BOTTOM PANEL - Idêntico ao Estoque) --- */}
      {selectedClient && (
        <div className="bg-white h-72 rounded-t-lg shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)] flex flex-col border-t-4 border-kadilac-300 animate-slide-up transition-all duration-300 z-20">
          
          {/* Tabs do Painel */}
          <div className="flex border-b bg-gray-50 items-center">
            <button onClick={() => setActiveTab('dados')} className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-r ${activeTab === 'dados' ? 'bg-white text-kadilac-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <User size={16}/> Dados
            </button>
            <button onClick={() => setActiveTab('historico')} className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-r ${activeTab === 'historico' ? 'bg-white text-kadilac-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <FileText size={16}/> Histórico
            </button>
            <button onClick={() => setActiveTab('financeiro')} className={`px-6 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-r ${activeTab === 'financeiro' ? 'bg-white text-kadilac-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <DollarSign size={16}/> Financeiro
            </button>
            
            <div className="flex-1 flex justify-end pr-4">
               <button onClick={() => setSelectedClient(null)} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-red-500 transition-colors">
                 <ChevronDown size={20}/>
               </button>
            </div>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="p-6 overflow-auto flex-1 bg-white">
            {activeTab === 'dados' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm animate-fade-in">
                <div className="space-y-4">
                   <div>
                     <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Cliente</span>
                     <p className="font-bold text-gray-800 text-lg border-b pb-1">{selectedClient.nome}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">CPF/CNPJ</span>
                       <p className="text-gray-700 font-mono">000.000.000-00</p>
                     </div>
                     <div>
                       <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Tipo</span>
                       <p className="text-gray-700">{selectedClient.tipo}</p>
                     </div>
                   </div>
                </div>
                <div className="space-y-4 border-l pl-4 border-gray-100">
                   <div>
                     <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Contato Principal</span>
                     <p className="text-gray-700 flex items-center gap-2 font-medium text-base"><Phone size={14} className="text-green-600"/> {selectedClient.telefone}</p>
                   </div>
                   <div>
                     <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Email</span>
                     <p className="text-blue-600 underline cursor-pointer">{selectedClient.email}</p>
                   </div>
                </div>
                <div className="space-y-4 border-l pl-4 border-gray-100">
                   <div>
                     <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Endereço</span>
                     <p className="text-gray-700 font-medium">{selectedClient.cidade}</p>
                     <p className="text-gray-500 text-xs">Rua Exemplo, 123 - Centro</p>
                   </div>
                   <div className="flex gap-2 pt-2">
                     <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded border">Ver no Mapa</button>
                   </div>
                </div>
              </div>
            )}
            
            {/* Mensagens de Vazio para outras abas */}
            {activeTab === 'historico' && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <FileText size={40} className="mb-2 opacity-30"/>
                <p>Nenhum histórico recente.</p>
              </div>
            )}
            {activeTab === 'financeiro' && (
               <div className="flex flex-col items-center justify-center h-full text-gray-300">
                 <DollarSign size={40} className="mb-2 opacity-30"/>
                 <p>Situação financeira regular.</p>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
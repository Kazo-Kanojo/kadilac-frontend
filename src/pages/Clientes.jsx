import React, { useState } from 'react';
import { Search, Filter, Phone, User, Building2, MapPin, Briefcase } from 'lucide-react';

// 1. Mock Data (Dados fictícios baseados no seu print)
const MOCK_CLIENTS = [
  { id: 1, type: 'F', name: 'ELISANDRA PIRES MENDES', phone: '(11) 9639-5415', clientType: 'Vendedor', email: 'elisandra@email.com', doc: '123.456.789-00', birthDate: '1985-04-12', address: { street: 'Rua das Flores, 123', district: 'Centro', city: 'São Paulo', state: 'SP', zip: '01001-000' }, job: { company: 'Autônomo', role: 'Vendas' } },
  { id: 2, type: 'F', name: 'ABIMAEL MIRANDA DE CAMARGO', phone: '(11) 7549-3570', clientType: 'Vendedor', email: 'abimael@email.com', doc: '222.333.444-55', birthDate: '1990-05-20', address: { street: 'Av. Paulista, 1000', district: 'Bela Vista', city: 'São Paulo', state: 'SP', zip: '01310-100' }, job: { company: '', role: '' } },
  { id: 3, type: 'J', name: 'ADAUTO CARDOSO DE ANDRADE', phone: '(11) 7176-1409', clientType: 'Comprador', email: 'adauto@empresa.com', doc: '12.345.678/0001-90', birthDate: '1980-01-15', address: { street: 'Rua Lirio do Amazonas, 160', district: 'Haras Bela Vista', city: 'Vargem Grande Paulista', state: 'SP', zip: '06730-000' }, job: { company: 'Logística SA', role: 'Gerente' } },
];

const ClientModule = () => {
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* --- HEADER / TOOLBAR --- */}
      <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Lista de Clientes
          </h1>
          
          <div className="flex flex-1 items-center gap-2 max-w-3xl">
            {/* Barra de Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por nome, CPF/CNPJ..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros (Dropdowns simulados) */}
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
              <option>Pessoas Físicas e Jurídicas</option>
              <option>Apenas Pessoa Física</option>
              <option>Apenas Pessoa Jurídica</option>
            </select>
            
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
              <option>Todos os tipos de cliente</option>
              <option>Vendedor</option>
              <option>Comprador</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              + Novo Cliente
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (Split View) --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LADO ESQUERDO / TOPO: Lista de Clientes (Table) */}
        {/* Nota: No print antigo era Topo/Baixo. Aqui podemos fazer lado a lado se a tela for larga, ou manter Topo/Baixo. 
            Vou manter Topo/Baixo para ser fiel ao modelo mental do usuário antigo, mas responsivo. */}
        <div className="flex flex-col w-full h-full">
            
          {/* Tabela com Scroll */}
          <div className="flex-1 overflow-auto border-b border-gray-200 bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold w-16 text-center">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Nome / Empresa</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Tipo do Cliente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_CLIENTS.map((client) => (
                  <tr 
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedClient?.id === client.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${client.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                        {client.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{client.name}</td>
                    <td className="px-4 py-3 text-gray-500">{client.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                        {client.clientType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAINEL DE DETALHES (Footer fixo ou scrollável) */}
          {/* Reproduzindo a área "Detalhes do Cliente" do print */}
          <div className="h-2/5 bg-gray-50 border-t border-gray-300 overflow-y-auto p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            
            {selectedClient ? (
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-slate-800">
                    Detalhes: <span className="text-blue-600">{selectedClient.name}</span>
                  </h2>
                </div>

                <form className="grid grid-cols-12 gap-6">
                  
                  {/* Bloco 1: Dados Pessoais */}
                  <div className="col-span-12 md:col-span-12 lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Dados Básicos</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CPF / CNPJ</label>
                            <input type="text" readOnly value={selectedClient.doc} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Dt. Nascimento</label>
                            <input type="date" readOnly value={selectedClient.birthDate} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input type="email" readOnly value={selectedClient.email} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                    </div>
                  </div>

                  {/* Bloco 2: Endereço */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Endereço</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Rua</label>
                            <input type="text" readOnly value={selectedClient.address.street} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CEP</label>
                            <input type="text" readOnly value={selectedClient.address.zip} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                         <div className="col-span-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
                            <input type="text" readOnly value={selectedClient.address.district} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
                            <input type="text" readOnly value={selectedClient.address.city} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                            <input type="text" readOnly value={selectedClient.address.state} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                        </div>
                    </div>
                  </div>

                  {/* Bloco 3: Dados Profissionais */}
                  <div className="col-span-12 md:col-span-6 lg:col-span-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Profissional</h3>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Trabalha na (Empresa)</label>
                        <input type="text" readOnly value={selectedClient.job.company} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
                        <input type="text" readOnly value={selectedClient.job.role} className="w-full p-2 bg-white border border-gray-300 rounded text-sm" />
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
                        <textarea className="w-full p-2 bg-white border border-gray-300 rounded text-sm h-20 resize-none" placeholder="Sem observações..."></textarea>
                    </div>
                  </div>

                </form>
              </div>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                    Selecione um cliente para ver os detalhes
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientModule;
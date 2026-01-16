import React, { useState } from 'react';
import { 
  Search, 
  User, 
  MapPin, 
  Briefcase, 
  Plus, 
  Pencil, 
  Car, 
  Phone, 
  Printer, 
  Filter 
} from 'lucide-react';

// 1. Mock Data (Dados fictícios baseados nos seus prints)
const MOCK_CLIENTS = [
  { id: 1, type: 'F', name: 'ADNILSON PAIXAO SABINO', phone: '(11) 7331-3842', clientType: 'Comprador', email: '', doc: '219.891.728-90', birthDate: '1980-04-28', address: { street: 'RUA JOSE MANOEL DE OLIVEIRA, 963', district: 'CAUCAIA DO ALTO', city: 'COTIA', state: 'SP', zip: '06727-187' }, job: { company: '', role: '' }, vehicles: ['GM/CELTA 1.0 - Prata'] },
  { id: 2, type: 'F', name: 'ADRIANA APARECIDA MORAES', phone: '(11) 7245-2580', clientType: 'Comprador', email: 'adriana@email.com', doc: '123.456.789-00', birthDate: '1985-04-12', address: { street: 'Rua das Flores, 123', district: 'Centro', city: 'São Paulo', state: 'SP', zip: '01001-000' }, job: { company: 'Autônomo', role: 'Vendas' }, vehicles: [] },
  { id: 3, type: 'J', name: 'ALADIN VEICULOS LTDA', phone: '(11) 6216-0050', clientType: 'Vendedor', email: 'contato@aladin.com', doc: '12.345.678/0001-90', birthDate: '1980-01-15', address: { street: 'Av. Veiculos, 1000', district: 'Jardim Auto', city: 'São Paulo', state: 'SP', zip: '06730-000' }, job: { company: 'Aladin Veiculos', role: 'Loja' }, vehicles: [] },
];

const ClientModule = () => {
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Apenas simulando ações para os botões não ficarem mortos visualmente
  const handleAction = (action) => {
    if (!selectedClient && action !== 'incluir') {
      alert("Selecione um cliente primeiro.");
      return;
    }
    console.log(`Ação disparada: ${action} para ${selectedClient?.name}`);
    // Futuramente aqui abriremos os Modais (ex: Modal de Inclusão PF/PJ, Modal de Etiqueta, etc)
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-800 font-sans">
      
      {/* --- HEADER PRINCIPAL --- */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm flex justify-between items-center">
         <h1 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Gestão de Clientes
          </h1>
          <div className="text-sm text-gray-500">
            Total visualizado: <strong>{MOCK_CLIENTS.length}</strong>
          </div>
      </header>

      {/* --- BARRA DE FERRAMENTAS (ACTIONS TOOLBAR) --- */}
      {/* Aqui estão os botões que você pediu, estilo "Ribbon" ou Toolbar clássica */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        
        <button 
          onClick={() => handleAction('incluir')}
          className="flex flex-col items-center justify-center px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group min-w-[80px]"
        >
          <div className="p-2 bg-green-100 text-green-700 rounded-full mb-1 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Incluir</span>
        </button>

        <div className="w-px h-8 bg-gray-300 mx-1"></div> {/* Separador */}

        <button 
          onClick={() => handleAction('alterar')}
          className="flex flex-col items-center justify-center px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group min-w-[80px]"
        >
          <div className="p-2 bg-blue-100 text-blue-700 rounded-full mb-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Pencil className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Alterar</span>
        </button>

        <button 
          onClick={() => handleAction('negocios')}
          className="flex flex-col items-center justify-center px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group min-w-[80px]"
        >
          <div className="p-2 bg-orange-100 text-orange-700 rounded-full mb-1 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <Car className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Negócios</span>
        </button>

        <button 
          onClick={() => handleAction('telefonar')}
          className="flex flex-col items-center justify-center px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group min-w-[80px]"
        >
          <div className="p-2 bg-purple-100 text-purple-700 rounded-full mb-1 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Telefonar</span>
        </button>

        <button 
          onClick={() => handleAction('etiqueta')}
          className="flex flex-col items-center justify-center px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all group min-w-[80px]"
        >
          <div className="p-2 bg-gray-200 text-gray-700 rounded-full mb-1 group-hover:bg-gray-600 group-hover:text-white transition-colors">
            <Printer className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Etiqueta</span>
        </button>
      </div>

      {/* --- FILTROS RÁPIDOS --- */}
      <div className="bg-white p-3 border-b border-gray-200 flex gap-3 items-center">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
            type="text" 
            placeholder="Buscar por nome, CPF/CNPJ..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
            <option>Físicas e Jurídicas</option>
            <option>Pessoa Física</option>
            <option>Pessoa Jurídica</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500">
            <option>Todos os clientes</option>
            <option>Vendedor</option>
            <option>Comprador</option>
        </select>
      </div>

      {/* --- CONTENT AREA (Lista + Detalhes) --- */}
      <div className="flex flex-1 overflow-hidden flex-col">
        
        {/* LISTA (Grid) */}
        <div className="flex-1 overflow-auto bg-white relative">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10 shadow-sm text-xs uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold w-12 text-center">F/J</th>
                <th className="px-4 py-3 font-semibold">Nome / Empresa</th>
                <th className="px-4 py-3 font-semibold w-32">Fone</th>
                <th className="px-4 py-3 font-semibold w-32">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_CLIENTS.map((client) => (
                <tr 
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedClient?.id === client.id ? 'bg-blue-100 text-blue-900 font-medium' : 'text-slate-600'}`}
                >
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${client.type === 'F' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {client.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">{client.name}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{client.phone}</td>
                  <td className="px-4 py-2 text-xs">{client.clientType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAINEL DE DETALHES (Igual ao print "Detalhes do Cliente") */}
        <div className="h-[350px] bg-gray-50 border-t border-gray-300 overflow-y-auto shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            {selectedClient ? (
              <div className="p-4 max-w-5xl mx-auto">
                {/* Header do Detalhe */}
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                    <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Detalhes: {selectedClient.name}
                    </h3>
                    <div className="text-xs text-gray-400">
                        Cadastrado em: 29/08/2018
                    </div>
                </div>

                {/* Formulário Read-Only */}
                <div className="grid grid-cols-12 gap-4 text-sm">
                  
                  {/* Linha 1 */}
                  <div className="col-span-12 md:col-span-2">
                     <label className="block text-xs text-gray-500">CPF/CNPJ</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.doc}</div>
                  </div>
                  <div className="col-span-12 md:col-span-2">
                     <label className="block text-xs text-gray-500">Dt. Nascimento</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.birthDate}</div>
                  </div>
                   <div className="col-span-12 md:col-span-8">
                     <label className="block text-xs text-gray-500">Email</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700 h-[34px]">{selectedClient.email || '-'}</div>
                  </div>

                  {/* Linha 2 (Endereço) */}
                  <div className="col-span-12 md:col-span-6">
                     <label className="block text-xs text-gray-500">Rua</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.address.street}</div>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                     <label className="block text-xs text-gray-500">Bairro</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.address.district}</div>
                  </div>
                   <div className="col-span-12 md:col-span-3">
                     <label className="block text-xs text-gray-500">CEP</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.address.zip}</div>
                  </div>

                   {/* Linha 3 */}
                   <div className="col-span-12 md:col-span-3">
                     <label className="block text-xs text-gray-500">Cidade</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.address.city}</div>
                  </div>
                   <div className="col-span-12 md:col-span-1">
                     <label className="block text-xs text-gray-500">UF</label>
                     <div className="p-1.5 bg-white border border-gray-300 rounded text-gray-700">{selectedClient.address.state}</div>
                  </div>
                  
                  {/* Área de Observações / Dados Profissionais */}
                   <div className="col-span-12 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 font-bold mb-1">Dados Profissionais</label>
                            <div className="p-2 bg-white border border-gray-300 rounded h-20 text-xs overflow-y-auto">
                                <p><strong>Empresa:</strong> {selectedClient.job.company || '-'}</p>
                                <p><strong>Cargo:</strong> {selectedClient.job.role || '-'}</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 font-bold mb-1">Observações</label>
                            <textarea className="w-full p-2 bg-white border border-gray-300 rounded h-20 text-xs resize-none" readOnly placeholder="Sem observações"></textarea>
                        </div>
                      </div>
                   </div>

                </div>
              </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <User className="w-12 h-12 mb-2 opacity-20" />
                    <span>Selecione um cliente para ver os detalhes</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ClientModule;
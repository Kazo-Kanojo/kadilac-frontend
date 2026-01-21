import { useState, useEffect } from 'react';
import { FilePlus, User, CheckCircle, Car } from 'lucide-react';
import { API_BASE_URL } from '../api';

const NovaFicha = () => {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    cliente_id: '',
    veiculo_id: '',
    valor_venda: '',
    entrada: '',
    financiado: '',
    metodo_pagamento: 'Pix',
    observacoes: ''
  });

  // Busca dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, vehiclesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes`),
          fetch(`${API_BASE_URL}/veiculos-estoque`)
        ]);
        
        const clientsData = await clientsRes.json();
        const vehiclesData = await vehiclesRes.json();

        setClients(clientsData);
        setVehicles(vehiclesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        alert("Erro ao carregar lista de clientes ou veículos.");
      }
    };
    loadData();
  }, []);

  // Preenche automaticamente o valor quando seleciona um carro
  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    const vehicle = vehicles.find(v => v.id.toString() === vId);
    
    setFormData(prev => ({
      ...prev,
      veiculo_id: vId,
      valor_venda: vehicle ? vehicle.valor : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.veiculo_id) {
      alert("Por favor, selecione um Cliente e um Veículo.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erro ao salvar venda');

      alert("Ficha criada com sucesso! Veículo marcado como VENDIDO.");
      // Redireciona para o estoque (isso fará um refresh na página)
      window.location.href = '/'; 
    } catch (error) {
      console.error(error);
      alert("Erro ao criar ficha.");
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
        <div className="max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FilePlus className="text-orange-500" /> Nova Ficha de Venda
          </h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            
            {/* SEÇÃO 1: VÍNCULO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente (Comprador)</label>
                <div className="relative">
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                    value={formData.cliente_id}
                    onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nome} - {c.cpf_cnpj}</option>
                    ))}
                  </select>
                  <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Veículo (Em Estoque)</label>
                <div className="relative">
                  <select 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                    value={formData.veiculo_id}
                    onChange={handleVehicleChange}
                  >
                    <option value="">Selecione um veículo...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.modelo} - {v.placa} ({v.cor})</option>
                    ))}
                  </select>
                  <Car className="absolute left-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* SEÇÃO 2: VALORES */}
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Dados da Negociação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Valor Total (R$)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                    value={formData.valor_venda}
                    onChange={e => setFormData({...formData, valor_venda: e.target.value})}
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Entrada (R$)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                    value={formData.entrada}
                    onChange={e => setFormData({...formData, entrada: e.target.value})}
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Financiado (R$)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                    value={formData.financiado}
                    onChange={e => setFormData({...formData, financiado: e.target.value})}
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
               <div className="flex gap-4">
                  {['Pix', 'Dinheiro', 'Financiamento', 'Cartão'].map(method => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="pagamento"
                        value={method}
                        checked={formData.metodo_pagamento === method}
                        onChange={e => setFormData({...formData, metodo_pagamento: e.target.value})}
                        className="accent-orange-500"
                      />
                      <span className="text-sm text-gray-600">{method}</span>
                    </label>
                  ))}
               </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea 
                rows="3"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                placeholder="Detalhes adicionais sobre a venda..."
                value={formData.observacoes}
                onChange={e => setFormData({...formData, observacoes: e.target.value})}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button"
                // Alterei para apenas voltar a raiz ou recarregar, já que o controle de tela é pelo App.jsx
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm shadow-green-200"
              >
                <CheckCircle size={18} />
                Finalizar Venda
              </button>
            </div>

          </form>
        </div>
    </div>
  );
};

export default NovaFicha;
import { useState, useEffect } from 'react';
import { FilePlus, User, Car, FileText, BadgeCheck } from 'lucide-react';
import { API_BASE_URL } from '../api';

const NovaFicha = () => {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [storeConfig, setStoreConfig] = useState(null); // <--- 1. Estado para Config da Loja
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    veiculo_id: '',
    vendedor: '',
    valor_venda: '',
    entrada: '',
    financiado: '',
    metodo_pagamento: 'Pix',
    observacoes: ''
  });

  const documents = [
    { title: 'Recibo de Venda', url: '/templates/pages/Recibo_de_Venda.html' },
    { title: 'Termo de Resp.', url: '/templates/pages/Termo.html' },
    { title: 'Procuração', url: '/templates/pages/procurcao.html' },
    { title: 'Declaração', url: '/templates/pages/declaracao.html' },
    { title: 'Ficha Cadastral', url: '/templates/pages/ficha.html' },
    { title: 'Compra', url: '/templates/pages/Compra.html' }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        // <--- 2. Adicionamos a busca de /config aqui
        const [clientsRes, vehiclesRes, configRes] = await Promise.all([
          fetch(`${API_BASE_URL}/clientes`),
          fetch(`${API_BASE_URL}/veiculos-estoque`),
          fetch(`${API_BASE_URL}/config`)
        ]);

        const clientsData = await clientsRes.json();
        const vehiclesData = await vehiclesRes.json();
        const configData = await configRes.json();

        setClients(clientsData);
        setVehicles(vehiclesData);
        setStoreConfig(configData); // <--- Salva a config no estado
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    const vehicle = vehicles.find(v => v.id.toString() === vId);
    setFormData(prev => ({
      ...prev,
      veiculo_id: vId,
      valor_venda: vehicle ? vehicle.valor : ''
    }));
  };

  const handleGenerateDocument = (docUrl) => {
    if (!formData.cliente_id || !formData.veiculo_id) {
      alert('Selecione um cliente e um veículo primeiro.');
      return;
    }

    const client = clients.find(c => c.id.toString() === formData.cliente_id.toString());
    const vehicle = vehicles.find(v => v.id.toString() === formData.veiculo_id.toString());

    // 3. Prepara os dados INCLUINDO OS DADOS DA LOJA
    const printData = {
      client: client,
      vehicle: vehicle,
      store: storeConfig, // <--- Aqui vai a mágica: enviamos os dados da empresa
      sale: {
        price: formData.valor_venda,
        entry: formData.entrada,
        financed: formData.financiado,
        method: formData.metodo_pagamento,
        obs: formData.observacoes,
        seller: formData.vendedor
      },
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    };

    localStorage.setItem('sistema_print_data', JSON.stringify(printData));
    window.location.href = docUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.veiculo_id || !formData.vendedor) {
      alert("Por favor, preencha Cliente, Veículo e Vendedor.");
      return;
    }

    const dadosParaEnviar = {
      ...formData,
      valor_venda: formData.valor_venda === '' ? 0 : parseFloat(formData.valor_venda),
      entrada: formData.entrada === '' ? 0 : parseFloat(formData.entrada),
      financiado: formData.financiado === '' ? 0 : parseFloat(formData.financiado)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/vendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao salvar venda');
      }

      alert("Ficha criada com sucesso! Veículo marcado como VENDIDO.");
      window.location.href = '/'; 
    } catch (error) {
      console.error(error);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <FilePlus className="text-orange-500" /> Nova Negociação
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-lg mb-4 text-gray-700">1. Dados da Venda</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cliente</label>
              <div className="relative">
                <select 
                  className="w-full p-3 pl-10 border rounded-lg bg-gray-50 outline-none focus:border-orange-500"
                  value={formData.cliente_id}
                  onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Veículo</label>
              <div className="relative">
                <select 
                  className="w-full p-3 pl-10 border rounded-lg bg-gray-50 outline-none focus:border-orange-500"
                  value={formData.veiculo_id}
                  onChange={handleVehicleChange}
                >
                  <option value="">Selecione...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.modelo} - {v.placa}</option>)}
                </select>
                <Car className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Vendedor</label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full p-3 pl-10 border rounded-lg bg-gray-50 outline-none focus:border-orange-500"
                  placeholder="Nome do Vendedor"
                  value={formData.vendedor}
                  onChange={e => setFormData({...formData, vendedor: e.target.value})}
                />
                <BadgeCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-bold text-gray-500">Valor (R$)</label>
                 <input type="number" className="w-full p-2 border rounded" 
                   value={formData.valor_venda} onChange={e => setFormData({...formData, valor_venda: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-500">Entrada (R$)</label>
                 <input type="number" className="w-full p-2 border rounded" 
                   value={formData.entrada} onChange={e => setFormData({...formData, entrada: e.target.value})} />
               </div>
            </div>
          </div>
          
          <button onClick={handleSubmit} className="mt-6 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
            Salvar Venda
          </button>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
          <h2 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2">
            <FileText size={20} /> 
            2. Gerar Documentos
          </h2>
          <p className="text-sm text-blue-700 mb-6">
            Selecione o documento abaixo para abrir já preenchido.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {documents.map((doc, idx) => (
              <button
                key={idx}
                onClick={() => handleGenerateDocument(doc.url)}
                className="flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all group shadow-sm"
              >
                <span className="font-medium">{doc.title}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded group-hover:bg-white group-hover:text-blue-600">
                  Abrir
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovaFicha;
import { useState, useEffect } from 'react';
import { FilePlus, User, Car, DollarSign, FileText, BadgeCheck, Calculator, Calendar } from 'lucide-react';
import api from '../api'; // [CORREÇÃO 1] Importando o api (axios) que tem o token

const NovaFicha = () => {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [storeConfig, setStoreConfig] = useState(null);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    veiculo_id: '',
    vendedor: '',
    valor_venda: '',
    entrada: '',
    financiado: '',
    metodo_pagamento: 'Dinheiro',
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

  // --- CARREGAR DADOS DO SERVIDOR ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // [CORREÇÃO 1] Usando api.get para enviar o token de autenticação
        const [clientsRes, vehiclesRes, configRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/veiculos-estoque'), // Certifique-se que essa rota existe no backend
          api.get('/config').catch(() => ({ data: null })) // Evita travar se não tiver config
        ]);

        setClients(clientsRes.data);
        setVehicles(vehiclesRes.data);
        setStoreConfig(configRes.data);
        
      } catch (error) {
        console.error("Erro ao carregar dados. Verifique se está logado.", error);
        alert("Erro ao carregar listas. Tente fazer login novamente.");
      }
    };
    loadData();
  }, []);

  // --- [CORREÇÃO 2] CÁLCULO AUTOMÁTICO DO SALDO ---
  useEffect(() => {
    const v = parseFloat(formData.valor_venda) || 0;
    const e = parseFloat(formData.entrada) || 0;
    const saldo = v - e;
    
    // Atualiza o campo 'financiado' automaticamente
    setFormData(prev => ({
      ...prev,
      financiado: saldo > 0 ? saldo.toFixed(2) : ''
    }));
  }, [formData.valor_venda, formData.entrada]);

  // Quando escolhe um carro, já puxa o preço dele
  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    const vehicle = vehicles.find(v => v.id.toString() === vId);
    
    setFormData(prev => ({
      ...prev,
      veiculo_id: vId,
      valor_venda: vehicle ? vehicle.valor : '', // Puxa o valor do cadastro
      entrada: '', // Reseta a entrada para forçar recálculo
      financiado: ''
    }));
  };

  const handleGenerateDocument = (docUrl) => {
    if (!formData.cliente_id || !formData.veiculo_id) {
      alert('⚠️ Selecione Cliente e Veículo primeiro.');
      return;
    }

    const client = clients.find(c => c.id.toString() === formData.cliente_id.toString());
    const vehicle = vehicles.find(v => v.id.toString() === formData.veiculo_id.toString());

    const printData = {
      client: client,
      vehicle: vehicle,
      store: storeConfig,
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
    window.open(docUrl, '_blank'); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.veiculo_id || !formData.vendedor) {
      alert("Preencha Cliente, Veículo e Vendedor.");
      return;
    }

    if (!confirm("Confirmar venda e remover veículo do estoque?")) return;

    const dadosParaEnviar = {
      ...formData,
      valor_venda: formData.valor_venda ? parseFloat(formData.valor_venda) : 0,
      entrada: formData.entrada ? parseFloat(formData.entrada) : 0,
      financiado: formData.financiado ? parseFloat(formData.financiado) : 0
    };

    try {
      await api.post('/vendas', dadosParaEnviar);
      alert("✅ Venda realizada com sucesso!");
      window.location.href = '/'; 
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar venda.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FilePlus className="text-orange-600" size={32} /> Nova Negociação
          </h1>
          <p className="text-gray-500 mt-1">Preencha os dados para gerar documentos ou finalizar a venda.</p>
        </div>
        <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium border border-orange-100 flex items-center gap-2">
            <Calendar size={16}/> {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA - FORMULÁRIO */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. PARTICIPANTES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                    <User size={20} className="text-blue-500"/> 1. Participantes
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-blue-500"
                            value={formData.cliente_id}
                            onChange={e => setFormData({...formData, cliente_id: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.cpf_cnpj}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vendedor</label>
                        <div className="relative">
                            <input 
                                type="text"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                                placeholder="Nome..."
                                value={formData.vendedor}
                                onChange={e => setFormData({...formData, vendedor: e.target.value})}
                            />
                            <BadgeCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. VEÍCULO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                    <Car size={20} className="text-orange-500"/> 2. Veículo
                </h2>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Veículo em Estoque</label>
                    <select 
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-orange-500"
                        value={formData.veiculo_id}
                        onChange={handleVehicleChange}
                    >
                        <option value="">Selecione o Veículo...</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.modelo} - {v.placa} ({v.cor}) - R$ {Number(v.valor).toLocaleString('pt-BR')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 3. FINANCEIRO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                    <DollarSign size={20} className="text-green-600"/> 3. Pagamento
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Venda (R$)</label>
                     <input type="number" step="0.01" className="w-full p-3 border border-gray-300 rounded-lg font-bold text-gray-800 outline-none focus:border-green-500" 
                        value={formData.valor_venda} 
                        onChange={e => setFormData({...formData, valor_venda: e.target.value})} 
                     />
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Entrada (R$)</label>
                     <input type="number" step="0.01" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-500" 
                        value={formData.entrada} 
                        onChange={e => setFormData({...formData, entrada: e.target.value})} 
                     />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Saldo Financiado</label>
                     <div className="relative">
                        <input type="number" readOnly className="w-full p-3 pl-10 border border-gray-200 bg-gray-100 rounded-lg text-gray-500" 
                            value={formData.financiado} 
                        />
                        <Calculator size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                     </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Método</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-500"
                            value={formData.metodo_pagamento}
                            onChange={e => setFormData({...formData, metodo_pagamento: e.target.value})}
                        >
                            <option>Dinheiro</option>
                            <option>Pix</option>
                            <option>Transferência</option>
                            <option>Financiamento Bancário</option>
                            <option>Cartão de Crédito</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações</label>
                        <input 
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-500" 
                            value={formData.observacoes}
                            onChange={e => setFormData({...formData, observacoes: e.target.value})} 
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={handleSubmit} 
                className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
                <BadgeCheck size={24}/> FINALIZAR VENDA
            </button>
        </div>

        {/* COLUNA DIREITA - DOCUMENTOS */}
        <div className="lg:col-span-1">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 sticky top-4">
                <h2 className="font-bold text-lg mb-2 text-blue-900 flex items-center gap-2">
                    <FileText size={20} /> Central de Impressão
                </h2>
                <div className="grid grid-cols-1 gap-3 mt-4">
                    {documents.map((doc, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleGenerateDocument(doc.url)}
                        className="flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all group shadow-sm text-left"
                    >
                        <span className="font-medium text-sm">{doc.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded group-hover:bg-white group-hover:text-blue-600">Gerar</span>
                    </button>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default NovaFicha;
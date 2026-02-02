import { useState, useEffect } from 'react';
import { FilePlus, User, Car, DollarSign, FileText, BadgeCheck, Calculator, Calendar, ArrowRightLeft, Printer, AlertCircle, Info } from 'lucide-react';
import api from '../api'; 

const NovaFicha = () => {
  const [mode, setMode] = useState('venda'); // 'venda' | 'compra'
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [storeConfig, setStoreConfig] = useState(null);
  
  // Estado para erros de validação visual
  const [errors, setErrors] = useState({});

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

  const docsVenda = [
    { title: 'Recibo de Venda', url: '/templates/pages/Recibo_de_Venda.html' },
    { title: 'Termo de Responsabilidade', url: '/templates/pages/Termo.html' },
    { title: 'Procuração', url: '/templates/pages/procurcao.html' },
    { title: 'Declaração de Venda', url: '/templates/pages/declaracao.html' },
    { title: 'Ficha Cadastral (Banco)', url: '/templates/pages/ficha.html' }
  ];

  const docsCompra = [
    { title: 'Recibo de Compra', url: '/templates/pages/Compra.html' },
    { title: 'Procuração de Compra', url: '/templates/pages/procurcao.html' }
  ];

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, vehiclesRes, configRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/veiculos-estoque'),
          api.get('/config').catch(() => ({ data: null }))
        ]);
        setClients(clientsRes.data);
        setVehicles(vehiclesRes.data);
        setStoreConfig(configRes.data);
      } catch (error) {
        console.error("Erro ao carregar dados.", error);
        alert("Erro de conexão. Verifique se está logado.");
      }
    };
    loadData();
  }, []);

  // --- CÁLCULO DO SALDO ---
  useEffect(() => {
    const v = parseFloat(formData.valor_venda) || 0;
    const e = parseFloat(formData.entrada) || 0;
    const saldo = v - e;
    
    setFormData(prev => ({
      ...prev,
      financiado: saldo > 0 ? saldo.toFixed(2) : ''
    }));
  }, [formData.valor_venda, formData.entrada]);

  // Função para validar campos obrigatórios
  const validateForm = () => {
    const newErrors = {};
    if (!formData.cliente_id) newErrors.cliente_id = "Selecione um cliente";
    if (!formData.veiculo_id) newErrors.veiculo_id = "Selecione um veículo";
    if (!formData.vendedor) newErrors.vendedor = "Digite o nome do responsável";
    if (!formData.valor_venda) newErrors.valor_venda = "Informe o valor";

    setErrors(newErrors);
    // Retorna true se não houver erros
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (newMode) => {
    setMode(newMode);
    setErrors({}); // Limpa erros ao trocar de aba
    setFormData({
        cliente_id: '',
        veiculo_id: '',
        vendedor: '',
        valor_venda: '',
        entrada: '',
        financiado: '',
        metodo_pagamento: 'Dinheiro',
        observacoes: ''
    });
  };

  const handleVehicleChange = (e) => {
    const vId = e.target.value;
    const vehicle = vehicles.find(v => v.id.toString() === vId);
    
    // Limpa erro do veículo se selecionar um
    if(vId) setErrors(prev => ({...prev, veiculo_id: null}));

    setFormData(prev => ({
      ...prev,
      veiculo_id: vId,
      // Se for venda, pega preço de venda. Se for compra, tenta pegar preço de custo/compra
      valor_venda: vehicle ? (mode === 'venda' ? vehicle.valor : vehicle.custo) : '', 
      entrada: '',
      financiado: ''
    }));
  };

  const handleGenerateDocument = (docUrl) => {
    // Valida antes de gerar documento
    if (!validateForm()) {
      alert('⚠️ Preencha os campos obrigatórios (marcados em vermelho) para gerar o documento corretamente.');
      return;
    }

    const client = clients.find(c => c.id.toString() === formData.cliente_id.toString());
    const vehicle = vehicles.find(v => v.id.toString() === formData.veiculo_id.toString());

    // Prepara o objeto exato que o HTML espera ler
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
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      type: mode // 'venda' ou 'compra' para o template diferenciar se necessário
    };

    localStorage.setItem('sistema_print_data', JSON.stringify(printData));
    window.open(docUrl, '_blank'); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'compra') return; // Compra é apenas documental nesta tela

    if (!validateForm()) {
      alert("Por favor, corrija os erros assinalados antes de finalizar.");
      return;
    }

    if (!confirm("⚠️ ATENÇÃO: Isso irá registrar a venda financeiramente e remover o veículo do estoque.\n\nDeseja continuar?")) return;

    const dadosParaEnviar = {
      ...formData,
      valor_venda: formData.valor_venda ? parseFloat(formData.valor_venda) : 0,
      entrada: formData.entrada ? parseFloat(formData.entrada) : 0,
      financiado: formData.financiado ? parseFloat(formData.financiado) : 0
    };

    try {
      await api.post('/vendas', dadosParaEnviar);
      alert("✅ Venda Registrada com Sucesso!");
      window.location.href = '/'; 
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar venda. Verifique o console.");
    }
  };

  // Helper para classes de input com erro
  const inputClass = (fieldName) => `
    w-full p-3 border rounded-lg outline-none transition-all
    ${errors[fieldName] 
      ? 'border-red-500 bg-red-50 focus:border-red-600' 
      : 'border-gray-300 bg-gray-50 focus:border-blue-500 bg-white'}
  `;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      
      {/* HEADER E ABAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FilePlus className="text-orange-600" size={32} /> 
            {mode === 'venda' ? 'Nova Venda' : 'Documentação de Compra'}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1">
            <Info size={14}/>
            {mode === 'venda' 
              ? 'Preencha os dados obrigatórios (*) para liberar a venda.' 
              : 'Gere recibos para veículos que a loja está comprando.'}
          </p>
        </div>

        {/* SELETOR DE MODO */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
            <button 
                onClick={() => handleTabChange('venda')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold transition-all ${mode === 'venda' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <BadgeCheck size={18} /> Venda (Saída)
            </button>
            <button 
                onClick={() => handleTabChange('compra')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold transition-all ${mode === 'compra' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                <ArrowRightLeft size={18} /> Compra (Entrada)
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA - FORMULÁRIO */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. PARTICIPANTES */}
            <div className={`p-6 rounded-xl shadow-sm border ${mode === 'venda' ? 'border-orange-100 bg-white' : 'border-blue-100 bg-white'}`}>
                <h2 className={`font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2 ${mode === 'venda' ? 'text-orange-800' : 'text-blue-800'}`}>
                    <User size={20}/> 
                    {mode === 'venda' ? '1. Quem está comprando?' : '1. Quem está vendendo para a loja?'}
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            {mode === 'venda' ? 'Cliente (Comprador)' : 'Proprietário Anterior'} <span className="text-red-500">*</span>
                        </label>
                        <select 
                            className={inputClass('cliente_id')}
                            value={formData.cliente_id}
                            onChange={e => {
                                setFormData({...formData, cliente_id: e.target.value});
                                if(e.target.value) setErrors(prev => ({...prev, cliente_id: null}));
                            }}
                        >
                            <option value="">Selecione na lista...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.nome} - {c.cpf_cnpj}</option>)}
                        </select>
                        {errors.cliente_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.cliente_id}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                           {mode === 'venda' ? 'Vendedor Responsável' : 'Comprador (Funcionário)'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="text"
                                className={inputClass('vendedor')}
                                placeholder={mode === 'venda' ? "Ex: João Silva" : "Quem negociou a compra?"}
                                value={formData.vendedor}
                                onChange={e => {
                                    setFormData({...formData, vendedor: e.target.value});
                                    if(e.target.value) setErrors(prev => ({...prev, vendedor: null}));
                                }}
                            />
                            <User className="absolute right-3 top-3.5 text-gray-400" size={18} />
                        </div>
                        {errors.vendedor && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.vendedor}</p>}
                    </div>
                </div>
            </div>

            {/* 2. VEÍCULO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                    <Car size={20} className="text-gray-600"/> 2. Dados do Veículo
                </h2>
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                        Selecione o Veículo <span className="text-red-500">*</span>
                    </label>
                    <select 
                        className={inputClass('veiculo_id')}
                        value={formData.veiculo_id}
                        onChange={handleVehicleChange}
                    >
                        <option value="">Selecione o Veículo no Estoque...</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.modelo} - {v.placa} ({v.cor}) - R$ {Number(v.valor).toLocaleString('pt-BR')}
                            </option>
                        ))}
                    </select>
                    {errors.veiculo_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={10}/> {errors.veiculo_id}</p>}
                    
                    {mode === 'compra' && (
                        <div className="mt-2 p-2 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                            <strong>Dica:</strong> Se o carro ainda não está aqui, cadastre-o primeiro no menu "Estoque".
                        </div>
                    )}
                </div>
            </div>

            {/* 3. FINANCEIRO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="font-bold text-lg mb-4 text-gray-700 flex items-center gap-2 border-b pb-2">
                    <DollarSign size={20} className="text-green-600"/> 
                    {mode === 'venda' ? '3. Negociação e Valores' : '3. Valores da Compra'}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                        {mode === 'venda' ? 'Valor Final (R$)' : 'Valor Pago (R$)'} <span className="text-red-500">*</span>
                     </label>
                     <input type="number" step="0.01" 
                        className={`${inputClass('valor_venda')} font-bold text-gray-800`}
                        value={formData.valor_venda} 
                        onChange={e => {
                            setFormData({...formData, valor_venda: e.target.value});
                            if(e.target.value) setErrors(prev => ({...prev, valor_venda: null}));
                        }} 
                     />
                     {errors.valor_venda && <p className="text-red-500 text-xs mt-1">Valor obrigatório</p>}
                   </div>
                   
                   <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Entrada (R$)</label>
                     <input type="number" step="0.01" className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-500" 
                        value={formData.entrada} 
                        onChange={e => setFormData({...formData, entrada: e.target.value})} 
                        disabled={mode === 'compra'}
                        placeholder={mode === 'compra' ? '-' : '0,00'}
                     />
                   </div>

                   <div>
                     <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Saldo a Financiar</label>
                     <div className="relative">
                        <input type="number" readOnly className="w-full p-3 pl-10 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 font-medium" 
                            value={formData.financiado} 
                            placeholder="Automático"
                        />
                        <Calculator size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                     </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Forma de Pagamento</label>
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
                            <option>Troca</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Observações (Opcional)</label>
                        <input 
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-green-500" 
                            placeholder="Ex: IPVA pago, garantia..."
                            value={formData.observacoes}
                            onChange={e => setFormData({...formData, observacoes: e.target.value})} 
                        />
                    </div>
                </div>
            </div>

            {/* BOTÃO DE AÇÃO PRINCIPAL */}
            {mode === 'venda' ? (
                <button 
                    onClick={handleSubmit} 
                    className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01]"
                >
                    <BadgeCheck size={24}/> FINALIZAR VENDA E DAR BAIXA
                </button>
            ) : (
                <div className="bg-blue-50 text-blue-900 p-4 rounded-xl border border-blue-200 text-center shadow-sm">
                    <p className="flex items-center justify-center gap-2 font-bold text-lg">
                        <Printer size={24}/>
                        Área de Impressão
                    </p>
                    <p className="text-sm mt-1">Preencha os dados acima e selecione um documento ao lado para imprimir.</p>
                </div>
            )}
        </div>

        {/* COLUNA DIREITA - DOCUMENTOS */}
        <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl border sticky top-4 ${mode === 'venda' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                <h2 className={`font-bold text-lg mb-2 flex items-center gap-2 ${mode === 'venda' ? 'text-orange-900' : 'text-blue-900'}`}>
                    <FileText size={20} /> 
                    {mode === 'venda' ? 'Documentos de Venda' : 'Documentos de Compra'}
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                    Clique para gerar o PDF com os dados preenchidos.
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                    {(mode === 'venda' ? docsVenda : docsCompra).map((doc, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleGenerateDocument(doc.url)}
                        className={`flex items-center justify-between p-4 bg-white border rounded-lg transition-all group shadow-sm text-left
                            ${mode === 'venda' 
                                ? 'border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600' 
                                : 'border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                            }`}
                    >
                        <span className="font-medium text-sm">{doc.title}</span>
                        <span className={`text-xs px-2 py-1 rounded font-bold
                            ${mode === 'venda' 
                                ? 'bg-orange-100 text-orange-800 group-hover:bg-white group-hover:text-orange-600' 
                                : 'bg-blue-100 text-blue-800 group-hover:bg-white group-hover:text-blue-600'
                            }`}>
                            Gerar
                        </span>
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
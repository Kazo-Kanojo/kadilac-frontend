import { useState, useEffect } from 'react';
import { X, CheckCircle, DollarSign, User, Calendar, Camera, AlertCircle, ArrowRightLeft, Calculator } from 'lucide-react';

const CloseFileModal = ({ isOpen, onClose, onConfirm, vehicle, clientsList = [], tradeInInfo }) => {
  const [saleData, setSaleData] = useState({
    operacao: 'Venda',
    valor_venda: '',
    entrada: '', // ADICIONADO: Campo de Entrada
    data_venda: new Date().toISOString().split('T')[0],
    cliente_id: '',
    vendedor: '', 
    metodo_pagamento: 'Pix',
    observacoes: ''
  });

  // Efeito para configurar valores automáticos e TROCA
  // Efeito para configurar valores automáticos e TROCA
  useEffect(() => {
    if (vehicle && isOpen) {
        // Reseta ou define valores iniciais
        let initialValor = vehicle.valor || '';
        let initialEntrada = '';
        let initialObs = '';
        let initialMetodo = 'Pix';
        let isTroca = false;
        let trocaDesc = '';

        // 1. Tenta pegar a info do fluxo automático (cadastro imediato)
        if (tradeInInfo) {
            initialEntrada = tradeInInfo.value; 
            trocaDesc = tradeInInfo.model || 'Veículo da Troca'; // <--- CORREÇÃO AQUI
            isTroca = true;
        }
        // 2. Se não tem fluxo automático, verifica se o veículo já tem uma troca salva no BD (via backend novo que fizemos)
        else if (vehicle.veiculo_troca) {
            initialEntrada = vehicle.valor_troca || '';
            trocaDesc = `${vehicle.veiculo_troca} - ${vehicle.placa_troca || 'Sem Placa'}`;
            isTroca = true;
        }

        // Se encontrou dados de troca em qualquer um dos cenários:
        if (isTroca) {
            initialObs = `Entrada via Troca: Veículo ${trocaDesc} (R$ ${Number(initialEntrada).toLocaleString('pt-BR')})`;
            initialMetodo = 'Troca'; 
        }

        setSaleData({
            operacao: 'Venda',
            valor_venda: initialValor,
            entrada: initialEntrada,
            data_venda: new Date().toISOString().split('T')[0],
            cliente_id: '',
            vendedor: '',
            metodo_pagamento: initialMetodo,
            observacoes: initialObs
        });
    }
  }, [vehicle, isOpen, tradeInInfo]);

  const handleChange = (e) => {
    setSaleData({ ...saleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!saleData.valor_venda || !saleData.cliente_id || !saleData.vendedor) {
      alert("Preencha o valor, o cliente e o vendedor.");
      return;
    }
    
    // Tratamento numérico para envio
    const payload = {
        ...saleData,
        valor_venda: parseFloat(saleData.valor_venda),
        entrada: parseFloat(saleData.entrada) || 0,
        observacoes: saleData.observacoes
    };
    
    onConfirm(payload);
  };

  if (!isOpen || !vehicle) return null;

  const isDevolucao = saleData.operacao === 'Devolução';
  const hasTrocaDetectada = tradeInInfo || vehicle?.veiculo_troca;
  // Cálculo do restante a pagar em tempo real
  const valorVendaNum = parseFloat(saleData.valor_venda) || 0;
  const entradaNum = parseFloat(saleData.entrada) || 0;
  const restante = valorVendaNum - entradaNum;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh]">
        
        {/* COLUNA ESQUERDA: Resumo (Mantive igual, só adicionei o destaque da troca se houver) */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto hidden md:flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Resumo do Veículo</h3>
            
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative shrink-0">
                {vehicle.foto ? (
                    <img src={vehicle.foto} alt="Veículo" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Camera size={32} className="mb-2"/><span className="text-xs">Sem foto</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Modelo</p>
                    <p className="font-bold text-gray-800 uppercase">{vehicle.modelo}</p>
                </div>
                
                {/* CARD DE AVISO DE TROCA NA LATERAL */}
                {hasTrocaDetectada && (
                    <div className="bg-blue-100 border border-blue-200 p-3 rounded-lg animate-pulse">
                        <p className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                            <ArrowRightLeft size={14}/> Troca Detectada
                        </p>
                        <p className="text-sm text-blue-900 mt-1">
                            O veículo <strong>{tradeInInfo ? tradeInInfo.model : vehicle.veiculo_troca}</strong> entrou como pagamento de 
                            <strong> R$ {Number(tradeInInfo ? tradeInInfo.value : vehicle.valor_troca).toLocaleString()}</strong>.
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-white">
            
            {/* HEADER */}
            <div className={`${isDevolucao ? 'bg-orange-600' : 'bg-green-600'} p-4 flex justify-between items-center shrink-0`}>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    {isDevolucao ? <ArrowRightLeft size={24}/> : <CheckCircle size={24}/>}
                    {isDevolucao ? 'Devolução' : 'Fechar Venda'}
                </h2>
                <button onClick={onClose} className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/20 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            
                {/* Seleção de Operação */}
                <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-bold shrink-0">
                    <button type="button" onClick={() => setSaleData(prev => ({ ...prev, operacao: 'Venda' }))} className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${!isDevolucao ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <DollarSign size={16}/> Venda
                    </button>
                    <button type="button" onClick={() => setSaleData(prev => ({ ...prev, operacao: 'Devolução' }))} className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${isDevolucao ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <ArrowRightLeft size={16}/> Devolução
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Cliente / Comprador</label>
                        <select name="cliente_id" value={saleData.cliente_id} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium">
                            <option value="">Selecione...</option>
                            {clientsList.map(cli => (
                                <option key={cli.id} value={cli.id}>{cli.nome} - {cli.cpf_cnpj || 'Sem Doc'}</option>
                            ))}
                        </select>
                    </div>

                    {/* VALORES FINANCEIROS */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Valor Total Venda</label>
                        <div className="relative">
                            <input type="number" step="0.01" name="valor_venda" value={saleData.valor_venda} onChange={handleChange} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-bold text-lg text-green-700" placeholder="0,00"/>
                            <DollarSign className="absolute left-2.5 top-3 text-green-600" size={18}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase flex justify-between">
                            <span>Entrada / Troca</span>
                            {hasTrocaDetectada && <span className="text-blue-600 text-[10px]">Preenchido via Troca</span>}
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                step="0.01" 
                                name="entrada" 
                                value={saleData.entrada} 
                                onChange={handleChange} 
                                className={`w-full pl-9 p-2.5 border rounded-lg focus:ring-2 outline-none font-bold text-lg ${hasTrocaDetectada ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                                placeholder="0,00"
                            />
                            <ArrowRightLeft className={`absolute left-2.5 top-3 ${hasTrocaDetectada ? 'text-blue-500' : 'text-gray-400'}`} size={18}/>
                        </div>
                    </div>
                </div>

                {/* CARD DE SALDO RESTANTE */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Calculator size={20}/>
                        <span className="text-sm font-bold uppercase">Restante a Receber:</span>
                    </div>
                    <span className={`text-xl font-black ${restante > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        R$ {restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Venda</label>
                        <div className="relative">
                            <input type="date" name="data_venda" value={saleData.data_venda} onChange={handleChange} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"/>
                            <Calendar className="absolute left-2.5 top-2.5 text-gray-400" size={18}/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Vendedor (Resp.)</label>
                        <div className="relative">
                            <input type="text" name="vendedor" value={saleData.vendedor} onChange={handleChange} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Quem autorizou..."/>
                            <User className="absolute left-2.5 top-2.5 text-gray-400" size={18}/>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Forma de Pagamento (Restante)</label>
                    <select name="metodo_pagamento" value={saleData.metodo_pagamento} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none">
                        <option value="Pix">Pix</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Financiamento">Financiamento</option>
                        <option value="Cartão">Cartão</option>
                        <option value="Troca">Troca</option>
                        <option value="Troca + Pix">Troca + Pix</option>
                        <option value="Troca + Financiamento">Troca + Financiamento</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Observações</label>
                    <textarea name="observacoes" rows="2" value={saleData.observacoes} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"></textarea>
                </div>
            </form>

            {/* FOOTER */}
            <div className="p-4 bg-gray-50 border-t flex justify-end shrink-0 z-10">
                <button 
                    onClick={handleSubmit} 
                    className={`px-8 py-3 text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center gap-2 ${isDevolucao ? 'bg-orange-600 shadow-orange-200' : 'bg-green-600 shadow-green-200'}`}
                >
                    {isDevolucao ? 'Confirmar Devolução' : 'Confirmar Venda'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CloseFileModal;
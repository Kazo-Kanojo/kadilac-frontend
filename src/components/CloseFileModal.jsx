import { useState, useEffect } from 'react';
import { X, CheckCircle, DollarSign, User, Calendar, Camera, AlertCircle, ArrowRightLeft } from 'lucide-react';

const CloseFileModal = ({ isOpen, onClose, onConfirm, vehicle, clientsList = [] }) => {
  const [saleData, setSaleData] = useState({
    operacao: 'Venda', // 'Venda' ou 'Devolução'
    valor_venda: '',
    data_venda: new Date().toISOString().split('T')[0],
    cliente_id: '',
    vendedor: '', 
    metodo_pagamento: 'Pix',
    observacoes: ''
  });

  // Efeito para configurar valores automáticos
  useEffect(() => {
    if (vehicle) {
        if (saleData.operacao === 'Devolução') {
            const owner = clientsList.find(c => 
                c.nome.trim().toLowerCase() === vehicle.proprietario_anterior?.trim().toLowerCase()
            );
            
            setSaleData(prev => ({
                ...prev,
                valor_venda: vehicle.custo || '',
                cliente_id: owner ? owner.id : '',
                observacoes: 'Devolução do veículo ao proprietário anterior.'
            }));
        } else {
            setSaleData(prev => ({
                ...prev,
                valor_venda: vehicle.valor || '',
                cliente_id: '',
                observacoes: ''
            }));
        }
    }
  }, [saleData.operacao, vehicle, clientsList]);

  const handleChange = (e) => {
    setSaleData({ ...saleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!saleData.valor_venda || !saleData.cliente_id || !saleData.vendedor) {
      alert("Preencha o valor, o cliente/destinatário e o responsável.");
      return;
    }
    
    onConfirm({
        ...saleData,
        observacoes: `[${saleData.operacao.toUpperCase()}] ${saleData.observacoes}`
    });
  };

  if (!isOpen || !vehicle) return null;

  const isDevolucao = saleData.operacao === 'Devolução';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Container Principal: Adicionado 'h-[90vh]' para forçar altura e evitar estouro */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh]">
        
        {/* COLUNA ESQUERDA: DETALHES (Visível em Desktop, Scrollável se necessário) */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto hidden md:flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Resumo do Veículo</h3>
            
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 relative shrink-0">
                {vehicle.foto ? (
                    <img src={vehicle.foto} alt="Veículo" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Camera size={32} className="mb-2"/>
                        <span className="text-xs">Sem foto</span>
                    </div>
                )}
            </div>

            <div className="space-y-3 text-sm">
                <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase">Modelo</p>
                    <p className="font-bold text-gray-800 uppercase">{vehicle.modelo}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Placa</p>
                        <p className="font-mono font-bold text-gray-700">{vehicle.placa}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-gray-200">
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Ano</p>
                        <p className="font-bold text-gray-700">{vehicle.ano}</p>
                    </div>
                </div>
                {isDevolucao && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800 flex items-start gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                        <p>Valor registrado será o de <strong>Custo</strong>.</p>
                    </div>
                )}
            </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO (Flex Column para forçar Footer no final) */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-white">
            
            {/* HEADER (Fixo) */}
            <div className={`${isDevolucao ? 'bg-orange-600' : 'bg-green-600'} p-4 flex justify-between items-center shrink-0`}>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                    {isDevolucao ? <ArrowRightLeft size={24}/> : <CheckCircle size={24}/>}
                    {isDevolucao ? 'Devolução' : 'Fechar Venda'}
                </h2>
                <button onClick={onClose} className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/20 transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* FORMULÁRIO (Scrollável - min-h-0 é crucial aqui) */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
            
                {/* Seleção de Operação */}
                <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-bold shrink-0">
                    <button
                        type="button"
                        onClick={() => setSaleData(prev => ({ ...prev, operacao: 'Venda' }))}
                        className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${!isDevolucao ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <DollarSign size={16}/> Venda
                    </button>
                    <button
                        type="button"
                        onClick={() => setSaleData(prev => ({ ...prev, operacao: 'Devolução' }))}
                        className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${isDevolucao ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ArrowRightLeft size={16}/> Devolução
                    </button>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            {isDevolucao ? 'Devolver Para (Fornecedor)' : 'Comprador (Cliente)'}
                        </label>
                        <select 
                            name="cliente_id" 
                            value={saleData.cliente_id} 
                            onChange={handleChange}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                        >
                            <option value="">Selecione...</option>
                            {clientsList.map(cli => (
                                <option key={cli.id} value={cli.id}>{cli.nome} - {cli.cpf_cnpj || 'Sem Doc'}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            {isDevolucao ? 'Valor Custo/Saída' : 'Valor Venda'}
                        </label>
                        <div className="relative">
                            <input 
                                type="number" step="0.01" name="valor_venda" 
                                value={saleData.valor_venda} onChange={handleChange} 
                                className={`w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 outline-none font-bold text-lg ${isDevolucao ? 'text-orange-600 focus:ring-orange-500' : 'text-green-700 focus:ring-green-500'}`}
                                placeholder="0,00"
                            />
                            <DollarSign className={`absolute left-2.5 top-3 ${isDevolucao ? 'text-orange-500' : 'text-green-600'}`} size={18}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data de Saída</label>
                        <div className="relative">
                            <input type="date" name="data_venda" value={saleData.data_venda} onChange={handleChange} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"/>
                            <Calendar className="absolute left-2.5 top-2.5 text-gray-400" size={18}/>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Responsável</label>
                        <div className="relative">
                            <input type="text" name="vendedor" value={saleData.vendedor} onChange={handleChange} className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Quem autorizou..."/>
                            <User className="absolute left-2.5 top-2.5 text-gray-400" size={18}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                            {isDevolucao ? 'Motivo' : 'Pagamento'}
                        </label>
                        <select name="metodo_pagamento" value={saleData.metodo_pagamento} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none">
                            {isDevolucao ? (
                                <>
                                    <option>Devolução Financeira</option>
                                    <option>Cancelamento</option>
                                    <option>Troca</option>
                                </>
                            ) : (
                                <>
                                    <option>Pix</option>
                                    <option>Dinheiro</option>
                                    <option>Financiamento</option>
                                    <option>Cartão</option>
                                    <option>Troca</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Observações</label>
                    <textarea name="observacoes" rows="2" value={saleData.observacoes} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"></textarea>
                </div>
            </form>

            {/* FOOTER (Fixo - shrink-0 garante que não suma) */}
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
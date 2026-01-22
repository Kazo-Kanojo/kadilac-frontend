import { useState } from 'react';
import { X, CheckCircle, DollarSign, User, Calendar } from 'lucide-react';

const CloseFileModal = ({ isOpen, onClose, onConfirm, vehicle, clientsList = [] }) => {
  const [saleData, setSaleData] = useState({
    valor_venda: '',
    data_venda: new Date().toISOString().split('T')[0],
    cliente_id: '',
    vendedor: '', // Novo campo para o vendedor da loja
    metodo_pagamento: 'Pix',
    observacoes: ''
  });

  const handleChange = (e) => {
    setSaleData({ ...saleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validação simples
    if (!saleData.valor_venda || !saleData.cliente_id || !saleData.vendedor) {
      alert("Preencha o valor, o cliente e o vendedor.");
      return;
    }
    onConfirm(saleData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
        
        <div className="bg-green-600 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <CheckCircle size={20}/> Fechar Negócio
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white rounded-full p-1 hover:bg-green-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
            <p className="text-xs text-gray-500 uppercase font-bold">Veículo</p>
            <p className="text-gray-800 font-medium">{vehicle?.modelo} - {vehicle?.placa}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Comprador (Cliente)</label>
            <select 
                name="cliente_id" 
                value={saleData.cliente_id} 
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none bg-white"
            >
                <option value="">Selecione o Cliente...</option>
                {clientsList.map(cli => (
                    <option key={cli.id} value={cli.id}>{cli.nome} - {cli.cpf_cnpj}</option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Valor Final (R$)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        step="0.01"
                        name="valor_venda" 
                        value={saleData.valor_venda} 
                        onChange={handleChange} 
                        className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700" 
                        placeholder="0,00"
                    />
                    <DollarSign className="absolute left-2 top-2.5 text-green-600" size={16}/>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Data Venda</label>
                <input 
                    type="date" 
                    name="data_venda" 
                    value={saleData.data_venda} 
                    onChange={handleChange} 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>
          </div>

          {/* CAMPO VENDEDOR */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Vendedor (Responsável)</label>
            <div className="relative">
                <input 
                    type="text" 
                    name="vendedor" 
                    value={saleData.vendedor} 
                    onChange={handleChange} 
                    className="w-full pl-8 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" 
                    placeholder="Nome do vendedor..."
                />
                <User className="absolute left-2 top-2.5 text-gray-400" size={16}/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Forma de Pagamento</label>
            <select 
                name="metodo_pagamento" 
                value={saleData.metodo_pagamento} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded bg-white outline-none"
            >
                <option>Pix</option>
                <option>Dinheiro</option>
                <option>Financiamento</option>
                <option>Cartão</option>
                <option>Troca</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md mt-4"
          >
            Confirmar Venda
          </button>

        </form>
      </div>
    </div>
  );
};

export default CloseFileModal;
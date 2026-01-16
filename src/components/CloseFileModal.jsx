/* eslint-disable react/prop-types */
import { useState } from 'react';
import { X, Check, UserPlus, CarFront } from 'lucide-react';

const CloseFileModal = ({ isOpen, onClose, onConfirm, vehicle }) => {
  const [saleData, setSaleData] = useState({
    dataSaida: new Date().toISOString().split('T')[0],
    operacao: 'Venda',
    valorSaida: '',
    comprador: '',
    observacoes: ''
  });

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col border-t-4 border-red-500">
        
        {/* Header Simples */}
        <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-600">Fecha ficha do veículo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-6">
          
          {/* ESQUERDA: FOTO (Read-only) */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-full h-40 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center mb-2">
               {/* Aqui viria a foto real do carro, usei ícone como placeholder */}
               <CarFront size={64} className="text-gray-300"/> 
            </div>
            {/* Ocultei o botão de adicionar foto pois na hora da venda geralmente só se visualiza */}
          </div>

          {/* DIREITA: DADOS DA VENDA */}
          <div className="w-full md:w-2/3 space-y-4">
            
            {/* Resumo do Veículo (Texto Azul igual ao print) */}
            <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
               <p className="text-xs font-bold text-gray-500">Data entrada: <span className="text-gray-800">{vehicle.entrada}</span></p>
               <h3 className="text-sm font-extrabold text-blue-900 mt-1 uppercase leading-snug">
                  {vehicle.modelo} - {vehicle.cor} - {vehicle.ano} - Placa: {vehicle.placa}
               </h3>
            </div>

            {/* Linha 1: Data, Operação, Valor */}
            <div className="flex gap-3">
               <div className="w-1/3">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Data saída</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded p-1 text-sm focus:border-red-500 outline-none"
                    value={saleData.dataSaida}
                    onChange={e => setSaleData({...saleData, dataSaida: e.target.value})}
                  />
               </div>
               <div className="w-1/3">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Operação</label>
                  <select 
                    className="w-full border border-gray-300 rounded p-1 text-sm outline-none"
                    value={saleData.operacao}
                    onChange={e => setSaleData({...saleData, operacao: e.target.value})}
                  >
                     <option>Venda</option>
                     <option>Devolução</option>
                     <option>Perda Total</option>
                  </select>
               </div>
               <div className="w-1/3">
                  <label className="block text-xs font-bold text-gray-600 mb-1">Valor saída</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1 text-xs font-bold text-gray-500">R$</span>
                    <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded p-1 pl-6 text-sm font-bold text-gray-700 outline-none focus:border-red-500"
                        placeholder="0,00"
                        value={saleData.valorSaida}
                        onChange={e => setSaleData({...saleData, valorSaida: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            {/* Linha 2: Comprador */}
            <div>
               <label className="block text-xs font-bold text-gray-600 mb-1">Comprador</label>
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded p-1 text-sm outline-none uppercase"
                    value={saleData.comprador}
                    onChange={e => setSaleData({...saleData, comprador: e.target.value})}
                  />
                  <button className="flex items-center gap-1 bg-yellow-100 border border-yellow-300 px-3 py-1 rounded text-xs font-bold text-yellow-800 hover:bg-yellow-200">
                     <UserPlus size={14}/> Novo
                  </button>
               </div>
            </div>

            {/* Linha 3: Observações */}
            <div>
               <label className="block text-xs font-bold text-gray-600 mb-1">Observações</label>
               <textarea 
                  className="w-full border border-gray-300 rounded p-2 text-sm h-20 resize-none outline-none focus:border-red-500"
                  value={saleData.observacoes}
                  onChange={e => setSaleData({...saleData, observacoes: e.target.value})}
               ></textarea>
            </div>

          </div>
        </div>

        {/* Footer (Botões Fecha / Sair) */}
        <div className="bg-gray-100 p-3 rounded-b-lg flex justify-start gap-4 border-t px-6">
          <button 
            onClick={() => onConfirm(saleData)}
            className="flex items-center gap-2 bg-green-200 border border-green-400 text-green-900 px-6 py-2 rounded shadow-sm hover:bg-green-300 font-bold text-sm transition-colors"
          >
             <Check size={18} /> Fecha
          </button>
          
          <button 
            onClick={onClose}
            className="flex items-center gap-2 bg-red-200 border border-red-400 text-red-900 px-6 py-2 rounded shadow-sm hover:bg-red-300 font-bold text-sm transition-colors"
          >
             <X size={18} /> Sair
          </button>
        </div>

      </div>
    </div>
  );
};

export default CloseFileModal;
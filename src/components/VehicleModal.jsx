/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, Camera, Save, Calendar } from 'lucide-react';

const VehicleModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const [formData, setFormData] = useState({
    modelo: '', placa: '', ano: '', cor: '', valor: '', custo: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    operacao: 'Compra',
    renavam: '', chassi: '', opcionais: '', observacoes: ''
  });

  // Carrega dados se for edição
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(initialData);
    } else {
        // Reseta se for novo
        setFormData({
            modelo: '', placa: '', ano: '', cor: '', valor: '', custo: '',
            dataEntrada: new Date().toISOString().split('T')[0],
            operacao: 'Compra',
            renavam: '', chassi: '', opcionais: '', observacoes: ''
        });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        
        {/* Header do Modal */}
        <div className="bg-kadilac-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {mode === 'edit' ? 'Alterar Ficha do Veículo' : 'Nova Ficha de Veículo'}
          </h2>
          <button onClick={onClose} className="hover:bg-kadilac-400 p-1 rounded transition-colors"><X size={24}/></button>
        </div>

        {/* Corpo do Formulário */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* COLUNA DA ESQUERDA: FOTO (Igual ao print) */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-kadilac-300 hover:bg-blue-50 transition-all group relative overflow-hidden">
                {/* Aqui viria a lógica de preview da imagem */}
                <Camera size={48} className="text-gray-300 group-hover:text-kadilac-300 mb-2" />
                <p className="text-sm text-gray-500 text-center px-4 font-medium group-hover:text-kadilac-400">
                    Clique aqui para adicionar a foto do veículo
                </p>
              </div>
              
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status da Ficha</label>
                  <select 
                    className="w-full mt-1 border p-2 rounded bg-gray-50 font-bold text-gray-700"
                    value={formData.status || 'Em estoque'}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                      <option value="Em estoque">Em Estoque (Disponível)</option>
                      <option value="Vendido">Vendido (Fechada)</option>
                      <option value="Manutenção">Em Manutenção</option>
                  </select>
              </div>
            </div>

            {/* COLUNA DA DIREITA: CAMPOS (Baseado no print 2026-01-16 193344) */}
            <div className="w-full md:w-2/3 space-y-4">
              
              {/* Linha 1: Dados de Entrada */}
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Data Entrada</label>
                    <input type="date" value={formData.dataEntrada} onChange={e => setFormData({...formData, dataEntrada: e.target.value})} className="w-full border p-1 rounded text-sm"/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Operação</label>
                    <select className="w-full border p-1 rounded text-sm" value={formData.operacao} onChange={e => setFormData({...formData, operacao: e.target.value})}>
                        <option>Compra</option>
                        <option>Consignação</option>
                        <option>Troca</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Valor Entrada (R$)</label>
                    <input type="number" placeholder="0,00" value={formData.custo} onChange={e => setFormData({...formData, custo: e.target.value})} className="w-full border p-1 rounded text-sm border-gray-300"/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Previsão Venda (R$)</label>
                    <input type="number" placeholder="0,00" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="w-full border p-1 rounded text-sm border-blue-200 bg-blue-50"/>
                </div>
              </div>

              {/* Linha 2: Veículo Principal */}
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Veículo (Marca/Modelo)</label>
                    <input type="text" placeholder="Ex: FORD KA SE" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full border p-1 rounded text-sm uppercase"/>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Ano/Mod</label>
                    <input type="text" placeholder="24/25" value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} className="w-full border p-1 rounded text-sm"/>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Cor</label>
                    <input type="text" placeholder="Prata" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} className="w-full border p-1 rounded text-sm"/>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                    <input type="text" placeholder="ABC-1234" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} className="w-full border p-1 rounded text-sm uppercase font-mono bg-yellow-50"/>
                </div>
              </div>

              {/* Linha 3: Documentação */}
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Renavam</label>
                    <input type="text" value={formData.renavam} onChange={e => setFormData({...formData, renavam: e.target.value})} className="w-full border p-1 rounded text-sm"/>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Chassi</label>
                    <input type="text" value={formData.chassi} onChange={e => setFormData({...formData, chassi: e.target.value})} className="w-full border p-1 rounded text-sm"/>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Certificado (DUT)</label>
                    <input type="text" className="w-full border p-1 rounded text-sm"/>
                 </div>
              </div>

              {/* Linha 4: Opcionais e Observações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Opcionais</label>
                    <textarea value={formData.opcionais} onChange={e => setFormData({...formData, opcionais: e.target.value})} className="w-full border p-2 rounded text-sm h-24 resize-none" placeholder="Ar, Trava, Vidro..."></textarea>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Observações Internas</label>
                    <textarea value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="w-full border p-2 rounded text-sm h-24 resize-none" placeholder="Detalhes de mecânica, riscos..."></textarea>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t rounded-b-lg flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold">Cancelar</button>
          <button onClick={() => onSave(formData)} className="px-6 py-2 rounded bg-kadilac-300 text-white hover:bg-kadilac-400 font-bold flex items-center gap-2 shadow-lg">
             <Save size={18}/> {mode === 'edit' ? 'Salvar Alterações' : 'Incluir Veículo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
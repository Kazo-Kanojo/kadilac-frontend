/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, Camera, Save } from 'lucide-react';

const VehicleModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  // Estado inicial atualizado com novos campos
  const initialFormState = {
    modelo: '', 
    placa: '', 
    ano: '', 
    cor: '', 
    combustivel: 'Flex', // Novo Campo
    valor: '', 
    custo: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    operacao: 'Compra',
    proprietario: '', // Novo Campo (Proprietário Anterior)
    vendedor: '',     // Novo Campo (Quem Vendeu)
    renavam: '', 
    chassi: '', 
    opcionais: '', 
    observacoes: '',
    status: 'Em estoque'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      // Garante que os campos novos existam mesmo se o objeto antigo não tiver
      setFormData({ ...initialFormState, ...initialData });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header do Modal */}
        <div className="bg-[#D80000] text-white px-6 py-4 flex justify-between items-center shadow-md flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {mode === 'edit' ? 'Alterar Ficha do Veículo' : 'Nova Ficha de Veículo'}
          </h2>
          <button 
            onClick={onClose} 
            className="hover:bg-red-800 p-2 rounded-full transition-colors"
          >
            <X size={24}/>
          </button>
        </div>

        {/* Corpo do Formulário com Scroll */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* COLUNA DA ESQUERDA: FOTO E STATUS */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              
              {/* Box da Foto */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-[#D80000] hover:bg-red-50 transition-all group relative overflow-hidden shadow-sm">
                <Camera size={48} className="text-gray-300 group-hover:text-[#D80000] mb-3 transition-colors" />
                <p className="text-sm text-gray-500 text-center px-6 font-medium group-hover:text-red-700 transition-colors">
                    Clique aqui para adicionar a foto do veículo
                </p>
              </div>
              
              {/* Box do Status */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Status da Ficha</label>
                  <div className="relative">
                    <select 
                        className={`w-full p-3 rounded-lg font-bold text-sm border focus:ring-2 focus:ring-[#D80000] outline-none appearance-none cursor-pointer ${
                            formData.status === 'Em estoque' ? 'bg-green-50 text-green-700 border-green-200' :
                            formData.status === 'Vendido' ? 'bg-red-50 text-red-700 border-red-200' : 
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="Em estoque">Em Estoque (Disponível)</option>
                        <option value="Vendido">Vendido (Fechada)</option>
                        <option value="Manutenção">Em Manutenção</option>
                        <option value="Reservado">Reservado</option>
                    </select>
                  </div>
              </div>
            </div>

            {/* COLUNA DA DIREITA: CAMPOS DO FORMULÁRIO */}
            <div className="w-full md:w-2/3 space-y-5">
              
              {/* SEÇÃO 1: DADOS FINANCEIROS E ENTRADA */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Entrada & Financeiro</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Entrada</label>
                        <input type="date" value={formData.dataEntrada} onChange={e => setFormData({...formData, dataEntrada: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operação</label>
                        <select className="w-full border-gray-300 border p-2 rounded-lg text-sm bg-white" value={formData.operacao} onChange={e => setFormData({...formData, operacao: e.target.value})}>
                            <option>Compra</option>
                            <option>Consignação</option>
                            <option>Troca</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                        <input type="number" placeholder="0,00" value={formData.custo} onChange={e => setFormData({...formData, custo: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venda (R$)</label>
                        <input type="number" placeholder="0,00" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="w-full border-blue-200 border p-2 rounded-lg text-sm bg-blue-50 font-semibold text-blue-700 focus:border-blue-500 outline-none"/>
                    </div>
                </div>
              </div>

              {/* SEÇÃO 2: DADOS DE ORIGEM (NOVOS CAMPOS) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Dados de Origem</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proprietário Anterior</label>
                        <input 
                            type="text" 
                            placeholder="Nome no documento..." 
                            value={formData.proprietario} 
                            onChange={e => setFormData({...formData, proprietario: e.target.value})} 
                            className="w-full border-gray-300 border p-2 rounded-lg text-sm focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quem Vendeu (Vendedor)</label>
                        <input 
                            type="text" 
                            placeholder="Quem negociou..." 
                            value={formData.vendedor} 
                            onChange={e => setFormData({...formData, vendedor: e.target.value})} 
                            className="w-full border-gray-300 border p-2 rounded-lg text-sm focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none"
                        />
                    </div>
                 </div>
              </div>

              {/* SEÇÃO 3: VEÍCULO PRINCIPAL */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Detalhes do Veículo</h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca/Modelo</label>
                        <input type="text" placeholder="Ex: FORD KA SE" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm uppercase focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                        <input type="text" placeholder="24/25" value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm text-center"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                        <input type="text" placeholder="Prata" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm"/>
                    </div>
                    
                    {/* CAMPO NOVO: COMBUSTÍVEL */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Combustível</label>
                        <select 
                            value={formData.combustivel} 
                            onChange={e => setFormData({...formData, combustivel: e.target.value})} 
                            className="w-full border-gray-300 border p-2 rounded-lg text-sm bg-white"
                        >
                            <option>Flex</option>
                            <option>Gasolina</option>
                            <option>Etanol</option>
                            <option>Diesel</option>
                            <option>Híbrido</option>
                            <option>Elétrico</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                        <input type="text" placeholder="ABC-1234" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} className="w-full border-yellow-200 bg-yellow-50 border p-2 rounded-lg text-sm uppercase font-mono text-center font-bold text-gray-800"/>
                    </div>
                </div>
              </div>

              {/* SEÇÃO 4: DOCUMENTAÇÃO E DETALHES */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Documentação & Infos</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Renavam</label>
                        <input type="text" value={formData.renavam} onChange={e => setFormData({...formData, renavam: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chassi</label>
                        <input type="text" value={formData.chassi} onChange={e => setFormData({...formData, chassi: e.target.value})} className="w-full border-gray-300 border p-2 rounded-lg text-sm"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">DUT / ATPV</label>
                        <input type="text" className="w-full border-gray-300 border p-2 rounded-lg text-sm"/>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opcionais</label>
                        <textarea value={formData.opcionais} onChange={e => setFormData({...formData, opcionais: e.target.value})} className="w-full border-gray-300 border p-3 rounded-lg text-sm h-24 resize-none focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none" placeholder="Ar, Trava, Vidro, Multimídia..."></textarea>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações Internas</label>
                        <textarea value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="w-full border-gray-300 border p-3 rounded-lg text-sm h-24 resize-none focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] outline-none" placeholder="Detalhes de mecânica, riscos, pendências..."></textarea>
                     </div>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave(formData)} 
            className="px-6 py-2.5 rounded-lg bg-[#D80000] text-white hover:bg-red-700 font-bold flex items-center gap-2 shadow-md transition-colors"
          >
             <Save size={18}/> {mode === 'edit' ? 'Salvar Alterações' : 'Incluir Veículo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
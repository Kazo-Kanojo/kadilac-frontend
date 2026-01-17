/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { X, Camera, Save, Trash2, Fuel, User, Briefcase } from 'lucide-react';

const VehicleModal = ({ isOpen, onClose, onSave, initialData, mode }) => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    modelo: '', placa: '', ano: '', cor: '', valor: '', custo: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    operacao: 'Compra',
    renavam: '', chassi: '', opcionais: '', observacoes: '',
    status: 'Em estoque',
    foto: '',
    // NOVOS CAMPOS ADICIONADOS
    combustivel: 'Flex', 
    proprietario: '', 
    vendedor: ''
  });

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData && mode === 'edit') {
        const formattedDate = initialData.data_entrada 
          ? new Date(initialData.data_entrada).toISOString().split('T')[0]
          : initialData.dataEntrada 
            ? new Date(initialData.dataEntrada).toISOString().split('T')[0]
            : '';

        setFormData({
          ...initialData,
          dataEntrada: formattedDate,
          foto: initialData.foto || '',
          // Garante que os campos existam mesmo se o banco vier vazio
          combustivel: initialData.combustivel || 'Flex',
          proprietario: initialData.proprietario_anterior || '', // backend usa proprietario_anterior
          vendedor: initialData.vendedor || ''
        });
        
        setPhotoPreview(initialData.foto || null);
      } else {
        // Reset para Novo Cadastro
        setFormData({
            modelo: '', placa: '', ano: '', cor: '', valor: '', custo: '',
            dataEntrada: new Date().toISOString().split('T')[0],
            operacao: 'Compra',
            renavam: '', chassi: '', opcionais: '', observacoes: '',
            status: 'Em estoque',
            foto: '',
            combustivel: 'Flex',
            proprietario: '',
            vendedor: ''
        });
        setPhotoPreview(null);
      }
    }
  }, [initialData, mode, isOpen]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setFormData(prev => ({ ...prev, foto: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#D80000] text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {mode === 'edit' ? 'Alterar Ficha do Veículo' : 'Nova Ficha de Veículo'}
          </h2>
          <button onClick={onClose} className="hover:bg-red-800 p-1 rounded transition-colors"><X size={24}/></button>
        </div>

        {/* Corpo do Formulário */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 custom-scrollbar">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* COLUNA ESQUERDA: FOTO */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoSelect} />

              <div 
                onClick={handlePhotoClick}
                className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-[#D80000] hover:bg-red-50 transition-all group relative overflow-hidden"
              >
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold flex items-center gap-2"><Camera size={20}/> Alterar Foto</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={48} className="text-gray-300 group-hover:text-[#D80000] mb-2 transition-colors" />
                    <p className="text-sm text-gray-500 text-center px-4 font-medium group-hover:text-red-700 transition-colors">
                        Clique para adicionar foto
                    </p>
                  </>
                )}
              </div>
              
              {photoPreview && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); setFormData(prev => ({...prev, foto: ''})) }}
                  className="text-red-600 text-sm flex items-center justify-center gap-2 hover:underline"
                >
                  <Trash2 size={14}/> Remover foto
                </button>
              )}

              <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select 
                    className={`w-full mt-1 border p-2 rounded font-bold text-sm outline-none ${
                        formData.status === 'Em estoque' ? 'bg-green-50 text-green-700 border-green-200' :
                        formData.status === 'Vendido' ? 'bg-red-50 text-red-700 border-red-200' : 
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}
                    value={formData.status || 'Em estoque'}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                      <option value="Em estoque">Em Estoque</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Manutenção">Em Manutenção</option>
                  </select>
              </div>
            </div>

            {/* COLUNA DIREITA: CAMPOS */}
            <div className="w-full md:w-2/3 space-y-4">
              
              {/* BLOCO 1: Entrada e Valores */}
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Data Entrada</label>
                    <input 
                      type="date" 
                      value={formData.dataEntrada || ''} 
                      onChange={e => setFormData({...formData, dataEntrada: e.target.value})} 
                      className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Operação</label>
                    <select className="w-full border p-2 rounded text-sm bg-white outline-none" value={formData.operacao} onChange={e => setFormData({...formData, operacao: e.target.value})}>
                        <option>Compra</option>
                        <option>Consignação</option>
                        <option>Troca</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Custo (R$)</label>
                    <input type="number" placeholder="0,00" value={formData.custo} onChange={e => setFormData({...formData, custo: e.target.value})} className="w-full border p-2 rounded text-sm border-gray-300 focus:border-[#D80000] outline-none"/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Venda (R$)</label>
                    <input type="number" placeholder="0,00" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} className="w-full border p-2 rounded text-sm border-blue-200 bg-blue-50 focus:border-blue-400 outline-none text-blue-700 font-bold"/>
                </div>
              </div>

              {/* BLOCO 2: Dados do Veículo */}
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Modelo</label>
                    <input type="text" placeholder="FORD KA SE" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full border p-2 rounded text-sm uppercase focus:border-[#D80000] outline-none"/>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Ano</label>
                    <input type="text" placeholder="24/25" value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"/>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Cor</label>
                    <input type="text" placeholder="Prata" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"/>
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                    <input type="text" placeholder="ABC-1234" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} className="w-full border p-2 rounded text-sm uppercase font-mono bg-yellow-50 focus:border-yellow-400 outline-none"/>
                </div>
                
                {/* --- CAMPO NOVO: COMBUSTÍVEL --- */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Fuel size={14}/> Combustível</label>
                    <select 
                        className="w-full border p-2 rounded text-sm bg-white outline-none focus:border-[#D80000]" 
                        value={formData.combustivel} 
                        onChange={e => setFormData({...formData, combustivel: e.target.value})}
                    >
                        <option>Flex</option>
                        <option>Gasolina</option>
                        <option>Etanol</option>
                        <option>Diesel</option>
                        <option>Híbrido</option>
                        <option>Elétrico</option>
                    </select>
                </div>
                <div className="md:col-span-8"></div> {/* Espaçamento */}
              </div>

              {/* BLOCO 3: Origem e Documentação (NOVOS CAMPOS AQUI) */}
              <div className="bg-white p-4 rounded shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                 {/* Proprietário Anterior */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><User size={14}/> Proprietário Anterior</label>
                    <input 
                        type="text" 
                        placeholder="Nome do antigo dono"
                        value={formData.proprietario} 
                        onChange={e => setFormData({...formData, proprietario: e.target.value})} 
                        className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"
                    />
                 </div>
                 {/* Vendedor */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Briefcase size={14}/> Vendedor (Loja)</label>
                    <input 
                        type="text" 
                        placeholder="Quem atendeu"
                        value={formData.vendedor} 
                        onChange={e => setFormData({...formData, vendedor: e.target.value})} 
                        className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Renavam</label>
                    <input type="text" value={formData.renavam} onChange={e => setFormData({...formData, renavam: e.target.value})} className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"/>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Chassi</label>
                    <input type="text" value={formData.chassi} onChange={e => setFormData({...formData, chassi: e.target.value})} className="w-full border p-2 rounded text-sm focus:border-[#D80000] outline-none"/>
                 </div>
              </div>

              {/* BLOCO 4: Opcionais e Observações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Opcionais</label>
                    <textarea value={formData.opcionais} onChange={e => setFormData({...formData, opcionais: e.target.value})} className="w-full border p-2 rounded text-sm h-20 resize-none focus:border-[#D80000] outline-none" placeholder="Ar, Trava, Vidro..."></textarea>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Observações Internas</label>
                    <textarea value={formData.observacoes} onChange={e => setFormData({...formData, observacoes: e.target.value})} className="w-full border p-2 rounded text-sm h-20 resize-none focus:border-[#D80000] outline-none" placeholder="Detalhes de mecânica, riscos..."></textarea>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t rounded-b-lg flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold transition-colors">Cancelar</button>
          <button onClick={() => onSave(formData)} className="px-6 py-2 rounded bg-[#D80000] text-white hover:bg-red-700 font-bold flex items-center gap-2 shadow-lg transition-colors">
             <Save size={18}/> {mode === 'edit' ? 'Salvar Alterações' : 'Incluir Veículo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
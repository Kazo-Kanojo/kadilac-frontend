import { useState, useEffect, useRef } from 'react';
import { X, Save, Upload } from 'lucide-react';

const VehicleModal = ({ isOpen, onClose, onSave, initialData, mode, clientsList = [] }) => {
  const [formData, setFormData] = useState({
    modelo: '',
    placa: '',
    ano: '',
    cor: '',
    combustivel: 'Flex',
    valor: '',
    custo: '',
    dataEntrada: '',
    operacao: 'Compra',
    proprietario: '',
    vendedor: '',
    renavam: '',
    chassi: '',
    certificado: '', // NOVO CAMPO
    opcionais: '',
    observacoes: '',
    status: 'Em estoque',
    foto: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        ...initialData,
        dataEntrada: initialData.data_entrada ? initialData.data_entrada.split('T')[0] : '',
        proprietario: initialData.proprietario_anterior || '',
        certificado: initialData.certificado || '', // Carregar certificado se existir
        custo: initialData.custo || ''
      });
    } else {
      // Reset para criar novo
      setFormData({
        modelo: '', placa: '', ano: '', cor: '', combustivel: 'Flex',
        valor: '', custo: '', dataEntrada: new Date().toISOString().split('T')[0],
        operacao: 'Compra', proprietario: '', vendedor: '',
        renavam: '', chassi: '', certificado: '',
        opcionais: '', observacoes: '', status: 'Em estoque', foto: ''
      });
    }
  }, [initialData, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'create' ? 'Cadastrar Novo Veículo' : 'Editar Veículo'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          
          {/* Seção 1: Dados Básicos e Foto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Upload de Foto */}
            <div className="col-span-1">
              <div 
                className="aspect-video w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-gray-50 overflow-hidden relative group"
                onClick={() => fileInputRef.current.click()}
              >
                {formData.foto ? (
                  <>
                    <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2"><Upload size={20}/> Trocar</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Clique para adicionar foto</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange} 
                />
              </div>
            </div>

            {/* Inputs Principais */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Modelo do Veículo</label>
                <input required name="modelo" value={formData.modelo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Hyundai HB20 1.0" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Placa</label>
                <input required name="placa" value={formData.placa} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded uppercase focus:ring-2 focus:ring-blue-500 outline-none" placeholder="ABC-1234" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Cor</label>
                <input required name="cor" value={formData.cor} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Ano/Mod</label>
                <input name="ano" value={formData.ano} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="2023/2024" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Combustível</label>
                <select name="combustivel" value={formData.combustivel} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Flex</option>
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Diesel</option>
                  <option>Elétrico</option>
                  <option>Híbrido</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          {/* Seção 2: Documentação e Origem */}
          <h3 className="text-sm font-bold text-blue-800 mb-4 bg-blue-50 p-2 rounded w-fit px-4">Documentação & Origem</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            
            {/* PROPRIETÁRIO COM BUSCA NO BANCO */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Proprietário Anterior (Cliente)</label>
              <input 
                list="clientes-list" 
                name="proprietario" 
                value={formData.proprietario} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Selecione da lista ou digite..." 
              />
              <datalist id="clientes-list">
                {clientsList.map(cli => (
                  <option key={cli.id} value={cli.nome}>{cli.cpf_cnpj}</option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Data Entrada</label>
              <input type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Renavam</label>
              <input name="renavam" value={formData.renavam} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Chassi</label>
              <input name="chassi" value={formData.chassi} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            {/* CAMPO NOVO: CERTIFICADO */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase text-blue-600">Certificado (CRV/ATPV)</label>
              <input 
                name="certificado" 
                value={formData.certificado} 
                onChange={handleChange} 
                className="w-full p-2 border border-blue-200 bg-blue-50 rounded focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                placeholder="Nº do Certificado"
              />
            </div>
          </div>

          <hr className="my-6 border-gray-100" />

          {/* Seção 3: Financeiro */}
          <h3 className="text-sm font-bold text-green-800 mb-4 bg-green-50 p-2 rounded w-fit px-4">Financeiro</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Valor de Custo (R$)</label>
              <input type="number" step="0.01" name="custo" value={formData.custo} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Previsão de Venda (R$)</label>
              <input required type="number" step="0.01" name="valor" value={formData.valor} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>

            <div className="col-span-2">
               <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Operação de Entrada</label>
               <select name="operacao" value={formData.operacao} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded bg-white outline-none">
                 <option>Compra</option>
                 <option>Troca</option>
                 <option>Consignação</option>
               </select>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Observações Gerais</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows="3" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Detalhes sobre o estado do carro, manutenções necessárias, etc."></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
              <Save size={18} /> Salvar Veículo
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default VehicleModal;
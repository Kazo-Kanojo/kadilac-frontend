import { useState, useEffect } from 'react';
import { X, Save, Upload, Plus, Search, Tag, User, Check, RefreshCw, Car, Briefcase } from 'lucide-react';
import api from '../api';
import ClientModal from './ClientModal';

// --- COMPONENTE DE BUSCA SIMPLES ---
const SimpleSearch = ({ label, placeholder, value, onSelect, type, dataList }) => {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    const handleSearch = async (txt) => {
        setQuery(txt);
        if(type !== 'option' && type !== 'vehicle') onSelect(txt); 

        if (txt.length < 1) {
            setResults([]);
            return;
        }

        if (type === 'client') {
            const filtered = dataList.filter(c => c.nome.toLowerCase().includes(txt.toLowerCase()));
            setResults(filtered);
            setShowResults(true);
        } 
        else if (type === 'vehicle') {
            const filtered = dataList.filter(v => 
                v.modelo.toLowerCase().includes(txt.toLowerCase()) || 
                (v.placa && v.placa.toLowerCase().includes(txt.toLowerCase()))
            );
            setResults(filtered);
            setShowResults(true);
        }
        else if (type === 'option') {
            try {
                const res = await api.get(`/options?q=${txt}`);
                setResults(res.data);
                setShowResults(true);
            } catch (error) {
                console.error("Erro ao buscar opcionais");
            }
        }
    };

    return (
        <div className="relative w-full">
            {label && <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>}
            <div className="relative">
                <input
                    type="text"
                    className="w-full p-2 pl-8 border rounded-lg focus:border-indigo-500 outline-none text-sm"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => query && setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)} 
                />
                <Search size={14} className="absolute left-2.5 top-3 text-gray-400" />
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-40 w-full bg-white border rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {results.map((item, idx) => (
                        <div 
                            key={idx}
                            className="p-2 hover:bg-indigo-50 cursor-pointer text-sm flex justify-between items-center border-b last:border-0"
                            onClick={() => {
                                if(type === 'option') {
                                    onSelect(item);
                                    setQuery(''); 
                                } 
                                else if (type === 'vehicle') {
                                    onSelect(item); 
                                    setQuery(`${item.modelo} - ${item.placa}`);
                                }
                                else {
                                    onSelect(item.nome); 
                                    setQuery(item.nome);
                                }
                                setShowResults(false);
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-700">{item.nome || item.name || item.modelo}</span>
                                {type === 'vehicle' && <span className="text-[10px] text-gray-400">{item.placa} • {item.cor}</span>}
                            </div>
                            {item.code && <span className="text-xs bg-gray-200 px-1 rounded">{item.code}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const VehicleModal = ({ vehicle, onClose, onSuccess, clients, vehiclesList }) => {
  const [loading, setLoading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(vehicle?.foto || null);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalTarget, setClientModalTarget] = useState(''); 

  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [newOptionCode, setNewOptionCode] = useState('');
  const [newOptionName, setNewOptionName] = useState('');

  const [formData, setFormData] = useState({
    modelo: vehicle?.modelo || '',
    placa: vehicle?.placa || '',
    ano: vehicle?.ano || '',
    cor: vehicle?.cor || '',
    combustivel: vehicle?.combustivel || '',
    valor: vehicle?.valor || '',
    custo: vehicle?.custo || '',
    renavam: vehicle?.renavam || '',
    chassi: vehicle?.chassi || '',
    status: vehicle?.status || 'Disponível',
    observacoes: vehicle?.descricao || '', 
    dataEntrada: vehicle?.data_entrada ? vehicle.data_entrada.split('T')[0] : '',
    proprietario: vehicle?.proprietario_anterior || '',
    vendedor_origem: vehicle?.vendedor_origem || '', 
    certificado: vehicle?.certificado || '',
    operacao: vehicle?.operacao || 'Compra', // Default
    veiculo_troca_id: vehicle?.veiculo_troca_id || '', 
    foto: vehicle?.foto || ''
  });

  const [trocaDisplay, setTrocaDisplay] = useState('');

  useEffect(() => {
      if (vehicle?.veiculo_troca_id && vehiclesList) {
          const v = vehiclesList.find(x => x.id === vehicle.veiculo_troca_id);
          if (v) setTrocaDisplay(`${v.modelo} - ${v.placa}`);
      }
  }, [vehicle, vehiclesList]);

  const [selectedOptions, setSelectedOptions] = useState(vehicle?.opcionais || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Imagem muito grande (Max 5MB)");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
        setFormData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOption = (option) => {
      if (!selectedOptions.find(o => o.id === option.id)) {
          setSelectedOptions([...selectedOptions, option]);
      }
  };

  const handleRemoveOption = (id) => {
      setSelectedOptions(selectedOptions.filter(o => o.id !== id));
  };

  const handleSaveNewOption = async () => {
    if(!newOptionName) return alert("Digite o nome do opcional");
    const codeToSend = newOptionCode || newOptionName.substring(0, 3).toUpperCase();
    try {
        const res = await api.post('/options', { code: codeToSend, name: newOptionName });
        handleAddOption(res.data);
        setIsCreatingOption(false);
        setNewOptionCode('');
        setNewOptionName('');
    } catch (error) {
        alert("Erro ao criar opcional.");
    }
  };

  const openNewClientModal = (targetField) => {
      setClientModalTarget(targetField);
      setIsClientModalOpen(true);
  };

  const handleClientSaved = async (clientData) => {
      try {
          const res = await api.post('/clientes', clientData);
          setFormData(prev => ({ ...prev, [clientModalTarget]: res.data.nome }));
          setIsClientModalOpen(false);
          alert("Pessoa cadastrada!");
      } catch (error) {
          alert("Erro ao cadastrar pessoa.");
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Prepara o Payload (Limpeza de Dados)
      const payload = {
          ...formData,
          // Garante que números sejam números (ou 0 se vazio)
          valor: parseFloat(formData.valor) || 0,
          custo: parseFloat(formData.custo) || 0,
          
          // Lógica da Troca: Se não for troca, zera o ID
          veiculo_troca_id: formData.operacao === 'Troca' && formData.veiculo_troca_id 
                            ? parseInt(formData.veiculo_troca_id) 
                            : null,
                            
          // Garante datas corretas ou null
          dataEntrada: formData.dataEntrada || null,
          
          // Envia opcionais
          opcionais: selectedOptions 
      };
        let response;
        if (vehicle?.id) {
            response = await api.put(`/veiculos/${vehicle.id}`, payload);
            alert("Veículo atualizado com sucesso!");
        } else {
            response = await api.post('/veiculos', payload);
            alert("Veículo cadastrado com sucesso!");
        }
      onSuccess({
            ...response.data, // Dados do carro novo (Entrada)
            isTradeIn: formData.operacao === 'Troca',
            tradeInTargetId: formData.veiculo_troca_id, // ID do carro que vai sair
            tradeInValue: parseFloat(formData.custo) // O custo do novo é o valor de entrada na venda do velho
        });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar veículo: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
            <h2 className="text-lg font-bold flex items-center gap-2">
                {vehicle?.id ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <X size={20} />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* COLUNA 1 */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className={`w-full h-48 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all ${!fotoPreview ? 'border-gray-300' : 'border-indigo-500'}`}>
                                {fotoPreview ? (
                                    <img src={fotoPreview} alt="Veículo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <Upload size={32} className="mx-auto mb-2 opacity-50"/>
                                        <span className="text-xs font-bold">Clique para adicionar foto</span>
                                    </div>
                                )}
                                <input type="file" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Placa</label>
                                <input name="placa" value={formData.placa} onChange={handleChange} className="w-full p-2 border rounded uppercase font-bold text-center" placeholder="ABC-1234" maxLength={8} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Renavam</label>
                                <input name="renavam" value={formData.renavam} onChange={handleChange} className="w-full p-2 border rounded" placeholder="00000000000" />
                            </div>
                        </div>
                    </div>

                    {/* COLUNA 2 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Modelo / Versão</label>
                            <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full p-2 border rounded font-medium" placeholder="Ex: Honda Civic LXL 1.8" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Ano</label><input name="ano" value={formData.ano} onChange={handleChange} className="w-full p-2 border rounded" placeholder="2020/2021" /></div>
                            <div><label className="block text-xs font-bold text-gray-500 mb-1">Cor</label><input name="cor" value={formData.cor} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Prata" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Combustível</label>
                                <select name="combustivel" value={formData.combustivel} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                                    <option value="">Selecione</option>
                                    <option value="Flex">Flex</option>
                                    <option value="Gasolina">Gasolina</option>
                                    <option value="Etanol">Etanol</option>
                                    <option value="Diesel">Diesel</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded bg-white font-bold text-indigo-600">
                                    <option value="Disponível">Disponível</option>
                                    <option value="Reservado">Reservado</option>
                                    <option value="Vendido">Vendido</option>
                                    <option value="Manutenção">Manutenção</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-green-50 p-3 rounded-lg border border-green-100">
                            <div><label className="block text-xs font-bold text-green-700 mb-1">Preço Custo</label><input name="custo" type="number" value={formData.custo} onChange={handleChange} className="w-full p-2 border rounded border-green-200" placeholder="0.00" /></div>
                            <div><label className="block text-xs font-bold text-green-700 mb-1">Preço Venda</label><input name="valor" type="number" value={formData.valor} onChange={handleChange} className="w-full p-2 border rounded border-green-200 font-bold" placeholder="0.00" /></div>
                        </div>
                    </div>

                    {/* COLUNA 3: ORIGEM & OPERAÇÃO */}
                    <div className="space-y-4 bg-gray-100 p-4 rounded-xl">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <User size={12}/> Dados de Entrada
                        </h3>

                        {/* TIPO DE OPERAÇÃO */}
                        <div className="bg-white p-2 rounded border border-gray-200">
                             <label className="block text-xs font-bold text-gray-500 mb-1">Tipo de Operação</label>
                             <div className="flex flex-col gap-2">
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" name="operacao" value="Compra" checked={formData.operacao === 'Compra'} onChange={handleChange}/>
                                        <span className="text-sm">Compra</span>
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input type="radio" name="operacao" value="Troca" checked={formData.operacao === 'Troca'} onChange={handleChange}/>
                                        <span className="text-sm font-bold text-blue-600">Troca</span>
                                    </label>
                                </div>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="operacao" value="Consignação" checked={formData.operacao === 'Consignação'} onChange={handleChange}/>
                                    <span className="text-sm font-bold text-purple-600 flex items-center gap-1">
                                        <Briefcase size={12}/> Consignação
                                    </span>
                                </label>
                             </div>
                        </div>

                        {/* SE FOR TROCA, MOSTRA BUSCA DE VEÍCULO */}
                        {formData.operacao === 'Troca' && (
                            <div className="bg-blue-50 p-2 rounded border border-blue-200 animate-fadeIn">
                                <SimpleSearch 
                                    label="Qual Veículo Saiu?" 
                                    placeholder="Buscar carro da loja..." 
                                    type="vehicle"
                                    dataList={vehiclesList} 
                                    value={trocaDisplay}
                                    onSelect={(v) => {
                                        setFormData(prev => ({...prev, veiculo_troca_id: v.id}));
                                        setTrocaDisplay(`${v.modelo} - ${v.placa}`);
                                    }}
                                />
                                <p className="text-[10px] text-blue-500 mt-1 flex items-center gap-1">
                                    <RefreshCw size={10}/> Veículo que entrou como pagamento.
                                </p>
                            </div>
                        )}
                        
                        {/* Proprietário e Vendedor */}
                        <div className="flex items-end gap-2">
                            <div className="flex-1"><SimpleSearch label="Proprietário Anterior" placeholder="Buscar pessoa..." type="client" dataList={clients} value={formData.proprietario} onSelect={(name) => setFormData(prev => ({...prev, proprietario: name}))}/></div>
                            <button type="button" onClick={() => openNewClientModal('proprietario')} className="p-2 mb-[1px] rounded-lg border bg-white border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors h-[38px] w-[38px] flex items-center justify-center"><Plus size={18}/></button>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1"><SimpleSearch label="Quem Vendeu" placeholder="Buscar vendedor..." type="client" dataList={clients} value={formData.vendedor_origem} onSelect={(name) => setFormData(prev => ({...prev, vendedor_origem: name}))}/></div>
                            <button type="button" onClick={() => openNewClientModal('vendedor_origem')} className="p-2 mb-[1px] rounded-lg border bg-white border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors h-[38px] w-[38px] flex items-center justify-center"><Plus size={18}/></button>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Data de Entrada</label>
                            <input type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
                        </div>
                    </div>
                </div>
                
                {/* SEÇÃO OPCIONAIS */}
                <div className="mt-8 border-t pt-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Tag size={18} className="text-indigo-500"/> Opcionais & Acessórios
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="flex items-end gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Adicionar Opcional</label>
                                    <SimpleSearch placeholder="Buscar existente..." type="option" dataList={[]} value="" onSelect={handleAddOption}/>
                                </div>
                                <button type="button" onClick={() => setIsCreatingOption(!isCreatingOption)} className={`p-2 rounded-lg border transition-colors h-[38px] w-[38px] flex items-center justify-center ${isCreatingOption ? 'bg-red-50 border-red-200 text-red-500' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}`}><Plus size={18}/></button>
                            </div>
                            {isCreatingOption && (
                                <div className="bg-white border border-indigo-100 p-3 rounded-lg shadow-sm animate-fade-in flex gap-2 items-end">
                                    <div className="w-20"><label className="text-[10px] font-bold text-gray-400">Cód</label><input className="w-full p-1 border rounded text-xs uppercase" placeholder="BC" value={newOptionCode} onChange={e => setNewOptionCode(e.target.value.toUpperCase())} maxLength={4}/></div>
                                    <div className="flex-1"><label className="text-[10px] font-bold text-gray-400">Nome</label><input className="w-full p-1 border rounded text-xs" placeholder="Banco Couro" value={newOptionName} onChange={e => setNewOptionName(e.target.value)}/></div>
                                    <button type="button" onClick={handleSaveNewOption} className="bg-green-500 text-white p-1.5 rounded hover:bg-green-600 transition-colors"><Check size={16}/></button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 bg-white border rounded-xl p-4 min-h-[80px] flex content-start flex-wrap gap-2">
                            {selectedOptions.length === 0 && <span className="text-gray-300 text-sm italic w-full text-center py-2">Nenhum opcional selecionado.</span>}
                            {selectedOptions.map((opt, idx) => (
                                <div key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 group animate-fade-in">
                                    <span className="uppercase bg-white px-1.5 py-0.5 rounded text-[10px] border border-indigo-100">{opt.code}</span>
                                    {opt.name}
                                    <button type="button" onClick={() => handleRemoveOption(opt.id)} className="text-indigo-300 hover:text-red-500 transition-colors"><X size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Observações Gerais</label>
                    <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} rows="2" className="w-full p-3 border rounded-lg text-sm" placeholder="Detalhes extras sobre o estado do carro..."></textarea>
                </div>

            </form>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                <button onClick={onClose} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancelar</button>
                <button onClick={handleSubmit} disabled={loading} className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">{loading ? 'Salvando...' : <><Save size={18}/> Salvar Veículo</>}</button>
            </div>
        </div>
        </div>
        
        <ClientModal 
            isOpen={isClientModalOpen}
            onClose={() => setIsClientModalOpen(false)}
            onSave={handleClientSaved}
            initialData={null} 
        />
    </>
  );
};

export default VehicleModal;
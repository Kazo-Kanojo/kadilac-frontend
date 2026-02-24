import { useState, useEffect, useRef } from 'react';
import { X, Search, Car, DollarSign, Tag, Calendar, ChevronDown, Loader2, CheckCircle } from 'lucide-react';

// --- COMPONENTE: Select Inteligente Robusto ---
const SearchableSelect = ({ options, value, onChange, disabled, placeholder, icon: Icon, loading }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = options.find(o => String(o.codigo) === String(value));
    const displayValue = isOpen ? search : (selected ? selected.nome : '');
    const filtered = options.filter(o => o.nome.toLowerCase().includes(search.toLowerCase()));

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative flex items-center">
                {Icon && <Icon size={18} className="absolute left-3 text-gray-400 z-10" />}
                <input
                    type="text"
                    disabled={disabled || loading}
                    placeholder={loading ? "A carregar..." : placeholder}
                    value={displayValue}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setIsOpen(true);
                        if (value) onChange(''); 
                    }}
                    onClick={() => {
                        setSearch('');
                        setIsOpen(true);
                    }}
                    className={`w-full p-3 ${Icon ? 'pl-10' : 'pl-3'} pr-10 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400`}
                />
                <div className="absolute right-3 text-gray-400 pointer-events-none flex items-center">
                    {loading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
                </div>
            </div>

            {isOpen && !disabled && !loading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-xl rounded-lg max-h-60 overflow-y-auto py-1">
                    {filtered.length > 0 ? (
                        filtered.map(opt => (
                            <div
                                key={opt.codigo}
                                onClick={() => {
                                    onChange(opt.codigo);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${String(value) === String(opt.codigo) ? 'bg-blue-100 text-blue-800 font-bold border-l-2 border-blue-500' : 'text-gray-700'}`}
                            >
                                {opt.nome}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-4 text-sm text-gray-400 text-center italic">Nenhum resultado</div>
                    )}
                </div>
            )}
        </div>
    );
};

const ConsultaFipeModal = ({ isOpen, onClose, onSelectValue }) => {
  const [tipo, setTipo] = useState('carros');
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedAno, setSelectedAno] = useState('');
  
  const [fipeData, setFipeData] = useState(null);
  
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingValor, setLoadingValor] = useState(false);

  useEffect(() => {
    if (isOpen) fetchMarcas(tipo);
  }, [isOpen, tipo]);

  const resetDownstream = (level) => {
      if (level <= 1) { setSelectedMarca(''); setModelos([]); }
      if (level <= 2) { setSelectedModelo(''); setAnos([]); }
      if (level <= 3) { setSelectedAno(''); setFipeData(null); }
  };

  const fetchMarcas = async (tipoVeiculo) => {
    setLoadingMarcas(true);
    resetDownstream(1);
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${tipoVeiculo}/marcas`);
      setMarcas(await res.json());
    } catch (error) { console.error(error); } 
    finally { setLoadingMarcas(false); }
  };

  const fetchModelos = async (marcaId) => {
    setSelectedMarca(marcaId);
    resetDownstream(2);
    if (!marcaId) return;
    setLoadingModelos(true);
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${marcaId}/modelos`);
      const data = await res.json();
      setModelos(data.modelos); 
    } catch (error) { console.error(error); } 
    finally { setLoadingModelos(false); }
  };

  const fetchAnos = async (modeloId) => {
    setSelectedModelo(modeloId);
    resetDownstream(3);
    if (!modeloId) return;
    setLoadingAnos(true);
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${selectedMarca}/modelos/${modeloId}/anos`);
      setAnos(await res.json());
    } catch (error) { console.error(error); } 
    finally { setLoadingAnos(false); }
  };

  const fetchValor = async (anoId) => {
    setSelectedAno(anoId);
    setFipeData(null);
    if (!anoId) return;
    setLoadingValor(true);
    try {
      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/${tipo}/marcas/${selectedMarca}/modelos/${selectedModelo}/anos/${anoId}`);
      setFipeData(await res.json());
    } catch (error) { console.error(error); } 
    finally { setLoadingValor(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-visible flex flex-col">
        
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search size={20} /> Consulta Tabela FIPE
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="bg-gray-50 p-4 border-b flex justify-center gap-2">
            {['carros', 'motos', 'caminhoes'].map((t) => (
                <button 
                    key={t} onClick={() => { setTipo(t); fetchMarcas(t); }}
                    className={`px-5 py-2 rounded-lg text-sm font-bold uppercase transition-all ${tipo === t ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border hover:bg-gray-100 hover:text-blue-500'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        <div className="p-6 space-y-5 flex-1 bg-white rounded-b-xl overflow-visible">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">1. Marca</label>
                    <SearchableSelect options={marcas} value={selectedMarca} onChange={fetchModelos} disabled={marcas.length===0} loading={loadingMarcas} placeholder="Buscar Marca..." icon={Tag}/>
                </div>
                {selectedMarca && (
                    <div className="animate-slide-up">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">2. Modelo</label>
                        <SearchableSelect options={modelos} value={selectedModelo} onChange={fetchAnos} disabled={modelos.length===0 && !loadingModelos} loading={loadingModelos} placeholder="Buscar Modelo..." icon={Car}/>
                    </div>
                )}
                {selectedModelo && (
                    <div className="animate-slide-up">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-1">3. Ano</label>
                        <SearchableSelect options={anos} value={selectedAno} onChange={fetchValor} disabled={anos.length===0 && !loadingAnos} loading={loadingAnos} placeholder="Buscar Ano..." icon={Calendar}/>
                    </div>
                )}
            </div>

            {loadingValor && (
                <div className="flex flex-col items-center justify-center text-blue-500 py-6 animate-pulse">
                    <Loader2 size={32} className="animate-spin mb-2"/>
                    <span className="text-sm font-bold">A consultar a base de dados...</span>
                </div>
            )}

            {fipeData && !loadingValor && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 animate-slide-up relative overflow-hidden shadow-sm">
                    <p className="text-xs text-green-700 font-bold uppercase mb-1 flex items-center gap-1"><DollarSign size={14}/> Valor de Mercado</p>
                    <h3 className="text-3xl font-black text-green-700 tracking-tight mb-4">{fipeData.Valor}</h3>
                    <div className="space-y-1 text-sm text-green-800 bg-white/50 p-3 rounded-lg border border-green-100 mb-4">
                        <p><strong className="text-green-900">Veículo:</strong> {fipeData.Modelo}</p>
                        <p><strong className="text-green-900">Ano:</strong> {fipeData.AnoModelo} - {fipeData.Combustivel}</p>
                    </div>

                    {/* Botão de Integração com o Formulário */}
                    {onSelectValue && (
                        <button 
                            onClick={() => onSelectValue(fipeData.Valor, fipeData.Modelo)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18}/> Usar este Preço no Registo
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ConsultaFipeModal;
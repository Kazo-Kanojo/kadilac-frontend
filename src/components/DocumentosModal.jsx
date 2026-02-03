import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, FileText, Download, Eye, Paperclip, Printer, Plus } from 'lucide-react';
import api from '../api';

const DocumentosModal = ({ vehicle, onClose, storeConfig, clients }) => {
  const [docs, setDocs] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [arquivo, setArquivo] = useState(null); // Base64
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await api.get(`/veiculos/${vehicle.id}/documentos`);
      setDocs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erro ao carregar documentos:", error);
    }
  };

  // --- LÓGICA DE IMPRESSÃO (RECIBOS AUTOMÁTICOS) ---
  const handlePrintSystemDoc = (docType) => {
    if (!storeConfig) return alert("Erro: Configurações da loja não carregadas.");

    let targetClientName = '';
    let price = 0;
    let templateFile = '';
    let obs = '';

    // Define os dados baseados no tipo de recibo
    if (docType === 'venda') {
        if (vehicle.status !== 'Vendido') return alert("Este veículo ainda não foi vendido.");
        targetClientName = vehicle.cliente_nome; // Nome salvo no veículo na hora da venda
        price = vehicle.valor; // Preço de Venda
        templateFile = 'Recibo_de_Venda.html';
        obs = `Venda referente ao veículo ${vehicle.modelo}.`;

    } else if (docType === 'compra') {
        targetClientName = vehicle.proprietario_anterior; // De quem a loja comprou
        price = vehicle.custo; // Preço de Custo
        templateFile = 'Compra.html';
        obs = `Aquisição de veículo para estoque.`;

    } else if (docType === 'termo') {
        // Usa o cliente atual (se vendido) ou o proprietário anterior
        targetClientName = vehicle.cliente_nome || vehicle.proprietario_anterior;
        templateFile = 'Termo.html'; 
        obs = `Termo de responsabilidade.`;
    }

    // Tenta achar os dados completos do cliente (CPF, Endereço) na lista
    const clientData = clients?.find(c => c.nome?.trim().toLowerCase() === targetClientName?.trim().toLowerCase()) 
                       || { nome: targetClientName || 'Cliente não identificado' };

    // Monta o objeto para o localStorage (que o HTML vai ler)
    const printData = {
        store: storeConfig,
        client: clientData,
        vehicle: {
            ...vehicle,
            marca: vehicle.marca || ''
        },
        sale: {
            price: price,
            seller: storeConfig.nome_loja,
            obs: obs
        },
        date: new Date().toLocaleDateString('pt-BR')
    };

    localStorage.setItem('sistema_print_data', JSON.stringify(printData));
    
    // Abre o template em nova aba
    window.open(`/templates/pages/${templateFile}`, '_blank');
  };
  // ------------------------------------------------

  // --- LÓGICA DE UPLOAD E ARQUIVOS DIGITAIS ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("O arquivo é muito grande! Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setArquivo({
            base64: reader.result,
            name: file.name,
            type: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!titulo || !arquivo) return alert("Preencha o título e escolha um arquivo.");

    setLoading(true);
    try {
      await api.post(`/veiculos/${vehicle.id}/documentos`, { 
        titulo: titulo,
        arquivo: arquivo.base64,
        tipo: arquivo.type
      });
      setTitulo('');
      setArquivo(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      loadDocs(); 
      alert("Documento arquivado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar documento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Tem certeza que deseja apagar este documento?")) return;
    try {
      await api.delete(`/documentos/${id}`);
      loadDocs();
    } catch (error) {
      alert("Erro ao remover documento.");
    }
  };

  const handleOpenDoc = (doc) => {
    const win = window.open();
    win.document.write(
        `<iframe src="${doc.arquivo}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Paperclip size={20} className="text-indigo-300" />
              Gestão de Documentos
            </h2>
            <p className="text-xs text-indigo-200 mt-1">{vehicle.modelo} - {vehicle.placa}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar p-6">
            
            {/* SEÇÃO 1: EMISSÃO DE DOCUMENTOS (SISTEMA) */}
            <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                    <Printer size={14}/> Emitir Recibos & Contratos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Botão Recibo Compra */}
                    <button 
                        onClick={() => handlePrintSystemDoc('compra')} 
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all group text-left"
                    >
                        <div>
                            <span className="font-bold text-gray-700 block">Recibo de Compra</span>
                            <span className="text-xs text-gray-400">Entrada do Veículo</span>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Printer size={20} />
                        </div>
                    </button>

                    {/* Botão Recibo Venda */}
                    <button 
                        onClick={() => handlePrintSystemDoc('venda')} 
                        disabled={vehicle.status !== 'Vendido'}
                        className={`flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all group text-left ${vehicle.status === 'Vendido' ? 'bg-white border-green-200 hover:border-green-400 hover:shadow-md cursor-pointer' : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'}`}
                    >
                        <div>
                            <span className={`font-bold block ${vehicle.status === 'Vendido' ? 'text-gray-700' : 'text-gray-400'}`}>Recibo de Venda</span>
                            <span className="text-xs text-gray-400">Saída do Veículo</span>
                        </div>
                        <div className={`p-2 rounded-full transition-colors ${vehicle.status === 'Vendido' ? 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white' : 'bg-gray-200 text-gray-400'}`}>
                            <Printer size={20} />
                        </div>
                    </button>

                    {/* Botão Termo */}
                    <button 
                        onClick={() => handlePrintSystemDoc('termo')} 
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-purple-400 hover:shadow-md transition-all group text-left"
                    >
                        <div>
                            <span className="font-bold text-gray-700 block">Termo / Ficha</span>
                            <span className="text-xs text-gray-400">Dados Cadastrais</span>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <FileText size={20} />
                        </div>
                    </button>
                </div>
            </div>

            {/* SEÇÃO 2: ARQUIVOS DIGITAIS (UPLOADS) */}
            <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                    <Paperclip size={14}/> Arquivos Digitais Anexados
                </h3>

                {docs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <FileText size={32} className="mb-2 text-gray-300" />
                        <p className="text-sm text-gray-400">Nenhum arquivo anexado (Fotos, PDFs, DUT...)</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {docs.map(doc => (
                            <div key={doc.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`p-2 rounded-lg shrink-0 ${doc.tipo && doc.tipo.includes('pdf') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="truncate">
                                        <p className="font-bold text-gray-700 truncate text-sm" title={doc.titulo}>{doc.titulo}</p>
                                        <p className="text-[10px] text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => handleOpenDoc(doc)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Visualizar"><Eye size={16} /></button>
                                    <a href={doc.arquivo} download={doc.titulo} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Baixar"><Download size={16} /></a>
                                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Formulário de Upload (Footer) */}
        <form onSubmit={handleUpload} className="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10 shrink-0">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                <Upload size={12}/> Adicionar Novo Arquivo
            </h3>
            
            <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <input 
                        type="text" 
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none transition-colors text-sm"
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                        placeholder="Nome do arquivo (Ex: DUT Frente e Verso...)"
                    />
                </div>
                
                <div className="w-full md:w-auto flex gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="application/pdf,image/*" />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition-colors truncate max-w-[200px]
                            ${arquivo ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                    >
                        {arquivo ? <span className="truncate">{arquivo.name}</span> : <> <Paperclip size={16}/> Escolher </>}
                    </button>

                    <button 
                        type="submit" 
                        disabled={loading || !arquivo}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all text-sm"
                    >
                        {loading ? '...' : <><Plus size={16}/> Salvar</>}
                    </button>
                </div>
            </div>
        </form>

      </div>
    </div>
  );
};

export default DocumentosModal;
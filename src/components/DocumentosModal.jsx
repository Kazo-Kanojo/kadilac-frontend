import { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, FileText, Download, Eye, Paperclip } from 'lucide-react';
import api from '../api';

const DocumentosModal = ({ vehicle, onClose }) => {
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validação de tamanho (5MB)
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
    if (!titulo || !arquivo) {
        alert("Preencha o título e escolha um arquivo.");
        return;
    }

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
    // Abre o Base64 em uma nova aba
    const win = window.open();
    win.document.write(
        `<iframe src="${doc.arquivo}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Paperclip size={20} className="text-indigo-300" />
            Arquivo Digital: {vehicle.modelo}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Área de Lista */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 custom-scrollbar">
            {docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                    <FileText size={48} className="mb-2 opacity-20" />
                    <p>Nenhum documento anexado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {docs.map(doc => (
                        <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg ${doc.tipo && doc.tipo.includes('pdf') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <FileText size={24} />
                                </div>
                                <div className="truncate">
                                    <p className="font-bold text-gray-700 truncate text-sm" title={doc.titulo}>{doc.titulo}</p>
                                    <p className="text-[10px] text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleOpenDoc(doc)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                    title="Visualizar"
                                >
                                    <Eye size={18} />
                                </button>
                                <a 
                                    href={doc.arquivo} 
                                    download={doc.titulo}
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Baixar"
                                >
                                    <Download size={18} />
                                </a>
                                <button 
                                    onClick={() => handleDelete(doc.id)} 
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Formulário de Upload */}
        <form onSubmit={handleUpload} className="p-5 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <Upload size={14}/> Adicionar Novo Documento
            </h3>
            
            <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <input 
                        type="text" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none transition-colors text-sm"
                        value={titulo}
                        onChange={e => setTitulo(e.target.value)}
                        placeholder="Nome do arquivo (Ex: Recibo Assinado, DUT...)"
                    />
                </div>
                
                <div className="w-full md:w-auto flex gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="application/pdf,image/*" 
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className={`flex-1 md:flex-none px-4 py-3 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition-colors truncate max-w-[200px]
                            ${arquivo ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                    >
                        {arquivo ? (
                           <span className="truncate">{arquivo.name}</span> 
                        ) : (
                           <> <Paperclip size={16}/> Escolher Arquivo </>
                        )}
                    </button>

                    <button 
                        type="submit" 
                        disabled={loading || !arquivo}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {loading ? 'Enviando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </form>

      </div>
    </div>
  );
};

export default DocumentosModal;
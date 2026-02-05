import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Wrench, ArrowUpCircle, ArrowDownCircle, Save, Edit2 } from 'lucide-react';
import api from '../api';

const DespesasModal = ({ vehicle, onClose }) => {
  const [despesas, setDespesas] = useState([]);
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar se estamos editando um item existente
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadDespesas();
    
    // Se o objeto vehicle trouxer um editExpense (clique no editar da aba), carrega no form
    if (vehicle.editExpense) {
        handlePrepareEdit(vehicle.editExpense);
    }
  }, [vehicle]);

  const loadDespesas = async () => {
    try {
      const res = await api.get(`/veiculos/${vehicle.id}/despesas`);
      setDespesas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Erro ao carregar lançamentos:", error);
    }
  };

  const handlePrepareEdit = (item) => {
      setEditingId(item.id);
      setDesc(item.descricao);
      setValor(item.valor);
      setTipo(item.tipo || 'despesa');
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setDesc('');
      setValor('');
      setTipo('despesa');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!desc || !valor) return;

    setLoading(true);
    try {
      const payload = { 
        descricao: desc, 
        valor: parseFloat(valor),
        tipo: tipo 
      };

      if (editingId) {
        // Rota de UPDATE
        await api.put(`/despesas/${editingId}`, payload);
        setEditingId(null);
      } else {
        // Rota de CREATE
        await api.post(`/veiculos/${vehicle.id}/despesas`, payload);
      }
      
      setDesc('');
      setValor('');
      loadDespesas(); 

    } catch (error) {
      alert("Erro ao processar lançamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remover este lançamento?")) return;
    try {
      await api.delete(`/despesas/${id}`);
      loadDespesas();
    } catch (error) {
      alert("Erro ao remover.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wrench size={20} className="text-orange-500" />
            Lançamentos: {vehicle.modelo}
          </h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Lista de Lançamentos */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-gray-50">
            <table className="w-full text-sm text-left bg-white rounded-lg shadow-sm">
                <thead className="bg-gray-100 text-gray-600 font-bold">
                    <tr>
                        <th className="p-3">Descrição</th>
                        <th className="p-3 text-center">Tipo</th>
                        <th className="p-3">Valor</th>
                        <th className="p-3 w-20 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {despesas.length === 0 ? (
                        <tr><td colSpan="4" className="p-6 text-center text-gray-400">Nenhum registro encontrado.</td></tr>
                    ) : (
                        despesas.map(d => (
                            <tr key={d.id} className={`hover:bg-gray-50 ${editingId === d.id ? 'bg-blue-50' : ''}`}>
                                <td className="p-3 font-medium uppercase text-gray-700">{d.descricao}</td>
                                <td className="p-3 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${d.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {d.tipo || 'despesa'}
                                    </span>
                                </td>
                                <td className={`p-3 font-bold ${d.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                    {d.tipo === 'receita' ? '+ ' : '- '}R$ {Number(d.valor).toLocaleString()}
                                </td>
                                <td className="p-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => handlePrepareEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={14}/></button>
                                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Formulário (Funciona para Criar e Editar) */}
        <form onSubmit={handleSubmit} className={`p-4 border-t flex flex-col gap-3 ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    {editingId ? <Edit2 size={12}/> : <Plus size={12}/>}
                    {editingId ? 'Editando Lançamento' : 'Novo Lançamento'}
                </h3>
                {editingId && (
                    <button onClick={handleCancelEdit} type="button" className="text-[10px] text-blue-600 font-bold hover:underline">
                        Cancelar Edição
                    </button>
                )}
            </div>

            <div className="flex gap-3">
                <div className="flex bg-gray-200 p-1 rounded-lg shrink-0">
                    <button
                        type="button"
                        onClick={() => setTipo('despesa')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${tipo === 'despesa' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        <ArrowDownCircle size={14} /> Despesa
                    </button>
                    <button
                        type="button"
                        onClick={() => setTipo('receita')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${tipo === 'receita' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        <ArrowUpCircle size={14} /> Receita
                    </button>
                </div>

                <input 
                    type="text" 
                    className="flex-1 p-2 border rounded-lg focus:border-blue-500 outline-none text-sm uppercase"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Descrição do gasto ou entrada..."
                    required
                />
                
                <input 
                    type="number" step="0.01"
                    className="w-28 p-2 border rounded-lg focus:border-blue-500 outline-none text-sm font-bold"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    placeholder="0,00"
                    required
                />

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`px-4 rounded-lg font-bold text-white flex items-center gap-2 shadow-sm transition-all ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'}`}
                >
                    {loading ? '...' : editingId ? <><Save size={16}/> Salvar</> : <><Plus size={16}/> Lançar</>}
                </button>
            </div>
        </form>

      </div>
    </div>
  );
};

export default DespesasModal;
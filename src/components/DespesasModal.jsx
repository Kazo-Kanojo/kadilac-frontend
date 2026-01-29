import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Wrench } from 'lucide-react';
import api from '../api'; // Importamos o 'api' em vez de apenas a URL

const DespesasModal = ({ vehicle, onClose }) => {
  const [despesas, setDespesas] = useState([]);
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [loading, setLoading] = useState(false);

  // Valor de Compra (Custo original cadastrado no veículo)
  const valorCompra = parseFloat(vehicle.custo || 0);

  useEffect(() => {
    loadDespesas();
  }, []);

  const loadDespesas = async () => {
    try {
      // CORREÇÃO: Usando 'api.get' o token é enviado automaticamente
      const res = await api.get(`/veiculos/${vehicle.id}/despesas`);
      
      // O axios já traz os dados em .data e garante que seja o formato esperado
      // Se vier vazio ou null, garantimos um array vazio [] para não travar o .reduce
      setDespesas(Array.isArray(res.data) ? res.data : []);
      
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
      setDespesas([]); // Evita tela branca em caso de erro
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc || !valor) return;

    setLoading(true);
    try {
      // CORREÇÃO: Usando api.post
      await api.post(`/veiculos/${vehicle.id}/despesas`, { 
        descricao: desc, 
        valor: parseFloat(valor) 
      });
      
      // Se não deu erro no await acima, limpamos e recarregamos
      setDesc('');
      setValor('');
      loadDespesas(); 

    } catch (error) {
      alert("Erro ao adicionar despesa");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if(!confirm("Remover esta despesa?")) return;
    
    try {
      // CORREÇÃO: Usando api.delete
      await api.delete(`/despesas/${id}`);
      loadDespesas();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao remover despesa.");
    }
  };

  // Cálculos Seguros (usando || 0 para evitar NaN)
  const totalDespesas = despesas.reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);
  const custoTotal = valorCompra + totalDespesas;

  // Formatador de Moeda
  const fMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
        
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Wrench size={20} className="text-orange-500" />
            Gestão de Custos: {vehicle.modelo}
          </h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
            <div className="bg-white p-3 rounded border shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Valor de Compra</p>
                <p className="text-lg font-bold text-blue-600">{fMoney(valorCompra)}</p>
            </div>
            <div className="bg-white p-3 rounded border shadow-sm">
                <p className="text-xs text-gray-500 font-bold uppercase">Total Despesas</p>
                <p className="text-lg font-bold text-red-500">+ {fMoney(totalDespesas)}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded border border-blue-200 shadow-sm">
                <p className="text-xs text-blue-700 font-bold uppercase">Custo Final Total</p>
                <p className="text-xl font-black text-gray-800">{fMoney(custoTotal)}</p>
            </div>
        </div>

        {/* Lista de Despesas */}
        <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {despesas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                    <Wrench size={48} className="mb-2 opacity-20" />
                    <p>Nenhuma despesa cadastrada.</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0">
                        <tr>
                            <th className="p-3 rounded-tl-lg">Descrição</th>
                            <th className="p-3">Data</th>
                            <th className="p-3">Valor</th>
                            <th className="p-3 w-10 rounded-tr-lg"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {despesas.map(d => (
                            <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 font-medium text-gray-800">{d.descricao}</td>
                                <td className="p-3 text-gray-500">
                                    {d.data_despesa ? new Date(d.data_despesa).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-3 font-bold text-red-600">- {fMoney(parseFloat(d.valor))}</td>
                                <td className="p-3">
                                    <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>

        {/* Formulário de Adição */}
        <form onSubmit={handleAdd} className="p-4 bg-gray-100 border-t flex gap-3 items-end">
            <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 mb-1">Nova Despesa (Ex: Funilaria)</label>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Descrição do serviço..."
                />
            </div>
            <div className="w-32">
                <label className="block text-xs font-bold text-gray-500 mb-1">Valor (R$)</label>
                <input 
                    type="number" step="0.01"
                    className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    placeholder="0,00"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-orange-500 text-white px-4 py-2 rounded font-bold hover:bg-orange-600 flex items-center gap-2 h-[42px] transition-colors shadow-sm disabled:opacity-50"
            >
                <Plus size={18} /> {loading ? '...' : 'Adicionar'}
            </button>
        </form>

      </div>
    </div>
  );
};

export default DespesasModal;
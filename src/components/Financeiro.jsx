import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Search, Printer } from 'lucide-react';
import api from '../api';

const Financeiro = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, entrada: 0, saida: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, dateFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // 1. BUSCA VENDAS (CORRIGIDO: A rota correta é /financeiro/vendas)
      const vendasRes = await api.get('/financeiro/vendas');
      const vendas = vendasRes.data;

      // 2. BUSCA DESPESAS (Tenta buscar, mas se a rota não existir, segue sem travar)
      let despesas = [];
      try {
         const despesasRes = await api.get('/despesas');
         despesas = despesasRes.data;
      } catch (error) {
         console.warn("Aviso: Rota de despesas gerais (/despesas) não encontrada no backend.");
      }

      // Normaliza dados VENDAS
      const entradas = vendas.map(v => ({
        id: `v-${v.id}`,
        tipo: 'entrada',
        descricao: `Venda: ${v.veiculo_modelo} (${v.veiculo_placa}) - ${v.cliente_nome}`,
        valor: parseFloat(v.valor_venda),
        data: v.data_venda,
        origem: 'Venda'
      }));

      // Normaliza dados DESPESAS
      const saidas = despesas.map(d => {
    const isReceita = d.tipo === 'receita';

    return {
        id: `d-${d.id}`,
        // Se for receita, marcamos como 'entrada', senão 'saida'
        tipo: isReceita ? 'entrada' : 'saida', 
        descricao: `${isReceita ? 'Receita Extra' : 'Despesa'}: ${d.descricao}`,
        valor: parseFloat(d.valor),
        data: d.data_despesa,
        origem: isReceita ? 'Outras Receitas' : 'Despesa Veicular'
    };
});

      const all = [...entradas, ...saidas].sort((a, b) => new Date(b.data) - new Date(a.data));
      setTransactions(all);
      
      // Calcula Resumo
      const totalEntrada = entradas.reduce((acc, curr) => acc + curr.valor, 0);
      const totalSaida = saidas.reduce((acc, curr) => acc + curr.valor, 0);
      setSummary({
        entrada: totalEntrada,
        saida: totalSaida,
        total: totalEntrada - totalSaida
      });

    } catch (error) {
      console.error("Erro ao buscar financeiro:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.descricao.toLowerCase().includes(lower) ||
        t.origem.toLowerCase().includes(lower)
      );
    }

    if (dateFilter) {
      // Filtra pela parte da data (YYYY-MM-DD)
      filtered = filtered.filter(t => t.data && t.data.startsWith(dateFilter));
    }

    setFilteredTransactions(filtered);
  };

  const fMoney = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const fDate = (dateString) => {
      if(!dateString) return '-';
      return new Date(dateString).toLocaleDateString('pt-BR');
  };
const handlePrintReport = () => {
    // Calcula os totais apenas do que está filtrado na tela
    const filteredEntradas = filteredTransactions.filter(t => t.tipo === 'entrada').reduce((sum, t) => sum + t.valor, 0);
    const filteredSaidas = filteredTransactions.filter(t => t.tipo === 'saida').reduce((sum, t) => sum + t.valor, 0);
    const filteredTotal = filteredEntradas - filteredSaidas;

    // Abre uma nova janela para o relatório
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
                          <!DOCTYPE html>
                          <html lang="pt-BR">
                          <head>
                            <meta charset="UTF-8">
                            <title>Relatório Financeiro</title>
                            <style>
                              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                              .header h1 { color: #166534; margin: 0 0 10px 0; font-size: 24px; text-transform: uppercase; }
                              .header p { margin: 0; color: #666; font-size: 14px; }
                              
                              .summary-box { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                              .summary-item { text-align: center; flex: 1; }
                              .summary-item:not(:last-child) { border-right: 1px solid #e2e8f0; }
                              .summary-item span { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; }
                              .summary-item strong { font-size: 20px; }
                              
                              .text-green { color: #16a34a; }
                              .text-red { color: #dc2626; }
                              .text-blue { color: #2563eb; }
                              
                              table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px; }
                              th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
                              th { background-color: #f1f5f9; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 11px; }
                              tr:nth-child(even) { background-color: #f8fafc; }
                              .text-right { text-align: right; }
                              .tag { padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: #e2e8f0; }
                              
                              @media print {
                                body { padding: 0; }
                                @page { margin: 1.5cm; }
                              }
                            </style>
                          </head>
                          <body>
                            <div class="header">
                              <h1>Relatório Financeiro</h1>
                              <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                              ${dateFilter ? `<p><strong>Filtro de Data:</strong> ${dateFilter.split('-').reverse().join('/')}</p>` : ''}
                              ${searchTerm ? `<p><strong>Termo buscado:</strong> "${searchTerm}"</p>` : ''}
                            </div>

                            <div class="summary-box">
                              <div class="summary-item">
                                <span>Total Receitas</span>
                                <strong class="text-green">${fMoney(filteredEntradas)}</strong>
                              </div>
                              <div class="summary-item">
                                <span>Total Despesas</span>
                                <strong class="text-red">${fMoney(filteredSaidas)}</strong>
                              </div>
                              <div class="summary-item">
                                <span>Saldo do Período</span>
                                <strong class="${filteredTotal >= 0 ? 'text-blue' : 'text-red'}">${fMoney(filteredTotal)}</strong>
                              </div>
                            </div>

                            <table>
                              <thead>
                                <tr>
                                  <th>Data</th>
                                  <th>Descrição do Lançamento</th>
                                  <th>Categoria</th>
                                  <th class="text-right">Valor</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${filteredTransactions.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding: 20px;">Nenhum registro encontrado para este filtro.</td></tr>' : ''}
                                ${filteredTransactions.map(t => `
                                  <tr>
                                    <td>${fDate(t.data)}</td>
                                    <td>${t.descricao}</td>
                                    <td><span class="tag">${t.origem}</span></td>
                                    <td class="text-right ${t.tipo === 'entrada' ? 'text-green' : 'text-red'} font-bold">
                                      ${t.tipo === 'entrada' ? '+' : '-'} ${fMoney(t.valor)}
                                    </td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                            
                            <script>
                              window.onload = function() { 
                                setTimeout(() => { 
                                  window.print(); 
                                  window.close(); 
                                }, 500); 
                              }
                            </script>
                          </body>
                          </html>
                        `;
                        
                        printWindow.document.write(htmlContent);
                        printWindow.document.close();
                      };
                      
  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <DollarSign className="text-green-600" size={32}/> Controle Financeiro
      </h1>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase">Receitas (Entradas)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{fMoney(summary.entrada)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full text-green-600"><TrendingUp size={24}/></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase">Despesas (Saídas)</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{fMoney(summary.saida)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full text-red-600"><TrendingDown size={24}/></div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-gray-400 uppercase">Saldo Líquido</p>
                <p className={`text-2xl font-bold mt-1 ${summary.total >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {fMoney(summary.total)}
                </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><DollarSign size={24}/></div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" 
                    placeholder="Buscar descrição..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-green-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            </div>
            <div className="relative">
                <input 
                    type="date" 
                    className="pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-green-500"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            </div>
        </div>
        <button onClick={handlePrintReport} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold transition-colors bg-gray-100 hover:bg-indigo-50 px-4 py-2 rounded-lg">
          <Printer size={18}/> Imprimir Relatório
      </button>
      </div>

      {/* TABELA (SEM BOTÃO DE EXCLUIR) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                        <th className="p-4">Data</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">Carregando financeiro...</td></tr>
                    ) : filteredTransactions.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
                    ) : (
                        filteredTransactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-gray-500">{fDate(t.data)}</td>
                                <td className="p-4 font-medium text-gray-800">{t.descricao}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {t.origem}
                                    </span>
                                </td>
                                <td className={`p-4 font-bold text-right ${t.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.tipo === 'entrada' ? '+' : '-'} {fMoney(t.valor)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Financeiro;
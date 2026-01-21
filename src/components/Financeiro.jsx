import { useState, useEffect } from 'react';
import { Search, DollarSign, Calendar, User, Car, Trash2, Printer, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../api';
import DocumentViewer from './DocumentViewer'; // Certifique-se de ter criado este arquivo

const Financeiro = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState(null);

  // Carrega as vendas ao abrir a tela
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/financeiro/vendas`);
      const data = await response.json();
      setSales(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
      setLoading(false);
    }
  };

  // Função para cancelar venda e estornar veículo
  const handleDeleteSale = async (sale) => {
    const confirmMessage = `ATENÇÃO: Você está prestes a excluir a venda do veículo ${sale.veiculo_modelo}.\n\nAo fazer isso, o veículo voltará automaticamente para o ESTOQUE.\n\nDeseja continuar?`;
    
    // eslint-disable-next-line no-restricted-globals
    if (confirm(confirmMessage)) {
      try {
        const response = await fetch(`${API_BASE_URL}/vendas/${sale.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao cancelar venda');

        // Remove da lista visualmente sem precisar recarregar
        setSales(sales.filter(item => item.id !== sale.id));
        alert('Venda cancelada com sucesso! O veículo está disponível novamente no estoque.');
        
      } catch (error) {
        console.error(error);
        alert('Erro ao cancelar venda. Verifique o console para mais detalhes.');
      }
    }
  };

  // Filtro de busca (nome, carro, placa, cpf)
  const filteredSales = sales.filter(sale => 
    (sale.cliente_nome && sale.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.veiculo_modelo && sale.veiculo_modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.veiculo_placa && sale.veiculo_placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.cpf_cnpj && sale.cpf_cnpj.includes(searchTerm))
  );

  // Cálculo do total mostrado no card superior
  const totalSales = filteredSales.reduce((acc, curr) => acc + Number(curr.valor_venda), 0);

  return (
    <div className="flex flex-col h-full animate-fade-in w-full">
      
      {/* Header e KPIs Rápidos */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <DollarSign className="text-green-600" /> Histórico Financeiro
          </h1>
          <p className="text-gray-500 mt-1">Registro de todas as vendas e fechamentos.</p>
        </div>
        
        <div className="bg-green-50 px-6 py-3 rounded-xl border border-green-100 flex flex-col items-end shadow-sm">
            <span className="text-xs font-bold text-green-600 uppercase">Total do Período</span>
            <span className="text-2xl font-bold text-gray-800">
                R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        </div>
      </div>

      {/* Barra de Ferramentas */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Buscar por cliente, carro, placa ou CPF..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 font-medium transition-colors w-full md:w-auto justify-center">
            <Calendar size={18} />
            <span>Filtrar Data</span>
        </button>
      </div>

      {/* Tabela de Vendas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                    <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Cliente</th>
                        <th className="px-6 py-4">Veículo</th>
                        <th className="px-6 py-4">Pagamento</th>
                        <th className="px-6 py-4 text-right">Valor Total</th>
                        <th className="px-6 py-4 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">Carregando registros...</td></tr>
                    ) : filteredSales.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                                <AlertCircle size={48} className="mb-2 opacity-20"/>
                                <p>Nenhuma venda encontrada.</p>
                            </td>
                        </tr>
                    ) : (
                        filteredSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-green-50/30 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400"/>
                                        {new Date(sale.data_venda).toLocaleDateString('pt-BR')}
                                    </div>
                                    <span className="text-xs text-gray-400 ml-6">
                                        {new Date(sale.data_venda).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400 group-hover:text-green-600"/>
                                        <div>
                                            <p className="font-medium text-gray-800">{sale.cliente_nome}</p>
                                            <p className="text-xs text-gray-400">{sale.cpf_cnpj}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Car size={16} className="text-gray-400 group-hover:text-green-600"/>
                                        <div>
                                            <p className="font-medium text-gray-800">{sale.veiculo_modelo}</p>
                                            <p className="text-xs text-gray-500 bg-gray-100 px-1.5 rounded inline-block mt-0.5 border border-gray-200 uppercase font-mono">
                                                {sale.veiculo_placa}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {sale.metodo_pagamento}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <p className="font-bold text-green-700">
                                        R$ {Number(sale.valor_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    {(Number(sale.entrada) > 0) && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Entrada: R$ {Number(sale.entrada).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => setSelectedSaleForPrint(sale.id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                            title="Imprimir Recibo/Contrato"
                                        >
                                            <Printer size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSale(sale)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title="Cancelar Venda (Devolver ao Estoque)"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal de Impressão */}
      {selectedSaleForPrint && (
        <DocumentViewer 
            saleId={selectedSaleForPrint} 
            onClose={() => setSelectedSaleForPrint(null)} 
        />
      )}
    </div>
  );
};

export default Financeiro;
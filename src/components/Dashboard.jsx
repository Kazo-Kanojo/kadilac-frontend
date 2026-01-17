import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Levantamento Gerencial</h2>
            <div className="flex gap-2 bg-white p-2 rounded shadow-sm text-sm">
                <span className="text-gray-500">Período:</span>
                <span className="font-bold text-kadilac-500">01/01/2026 à 16/01/2026</span>
            </div>
            </div>

            {/* Cards Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 mb-1">Total Receitas</p>
                <p className="text-2xl font-bold text-gray-800">R$ 973.342</p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                <ArrowUpCircle size={14} /> +12% vs mês anterior
                </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
                <p className="text-sm text-gray-500 mb-1">Total Gastos</p>
                <p className="text-2xl font-bold text-gray-800">R$ 469.328</p>
                <div className="text-xs text-gray-400 mt-2">Inclui compras e despesas</div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500 bg-green-50">
                <p className="text-sm text-green-700 mb-1 font-bold">LUCRO DO PERÍODO</p>
                <p className="text-3xl font-bold text-green-700">R$ 504.014</p>
                <div className="text-xs text-green-600 mt-2">Margem apurada: 51%</div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow border-l-4 border-kadilac-300">
                <p className="text-sm text-gray-500 mb-1">Veículos em Estoque</p>
                <p className="text-2xl font-bold text-kadilac-500">95 Unidades</p>
                <div className="text-xs text-gray-400 mt-2">Valor Total: R$ 3.5M</div>
            </div>
            </div>

            {/* Detalhamento (Tabela Resumida) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <ArrowDownCircle className="text-blue-500" size={20} /> Entradas de Veículos
                </h3>
                <div className="flex justify-between border-b py-2 text-sm">
                <span>Veículos Comprados (19)</span>
                <span className="font-bold">R$ 354.021</span>
                </div>
                <div className="flex justify-between border-b py-2 text-sm">
                <span>Veículos Consignados (4)</span>
                <span className="font-bold">R$ 114.500</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <ArrowUpCircle className="text-green-500" size={20} /> Saídas de Veículos
                </h3>
                <div className="flex justify-between border-b py-2 text-sm">
                <span>Venda de Próprios (20)</span>
                <span className="font-bold text-blue-600">R$ 659.342</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                <span>Lucro sobre Vendas</span>
                <span className="font-bold text-green-600 bg-green-100 px-2 rounded">R$ 144.800</span>
                </div>
            </div>
            </div>
    </div>
  );
};
export default Dashboard;
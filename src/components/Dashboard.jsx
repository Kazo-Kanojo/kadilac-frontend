/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Car, DollarSign, Users, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';
// ALTERAÇÃO 1: Importar 'api' (o axios configurado) em vez de apenas a URL
import api from '../api'; 

const Dashboard = ({ setActiveScreen }) => {
  const [stats, setStats] = useState({
    estoque: { qtd: 0, valor: 0 },
    vendas: 0,
    clientes: 0,
    recentes: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados do Backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // ALTERAÇÃO 2: Usar api.get(). O token será enviado automaticamente pelo interceptor do api.js
        const response = await api.get('/dashboard/resumo');
        
        // ALTERAÇÃO 3: O axios retorna os dados diretamente em .data, não precisa de .json()
        setStats(response.data);
      } catch (error) {
        console.error('Erro:', error);
        // Opcional: Se der erro de autorização, o api.js já deve redirecionar para login,
        // mas você pode adicionar tratamento visual aqui se quiser.
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Componente de Card (KPI)
  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow animate-slide-up">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{isLoading ? '...' : value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
      </div>
      <div className={`p-4 rounded-full ${color} bg-opacity-10 text-white shadow-sm`}>
          <Icon size={28} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-fade-in w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Visão Geral</h1>
        <p className="text-gray-600 mt-1">Bem-vindo ao sistema de gestão Kadilac.</p>
      </div>

      {/* Grid de Cards (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Veículos em Estoque" 
          value={stats.estoque.qtd} 
          icon={Car} 
          color="bg-blue-500" 
          subtext="Disponíveis para venda"
        />
        <StatCard 
          title="Valor em Estoque" 
          value={`R$ ${Number(stats.estoque.valor).toLocaleString('pt-BR')}`} 
          icon={DollarSign} 
          color="bg-green-500" 
          subtext="Preço total de venda"
        />
        <StatCard 
          title="Total de Vendas" 
          value={stats.vendas} 
          icon={ShoppingBag} 
          color="bg-[#D80000]" 
          subtext="Veículos vendidos"
        />
        <StatCard 
          title="Clientes Ativos" 
          value={stats.clientes} 
          icon={Users} 
          color="bg-orange-500" 
          subtext="Base de contatos cadastrada"
        />
      </div>

      {/* Seção Inferior: Tabela e Ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Box Esquerda: Últimas Vendas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#D80000]" />
              Últimas Vendas Realizadas
            </h3>
            <button 
              // Se setActiveScreen não for passado, usa reload como fallback
              onClick={() => setActiveScreen ? setActiveScreen('estoque') : window.location.href = '/'} 
              className="text-sm text-[#D80000] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver estoque <ArrowRight size={14}/>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Veículo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Placa</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Valor Venda</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="4" className="p-4 text-center text-gray-400">Carregando...</td></tr>
                ) : stats.recentes.length === 0 ? (
                   <tr><td colSpan="4" className="p-4 text-center text-gray-400">Nenhuma venda registrada ainda.</td></tr>
                ) : (
                  stats.recentes.map((venda, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{venda.modelo}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono uppercase text-xs">{venda.placa}</td>
                      <td className="px-4 py-3 text-green-600 font-bold">R$ {Number(venda.valor_venda).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(venda.data_venda).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Box Direita: Ações Rápidas */}
        <div className="bg-[#D80000] text-white p-6 rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden h-min lg:h-auto">
            {/* Efeito de fundo */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Acesso Rápido</h3>
              <p className="text-red-100 text-sm mb-6">O que você deseja fazer agora?</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setActiveScreen ? setActiveScreen('estoque') : window.location.href = '/'}
                  className="w-full bg-red-800 text-white py-3 px-4 rounded-lg font-bold text-sm hover:bg-red-900 transition-colors flex items-center justify-between border border-red-700 shadow-sm"
                >
                  Cadastrar Veículo
                  <ArrowRight size={16}/>
                </button>

                <button 
                  onClick={() => setActiveScreen ? setActiveScreen('clientes') : window.location.href = '/'}
                  className="w-full bg-red-800 text-white py-3 px-4 rounded-lg font-bold text-sm hover:bg-red-900 transition-colors flex items-center justify-between border border-red-700 shadow-sm"
                >
                  Cadastrar Cliente
                  <ArrowRight size={16}/>
                </button>
              </div>
            </div>

            <div className="mt-8 text-center border-t border-red-800 pt-4">
              <p className="text-xs text-red-200">Suporte Técnico</p>
              <p className="text-sm font-bold mt-1">(11) 9999-9999</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
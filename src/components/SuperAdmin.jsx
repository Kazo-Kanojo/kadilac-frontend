import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { Store, Lock, Unlock, Key, Plus } from 'lucide-react'; // Alterado para lucide-react

const SuperAdmin = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modais
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    // Formulários
    const [newStoreData, setNewStoreData] = useState({ name: '', username: '', password: '' });
    const [resetData, setResetData] = useState({ storeId: null, storeName: '', newPassword: '' });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await api.get('/admin/stores');
            setStores(response.data);
        } catch (error) {
            console.error("Erro ao buscar lojas", error);
            alert("Acesso negado ou erro ao carregar.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/stores', newStoreData);
            alert("Loja criada com sucesso!");
            setShowCreateModal(false);
            setNewStoreData({ name: '', username: '', password: '' });
            fetchStores();
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao criar loja");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
        const action = newStatus === 'active' ? 'desbloquear' : 'bloquear';
        
        if (!window.confirm(`Tem certeza que deseja ${action} esta loja?`)) return;

        try {
            await api.put(`/admin/stores/${id}/status`, { status: newStatus });
            fetchStores();
        } catch (error) {
            alert("Erro ao alterar status");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/stores/${resetData.storeId}/reset-password`, { 
                newPassword: resetData.newPassword 
            });
            alert("Senha alterada com sucesso!");
            setShowPasswordModal(false);
            setResetData({ storeId: null, storeName: '', newPassword: '' });
        } catch (error) {
            alert("Erro ao resetar senha.");
        }
    };

    const openResetModal = (store) => {
        setResetData({ storeId: store.id, storeName: store.name, newPassword: '' });
        setShowPasswordModal(true);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Super Admin - SaaS</h1>
                    <p className="text-gray-600">Gerenciamento de Lojas e Acessos</p>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow transition"
                >
                    <Plus size={20} /> Nova Loja
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Carregando lojas...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Loja</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário Admin</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stores.map((store) => (
                                <tr key={store.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{store.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{store.admin_username || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            store.status === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                            {store.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium flex justify-center gap-3">
                                        <button 
                                            onClick={() => openResetModal(store)}
                                            className="text-yellow-600 hover:text-yellow-900 tooltip" 
                                            title="Alterar Senha"
                                        >
                                            <Key size={18} />
                                        </button>
                                        
                                        <button 
                                            onClick={() => toggleStatus(store.id, store.status)}
                                            className={`${store.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                            title={store.status === 'active' ? "Bloquear Loja" : "Desbloquear Loja"}
                                        >
                                            {store.status === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Criar Loja */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Store size={24} /> Criar Nova Loja</h2>
                        <form onSubmit={handleCreateStore} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={newStoreData.name}
                                    onChange={e => setNewStoreData({...newStoreData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuário Admin (Login)</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={newStoreData.username}
                                    onChange={e => setNewStoreData({...newStoreData, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Senha Inicial</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                    value={newStoreData.password}
                                    onChange={e => setNewStoreData({...newStoreData, password: e.target.value})}
                                    placeholder="Defina uma senha forte"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Criar Loja</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Resetar Senha */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-lg font-bold mb-2 text-red-600 flex items-center gap-2"><Key size={20} /> Alterar Senha</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Definindo nova senha para a loja: <strong>{resetData.storeName}</strong>
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <input 
                                type="text" 
                                required 
                                className="w-full border p-2 rounded mb-4"
                                placeholder="Digite a nova senha..."
                                value={resetData.newPassword}
                                onChange={e => setResetData({...resetData, newPassword: e.target.value})}
                            />
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-1.5 text-gray-600">Cancelar</button>
                                <button type="submit" className="px-3 py-1.5 bg-red-600 text-white rounded">Salvar Senha</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdmin;
import { useState, useEffect } from 'react';
import { Building2, Power, UserPlus, ShieldAlert, KeyRound, Edit2, Eye, EyeOff, X, Save } from 'lucide-react';
import api from '../api';

const SuperAdmin = () => {
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados de Controle Visual (Mostrar/Esconder Senha)
  const [showPassword, setShowPassword] = useState(false);

  // --- MODAL: CRIAR LOJA ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', username: '', password: '' });

  // --- MODAL: EDITAR LOJA ---
  const [editingStore, setEditingStore] = useState(null); // Guarda a loja sendo editada
  const [editForm, setEditForm] = useState({ name: '', username: '' });

  // --- MODAL: RESETAR SENHA ---
  const [resetModalStore, setResetModalStore] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  // Busca as lojas ao carregar
  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/stores');
      setStores(res.data);
    } catch (error) {
      console.error("Erro ao buscar lojas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // --- AÇÃO 1: CRIAR LOJA ---
  const handleCreateStore = async (e) => {
      e.preventDefault();
      try {
          await api.post('/admin/stores', newStore);
          alert('Loja criada com sucesso!');
          setIsCreateModalOpen(false);
          setNewStore({ name: '', username: '', password: '' });
          fetchStores();
      } catch (error) {
          alert('Erro ao criar loja: ' + (error.response?.data?.error || error.message));
      }
  };

  // --- AÇÃO 2: EDITAR LOJA (ABRIR) ---
  const openEditModal = (store) => {
      setEditingStore(store);
      setEditForm({ name: store.name, username: store.admin_username });
  };

  // --- AÇÃO 2: EDITAR LOJA (SALVAR) ---
  const handleUpdateStore = async (e) => {
      e.preventDefault();
      try {
          await api.put(`/admin/stores/${editingStore.id}`, editForm);
          alert('Dados atualizados com sucesso!');
          setEditingStore(null);
          fetchStores(); // Recarrega a lista
      } catch (error) {
          alert('Erro ao atualizar: ' + (error.response?.data?.error || 'Erro desconhecido'));
      }
  };

  // --- AÇÃO 3: BLOQUEAR / ATIVAR ---
  const toggleStoreStatus = async (store) => {
    const newStatus = store.status === 'active' ? 'blocked' : 'active';
    const actionName = newStatus === 'blocked' ? 'BLOQUEAR' : 'ATIVAR';
    
    if (window.confirm(`Tem certeza que deseja ${actionName} o acesso da loja "${store.name}"?`)) {
        try {
            await api.put(`/admin/stores/${store.id}/status`, { status: newStatus });
            setStores(prev => prev.map(s => s.id === store.id ? { ...s, status: newStatus } : s));
        } catch (error) {
            alert('Erro ao atualizar status.');
        }
    }
  };

  // --- AÇÃO 4: RESETAR SENHA ---
  const handleResetPassword = async () => {
    // Validação local antes de chamar o servidor
    if (!newPassword || newPassword.trim().length < 6) {
        return alert("A senha deve ter no mínimo 6 caracteres.");
    }

    try {
        // Certifique-se que resetModalStore.id contém o ID da LOJA
        await api.put(`/admin/stores/${resetModalStore.id}/reset-password`, { 
            newPassword: newPassword 
        });

        alert(`Senha de "${resetModalStore.name}" alterada com sucesso!`);
        
        // Limpa os estados e fecha o modal
        setResetModalStore(null);
        setNewPassword('');
        setShowPassword(false);
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.error || "Erro ao conectar com o servidor.";
        alert("Erro ao alterar senha: " + msg);
    }
};

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50 p-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <ShieldAlert className="text-[#D80000]" size={32}/> 
                Painel Master
            </h1>
            <p className="text-gray-500">Gerenciamento total de lojas (Tenants)</p>
        </div>
        <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg"
        >
            <UserPlus size={20}/> Nova Loja
        </button>
      </div>

      {/* Grid de Lojas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {isLoading ? <p>Carregando lojas...</p> : stores.map((store) => (
              <div key={store.id} className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${store.status === 'blocked' ? 'border-red-200 opacity-75 grayscale' : 'border-transparent'}`}>
                  
                  {/* Cartão da Loja */}
                  <div className="p-6 relative">
                      <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-lg ${store.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                             <Building2 size={24}/>
                          </div>
                          
                          {/* Badge de Status */}
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${store.status === 'blocked' ? 'bg-red-500 text-white' : 'bg-green-100 text-green-800'}`}>
                              {store.status === 'blocked' ? 'Bloqueada' : 'Ativa'}
                          </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">{store.name}</h3>
                      <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Acesso Admin</p>
                        <p className="text-sm font-mono text-gray-700 font-bold flex items-center gap-1">
                            {store.admin_username}
                        </p>
                      </div>
                  </div>

                  {/* Barra de Ações */}
                  <div className="bg-gray-50 border-t border-gray-100 p-3 flex gap-2">
                      <button 
                        onClick={() => toggleStoreStatus(store)}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors border ${store.status === 'active' ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 border-green-600 text-white hover:bg-green-700'}`}
                        title={store.status === 'active' ? 'Bloquear Acesso' : 'Liberar Acesso'}
                      >
                          <Power size={14}/>
                          {store.status === 'active' ? 'Bloquear' : 'Ativar'}
                      </button>
                      
                      <button 
                         onClick={() => openEditModal(store)}
                         className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50" 
                         title="Editar Dados"
                      >
                          <Edit2 size={16}/>
                      </button>

                      <button 
                         onClick={() => {
                             setResetModalStore(store);
                             setNewPassword('');
                             setShowPassword(false);
                         }}
                         className="p-2 bg-white border border-gray-200 text-orange-500 rounded-lg hover:bg-orange-50" 
                         title="Trocar Senha"
                      >
                          <KeyRound size={16}/>
                      </button>
                  </div>
              </div>
          ))}
      </div>

      {/* --- MODAL 1: CRIAR NOVA LOJA --- */}
      {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-slide-up relative">
                  <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                  
                  <h2 className="text-2xl font-bold mb-1 text-gray-800">Criar Nova Loja</h2>
                  <p className="text-gray-500 text-sm mb-6">Cadastre um novo cliente no sistema.</p>
                  
                  <form onSubmit={handleCreateStore} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Empresa</label>
                          <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none" placeholder="Ex: Kadilac Veículos" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Usuário Admin</label>
                          <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none" placeholder="login.admin" value={newStore.username} onChange={e => setNewStore({...newStore, username: e.target.value})} />
                      </div>
                      <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-1">Senha Inicial</label>
                          <input required type={showPassword ? "text" : "password"} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-800 outline-none pr-10" placeholder="******" value={newStore.password} onChange={e => setNewStore({...newStore, password: e.target.value})} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                          </button>
                      </div>
                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                          <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                          <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-bold flex items-center gap-2"><UserPlus size={18}/> Criar Sistema</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- MODAL 2: EDITAR DADOS --- */}
      {editingStore && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-slide-up relative">
                  <button onClick={() => setEditingStore(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                  
                  <h2 className="text-2xl font-bold mb-1 text-gray-800">Editar Loja</h2>
                  <p className="text-gray-500 text-sm mb-6">Alterar identificação do sistema.</p>
                  
                  <form onSubmit={handleUpdateStore} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Empresa</label>
                          <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Usuário Admin</label>
                          <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
                      </div>
                      
                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                          <button type="button" onClick={() => setEditingStore(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button>
                          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"><Save size={18}/> Salvar Alterações</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* --- MODAL 3: RESETAR SENHA --- */}
      {resetModalStore && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-slide-up relative">
                  <button onClick={() => setResetModalStore(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={24}/></button>
                  
                  <div className="mb-4 text-center">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <KeyRound size={24}/>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Nova Senha de Acesso</h3>
                    <p className="text-sm text-gray-500">Defina uma nova senha para <br/><strong>{resetModalStore.name}</strong></p>
                  </div>
                  
                  <div className="relative mb-6">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        className="w-full p-3 border rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-orange-500 outline-none" 
                        placeholder="Nova Senha"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                    </button>
                  </div>

                  <div className="flex gap-2">
                      <button onClick={() => setResetModalStore(null)} className="flex-1 py-2 border rounded-lg text-gray-600 font-medium hover:bg-gray-50">Cancelar</button>
                      <button onClick={handleResetPassword} className="flex-1 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600">Confirmar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SuperAdmin;
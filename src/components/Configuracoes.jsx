import { useState, useEffect, useRef } from 'react';
import { Save, Building2, Lock, Image, CheckCircle, Upload } from 'lucide-react';
import api from '../api'; // Importa a configuração correta da API com Token

const Configuracoes = () => {
  const [activeTab, setActiveTab] = useState('loja');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Estado para Dados da Loja
  const [formData, setFormData] = useState({
    nome_loja: '', 
    razao_social: '', 
    cnpj: '', 
    endereco: '', 
    cidade: '', 
    telefone: '', 
    email: '', 
    site: '', 
    logo: ''
  });

  // Estado para Senha
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  // Carrega as configurações ao abrir a tela
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/config');
      if (res.data) {
        // O backend corrigido já retorna os nomes em português (nome_loja, telefone, etc.)
        setFormData(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  // Função para Salvar Dados da Loja e Logo
  const handleSaveLoja = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/config', formData);
      alert('✅ Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  // Função para Alterar Senha
  const handleSaveSenha = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        return alert("As senhas não conferem!");
    }
    if (passwordData.newPassword.length < 6) {
        return alert("A senha deve ter no mínimo 6 caracteres.");
    }
    
    setLoading(true);
    try {
        await api.put('/profile/password', { newPassword: passwordData.newPassword });
        alert("🔒 Senha alterada com sucesso!");
        setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
        console.error(error);
        alert("Erro ao alterar senha.");
    } finally {
        setLoading(false);
    }
  };

  // Função para processar o Upload do Logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("A imagem é muito grande (Máx: 2MB).");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Salva a imagem em Base64 no estado
        setFormData(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Building2 className="text-orange-600" size={32} /> Configurações do Sistema
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* MENU LATERAL (ABAS) */}
        <div className="w-full md:w-64 flex flex-col gap-2">
            <button 
                onClick={() => setActiveTab('loja')}
                className={`text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-all ${activeTab === 'loja' ? 'bg-orange-100 text-orange-700' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
            >
                <Building2 size={18}/> Dados da Loja
            </button>
            <button 
                onClick={() => setActiveTab('logo')}
                className={`text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-all ${activeTab === 'logo' ? 'bg-blue-100 text-blue-700' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
            >
                <Image size={18}/> Logotipo
            </button>
            <button 
                onClick={() => setActiveTab('seguranca')}
                className={`text-left px-4 py-3 rounded-lg font-bold flex items-center gap-3 transition-all ${activeTab === 'seguranca' ? 'bg-red-100 text-red-700' : 'bg-white hover:bg-gray-50 text-gray-600'}`}
            >
                <Lock size={18}/> Segurança
            </button>
        </div>

        {/* ÁREA DE CONTEÚDO */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
            
            {/* ABA 1: DADOS DA LOJA */}
            {activeTab === 'loja' && (
                <form onSubmit={handleSaveLoja} className="animate-fade-in">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">Informações da Empresa</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nome Fantasia</label>
                            <input 
                                name="nome_loja" 
                                value={formData.nome_loja || ''} 
                                onChange={(e) => setFormData({...formData, nome_loja: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Razão Social</label>
                            <input 
                                name="razao_social" 
                                value={formData.razao_social || ''} 
                                onChange={(e) => setFormData({...formData, razao_social: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">CNPJ</label>
                            <input 
                                name="cnpj" 
                                value={formData.cnpj || ''} 
                                onChange={(e) => setFormData({...formData, cnpj: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Telefone / WhatsApp</label>
                            <input 
                                name="telefone" 
                                value={formData.telefone || ''} 
                                onChange={(e) => setFormData({...formData, telefone: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Endereço Completo</label>
                            <input 
                                name="endereco" 
                                value={formData.endereco || ''} 
                                onChange={(e) => setFormData({...formData, endereco: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Cidade / UF</label>
                            <input 
                                name="cidade" 
                                value={formData.cidade || ''} 
                                onChange={(e) => setFormData({...formData, cidade: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input 
                                name="email" 
                                value={formData.email || ''} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Site / Instagram</label>
                            <input 
                                name="site" 
                                value={formData.site || ''} 
                                onChange={(e) => setFormData({...formData, site: e.target.value})} 
                                className="w-full p-2 border rounded focus:border-orange-500 outline-none transition-colors" 
                            />
                        </div>
                    </div>
                    <div className="pt-6 mt-6 border-t flex justify-end">
                        <button type="submit" disabled={loading} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50">
                            <Save size={20} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            )}

            {/* ABA 2: LOGOTIPO */}
            {activeTab === 'logo' && (
                <div className="animate-fade-in text-center">
                    <h2 className="text-xl font-bold text-gray-700 mb-6 pb-2 border-b text-left">Identidade Visual</h2>
                    
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all flex flex-col items-center justify-center group bg-gray-50"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {formData.logo ? (
                            <div className="relative">
                                <img src={formData.logo} alt="Logo" className="h-40 object-contain mb-4 shadow-sm rounded bg-white p-2" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <span className="text-white font-bold flex items-center gap-2"><Upload size={18}/> Trocar</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-32 w-32 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Image size={48} className="text-gray-400" />
                            </div>
                        )}
                        <p className="font-bold text-gray-600 group-hover:text-blue-600 mt-2">Clique para selecionar seu Logotipo</p>
                        <p className="text-sm text-gray-400 mt-1">Recomendado: PNG Transparente (Max 2MB)</p>
                        <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    </div>

                    <div className="mt-8 flex justify-end border-t pt-6">
                        <button onClick={handleSaveLoja} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2 disabled:opacity-50">
                            <Save size={20}/> {loading ? 'Enviando...' : 'Salvar Logotipo'}
                        </button>
                    </div>
                </div>
            )}

            {/* ABA 3: SEGURANÇA */}
            {activeTab === 'seguranca' && (
                <form onSubmit={handleSaveSenha} className="animate-fade-in max-w-md mx-auto md:mx-0">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b">Alterar Senha de Acesso</h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Nova Senha</label>
                            <input 
                                type="password" 
                                className="w-full p-3 border rounded-lg focus:border-red-500 outline-none transition-colors" 
                                placeholder="Mínimo 6 caracteres"
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Confirmar Nova Senha</label>
                            <input 
                                type="password" 
                                className="w-full p-3 border rounded-lg focus:border-red-500 outline-none transition-colors" 
                                placeholder="Repita a senha"
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="pt-6 mt-6 border-t">
                        <button type="submit" disabled={loading} className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg w-full md:w-auto justify-center disabled:opacity-50">
                            <CheckCircle size={20} /> {loading ? 'Atualizando...' : 'Atualizar Senha'}
                        </button>
                    </div>
                </form>
            )}

        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
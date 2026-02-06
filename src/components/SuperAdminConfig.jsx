import React, { useState } from 'react';
import { Shield, Key, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api';

const SuperAdminConfig = () => {
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
        return setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
    }
    if (passData.new.length < 6) {
        return setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/profile/password', {
        currentPassword: passData.current,
        newPassword: passData.new
      });
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setPassData({ current: '', new: '', confirm: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao alterar senha.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50 p-6 overflow-y-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-gray-700" size={32}/> 
            Configurações do Admin
        </h1>
        <p className="text-gray-500">Gerencie sua conta de acesso mestre.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
        
        {/* Card de Segurança */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-red-50 text-[#D80000] rounded-lg">
                    <Key size={24}/>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Segurança de Acesso</h2>
                    <p className="text-xs text-gray-500">Altere sua senha periodicamente</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
                    {message.text}
                </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                    <input 
                        type="password" 
                        required
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D80000] outline-none"
                        value={passData.current}
                        onChange={e => setPassData({...passData, current: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                        <input 
                            type="password" 
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D80000] outline-none"
                            value={passData.new}
                            onChange={e => setPassData({...passData, new: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova</label>
                        <input 
                            type="password" 
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D80000] outline-none"
                            value={passData.confirm}
                            onChange={e => setPassData({...passData, confirm: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : <><Save size={18}/> Atualizar Senha</>}
                    </button>
                </div>
            </form>
        </div>

        {/* Card Informativo (Futuro) */}
        <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center opacity-75">
            <Shield size={48} className="text-gray-300 mb-4"/>
            <h3 className="text-lg font-bold text-gray-500">Mais configurações em breve</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-xs">
                Aqui você poderá configurar backups automáticos, notificações globais para as lojas e planos de assinatura.
            </p>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminConfig;
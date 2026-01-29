import { useState, useEffect } from 'react';
import { Save, Building2 } from 'lucide-react';
// ALTERAÇÃO: Importar api
import api from '../api';

const Configuracoes = () => {
  const [formData, setFormData] = useState({
    nome_loja: '', razao_social: '', cnpj: '', endereco: '', cidade: '', telefone: '', email: '', site: ''
  });

  useEffect(() => {
    // ALTERAÇÃO: api.get
    api.get('/config')
      .then(res => {
          // Garante que se vier algo null do banco, use string vazia (resolve o warning de uncontrolled input)
          const data = res.data || {};
          setFormData({
            nome_loja: data.nome_loja || '',
            razao_social: data.razao_social || '',
            cnpj: data.cnpj || '',
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            telefone: data.telefone || '',
            email: data.email || '',
            site: data.site || ''
          });
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // ALTERAÇÃO: api.put
      await api.put('/config', formData);
      alert('Dados da empresa salvos com sucesso!');
    } catch (error) {
      alert('Erro ao salvar.');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Building2 className="text-orange-500" /> Configuração da Loja
      </h1>
      <p className="text-gray-500 mb-8">Estes dados aparecerão no cabeçalho dos contratos e recibos.</p>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1"><label className="text-sm font-bold text-gray-700">Nome da Loja</label><input name="nome_loja" value={formData.nome_loja} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div className="space-y-1"><label className="text-sm font-bold text-gray-700">Razão Social</label><input name="razao_social" value={formData.razao_social} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div className="space-y-1"><label className="text-sm font-bold text-gray-700">CNPJ</label><input name="cnpj" value={formData.cnpj} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div className="space-y-1"><label className="text-sm font-bold text-gray-700">Telefone</label><input name="telefone" value={formData.telefone} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div className="md:col-span-2 space-y-1"><label className="text-sm font-bold text-gray-700">Endereço Completo</label><input name="endereco" value={formData.endereco} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div className="space-y-1"><label className="text-sm font-bold text-gray-700">Cidade/UF</label><input name="cidade" value={formData.cidade} onChange={handleChange} className="w-full p-2 border rounded" /></div>
        <div className="space-y-1"><label className="text-sm font-bold text-gray-700">Site/Instagram</label><input name="site" value={formData.site} onChange={handleChange} className="w-full p-2 border rounded" /></div>

        <div className="md:col-span-2 pt-4">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-green-700"><Save size={18} /> Salvar Configurações</button>
        </div>
      </form>
    </div>
  );
};

export default Configuracoes;
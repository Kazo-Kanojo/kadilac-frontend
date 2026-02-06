import React, { useState, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';

const ClientModal = ({ isOpen, onClose, onSave, initialData }) => {
  // Estado inicial
  const initialFormState = {
    nome: '',
    tipo: 'PF', // PF ou PJ
    categoria: 'Cliente', // <--- Novo Campo (Cliente, Vendedor, Comprador)
    cpf_cnpj: '',
    rg: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    data_cadastro: new Date().toISOString().split('T')[0],
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loadingCep, setLoadingCep] = useState(false); // Loading do ViaCEP

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        data_nascimento: initialData.data_nascimento ? initialData.data_nascimento.split('T')[0] : '',
        data_cadastro: initialData.data_cadastro ? initialData.data_cadastro.split('T')[0] : initialFormState.data_cadastro,
        estado: initialData.estado || '',
        categoria: initialData.categoria || 'Cliente' // Garante que venha preenchido na edição
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- FUNÇÃO VIACEP ---
  const checkCEP = async (e) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove traços/pontos

    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
          // Foca no campo número após preencher
          document.getElementById('numeroInput')?.focus();
        } else {
          alert("CEP não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Editar Cadastro' : 'Novo Cadastro'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Preencha os dados completos da ficha</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* --- SEÇÃO 1: CLASSIFICAÇÃO --- */}
            <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Classificação</h3>
            </div>

            {/* Tipo de Pessoa */}
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pessoa</label>
              <div className="flex gap-4">
                {['PF', 'PJ'].map((tipo) => (
                  <label key={tipo} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.tipo === tipo ? 'border-[#D80000]' : 'border-gray-300'}`}>
                      {formData.tipo === tipo && <div className="w-3 h-3 rounded-full bg-[#D80000]" />}
                    </div>
                    <input type="radio" name="tipo" value={tipo} checked={formData.tipo === tipo} onChange={handleChange} className="hidden"/>
                    <span className="text-gray-700 font-medium">{tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categoria (Novo Campo) */}
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Função / Status</label>
              <select 
                name="categoria" 
                value={formData.categoria} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent bg-white"
              >
                <option value="Cliente">Cliente (Padrão)</option>
                <option value="Comprador">Comprador</option>
                <option value="Vendedor">Vendedor</option>
              </select>
            </div>

            {/* --- SEÇÃO 2: DADOS PESSOAIS --- */}
            <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2 mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados Principais</h3>
            </div>

            <div className="md:col-span-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social <span className="text-red-500">*</span></label>
              <input
                type="text" name="nome" required value={formData.nome} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Cadastro</label>
              <input
                  type="date" name="data_cadastro" value={formData.data_cadastro} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.tipo === 'PF' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                placeholder={formData.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>

            {formData.tipo === 'PF' && (
                <>
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                        <input
                            type="text" name="rg" value={formData.rg || ''} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                        <input
                            type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                        />
                    </div>
                </>
            )}

             {/* --- SEÇÃO 3: ENDEREÇO (VIACEP) --- */}
            <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2 mt-4 flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Endereço</h3>
                {loadingCep && <span className="text-xs text-blue-600 flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Buscando CEP...</span>}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP (Busca Auto)</label>
              <div className="relative">
                <input
                    type="text" 
                    name="cep" 
                    value={formData.cep || ''} 
                    onChange={handleChange}
                    onBlur={checkCEP} // Busca ao sair do campo
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                />
                <Search size={16} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"/>
              </div>
            </div>

            <div className="md:col-span-7">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Avenida</label>
              <input
                type="text" name="endereco" value={formData.endereco} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
              />
            </div>
             
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                id="numeroInput"
                type="text" name="numero" value={formData.numero || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
              />
            </div>

            <div className="md:col-span-5">
               <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
               <input
                type="text" name="bairro" value={formData.bairro || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
              />
            </div>

            <div className="md:col-span-5">
               <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
               <input
                type="text" name="cidade" value={formData.cidade || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
              />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                <input
                    type="text" 
                    name="estado" 
                    value={formData.estado || ''} 
                    onChange={(e) => {
                        const val = e.target.value.toUpperCase().slice(0, 2);
                        setFormData(prev => ({ ...prev, estado: val }));
                    }}
                    maxLength={2} // Limite visual
                    className="w-full px-4 py-2 border border-gray-300 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] text-center font-bold"
                />
            </div>

             {/* --- SEÇÃO 4: CONTATO --- */}
            <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2 mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contato</h3>
            </div>

            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text" name="telefone" value={formData.telefone} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000]"
                placeholder="email@exemplo.com"
              />
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 text-white bg-[#D80000] hover:bg-red-700 rounded-lg transition-colors font-medium shadow-md flex items-center gap-2"
            >
              {initialData ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
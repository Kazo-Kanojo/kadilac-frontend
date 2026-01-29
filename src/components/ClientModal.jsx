import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ClientModal = ({ isOpen, onClose, onSave, initialData }) => {
  // Estado inicial vazio
  const initialFormState = {
    nome: '',
    tipo: 'PF', // PF ou PJ
    cpf_cnpj: '',
    rg: '',
    data_nascimento: '',
    email: '',
    telefone: '',
    data_cadastro: new Date().toISOString().split('T')[0], // Padrão: Hoje
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- CORREÇÃO AQUI ---
  // Quando carregamos os dados para editar, precisamos cortar a data (split)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Se existir data, pega só a parte YYYY-MM-DD (antes do T)
        data_nascimento: initialData.data_nascimento ? initialData.data_nascimento.split('T')[0] : '',
        data_cadastro: initialData.data_cadastro ? initialData.data_cadastro.split('T')[0] : initialFormState.data_cadastro,
        // Garante que estado nunca seja null/undefined
        estado: initialData.estado || ''
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              {initialData ? 'Editar Cliente' : 'Novo Cliente'}
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
            
            {/* --- SEÇÃO 1: DADOS PESSOAIS --- */}
            <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dados Principais</h3>
            </div>

            {/* Tipo de Pessoa */}
            <div className="md:col-span-12">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cliente</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.tipo === 'PF' ? 'border-[#D80000]' : 'border-gray-300'}`}>
                    {formData.tipo === 'PF' && <div className="w-3 h-3 rounded-full bg-[#D80000]" />}
                  </div>
                  <input 
                    type="radio" name="tipo" value="PF" 
                    checked={formData.tipo === 'PF'} onChange={handleChange} className="hidden"
                  />
                  <span className={`${formData.tipo === 'PF' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Pessoa Física</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.tipo === 'PJ' ? 'border-[#D80000]' : 'border-gray-300'}`}>
                    {formData.tipo === 'PJ' && <div className="w-3 h-3 rounded-full bg-[#D80000]" />}
                  </div>
                  <input 
                    type="radio" name="tipo" value="PJ" 
                    checked={formData.tipo === 'PJ'} onChange={handleChange} className="hidden"
                  />
                  <span className={`${formData.tipo === 'PJ' ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Pessoa Jurídica</span>
                </label>
              </div>
            </div>

            {/* Nome */}
            <div className="md:col-span-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social <span className="text-red-500">*</span></label>
              <input
                type="text" name="nome" required value={formData.nome} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent transition-all"
                placeholder="Ex: João da Silva ou Silva Autopeças Ltda"
              />
            </div>

            {/* Data Cadastro */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Cadastro</label>
              <div className="relative">
                 <input
                    type="date" name="data_cadastro" value={formData.data_cadastro} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Documentos */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.tipo === 'PF' ? 'CPF' : 'CNPJ'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
                placeholder={formData.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
              />
            </div>

            {/* RG e Nascimento (Apenas PF) */}
            {formData.tipo === 'PF' && (
                <>
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
                        <input
                            type="text" name="rg" value={formData.rg || ''} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento</label>
                        <input
                            type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
                        />
                    </div>
                </>
            )}

             {/* --- SEÇÃO 2: CONTATO --- */}
             <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2 mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Contato</h3>
            </div>

            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text" name="telefone" value={formData.telefone} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
                placeholder="cliente@email.com"
              />
            </div>

            {/* --- SEÇÃO 3: ENDEREÇO --- */}
            <div className="md:col-span-12 border-b border-gray-100 pb-2 mb-2 mt-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Endereço</h3>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
              <input
                type="text" name="cep" value={formData.cep || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
              />
            </div>

            <div className="md:col-span-7">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Avenida</label>
              <input
                type="text" name="endereco" value={formData.endereco} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
              />
            </div>
             
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text" name="numero" value={formData.numero || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
              />
            </div>

            <div className="md:col-span-5">
               <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
               <input
                type="text" name="bairro" value={formData.bairro || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
              />
            </div>

            <div className="md:col-span-5">
               <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
               <input
                type="text" name="cidade" value={formData.cidade || ''} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent"
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
                    placeholder="UF"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D80000] focus:border-transparent text-center font-bold"/>
                </div>

          </div>
        </form>

        {/* Footer com Botões Fixos */}
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
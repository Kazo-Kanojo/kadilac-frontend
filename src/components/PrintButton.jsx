import React, { useState, useRef, useEffect } from 'react';
import { Printer, FileText } from 'lucide-react';

const PrintButton = ({ data, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lista de documentos disponíveis por tipo
  const documents = {
    client: [
      { name: 'Procuração', file: 'procurcao.html' },
      { name: 'Declaração', file: 'declaracao.html' },
      { name: 'Ficha Cadastral', file: 'ficha.html' }
    ],
    vehicle: [
      { name: 'Recibo de Venda', file: 'Recibo_de_Venda.html' },
      { name: 'Contrato de Compra', file: 'Compra.html' },
      { name: 'Termo de Responsabilidade', file: 'Termo.html' }
    ]
  };

  const availableDocs = documents[type] || [];

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrint = async (filename) => {
    try {
      // 1. Busca o template HTML na pasta public/templates
      const response = await fetch(`/templates/${filename}`);
      if (!response.ok) throw new Error('Modelo não encontrado');
      let htmlContent = await response.text();

      // 2. Mapeamento de dados (Substitua conforme seus campos do banco)
      // Ajuste as chaves (ex: [NOME]) para bater com o que está no seu HTML
      const replacements = {
        // Dados do Cliente
        '[NOME]': data.name || '',
        '[CPF]': data.cpf || '',
        '[RG]': data.rg || '',
        '[ENDERECO]': data.address || '',
        '[NUMERO]': data.number || '',
        '[BAIRRO]': data.neighborhood || '',
        '[CIDADE]': data.city || '',
        '[TELEFONE]': data.phone || '',
        
        // Dados do Veículo
        '[MODELO]': data.model || '',
        '[MARCA]': data.brand || '',
        '[PLACA]': data.plate || '',
        '[CHASSI]': data.chassis || '',
        '[COR]': data.color || '',
        '[ANO]': data.year || '',
        '[RENAVAM]': data.renavam || '',
        '[PRECO]': data.price || '',
        
        // Data atual
        '[DATA_HOJE]': new Date().toLocaleDateString('pt-BR')
      };

      // 3. Substitui as variáveis no HTML
      Object.keys(replacements).forEach(key => {
        const regex = new RegExp(key.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g');
        htmlContent = htmlContent.replace(regex, replacements[key]);
      });

      // 4. Abre uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Aguarda carregar e chama a impressão
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

    } catch (error) {
      console.error("Erro ao gerar documento:", error);
      alert("Erro ao gerar o documento. Verifique se o modelo existe.");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="Gerar Documento"
      >
        <Printer size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
              Imprimir Documento
            </div>
            {availableDocs.map((doc, index) => (
              <button
                key={index}
                onClick={() => handlePrint(doc.file)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                role="menuitem"
              >
                <FileText size={14} />
                {doc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintButton;
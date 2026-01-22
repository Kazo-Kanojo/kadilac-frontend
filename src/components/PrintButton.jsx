import React, { useState, useRef, useEffect } from 'react';
import { Printer, FileText } from 'lucide-react';

const PrintButton = ({ data, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lista de documentos disponíveis
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
      const response = await fetch(`/templates/${filename}`);
      if (!response.ok) throw new Error('Modelo de documento não encontrado na pasta public/templates');
      let htmlContent = await response.text();

      // Formatação de valores monetários
      const formatCurrency = (val) => {
        return val ? Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
      };

      // 1. MAPEAMENTO DE DADOS (Corrigido para Português)
      // As chaves à esquerda são o que está no seu HTML (ex: [NOME])
      // Os valores à direita são o que vem do seu banco de dados (ex: data.nome)
      const replacements = {
        // --- DADOS DO CLIENTE ---
        '\\[NOME\\]': data.nome || data.name || '____________________',
        '\\[CPF\\]': data.cpf || '____________________',
        '\\[RG\\]': data.rg || '____________________',
        '\\[ENDERECO\\]': data.endereco || data.address || '____________________',
        '\\[NUMERO\\]': data.numero || data.number || '___',
        '\\[BAIRRO\\]': data.bairro || data.neighborhood || '____________________',
        '\\[CIDADE\\]': data.cidade || data.city || '____________________',
        '\\[TELEFONE\\]': data.telefone || data.phone || '____________________',
        
        // --- DADOS DO VEÍCULO ---
        '\\[MODELO\\]': (data.modelo || '').toUpperCase(),
        '\\[MARCA\\]': (data.marca || '').toUpperCase(), 
        '\\[PLACA\\]': (data.placa || '').toUpperCase(),
        '\\[CHASSI\\]': data.chassis || data.chassi || '____________________',
        '\\[COR\\]': data.cor || '__________',
        '\\[ANO\\]': data.ano || '____',
        '\\[RENAVAM\\]': data.renavam || '____________________',
        '\\[COMBUSTIVEL\\]': data.combustivel || '__________',
        
        // --- FINANCEIRO ---
        '\\[PRECO\\]': formatCurrency(data.valor || data.price),
        '\\[VALOR\\]': formatCurrency(data.valor || data.price), // Caso use [VALOR] no html
        
        // --- OUTROS ---
        '\\[DATA_HOJE\\]': new Date().toLocaleDateString('pt-BR'),
        '\\[CIDADE_LOJA\\]': 'Cotia' // Exemplo fixo
      };

      // 2. SUBSTITUIÇÃO
      // Usamos replace com RegExp global para trocar todas as ocorrências
      Object.keys(replacements).forEach(key => {
        const regex = new RegExp(key, 'g'); // A chave já tem os escapes para regex
        htmlContent = htmlContent.replace(regex, replacements[key]);
      });

      // 3. INJEÇÃO DE SCRIPT DE AUTO-IMPRESSÃO
      // Isso garante que a janela só imprima depois de carregar tudo
      const autoPrintScript = `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500); // Pequeno delay para garantir renderização
          };
        </script>
      `;
      
      // Adiciona o script antes do fim do body
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${autoPrintScript}</body>`);
      } else {
        htmlContent += autoPrintScript;
      }

      // 4. ABERTURA DA JANELA
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close(); // Importante: finaliza o stream de escrita
      } else {
        alert("Pop-up bloqueado. Por favor, permita pop-ups para este site.");
      }

    } catch (error) {
      console.error("Erro ao gerar documento:", error);
      alert("Erro ao abrir o modelo. Verifique se o arquivo HTML existe em 'public/templates/'.");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors group"
        title="Gerar Documento"
      >
        <Printer size={20} className="mb-1"/>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 animate-fade-in">
          <div className="py-1" role="menu">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
              Selecionar Documento
            </div>
            {availableDocs.map((doc, index) => (
              <button
                key={index}
                onClick={() => handlePrint(doc.file)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 border-b last:border-0 transition-colors"
                role="menuitem"
              >
                <FileText size={16} />
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
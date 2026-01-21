/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from 'react';
import { X, Printer, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../api';

const DocumentViewer = ({ saleId, onClose, type = 'recibo' }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/vendas/${saleId}/print`);
        
        // Se der erro 500 ou 404, lança exceção para cair no catch
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Erro do servidor: ${res.status}`);
        }

        const json = await res.json();
        
        // Validação extra: garante que os dados essenciais vieram
        if (!json.loja || !json.venda) {
            throw new Error("Dados da loja ou venda incompletos.");
        }

        setData(json);
      } catch (err) {
        console.error("Erro ao carregar documento:", err);
        setError(err.message);
      }
    };
    fetchData();
  }, [saleId]);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Imprimir</title>');
    win.document.write(`
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap');
        body { font-family: 'Roboto Mono', monospace; margin: 0; padding: 20px; color: #333; }
        .page { width: 210mm; margin: 0 auto; background: white; padding: 20px; border: 1px solid #eee; }
        @media print { 
            body { padding: 0; background: white; }
            .page { border: none; width: 100%; margin: 0; padding: 0; }
            button { display: none; }
        }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 12px; }
        .title { text-align: center; font-size: 18px; font-weight: bold; margin: 30px 0; text-decoration: underline; }
        .section { margin-bottom: 20px; line-height: 1.6; font-size: 14px; text-align: justify; }
        .field { font-weight: bold; }
        .signatures { margin-top: 100px; display: flex; justify-content: space-between; }
        .sig-block { width: 45%; text-align: center; border-top: 1px solid #000; padding-top: 10px; font-size: 12px; }
        .obs-box { border: 1px dashed #999; padding: 10px; margin-top: 20px; font-size: 12px; background: #f9f9f9; }
      </style>
    `);
    win.document.write('</head><body>');
    win.document.write(content);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  // Renderização de Erro
  if (error) {
      return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-red-600" size={24}/>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Erro ao Gerar Documento</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={onClose} className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 w-full">
                    Fechar
                </button>
            </div>
        </div>
      );
  }

  // Renderização de Carregamento
  if (!data) {
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            Gerando documento...
        </div>
      );
  }

  const { venda, loja } = data;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl p-4 rounded-t-lg flex justify-between items-center">
        <h2 className="font-bold text-gray-700">Visualizar Impressão: {type.toUpperCase()}</h2>
        <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
                <Printer size={18} /> Imprimir
            </button>
            <button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                <X size={18} />
            </button>
        </div>
      </div>

      <div className="bg-gray-100 w-full max-w-4xl h-[80vh] overflow-y-auto p-8 rounded-b-lg flex justify-center">
        <div ref={printRef} className="bg-white shadow-lg p-10 max-w-[210mm] min-h-[297mm] text-black">
            
            <div className="page">
                <div className="header">
                    {/* Proteção contra dados nulos com || '' */}
                    <h1>{loja.nome_loja || 'Nome da Loja'}</h1>
                    <p>{loja.endereco || ''} - {loja.cidade || ''}</p>
                    <p>CNPJ: {loja.cnpj || ''} | Tel: {loja.telefone || ''}</p>
                </div>

                <div className="title">RECIBO DE VENDA DE VEÍCULO</div>

                <div className="section">
                    <p>
                        Recebemos de <span className="field">{venda.nome}</span>, 
                        inscrito(a) no CPF/CNPJ sob nº <span className="field">{venda.cpf_cnpj}</span>, 
                        residente em <span className="field">{venda.cli_endereco || '____________________'}</span>, 
                        a importância supramencionada referente à venda do veículo abaixo descrito:
                    </p>
                </div>

                <div className="section" style={{border: '1px solid #ddd', padding: '15px'}}>
                    <p><strong>Veículo:</strong> {venda.modelo}</p>
                    <p><strong>Placa:</strong> {venda.placa} / <strong>Cor:</strong> {venda.cor}</p>
                    <p><strong>Ano:</strong> {venda.ano} / <strong>Combustível:</strong> {venda.combustivel}</p>
                    <p><strong>Chassi:</strong> {venda.chassi}</p>
                    <p><strong>Renavam:</strong> {venda.renavam}</p>
                </div>

                <div className="section">
                    <p><strong>Valor Total da Venda:</strong> R$ {parseFloat(venda.valor_venda || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    <p><strong>Forma de Pagamento:</strong> {venda.metodo_pagamento}</p>
                    {parseFloat(venda.entrada) > 0 && (
                        <p><strong>Entrada:</strong> R$ {parseFloat(venda.entrada).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    )}
                    {parseFloat(venda.financiado) > 0 && (
                        <p><strong>Valor Financiado:</strong> R$ {parseFloat(venda.financiado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    )}
                </div>

                <div className="section obs-box">
                    <strong>Observações:</strong><br/>
                    {venda.observacoes || "Nenhuma observação adicional."}
                    <br/><br/>
                    <small>O veículo é entregue no estado em que se encontra, tendo o comprador examinado o mesmo.</small>
                </div>

                <div className="section" style={{textAlign: 'center', marginTop: '40px'}}>
                    {loja.cidade || 'Cidade'}, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
                </div>

                <div className="signatures">
                    <div className="sig-block">
                        <strong>{loja.razao_social || loja.nome_loja || 'Vendedor'}</strong><br/>
                        Vendedor
                    </div>
                    <div className="sig-block">
                        <strong>{venda.nome}</strong><br/>
                        Comprador
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
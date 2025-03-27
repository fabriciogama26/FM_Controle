import * as XLSX from 'xlsx';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = forwardRef(({ onDataExtracted, onError, setLoading }, ref) => {
  
  const formatExcelDate  = (excelDate) => {
    if (!excelDate) return '';
    
    // Se já estiver no formato DD/MM/YYYY
    if (typeof excelDate === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(excelDate)) {
      const [day, month, year] = excelDate.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Se for número (formato Excel)
    if (typeof excelDate === 'number') {
      try {
        const date = new Date((excelDate - (25567 + 1)) * 86400 * 1000);
        date.setHours(12, 0, 0, 0); // Fixa no meio do dia para evitar problemas de fuso horário
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      } catch {
        return '';
      }
    }
    
    // // Se for string com formato DD/MM/YYYY (já está no formato brasileiro)
    // if (typeof excelDate === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(excelDate)) {
    //   return excelDate;
    // }
    
    return '';
  };

  // Função para formatar valor como monetário (R$)
  // const formatToBrazilianCurrency = (value) => {
  //   return new Intl.NumberFormat('pt-BR', {
  //     style: 'currency',
  //     currency: 'BRL'
  //   }).format(value || 0);
  // };

  // const isValidBrazilianDate = (dateStr) => {
  //   return dateStr && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr);
  // };

  const calcularPendencia = (valor) => {
    if (valor > 10000) return 'Análise gerencial necessária';
    if (valor > 5000) return 'Aprovação pendente';
    return 'Sem pendência';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    onError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileData = new Uint8Array(event.target.result);
        const workbook = XLSX.read(fileData, { type: 'array' });

        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('folha') || 
          name.toLowerCase().includes('medição')
        ) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        console.log("[DEBUG] Dados brutos da planilha:", rawData);

        const extractedData = rawData
          .slice(0, 100)
          .filter((row, index) => index > 0 && Array.isArray(row))
          .map(row => {
            const limitedRow = row.slice(0, 16);
            
            const findValue = (keywords) => {
              for (let i = 0; i < limitedRow.length; i++) {
                const cell = limitedRow[i];
                if (!cell) continue;
                
                const cellStr = cell.toString().toLowerCase();
                if (keywords.some(kw => cellStr.includes(kw.toLowerCase()))) {
                  for (let j = i + 1; j < limitedRow.length; j++) {
                    const nextVal = limitedRow[j];
                    if (nextVal !== null && nextVal !== undefined && nextVal !== '') {
                      return nextVal;
                    }
                  }
                }
              }
              return null;
            };

            // Extrair FM
            const fmRaw = findValue(['registro ( nº fm):', 'nº fm', 'fm:']);
            const fm = fmRaw ? parseInt(fmRaw.toString().replace(/\D/g, '')) || 0 : 0;

            // Extrair Projeto
            const projetoRaw = findValue(['projeto:', 'projeto']);
            const projeto = projetoRaw?.toString().trim() || '';

            // Extrair Valor e formatar como monetário
            const valorRaw = findValue(['Total:', 'total']);
            const valor = valorRaw ? parseFloat(valorRaw.toString().replace(',', '.')) || 0 : 0;
            // const valor = formatToBrazilianCurrency(valorNum);

            // Extrair Data e formatar no padrão brasileiro
            const dataRaw = findValue(['data:', 'data']);
            const dataExecucao = dataRaw ? formatExcelDate(dataRaw) : '';
            // let dataExecucao = '';
            // if (dataRaw) {
            //   const formatted = formatToBrazilianDate(dataRaw);
            //   dataExecucao = isValidBrazilianDate(formatted) ? formatted : '';
            // }

            return {
              projeto: projeto,
              fm: fm,
              dataExecucao: dataExecucao,
              valor: valor,
              contrato: projeto.match(/(\d{4,})/)?.[0] || '',
              pendencia: calcularPendencia(valor),
              dataEnvio: formatExcelDate(new Date()), // Data atual formatada
              dataCorrecao: '',
              status: valor > 10000 ? 'Prioridade' : 'Pendente'
            };
          })
          .filter(item => {
            return item.fm > 0 || item.projeto || item.valor > 0 || item.dataExecucao;
          });
        console.log("[DEBUG] Dados processados para o DB:", extractedData);
        onDataExtracted(extractedData);
      } catch (error) {
        onError(`Erro ao processar arquivo: ${error.message}`);
        console.error('Erro detalhado:', error);
      } finally {
        setLoading(false);
        // Limpa o valor do input para permitir nova seleção
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <input 
      type="file"
      ref={ref}
      onChange={handleFileUpload}
      accept=".xlsx, .xls"
      style={{ display: 'none' }}
    />
  );
});

FileUpload.displayName = 'FileUpload';

FileUpload.propTypes = {
  onDataExtracted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired
};

export default FileUpload;
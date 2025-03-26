import * as XLSX from 'xlsx';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = forwardRef(({ onDataExtracted, onError, setLoading }, ref) => {
  // Função melhorada para validar e formatar datas
  const formatExcelDate = (excelDate) => {
    if (!excelDate) return '';
    
    // Se já for uma data no formato YYYY-MM-DD
    if (typeof excelDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
      return excelDate;
    }
    
    // Se for número (formato Excel)
    if (typeof excelDate === 'number') {
      try {
        const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
        const isoDate = date.toISOString().split('T')[0];
        return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : '';
      } catch {
        return '';
      }
    }
    
    // Se for string com formato DD/MM/YYYY
    if (typeof excelDate === 'string') {
      // Remove textos indesejados como "Matrícula Light:"
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(excelDate.trim())) return '';
      
      const parts = excelDate.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    
    return '';
  };

  const isValidDate = (dateString) => {
    return dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  };

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

        // Busca por aba que contenha "Folha" ou "Medição"
        const sheetName = workbook.SheetNames.find(name => 
          name.toLowerCase().includes('folha') || 
          name.toLowerCase().includes('medição')
        ) || workbook.SheetNames[0];

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

        console.log("[DEBUG] Dados brutos da planilha:", rawData);

        const extractedData = rawData
          .slice(0, 100) // Limita às primeiras 100 linhas
          .filter((row, index) => index > 0 && Array.isArray(row)) // Ignora cabeçalho
          .map(row => {
            const limitedRow = row.slice(0, 16); // Colunas A-P
            
            // Função auxiliar para encontrar valores após palavras-chave
            const findValue = (keywords) => {
              for (let i = 0; i < limitedRow.length; i++) {
                const cell = limitedRow[i];
                if (!cell) continue;
                
                const cellStr = cell.toString().toLowerCase();
                if (keywords.some(kw => cellStr.includes(kw.toLowerCase()))) {
                  // Encontrou a palavra-chave, procura o próximo valor válido
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

            // Extrair Valor
            const valorRaw = findValue(['total', 'valor total']);
            const valor = valorRaw ? parseFloat(valorRaw.toString().replace(',', '.')) || 0 : 0;

            // Extrair Data com validação
            const dataRaw = findValue(['data:', 'data']);
            let dataExecucao = '';
            if (dataRaw) {
              const formatted = formatExcelDate(dataRaw);
              dataExecucao = isValidDate(formatted) ? formatted : '';
            }

            return {
              projeto,
              fm,
              dataExecucao,
              valor,
              contrato: projeto.match(/(\d{4,})/)?.[0] || '',
              pendencia: calcularPendencia(valor),
              dataEnvio: '',
              dataCorrecao: '',
              status: valor > 10000 ? 'Prioridade' : 'Pendente'
            };
          })
          .filter(item => {
            // Filtra itens com pelo menos um campo válido
            return item.fm > 0 || item.projeto || item.valor > 0 || isValidDate(item.dataExecucao);
          });

        console.log("[DEBUG] Dados processados para o DB:", extractedData);
        onDataExtracted(extractedData);
      } catch (error) {
        onError(`Erro ao processar arquivo: ${error.message}`);
        console.error('Erro detalhado:', error);
      } finally {
        setLoading(false);
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
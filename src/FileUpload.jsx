import * as XLSX from 'xlsx';
import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = forwardRef(({ onDataExtracted, onError, setLoading }, ref) => {
  const formatExcelDate = (excelDate) => {
    if (!excelDate) return '';
    
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - (25567 + 2)) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    if (typeof excelDate === 'string') {
      const parts = excelDate.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return excelDate;
    }
    
    return '';
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

        const sheetName = "Folha de Medição";
        if (!workbook.SheetNames.includes(sheetName)) {
          throw new Error(`A aba "${sheetName}" não foi encontrada no arquivo.`);
        }

        const sheet = workbook.Sheets[sheetName];

        console.log("[DEBUG] Dados brutos da planilha:", XLSX.utils.sheet_to_json(sheet, { header: 1 }));
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Processamento direto dos dados (função incorporada)
        const extractedData = rawData
          .filter((row, index) => index > 0 && row.length > 0)
          .map(row => ({
            projeto: row[1]?.toString()?.trim() || '',
            fm: Number(row[2]) || 0,
            dataExecucao: formatExcelDate(row[3]),
            valor: parseFloat(row[4]) || 0,
            contrato: '',
            pendencia: calcularPendencia(parseFloat(row[4]) || 0),
            dataEnvio: '',
            dataCorrecao: '',
            status: 'Pendente'
          }));
        
        
        console.log("[DEBUG] Dados processados para o DB:", extractedData);
        

        onDataExtracted(extractedData);
      } catch (error) {
        onError(error.message);
        console.error('Erro ao processar arquivo:', error);
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
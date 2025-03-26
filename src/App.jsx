import './App.css';
import { useState, useRef } from 'react';
import Cabecario from './Cabecario';
import FileUpload from './FileUpload';
import Tabela from './Tabela';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleCabecarioUpload = () => {
    fileInputRef.current?.click(); // Isso acionará o input file escondido
  };

  const handleDataExtracted = (extractedData) => {
    setData(extractedData);
    setError(null);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleReset = () => {
    setData([]);
    setError(null);
  };

  return (
    <div className="app-container">
      <Cabecario onUploadClick={handleCabecarioUpload} />
      
      <div className="content-container">
        {/* FileUpload agora é completamente invisível */}
        <FileUpload 
          ref={fileInputRef}
          onDataExtracted={handleDataExtracted}
          onError={handleUploadError}
          setLoading={setLoading}
          style={{ display: 'none' }}
        />
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            Processando arquivo...
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
            <button onClick={handleReset} className="reset-button">
              Tentar novamente
            </button>
          </div>
        )}
        
        <div className="table-container">
          {data.length > 0 && (
            <div className="summary">
              {data.length} registros carregados | Última atualização: {new Date().toLocaleString()}
            </div>
          )}
          <Tabela data={data} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default App;
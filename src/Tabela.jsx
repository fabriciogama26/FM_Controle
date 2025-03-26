import { useState, useEffect } from 'react';
import PropTypes from "prop-types";

const Tabela = ({ initialData  = [] }) => {
  const [data, setData] = useState(initialData);
  const [selectedFilter, setSelectedFilter] = useState('Last 7 days');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Busca dados do servidor quando os filtros mudam
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/dados?search=${encodeURIComponent(searchQuery)}&filter=${selectedFilter}`
        );
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        
        const serverData = await response.json();
        setData(serverData);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    // Se não houver initialData, busca do servidor
    if (initialData.length === 0) {
      fetchData();
    }
  }, [searchQuery, selectedFilter, initialData]);

  // Filtragem local se houver initialData
  const filteredData = initialData.length > 0 
    ? applyFilters(initialData, searchQuery, selectedFilter)
    : applyFilters(data, searchQuery, selectedFilter);

  function applyFilters(dataToFilter, query, filter) {
    return dataToFilter.filter((item) => {
      const searchMatch =
        item.contrato?.toLowerCase().includes(query.toLowerCase()) ||
        item.projeto?.toLowerCase().includes(query.toLowerCase()) ||
        item.fm?.toString().includes(query);

      const filterMatch = shouldIncludeByDateFilter(item.dataExecucao, filter);
      
      return searchMatch && filterMatch;
    });
  }

  function shouldIncludeByDateFilter(dateString, filter) {
    if (!dateString) return false;
    
    const currentDate = new Date();
    const dateExecuted = new Date(dateString);
    const diffTime = currentDate - dateExecuted;

    switch(filter) {
      case 'Last day': return diffTime <= 86400000; // 1 dia em ms
      case 'Last 7 days': return diffTime <= 604800000; // 7 dias em ms
      case 'Last 30 days': return diffTime <= 2592000000; // 30 dias em ms
      case 'Last month': 
        return currentDate.getMonth() === dateExecuted.getMonth() && 
               currentDate.getFullYear() === dateExecuted.getFullYear();
      case 'Last year': 
        return currentDate.getFullYear() === dateExecuted.getFullYear();
      default: return true;
    }
  }

  return (
    <div className="tabela-component">
      <div className="tabela-container relative overflow-auto shadow-md sm:rounded-lg h-[400px]">
        {/* Barra de Pesquisa e Filtros */}
        <div className="tabela-filter-container flex flex-wrap justify-between items-center pb-4">
          <div className="relative">
            <input 
              type="text" 
              className="tabela-search-input block p-2 pl-10 text-sm border rounded-md" 
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <svg className="icon-search" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </div>

          <select
            className="dropdown-button p-2 border rounded-md"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="Last day">Último dia</option>
            <option value="Last 7 days">Últimos 7 dias</option>
            <option value="Last 30 days">Últimos 30 dias</option>
            <option value="Last month">Último mês</option>
            <option value="Last year">Último ano</option>
          </select>
        </div>

        {/* Mensagens de estado */}
        {isLoading && <div className="loading-message">Carregando...</div>}
        {error && <div className="error-message">{error}</div>}

        {/* Tabela de Dados */}
        <table className="tabela-table w-full text-sm text-left border-collapse">
          <thead className="tabela-header text-xs uppercase bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3">Contrato</th>
              <th className="px-6 py-3">Projeto</th>
              <th className="px-6 py-3">FM</th>
              <th className="px-6 py-3">Data Execução</th>
              <th className="px-6 py-3">Valor</th>
              <th className="px-6 py-3">Pendência</th>
              <th className="px-6 py-3">Data Envio</th>
              <th className="px-6 py-3">Data Correção</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="tabela-body">
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  <td className="px-6 py-4">{row.contrato}</td>
                  <td className="px-6 py-4">{row.projeto}</td>
                  <td className="px-6 py-4">{row.fm}</td>
                  <td className="px-6 py-4">{formatDate(row.dataExecucao)}</td>
                  <td className="px-6 py-4">{formatCurrency(row.valor)}</td>
                  <td className="px-6 py-4">{row.pendencia || '-'}</td>
                  <td className="px-6 py-4">{formatDate(row.dataEnvio)}</td>
                  <td className="px-6 py-4">{formatDate(row.dataCorrecao)}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${row.status?.toLowerCase()}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center">
                  {isLoading ? 'Carregando...' : 'Nenhum dado encontrado'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Funções auxiliares para formatação
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

Tabela.propTypes = {
  initialData: PropTypes.arrayOf(
    PropTypes.shape({
      contrato: PropTypes.string,
      projeto: PropTypes.string,
      fm: PropTypes.number,
      dataExecucao: PropTypes.string,
      valor: PropTypes.number,
      pendencia: PropTypes.string,
      dataEnvio: PropTypes.string,
      dataCorrecao: PropTypes.string,
      status: PropTypes.string,
    })
  ),
};

export default Tabela;
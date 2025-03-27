import { useState, useEffect, useCallback } from 'react';
import PropTypes from "prop-types";

const Tabela = ({ initialData = [] }) => {
  const [data, setData] = useState(initialData);
  const [selectedFilter, setSelectedFilter] = useState('Last 7 days');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Função de fetch com tratamento de erros melhorado
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dados?filter=${selectedFilter}`);
      
      // Verificação mais robusta do tipo de conteúdo
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const serverData = await response.json();
      setData(serverData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError(err.message.includes('Resposta inválida') 
        ? 'Servidor retornou resposta inesperada'
        : 'Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter]);

  // Efeito para atualização automática (5 minutos)
  useEffect(() => {
    let intervalId;
    let isMounted = true;

    const fetchDataIfNeeded = () => {
      if (isMounted && initialData.length === 0) {
        fetchData();
      }
    };

    // Busca imediata se necessário
    fetchDataIfNeeded();

    // Configura intervalo para atualização periódica
    intervalId = setInterval(fetchDataIfNeeded, 300000); // 5 minutos

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchData, initialData.length]);

  // Filtragem local dos dados
  const filteredData = applyFilters(
    initialData.length > 0 ? initialData : data, 
    searchQuery, 
    selectedFilter
  );

  // Função auxiliar para aplicar filtros
  function applyFilters(dataToFilter, query, filter) {
    return dataToFilter.filter((item) => {
      const matchesSearch = 
        item.contrato?.toLowerCase().includes(query.toLowerCase()) ||
        item.projeto?.toLowerCase().includes(query.toLowerCase()) ||
        item.fm?.toString().includes(query);

      const matchesFilter = shouldIncludeByDateFilter(item.dataExecucao, filter);
      
      return matchesSearch && matchesFilter;
    });
  }

  // Função auxiliar para filtrar por data
  function shouldIncludeByDateFilter(dateString, filter) {
    if (!dateString) return false;
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;

    switch(filter) {
      case 'Last day': return diffMs <= 86400000;
      case 'Last 7 days': return diffMs <= 604800000;
      case 'Last 30 days': return diffMs <= 2592000000;
      case 'Last month': 
        return now.getMonth() === date.getMonth() && 
               now.getFullYear() === date.getFullYear();
      case 'Last year': return now.getFullYear() === date.getFullYear();
      default: return true;
    }
  }

  return (
    <div className="tabela-component">
      {/* Indicador de última atualização */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 mb-2">
          Última atualização: {formatDateTime(lastUpdate)}
        </div>
      )}

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

      {/* Feedback de status */}
      {isLoading && (
        <div className="loading-message p-2 text-center text-blue-500">
          Carregando dados...
        </div>
      )}
      {error && (
        <div className="error-message p-2 text-center text-red-500">
          {error} {isLoading ? '' : '(Tente recarregar a página)'}
        </div>
      )}

        {/* Tabela de Dados */}
        <table className="tabela-table w-full text-sm text-left border-collapse">
          <thead className="tabela-header text-xs uppercase bg-gray-50">
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
          <tbody className="tabela-body divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{row.contrato || '-'}</td>
                  <td className="px-6 py-4">{row.projeto || '-'}</td>
                  <td className="px-6 py-4">{row.fm || '-'}</td>
                  <td className="px-6 py-4">{formatDate(row.dataExecucao)}</td>
                  <td className="px-6 py-4">{formatCurrency(row.valor)}</td>
                  <td className="px-6 py-4">{row.pendencia || '-'}</td>
                  <td className="px-6 py-4">{formatDate(row.dataEnvio)}</td>
                  <td className="px-6 py-4">{formatDate(row.dataCorrecao)}</td>
                  <td className="px-6 py-4">
                    <span className={`status-badge ${getStatusClass(row.status)}`}>
                      {row.status || '-'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
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

// Funções auxiliares
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('pt-BR');
}

function formatCurrency(value) {
  if (value === undefined || value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function getStatusClass(status) {
  if (!status) return '';
  switch(status.toLowerCase()) {
    case 'aprovado': return 'bg-green-100 text-green-800';
    case 'pendente': return 'bg-yellow-100 text-yellow-800';
    case 'rejeitado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
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
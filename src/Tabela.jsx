import { useState } from 'react';
import PropTypes from "prop-types";

const Tabela = ({ data }) => {
  const [selectedFilter, setSelectedFilter] = useState('Last 7 days');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtragem dos dados com base na pesquisa e no filtro selecionado
  const filteredData = data.filter((item) => {
    const searchMatch =
      item.contrato?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projeto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fm?.toString().includes(searchQuery);

    const filterMatch = (filter) => {
      const currentDate = new Date();
      const dateExecuted = new Date(item.dataExecucao);
      const diffTime = currentDate - dateExecuted;

      if (filter === 'Last 7 days') return diffTime <= 7 * 24 * 60 * 60 * 1000;
      if (filter === 'Last 30 days') return diffTime <= 30 * 24 * 60 * 60 * 1000;
      if (filter === 'Last month') return currentDate.getMonth() === dateExecuted.getMonth();
      if (filter === 'Last year') return currentDate.getFullYear() === dateExecuted.getFullYear();
      if (filter === 'Last day') return diffTime <= 1 * 24 * 60 * 60 * 1000;

      return true;
    };

    return searchMatch && filterMatch(selectedFilter);
  });

  return (
        <div className="tabela-component">
          <div className="tabela-container relative overflow-auto shadow-md sm:rounded-lg h-[400px]">
            
            {/* Barra de Pesquisa e Filtros */}
            <div className="tabela-filter-container flex flex-wrap justify-between items-center pb-4">
              {/* Campo de Busca */}
              <div className="relative">
                <input 
                  type="text" 
                  className="tabela-search-input block p-2 pl-10 text-sm border rounded-md" 
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* Ícone de Pesquisa */}
                <svg className="icon-search" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                </svg>
              </div>
        

          {/* Dropdown de Filtros */}
          <select
            className="dropdown-button p-2 border rounded-md"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="Last day">Último dia</option>
            <option value="Last 7 days">Últimos 7 dias</option>
            <option value="Last 30 days">Últimos 30 dias</option>
            <option value="Last month">Último mês</option>
            <option value="Last year">Último ano</option>
          </select>
        </div>

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
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                <td className="px-6 py-4">{row.contrato}</td>
                <td className="px-6 py-4">{row.projeto}</td>
                <td className="px-6 py-4">{row.fm}</td>
                <td className="px-6 py-4">{row.dataExecucao}</td>
                <td className="px-6 py-4">{row.valor}</td>
                <td className="px-6 py-4">{row.pendencia}</td>
                <td className="px-6 py-4">{row.dataEnvio}</td>
                <td className="px-6 py-4">{row.dataCorrecao}</td>
                <td className="px-6 py-4">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

// Validação das props
Tabela.propTypes = {
  data: PropTypes.arrayOf(
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
  ).isRequired,
};

export default Tabela;

import { useState } from 'react';

const Tabela = () => {
  const [selectedFilter, setSelectedFilter] = useState('Last 7 days');
  
  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  return (
    <div className="tabela-component">
      
      {/* Início da Tabela Container */}
      <div className="tabela-container relative overflow-x-auto shadow-md sm:rounded-lg">
        
        {/* Início do Filtro (Busca e Dropdown) */}
        <div className="tabela-filter-container flex flex-col sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          
          {/* Filtro de Busca */}
          <label htmlFor="table-search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="icon-search" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input type="text" id="table-search" className="tabela-search-input block p-2 pl-10 text-sm" placeholder="Buscar..."/>
          </div>

          {/* Filtro Dropdown (Seleção de Períodos) */}
          <div className="tabela-filter-dropdown relative">
            <button id="dropdownRadioButton" className="dropdown-button inline-flex items-center text-sm font-medium">
              {selectedFilter}
              <svg className="icon-dropdown" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>
            <div id="dropdownRadio" className="dropdown-menu z-10 hidden w-48">
              <ul className="p-3 space-y-1 text-sm">
                {['Last day', 'Last 7 days', 'Last 30 days', 'Last month', 'Last year'].map((filter) => (
                  <li key={filter}>
                    <div className="filter-item flex items-center p-2 rounded-sm">
                      <input 
                        id={`filter-radio-${filter}`}
                        type="radio"
                        value={filter}
                        name="filter-radio"
                        className="filter-radio w-4 h-4"
                        checked={selectedFilter === filter}
                        onChange={handleFilterChange}
                      />
                      <label htmlFor={`filter-radio-${filter}`} className="filter-label text-sm">
                        {filter}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Fim do Filtro */}

        {/* Início da Tabela de Dados */}
        <table className="tabela-table w-full text-sm text-left">
          <thead className="tabela-header text-xs uppercase">
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
            <tr>
              <td className="px-6 py-4">Example Contract</td>
              <td className="px-6 py-4">Example Project</td>
              <td className="px-6 py-4">12345</td>
              <td className="px-6 py-4">01/01/2025</td>
              <td className="px-6 py-4">$1000</td>
              <td className="px-6 py-4">No</td>
              <td className="px-6 py-4">02/01/2025</td>
              <td className="px-6 py-4">03/01/2025</td>
              <td className="px-6 py-4">Pending</td>
            </tr>
          </tbody>
        </table>
        {/* Fim da Tabela de Dados */}

      </div>
      {/* Fim da Tabela Container */}
    </div>
  );
};

export default Tabela;

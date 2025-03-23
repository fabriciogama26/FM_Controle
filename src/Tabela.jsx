import { useState } from 'react';

const Tabela = () => {
  const [selectedFilter, setSelectedFilter] = useState('Last 7 days');
  
  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <div className="flex flex-col sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
        <label htmlFor="table-search" className="sr-only">Search</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <input type="text" id="table-search" className="block p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar..."/>
        </div>
        {/* Filter Dropdown */}
        <div className="relative">
          <button id="dropdownRadioButton" className="inline-flex items-center text-sm font-medium  bg-gray-700 divide-y text-gray-500  dark:text-gray-400">
            {selectedFilter}
            <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
            </svg>
          </button>
          <div id="dropdownRadio" className="z-10 hidden w-48 bg-gray-700 divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600">
            <ul className="p-3 space-y-1 text-sm text-gray-700 dark:text-gray-500">
              {['Last day', 'Last 7 days', 'Last 30 days', 'Last month', 'Last year'].map((filter) => (
                <li key={filter}>
                  <div className="flex items-center p-2 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                    <input 
                      id={`filter-radio-${filter}`}
                      type="radio"
                      value={filter}
                      name="filter-radio"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      checked={selectedFilter === filter}
                      onChange={handleFilterChange}
                    />
                    <label htmlFor={`filter-radio-${filter}`} className="w-full ms-2 text-sm font-medium text-gray-900 rounded-sm dark:text-gray-300">
                      {filter}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
      </table>
    </div>
  );
};

export default Tabela;

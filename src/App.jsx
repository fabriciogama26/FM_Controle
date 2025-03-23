import './App.css'; // Importando o CSS específico do App
import Cabecario from './Cabecario'; // Seu componente Cabecario
import Tabela from './Tabela'; // Seu componente Tabela

function App() {
  return (
    <div className="app-container">
      <Cabecario />
      <Tabela />
      <button className="app-button">Clique Aqui</button>
    </div>
  );
}

export default App;

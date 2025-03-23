import logo from './assets/logo.png'; // Importe as imagens corretamente
import light from './assets/light.jpg';
import excelIcon from './assets/excel_icon.webp';

const Cabecario = () => {
  return (
    <div className="cabecario-component">
      {/* Linha com Logo à esquerda, Texto centralizado e Logo à direita */}
      <div className="cabecario-header">
        {/* Logo à esquerda */}
        <div className="cabecario-logo-left">
          <img src={logo} alt="Logo Esquerda" className="logo" />
        </div>

        {/* Texto centralizado */}
        <div className="cabecario-title">
          <h1>CONTROLE DE FOLHA DE MEDIÇÃO</h1>
        </div>

        {/* Logo à direita */}
        <div className="cabecario-logo-right">
          <img src={light} alt="Logo Direita" className="logo" />
        </div>
      </div>

      {/* Texto "Controle de Medição" e Botão de Excel alinhados à esquerda */}
      <div className="cabecario-footer">
        <p>Controle de Medição</p>
        <button className="excel-button">
          <img src={excelIcon} alt="Ícone de Excel" className="excel-icon" />
          Importar FM
        </button>
      </div>
    </div>
  );
};

export default Cabecario;

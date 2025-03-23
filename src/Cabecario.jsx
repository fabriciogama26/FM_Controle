import logo from './assets/logo.png'; 
import light from './assets/light.jpg';
import excelIcon from './assets/excel_icon.webp';
import PropTypes from "prop-types";

const Cabecario = ({ onFileUpload }) => {
  return (
    <div className="cabecario-component">
      {/* Linha com Logo à esquerda, Texto centralizado e Logo à direita */}
      <div className="cabecario-header">
        <div className="cabecario-logo-left">
          <img src={logo} alt="Logo Esquerda" className="logo" />
        </div>

        <div className="cabecario-title">
          <h1>CONTROLE DE FOLHA DE MEDIÇÃO</h1>
        </div>

        <div className="cabecario-logo-right">
          <img src={light} alt="Logo Direita" className="logo" />
        </div>
      </div>

      {/* Botão de Importação de Excel */}
      <div className="cabecario-footer">
        <p>Controle de Medição</p>
        <label className="excel-button">
          <input type="file" accept=".xlsx, .xls" hidden onChange={onFileUpload} />
          <img src={excelIcon} alt="Ícone de Excel" className="excel-icon" />
          Importar FM
        </label>
      </div>
    </div>
  );
};

// Validação das props
Cabecario.propTypes = {
  onFileUpload: PropTypes.func.isRequired, // Confirma que é uma função obrigatória
};


export default Cabecario;

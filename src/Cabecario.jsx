import PropTypes from 'prop-types';
import logo from './assets/logo.png'; 
import light from './assets/light.jpg';
import excelIcon from './assets/excel_icon.webp';

const Cabecario = ({ onUploadClick }) => { // Nova prop
  return (
    <div className="cabecario-component">
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

      <div className="cabecario-footer">
        <p>Controle de Medição</p>
        <button 
          className="excel-button"
          onClick={onUploadClick} // Aciona a função passada como prop
        >
          <img src={excelIcon} alt="Ícone de Excel" className="excel-icon" />
          Importar FM
        </button>
      </div>
    </div>
  );
};

Cabecario.propTypes = {
  onUploadClick: PropTypes.func.isRequired // Validação da nova prop
};

export default Cabecario;
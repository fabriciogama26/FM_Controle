import './App.css'; // Importando o CSS específico do App
import { useState } from "react";
import * as XLSX from "xlsx";
import Cabecario from "./Cabecario";
import Tabela from "./Tabela";

function App() {
  const [data, setData] = useState([]); // Estado para armazenar os dados do Excel

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryData = new Uint8Array(e.target.result);
      const workbook = XLSX.read(binaryData, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setData(jsonData); // Atualiza os dados
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="app-container">
      <Cabecario onFileUpload={handleFileUpload} />
      <Tabela data={data} />
    </div>
  );
}

export default App;

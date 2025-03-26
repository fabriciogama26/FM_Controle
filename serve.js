/* global process */
import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cria ou abre o banco de dados SQLite
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Banco de dados SQLite conectado com sucesso');
    initializeDatabase();
  }
});

// Inicializa o banco de dados com a tabela necessária
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato TEXT,
    projeto TEXT,
    fm INTEGER,
    dataExecucao TEXT,
    valor REAL,
    pendencia TEXT,
    dataEnvio TEXT,
    dataCorrecao TEXT,
    status TEXT
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
    } else {
      console.log('Tabela verificada/criada com sucesso');
    }
  });
}

// Middleware para tratamento de erros
app.use((err, req, res, ) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});


// Rota para salvar os dados extraídos do Excel
app.post('/api/upload', (req, res) => {
  try {
    const data = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Dados devem ser um array' });
    }

    // Inicia uma transação para melhor performance em múltiplas inserções
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      const stmt = db.prepare('INSERT INTO data (contrato, projeto, fm, dataExecucao, valor, pendencia, dataEnvio, dataCorrecao, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      
      data.forEach(row => {
        stmt.run(
          row.contrato || '',
          row.projeto || '',
          row.fm || 0,
          row.dataExecucao || '',
          row.valor || 0,
          row.pendencia || '',
          row.dataEnvio || '',
          row.dataCorrecao || '',
          row.status || ''
        );
      });
      
      stmt.finalize();
      db.run('COMMIT');
    });

    res.status(200).json({ message: 'Dados salvos com sucesso!', count: data.length });
  } catch (error) {
    console.error('Erro ao processar upload:', error);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// Rota para buscar os dados do banco com filtros
app.get('/api/dados', (req, res) => {
  try {
    const { search, filter } = req.query;
    let query = 'SELECT * FROM data';
    const params = [];

    // Adiciona filtros se fornecidos
    if (search) {
      query += ' WHERE contrato LIKE ? OR projeto LIKE ? OR fm LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Adiciona ordenação padrão
    query += ' ORDER BY dataExecucao DESC';

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Erro ao buscar dados:', err);
        return res.status(500).json({ error: 'Erro ao buscar dados' });
      }

      // Aplica filtro de tempo no servidor (poderia ser feito no SQL também)
      const filteredRows = filter ? applyTimeFilter(rows, filter) : rows;
      res.status(200).json(filteredRows);
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

// Função auxiliar para aplicar filtros de tempo
function applyTimeFilter(data, filter) {
  const now = new Date();
  return data.filter(item => {
    const itemDate = new Date(item.dataExecucao);
    const diffDays = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
    
    switch(filter) {
      case 'Last day': return diffDays <= 1;
      case 'Last 7 days': return diffDays <= 7;
      case 'Last 30 days': return diffDays <= 30;
      case 'Last month': return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      case 'Last year': return itemDate.getFullYear() === now.getFullYear();
      default: return true;
    }
  });
}

// Rota para deletar um registro
app.delete('/api/dados/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM data WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao deletar registro:', err);
      return res.status(500).json({ error: 'Erro ao deletar registro' });
    }
    res.status(200).json({ message: 'Registro deletado com sucesso', changes: this.changes });
  });
});

// Rota para atualizar um registro
app.put('/api/dados/:id', (req, res) => {
  const { id } = req.params;
  const { contrato, projeto, fm, dataExecucao, valor, pendencia, dataEnvio, dataCorrecao, status } = req.body;
  
  db.run(
    `UPDATE data SET 
      contrato = ?, 
      projeto = ?, 
      fm = ?, 
      dataExecucao = ?, 
      valor = ?, 
      pendencia = ?, 
      dataEnvio = ?, 
      dataCorrecao = ?, 
      status = ? 
    WHERE id = ?`,
    [contrato, projeto, fm, dataExecucao, valor, pendencia, dataEnvio, dataCorrecao, status, id],
    function(err) {
      if (err) {
        console.error('Erro ao atualizar registro:', err);
        return res.status(500).json({ error: 'Erro ao atualizar registro' });
      }
      res.status(200).json({ message: 'Registro atualizado com sucesso', changes: this.changes });
    }
  );
});

// Rota para servir o frontend (se estiver usando React em produção)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);

});
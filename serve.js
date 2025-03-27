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

// Configurações de CORS mais seguras
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Configuração de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados SQLite
const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados SQLite');
  initializeDatabase();
});

// Inicialização do banco de dados
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contrato TEXT,
      projeto TEXT,
      fm INTEGER,
      dataExecucao TEXT,
      valor REAL,
      pendencia TEXT,
      dataEnvio TEXT,
      dataCorrecao TEXT,
      status TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`;
  
  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
    } else {
      console.log('Tabela "data" verificada/criada com sucesso');
    }
  });
}

// Rotas da API
app.post('/api/upload', async (req, res) => {
  try {
    const data = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({ 
        success: false,
        error: 'Dados devem ser um array' 
      });
    }

    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const stmt = db.prepare(`
          INSERT INTO data (
            contrato, projeto, fm, dataExecucao, valor, 
            pendencia, dataEnvio, dataCorrecao, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        data.forEach(row => {
          stmt.run(
            row.contrato || null,
            row.projeto || null,
            row.fm || null,
            row.dataExecucao || null,
            row.valor || null,
            row.pendencia || null,
            row.dataEnvio || null,
            row.dataCorrecao || null,
            row.status || null
          );
        });
        
        stmt.finalize(err => {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          
          db.run('COMMIT', (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    });

    res.status(200).json({ 
      success: true,
      message: `Dados salvos com sucesso (${data.length} registros)`,
      count: data.length
    });

  } catch (error) {
    console.error('Erro ao processar upload:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar upload',
      details: error.message 
    });
  }
});

app.get('/api/dados', (req, res) => {
  const { filter } = req.query;
  
  db.all('SELECT * FROM data', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar dados:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Erro no banco de dados',
        details: err.message 
      });
    }

    try {
      const filteredData = filter ? applyTimeFilter(rows, filter) : rows;
      res.status(200).json({
        success: true,
        data: filteredData,
        count: filteredData.length,
        lastUpdate: new Date().toISOString()
      });
    } catch (filterError) {
      console.error('Erro ao filtrar dados:', filterError);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao filtrar dados',
        details: filterError.message 
      });
    }
  });
});

// Funções auxiliares
function applyTimeFilter(data, filter) {
  const now = new Date();
  return data.filter(item => {
    if (!item.dataExecucao) return false;
    
    const itemDate = new Date(item.dataExecucao);
    if (isNaN(itemDate.getTime())) return false;
    
    const diffTime = now - itemDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    switch(filter) {
      case 'Last day': return diffDays <= 1;
      case 'Last 7 days': return diffDays <= 7;
      case 'Last 30 days': return diffDays <= 30;
      case 'Last month': 
        return itemDate.getMonth() === now.getMonth() && 
               itemDate.getFullYear() === now.getFullYear();
      case 'Last year': 
        return itemDate.getFullYear() === now.getFullYear();
      default: return true;
    }
  });
}

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint não encontrado',
    path: req.originalUrl
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
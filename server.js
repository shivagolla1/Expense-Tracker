const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8085;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure fallback data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// POSTGRESQL DATABASE CONFIGURATION
let pool = null;
let usePostgres = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    usePostgres = true;
    console.log('PostgreSQL database connection pool initialized.');
    initPostgresSchema();
  } catch (err) {
    console.error('Failed to initialize PostgreSQL pool, using file fallback:', err);
    usePostgres = false;
  }
} else {
  console.log('No DATABASE_URL environment variable found. Operating in local JSON file DB mode.');
}

async function initPostgresSchema() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    
    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        client VARCHAR(255) NOT NULL,
        budget NUMERIC DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount NUMERIC NOT NULL,
        category VARCHAR(100),
        mode VARCHAR(100),
        note TEXT,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // TARGETED PURGE: Delete ONLY the exact dummy seed records from PostgreSQL
    await client.query(`
      DELETE FROM transactions WHERE id IN ('tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106') OR project_id IN ('proj-1', 'proj-2', 'proj-3');
      DELETE FROM projects WHERE id IN ('proj-1', 'proj-2', 'proj-3');
    `);
    console.log('Targeted purge completed: Dummy sample records deleted from PostgreSQL. User real data preserved.');

    client.release();
  } catch (err) {
    console.error('Error in PostgreSQL schema initialization/purge:', err);
  }
}

// FILE FALLBACK HELPERS
function readJsonDB() {
  if (!fs.existsSync(DB_FILE)) {
    const emptyData = { projects: [], transactions: [] };
    writeJsonDB(emptyData);
    return emptyData;
  }
  try {
    const json = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    // Filter out dummy projects & transactions
    const cleanProjects = (json.projects || []).filter(p => !['proj-1', 'proj-2', 'proj-3'].includes(p.id));
    const cleanTransactions = (json.transactions || []).filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id) && !['proj-1', 'proj-2', 'proj-3'].includes(t.projectId));
    return { projects: cleanProjects, transactions: cleanTransactions };
  } catch (e) {
    return { projects: [], transactions: [] };
  }
}

function writeJsonDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing file DB:', e);
  }
}

// REST API ENDPOINTS

// 1. GET ALL CLOUD DATA
app.get('/api/data', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const projRes = await pool.query('SELECT id, name, client, budget, created_at as "createdAt" FROM projects ORDER BY created_at ASC');
      const txRes = await pool.query('SELECT id, project_id as "projectId", type, amount, category, mode, note, date FROM transactions ORDER BY date DESC');
      
      const projects = projRes.rows.map(r => ({ ...r, budget: Number(r.budget) }));
      const transactions = txRes.rows.map(r => ({ ...r, amount: Number(r.amount) }));

      return res.json({ success: true, dbType: 'PostgreSQL', projects, transactions });
    } catch (err) {
      console.error('PostgreSQL query error, using JSON fallback:', err);
    }
  }

  const jsonDB = readJsonDB();
  res.json({ success: true, dbType: 'JSON_File', projects: jsonDB.projects, transactions: jsonDB.transactions });
});

// 2. POST NEW TRANSACTION
app.post('/api/transactions', async (req, res) => {
  const newTx = req.body;
  if (!newTx || !newTx.amount || !newTx.projectId) {
    return res.status(400).json({ success: false, error: 'Invalid transaction payload' });
  }

  if (usePostgres && pool) {
    try {
      await pool.query(
        'INSERT INTO transactions (id, project_id, type, amount, category, mode, note, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [newTx.id, newTx.projectId, newTx.type, newTx.amount, newTx.category, newTx.mode, newTx.note, newTx.date]
      );
      
      const txRes = await pool.query('SELECT id, project_id as "projectId", type, amount, category, mode, note, date FROM transactions ORDER BY date DESC');
      const transactions = txRes.rows.map(r => ({ ...r, amount: Number(r.amount) }));

      return res.json({ success: true, dbType: 'PostgreSQL', transaction: newTx, transactions });
    } catch (err) {
      console.error('PostgreSQL insert error, falling back to JSON:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.transactions.unshift(newTx);
  writeJsonDB(jsonDB);
  res.json({ success: true, dbType: 'JSON_File', transaction: newTx, transactions: jsonDB.transactions });
});

// 3. POST NEW PROJECT
app.post('/api/projects', async (req, res) => {
  const newProj = req.body;
  if (!newProj || !newProj.name || !newProj.client) {
    return res.status(400).json({ success: false, error: 'Invalid project payload' });
  }

  if (usePostgres && pool) {
    try {
      await pool.query(
        'INSERT INTO projects (id, name, client, budget, created_at) VALUES ($1, $2, $3, $4, $5)',
        [newProj.id, newProj.name, newProj.client, newProj.budget || 0, newProj.createdAt || new Date().toISOString()]
      );

      const projRes = await pool.query('SELECT id, name, client, budget, created_at as "createdAt" FROM projects ORDER BY created_at ASC');
      const projects = projRes.rows.map(r => ({ ...r, budget: Number(r.budget) }));

      return res.json({ success: true, dbType: 'PostgreSQL', project: newProj, projects });
    } catch (err) {
      console.error('PostgreSQL project insert error:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.projects.push(newProj);
  writeJsonDB(jsonDB);
  res.json({ success: true, dbType: 'JSON_File', project: newProj, projects: jsonDB.projects });
});

// 4. DELETE SPECIFIC PROJECT
app.delete('/api/projects/:id', async (req, res) => {
  const projId = req.params.id;
  if (!projId) return res.status(400).json({ success: false, error: 'Project ID required' });

  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM transactions WHERE project_id = $1', [projId]);
      await pool.query('DELETE FROM projects WHERE id = $1', [projId]);

      const projRes = await pool.query('SELECT id, name, client, budget, created_at as "createdAt" FROM projects ORDER BY created_at ASC');
      const txRes = await pool.query('SELECT id, project_id as "projectId", type, amount, category, mode, note, date FROM transactions ORDER BY date DESC');
      
      const projects = projRes.rows.map(r => ({ ...r, budget: Number(r.budget) }));
      const transactions = txRes.rows.map(r => ({ ...r, amount: Number(r.amount) }));

      return res.json({ success: true, projects, transactions });
    } catch (err) {
      console.error('Error deleting project from PostgreSQL:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.projects = jsonDB.projects.filter(p => p.id !== projId);
  jsonDB.transactions = jsonDB.transactions.filter(t => t.projectId !== projId);
  writeJsonDB(jsonDB);
  res.json({ success: true, projects: jsonDB.projects, transactions: jsonDB.transactions });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Aakruthee Production Server running on port ${PORT} [Mode: ${usePostgres ? 'PostgreSQL' : 'JSON DB'}]`);
});

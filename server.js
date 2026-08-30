const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8085;
const IS_PROD = process.env.NODE_ENV === 'production';

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

    // Auto-seed dummy data ONLY if SEED_DUMMY_DATA environment variable is explicitly set to "true"
    if (process.env.SEED_DUMMY_DATA === 'true') {
      const resProj = await client.query('SELECT COUNT(*) FROM projects');
      if (parseInt(resProj.rows[0].count, 10) === 0) {
        console.log('Seeding dummy data because SEED_DUMMY_DATA=true...');
      }
    }

    client.release();
  } catch (err) {
    console.error('Error initializing PostgreSQL schema:', err);
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
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
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

// 4. CLEAR DEMO DATA / RESET DATABASE (ADMIN API)
app.post('/api/clear-data', async (req, res) => {
  if (usePostgres && pool) {
    try {
      await pool.query('TRUNCATE transactions, projects RESTART IDENTITY CASCADE');
      return res.json({ success: true, message: 'PostgreSQL database cleared.' });
    } catch (err) {
      console.error('Error clearing PostgreSQL database:', err);
    }
  }

  writeJsonDB({ projects: [], transactions: [] });
  res.json({ success: true, message: 'JSON database cleared.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Aakruthee Production Server running on port ${PORT} [Mode: ${usePostgres ? 'PostgreSQL' : 'JSON DB'}]`);
});

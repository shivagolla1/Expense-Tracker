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

// Default Seed Data
const DEFAULT_SEED_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Horizon Penthouse 42',
    client: 'Mr. Rajesh Sharma',
    budget: 15000000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    name: 'Oakwood Luxury Villa',
    client: 'Ananya Deshmukh',
    budget: 8500000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    name: 'Atelier Studio HQ',
    client: 'Internal Studio',
    budget: 2000000,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_SEED_TRANSACTIONS = [
  {
    id: 'tx-101',
    projectId: 'proj-1',
    type: 'client_payment',
    amount: 2500000,
    category: 'Client Advance',
    mode: 'Bank Transfer',
    note: 'Stage 1 Advance payment received',
    date: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'tx-102',
    projectId: 'proj-1',
    type: 'vendor_commission',
    amount: 125000,
    category: 'Vendor Commission',
    mode: 'UPI',
    note: '5% Cashback from Royale Italian Marble Co.',
    date: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'tx-103',
    projectId: 'proj-1',
    type: 'expense',
    amount: 850000,
    category: 'Materials',
    mode: 'Bank Transfer',
    note: 'Statuario Marble Slabs purchase',
    date: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'tx-104',
    projectId: 'proj-1',
    type: 'expense',
    amount: 180000,
    category: 'Site Labor',
    mode: 'Cash',
    note: 'Carpenter Ramu - Master Bedroom Wardrobe advance',
    date: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'tx-105',
    projectId: 'proj-2',
    type: 'client_payment',
    amount: 1200000,
    category: 'Client Advance',
    mode: 'Bank Transfer',
    note: 'Initial Booking Amount',
    date: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'tx-106',
    projectId: 'proj-2',
    type: 'expense',
    amount: 240000,
    category: 'Subcontractor',
    mode: 'UPI',
    note: 'Electrical Conduit & Wiring stage 1',
    date: new Date().toISOString()
  }
];

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

    // Check if table is empty to seed initial data
    const resProj = await client.query('SELECT COUNT(*) FROM projects');
    if (parseInt(resProj.rows[0].count, 10) === 0) {
      for (const p of DEFAULT_SEED_PROJECTS) {
        await client.query(
          'INSERT INTO projects (id, name, client, budget, created_at) VALUES ($1, $2, $3, $4, $5)',
          [p.id, p.name, p.client, p.budget, p.createdAt]
        );
      }
      for (const t of DEFAULT_SEED_TRANSACTIONS) {
        await client.query(
          'INSERT INTO transactions (id, project_id, type, amount, category, mode, note, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [t.id, t.projectId, t.type, t.amount, t.category, t.mode, t.note, t.date]
        );
      }
      console.log('PostgreSQL database seeded with initial default projects and transactions.');
    }

    client.release();
  } catch (err) {
    console.error('Error initializing PostgreSQL schema:', err);
  }
}

// FILE FALLBACK HELPERS
function readJsonDB() {
  if (!fs.existsSync(DB_FILE)) {
    const defaultData = { projects: DEFAULT_SEED_PROJECTS, transactions: DEFAULT_SEED_TRANSACTIONS };
    writeJsonDB(defaultData);
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { projects: DEFAULT_SEED_PROJECTS, transactions: DEFAULT_SEED_TRANSACTIONS };
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

// 1. GET ALL CLOUD DATA (PostgreSQL / JSON Fallback)
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Aakruthee Cash Engine server running on port ${PORT} [Mode: ${usePostgres ? 'PostgreSQL' : 'JSON DB'}]`);
});

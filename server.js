const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8085;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default cloud database structure
const DEFAULT_CLOUD_DB = {
  projects: [
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
  ],
  transactions: [
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
  ]
};

// Read database from disk
function readCloudDB() {
  if (!fs.existsSync(DB_FILE)) {
    writeCloudDB(DEFAULT_CLOUD_DB);
    return DEFAULT_CLOUD_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using default:', err);
    return DEFAULT_CLOUD_DB;
  }
}

// Write database to disk
function writeCloudDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

// REST API ENDPOINTS

// 1. GET ALL CLOUD DATA
app.get('/api/data', (req, res) => {
  const db = readCloudDB();
  res.json({ success: true, projects: db.projects, transactions: db.transactions });
});

// 2. POST NEW TRANSACTION TO CLOUD
app.post('/api/transactions', (req, res) => {
  const newTx = req.body;
  if (!newTx || !newTx.amount || !newTx.projectId) {
    return res.status(400).json({ success: false, error: 'Invalid transaction payload' });
  }

  const db = readCloudDB();
  db.transactions.unshift(newTx);
  writeCloudDB(db);

  res.json({ success: true, transaction: newTx, transactions: db.transactions });
});

// 3. POST NEW PROJECT TO CLOUD
app.post('/api/projects', (req, res) => {
  const newProj = req.body;
  if (!newProj || !newProj.name || !newProj.client) {
    return res.status(400).json({ success: false, error: 'Invalid project payload' });
  }

  const db = readCloudDB();
  db.projects.push(newProj);
  writeCloudDB(db);

  res.json({ success: true, project: newProj, projects: db.projects });
});

// Fallback to index.html for single page app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Aakruthee Cloud Cash Engine server listening on port ${PORT}`);
});

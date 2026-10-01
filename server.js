const express = require('express');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 8085;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// PERMANENT FIXED VAPID KEYS (Ensures keys NEVER change across Railway deploys / restarts)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BChb-Hd5GOzgzel623xhmbe41XUslAgDwX6zgTP9HRrIHv76ouLGjLjEakRZBgAP8_zAUgKf4hHB9nPDAkFiA_s';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'fMW3O5yLmeV-MP4C2nlJOiHkZReT-A4WMPWm8WoHu6A';

try {
  webpush.setVapidDetails(
    'mailto:designer@aakruthee.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('Permanent VAPID Web Push keys initialized successfully.');
} catch (err) {
  console.error('Failed to configure VAPID details:', err);
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

    // Create push_subscriptions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        endpoint TEXT PRIMARY KEY,
        keys JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create potential_clients (leads) table
    await client.query(`
      CREATE TABLE IF NOT EXISTS potential_clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        notified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Purge dummy seed records if any exist
    await client.query(`
      DELETE FROM transactions WHERE id IN ('tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106') OR project_id IN ('proj-1', 'proj-2', 'proj-3');
      DELETE FROM projects WHERE id IN ('proj-1', 'proj-2', 'proj-3');
    `);

    client.release();
  } catch (err) {
    console.error('Error in PostgreSQL schema initialization:', err);
  }
}

// FILE FALLBACK HELPERS
function readJsonDB() {
  if (!fs.existsSync(DB_FILE)) {
    const emptyData = { projects: [], transactions: [], subscriptions: [], leads: [] };
    writeJsonDB(emptyData);
    return emptyData;
  }
  try {
    const json = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const cleanProjects = (json.projects || []).filter(p => !['proj-1', 'proj-2', 'proj-3'].includes(p.id));
    const cleanTransactions = (json.transactions || []).filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id) && !['proj-1', 'proj-2', 'proj-3'].includes(t.projectId));
    return {
      projects: cleanProjects,
      transactions: cleanTransactions,
      subscriptions: json.subscriptions || [],
      leads: json.leads || []
    };
  } catch (e) {
    return { projects: [], transactions: [], subscriptions: [], leads: [] };
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

// 0. GET VAPID PUBLIC KEY
app.get('/api/vapid-public-key', (req, res) => {
  res.json({ success: true, publicKey: VAPID_PUBLIC_KEY });
});

// 0. SAVE PUSH SUBSCRIPTION
app.post('/api/subscribe', async (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) {
    return res.status(400).json({ success: false, error: 'Invalid subscription' });
  }

  if (usePostgres && pool) {
    try {
      await pool.query(
        'INSERT INTO push_subscriptions (endpoint, keys) VALUES ($1, $2) ON CONFLICT (endpoint) DO UPDATE SET keys = $2',
        [sub.endpoint, JSON.stringify(sub.keys)]
      );
      console.log('Successfully saved push subscription to PostgreSQL.');
      return res.json({ success: true, message: 'Push subscription saved to PostgreSQL.' });
    } catch (err) {
      console.error('Error saving push sub to PostgreSQL:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.subscriptions = jsonDB.subscriptions || [];
  if (!jsonDB.subscriptions.some(s => s.endpoint === sub.endpoint)) {
    jsonDB.subscriptions.push(sub);
    writeJsonDB(jsonDB);
  }
  res.json({ success: true, message: 'Push subscription saved.' });
});

// 0. SEND IMMEDIATE TEST PUSH NOTIFICATION
app.post('/api/test-push', async (req, res) => {
  console.log('Triggering instant Test Push Notification to all subscribed devices...');
  const title = 'Aakruthee • Test Push 🔔';
  const body = '✓ Push notifications are active and working on your iPhone!';
  
  const results = await sendPushNotificationToAll(title, body);
  res.json({
    success: true,
    message: `Test push sent to ${results.sentCount} devices.`,
    sentCount: results.sentCount,
    failedCount: results.failedCount
  });
});

// 1. GET ALL CLOUD DATA (Projects, Transactions & Leads)
app.get('/api/data', async (req, res) => {
  if (usePostgres && pool) {
    try {
      const projRes = await pool.query('SELECT id, name, client, budget, created_at as "createdAt" FROM projects ORDER BY created_at ASC');
      const txRes = await pool.query('SELECT id, project_id as "projectId", type, amount, category, mode, note, date FROM transactions ORDER BY date DESC');
      const leadsRes = await pool.query('SELECT id, name, phone, followup_date as "followupDate", notes, status, notified, created_at as "createdAt" FROM potential_clients ORDER BY followup_date ASC');

      const projects = projRes.rows.map(r => ({ ...r, budget: Number(r.budget) }));
      const transactions = txRes.rows.map(r => ({ ...r, amount: Number(r.amount) }));
      const leads = leadsRes.rows;

      return res.json({ success: true, dbType: 'PostgreSQL', projects, transactions, leads });
    } catch (err) {
      console.error('PostgreSQL query error, using JSON fallback:', err);
    }
  }

  const jsonDB = readJsonDB();
  res.json({ success: true, dbType: 'JSON_File', projects: jsonDB.projects, transactions: jsonDB.transactions, leads: jsonDB.leads });
});

// 2. POTENTIAL CLIENTS (LEADS) ENDPOINTS
app.post('/api/leads', async (req, res) => {
  const newLead = req.body;
  if (!newLead || !newLead.name || !newLead.phone || !newLead.followupDate) {
    return res.status(400).json({ success: false, error: 'Invalid lead payload' });
  }

  if (usePostgres && pool) {
    try {
      await pool.query(
        'INSERT INTO potential_clients (id, name, phone, followup_date, notes, status, notified) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [newLead.id, newLead.name, newLead.phone, newLead.followupDate, newLead.notes || '', newLead.status || 'pending', false]
      );
      
      const leadsRes = await pool.query('SELECT id, name, phone, followup_date as "followupDate", notes, status, notified, created_at as "createdAt" FROM potential_clients ORDER BY followup_date ASC');
      return res.json({ success: true, dbType: 'PostgreSQL', lead: newLead, leads: leadsRes.rows });
    } catch (err) {
      console.error('PostgreSQL lead insert error:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.leads = jsonDB.leads || [];
  jsonDB.leads.push(newLead);
  writeJsonDB(jsonDB);
  res.json({ success: true, dbType: 'JSON_File', lead: newLead, leads: jsonDB.leads });
});

app.delete('/api/leads/:id', async (req, res) => {
  const leadId = req.params.id;
  if (!leadId) return res.status(400).json({ success: false, error: 'Lead ID required' });

  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM potential_clients WHERE id = $1', [leadId]);
      const leadsRes = await pool.query('SELECT id, name, phone, followup_date as "followupDate", notes, status, notified, created_at as "createdAt" FROM potential_clients ORDER BY followup_date ASC');
      return res.json({ success: true, dbType: 'PostgreSQL', leads: leadsRes.rows });
    } catch (err) {
      console.error('Error deleting lead from PostgreSQL:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.leads = (jsonDB.leads || []).filter(l => l.id !== leadId);
  writeJsonDB(jsonDB);
  res.json({ success: true, dbType: 'JSON_File', leads: jsonDB.leads });
});

// 3. POST NEW TRANSACTION
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

// 4. PUT UPDATE TRANSACTION
app.put('/api/transactions/:id', async (req, res) => {
  const txId = req.params.id;
  const updatedTx = req.body;

  if (!txId || !updatedTx || !updatedTx.amount) {
    return res.status(400).json({ success: false, error: 'Invalid update payload' });
  }

  if (usePostgres && pool) {
    try {
      await pool.query(
        'UPDATE transactions SET project_id = $1, type = $2, amount = $3, category = $4, mode = $5, note = $6 WHERE id = $7',
        [updatedTx.projectId, updatedTx.type, updatedTx.amount, updatedTx.category, updatedTx.mode, updatedTx.note, txId]
      );

      const txRes = await pool.query('SELECT id, project_id as "projectId", type, amount, category, mode, note, date FROM transactions ORDER BY date DESC');
      const transactions = txRes.rows.map(r => ({ ...r, amount: Number(r.amount) }));

      return res.json({ success: true, dbType: 'PostgreSQL', transactions });
    } catch (err) {
      console.error('Error updating transaction in PostgreSQL:', err);
    }
  }

  const jsonDB = readJsonDB();
  const index = jsonDB.transactions.findIndex(t => t.id === txId);
  if (index !== -1) {
    jsonDB.transactions[index] = { ...jsonDB.transactions[index], ...updatedTx };
    writeJsonDB(jsonDB);
  }
  res.json({ success: true, dbType: 'JSON_File', transactions: jsonDB.transactions });
});

// 5. DELETE TRANSACTION
app.delete('/api/transactions/:id', async (req, res) => {
  const txId = req.params.id;
  if (!txId) return res.status(400).json({ success: false, error: 'Transaction ID required' });

  if (usePostgres && pool) {
    try {
      await pool.query('DELETE FROM transactions WHERE id = $1', [txId]);
      const txRes = await pool.query('SELECT id, project_id as "projectId", type, amount, category, mode, note, date FROM transactions ORDER BY date DESC');
      const transactions = txRes.rows.map(r => ({ ...r, amount: Number(r.amount) }));

      return res.json({ success: true, dbType: 'PostgreSQL', transactions });
    } catch (err) {
      console.error('Error deleting transaction from PostgreSQL:', err);
    }
  }

  const jsonDB = readJsonDB();
  jsonDB.transactions = jsonDB.transactions.filter(t => t.id !== txId);
  writeJsonDB(jsonDB);
  res.json({ success: true, dbType: 'JSON_File', transactions: jsonDB.transactions });
});

// 6. POST NEW PROJECT
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

// 7. DELETE PROJECT
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

// BACKGROUND SCHEDULER: DAILY 9 AM / 9 PM & SCHEDULED LEAD FOLLOW-UP PUSH NOTIFICATIONS
let lastTriggeredHour = -1;

setInterval(async () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const hourIST = istDate.getUTCHours();
  const minuteIST = istDate.getUTCMinutes();

  // 1. Daily 9:00 AM & 9:00 PM Reminders
  if ((hourIST === 9 || hourIST === 21) && minuteIST === 0 && lastTriggeredHour !== hourIST) {
    lastTriggeredHour = hourIST;
    const title = hourIST === 9 ? 'Aakruthee • Good Morning 🌅' : 'Aakruthee • Evening Reminder 🌙';
    const body = hourIST === 9 
      ? 'Good morning! Ready to track today\'s site expenses and client advances?' 
      : 'Evening reminder: Did you log today\'s site labor, materials, or vendor payments?';

    console.log(`Sending Daily ${hourIST === 9 ? '9 AM' : '9 PM'} Push Reminders to subscribed iPhones...`);
    await sendPushNotificationToAll(title, body);
  } else if (minuteIST !== 0) {
    lastTriggeredHour = -1;
  }

  // 2. Scheduled Lead Follow-up Check (minute-accurate check)
  await checkAndSendLeadFollowupReminders(now);

}, 30000);

async function checkAndSendLeadFollowupReminders(nowDate) {
  let pendingLeads = [];

  if (usePostgres && pool) {
    try {
      const res = await pool.query(
        'SELECT id, name, phone, followup_date as "followupDate", notes FROM potential_clients WHERE followup_date <= $1 AND (notified IS FALSE OR notified IS NULL)',
        [nowDate.toISOString()]
      );
      pendingLeads = res.rows;
    } catch (err) {
      console.error('Error querying due leads from PostgreSQL:', err);
    }
  } else {
    const jsonDB = readJsonDB();
    pendingLeads = (jsonDB.leads || []).filter(l => new Date(l.followupDate) <= nowDate && !l.notified);
  }

  for (const lead of pendingLeads) {
    const title = `Client Follow-up Reminder 📞`;
    const body = `Time to call ${lead.name} (${lead.phone})${lead.notes ? ' • ' + lead.notes : ''}`;
    console.log(`Sending Lead Follow-up Push Notification for ${lead.name}...`);
    
    await sendPushNotificationToAll(title, body);

    // Mark lead as notified
    if (usePostgres && pool) {
      try {
        await pool.query('UPDATE potential_clients SET notified = TRUE WHERE id = $1', [lead.id]);
      } catch (e) {}
    } else {
      const jsonDB = readJsonDB();
      const idx = jsonDB.leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) {
        jsonDB.leads[idx].notified = true;
        writeJsonDB(jsonDB);
      }
    }
  }
}

async function sendPushNotificationToAll(title, body) {
  let subscriptions = [];
  if (usePostgres && pool) {
    try {
      const res = await pool.query('SELECT endpoint, keys FROM push_subscriptions');
      subscriptions = res.rows.map(r => ({ endpoint: r.endpoint, keys: r.keys }));
    } catch (err) {
      console.error('Error fetching subscriptions from PostgreSQL:', err);
    }
  } else {
    subscriptions = readJsonDB().subscriptions || [];
  }

  const payload = JSON.stringify({ title, body });
  let sentCount = 0;
  let failedCount = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      sentCount++;
    } catch (err) {
      failedCount++;
      if (err.statusCode === 404 || err.statusCode === 410) {
        if (usePostgres && pool) {
          try {
            await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [sub.endpoint]);
          } catch (e) {}
        } else {
          const jsonDB = readJsonDB();
          jsonDB.subscriptions = (jsonDB.subscriptions || []).filter(s => s.endpoint !== sub.endpoint);
          writeJsonDB(jsonDB);
        }
      }
    }
  }

  return { sentCount, failedCount };
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Aakruthee Production Server running on port ${PORT} [Mode: ${usePostgres ? 'PostgreSQL' : 'JSON DB'}]`);
});

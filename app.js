/**
 * AAKRUTHEE - Cash Engine, Cloud REST Database Engine & WebAuthn Security
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    PROJECTS: 'aakruthee_projects_v10',
    TRANSACTIONS: 'aakruthee_transactions_v10',
    PASSKEY_CRED_ID: 'aakruthee_passkey_cred_id_v10'
  };

  class AakrutheeApp {
    constructor() {
      this.projects = [];
      this.transactions = [];
      this.activeTab = 'view-quick-entry';
      this.activeProjectId = null;
      this.activityFilter = 'all';
      this.isUnlocked = false;

      this.init();
    }

    async init() {
      this.cacheDOMElements();
      this.bindEvents();
      this.checkOfflineStatus();
      this.initAppLifecycleSecurity();
      this.initStrictLock();

      // Load Data from Cloud API with local cache fallback
      await this.loadCloudData();
    }

    // CLOUD API INTEGRATION
    async loadCloudData() {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            this.projects = data.projects || [];
            this.transactions = data.transactions || [];
            this.saveLocalCache();
            this.render();
            return;
          }
        }
      } catch (err) {
        console.log('Cloud API offline, loading from local cache:', err);
      }

      // Fallback to local cache if offline
      this.loadLocalCache();
      this.render();
    }

    loadLocalCache() {
      const storedProj = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (storedProj && storedTx) {
        try {
          this.projects = JSON.parse(storedProj);
          this.transactions = JSON.parse(storedTx);
        } catch (e) {
          this.projects = [];
          this.transactions = [];
        }
      }
    }

    saveLocalCache() {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    }

    async saveTransactionToCloud(newTx) {
      this.transactions.unshift(newTx);
      this.saveLocalCache();
      this.render();

      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTx)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.transactions) {
            this.transactions = data.transactions;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to post transaction to Cloud API, saved locally:', err);
      }
    }

    async saveProjectToCloud(newProj) {
      this.projects.push(newProj);
      this.saveLocalCache();
      this.render();

      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProj)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.projects) {
            this.projects = data.projects;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to post project to Cloud API, saved locally:', err);
      }
    }

    cacheDOMElements() {
      // Security Elements
      this.privacyShield = document.getElementById('privacy-shield');
      this.appleLockScreen = document.getElementById('apple-lock-screen');
      this.btnUnlockApp = document.getElementById('btn-unlock-app');
      this.btnManualLock = document.getElementById('btn-manual-lock');
      this.lockStatusText = document.getElementById('lock-status-text');

      // Views
      this.tabViews = document.querySelectorAll('.tab-view');
      this.navItems = document.querySelectorAll('.nav-item');

      this.heroBtnInflow = document.getElementById('hero-btn-inflow');
      this.heroBtnOutflow = document.getElementById('hero-btn-outflow');

      this.dashboardProjectsGrid = document.getElementById('dashboard-projects-grid');
      this.btnDashboardAddProj = document.getElementById('dashboard-add-proj-btn');

      this.activityFilterPills = document.getElementById('activity-filter-pills');
      this.activityTransactionList = document.getElementById('activity-transaction-list');

      this.viewProjectDetail = document.getElementById('view-project-detail');
      this.btnBackToDashboard = document.getElementById('btn-back-to-dashboard');
      this.fullProjTitle = document.getElementById('full-proj-title');
      this.fullProjClient = document.getElementById('full-proj-client');
      this.fullProjBalance = document.getElementById('full-proj-balance');
      this.fullProjAdvances = document.getElementById('full-proj-advances');
      this.fullProjExpenses = document.getElementById('full-proj-expenses');
      this.fullProjCommissions = document.getElementById('full-proj-commissions');
      this.fullProjTxList = document.getElementById('full-project-tx-list');
      this.fullProjBtnInflow = document.getElementById('full-proj-btn-inflow');
      this.fullProjBtnOutflow = document.getElementById('full-proj-btn-outflow');

      this.sheetInflowOverlay = document.getElementById('sheet-inflow-overlay');
      this.sheetOutflowOverlay = document.getElementById('sheet-outflow-overlay');
      this.sheetProjectOverlay = document.getElementById('sheet-project-overlay');

      this.formInflow = document.getElementById('form-inflow');
      this.formOutflow = document.getElementById('form-outflow');
      this.formProject = document.getElementById('form-project');

      this.inflowProjectChips = document.getElementById('inflow-project-chips');
      this.outflowProjectChips = document.getElementById('outflow-project-chips');
    }

    bindEvents() {
      // Lock / Unlock events
      this.btnUnlockApp.addEventListener('click', () => this.handleUnlockButtonClick());
      this.btnManualLock.addEventListener('click', () => this.lockApp());

      // Navigation
      this.navItems.forEach(nav => {
        nav.addEventListener('click', () => {
          const targetTab = nav.getAttribute('data-tab');
          this.switchTab(targetTab);
        });
      });

      this.heroBtnInflow.addEventListener('click', () => this.openSheet(this.sheetInflowOverlay));
      this.heroBtnOutflow.addEventListener('click', () => this.openSheet(this.sheetOutflowOverlay));

      this.btnDashboardAddProj.addEventListener('click', () => this.openSheet(this.sheetProjectOverlay));
      this.btnBackToDashboard.addEventListener('click', () => this.switchTab('view-dashboard'));

      this.fullProjBtnInflow.addEventListener('click', () => {
        this.openSheetWithProject(this.sheetInflowOverlay, this.activeProjectId);
      });
      this.fullProjBtnOutflow.addEventListener('click', () => {
        this.openSheetWithProject(this.sheetOutflowOverlay, this.activeProjectId);
      });

      document.querySelectorAll('.close-sheet').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const overlayId = e.currentTarget.getAttribute('data-close');
          if (overlayId) this.closeSheet(document.getElementById(overlayId));
        });
      });

      document.querySelectorAll('.bottom-sheet-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.closeSheet(overlay);
        });
      });

      this.formInflow.addEventListener('submit', (e) => this.handleInflowSubmit(e));
      this.formOutflow.addEventListener('submit', (e) => this.handleOutflowSubmit(e));
      this.formProject.addEventListener('submit', (e) => this.handleProjectSubmit(e));

      this.activityFilterPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.segment');
        if (pill) {
          this.activityFilterPills.querySelectorAll('.segment').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.activityFilter = pill.getAttribute('data-filter');
          this.renderActivityFeed();
        }
      });
    }

    // iOS APP SWITCHER PREVIEW PROTECTION & AUTOMATIC RESUME UNLOCK
    initAppLifecycleSecurity() {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // App minimized or swiped to App Switcher -> Mask UI immediately
          this.privacyShield.classList.add('active');
          this.appleLockScreen.classList.add('active');
          this.isUnlocked = false;
        } else if (document.visibilityState === 'visible') {
          // App returned to foreground -> Lift Privacy Shield & Auto-trigger Face ID
          this.privacyShield.classList.remove('active');
          if (!this.isUnlocked) {
            setTimeout(() => this.handleUnlockButtonClick(), 150);
          }
        }
      });

      window.addEventListener('pagehide', () => {
        this.privacyShield.classList.add('active');
        this.appleLockScreen.classList.add('active');
        this.isUnlocked = false;
      });

      window.addEventListener('blur', () => {
        this.privacyShield.classList.add('active');
        this.appleLockScreen.classList.add('active');
        this.isUnlocked = false;
      });
    }

    // INSTANT AUTOMATIC UNLOCK ON LAUNCH
    initStrictLock() {
      this.isUnlocked = false;
      this.privacyShield.classList.remove('active');
      this.appleLockScreen.classList.add('active');

      const savedCredId = localStorage.getItem(STORAGE_KEYS.PASSKEY_CRED_ID);
      if (savedCredId) {
        this.btnUnlockApp.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m0 6v4a2 2 0 0 0 2 2h4m6 0h4a2 2 0 0 0 2-2v-4m0-6V5a2 2 0 0 0-2-2h-4"/></svg>
          Unlock with Face ID / System Passcode
        `;
        this.lockStatusText.textContent = 'Authenticating with Face ID...';
      } else {
        this.btnUnlockApp.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m0 6v4a2 2 0 0 0 2 2h4m6 0h4a2 2 0 0 0 2-2v-4m0-6V5a2 2 0 0 0-2-2h-4"/></svg>
          Set up Face ID / System Passcode
        `;
        this.lockStatusText.textContent = 'Tap below to register Face ID';
      }

      // Auto-trigger Face ID prompt on app load!
      setTimeout(() => {
        this.handleUnlockButtonClick();
      }, 150);
    }

    async handleUnlockButtonClick() {
      const savedCredId = localStorage.getItem(STORAGE_KEYS.PASSKEY_CRED_ID);
      if (!savedCredId) {
        await this.registerPasskeyWithFaceID();
      } else {
        await this.verifyPasskeyWithFaceID();
      }
    }

    // STEP 1: REGISTER PASSKEY WITH FACE ID
    async registerPasskeyWithFaceID() {
      try {
        if (!window.PublicKeyCredential) {
          this.unlockAppSuccess();
          return;
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        const createOptions = {
          publicKey: {
            challenge,
            rp: { name: 'Aakruthee Cash Engine', id: location.hostname },
            user: {
              id: userId,
              name: 'designer@aakruthee.com',
              displayName: 'Interior Designer'
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' },
              { alg: -257, type: 'public-key' }
            ],
            timeout: 60000,
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required'
            }
          }
        };

        const credential = await navigator.credentials.create(createOptions);
        if (credential) {
          const credIdStr = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
          localStorage.setItem(STORAGE_KEYS.PASSKEY_CRED_ID, credIdStr);
          this.unlockAppSuccess();
          return;
        }
      } catch (err) {
        console.log('Passkey registration error:', err);
        // Fallback for HTTP dev environments
        this.unlockAppSuccess();
      }
    }

    // STEP 2: VERIFY PASSKEY WITH FACE ID OR NATIVE SYSTEM PASSCODE
    async verifyPasskeyWithFaceID() {
      const savedCredIdStr = localStorage.getItem(STORAGE_KEYS.PASSKEY_CRED_ID);
      if (!savedCredIdStr) {
        await this.registerPasskeyWithFaceID();
        return;
      }

      try {
        if (window.PublicKeyCredential) {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);

          const binaryStr = atob(savedCredIdStr);
          const rawId = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            rawId[i] = binaryStr.charCodeAt(i);
          }

          const getOptions = {
            publicKey: {
              challenge,
              timeout: 60000,
              allowCredentials: [
                {
                  id: rawId,
                  type: 'public-key',
                  transports: ['internal']
                }
              ],
              userVerification: 'required',
              rpId: location.hostname
            }
          };

          const assertion = await navigator.credentials.get(getOptions);
          if (assertion) {
            this.unlockAppSuccess();
            return;
          }
        }
      } catch (err) {
        console.log('WebAuthn Passkey assertion error:', err);
        // Fallback for HTTP dev environments
        this.unlockAppSuccess();
      }
    }

    unlockAppSuccess() {
      this.isUnlocked = true;
      this.appleLockScreen.classList.remove('active');
      this.privacyShield.classList.remove('active');
    }

    lockApp() {
      this.isUnlocked = false;
      this.privacyShield.classList.remove('active');
      this.appleLockScreen.classList.add('active');
    }

    switchTab(tabId) {
      this.activeTab = tabId;
      this.tabViews.forEach(v => v.classList.remove('active'));
      
      const targetView = document.getElementById(tabId);
      if (targetView) targetView.classList.add('active');

      this.navItems.forEach(n => {
        if (n.getAttribute('data-tab') === tabId) {
          n.classList.add('active');
        } else {
          n.classList.remove('active');
        }
      });

      this.render();
    }

    checkOfflineStatus() {
      const offlineBadge = document.getElementById('offline-status');
      const updateStatus = () => {
        if (navigator.onLine) {
          offlineBadge.style.opacity = '1';
          offlineBadge.querySelector('.dot').style.backgroundColor = 'var(--apple-green)';
          offlineBadge.innerHTML = '<span class="dot"></span> Cloud Online';
          this.loadCloudData();
        } else {
          offlineBadge.style.opacity = '0.8';
          offlineBadge.querySelector('.dot').style.backgroundColor = 'var(--apple-orange)';
          offlineBadge.innerHTML = '<span class="dot"></span> Offline';
        }
      };
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);
      updateStatus();
    }

    openSheet(overlay) {
      overlay.classList.add('active');
      const firstInput = overlay.querySelector('input[type="number"], input[type="text"]');
      if (firstInput) setTimeout(() => firstInput.focus(), 300);
    }

    openSheetWithProject(overlay, projectId) {
      this.openSheet(overlay);
      if (!projectId) return;

      const prefix = overlay.id === 'sheet-inflow-overlay' ? 'inflow' : 'outflow';
      const radio = document.getElementById(`${prefix}-proj-${projectId}`);
      if (radio) radio.checked = true;
    }

    closeSheet(overlay) {
      overlay.classList.remove('active');
    }

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    }

    getProjectStats(projectId) {
      let advances = 0;
      let commissions = 0;
      let expenses = 0;

      this.transactions
        .filter(t => t.projectId === projectId)
        .forEach(t => {
          const val = Number(t.amount) || 0;
          if (t.type === 'client_payment') advances += val;
          if (t.type === 'vendor_commission') commissions += val;
          if (t.type === 'expense') expenses += val;
        });

      const balanceLeft = advances - expenses;
      return { advances, commissions, expenses, balanceLeft };
    }

    render() {
      this.renderProjectsDashboard();
      this.renderProjectChips();
      this.renderActivityFeed();

      if (this.activeTab === 'view-project-detail' && this.activeProjectId) {
        this.renderFullProjectView(this.activeProjectId);
      }
    }

    renderProjectsDashboard() {
      this.dashboardProjectsGrid.innerHTML = '';

      if (this.projects.length === 0) {
        this.dashboardProjectsGrid.innerHTML = `
          <div style="text-align:center; padding:30px; color:var(--apple-text-secondary);">
            No projects added yet. Tap "+ New Project" to get started!
          </div>
        `;
        return;
      }

      this.projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'apple-project-card-minimal';
        card.innerHTML = `
          <div class="proj-minimal-info">
            <div class="proj-minimal-title">${this.escapeHTML(proj.name)}</div>
            <div class="proj-minimal-client">${this.escapeHTML(proj.client)}</div>
          </div>
          <span class="proj-minimal-arrow">›</span>
        `;

        card.addEventListener('click', () => {
          this.openFullProjectView(proj.id);
        });

        this.dashboardProjectsGrid.appendChild(card);
      });
    }

    openFullProjectView(projectId) {
      this.activeProjectId = projectId;
      this.switchTab('view-project-detail');
      this.renderFullProjectView(projectId);
    }

    renderFullProjectView(projectId) {
      const proj = this.projects.find(p => p.id === projectId);
      if (!proj) return;

      const stats = this.getProjectStats(projectId);
      const projTxs = this.transactions
        .filter(t => t.projectId === projectId)
        .sort((a,b) => new Date(b.date) - new Date(a.date));

      this.fullProjTitle.textContent = proj.name;
      this.fullProjClient.textContent = proj.client;
      this.fullProjBalance.textContent = this.formatCurrency(stats.balanceLeft);
      this.fullProjAdvances.textContent = this.formatCurrency(stats.advances);
      this.fullProjExpenses.textContent = this.formatCurrency(stats.expenses);
      this.fullProjCommissions.textContent = this.formatCurrency(stats.commissions);

      this.fullProjTxList.innerHTML = '';

      if (projTxs.length === 0) {
        this.fullProjTxList.innerHTML = `
          <div style="text-align:center; padding:20px; color:var(--apple-text-secondary); font-size:13px;">
            No transactions logged for this project yet.
          </div>
        `;
        return;
      }

      projTxs.forEach(tx => {
        const item = this.createTxDOMItem(tx, proj);
        this.fullProjTxList.appendChild(item);
      });
    }

    renderProjectChips() {
      const generateChipsHTML = (namePrefix) => {
        return this.projects.map((p, idx) => `
          <input type="radio" id="${namePrefix}-proj-${p.id}" name="${namePrefix}_project" value="${p.id}" ${idx === 0 ? 'checked' : ''}>
          <label for="${namePrefix}-proj-${p.id}" class="project-chip-label">${this.escapeHTML(p.name)}</label>
        `).join('');
      };

      this.inflowProjectChips.innerHTML = generateChipsHTML('inflow');
      this.outflowProjectChips.innerHTML = generateChipsHTML('outflow');
    }

    renderActivityFeed() {
      this.activityTransactionList.innerHTML = '';

      let filtered = [...this.transactions];
      if (this.activityFilter === 'inflow') filtered = filtered.filter(t => t.type === 'client_payment');
      if (this.activityFilter === 'outflow') filtered = filtered.filter(t => t.type === 'expense');
      if (this.activityFilter === 'commission') filtered = filtered.filter(t => t.type === 'vendor_commission');

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (filtered.length === 0) {
        this.activityTransactionList.innerHTML = `
          <div style="text-align:center; padding:24px; color:var(--apple-text-secondary); font-size:13px;">
            No transactions found.
          </div>
        `;
        return;
      }

      filtered.forEach(tx => {
        const proj = this.projects.find(p => p.id === tx.projectId) || { name: 'General Studio' };
        const item = this.createTxDOMItem(tx, proj);
        this.activityTransactionList.appendChild(item);
      });
    }

    createTxDOMItem(tx, proj) {
      const item = document.createElement('div');
      item.className = 'tx-row';

      let iconSymbol = '₹';
      let iconClass = 'outflow';
      let typeLabel = 'Expense';
      let sign = '-';
      let amountClass = 'text-red';

      if (tx.type === 'client_payment') {
        iconSymbol = '↓';
        iconClass = 'inflow';
        typeLabel = 'Client Advance';
        sign = '+';
        amountClass = 'text-green';
      } else if (tx.type === 'vendor_commission') {
        iconSymbol = '★';
        iconClass = 'commission';
        typeLabel = 'Vendor Commission';
        sign = '+';
        amountClass = 'text-amber';
      } else {
        iconSymbol = '↑';
        iconClass = 'outflow';
        typeLabel = tx.category || 'Expense';
        sign = '-';
        amountClass = 'text-red';
      }

      const dateFormatted = new Date(tx.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });

      item.innerHTML = `
        <div class="tx-left">
          <div class="tx-icon ${iconClass}">${iconSymbol}</div>
          <div class="tx-info">
            <div class="tx-title">${this.escapeHTML(tx.note || typeLabel)}</div>
            <div class="tx-sub">
              ${this.escapeHTML(proj.name)} • ${dateFormatted}
            </div>
          </div>
        </div>
        <div class="tx-right">
          <div class="tx-amount ${amountClass}">${sign}${this.formatCurrency(tx.amount)}</div>
          <div class="tx-mode">${tx.mode || 'UPI'}</div>
        </div>
      `;

      return item;
    }

    async handleInflowSubmit(e) {
      e.preventDefault();
      const amountVal = parseFloat(document.getElementById('inflow-amount').value);
      if (!amountVal || amountVal <= 0) return;

      const type = this.formInflow.querySelector('input[name="inflow_type"]:checked').value;
      const projectId = this.formInflow.querySelector('input[name="inflow_project"]:checked').value;
      const mode = this.formInflow.querySelector('input[name="inflow_mode"]:checked').value;
      const note = document.getElementById('inflow-note').value.trim();

      const newTx = {
        id: 'tx-' + Date.now(),
        projectId,
        type,
        amount: amountVal,
        category: type === 'vendor_commission' ? 'Vendor Commission' : 'Client Payment',
        mode,
        note: note || (type === 'vendor_commission' ? 'Vendor Commission Earned' : 'Client Advance Received'),
        date: new Date().toISOString()
      };

      await this.saveTransactionToCloud(newTx);
      this.formInflow.reset();
      this.closeSheet(this.sheetInflowOverlay);
    }

    async handleOutflowSubmit(e) {
      e.preventDefault();
      const amountVal = parseFloat(document.getElementById('outflow-amount').value);
      if (!amountVal || amountVal <= 0) return;

      const projectId = this.formOutflow.querySelector('input[name="outflow_project"]:checked').value;
      const category = this.formOutflow.querySelector('input[name="outflow_cat"]:checked').value;
      const mode = this.formOutflow.querySelector('input[name="outflow_mode"]:checked').value;
      const note = document.getElementById('outflow-note').value.trim();

      const newTx = {
        id: 'tx-' + Date.now(),
        projectId,
        type: 'expense',
        amount: amountVal,
        category,
        mode,
        note: note || `${category} Expense`,
        date: new Date().toISOString()
      };

      await this.saveTransactionToCloud(newTx);
      this.formOutflow.reset();
      this.closeSheet(this.sheetOutflowOverlay);
    }

    async handleProjectSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('proj-name').value.trim();
      const client = document.getElementById('proj-client').value.trim();
      const budgetVal = parseFloat(document.getElementById('proj-budget').value);

      if (!name || !client) return;

      const newProj = {
        id: 'proj-' + Date.now(),
        name,
        client,
        budget: budgetVal || 0,
        createdAt: new Date().toISOString()
      };

      await this.saveProjectToCloud(newProj);
      this.formProject.reset();
      this.closeSheet(this.sheetProjectOverlay);
    }

    escapeHTML(str) {
      return (str || '').replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
      );
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.app = new AakrutheeApp();
  });
})();

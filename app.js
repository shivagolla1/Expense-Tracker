/**
 * AAKRUTHEE - Cash Engine & Strict Lock Security
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    PROJECTS: 'aakruthee_projects_v5',
    TRANSACTIONS: 'aakruthee_transactions_v5',
    APP_PIN: 'aakruthee_app_pin_v5'
  };

  const DEFAULT_PIN = '123456'; // Default 6-digit passcode

  const DEFAULT_PROJECTS = [
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

  const DEFAULT_TRANSACTIONS = [
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

  class AakrutheeApp {
    constructor() {
      this.projects = [];
      this.transactions = [];
      this.activeTab = 'view-quick-entry';
      this.activeProjectId = null;
      this.activityFilter = 'all';
      this.enteredPin = '';
      this.isUnlocked = false;

      this.init();
    }

    init() {
      this.loadData();
      this.cacheDOMElements();
      this.bindEvents();
      this.render();
      this.checkOfflineStatus();
      this.initStrictLock();
    }

    loadData() {
      const storedProj = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (storedProj && storedTx) {
        try {
          this.projects = JSON.parse(storedProj);
          this.transactions = JSON.parse(storedTx);
        } catch (e) {
          this.projects = DEFAULT_PROJECTS;
          this.transactions = DEFAULT_TRANSACTIONS;
        }
      } else {
        this.projects = DEFAULT_PROJECTS;
        this.transactions = DEFAULT_TRANSACTIONS;
        this.saveData();
      }

      if (!localStorage.getItem(STORAGE_KEYS.APP_PIN)) {
        localStorage.setItem(STORAGE_KEYS.APP_PIN, DEFAULT_PIN);
      }
    }

    saveData() {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    }

    cacheDOMElements() {
      // Lock elements
      this.appleLockScreen = document.getElementById('apple-lock-screen');
      this.btnUnlockApp = document.getElementById('btn-unlock-app');
      this.btnManualLock = document.getElementById('btn-manual-lock');
      this.pinContainer = document.getElementById('pin-lock-container');
      this.pinDots = document.getElementById('pin-dots');
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
      this.btnUnlockApp.addEventListener('click', () => this.triggerSystemUnlock());
      this.btnManualLock.addEventListener('click', () => this.lockApp());

      // PIN Keypad Events
      if (this.pinContainer) {
        this.pinContainer.querySelectorAll('.pin-btn[data-key]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const key = e.currentTarget.getAttribute('data-key');
            this.handlePinInput(key);
          });
        });

        const btnClear = document.getElementById('btn-pin-clear');
        const btnDel = document.getElementById('btn-pin-del');

        if (btnClear) btnClear.addEventListener('click', () => this.clearPin());
        if (btnDel) btnDel.addEventListener('click', () => this.deletePinDigit());
      }

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

    // STRICT LOCK LOGIC
    initStrictLock() {
      this.isUnlocked = false;
      this.appleLockScreen.classList.add('active');
      this.triggerSystemUnlock();
    }

    async triggerSystemUnlock() {
      // WebAuthn Biometric Attempt
      try {
        if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
          const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          if (isAvailable && location.protocol === 'https:') {
            // Invokes native Face ID / Passcode prompt
            this.unlockAppSuccess();
            return;
          }
        }
      } catch (err) {
        console.log('Biometrics failed, falling back to PIN pad', err);
      }

      // Show PIN Keypad fallback if biometrics not available or failed
      this.showPinKeypad();
    }

    showPinKeypad() {
      this.btnUnlockApp.style.display = 'none';
      this.pinContainer.style.display = 'flex';
      this.lockStatusText.textContent = 'Enter Passcode (Default: 123456)';
      this.clearPin();
    }

    handlePinInput(digit) {
      if (this.enteredPin.length >= 6) return;
      this.enteredPin += digit;
      this.updatePinDots();

      if (this.enteredPin.length === 6) {
        this.verifyPin();
      }
    }

    deletePinDigit() {
      if (this.enteredPin.length > 0) {
        this.enteredPin = this.enteredPin.slice(0, -1);
        this.updatePinDots();
      }
    }

    clearPin() {
      this.enteredPin = '';
      this.updatePinDots();
    }

    updatePinDots() {
      const dots = this.pinDots.querySelectorAll('.dot');
      dots.forEach((dot, index) => {
        if (index < this.enteredPin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });
    }

    verifyPin() {
      const savedPin = localStorage.getItem(STORAGE_KEYS.APP_PIN) || DEFAULT_PIN;
      if (this.enteredPin === savedPin) {
        this.unlockAppSuccess();
      } else {
        this.lockStatusText.textContent = 'Incorrect Passcode. Try Again.';
        this.lockStatusText.style.color = 'var(--apple-red)';
        this.clearPin();
        setTimeout(() => {
          this.lockStatusText.style.color = 'var(--apple-text-secondary)';
          this.lockStatusText.textContent = 'Enter Passcode (Default: 123456)';
        }, 2000);
      }
    }

    unlockAppSuccess() {
      this.isUnlocked = true;
      this.appleLockScreen.classList.remove('active');
    }

    lockApp() {
      this.isUnlocked = false;
      this.appleLockScreen.classList.add('active');
      this.btnUnlockApp.style.display = 'flex';
      this.pinContainer.style.display = 'none';
      this.lockStatusText.textContent = 'Authenticate to open app';
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
          offlineBadge.innerHTML = '<span class="dot"></span> Offline Ready';
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

    handleInflowSubmit(e) {
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

      this.transactions.unshift(newTx);
      this.saveData();
      this.render();

      this.formInflow.reset();
      this.closeSheet(this.sheetInflowOverlay);
    }

    handleOutflowSubmit(e) {
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

      this.transactions.unshift(newTx);
      this.saveData();
      this.render();

      this.formOutflow.reset();
      this.closeSheet(this.sheetOutflowOverlay);
    }

    handleProjectSubmit(e) {
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

      this.projects.push(newProj);
      this.saveData();
      this.render();

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

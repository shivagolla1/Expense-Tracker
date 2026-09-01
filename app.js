/**
 * AAKRUTHEE - Clean Production Cash Engine & Cloud PostgreSQL Sync
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    PROJECTS: 'aakruthee_projects_prod_v3',
    TRANSACTIONS: 'aakruthee_transactions_prod_v3',
    PASSKEY_CRED_ID: 'aakruthee_passkey_cred_id_prod_v3',
    NOTIF_ONBOARDED: 'aakruthee_notif_onboarded_v1'
  };

  class AakrutheeApp {
    constructor() {
      this.projects = [];
      this.transactions = [];
      this.activeTab = 'view-quick-entry';
      this.activeProjectId = null;
      this.activityFilter = 'all';
      this.isUnlocked = false;

      this.selectedTxForAction = null;
      this.editingTxId = null;
      this.vapidPublicKey = null;

      this.init();
    }

    async init() {
      this.cacheDOMElements();
      this.bindEvents();
      this.bindLiveAmountInputs();
      this.checkOfflineStatus();
      this.initAppLifecycleSecurity();
      this.initStrictLock();
      this.registerServiceWorker();

      this.clearLegacyDummyCache();
      await this.loadCloudData();
      await this.fetchVapidKey();
    }

    async registerServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js');
          this.swRegistration = reg;
          console.log('Service Worker registered successfully:', reg.scope);
        } catch (err) {
          console.log('Service Worker registration failed:', err);
        }
      }
    }

    async fetchVapidKey() {
      try {
        const res = await fetch('/api/vapid-public-key');
        if (res.ok) {
          const data = await res.json();
          if (data.success) this.vapidPublicKey = data.publicKey;
        }
      } catch (err) {
        console.log('Error fetching VAPID public key:', err);
      }
    }

    showToast(message, type = 'success') {
      if (!this.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = `apple-toast ${type}`;
      const icon = type === 'success' ? '✓' : '✕';
      toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${this.escapeHTML(message)}</span>`;

      this.toastContainer.appendChild(toast);

      setTimeout(() => toast.classList.add('active'), 50);

      setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 350);
      }, 2800);
    }

    checkFirstTimeNotificationOnboarding() {
      const onboarded = localStorage.getItem(STORAGE_KEYS.NOTIF_ONBOARDED);
      if (!onboarded && ('Notification' in window)) {
        setTimeout(() => {
          this.openSheet(this.sheetNotifOnboardingOverlay);
        }, 800);
      }
    }

    async handleEnableNotifications() {
      localStorage.setItem(STORAGE_KEYS.NOTIF_ONBOARDED, 'true');
      this.closeSheet(this.sheetNotifOnboardingOverlay);

      try {
        if (!('Notification' in window)) {
          this.showToast('Notifications not supported on this browser', 'error');
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await this.subscribeUserToWebPush();
          this.showToast('✓ Daily 9 AM & 9 PM Reminders Enabled!', 'success');
        } else {
          this.showToast('Notifications permission not granted', 'error');
        }
      } catch (err) {
        console.log('Error requesting notification permission:', err);
      }
    }

    async subscribeUserToWebPush() {
      if (!this.swRegistration || !this.vapidPublicKey) return;
      try {
        const sub = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
        });

        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub)
        });
      } catch (err) {
        console.log('Failed to subscribe user to push:', err);
      }
    }

    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    clearLegacyDummyCache() {
      ['aakruthee_projects_v10', 'aakruthee_transactions_v10', 'aakruthee_projects_v9', 'aakruthee_transactions_v9', 'aakruthee_projects_v8', 'aakruthee_transactions_v8', 'atelier_flow_projects_v4', 'atelier_flow_transactions_v4', 'aakruthee_projects_prod_v1', 'aakruthee_transactions_prod_v1', 'aakruthee_projects_prod_v2', 'aakruthee_transactions_prod_v2'].forEach(key => {
        localStorage.removeItem(key);
      });
    }

    // INDIAN NUMBER FORMATTING HELPERS
    parseAmount(valStr) {
      if (!valStr) return 0;
      const clean = String(valStr).replace(/,/g, '').trim();
      return parseFloat(clean) || 0;
    }

    formatIndianNumberString(valStr) {
      if (!valStr) return '';
      const digits = String(valStr).replace(/[^0-9.]/g, '');
      if (!digits) return '';
      const parts = digits.split('.');
      let integerPart = parts[0];
      const decimalPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

      if (integerPart.length > 3) {
        const lastThree = integerPart.substring(integerPart.length - 3);
        const otherNumbers = integerPart.substring(0, integerPart.length - 3);
        integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
      }
      return integerPart + decimalPart;
    }

    getIndianShortText(num) {
      if (!num || num <= 0) return '';
      if (num >= 10000000) {
        const val = (num / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 });
        return `${val} Crores`;
      }
      if (num >= 100000) {
        const val = (num / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 });
        return `${val} Lakhs`;
      }
      if (num >= 1000) {
        const val = (num / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 });
        return `${val} Thousand`;
      }
      return `${num.toLocaleString('en-IN')}`;
    }

    bindLiveAmountInputs() {
      const setupLiveFormatting = (inputId, subtextId) => {
        const input = document.getElementById(inputId);
        const subtext = document.getElementById(subtextId);
        if (!input || !subtext) return;

        input.addEventListener('input', () => {
          const rawVal = input.value;
          const formatted = this.formatIndianNumberString(rawVal);
          input.value = formatted;

          const numVal = this.parseAmount(formatted);
          subtext.textContent = this.getIndianShortText(numVal);
        });
      };

      setupLiveFormatting('inflow-amount', 'inflow-amount-subtext');
      setupLiveFormatting('outflow-amount', 'outflow-amount-subtext');
      setupLiveFormatting('proj-budget', 'proj-budget-subtext');
    }

    // CLOUD API INTEGRATION
    async loadCloudData() {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            this.projects = (data.projects || []).filter(p => !['proj-1', 'proj-2', 'proj-3'].includes(p.id));
            this.transactions = (data.transactions || []).filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id) && !['proj-1', 'proj-2', 'proj-3'].includes(t.projectId));
            this.saveLocalCache();
            this.render();
            return;
          }
        }
      } catch (err) {
        console.log('Cloud API offline, loading from local cache:', err);
      }

      this.loadLocalCache();
      this.render();
    }

    loadLocalCache() {
      const storedProj = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);

      if (storedProj && storedTx) {
        try {
          this.projects = JSON.parse(storedProj) || [];
          this.transactions = JSON.parse(storedTx) || [];
        } catch (e) {
          this.projects = [];
          this.transactions = [];
        }
      } else {
        this.projects = [];
        this.transactions = [];
      }
    }

    saveLocalCache() {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    }

    async saveTransactionToCloud(newTx) {
      if (this.editingTxId) {
        const idx = this.transactions.findIndex(t => t.id === this.editingTxId);
        if (idx !== -1) {
          this.transactions[idx] = { ...this.transactions[idx], ...newTx };
        }
        const updatedId = this.editingTxId;
        this.editingTxId = null;
        this.saveLocalCache();
        this.render();

        try {
          const response = await fetch(`/api/transactions/${updatedId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTx)
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.transactions) {
              this.transactions = data.transactions.filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id));
              this.saveLocalCache();
              this.render();
            }
          }
        } catch (err) {
          console.log('Failed to update transaction on cloud, saved locally:', err);
        }
        this.showToast(`Updated entry: ${this.formatCurrency(newTx.amount)}`, 'success');
        return;
      }

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
            this.transactions = data.transactions.filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id));
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to post transaction to Cloud API, saved locally:', err);
      }

      const typeLabel = newTx.type === 'expense' ? 'Money Out' : 'Money In';
      this.showToast(`Saved ${typeLabel}: ${this.formatCurrency(newTx.amount)}`, 'success');
    }

    async deleteTransactionFromCloud(txId) {
      if (!txId) return;

      this.transactions = this.transactions.filter(t => t.id !== txId);
      this.saveLocalCache();
      this.render();
      this.showToast('Transaction deleted', 'success');

      try {
        const response = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.transactions) {
            this.transactions = data.transactions.filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id));
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to delete transaction on cloud, updated locally:', err);
      }
    }

    async saveProjectToCloud(newProj) {
      this.projects.push(newProj);
      this.saveLocalCache();
      this.render();
      this.showToast(`Project "${newProj.name}" created`, 'success');

      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProj)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.projects) {
            this.projects = data.projects.filter(p => !['proj-1', 'proj-2', 'proj-3'].includes(p.id));
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to post project to Cloud API, saved locally:', err);
      }
    }

    async deleteProjectFromCloud(projectId) {
      if (!projectId) return;
      const proj = this.projects.find(p => p.id === projectId);
      const projName = proj ? proj.name : 'this project';

      if (!confirm(`Are you sure you want to delete "${projName}" and all its transactions?`)) {
        return;
      }

      this.projects = this.projects.filter(p => p.id !== projectId);
      this.transactions = this.transactions.filter(t => t.projectId !== projectId);
      this.saveLocalCache();
      this.switchTab('view-dashboard');
      this.showToast(`Deleted project "${projName}"`, 'success');

      try {
        const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            this.projects = (data.projects || []).filter(p => !['proj-1', 'proj-2', 'proj-3'].includes(p.id));
            this.transactions = (data.transactions || []).filter(t => !['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105', 'tx-106'].includes(t.id));
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to delete project on server, updated locally:', err);
      }
    }

    cacheDOMElements() {
      this.toastContainer = document.getElementById('apple-toast-container');

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
      this.btnDeleteProject = document.getElementById('btn-delete-project');

      this.fullProjTitle = document.getElementById('full-proj-title');
      this.fullProjClient = document.getElementById('full-proj-client');
      this.fullProjBudgetBadge = document.getElementById('full-proj-budget-badge');

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
      this.sheetTxActionOverlay = document.getElementById('sheet-tx-action-overlay');
      this.sheetNotifOnboardingOverlay = document.getElementById('sheet-notif-onboarding-overlay');

      this.formInflow = document.getElementById('form-inflow');
      this.formOutflow = document.getElementById('form-outflow');
      this.formProject = document.getElementById('form-project');

      this.inflowProjectChips = document.getElementById('inflow-project-chips');
      this.outflowProjectChips = document.getElementById('outflow-project-chips');

      this.inflowSheetTitle = document.getElementById('inflow-sheet-title');
      this.outflowSheetTitle = document.getElementById('outflow-sheet-title');
      this.btnSubmitInflow = document.getElementById('btn-submit-inflow');
      this.btnSubmitOutflow = document.getElementById('btn-submit-outflow');

      this.txActionSummary = document.getElementById('tx-action-summary');
      this.btnEditTxAction = document.getElementById('btn-edit-tx-action');
      this.btnDeleteTxAction = document.getElementById('btn-delete-tx-action');

      this.btnEnableNotifications = document.getElementById('btn-enable-notifications');
      this.btnSkipNotifications = document.getElementById('btn-skip-notifications');
    }

    bindEvents() {
      this.btnUnlockApp.addEventListener('click', () => this.handleUnlockButtonClick());
      this.btnManualLock.addEventListener('click', () => this.lockApp());

      this.navItems.forEach(nav => {
        nav.addEventListener('click', () => {
          const targetTab = nav.getAttribute('data-tab');
          this.switchTab(targetTab);
        });
      });

      this.heroBtnInflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.inflowSheetTitle.textContent = 'Record Money In';
        this.btnSubmitInflow.textContent = 'Save Money In';
        document.getElementById('inflow-amount-subtext').textContent = '';
        this.openSheet(this.sheetInflowOverlay);
      });

      this.heroBtnOutflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.outflowSheetTitle.textContent = 'Record Money Out';
        this.btnSubmitOutflow.textContent = 'Save Money Out';
        document.getElementById('outflow-amount-subtext').textContent = '';
        this.openSheet(this.sheetOutflowOverlay);
      });

      this.btnDashboardAddProj.addEventListener('click', () => {
        document.getElementById('proj-budget-subtext').textContent = '';
        this.openSheet(this.sheetProjectOverlay);
      });
      this.btnBackToDashboard.addEventListener('click', () => this.switchTab('view-dashboard'));
      this.btnDeleteProject.addEventListener('click', () => this.deleteProjectFromCloud(this.activeProjectId));

      this.fullProjBtnInflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.inflowSheetTitle.textContent = 'Record Money In';
        this.btnSubmitInflow.textContent = 'Save Money In';
        document.getElementById('inflow-amount-subtext').textContent = '';
        this.openSheetWithProject(this.sheetInflowOverlay, this.activeProjectId);
      });

      this.fullProjBtnOutflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.outflowSheetTitle.textContent = 'Record Money Out';
        this.btnSubmitOutflow.textContent = 'Save Money Out';
        document.getElementById('outflow-amount-subtext').textContent = '';
        this.openSheetWithProject(this.sheetOutflowOverlay, this.activeProjectId);
      });

      // Action Sheet Events
      this.btnEditTxAction.addEventListener('click', () => {
        if (this.selectedTxForAction) {
          const tx = this.selectedTxForAction;
          this.closeSheet(this.sheetTxActionOverlay);
          this.startEditingTransaction(tx);
        }
      });

      this.btnDeleteTxAction.addEventListener('click', () => {
        if (this.selectedTxForAction) {
          const tx = this.selectedTxForAction;
          if (confirm(`Delete transaction "${tx.note || tx.category || 'Entry'}" of ${this.formatCurrency(tx.amount)}?`)) {
            this.closeSheet(this.sheetTxActionOverlay);
            this.deleteTransactionFromCloud(tx.id);
          }
        }
      });

      // Notification Onboarding Events
      this.btnEnableNotifications.addEventListener('click', () => this.handleEnableNotifications());
      this.btnSkipNotifications.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEYS.NOTIF_ONBOARDED, 'true');
        this.closeSheet(this.sheetNotifOnboardingOverlay);
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

    openTxActionSheet(tx) {
      this.selectedTxForAction = tx;
      const proj = this.projects.find(p => p.id === tx.projectId) || { name: 'General Project' };
      const dateStr = new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      let typeLabel = 'Expense';
      if (tx.type === 'client_payment') typeLabel = 'Client Advance (Money In)';
      if (tx.type === 'vendor_commission') typeLabel = 'Vendor Commission (Money In)';

      this.txActionSummary.innerHTML = `
        <div class="tx-action-row-item">
          <span class="lbl">Amount</span>
          <span class="val" style="font-size:16px; font-weight:700;">${this.formatCurrency(tx.amount)}</span>
        </div>
        <div class="tx-action-row-item">
          <span class="lbl">Type / Category</span>
          <span class="val">${this.escapeHTML(tx.category || typeLabel)}</span>
        </div>
        <div class="tx-action-row-item">
          <span class="lbl">Project</span>
          <span class="val">${this.escapeHTML(proj.name)}</span>
        </div>
        <div class="tx-action-row-item">
          <span class="lbl">Payment Mode</span>
          <span class="val">${tx.mode || 'UPI'}</span>
        </div>
        <div class="tx-action-row-item">
          <span class="lbl">Note / Vendor</span>
          <span class="val">${this.escapeHTML(tx.note || '—')}</span>
        </div>
        <div class="tx-action-row-item">
          <span class="lbl">Date</span>
          <span class="val">${dateStr}</span>
        </div>
      `;

      this.openSheet(this.sheetTxActionOverlay);
    }

    startEditingTransaction(tx) {
      this.editingTxId = tx.id;
      const formattedAmt = this.formatIndianNumberString(String(tx.amount));

      if (tx.type === 'expense') {
        document.getElementById('outflow-amount').value = formattedAmt;
        document.getElementById('outflow-amount-subtext').textContent = this.getIndianShortText(tx.amount);
        document.getElementById('outflow-note').value = tx.note || '';
        
        const catRadio = document.querySelector(`input[name="outflow_cat"][value="${tx.category}"]`);
        if (catRadio) catRadio.checked = true;

        const modeRadio = document.querySelector(`input[name="outflow_mode"][value="${tx.mode}"]`);
        if (modeRadio) modeRadio.checked = true;

        this.outflowSheetTitle.textContent = 'Edit Money Out';
        this.btnSubmitOutflow.textContent = 'Update Transaction';
        this.openSheetWithProject(this.sheetOutflowOverlay, tx.projectId);
      } else {
        document.getElementById('inflow-amount').value = formattedAmt;
        document.getElementById('inflow-amount-subtext').textContent = this.getIndianShortText(tx.amount);
        document.getElementById('inflow-note').value = tx.note || '';

        const typeRadio = document.querySelector(`input[name="inflow_type"][value="${tx.type}"]`);
        if (typeRadio) typeRadio.checked = true;

        const modeRadio = document.querySelector(`input[name="inflow_mode"][value="${tx.mode}"]`);
        if (modeRadio) modeRadio.checked = true;

        this.inflowSheetTitle.textContent = 'Edit Money In';
        this.btnSubmitInflow.textContent = 'Update Transaction';
        this.openSheetWithProject(this.sheetInflowOverlay, tx.projectId);
      }
    }

    // IRONCLAD APP SWITCHER PRIVACY BLUR MASK
    initAppLifecycleSecurity() {
      const lockPrivacyMask = () => {
        document.body.classList.add('app-privacy-locked');
        if (this.privacyShield) this.privacyShield.classList.add('active');
        if (this.appleLockScreen) this.appleLockScreen.classList.add('active');
        this.isUnlocked = false;
      };

      const unlockPrivacyMask = () => {
        if (this.isUnlocked) {
          document.body.classList.remove('app-privacy-locked');
          if (this.privacyShield) this.privacyShield.classList.remove('active');
          if (this.appleLockScreen) this.appleLockScreen.classList.remove('active');
        }
      };

      // Instantly apply blur mask on background / app switch / focus loss
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          lockPrivacyMask();
        } else if (document.visibilityState === 'visible') {
          if (!this.isUnlocked) {
            lockPrivacyMask();
            setTimeout(() => this.handleUnlockButtonClick(), 150);
          } else {
            unlockPrivacyMask();
          }
        }
      });

      ['pagehide', 'blur', 'freeze'].forEach(evt => {
        window.addEventListener(evt, lockPrivacyMask);
      });
    }

    initStrictLock() {
      this.isUnlocked = false;
      document.body.classList.add('app-privacy-locked');
      if (this.privacyShield) this.privacyShield.classList.remove('active');
      if (this.appleLockScreen) this.appleLockScreen.classList.add('active');

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
        this.unlockAppSuccess();
      }
    }

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
        this.unlockAppSuccess();
      }
    }

    unlockAppSuccess() {
      this.isUnlocked = true;
      document.body.classList.remove('app-privacy-locked');
      if (this.appleLockScreen) this.appleLockScreen.classList.remove('active');
      if (this.privacyShield) this.privacyShield.classList.remove('active');

      this.checkFirstTimeNotificationOnboarding();
    }

    lockApp() {
      this.isUnlocked = false;
      document.body.classList.add('app-privacy-locked');
      if (this.privacyShield) this.privacyShield.classList.remove('active');
      if (this.appleLockScreen) this.appleLockScreen.classList.add('active');
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
      const firstInput = overlay.querySelector('input[type="text"]');
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

      if (!this.projects || this.projects.length === 0) {
        this.dashboardProjectsGrid.innerHTML = `
          <div style="text-align:center; padding:40px 20px; color:var(--apple-text-secondary);">
            <div style="font-size:32px; margin-bottom:8px;">🏗️</div>
            <div style="font-size:16px; font-weight:600; color:var(--apple-text); margin-bottom:4px;">No Projects Yet</div>
            <div style="font-size:13px;">Tap "+ New Project" above to create your first client project!</div>
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

      if (proj.budget && Number(proj.budget) > 0) {
        this.fullProjBudgetBadge.textContent = `• Est. Budget: ${this.formatCurrency(proj.budget)}`;
        this.fullProjBudgetBadge.style.display = 'inline-block';
      } else {
        this.fullProjBudgetBadge.style.display = 'none';
      }

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
        if (!this.projects || this.projects.length === 0) {
          return `<div style="font-size:13px; color:var(--apple-text-secondary);">Please create a project first!</div>`;
        }
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

      item.addEventListener('click', () => {
        this.openTxActionSheet(tx);
      });

      return item;
    }

    async handleInflowSubmit(e) {
      e.preventDefault();
      const rawAmt = document.getElementById('inflow-amount').value;
      const amountVal = this.parseAmount(rawAmt);
      if (!amountVal || amountVal <= 0) return;

      const selectedProj = this.formInflow.querySelector('input[name="inflow_project"]:checked');
      if (!selectedProj) {
        alert('Please create a project first before recording transactions!');
        return;
      }

      const type = this.formInflow.querySelector('input[name="inflow_type"]:checked').value;
      const projectId = selectedProj.value;
      const mode = this.formInflow.querySelector('input[name="inflow_mode"]:checked').value;
      const note = document.getElementById('inflow-note').value.trim();

      const newTx = {
        id: this.editingTxId || ('tx-' + Date.now()),
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
      document.getElementById('inflow-amount-subtext').textContent = '';
      this.closeSheet(this.sheetInflowOverlay);
    }

    async handleOutflowSubmit(e) {
      e.preventDefault();
      const rawAmt = document.getElementById('outflow-amount').value;
      const amountVal = this.parseAmount(rawAmt);
      if (!amountVal || amountVal <= 0) return;

      const selectedProj = this.formOutflow.querySelector('input[name="outflow_project"]:checked');
      if (!selectedProj) {
        alert('Please create a project first before recording transactions!');
        return;
      }

      const projectId = selectedProj.value;
      const category = this.formOutflow.querySelector('input[name="outflow_cat"]:checked').value;
      const mode = this.formOutflow.querySelector('input[name="outflow_mode"]:checked').value;
      const note = document.getElementById('outflow-note').value.trim();

      const newTx = {
        id: this.editingTxId || ('tx-' + Date.now()),
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
      document.getElementById('outflow-amount-subtext').textContent = '';
      this.closeSheet(this.sheetOutflowOverlay);
    }

    async handleProjectSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('proj-name').value.trim();
      const client = document.getElementById('proj-client').value.trim();
      const rawBudget = document.getElementById('proj-budget').value;
      const budgetVal = this.parseAmount(rawBudget);

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
      document.getElementById('proj-budget-subtext').textContent = '';
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

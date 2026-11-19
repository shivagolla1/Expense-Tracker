/**
 * AAKRUTHEE - Clean Production Cash Engine & Cloud PostgreSQL Sync
 */

(function () {
  'use strict';

  const STORAGE_KEYS = {
    PROJECTS: 'aakruthee_projects_prod_v3',
    TRANSACTIONS: 'aakruthee_transactions_prod_v3',
    LEADS: 'aakruthee_leads_prod_v1',
    TASKS: 'aakruthee_tasks_prod_v1',
    QUOTES: 'aakruthee_quotes_prod_v1',
    PASSKEY_CRED_ID: 'aakruthee_passkey_cred_id_prod_v3',
    NOTIF_ONBOARDED: 'aakruthee_notif_onboarded_v1'
  };

  const ROOM_CATALOG = {
    'Living Room': {
      icon: '🛋️',
      items: [
        { name: 'TV Unit & Wall Panelling', rate: 1450, unit: 'sft', notes: 'HDHMR with 1mm Merino laminate + louvers' },
        { name: 'Gypsum False Ceiling', rate: 130, unit: 'sft', notes: 'Saint-Gobain gypsum + cove lighting provision' },
        { name: 'Wall Panelling / Louvers', rate: 950, unit: 'sft', notes: 'Charcoal / wooden fluted louvers' },
        { name: 'Foyer Shoe Console', rate: 1200, unit: 'sft', notes: 'Cushioned seating + footwear storage' },
        { name: 'CNC Jali Partition', rate: 1800, unit: 'sft', notes: 'MDF / PVC CNC with PU finish frame' },
        { name: 'Bay Window Seating', rate: 1100, unit: 'sft', notes: 'Storage bench with top cushioning' }
      ]
    },
    'Modular Kitchen': {
      icon: '🍳',
      items: [
        { name: 'BWP Marine Base Cabinets', rate: 1750, unit: 'sft', notes: '710 BWP Marine ply + acrylic / laminate shutters' },
        { name: 'Wall Overhead Cabinets', rate: 1400, unit: 'sft', notes: 'Soft-close lift up / glass shutters' },
        { name: 'Full Height Lofts', rate: 950, unit: 'sft', notes: 'Storage lofts up to ceiling' },
        { name: 'Tall Pantry / Microwave Unit', rate: 1600, unit: 'sft', notes: 'In-built appliance and pantry storage' },
        { name: 'Quartz / Granite Countertop', rate: 450, unit: 'sft', notes: 'Supply & edge moulding fixing' },
        { name: 'Cutlery & Tandem Baskets', rate: 28000, unit: 'lumpsum', notes: 'Hafele / Hettich soft-close drawer kits' },
        { name: 'Breakfast Counter', rate: 1500, unit: 'sft', notes: 'Island / ledge breakfast counter with support' }
      ]
    },
    'Master Bedroom': {
      icon: '🛏️',
      items: [
        { name: '3-Door Sliding Wardrobe', rate: 1650, unit: 'sft', notes: 'Anti-bend sliding hardware + lofts' },
        { name: 'Hinged Wardrobe with Lofts', rate: 1400, unit: 'sft', notes: 'Soft-close hinges + handles' },
        { name: 'King Bed with Storage & Headboard', rate: 55000, unit: 'lumpsum', notes: 'Hydraulic lift storage + upholstered headboard' },
        { name: 'Dresser Unit with Full Mirror', rate: 18000, unit: 'lumpsum', notes: 'Drawer console + profile LED mirror' },
        { name: 'Study Desk & Overhead Storage', rate: 1250, unit: 'sft', notes: 'Computer desk + floating wall shelves' },
        { name: 'False Ceiling & Spotlights', rate: 130, unit: 'sft', notes: 'Gypsum ceiling design' }
      ]
    },
    'Kids Bedroom': {
      icon: '🛏️',
      items: [
        { name: 'Wardrobe with Study Desk', rate: 1450, unit: 'sft', notes: 'Combined storage and study unit' },
        { name: 'Single / Bunk Bed with Storage', rate: 38000, unit: 'lumpsum', notes: 'Safety rails + lower storage drawers' },
        { name: 'Bookshelf & Toy Display Unit', rate: 1100, unit: 'sft', notes: 'Open & closed colorful laminate cubbies' },
        { name: 'False Ceiling', rate: 130, unit: 'sft', notes: 'Theme lighting ceiling' }
      ]
    },
    'Guest Bedroom': {
      icon: '🛏️',
      items: [
        { name: 'Hinged Wardrobe with Lofts', rate: 1350, unit: 'sft', notes: 'MR grade ply + 1mm laminate' },
        { name: 'Queen Bed with Storage', rate: 42000, unit: 'lumpsum', notes: 'Box storage + headboard' },
        { name: 'Bedside Tables (Pair)', rate: 12000, unit: 'lumpsum', notes: 'Dual drawer units' },
        { name: 'Dresser Unit', rate: 14000, unit: 'lumpsum', notes: 'Mirror + storage shelf' }
      ]
    },
    'Dining Room': {
      icon: '🍽️',
      items: [
        { name: 'Crockery Unit with Glass Shutters', rate: 1550, unit: 'sft', notes: 'Fluted glass / profile shutters + LED strips' },
        { name: 'Handwash Basin Vanity & Panelling', rate: 22000, unit: 'lumpsum', notes: 'Storage cabinet + stone counter + mirror' },
        { name: 'Dining Wall Panelling', rate: 950, unit: 'sft', notes: 'Decorative acoustic / wooden panelling' }
      ]
    },
    'Pooja Room': {
      icon: '🪔',
      items: [
        { name: 'CNC Mandir Unit with Brass Bells', rate: 45000, unit: 'lumpsum', notes: 'Teak finish / Corian mandir unit' },
        { name: 'Pooja Storage Drawers', rate: 1200, unit: 'sft', notes: 'Prasad & pooja accessories drawers' },
        { name: 'Backlit Panel / Om CNC', rate: 1400, unit: 'sft', notes: 'Warm white LED backlit panel' }
      ]
    },
    'Balcony / Utility': {
      icon: '🪟',
      items: [
        { name: 'Washing Machine Utility Cabinet', rate: 1300, unit: 'sft', notes: 'Waterproof ply storage unit' },
        { name: 'Vertical Garden / Wall Cladding', rate: 850, unit: 'sft', notes: 'WPC exterior louvers' },
        { name: 'Balcony Deck Tiles', rate: 280, unit: 'sft', notes: 'Outdoor weather-resistant tiles' }
      ]
    }
  };

  class AakrutheeApp {
    constructor() {
      this.ENABLE_LEADS_TAB = false;
      this.projects = [];
      this.transactions = [];
      this.leads = [];
      this.tasks = [];
      this.quotes = [];
      
      this.activeTab = 'view-quick-entry';
      this.activeProjectId = null;
      this.activeQuoteId = null;
      this.activeRoomIdForItems = null;
      this.editingItemId = null;
      this.itemCalcMode = 'area'; // 'area' | 'lumpsum'

      this.activityFilter = 'all';
      this.isUnlocked = false;

      this.tasksSubView = 'calendar'; // 'calendar' | 'tasks'
      this.taskFilter = 'all'; // 'all' | 'today' | 'scheduled' | 'completed'
      this.calendarCurrentDate = new Date();
      this.calendarSelectedDateStr = new Date().toISOString().split('T')[0];

      this.selectedTxForAction = null;
      this.editingTxId = null;
      this.convertingLeadId = null;
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
      this.initIOSSwipeToBack();
      await this.registerServiceWorker();

      this.clearLegacyDummyCache();
      await this.loadCloudData();
      await this.fetchVapidKey();
      this.listenForNotificationDeepLinks();
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
        if (toast.parentNode) {
          toast.classList.remove('active');
          setTimeout(() => toast.remove(), 350);
        }
      }, 2800);
    }

    showToastWithAction(message, actionLabel, onActionClick, type = 'success') {
      if (!this.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = `apple-toast ${type}`;
      toast.style.display = 'flex';
      toast.style.alignItems = 'center';
      toast.style.justifyContent = 'space-between';
      toast.style.gap = '12px';
      toast.style.maxWidth = '92%';

      const icon = type === 'success' ? '✓' : 'ℹ';
      toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="toast-icon">${icon}</span>
          <span>${this.escapeHTML(message)}</span>
        </div>
        <button class="toast-action-btn" style="background:#0071e3; color:#ffffff; border:none; padding:6px 12px; border-radius:14px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; flex-shrink:0;">
          ${this.escapeHTML(actionLabel)}
        </button>
      `;

      const actionBtn = toast.querySelector('.toast-action-btn');
      if (actionBtn && onActionClick) {
        actionBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onActionClick();
          toast.classList.remove('active');
          setTimeout(() => toast.remove(), 300);
        });
      }

      this.toastContainer.appendChild(toast);
      setTimeout(() => toast.classList.add('active'), 50);

      setTimeout(() => {
        if (toast.parentNode) {
          toast.classList.remove('active');
          setTimeout(() => toast.remove(), 350);
        }
      }, 3000);
    }

    getWhatsAppStatement(projectId) {
      const proj = this.projects.find(p => p.id === projectId) || { name: 'Project', client: 'Client' };
      
      const advances = this.transactions
        .filter(t => t.projectId === projectId && (t.type === 'client_payment' || t.type === 'vendor_commission'))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      let totalReceived = 0;
      const listLines = advances.map(t => {
        const amt = Number(t.amount) || 0;
        totalReceived += amt;
        return this.formatIndianNumberString(String(amt));
      });

      const totalFormatted = this.formatIndianNumberString(String(totalReceived));

      const statementText = `Payment Statement 🧾\n\nProject: ${proj.name}\nClient: ${proj.client}\n\n${listLines.join('\n')}\nTotal received: ${totalFormatted}\n\nThank you!\nAakruthee Interior Studio 🏡`;

      return encodeURIComponent(statementText);
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
          this.showToast('✓ Daily Reminders & Client Alerts Enabled!', 'success');
        } else {
          this.showToast('Notification permission denied in iOS Settings', 'error');
        }
      } catch (err) {
        console.log('Error requesting notification permission:', err);
      }
    }

    async triggerTestPushNotification() {
      try {
        if (!('Notification' in window)) {
          this.showToast('Push Notifications are not supported in this browser', 'error');
          return;
        }

        if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            this.showToast('Please enable Notifications in iOS Settings', 'error');
            return;
          }
        }

        await this.subscribeUserToWebPush();

        this.showToast('Sending Test Notification...', 'success');
        const res = await fetch('/api/test-push', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.sentCount > 0) {
            this.showToast('✓ Test Push Sent! Check your iPhone lock screen.', 'success');
          } else {
            this.showToast('No active subscription found. Re-enabling...', 'error');
            await this.subscribeUserToWebPush();
          }
        }
      } catch (err) {
        console.log('Failed to trigger test push:', err);
        this.showToast('Failed to send test push: ' + err.message, 'error');
      }
    }

    async subscribeUserToWebPush() {
      if (!this.vapidPublicKey) await this.fetchVapidKey();
      if (!this.vapidPublicKey) return;

      try {
        let swReg = this.swRegistration;
        if (!swReg && ('serviceWorker' in navigator)) {
          swReg = await navigator.serviceWorker.ready;
        }
        if (!swReg) return;

        let sub = await swReg.pushManager.getSubscription();
        if (!sub) {
          sub = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
          });
        }

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
      ['aakruthee_projects_v10', 'aakruthee_transactions_v10', 'aakruthee_projects_v9', 'aakruthee_transactions_v9'].forEach(key => {
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
      setupLiveFormatting('cfg-item-amount', 'cfg-item-amount-subtext');
      setupLiveFormatting('quote-discount-input', null);
    }

    cleanupPreviousMonthCompletedTasks() {
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const initialCount = (this.tasks || []).length;
      this.tasks = (this.tasks || []).filter(t => {
        if (t.completed) {
          const due = new Date(t.dueDate);
          return due >= startOfCurrentMonth;
        }
        return true;
      });

      if (this.tasks.length !== initialCount) {
        this.saveLocalCache();
      }
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
            this.leads = data.leads || [];
            this.tasks = data.tasks || [];
            this.quotes = data.quotes || [];
            this.cleanupPreviousMonthCompletedTasks();
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
      const storedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);

      try {
        this.projects = storedProj ? (JSON.parse(storedProj) || []) : [];
        this.transactions = storedTx ? (JSON.parse(storedTx) || []) : [];
        this.leads = storedLeads ? (JSON.parse(storedLeads) || []) : [];
        this.tasks = storedTasks ? (JSON.parse(storedTasks) || []) : [];
        this.quotes = storedQuotes ? (JSON.parse(storedQuotes) || []) : [];
        this.cleanupPreviousMonthCompletedTasks();
      } catch (e) {
        this.projects = [];
        this.transactions = [];
        this.leads = [];
        this.tasks = [];
        this.quotes = [];
      }
    }

    saveLocalCache() {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(this.leads));
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(this.quotes));
    }

    async saveLeadToCloud(newLead) {
      this.leads.push(newLead);
      this.saveLocalCache();
      this.render();
      this.showToast(`Lead "${newLead.name}" added & reminder set!`, 'success');

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLead)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.leads) {
            this.leads = data.leads;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to post lead to Cloud API, saved locally:', err);
      }
    }

    async deleteLeadFromCloud(leadId, silent = false) {
      const lead = this.leads.find(l => l.id === leadId);
      if (!lead) return;
      if (!silent && !confirm(`Delete lead "${lead.name}"?`)) return;

      this.leads = this.leads.filter(l => l.id !== leadId);
      this.saveLocalCache();
      this.render();
      if (!silent) this.showToast(`Deleted lead "${lead.name}"`, 'success');

      try {
        const response = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.leads) {
            this.leads = data.leads;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to delete lead from cloud, updated locally:', err);
      }
    }

    async convertLeadToProject(lead) {
      this.convertingLeadId = lead.id;
      document.getElementById('proj-name').value = `${lead.name} Villa Project`;
      document.getElementById('proj-client').value = lead.name;
      this.openSheet(this.sheetProjectOverlay);
    }

    // OPEN iOS TRANSACTION ACTION SHEET (EDIT / DELETE / RECEIPT)
    openTxActionSheet(tx) {
      this.selectedTxForAction = tx;
      const proj = this.projects.find(p => p.id === tx.projectId) || { name: 'General Project', client: 'Client' };
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

      if (this.convertingLeadId) {
        const leadId = this.convertingLeadId;
        this.convertingLeadId = null;
        await this.deleteLeadFromCloud(leadId, true);
        this.showToast(`Converted lead into Project "${newProj.name}"!`, 'success');
      } else {
        this.showToast(`Project "${newProj.name}" created`, 'success');
      }

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
      this.btnTestNotification = document.getElementById('btn-test-notification');
      this.lockStatusText = document.getElementById('lock-status-text');

      // Views
      this.tabViews = document.querySelectorAll('.tab-view');
      this.navItems = document.querySelectorAll('.nav-item');

      this.heroBtnInflow = document.getElementById('hero-btn-inflow');
      this.heroBtnOutflow = document.getElementById('hero-btn-outflow');

      this.dashboardProjectsGrid = document.getElementById('dashboard-projects-grid');
      this.btnDashboardAddProj = document.getElementById('dashboard-add-proj-btn');

      this.leadsGrid = document.getElementById('leads-grid');
      this.btnLeadsAdd = document.getElementById('leads-add-btn');

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
      this.sheetLeadOverlay = document.getElementById('sheet-lead-overlay');
      this.sheetTxActionOverlay = document.getElementById('sheet-tx-action-overlay');
      this.sheetNotifOnboardingOverlay = document.getElementById('sheet-notif-onboarding-overlay');

      this.formInflow = document.getElementById('form-inflow');
      this.formOutflow = document.getElementById('form-outflow');
      this.formProject = document.getElementById('form-project');
      this.formLead = document.getElementById('form-lead');

      this.inflowProjectChips = document.getElementById('inflow-project-chips');
      this.outflowProjectChips = document.getElementById('outflow-project-chips');

      this.inflowSheetTitle = document.getElementById('inflow-sheet-title');
      this.outflowSheetTitle = document.getElementById('outflow-sheet-title');
      this.btnSubmitInflow = document.getElementById('btn-submit-inflow');
      this.btnSubmitOutflow = document.getElementById('btn-submit-outflow');

      this.txActionSummary = document.getElementById('tx-action-summary');
      this.btnEditTxAction = document.getElementById('btn-edit-tx-action');
      this.btnDeleteTxAction = document.getElementById('btn-delete-tx-action');
      this.btnWaStatementAction = document.getElementById('btn-wa-statement-action');
      this.fullProjBtnWa = document.getElementById('full-proj-btn-wa');

      this.btnEnableNotifications = document.getElementById('btn-enable-notifications');
      this.btnSkipNotifications = document.getElementById('btn-skip-notifications');

      // Tasks & Calendar Elements
      this.sheetTaskOverlay = document.getElementById('sheet-task-overlay');
      this.formTask = document.getElementById('form-task');
      this.btnAddTaskFab = document.getElementById('btn-add-task-fab');
      this.tasksViewSegmented = document.getElementById('tasks-view-segmented');
      this.tasksCalendarContainer = document.getElementById('tasks-calendar-container');
      this.tasksListContainer = document.getElementById('tasks-list-container');
      this.appleCalendarGrid = document.getElementById('apple-calendar-grid');
      this.calMonthTitle = document.getElementById('cal-month-title');
      this.calPrevMonth = document.getElementById('cal-prev-month');
      this.calNextMonth = document.getElementById('cal-next-month');
      this.selectedDayTasksList = document.getElementById('selected-day-tasks-list');
      this.selectedDayHeader = document.getElementById('selected-day-header');
      this.tasksRemindersList = document.getElementById('tasks-reminders-list');
      this.taskFilterPills = document.getElementById('task-filter-pills');
      this.taskProjectIdSelect = document.getElementById('task-project-id');
      this.navItemLeads = document.getElementById('nav-item-leads');
      this.navItemTasks = document.getElementById('nav-item-tasks');

      // Quotation Builder Elements
      this.heroBtnQuotes = document.getElementById('hero-btn-quotes');
      this.viewQuotesHub = document.getElementById('view-quotes-hub');
      this.btnBackFromQuotes = document.getElementById('btn-back-from-quotes');
      this.btnCreateQuoteTop = document.getElementById('btn-create-quote-top');
      this.quotesListContainer = document.getElementById('quotes-list-container');
      this.viewQuoteDetail = document.getElementById('view-quote-detail');
      this.btnBackToQuotesHub = document.getElementById('btn-back-to-quotes-hub');
      this.btnQuoteWhatsapp = document.getElementById('btn-quote-whatsapp');
      this.btnQuotePrint = document.getElementById('btn-quote-print');
      this.btnDeleteQuote = document.getElementById('btn-delete-quote');
      this.quoteClientHeading = document.getElementById('quote-client-heading');
      this.quoteProjectSub = document.getElementById('quote-project-sub');
      this.quoteStatusPill = document.getElementById('quote-status-pill');
      this.quoteNetTotalDisplay = document.getElementById('quote-net-total-display');
      this.quoteAmountWords = document.getElementById('quote-amount-words');
      this.quoteGrossDisplay = document.getElementById('quote-gross-display');
      this.quoteDiscountDisplay = document.getElementById('quote-discount-display');
      this.quoteRoomsCount = document.getElementById('quote-rooms-count');
      this.quoteRoomsContainer = document.getElementById('quote-rooms-container');
      this.btnAddRoomTrigger = document.getElementById('btn-add-room-trigger');
      this.btnAddRoomBottom = document.getElementById('btn-add-room-bottom');
      this.quoteDiscountInput = document.getElementById('quote-discount-input');
      this.quoteGstToggle = document.getElementById('quote-gst-toggle');
      this.milestone10 = document.getElementById('milestone-10');
      this.milestone401 = document.getElementById('milestone-40-1');
      this.milestone402 = document.getElementById('milestone-40-2');
      this.milestone102 = document.getElementById('milestone-10-2');
      this.btnBottomQuoteWa = document.getElementById('btn-bottom-quote-wa');
      this.btnBottomQuotePrint = document.getElementById('btn-bottom-quote-print');
      this.sheetNewQuoteOverlay = document.getElementById('sheet-new-quote-overlay');
      this.formNewQuote = document.getElementById('form-new-quote');
      this.sheetAddRoomOverlay = document.getElementById('sheet-add-room-overlay');
      this.roomPresetsContainer = document.getElementById('room-presets-container');
      this.formCustomRoom = document.getElementById('form-custom-room');
      this.customRoomNameInput = document.getElementById('custom-room-name-input');
      this.sheetSelectItemOverlay = document.getElementById('sheet-select-item-overlay');
      this.selectItemRoomTitle = document.getElementById('select-item-room-title');
      this.catalogItemsContainer = document.getElementById('catalog-items-container');
      this.btnTriggerCustomItem = document.getElementById('btn-trigger-custom-item');
      this.sheetConfigureItemOverlay = document.getElementById('sheet-configure-item-overlay');
      this.itemContextBanner = document.getElementById('item-context-banner');
      this.formConfigureItem = document.getElementById('form-configure-item');
      this.cfgModeSegmented = document.getElementById('cfg-mode-segmented');
      this.cfgAreaGroup = document.getElementById('cfg-area-group');
      this.cfgItemName = document.getElementById('cfg-item-name');
      this.cfgItemWidth = document.getElementById('cfg-item-width');
      this.cfgItemHeight = document.getElementById('cfg-item-height');
      this.cfgItemSft = document.getElementById('cfg-item-sft');
      this.cfgItemRate = document.getElementById('cfg-item-rate');
      this.cfgItemAmount = document.getElementById('cfg-item-amount');
      this.cfgItemAmountSubtext = document.getElementById('cfg-item-amount-subtext');
      this.cfgItemNotes = document.getElementById('cfg-item-notes');
      this.printQuotationView = document.getElementById('print-quotation-view');
    }

    bindEvents() {
      // Manage Leads / Tasks Navigation according to ENABLE_LEADS_TAB flag
      if (this.navItemLeads && this.navItemTasks) {
        if (!this.ENABLE_LEADS_TAB) {
          this.navItemLeads.style.display = 'none';
          this.navItemTasks.style.display = 'flex';
        } else {
          this.navItemLeads.style.display = 'flex';
          this.navItemTasks.style.display = 'flex';
        }
      }

      this.btnUnlockApp.addEventListener('click', () => this.handleUnlockButtonClick());
      this.btnManualLock.addEventListener('click', () => this.lockApp());
      if (this.btnTestNotification) {
        this.btnTestNotification.addEventListener('click', () => this.triggerTestPushNotification());
      }

      this.navItems.forEach(nav => {
        nav.addEventListener('click', () => {
          const targetTab = nav.getAttribute('data-tab');
          this.switchTab(targetTab);
        });
      });

      this.heroBtnInflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.formInflow.reset();
        this.inflowSheetTitle.textContent = 'Record Money In';
        this.btnSubmitInflow.textContent = 'Save Money In';
        document.getElementById('inflow-amount-subtext').textContent = '';
        this.openSheet(this.sheetInflowOverlay);
      });

      this.heroBtnOutflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.formOutflow.reset();
        this.outflowSheetTitle.textContent = 'Record Money Out';
        this.btnSubmitOutflow.textContent = 'Save Money Out';
        document.getElementById('outflow-amount-subtext').textContent = '';
        this.openSheet(this.sheetOutflowOverlay);
      });

      this.btnDashboardAddProj.addEventListener('click', () => {
        this.convertingLeadId = null;
        document.getElementById('proj-budget-subtext').textContent = '';
        this.openSheet(this.sheetProjectOverlay);
      });

      if (this.btnLeadsAdd) {
        this.btnLeadsAdd.addEventListener('click', () => {
          const today = new Date().toISOString().split('T')[0];
          document.getElementById('lead-date').value = today;
          this.openSheet(this.sheetLeadOverlay);
        });
      }

      // FAB ADD TASK BUTTON
      if (this.btnAddTaskFab) {
        this.btnAddTaskFab.addEventListener('click', () => {
          if (this.formTask) this.formTask.reset();
          const today = new Date().toISOString().split('T')[0];
          const taskDateInput = document.getElementById('task-date');
          if (taskDateInput) taskDateInput.value = this.calendarSelectedDateStr || today;
          this.renderProjectSelectOptions();
          this.openSheet(this.sheetTaskOverlay);
        });
      }

      // TASKS SEGMENTED VIEW SWITCHER
      if (this.tasksViewSegmented) {
        this.tasksViewSegmented.addEventListener('click', (e) => {
          const btn = e.target.closest('.segment');
          if (btn) {
            this.tasksViewSegmented.querySelectorAll('.segment').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const subview = btn.getAttribute('data-subview') || btn.getAttribute('data-tasks-view');
            this.tasksSubView = (subview === 'calendar') ? 'calendar' : 'tasks';

            if (this.tasksSubView === 'calendar') {
              if (this.tasksCalendarContainer) this.tasksCalendarContainer.style.display = 'block';
              if (this.tasksListContainer) this.tasksListContainer.style.display = 'none';
              this.renderAppleCalendar();
            } else {
              if (this.tasksCalendarContainer) this.tasksCalendarContainer.style.display = 'none';
              if (this.tasksListContainer) this.tasksListContainer.style.display = 'block';
              this.renderTasksList();
            }
          }
        });
      }

      // CALENDAR MONTH NAVIGATION
      if (this.calPrevMonth) {
        this.calPrevMonth.addEventListener('click', () => {
          this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() - 1);
          this.renderAppleCalendar();
        });
      }
      if (this.calNextMonth) {
        this.calNextMonth.addEventListener('click', () => {
          this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() + 1);
          this.renderAppleCalendar();
        });
      }

      // TASK FILTER PILLS
      if (this.taskFilterPills) {
        this.taskFilterPills.addEventListener('click', (e) => {
          const pill = e.target.closest('.task-filter-pill');
          if (pill) {
            this.taskFilterPills.querySelectorAll('.task-filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            this.taskFilter = pill.getAttribute('data-task-filter');
            this.renderTasksList();
          }
        });
      }

      this.btnBackToDashboard.addEventListener('click', () => this.switchTab('view-dashboard'));
      this.btnDeleteProject.addEventListener('click', () => this.deleteProjectFromCloud(this.activeProjectId));

      this.fullProjBtnInflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.formInflow.reset();
        this.inflowSheetTitle.textContent = 'Record Money In';
        this.btnSubmitInflow.textContent = 'Save Money In';
        document.getElementById('inflow-amount-subtext').textContent = '';
        this.openSheetWithProject(this.sheetInflowOverlay, this.activeProjectId);
      });

      this.fullProjBtnOutflow.addEventListener('click', () => {
        this.editingTxId = null;
        this.formOutflow.reset();
        this.outflowSheetTitle.textContent = 'Record Money Out';
        this.btnSubmitOutflow.textContent = 'Save Money Out';
        document.getElementById('outflow-amount-subtext').textContent = '';
        this.openSheetWithProject(this.sheetOutflowOverlay, this.activeProjectId);
      });

      if (this.fullProjBtnWa) {
        this.fullProjBtnWa.addEventListener('click', () => {
          if (this.activeProjectId) {
            const waUrl = `https://wa.me/?text=${this.getWhatsAppStatement(this.activeProjectId)}`;
            window.open(waUrl, '_blank');
          }
        });
      }

      // Action Sheet Events
      this.btnEditTxAction.addEventListener('click', () => {
        if (this.selectedTxForAction) {
          const tx = this.selectedTxForAction;
          this.closeSheet(this.sheetTxActionOverlay);
          this.startEditingTransaction(tx);
        }
      });

      if (this.btnWaStatementAction) {
        this.btnWaStatementAction.addEventListener('click', () => {
          if (this.selectedTxForAction) {
            const tx = this.selectedTxForAction;
            this.closeSheet(this.sheetTxActionOverlay);
            const waUrl = `https://wa.me/?text=${this.getWhatsAppStatement(tx.projectId)}`;
            window.open(waUrl, '_blank');
          }
        });
      }

      this.btnDeleteTxAction.addEventListener('click', () => {
        if (this.selectedTxForAction) {
          const tx = this.selectedTxForAction;
          this.closeSheet(this.sheetTxActionOverlay);
          this.deleteTransactionFromCloud(tx.id);
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
      if (this.formLead) {
        this.formLead.addEventListener('submit', (e) => this.handleLeadSubmit(e));
      }
      if (this.formTask) {
        this.formTask.addEventListener('submit', (e) => this.handleTaskSubmit(e));
      }

      this.activityFilterPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.segment');
        if (pill) {
          this.activityFilterPills.querySelectorAll('.segment').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          this.activityFilter = pill.getAttribute('data-filter');
          this.renderActivityFeed();
        }
      });

      // Quotation Builder Events
      if (this.heroBtnQuotes) {
        this.heroBtnQuotes.addEventListener('click', () => this.openQuotesHub());
      }
      if (this.btnBackFromQuotes) {
        this.btnBackFromQuotes.addEventListener('click', () => this.switchTab('view-quick-entry'));
      }
      if (this.btnBackToQuotesHub) {
        this.btnBackToQuotesHub.addEventListener('click', () => this.openQuotesHub());
      }
      if (this.btnCreateQuoteTop) {
        this.btnCreateQuoteTop.addEventListener('click', () => {
          if (this.formNewQuote) this.formNewQuote.reset();
          this.openSheet(this.sheetNewQuoteOverlay);
        });
      }
      if (this.formNewQuote) {
        this.formNewQuote.addEventListener('submit', (e) => this.handleNewQuoteSubmit(e));
      }
      if (this.btnAddRoomTrigger) {
        this.btnAddRoomTrigger.addEventListener('click', () => this.openSheet(this.sheetAddRoomOverlay));
      }
      if (this.btnAddRoomBottom) {
        this.btnAddRoomBottom.addEventListener('click', () => this.openSheet(this.sheetAddRoomOverlay));
      }
      if (this.roomPresetsContainer) {
        this.roomPresetsContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.room-preset-btn, .room-preset-card');
          if (card) {
            const name = card.getAttribute('data-room-name');
            const icon = card.getAttribute('data-room-icon');
            this.addRoomToActiveQuote(name, icon);
            this.closeSheet(this.sheetAddRoomOverlay);
          }
        });
      }
      if (this.formCustomRoom) {
        this.formCustomRoom.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = this.customRoomNameInput ? this.customRoomNameInput.value.trim() : '';
          if (!name) return;
          this.addRoomToActiveQuote(name, '🏠');
          if (this.customRoomNameInput) this.customRoomNameInput.value = '';
          this.closeSheet(this.sheetAddRoomOverlay);
        });
      }
      if (this.btnTriggerCustomItem) {
        this.btnTriggerCustomItem.addEventListener('click', () => {
          this.closeSheet(this.sheetSelectItemOverlay);
          this.openConfigureItemSheet(this.activeRoomIdForItems, null, null);
        });
      }
      if (this.catalogItemsContainer) {
        this.catalogItemsContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.catalog-item-card');
          if (card) {
            const idx = parseInt(card.getAttribute('data-preset-idx'), 10);
            const activeQuote = this.quotes.find(q => q.id === this.activeQuoteId);
            const activeRoom = activeQuote ? activeQuote.rooms.find(r => r.id === this.activeRoomIdForItems) : null;
            const catalog = activeRoom && ROOM_CATALOG[activeRoom.name] ? ROOM_CATALOG[activeRoom.name].items : this.getFallbackCatalogItems();
            const preset = catalog[idx];
            if (preset) {
              this.closeSheet(this.sheetSelectItemOverlay);
              this.openConfigureItemSheet(this.activeRoomIdForItems, preset, null);
            }
          }
        });
      }
      if (this.cfgModeSegmented) {
        this.cfgModeSegmented.addEventListener('click', (e) => {
          const seg = e.target.closest('.segment');
          if (seg) {
            const mode = seg.getAttribute('data-mode');
            this.setItemCalculationMode(mode);
          }
        });
      }

      // Live calculation on Dimension inputs (Width, Height), SFT, Rate
      const triggerRecalc = () => this.recalcConfiguredItemAmount();
      if (this.cfgItemWidth) this.cfgItemWidth.addEventListener('input', triggerRecalc);
      if (this.cfgItemHeight) this.cfgItemHeight.addEventListener('input', triggerRecalc);
      if (this.cfgItemSft) this.cfgItemSft.addEventListener('input', triggerRecalc);
      if (this.cfgItemRate) this.cfgItemRate.addEventListener('input', triggerRecalc);
      if (this.cfgItemAmount) {
        this.cfgItemAmount.addEventListener('input', () => {
          const val = this.parseAmount(this.cfgItemAmount.value);
          if (this.cfgItemAmountSubtext) {
            this.cfgItemAmountSubtext.textContent = val > 0 ? this.numberToWordsIndian(val) : '';
          }
        });
      }
      if (this.formConfigureItem) {
        this.formConfigureItem.addEventListener('submit', (e) => this.saveConfiguredItem(e));
      }
      if (this.quoteDiscountInput) {
        this.quoteDiscountInput.addEventListener('input', () => {
          const quote = this.quotes.find(q => q.id === this.activeQuoteId);
          if (quote) {
            quote.discountAmount = this.parseAmount(this.quoteDiscountInput.value);
            this.recalculateQuoteTotals(quote);
            this.saveQuoteToCloud(quote, true);
            this.updateQuoteCommercialsDisplay(quote);
          }
        });
      }
      if (this.quoteGstToggle) {
        this.quoteGstToggle.addEventListener('change', () => {
          const quote = this.quotes.find(q => q.id === this.activeQuoteId);
          if (quote) {
            quote.taxPercent = this.quoteGstToggle.checked ? 18 : 0;
            this.recalculateQuoteTotals(quote);
            this.saveQuoteToCloud(quote, true);
            this.updateQuoteCommercialsDisplay(quote);
          }
        });
      }
      if (this.btnQuoteWhatsapp) {
        this.btnQuoteWhatsapp.addEventListener('click', () => this.sendQuoteViaWhatsApp(this.activeQuoteId));
      }
      if (this.btnBottomQuoteWa) {
        this.btnBottomQuoteWa.addEventListener('click', () => this.sendQuoteViaWhatsApp(this.activeQuoteId));
      }
      if (this.btnQuotePrint) {
        this.btnQuotePrint.addEventListener('click', () => this.printQuote(this.activeQuoteId));
      }
      if (this.btnBottomQuotePrint) {
        this.btnBottomQuotePrint.addEventListener('click', () => this.printQuote(this.activeQuoteId));
      }
      if (this.btnDeleteQuote) {
        this.btnDeleteQuote.addEventListener('click', () => this.deleteQuoteFromCloud(this.activeQuoteId));
      }

      // Rooms container item action delegation
      if (this.quoteRoomsContainer) {
        this.quoteRoomsContainer.addEventListener('click', (e) => {
          const addBtn = e.target.closest('.room-card-add-btn');
          if (addBtn) {
            const roomId = addBtn.getAttribute('data-room-id');
            this.openSelectItemSheet(roomId);
            return;
          }
          const delRoomBtn = e.target.closest('.room-delete-btn');
          if (delRoomBtn) {
            const roomId = delRoomBtn.getAttribute('data-room-id');
            this.deleteRoomFromActiveQuote(roomId);
            return;
          }
          const editItemBtn = e.target.closest('.btn-item-edit');
          if (editItemBtn) {
            const roomId = editItemBtn.getAttribute('data-room-id');
            const itemId = editItemBtn.getAttribute('data-item-id');
            this.editItemInRoom(roomId, itemId);
            return;
          }
          const delItemBtn = e.target.closest('.btn-item-delete');
          if (delItemBtn) {
            const roomId = delItemBtn.getAttribute('data-room-id');
            const itemId = delItemBtn.getAttribute('data-item-id');
            this.deleteItemFromRoom(roomId, itemId);
            return;
          }
        });
      }

      // Quotes list delegation
      if (this.quotesListContainer) {
        this.quotesListContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.quote-list-card');
          if (card) {
            const qId = card.getAttribute('data-quote-id');
            this.openQuoteDetail(qId);
          }
        });
      }

      window.addEventListener('popstate', () => {
        if (this.activeTab === 'view-project-detail') {
          this.switchTab('view-dashboard');
        } else if (this.activeTab === 'view-quote-detail') {
          this.openQuotesHub();
        } else if (this.activeTab === 'view-quotes-hub') {
          this.switchTab('view-quick-entry');
        }
      });
    }

    initIOSSwipeToBack() {
      const detailView = document.getElementById('view-project-detail');
      if (!detailView) return;

      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let isSwiping = false;

      detailView.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        // Trigger when touch starts near left edge (within 45px of screen edge)
        if (startX < 45) {
          isSwiping = true;
          detailView.style.transition = 'none';
        }
      }, { passive: true });

      detailView.addEventListener('touchmove', (e) => {
        if (!isSwiping || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const diffX = touch.clientX - startX;
        const diffY = Math.abs(touch.clientY - startY);

        // Cancel if scrolling vertically
        if (diffY > diffX && currentX === 0) {
          isSwiping = false;
          return;
        }

        if (diffX > 0) {
          currentX = diffX;
          detailView.style.transform = `translateX(${diffX}px)`;
          detailView.style.boxShadow = '-10px 0 30px rgba(0,0,0,0.15)';
        }
      }, { passive: true });

      const endSwipe = () => {
        if (!isSwiping) return;
        isSwiping = false;
        detailView.style.transition = 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s ease';

        const threshold = window.innerWidth * 0.28;
        if (currentX > threshold) {
          detailView.style.transform = `translateX(${window.innerWidth}px)`;
          setTimeout(() => {
            detailView.style.transform = '';
            detailView.style.transition = '';
            detailView.style.boxShadow = '';
            currentX = 0;
            this.switchTab('view-dashboard');
          }, 250);
        } else {
          detailView.style.transform = 'translateX(0px)';
          setTimeout(() => {
            detailView.style.transform = '';
            detailView.style.transition = '';
            detailView.style.boxShadow = '';
            currentX = 0;
          }, 250);
        }
      };

      detailView.addEventListener('touchend', endSwipe, { passive: true });
      detailView.addEventListener('touchcancel', endSwipe, { passive: true });
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

      ['pagehide', 'freeze'].forEach(evt => {
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

      if (tabId === 'view-tasks') {
        this.tasksSubView = 'calendar';
        if (this.tasksViewSegmented) {
          this.tasksViewSegmented.querySelectorAll('.segment').forEach(s => {
            if (s.getAttribute('data-subview') === 'calendar') s.classList.add('active');
            else s.classList.remove('active');
          });
        }
        if (this.tasksCalendarContainer) this.tasksCalendarContainer.style.display = 'block';
        if (this.tasksListContainer) this.tasksListContainer.style.display = 'none';
      }

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
      const firstInput = overlay.querySelector('input[type="text"], input[type="tel"]');
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
      if (!overlay) return;
      overlay.classList.remove('active');
      if (overlay.id === 'sheet-inflow-overlay') {
        this.editingTxId = null;
        if (this.formInflow) this.formInflow.reset();
        if (this.inflowSheetTitle) this.inflowSheetTitle.textContent = 'Record Money In';
        if (this.btnSubmitInflow) this.btnSubmitInflow.textContent = 'Save Money In';
        const sub = document.getElementById('inflow-amount-subtext');
        if (sub) sub.textContent = '';
      }
      if (overlay.id === 'sheet-outflow-overlay') {
        this.editingTxId = null;
        if (this.formOutflow) this.formOutflow.reset();
        if (this.outflowSheetTitle) this.outflowSheetTitle.textContent = 'Record Money Out';
        if (this.btnSubmitOutflow) this.btnSubmitOutflow.textContent = 'Save Money Out';
        const sub = document.getElementById('outflow-amount-subtext');
        if (sub) sub.textContent = '';
      }
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
      this.renderLeadsGrid();
      this.renderAppleCalendar();
      this.renderTasksList();
      this.renderActivityFeed();

      if (this.activeTab === 'view-project-detail' && this.activeProjectId) {
        this.renderFullProjectView(this.activeProjectId);
      }
      if (this.activeTab === 'view-quotes-hub') {
        this.renderQuotesHub();
      }
      if (this.activeTab === 'view-quote-detail' && this.activeQuoteId) {
        this.renderQuoteDetail(this.activeQuoteId);
      }
    }

    // TASK & CALENDAR API HELPERS & RENDERERS
    async saveTaskToCloud(newTask) {
      this.tasks.push(newTask);
      this.saveLocalCache();
      this.render();
      this.showToast(`Task "${newTask.title}" added & scheduled!`, 'success');

      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tasks) {
            this.tasks = data.tasks;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to post task to cloud API, saved locally:', err);
      }
    }

    async toggleTaskCompleted(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      task.completed = !task.completed;
      this.saveLocalCache();
      this.render();
      this.showToast(task.completed ? '✓ Task completed!' : 'Task reopened', 'success');

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tasks) {
            this.tasks = data.tasks;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to update task completion on cloud:', err);
      }
    }

    async deleteTaskFromCloud(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      if (!confirm(`Delete task "${task.title}"?`)) return;

      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveLocalCache();
      this.render();
      this.showToast(`Deleted task "${task.title}"`, 'success');

      try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.tasks) {
            this.tasks = data.tasks;
            this.saveLocalCache();
            this.render();
          }
        }
      } catch (err) {
        console.log('Failed to delete task from cloud:', err);
      }
    }

    async handleTaskSubmit(e) {
      e.preventDefault();
      const title = document.getElementById('task-title').value.trim();
      const dateVal = document.getElementById('task-date').value;
      const timeVal = document.getElementById('task-time').value || '10:00';
      const priorityRadio = this.formTask.querySelector('input[name="task-priority"]:checked');
      const priority = priorityRadio ? priorityRadio.value : 'medium';
      const projectId = this.taskProjectIdSelect.value || null;
      const notes = document.getElementById('task-notes').value.trim();

      if (!title || !dateVal) return;

      const dueISO = new Date(`${dateVal}T${timeVal}:00`).toISOString();

      const newTask = {
        id: 'task-' + Date.now(),
        title,
        notes,
        dueDate: dueISO,
        priority,
        projectId,
        completed: false,
        notified: false,
        createdAt: new Date().toISOString()
      };

      await this.saveTaskToCloud(newTask);
      this.formTask.reset();
      this.closeSheet(this.sheetTaskOverlay);
    }

    renderProjectSelectOptions() {
      if (!this.taskProjectIdSelect) return;
      this.taskProjectIdSelect.innerHTML = `<option value="">General (No Project)</option>`;
      (this.projects || []).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        this.taskProjectIdSelect.appendChild(opt);
      });
    }

    renderAppleCalendar() {
      if (!this.appleCalendarGrid) return;

      const year = this.calendarCurrentDate.getFullYear();
      const month = this.calendarCurrentDate.getMonth();

      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      if (this.calMonthTitle) {
        this.calMonthTitle.textContent = `${monthNames[month]} ${year}`;
      }

      const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
      const lastDayDate = new Date(year, month + 1, 0).getDate();
      const prevLastDayDate = new Date(year, month, 0).getDate();

      const todayStr = new Date().toISOString().split('T')[0];

      this.appleCalendarGrid.innerHTML = '';

      // Previous month padding days
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayNum = prevLastDayDate - i;
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell other-month';
        cell.textContent = dayNum;
        this.appleCalendarGrid.appendChild(cell);
      }

      // Current month days
      for (let d = 1; d <= lastDayDate; d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day-cell';
        
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        cell.textContent = d;

        if (dStr === todayStr) cell.classList.add('is-today');
        if (dStr === this.calendarSelectedDateStr) cell.classList.add('is-selected');

        // Check if tasks scheduled on this day
        const hasTasks = (this.tasks || []).some(t => {
          const tDateStr = new Date(t.dueDate).toISOString().split('T')[0];
          return tDateStr === dStr && !t.completed;
        });

        if (hasTasks) {
          const dot = document.createElement('div');
          dot.className = 'cal-dot';
          cell.appendChild(dot);
        }

        cell.addEventListener('click', () => {
          this.calendarSelectedDateStr = dStr;
          this.renderAppleCalendar();
        });

        this.appleCalendarGrid.appendChild(cell);
      }

      this.renderSelectedDayTasks();
    }

    renderSelectedDayTasks() {
      if (!this.selectedDayTasksList) return;
      this.selectedDayTasksList.innerHTML = '';

      const selDateObj = new Date(this.calendarSelectedDateStr + 'T00:00:00');
      const dateFormattedStr = selDateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      if (this.selectedDayHeader) {
        this.selectedDayHeader.textContent = `Schedule for ${dateFormattedStr}`;
      }

      // Hide completed tasks from calendar day schedule
      const dayTasks = (this.tasks || []).filter(t => {
        const tDateStr = new Date(t.dueDate).toISOString().split('T')[0];
        return !t.completed && tDateStr === this.calendarSelectedDateStr;
      }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      if (dayTasks.length === 0) {
        this.selectedDayTasksList.innerHTML = `
          <div style="text-align:center; padding:20px; color:var(--apple-text-tertiary); font-size:13px;">
            No tasks scheduled for ${dateFormattedStr}
          </div>
        `;
        return;
      }

      dayTasks.forEach(task => {
        const card = this.createTaskCardDOM(task);
        this.selectedDayTasksList.appendChild(card);
      });
    }

    renderTasksList() {
      if (!this.tasksRemindersList) return;
      this.tasksRemindersList.innerHTML = '';

      let filtered = [...(this.tasks || [])];
      const todayStr = new Date().toISOString().split('T')[0];

      if (this.taskFilter === 'all') {
        filtered = filtered.filter(t => !t.completed);
      } else if (this.taskFilter === 'today') {
        filtered = filtered.filter(t => {
          const tDateStr = new Date(t.dueDate).toISOString().split('T')[0];
          return !t.completed && tDateStr === todayStr;
        });
      } else if (this.taskFilter === 'scheduled') {
        filtered = filtered.filter(t => !t.completed);
      } else if (this.taskFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
      }

      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      if (filtered.length === 0) {
        this.tasksRemindersList.innerHTML = `
          <div style="text-align:center; padding:32px 16px; color:var(--apple-text-secondary); font-size:13px;">
            <div style="font-size:28px; margin-bottom:6px;">📋</div>
            No tasks found in this view.
          </div>
        `;
        return;
      }

      filtered.forEach(task => {
        const card = this.createTaskCardDOM(task);
        this.tasksRemindersList.appendChild(card);
      });
    }

    createTaskCardDOM(task) {
      const card = document.createElement('div');
      card.className = 'task-card-apple';
      card.setAttribute('data-task-card-id', task.id);

      const dueObj = new Date(task.dueDate);
      const dateStr = dueObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const timeStr = dueObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const proj = (this.projects || []).find(p => p.id === task.projectId);
      const projName = proj ? proj.name : null;

      let prioTag = '🟠';
      if (task.priority === 'high') prioTag = '🔴';
      if (task.priority === 'low') prioTag = '🔵';

      card.innerHTML = `
        <div class="task-checkbox-circle ${task.completed ? 'completed' : ''}" data-toggle-id="${task.id}">
          ${task.completed ? '✓' : ''}
        </div>
        <div class="task-content-main">
          <div class="task-title-text ${task.completed ? 'completed' : ''}">${prioTag} ${this.escapeHTML(task.title)}</div>
          <div class="task-meta-row">
            <span class="task-time-chip">⏰ ${dateStr}, ${timeStr}</span>
            ${projName ? `<span class="task-project-chip">🏗️ ${this.escapeHTML(projName)}</span>` : ''}
            ${task.notes ? `<span>📝 ${this.escapeHTML(task.notes)}</span>` : ''}
          </div>
        </div>
        <button class="task-delete-btn" data-delete-id="${task.id}" title="Delete Task">🗑️</button>
      `;

      card.querySelector('[data-toggle-id]').addEventListener('click', () => {
        this.toggleTaskCompleted(task.id);
      });

      card.querySelector('[data-delete-id]').addEventListener('click', () => {
        this.deleteTaskFromCloud(task.id);
      });

      return card;
    }

    listenForNotificationDeepLinks() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'OPEN_TASK' && event.data.taskId) {
            this.openAndHighlightTask(event.data.taskId);
          }
        });
      }

      const urlParams = new URLSearchParams(window.location.search);
      const taskIdFromURL = urlParams.get('task_id');
      if (taskIdFromURL) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => this.openAndHighlightTask(taskIdFromURL), 600);
      }
    }

    openAndHighlightTask(taskId) {
      const task = (this.tasks || []).find(t => t.id === taskId);
      if (!task) {
        this.showToast('Notification task not found', 'error');
        return;
      }

      const dueObj = new Date(task.dueDate);
      const dateStr = dueObj.toISOString().split('T')[0];

      this.calendarCurrentDate = new Date(dueObj.getFullYear(), dueObj.getMonth(), 1);
      this.calendarSelectedDateStr = dateStr;

      this.switchTab('view-tasks');

      if (task.completed) {
        this.tasksSubView = 'tasks';
        if (this.tasksViewSegmented) {
          this.tasksViewSegmented.querySelectorAll('.segment').forEach(s => {
            if (s.getAttribute('data-subview') === 'tasks') s.classList.add('active');
            else s.classList.remove('active');
          });
        }
        if (this.tasksCalendarContainer) this.tasksCalendarContainer.style.display = 'none';
        if (this.tasksListContainer) this.tasksListContainer.style.display = 'block';

        this.taskFilter = 'completed';
        if (this.taskFilterPills) {
          this.taskFilterPills.querySelectorAll('.task-filter-pill').forEach(p => {
            if (p.getAttribute('data-task-filter') === 'completed') p.classList.add('active');
            else p.classList.remove('active');
          });
        }
      }

      this.render();

      setTimeout(() => {
        const targetCard = document.querySelector(`[data-task-card-id="${task.id}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.classList.add('highlight-pulse');
          setTimeout(() => targetCard.classList.remove('highlight-pulse'), 3600);
        }
      }, 350);
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

    renderLeadsGrid() {
      if (!this.leadsGrid) return;
      this.leadsGrid.innerHTML = '';

      if (!this.leads || this.leads.length === 0) {
        this.leadsGrid.innerHTML = `
          <div style="text-align:center; padding:40px 20px; color:var(--apple-text-secondary);">
            <div style="font-size:32px; margin-bottom:8px;">👥</div>
            <div style="font-size:16px; font-weight:600; color:var(--apple-text); margin-bottom:4px;">No Potential Clients Yet</div>
            <div style="font-size:13px;">Tap "+ Add Lead" above to store inquiry numbers and set follow-up reminders!</div>
          </div>
        `;
        return;
      }

      const sorted = [...this.leads].sort((a, b) => new Date(a.followupDate) - new Date(b.followupDate));

      sorted.forEach(lead => {
        const dateObj = new Date(lead.followupDate);
        const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
        const waMsg = encodeURIComponent(`Hi ${lead.name},\n\nHope you are doing well! This is Shiva from Aakruthee Interior Studio regarding your inquiry.\n\nWould love to connect for a quick call today! 🏡`);

        const card = document.createElement('div');
        card.className = 'lead-card-apple';
        card.innerHTML = `
          <div class="lead-header-row">
            <div>
              <div class="lead-title-name">${this.escapeHTML(lead.name)}</div>
              <div class="lead-phone-text">📱 ${this.escapeHTML(lead.phone)}</div>
            </div>
            <div class="lead-time-badge">⏰ ${dateStr}, ${timeStr}</div>
          </div>

          ${lead.notes ? `<div class="lead-notes-text">📝 ${this.escapeHTML(lead.notes)}</div>` : ''}

          <div class="lead-actions-row">
            <a href="tel:${cleanPhone}" class="lead-btn btn-lead-call">📞 Call</a>
            <a href="https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.substring(1) : '91' + cleanPhone}?text=${waMsg}" target="_blank" class="lead-btn btn-lead-wa">💬 WhatsApp</a>
            <button class="lead-btn btn-lead-convert" data-id="${lead.id}">🏗️ Convert</button>
            <button class="lead-btn" style="background:#f2f2f7; color:var(--apple-red);" data-delete="${lead.id}">🗑️</button>
          </div>
        `;

        card.querySelector('[data-id]').addEventListener('click', () => {
          this.convertLeadToProject(lead);
        });

        card.querySelector('[data-delete]').addEventListener('click', () => {
          this.deleteLeadFromCloud(lead.id);
        });

        this.leadsGrid.appendChild(card);
      });
    }

    async handleLeadSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('lead-name').value.trim();
      const phone = document.getElementById('lead-phone').value.trim();
      const dateVal = document.getElementById('lead-date').value;
      const timeVal = document.getElementById('lead-time').value || '11:00';
      const notes = document.getElementById('lead-notes').value.trim();

      if (!name || !phone || !dateVal) return;

      const followupISO = new Date(`${dateVal}T${timeVal}:00`).toISOString();

      const newLead = {
        id: 'lead-' + Date.now(),
        name,
        phone,
        followupDate: followupISO,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await this.saveLeadToCloud(newLead);
      this.formLead.reset();
      this.closeSheet(this.sheetLeadOverlay);
    }

    openFullProjectView(projectId) {
      this.activeProjectId = projectId;
      this.switchTab('view-project-detail');
      this.renderFullProjectView(projectId);
      if (!history.state || history.state.view !== 'project-detail' || history.state.id !== projectId) {
        history.pushState({ view: 'project-detail', id: projectId }, '');
      }
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

      item.addEventListener('click', (e) => {
        e.stopPropagation();
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

      // Offer WhatsApp Receipt via Non-blocking Toast Action
      const statementEncoded = this.getWhatsAppStatement(projectId);
      const waUrl = `https://wa.me/?text=${statementEncoded}`;

      this.showToastWithAction(
        `Saved Money In: ₹${this.formatIndianNumberString(String(amountVal))}`,
        '💬 WhatsApp Statement',
        () => window.open(waUrl, '_blank'),
        'success'
      );
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

      // Offer Welcome WhatsApp via Non-blocking Toast Action
      const budgetStr = budgetVal > 0 ? ` (Est. Budget: ${this.formatCurrency(budgetVal)})` : '';
      const welcomeMsg = encodeURIComponent(`Hello ${client}! 👋\n\nWelcome to Aakruthee Interior Studio! We are thrilled to start working on your ${name}${budgetStr}.\n\nWe will keep you updated on all site milestones and fund progress. Thank you for choosing us! 🏡✨\n\nWarm regards,\nAakruthee Interior Studio`);

      this.showToastWithAction(
        `Created Project "${name}"`,
        '💬 Send Welcome',
        () => window.open(`https://wa.me/?text=${welcomeMsg}`, '_blank'),
        'success'
      );
    }

    // ==========================================================================
    // QUOTATION & ROOM-BY-ROOM ESTIMATION METHODS
    // ==========================================================================

    numberToWordsIndian(num) {
      if (!num || num <= 0) return 'Zero Rupees';
      num = Math.round(num);

      const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const convertLessThanThousand = (n) => {
        let str = '';
        if (n >= 100) {
          str += a[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n >= 20) {
          str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        } else if (n > 0) {
          str += a[n];
        }
        return str.trim();
      };

      let words = '';
      const crore = Math.floor(num / 10000000);
      num %= 10000000;
      const lakh = Math.floor(num / 100000);
      num %= 100000;
      const thousand = Math.floor(num / 1000);
      num %= 1000;
      const remainder = num;

      if (crore > 0) {
        words += convertLessThanThousand(crore) + ' Crore ';
      }
      if (lakh > 0) {
        words += convertLessThanThousand(lakh) + ' Lakh ';
      }
      if (thousand > 0) {
        words += convertLessThanThousand(thousand) + ' Thousand ';
      }
      if (remainder > 0) {
        words += convertLessThanThousand(remainder);
      }

      return (words.trim() || 'Zero') + ' Rupees';
    }

    getFallbackCatalogItems() {
      return [
        { name: 'Full Height Wardrobe', rate: 1450, unit: 'sft', notes: 'MR Ply + 1mm Merino laminate' },
        { name: 'Gypsum False Ceiling', rate: 130, unit: 'sft', notes: 'Saint-Gobain with cove light provision' },
        { name: 'Wall Panelling / Louvers', rate: 950, unit: 'sft', notes: 'Fluted wooden / charcoal louvers' },
        { name: 'Storage Cabinet Unit', rate: 1200, unit: 'sft', notes: 'Soft-close shutters + interior shelving' },
        { name: 'Desk / Countertop Unit', rate: 1500, unit: 'sft', notes: 'Wooden top with support brackets' },
        { name: 'Electrical & Profile LED Lighting', rate: 18000, unit: 'lumpsum', notes: 'Concealed wiring, drivers and LED strips' }
      ];
    }

    openQuotesHub() {
      this.switchTab('view-quotes-hub');
      this.renderQuotesHub();
      if (!history.state || history.state.view !== 'quotes-hub') {
        history.pushState({ view: 'quotes-hub' }, '');
      }
    }

    openQuoteDetail(quoteId) {
      const quote = this.quotes.find(q => q.id === quoteId);
      if (!quote) return;
      this.activeQuoteId = quoteId;
      this.switchTab('view-quote-detail');
      this.renderQuoteDetail(quoteId);
      if (!history.state || history.state.view !== 'quote-detail' || history.state.id !== quoteId) {
        history.pushState({ view: 'quote-detail', id: quoteId }, '');
      }
    }

    renderQuotesHub() {
      if (!this.quotesListContainer) return;
      this.quotesListContainer.innerHTML = '';

      if (!this.quotes || this.quotes.length === 0) {
        this.quotesListContainer.innerHTML = `
          <div class="apple-card" style="padding: 40px 20px; text-align: center; border-radius: var(--radius-card);">
            <div style="font-size: 42px; margin-bottom: 12px;">📑</div>
            <h3 style="font-size: 17px; font-weight: 700; color: var(--apple-text); margin-bottom: 6px;">No Quotations Yet</h3>
            <p style="font-size: 13px; color: var(--apple-text-secondary); max-width: 280px; margin: 0 auto 20px; line-height: 1.4;">
              Create detailed, room-by-room interior proposals for your clients on-site in minutes.
            </p>
            <button class="apple-btn-primary" id="btn-empty-create-quote" style="padding: 10px 22px; font-size: 14px; margin: 0 auto; display: inline-flex;">
              + Create First Quote
            </button>
          </div>
        `;
        const btnEmpty = document.getElementById('btn-empty-create-quote');
        if (btnEmpty) {
          btnEmpty.addEventListener('click', () => {
            if (this.formNewQuote) this.formNewQuote.reset();
            this.openSheet(this.sheetNewQuoteOverlay);
          });
        }
        return;
      }

      this.quotes.forEach(quote => {
        const roomsCount = quote.rooms ? quote.rooms.length : 0;
        const netAmt = this.formatCurrency(quote.netAmount || 0);
        const createdDate = new Date(quote.createdAt || Date.now());
        const dateStr = createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

        const card = document.createElement('div');
        card.className = 'quote-list-card';
        card.setAttribute('data-quote-id', quote.id);
        card.innerHTML = `
          <div class="quote-list-info">
            <span class="quote-list-client">${this.escapeHTML(quote.clientName)}</span>
            <span class="quote-list-project">${this.escapeHTML(quote.projectName)}</span>
            <span class="quote-list-meta">${roomsCount} Rooms Scheduled &bull; ${dateStr}</span>
          </div>
          <div class="quote-list-amount-col">
            <span class="quote-list-amount">${netAmt}</span>
            <span class="quote-status-pill">${this.escapeHTML(quote.status || 'Draft')}</span>
          </div>
        `;
        this.quotesListContainer.appendChild(card);
      });
    }

    recalculateQuoteTotals(quote) {
      if (!quote) return;
      let gross = 0;
      (quote.rooms || []).forEach(room => {
        let roomSub = 0;
        (room.items || []).forEach(item => {
          roomSub += Number(item.amount) || 0;
        });
        room.subtotal = roomSub;
        gross += roomSub;
      });

      quote.grossAmount = gross;
      const discount = Number(quote.discountAmount) || 0;
      const taxable = Math.max(0, gross - discount);
      const taxPercent = Number(quote.taxPercent) || 0;
      const taxAmt = Math.round(taxable * (taxPercent / 100));
      quote.netAmount = taxable + taxAmt;
    }

    updateQuoteCommercialsDisplay(quote) {
      if (!quote) return;
      const gross = quote.grossAmount || 0;
      const discount = quote.discountAmount || 0;
      const net = quote.netAmount || 0;

      if (this.quoteNetTotalDisplay) this.quoteNetTotalDisplay.textContent = this.formatCurrency(net);
      if (this.quoteAmountWords) this.quoteAmountWords.textContent = this.numberToWordsIndian(net);
      if (this.quoteGrossDisplay) this.quoteGrossDisplay.textContent = this.formatCurrency(gross);
      if (this.quoteDiscountDisplay) this.quoteDiscountDisplay.textContent = discount > 0 ? `- ${this.formatCurrency(discount)}` : '₹0';
      if (this.quoteRoomsCount) this.quoteRoomsCount.textContent = `${quote.rooms ? quote.rooms.length : 0} Rooms`;

      // Payment Milestones
      const m10 = Math.round(net * 0.10);
      const m40_1 = Math.round(net * 0.40);
      const m40_2 = Math.round(net * 0.40);
      const m10_2 = Math.max(0, net - m10 - m40_1 - m40_2);

      if (this.milestone10) this.milestone10.textContent = this.formatCurrency(m10);
      if (this.milestone401) this.milestone401.textContent = this.formatCurrency(m40_1);
      if (this.milestone402) this.milestone402.textContent = this.formatCurrency(m40_2);
      if (this.milestone102) this.milestone102.textContent = this.formatCurrency(m10_2);
    }

    renderQuoteDetail(quoteId) {
      const quote = this.quotes.find(q => q.id === quoteId);
      if (!quote) return;

      this.recalculateQuoteTotals(quote);

      if (this.quoteClientHeading) this.quoteClientHeading.textContent = quote.clientName;
      if (this.quoteProjectSub) {
        this.quoteProjectSub.textContent = quote.projectName + (quote.clientPhone ? ` • ${quote.clientPhone}` : '');
      }
      if (this.quoteStatusPill) this.quoteStatusPill.textContent = quote.status || 'Draft';

      if (this.quoteDiscountInput) {
        this.quoteDiscountInput.value = quote.discountAmount ? this.formatIndianNumberString(String(quote.discountAmount)) : '';
      }
      if (this.quoteGstToggle) {
        this.quoteGstToggle.checked = Number(quote.taxPercent) > 0;
      }

      this.updateQuoteCommercialsDisplay(quote);

      if (!this.quoteRoomsContainer) return;
      this.quoteRoomsContainer.innerHTML = '';

      if (!quote.rooms || quote.rooms.length === 0) {
        this.quoteRoomsContainer.innerHTML = `
          <div style="text-align:center; padding:30px 16px; background:var(--apple-white); border-radius:var(--radius-card); border:1px dashed var(--apple-border);">
            <div style="font-size:32px; margin-bottom:8px;">🚪</div>
            <div style="font-size:14px; font-weight:600; color:var(--apple-text);">No Rooms Added Yet</div>
            <div style="font-size:12px; color:var(--apple-text-secondary); margin-top:2px;">Tap "+ Add Room" to add bedrooms, kitchen or living room.</div>
          </div>
        `;
        return;
      }

      quote.rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'quote-room-card';
        roomCard.setAttribute('data-room-id', room.id);

        let itemsHTML = '';
        if (room.items && room.items.length > 0) {
          itemsHTML = room.items.map(item => {
            const hasSft = item.sft && item.ratePerSft;
            const dimsText = hasSft ? `${item.sft} sft &times; ₹${item.ratePerSft}/sft` : (item.notes || 'Lump-sum line item');
            const notesText = (hasSft && item.notes) ? ` &bull; ${this.escapeHTML(item.notes)}` : '';
            return `
              <div class="room-item-row" data-item-id="${item.id}">
                <div class="room-item-info">
                  <div class="room-item-title">${this.escapeHTML(item.name)}</div>
                  <div class="room-item-specs">${dimsText}${notesText}</div>
                </div>
                <div class="room-item-actions">
                  <span class="room-item-cost">${this.formatCurrency(item.amount)}</span>
                  <button class="room-item-action-icon btn-item-edit" data-room-id="${room.id}" data-item-id="${item.id}" title="Edit Item">✏️</button>
                  <button class="room-item-action-icon btn-item-delete" data-room-id="${room.id}" data-item-id="${item.id}" title="Delete Item">&times;</button>
                </div>
              </div>
            `;
          }).join('');
        } else {
          itemsHTML = `
            <div class="room-items-empty">
              No items scheduled yet. Tap <strong>+</strong> in top right to add items.
            </div>
          `;
        }

        roomCard.innerHTML = `
          <div class="room-card-header">
            <div class="room-title-group">
              <span class="room-card-icon">${room.icon || '🏠'}</span>
              <span class="room-card-name">${this.escapeHTML(room.name)}</span>
              <span class="room-card-count">${room.items ? room.items.length : 0} items</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="room-card-add-btn" data-room-id="${room.id}" title="Add Item to ${this.escapeHTML(room.name)}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button class="room-delete-btn" data-room-id="${room.id}" title="Remove Room">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <div class="room-items-list">
            ${itemsHTML}
          </div>

          <div class="room-card-footer">
            <span class="room-subtotal-label">Room Subtotal</span>
            <span class="room-subtotal-val">${this.formatCurrency(room.subtotal || 0)}</span>
          </div>
        `;

        this.quoteRoomsContainer.appendChild(roomCard);
      });
    }

    async handleNewQuoteSubmit(e) {
      e.preventDefault();
      const clientEl = document.getElementById('quote-client-name') || document.getElementById('quote-input-client');
      const phoneEl = document.getElementById('quote-client-phone') || document.getElementById('quote-input-phone');
      const projEl = document.getElementById('quote-project-name') || document.getElementById('quote-input-project');

      const clientName = clientEl ? clientEl.value.trim() : '';
      const clientPhone = phoneEl ? phoneEl.value.trim() : '';
      const projectName = projEl ? projEl.value.trim() : '';

      if (!clientName) {
        alert('Please enter Client Name');
        if (clientEl) clientEl.focus();
        return;
      }

      if (!projectName) {
        alert('Please enter Project / Property Name');
        if (projEl) projEl.focus();
        return;
      }

      const newQuote = {
        id: 'quote-' + Date.now(),
        clientName,
        clientPhone: clientPhone || '',
        projectName,
        rooms: [
          { id: 'room-' + Date.now() + '-1', name: 'Living Room', icon: '🛋️', items: [], subtotal: 0 },
          { id: 'room-' + Date.now() + '-2', name: 'Modular Kitchen', icon: '🍳', items: [], subtotal: 0 },
          { id: 'room-' + Date.now() + '-3', name: 'Master Bedroom', icon: '🛏️', items: [], subtotal: 0 }
        ],
        grossAmount: 0,
        discountAmount: 0,
        taxPercent: 0,
        netAmount: 0,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.saveQuoteToCloud(newQuote);
      if (this.formNewQuote) this.formNewQuote.reset();
      this.closeSheet(this.sheetNewQuoteOverlay);
      this.openQuoteDetail(newQuote.id);
      this.showToast(`Started new quotation for ${clientName}`, 'success');
    }

    addRoomToActiveQuote(roomName, roomIcon = '🏠') {
      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      if (!quote) return;

      if (!quote.rooms) quote.rooms = [];
      const newRoom = {
        id: 'room-' + Date.now(),
        name: roomName,
        icon: roomIcon,
        items: [],
        subtotal: 0
      };
      quote.rooms.push(newRoom);
      this.recalculateQuoteTotals(quote);
      this.saveQuoteToCloud(quote);
      this.renderQuoteDetail(quote.id);
      this.showToast(`Added ${roomName} to quote`, 'success');
    }

    deleteRoomFromActiveQuote(roomId) {
      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      if (!quote) return;

      const room = (quote.rooms || []).find(r => r.id === roomId);
      if (!room) return;

      if (!confirm(`Remove "${room.name}" and all its scheduled items from this quote?`)) {
        return;
      }

      quote.rooms = quote.rooms.filter(r => r.id !== roomId);
      this.recalculateQuoteTotals(quote);
      this.saveQuoteToCloud(quote);
      this.renderQuoteDetail(quote.id);
      this.showToast(`Removed ${room.name}`, 'success');
    }

    openSelectItemSheet(roomId) {
      this.activeRoomIdForItems = roomId;
      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      const room = quote ? quote.rooms.find(r => r.id === roomId) : null;
      if (!room) return;

      if (this.selectItemRoomTitle) {
        this.selectItemRoomTitle.innerHTML = `Add Item to ${room.icon || '🏠'} ${this.escapeHTML(room.name)}`;
      }

      const catalog = (ROOM_CATALOG[room.name] && ROOM_CATALOG[room.name].items)
        ? ROOM_CATALOG[room.name].items
        : this.getFallbackCatalogItems();

      if (this.catalogItemsContainer) {
        this.catalogItemsContainer.innerHTML = catalog.map((item, idx) => `
          <div class="catalog-item-card" data-preset-idx="${idx}">
            <span class="catalog-item-title">${this.escapeHTML(item.name)}</span>
            <span class="catalog-item-rate">
              ${item.unit === 'sft' ? `₹${item.rate} / sft` : `Est. ₹${this.formatIndianNumberString(String(item.rate))}`}
            </span>
          </div>
        `).join('');
      }

      this.openSheet(this.sheetSelectItemOverlay);
    }

    openConfigureItemSheet(roomId, preset = null, existingItem = null) {
      this.activeRoomIdForItems = roomId;
      this.editingItemId = existingItem ? existingItem.id : null;

      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      const room = quote ? quote.rooms.find(r => r.id === roomId) : null;
      if (!room) return;

      const roomIcon = room.icon || '🏠';
      const itemName = existingItem ? existingItem.name : (preset ? preset.name : 'Custom Item');

      // Set Active Context Banner at Top
      if (this.itemContextBanner) {
        this.itemContextBanner.innerHTML = `${roomIcon} ${this.escapeHTML(room.name)} &rsaquo; <span>${this.escapeHTML(itemName)}</span>`;
      }

      // Populate Form Fields
      if (existingItem) {
        this.cfgItemName.value = existingItem.name || '';
        this.cfgItemWidth.value = existingItem.width || '';
        this.cfgItemHeight.value = existingItem.height || '';
        this.cfgItemSft.value = existingItem.sft || '';
        this.cfgItemRate.value = existingItem.ratePerSft || '';
        this.cfgItemAmount.value = this.formatIndianNumberString(String(existingItem.amount || 0));
        this.cfgItemNotes.value = existingItem.notes || '';
        this.setItemCalculationMode(existingItem.ratePerSft ? 'area' : 'lumpsum');
      } else if (preset) {
        this.cfgItemName.value = preset.name || '';
        this.cfgItemWidth.value = '';
        this.cfgItemHeight.value = '';
        this.cfgItemSft.value = '';
        this.cfgItemRate.value = preset.unit === 'sft' ? preset.rate : '';
        this.cfgItemAmount.value = preset.unit === 'lumpsum' ? this.formatIndianNumberString(String(preset.rate)) : '';
        this.cfgItemNotes.value = preset.notes || '';
        this.setItemCalculationMode(preset.unit === 'sft' ? 'area' : 'lumpsum');
      } else {
        this.cfgItemName.value = '';
        this.cfgItemWidth.value = '';
        this.cfgItemHeight.value = '';
        this.cfgItemSft.value = '';
        this.cfgItemRate.value = '';
        this.cfgItemAmount.value = '';
        this.cfgItemNotes.value = '';
        this.setItemCalculationMode('area');
      }

      const currentAmount = this.parseAmount(this.cfgItemAmount.value);
      if (this.cfgItemAmountSubtext) {
        this.cfgItemAmountSubtext.textContent = currentAmount > 0 ? this.numberToWordsIndian(currentAmount) : '';
      }

      this.openSheet(this.sheetConfigureItemOverlay);
    }

    setItemCalculationMode(mode) {
      this.itemCalcMode = mode;
      if (this.cfgModeSegmented) {
        this.cfgModeSegmented.querySelectorAll('.segment').forEach(s => {
          if (s.getAttribute('data-mode') === mode) s.classList.add('active');
          else s.classList.remove('active');
        });
      }

      if (this.cfgAreaGroup) {
        if (mode === 'lumpsum') {
          this.cfgAreaGroup.style.display = 'none';
        } else {
          this.cfgAreaGroup.style.display = 'block';
          this.recalcConfiguredItemAmount();
        }
      }
    }

    recalcConfiguredItemAmount() {
      if (this.itemCalcMode === 'area') {
        const w = parseFloat(this.cfgItemWidth.value);
        const h = parseFloat(this.cfgItemHeight.value);
        if (w > 0 && h > 0) {
          const autoSft = +(w * h).toFixed(2);
          this.cfgItemSft.value = autoSft;
        }

        const sft = parseFloat(this.cfgItemSft.value) || 0;
        const rate = parseFloat(this.cfgItemRate.value) || 0;

        if (sft > 0 && rate > 0) {
          const total = Math.round(sft * rate);
          this.cfgItemAmount.value = this.formatIndianNumberString(String(total));
          if (this.cfgItemAmountSubtext) {
            this.cfgItemAmountSubtext.textContent = this.numberToWordsIndian(total);
          }
        }
      }
    }

    saveConfiguredItem(e) {
      e.preventDefault();
      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      if (!quote) return;

      const room = quote.rooms.find(r => r.id === this.activeRoomIdForItems);
      if (!room) return;

      const name = this.cfgItemName.value.trim();
      const width = parseFloat(this.cfgItemWidth.value) || null;
      const height = parseFloat(this.cfgItemHeight.value) || null;
      const sft = parseFloat(this.cfgItemSft.value) || null;
      const ratePerSft = parseFloat(this.cfgItemRate.value) || null;
      const amount = this.parseAmount(this.cfgItemAmount.value);
      const notes = this.cfgItemNotes.value.trim();

      if (!name) {
        alert('Please enter an item name');
        return;
      }
      if (amount <= 0) {
        alert('Please enter a valid item amount or SFT & Rate');
        return;
      }

      if (this.editingItemId) {
        const item = (room.items || []).find(i => i.id === this.editingItemId);
        if (item) {
          item.name = name;
          item.width = width;
          item.height = height;
          item.sft = sft;
          item.ratePerSft = ratePerSft;
          item.amount = amount;
          item.notes = notes;
        }
      } else {
        if (!room.items) room.items = [];
        room.items.push({
          id: 'item-' + Date.now(),
          name,
          width,
          height,
          sft,
          ratePerSft,
          amount,
          notes
        });
      }

      this.recalculateQuoteTotals(quote);
      this.saveQuoteToCloud(quote);
      this.closeSheet(this.sheetConfigureItemOverlay);
      this.renderQuoteDetail(quote.id);
      this.showToast(`Saved "${name}" in ${room.name}`, 'success');
    }

    editItemInRoom(roomId, itemId) {
      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      if (!quote) return;

      const room = (quote.rooms || []).find(r => r.id === roomId);
      if (!room) return;

      const item = (room.items || []).find(i => i.id === itemId);
      if (!item) return;

      this.openConfigureItemSheet(roomId, null, item);
    }

    deleteItemFromRoom(roomId, itemId) {
      const quote = this.quotes.find(q => q.id === this.activeQuoteId);
      if (!quote) return;

      const room = (quote.rooms || []).find(r => r.id === roomId);
      if (!room) return;

      room.items = (room.items || []).filter(i => i.id !== itemId);
      this.recalculateQuoteTotals(quote);
      this.saveQuoteToCloud(quote);
      this.renderQuoteDetail(quote.id);
      this.showToast('Item deleted', 'success');
    }

    sendQuoteViaWhatsApp(quoteId) {
      const quote = this.quotes.find(q => q.id === quoteId);
      if (!quote) return;

      this.recalculateQuoteTotals(quote);

      const createdDate = new Date(quote.createdAt || Date.now());
      const dateStr = createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      let roomsSection = '';
      (quote.rooms || []).forEach(room => {
        if (!room.items || room.items.length === 0) return;
        roomsSection += `\n${room.icon || '🏠'} *${room.name}:* ${this.formatCurrency(room.subtotal || 0)}\n`;
        room.items.forEach(item => {
          const spec = (item.sft && item.ratePerSft) ? ` (${item.sft} sft)` : '';
          const note = item.notes ? ` - _${item.notes}_` : '';
          roomsSection += `• ${item.name}${spec}: ${this.formatCurrency(item.amount)}${note}\n`;
        });
      });

      if (!roomsSection.trim()) {
        roomsSection = '\n_No items scheduled yet._\n';
      }

      const grossFormatted = this.formatCurrency(quote.grossAmount || 0);
      const discountFormatted = quote.discountAmount > 0 ? `\n*Special Studio Discount:* -${this.formatCurrency(quote.discountAmount)}` : '';
      const taxAmount = quote.taxPercent > 0 ? Math.round((quote.grossAmount - (quote.discountAmount || 0)) * 0.18) : 0;
      const taxFormatted = quote.taxPercent > 0 ? `\n*GST (18%):* +${this.formatCurrency(taxAmount)}` : '';
      const netFormatted = this.formatCurrency(quote.netAmount || 0);
      const words = this.numberToWordsIndian(quote.netAmount || 0);

      const net = quote.netAmount || 0;
      const m10 = Math.round(net * 0.10);
      const m40_1 = Math.round(net * 0.40);
      const m40_2 = Math.round(net * 0.40);
      const m10_2 = Math.max(0, net - m10 - m40_1 - m40_2);

      const waText = 
`*Aakruthee Interior Studio 🏡*
*Interior Estimation Proposal*

Client: ${quote.clientName}
Project: ${quote.projectName}
Date: ${dateStr}

*Room Breakdown:*${roomsSection}
----------------------------------------
*Gross Total:* ${grossFormatted}${discountFormatted}${taxFormatted}
*Final Project Estimate:* ${netFormatted}
(${words})

*Payment Milestones:*
• 10% Booking Advance: ${this.formatCurrency(m10)}
• 40% Material Procurement: ${this.formatCurrency(m40_1)}
• 40% On-site Installation: ${this.formatCurrency(m40_2)}
• 10% Handover: ${this.formatCurrency(m10_2)}

Thank you for trusting Aakruthee Interior Studio! ✨
Contact: +91 98765 43210`;

      const cleanPhone = (quote.clientPhone || '').replace(/[^0-9]/g, '');
      const waUrl = cleanPhone.length >= 10
        ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encodeURIComponent(waText)}`
        : `https://wa.me/?text=${encodeURIComponent(waText)}`;

      window.open(waUrl, '_blank');
    }

    printQuote(quoteId) {
      const quote = this.quotes.find(q => q.id === quoteId);
      if (!quote) return;

      this.recalculateQuoteTotals(quote);

      const createdDate = new Date(quote.createdAt || Date.now());
      const dateStr = createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      let roomsTableRows = '';
      (quote.rooms || []).forEach(room => {
        roomsTableRows += `
          <tr style="background:#f2f2f7; font-weight:700;">
            <td colspan="4" style="padding:10px 12px; font-size:14px; color:#1c1c1e;">
              ${room.icon || '🏠'} ${this.escapeHTML(room.name)}
            </td>
            <td style="padding:10px 12px; font-size:14px; text-align:right; color:#0071e3;">
              ${this.formatCurrency(room.subtotal || 0)}
            </td>
          </tr>
        `;

        if (room.items && room.items.length > 0) {
          room.items.forEach((item, idx) => {
            const specNotes = [
              item.sft ? `${item.sft} sft` : '',
              item.ratePerSft ? `@ ₹${item.ratePerSft}/sft` : '',
              item.notes || ''
            ].filter(Boolean).join(' • ');

            roomsTableRows += `
              <tr style="border-bottom:1px solid #e5e5ea;">
                <td style="padding:8px 12px; font-size:12px; color:#86868b; width:40px;">${idx + 1}</td>
                <td style="padding:8px 12px; font-size:13px; font-weight:600; color:#1c1c1e;">
                  ${this.escapeHTML(item.name)}
                </td>
                <td style="padding:8px 12px; font-size:12px; color:#636366;" colspan="2">
                  ${this.escapeHTML(specNotes || '-')}
                </td>
                <td style="padding:8px 12px; font-size:13px; font-weight:600; text-align:right; color:#1c1c1e;">
                  ${this.formatCurrency(item.amount)}
                </td>
              </tr>
            `;
          });
        } else {
          roomsTableRows += `
            <tr>
              <td colspan="5" style="padding:8px 12px; font-size:12px; color:#86868b; font-style:italic;">No items scheduled</td>
            </tr>
          `;
        }
      });

      const net = quote.netAmount || 0;
      const m10 = Math.round(net * 0.10);
      const m40_1 = Math.round(net * 0.40);
      const m40_2 = Math.round(net * 0.40);
      const m10_2 = Math.max(0, net - m10 - m40_1 - m40_2);
      const taxAmount = quote.taxPercent > 0 ? Math.round((quote.grossAmount - (quote.discountAmount || 0)) * 0.18) : 0;

      const printHtml = `
        <div style="font-family:-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; max-width:800px; margin:0 auto; padding:24px; color:#1c1c1e;">
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0071e3; padding-bottom:16px; margin-bottom:20px;">
            <div>
              <h1 style="font-size:24px; font-weight:800; color:#0071e3; margin:0 0 4px 0; letter-spacing:-0.5px;">AAKRUTHEE INTERIOR STUDIO</h1>
              <div style="font-size:12px; color:#636366; line-height:1.4;">Bespoke Interior Architecture & Project Execution<br>Hyderabad • Telangana • Contact: +91 98765 43210</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:18px; font-weight:700; color:#1c1c1e;">ESTIMATE PROPOSAL</div>
              <div style="font-size:12px; color:#86868b; margin-top:4px;">Date: ${dateStr}</div>
              <div style="font-size:12px; color:#86868b;">Ref: #${quote.id.slice(-6).toUpperCase()}</div>
            </div>
          </div>

          <!-- Client & Project Details -->
          <div style="display:flex; justify-content:space-between; background:#f2f2f7; border-radius:12px; padding:14px 18px; margin-bottom:24px;">
            <div>
              <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:#86868b; letter-spacing:0.5px;">Client Information</div>
              <div style="font-size:16px; font-weight:700; color:#1c1c1e; margin-top:2px;">${this.escapeHTML(quote.clientName)}</div>
              ${quote.clientPhone ? `<div style="font-size:13px; color:#636366;">Phone: ${this.escapeHTML(quote.clientPhone)}</div>` : ''}
            </div>
            <div style="text-align:right;">
              <div style="font-size:11px; text-transform:uppercase; font-weight:700; color:#86868b; letter-spacing:0.5px;">Project Site</div>
              <div style="font-size:16px; font-weight:700; color:#1c1c1e; margin-top:2px;">${this.escapeHTML(quote.projectName)}</div>
              <div style="font-size:13px; color:#636366;">${quote.rooms ? quote.rooms.length : 0} Rooms Scheduled</div>
            </div>
          </div>

          <!-- Itemized Table -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <thead>
              <tr style="border-bottom:2px solid #e5e5ea; text-align:left;">
                <th style="padding:8px 12px; font-size:11px; text-transform:uppercase; color:#86868b;">#</th>
                <th style="padding:8px 12px; font-size:11px; text-transform:uppercase; color:#86868b;">Item Description</th>
                <th style="padding:8px 12px; font-size:11px; text-transform:uppercase; color:#86868b;" colspan="2">Specifications & Dimensions</th>
                <th style="padding:8px 12px; font-size:11px; text-transform:uppercase; color:#86868b; text-align:right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${roomsTableRows}
            </tbody>
          </table>

          <!-- Commercials Summary -->
          <div style="display:flex; justify-content:flex-end; margin-bottom:30px;">
            <div style="width:320px; background:#f2f2f7; border-radius:12px; padding:16px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:#636366;">
                <span>Gross Subtotal:</span>
                <span style="font-weight:600; color:#1c1c1e;">${this.formatCurrency(quote.grossAmount || 0)}</span>
              </div>
              ${quote.discountAmount > 0 ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:#ff3b30;">
                  <span>Studio Discount:</span>
                  <span style="font-weight:600;">-${this.formatCurrency(quote.discountAmount)}</span>
                </div>
              ` : ''}
              ${quote.taxPercent > 0 ? `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:13px; color:#636366;">
                  <span>GST (18%):</span>
                  <span style="font-weight:600; color:#1c1c1e;">+${this.formatCurrency(taxAmount)}</span>
                </div>
              ` : ''}
              <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:1px solid #d1d1d6; font-size:16px; font-weight:800; color:#0071e3;">
                <span>Final Estimate:</span>
                <span>${this.formatCurrency(quote.netAmount || 0)}</span>
              </div>
              <div style="font-size:11px; color:#86868b; margin-top:4px; text-align:right;">
                ${this.numberToWordsIndian(quote.netAmount || 0)}
              </div>
            </div>
          </div>

          <!-- Payment Schedule -->
          <div style="background:#ffffff; border:1px solid #e5e5ea; border-radius:12px; padding:16px; margin-bottom:24px;">
            <div style="font-size:12px; font-weight:700; text-transform:uppercase; color:#1c1c1e; margin-bottom:10px; letter-spacing:0.5px;">
              Standard Payment Schedule
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; text-align:center;">
              <div style="background:#f2f2f7; padding:10px; border-radius:8px;">
                <div style="font-size:11px; color:#86868b;">10% Advance</div>
                <div style="font-size:13px; font-weight:700; color:#0071e3; margin-top:4px;">${this.formatCurrency(m10)}</div>
                <div style="font-size:10px; color:#636366; margin-top:2px;">Booking & 3D Design</div>
              </div>
              <div style="background:#f2f2f7; padding:10px; border-radius:8px;">
                <div style="font-size:11px; color:#86868b;">40% Procurement</div>
                <div style="font-size:13px; font-weight:700; color:#0071e3; margin-top:4px;">${this.formatCurrency(m40_1)}</div>
                <div style="font-size:10px; color:#636366; margin-top:2px;">Plywood & Hardware</div>
              </div>
              <div style="background:#f2f2f7; padding:10px; border-radius:8px;">
                <div style="font-size:11px; color:#86868b;">40% Installation</div>
                <div style="font-size:13px; font-weight:700; color:#0071e3; margin-top:4px;">${this.formatCurrency(m40_2)}</div>
                <div style="font-size:10px; color:#636366; margin-top:2px;">On-site Carcass Fit</div>
              </div>
              <div style="background:#f2f2f7; padding:10px; border-radius:8px;">
                <div style="font-size:11px; color:#86868b;">10% Handover</div>
                <div style="font-size:13px; font-weight:700; color:#0071e3; margin-top:4px;">${this.formatCurrency(m10_2)}</div>
                <div style="font-size:10px; color:#636366; margin-top:2px;">Final Polish & Cleaning</div>
              </div>
            </div>
          </div>

          <!-- Terms Footer -->
          <div style="font-size:11px; color:#86868b; line-height:1.5; border-top:1px solid #e5e5ea; padding-top:12px;">
            <strong>Terms & Conditions:</strong><br>
            1. Estimate validity: 15 days from issue date.<br>
            2. Scope changes or on-site additions will be billed separately with prior client approval.<br>
            3. Warranty: 10 Years Flat Plywood Warranty & 5 Years Hardware Warranty (Hafele/Hettich/Ebco).
          </div>
        </div>
      `;

      if (this.printQuotationView) {
        this.printQuotationView.innerHTML = printHtml;
      }
      window.print();
    }

    async saveQuoteToCloud(quote, silent = false) {
      if (!quote) return;
      quote.updatedAt = new Date().toISOString();

      const existingIdx = this.quotes.findIndex(q => q.id === quote.id);
      if (existingIdx !== -1) {
        this.quotes[existingIdx] = quote;
      } else {
        this.quotes.unshift(quote);
      }

      this.saveLocalCache();

      try {
        const isUpdate = existingIdx !== -1;
        const url = isUpdate ? `/api/quotes/${quote.id}` : '/api/quotes';
        const method = isUpdate ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quote)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.quotes) {
            this.quotes = data.quotes;
            this.saveLocalCache();
          }
        }
      } catch (err) {
        console.log('Failed to save quote to cloud, updated locally:', err);
      }
    }

    async deleteQuoteFromCloud(quoteId) {
      const quote = this.quotes.find(q => q.id === quoteId);
      if (!quote) return;

      if (!confirm(`Are you sure you want to delete quotation for "${quote.clientName}"?`)) {
        return;
      }

      this.quotes = this.quotes.filter(q => q.id !== quoteId);
      this.saveLocalCache();
      this.openQuotesHub();
      this.showToast(`Deleted quotation for "${quote.clientName}"`, 'success');

      try {
        const response = await fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.quotes) {
            this.quotes = data.quotes;
            this.saveLocalCache();
            this.renderQuotesHub();
          }
        }
      } catch (err) {
        console.log('Failed to delete quote from cloud, updated locally:', err);
      }
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

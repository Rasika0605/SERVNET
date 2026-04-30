
    const globalModal = document.getElementById('global-modal');
    const modalCard = globalModal.querySelector('.modal-card');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalIcon = document.getElementById('modal-icon-container');
    const modalDetails = document.getElementById('modal-details-container');

    function openModal(title, desc, type, detailsHTML = null) {
      modalTitle.textContent = title;
      modalDesc.innerHTML = desc; 
      modalDetails.style.display = 'none';

      if (type === 'success') {
        modalIcon.innerHTML = '<div style="width: 64px; height: 64px; border-radius: 50%; background: #dcfce7; color: #16a34a; display: grid; place-items: center; font-size: 2rem; margin: 0 auto 20px; font-weight: bold;">✓</div>';
      } else if (type === 'error') {
        modalIcon.innerHTML = '<div style="width: 64px; height: 64px; border-radius: 50%; background: #fee2e2; color: #ef4444; display: grid; place-items: center; font-size: 2rem; margin: 0 auto 20px; font-weight: bold;">✕</div>';
      } else if (type === 'info') {
        modalIcon.innerHTML = '<div style="width: 64px; height: 64px; border-radius: 50%; background: #e0f2fe; color: #0284c7; display: grid; place-items: center; font-size: 2rem; margin: 0 auto 20px; font-weight: bold;">i</div>';
        if (detailsHTML) {
          modalDetails.innerHTML = detailsHTML;
          modalDetails.style.display = 'block';
        }
      }

      globalModal.style.opacity = '1';
      globalModal.style.visibility = 'visible';
      modalCard.style.transform = 'scale(1) translateY(0)';
    }

    document.getElementById('modal-close-btn').addEventListener('click', () => {
      globalModal.style.opacity = '0';
      globalModal.style.visibility = 'hidden';
      modalCard.style.transform = 'scale(0.95) translateY(20px)';
    });

    const LS_KEYS = {
      providerRequests: 'providerRequests',
      providerSchedule: 'providerSchedule',
      userBookings: 'userBookings',
    };

    function safeJsonParse(value, fallback) {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    }

    function fmtDateHuman(isoOrText) {
      const d = new Date(isoOrText);
      if (Number.isNaN(d.getTime())) return isoOrText;
      return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function loadRequests() {
      return safeJsonParse(localStorage.getItem(LS_KEYS.providerRequests) || '[]', []);
    }

    function saveRequests(list) {
      localStorage.setItem(LS_KEYS.providerRequests, JSON.stringify(list));
    }

    function renderRequests() {
      const listEl = document.getElementById('request-list');
      const emptyEl = document.getElementById('requests-empty');
      const requests = loadRequests();

      listEl.querySelectorAll('.request-card').forEach(n => n.remove());
      emptyEl.style.display = requests.length ? 'none' : 'block';

      requests.forEach((r) => {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
          <div class="req-main">
            <div class="req-title">${r.customer}</div>
            <div class="req-meta">
              <span><strong>Service:</strong> ${r.service}</span>
              <span><strong>Date:</strong> ${fmtDateHuman(r.date)}</span>
              <span><strong>Location:</strong> ${r.location}</span>
            </div>
            <button type="button" class="text-btn view-details-btn" data-action="details" style="margin-top: 10px; text-decoration: underline; color: var(--brand-700); background: none; border: none; cursor: pointer; font-weight: 700; font-size: 0.85rem; padding: 0;">View Details</button>
          </div>
          <div class="req-actions">
            <button class="btn btn-teal-sm" type="button" data-action="accept">✔ Accept</button>
            <button class="btn btn-outline small" type="button" data-action="reject">✖ Reject</button>
          </div>
        `;

        card.addEventListener('click', (e) => {
          const btn = e.target.closest('button');
          if (!btn) return;
          const action = btn.getAttribute('data-action');
          
          if (action === 'details') {
            const detailsText = "" +
              "<div style=\"margin-bottom: 8px;\"><strong>Customer:</strong> " + r.customer + "</div>" +
              "<div style=\"margin-bottom: 8px;\"><strong>Service Type:</strong> " + r.service + "</div>" +
              "<div style=\"margin-bottom: 8px;\"><strong>Requested Date:</strong> " + fmtDateHuman(r.date) + "</div>" +
              "<div style=\"margin-bottom: 8px;\"><strong>Location:</strong> " + r.location + "</div>" +
              "<div style=\"margin-top: 12px; color: var(--ink-500); font-size: 0.85rem;\"><strong>Notes:</strong> \"Please bring standard tools.\"</div>";
            openModal('Service Request Details', 'Review the details before accepting the request.', 'info', detailsText);
            return;
          }

          const next = loadRequests().filter(x => x.id !== r.id);
          saveRequests(next);

          if (action === 'accept') {
            addScheduleRow({ date: r.date, service: r.service, customer: r.customer, status: 'Confirmed' });
            openModal('Request Accepted!', "You have accepted <strong>" + r.customer + "</strong>'s request. The customer has been notified, and the job is now in your Active Jobs schedule.", 'success');
          } else if (action === 'reject') {
            openModal('Request Declined', "You declined the request from <strong>" + r.customer + "</strong>. The customer has been notified.", 'error');
          }

          renderRequests();
          updateStatsFromData();
        });

        listEl.appendChild(card);
      });
    }

    function loadSchedule() {
      return safeJsonParse(localStorage.getItem(LS_KEYS.providerSchedule) || '[]', []);
    }

    function saveSchedule(list) {
      localStorage.setItem(LS_KEYS.providerSchedule, JSON.stringify(list));
    }

    function addScheduleRow(item) {
      const list = loadSchedule();
      list.push({
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        date: item.date,
        service: item.service,
        customer: item.customer,
        status: item.status || 'Pending',
      });
      saveSchedule(list);
      renderSchedule();
    }

    function renderSchedule() {
      const body = document.getElementById('schedule-body');
      const schedule = loadSchedule();
      if (!schedule.length) return;

      body.innerHTML = schedule.map(s => {
        const statusClass = (s.status || '').toLowerCase().includes('confirm') ? 'pill-ok' : 'pill-warn';
        const d = new Date(s.date);
        const short = Number.isNaN(d.getTime()) ? s.date : d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).replace(',', '');
        const actionHtml = (statusClass === 'pill-ok') 
          ? "<div style=\"display:flex;gap:6px;\"><button class=\"btn btn-outline\" style=\"padding: 4px 8px; font-size: 0.85rem;\" onclick=\"window.location.href='messaging.html'\" title=\"Chat\">💬</button><button class=\"btn btn-outline\" style=\"padding: 4px 8px; font-size: 0.85rem;\" onclick=\"alert('Calling " + s.customer + "...')\">📞</button></div>" 
          : "<span style=\"color:var(--ink-500); font-size:0.8rem;\">N/A</span>";

        return "" +
          "<tr>" +
            "<td>" + short + "</td>" +
            "<td>" + s.service + "</td>" +
            "<td>" + s.customer + "</td>" +
            "<td><span class=\"pill " + statusClass + "\">" + s.status + "</span></td>" +
            "<td>" + actionHtml + "</td>" +
          "</tr>";
      }).join('');
    }

    function seedDemoRequests() {
      const existing = loadRequests();
      if (existing.length) return;
      const demo = [
        { id: 'r1', customer: 'John Doe', service: 'Plumbing Repair', date: '2026-03-20', location: 'Vasai' },
        { id: 'r2', customer: 'Aisha Khan', service: 'Appliance Installation', date: '2026-03-21', location: 'Vasai' },
      ];
      saveRequests(demo);
    }

    function importFromCustomerBookings() {
      const bookings = safeJsonParse(localStorage.getItem(LS_KEYS.userBookings) || '[]', []);
      if (!bookings.length) {
        alert('No bookings found. Create one from booking.html first.');
        return;
      }

      const mapped = bookings.map((b, idx) => ({
        date: b.date || '2026-03-20',
        service: b.service || 'Service',
        customer: 'Customer',
        status: (b.status || 'Confirmed'),
        _idx: idx,
      }));

      const existing = loadSchedule();
      const merged = [...existing, ...mapped.map(m => ({
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        date: m.date,
        service: m.service,
        customer: m.customer,
        status: m.status,
      }))];

      saveSchedule(merged);
      renderSchedule();
      updateStatsFromData();
      alert('Imported bookings into schedule.');
    }

    function updateStatsFromData() {
      const req = loadRequests();
      const sched = loadSchedule();
      const pending = req.length + sched.filter(s => (s.status || '').toLowerCase().includes('pending')).length;
      const completed = sched.filter(s => (s.status || '').toLowerCase().includes('complete')).length;
      const total = sched.length + req.length;

      document.getElementById('stat-total').textContent = String(total || 24);
      document.getElementById('stat-pending').textContent = String(pending || 5);
      document.getElementById('stat-completed').textContent = String(completed || 19);
      document.getElementById('badge-requests').textContent = String(req.length || 2);
    }

    document.getElementById('seed-requests-btn').addEventListener('click', () => {
      seedDemoRequests();
      renderRequests();
      updateStatsFromData();
    });

    document.getElementById('sync-from-bookings').addEventListener('click', importFromCustomerBookings);

    document.getElementById('edit-services-btn').addEventListener('click', () => {
      openServiceEditor();
    });

    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      // Replaced by real logic below
    });

    document.getElementById('availability-btn').addEventListener('click', () => {
      // Replaced by real logic below
    });


    // Initial render
    renderRequests();
    renderSchedule();
    updateStatsFromData();

    // --- Service Editor Logic ---
    const svcModal = document.getElementById('edit-services-modal');
    const svcCatList = document.getElementById('svc-catalog-list');
    const svcCfgList = document.getElementById('svc-config-list');
    
    let catalog = [
      'Plumbing Repair', 'Electrical Maintenance', 'Appliance Installation',
      'Home Cleaning', 'Carpentry Services', 'Pest Control', 'Painting'
    ];

    const LS_SVC_KEY = 'providerServicesList';
    let myServices = safeJsonParse(localStorage.getItem(LS_SVC_KEY), null);
    
    if (!myServices) {
      myServices = [
        { name: 'Plumbing Repair', price: 500, time: '9 AM - 6 PM' },
        { name: 'Electrical Maintenance', price: 600, time: '10 AM - 5 PM' },
        { name: 'Appliance Installation', price: 400, time: 'Anytime' }
      ];
      localStorage.setItem(LS_SVC_KEY, JSON.stringify(myServices));
    }

    function renderMainServiceChips() {
      const container = document.getElementById('service-chips');
      container.innerHTML = myServices.map(s => "<span class=\"chip\">" + s.name + "</span>").join('');
    }

    let editState = [];

    function openServiceEditor() {
      editState = JSON.parse(JSON.stringify(myServices)); 
      
      editState.forEach(s => {
        if (!catalog.includes(s.name)) catalog.push(s.name);
      });

      document.getElementById('svc-search').value = '';
      renderSvcCatalog('');
      renderSvcConfig();

      svcModal.classList.add('active');
    }

    function renderSvcCatalog(query) {
      const norm = query.toLowerCase();
      const filtered = catalog.filter(c => c.toLowerCase().includes(norm));
      
      svcCatList.innerHTML = filtered.map(c => {
        const isChecked = editState.some(s => s.name === c) ? 'checked' : '';
        return "" +
          "<label class=\"svc-checkbox-label\">" +
            "<input type=\"checkbox\" value=\"" + c + "\" " + isChecked + " onchange=\"toggleSvc(this.value, this.checked)\">" +
            "<span>" + c + "</span>" +
          "</label>";
      }).join('');
    }

    function renderSvcConfig() {
      if (editState.length === 0) {
        svcCfgList.innerHTML = "<div class=\"empty-state\">No services selected. Check items on the left to add them.</div>";
        return;
      }
      
      svcCfgList.innerHTML = editState.map((s, idx) => {
        return "" +
          "<div class=\"svc-config-card\">" +
            "<div>" +
              "<div class=\"svc-name\">" + s.name + "</div>" +
              "<div class=\"svc-config-inputs\">" +
                "<span>Price (₹):</span>" +
                "<input type=\"number\" class=\"input-field input-money\" value=\"" + s.price + "\" onchange=\"updateSvcProp(" + idx + ", 'price', this.value)\">" +
                "<span>Time:</span>" +
                "<input type=\"text\" class=\"input-field input-time\" value=\"" + s.time + "\" placeholder=\"ex: 9 AM - 5 PM\" onchange=\"updateSvcProp(" + idx + ", 'time', this.value)\">" +
              "</div>" +
            "</div>" +
            "<button class=\"remove-svc-btn\" title=\"Remove Service\" onclick=\"removeSvc(" + idx + ")\">✖</button>" +
          "</div>";
      }).join('');
    }

    window.toggleSvc = function(name, isChecked) {
      if (isChecked) {
        editState.push({ name, price: 500, time: '9 AM - 5 PM' });
      } else {
        editState = editState.filter(s => s.name !== name);
      }
      renderSvcConfig();
    };

    window.updateSvcProp = function(idx, prop, val) {
      editState[idx][prop] = val;
    };

    window.removeSvc = function(idx) {
      const name = editState[idx].name;
      editState.splice(idx, 1);
      renderSvcConfig();
      // Uncheck catalog
      const cbKeys = document.querySelectorAll(".svc-checkbox-label input");
      cbKeys.forEach(cb => { if (cb.value === name) cb.checked = false; });
    };

    document.getElementById('close-svc-btn').addEventListener('click', () => svcModal.classList.remove('active'));
    document.getElementById('cancel-svc-btn').addEventListener('click', () => svcModal.classList.remove('active'));

    document.getElementById('save-svc-btn').addEventListener('click', () => {
      myServices = JSON.parse(JSON.stringify(editState));
      localStorage.setItem(LS_SVC_KEY, JSON.stringify(myServices));
      renderMainServiceChips();
      svcModal.classList.remove('active');
    });

    document.getElementById('add-custom-btn').addEventListener('click', () => {
      const inp = document.getElementById('custom-svc-input');
      const val = inp.value.trim();
      if (!val) return;
      if (!catalog.includes(val)) catalog.push(val);
      if (!editState.some(s => s.name === val)) {
        editState.unshift({ name: val, price: 500, time: '9 AM - 5 PM' });
      }
      inp.value = '';
      renderSvcCatalog(document.getElementById('svc-search').value);
      renderSvcConfig();
    });

    document.getElementById('svc-search').addEventListener('input', (e) => {
      renderSvcCatalog(e.target.value);
    });

    renderMainServiceChips();

    // --- Profile & Availability Logic ---
    const LS_PROF_KEY = 'providerProfile';
    const LS_AVAIL_KEY = 'providerAvailability';

    let profData = safeJsonParse(localStorage.getItem(LS_PROF_KEY), {
      name: 'David Parker',
      email: 'david.parker@example.com',
      phone: '+1 (555) 642-1109',
      category: 'Plumbing',
      location: 'Vasai',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
    });

    // Provide default fallback inside parse just to guarantee logic
    if(!profData) profData = { name: 'David Parker', email: 'd@e.com', phone: '', category: 'Plumbing', location: 'Vasai', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' };

    let availData = safeJsonParse(localStorage.getItem(LS_AVAIL_KEY), {
      isOnline: true,
      days: ['M','T','W','Th','F'],
      slots: '10:00 AM - 6:00 PM',
      breakTime: '1:00 PM - 2:00 PM'
    });

    if(!availData) availData = { isOnline: true, days: ['M','T','W','Th','F'], slots: '10:00 AM - 6:00 PM', breakTime: '' };

    const profModal = document.getElementById('edit-profile-modal');
    const availModal = document.getElementById('availability-modal');

    // UI Sync Function
    function renderProfileDashboard() {
      document.getElementById('display-prof-name').textContent = profData.name;
      document.getElementById('display-prof-email').textContent = profData.email;
      document.getElementById('display-prof-phone').textContent = profData.phone;
      document.getElementById('display-prof-cat').textContent = profData.category;
      document.getElementById('display-prof-loc').textContent = profData.location;

      const topbarAvatar = document.querySelector('.user-avatar-img');
      if(topbarAvatar) topbarAvatar.src = profData.photo;

      const statusPill = document.getElementById('display-prof-status');
      if (availData.isOnline) {
        statusPill.textContent = 'Online';
        statusPill.className = 'pill pill-ok';
      } else {
        statusPill.textContent = 'Busy';
        statusPill.className = 'pill pill-warn';
      }

      document.getElementById('display-prof-slot').textContent = availData.slots.split('-')[0] || 'N/A';
    }

    // Profile Handlers
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      document.getElementById('edit-prof-name').value = profData.name;
      document.getElementById('edit-prof-email').value = profData.email;
      document.getElementById('edit-prof-phone').value = profData.phone;
      document.getElementById('edit-prof-loc').value = profData.location;
      document.getElementById('edit-prof-cat').value = profData.category;
      document.getElementById('edit-prof-img-preview').src = profData.photo;
      document.getElementById('edit-prof-pass').value = '';
      profModal.classList.add('active');
    });

    document.getElementById('edit-prof-photo').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => document.getElementById('edit-prof-img-preview').src = ev.target.result;
        reader.readAsDataURL(file);
      }
    });

    const closeProf = () => profModal.classList.remove('active');
    document.getElementById('close-prof-btn').addEventListener('click', closeProf);
    document.getElementById('cancel-prof-btn').addEventListener('click', closeProf);

    document.getElementById('save-prof-btn').addEventListener('click', () => {
      profData.name = document.getElementById('edit-prof-name').value || 'Unknown';
      profData.email = document.getElementById('edit-prof-email').value;
      profData.phone = document.getElementById('edit-prof-phone').value;
      profData.location = document.getElementById('edit-prof-loc').value;
      profData.category = document.getElementById('edit-prof-cat').value;
      profData.photo = document.getElementById('edit-prof-img-preview').src;
      
      const pass = document.getElementById('edit-prof-pass').value;
      if (pass) {
        openModal('Password Updated', 'Your security parameters have been updated.', 'success');
      }

      localStorage.setItem(LS_PROF_KEY, JSON.stringify(profData));
      renderProfileDashboard();
      closeProf();
    });

    // Availability Handlers
    document.getElementById('availability-btn').addEventListener('click', () => {
      document.getElementById('avail-status-toggle').checked = availData.isOnline;
      document.getElementById('avail-slots').value = availData.slots;
      document.getElementById('avail-break').value = availData.breakTime;
      
      const dayLabs = document.querySelectorAll('.day-selector input');
      dayLabs.forEach(cb => {
        cb.checked = availData.days.includes(cb.value);
      });

      availModal.classList.add('active');
    });

    const closeAvail = () => availModal.classList.remove('active');
    document.getElementById('close-avail-btn').addEventListener('click', closeAvail);
    document.getElementById('cancel-avail-btn').addEventListener('click', closeAvail);

    document.getElementById('save-avail-btn').addEventListener('click', () => {
      availData.isOnline = document.getElementById('avail-status-toggle').checked;
      availData.slots = document.getElementById('avail-slots').value || '10:00 AM';
      availData.breakTime = document.getElementById('avail-break').value;
      
      availData.days = [];
      document.querySelectorAll('.day-selector input:checked').forEach(cb => {
        availData.days.push(cb.value);
      });

      localStorage.setItem(LS_AVAIL_KEY, JSON.stringify(availData));
      renderProfileDashboard();
      closeAvail();
    });

    // Initial load
    renderProfileDashboard();
  

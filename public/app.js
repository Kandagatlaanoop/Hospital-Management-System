/* ============================================
   LifeCare Hospital — Bootstrap + MySQL App
   ============================================ */

// ==================== API HELPER ====================
const API = {
    async get(url) { const r = await fetch(url); return r.json(); },
    async post(url, data) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return r.json(); },
    async put(url, data) { const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return r.json(); },
    async del(url) { const r = await fetch(url, { method: 'DELETE' }); return r.json(); }
};

// ==================== SESSION ====================
const Session = {
    set(user) { sessionStorage.setItem('hms_session', JSON.stringify(user)); },
    get() { try { return JSON.parse(sessionStorage.getItem('hms_session')); } catch { return null; } },
    clear() { sessionStorage.removeItem('hms_session'); }
};

// ==================== TOAST (Bootstrap) ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    const colors = { success: 'text-bg-success', error: 'text-bg-danger', info: 'text-bg-primary' };
    const id = 'toast_' + Date.now();
    container.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast ${colors[type] || colors.info}" role="alert">
            <div class="toast-body d-flex align-items-center gap-2">
                <i class="bi ${icons[type] || icons.info}"></i> ${message}
            </div>
        </div>`);
    const el = document.getElementById(id);
    const toast = new bootstrap.Toast(el, { delay: 3000 });
    toast.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}

// ==================== ROUTER ====================
let currentPage = 'login';

function navigate(page) { currentPage = page; render(); }

async function render() {
    const user = Session.get();
    const appRoot = document.getElementById('app');
    if (!user && currentPage !== 'login' && currentPage !== 'signup') currentPage = 'login';
    if (!user) {
        document.body.classList.remove('has-sidebar');
        appRoot.innerHTML = currentPage === 'signup' ? renderSignup() : renderLogin();
    } else {
        document.body.classList.add('has-sidebar');
        appRoot.innerHTML = await renderAppLayout(user);
    }
    bindEvents();
}

// ==================== AUTH PAGES ====================
function renderLogin() {
    return `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">
                <div class="logo-icon">❤️‍🩹</div>
                <h1>LifeCare Hospital</h1>
                <p>Sign in to your management portal</p>
            </div>
            <form id="loginForm">
                <div class="mb-3">
                    <label class="form-label" for="loginEmail">Email Address</label>
                    <input type="email" id="loginEmail" class="form-control" placeholder="you@hospital.com" required>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Sign In</button>
            </form>
            <div class="auth-link">Don't have an account? <a href="#" id="goSignup">Create Account</a></div>
            <div class="text-center mt-2" style="color:var(--lc-text-muted);font-size:0.75rem;">
                Demo: admin@hospital.com / admin123
            </div>
        </div>
    </div>`;
}

function renderSignup() {
    return `
    <div class="auth-wrapper">
        <div class="auth-card">
            <div class="auth-logo">
                <div class="logo-icon">❤️‍🩹</div>
                <h1>Create Account</h1>
                <p>Join the LifeCare Hospital Portal</p>
            </div>
            <form id="signupForm">
                <div class="mb-3"><label class="form-label">Full Name</label><input type="text" id="signupName" class="form-control" placeholder="Dr. John Doe" required></div>
                <div class="mb-3"><label class="form-label">Email</label><input type="email" id="signupEmail" class="form-control" placeholder="you@hospital.com" required></div>
                <div class="mb-3"><label class="form-label">Password</label><input type="password" id="signupPassword" class="form-control" placeholder="Min 6 characters" required minlength="6"></div>
                <div class="row mb-3">
                    <div class="col"><label class="form-label">Role</label>
                        <select id="signupRole" class="form-select" required>
                            <option value="">Select Role</option><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="patient">Patient</option>
                        </select>
                    </div>
                    <div class="col" id="specGroup" style="display:none"><label class="form-label">Specialization</label><input type="text" id="signupSpec" class="form-control" placeholder="e.g. Cardiology"></div>
                </div>
                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Create Account</button>
            </form>
            <div class="auth-link">Already have an account? <a href="#" id="goLogin">Sign In</a></div>
        </div>
    </div>`;
}

// ==================== APP LAYOUT ====================
async function renderAppLayout(user) {
    return `
    <div class="d-flex">
        <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">❤️‍🩹</div>
                <div class="sidebar-brand"><h2>LifeCare</h2><small>Hospital Portal</small></div>
            </div>
            <nav class="sidebar-nav">${getSidebarNav(user.role)}</nav>
            <div class="sidebar-footer">
                <div class="sidebar-user" id="navProfile" data-page="profile">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <div><div class="user-name">${user.name}</div><div class="user-role">${user.role}</div></div>
                </div>
            </div>
        </aside>
        <main class="main-content flex-grow-1">
            <header class="content-header">
                <div class="d-flex align-items-center gap-2">
                    <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
                    <h1>${getPageTitle()}</h1>
                </div>
                <button class="btn btn-outline-secondary btn-sm" id="logoutBtn"><i class="bi bi-box-arrow-right"></i> Logout</button>
            </header>
            <div class="content-body animate-fade-up" id="pageContent">${await renderPageContent(user)}</div>
        </main>
    </div>`;
}

function getSidebarNav(role) {
    const items = [
        { section: 'Main', items: [{ icon: 'bi-speedometer2', label: 'Dashboard', page: 'dashboard', roles: ['admin','doctor','patient'] }]},
        { section: 'Management', items: [
            { icon: 'bi-people', label: 'Patients', page: 'patients', roles: ['admin','doctor'] },
            { icon: 'bi-calendar-check', label: 'Appointments', page: 'appointments', roles: ['admin','doctor','patient'] },
            { icon: 'bi-capsule', label: 'Consultations', page: 'consultations', roles: ['admin','doctor'] },
            { icon: 'bi-receipt', label: 'Billing', page: 'billing', roles: ['admin'] },
        ]},
        { section: 'Analytics', items: [{ icon: 'bi-graph-up', label: 'Reports', page: 'reports', roles: ['admin'] }]},
    ];
    let html = '';
    items.forEach(sec => {
        const vis = sec.items.filter(i => i.roles.includes(role));
        if (!vis.length) return;
        html += `<div class="nav-section"><div class="nav-section-title">${sec.section}</div>`;
        vis.forEach(item => {
            html += `<a class="nav-item ${currentPage === item.page ? 'active' : ''}" data-page="${item.page}"><i class="bi ${item.icon} nav-icon"></i>${item.label}</a>`;
        });
        html += '</div>';
    });
    return html;
}

function getPageTitle() {
    const t = { dashboard:'Dashboard', patients:'Patient Management', appointments:'Appointments', consultations:'Doctor Consultations', billing:'Billing & Invoices', reports:'Reports & Analytics', profile:'My Profile' };
    return t[currentPage] || 'Dashboard';
}

async function renderPageContent(user) {
    switch(currentPage) {
        case 'dashboard': return await renderDashboard(user);
        case 'patients': return await renderPatients(user);
        case 'appointments': return await renderAppointments(user);
        case 'consultations': return await renderConsultations(user);
        case 'billing': return await renderBilling(user);
        case 'reports': return await renderReports(user);
        case 'profile': return renderProfile(user);
        default: return await renderDashboard(user);
    }
}

// ==================== DASHBOARD ====================
async function renderDashboard(user) {
    const [stats, patients, appointments, users] = await Promise.all([
        API.get('/api/stats'), API.get('/api/patients'), API.get('/api/appointments'), API.get('/api/users')
    ]);
    const doctors = users.filter(u => u.role === 'doctor');
    let statCards = '';
    if (user.role === 'admin') {
        statCards = `
        <div class="row g-3 mb-4">
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon blue"><i class="bi bi-people"></i></div><div class="stat-value">${stats.patientCount}</div><div class="stat-label">Total Patients</div></div></div>
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon green"><i class="bi bi-heart-pulse"></i></div><div class="stat-value">${doctors.length}</div><div class="stat-label">Active Doctors</div></div></div>
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon yellow"><i class="bi bi-calendar-check"></i></div><div class="stat-value">${stats.pendingCount}</div><div class="stat-label">Pending Appointments</div></div></div>
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon red"><i class="bi bi-currency-rupee"></i></div><div class="stat-value">₹${Number(stats.totalRevenue).toLocaleString()}</div><div class="stat-label">Total Revenue</div></div></div>
        </div>`;
    } else if (user.role === 'doctor') {
        const myAppts = appointments.filter(a => a.doctor_id === user.id);
        statCards = `
        <div class="row g-3 mb-4">
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon blue"><i class="bi bi-calendar"></i></div><div class="stat-value">${myAppts.length}</div><div class="stat-label">My Appointments</div></div></div>
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon yellow"><i class="bi bi-hourglass-split"></i></div><div class="stat-value">${myAppts.filter(a=>a.status==='pending').length}</div><div class="stat-label">Pending</div></div></div>
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon green"><i class="bi bi-check-circle"></i></div><div class="stat-value">${myAppts.filter(a=>a.status==='completed').length}</div><div class="stat-label">Completed</div></div></div>
            <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon red"><i class="bi bi-capsule"></i></div><div class="stat-value">${stats.rxCount}</div><div class="stat-label">Prescriptions</div></div></div>
        </div>`;
    } else {
        statCards = `
        <div class="row g-3 mb-4">
            <div class="col-sm-6"><div class="stat-card"><div class="stat-icon blue"><i class="bi bi-calendar"></i></div><div class="stat-value">${stats.apptCount}</div><div class="stat-label">My Appointments</div></div></div>
            <div class="col-sm-6"><div class="stat-card"><div class="stat-icon green"><i class="bi bi-capsule"></i></div><div class="stat-value">${stats.rxCount}</div><div class="stat-label">My Prescriptions</div></div></div>
        </div>`;
    }
    const quickActions = `<div class="row g-3 mb-4">
        ${user.role==='admin'?'<div class="col-sm-6 col-md-3"><div class="quick-action-card" data-page="patients"><div class="action-icon">➕</div><div class="action-title">Register Patient</div><div class="action-desc">Add a new patient record</div></div></div>':''}
        <div class="col-sm-6 col-md-3"><div class="quick-action-card" data-page="appointments"><div class="action-icon"><i class="bi bi-calendar-plus"></i></div><div class="action-title">Appointments</div><div class="action-desc">View & manage bookings</div></div></div>
        ${user.role==='doctor'?'<div class="col-sm-6 col-md-3"><div class="quick-action-card" data-page="consultations"><div class="action-icon"><i class="bi bi-capsule"></i></div><div class="action-title">Consultations</div><div class="action-desc">Write prescriptions</div></div></div>':''}
        ${user.role==='admin'?'<div class="col-sm-6 col-md-3"><div class="quick-action-card" data-page="billing"><div class="action-icon"><i class="bi bi-receipt"></i></div><div class="action-title">Generate Bill</div><div class="action-desc">Create patient invoice</div></div></div>':''}
        ${user.role==='admin'?'<div class="col-sm-6 col-md-3"><div class="quick-action-card" data-page="reports"><div class="action-icon"><i class="bi bi-graph-up"></i></div><div class="action-title">Reports</div><div class="action-desc">Analytics & summaries</div></div></div>':''}
    </div>`;
    const recent = appointments.slice(0, 5);
    let recentTable = '';
    if (recent.length) {
        recentTable = `<div class="table-wrapper"><div class="table-header"><h6 class="mb-0">Recent Appointments</h6></div>
            <table class="table table-dark table-hover mb-0"><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>${recent.map(a => {
                const pat = patients.find(p => p.id === a.patient_id);
                const doc = users.find(u => u.id === a.doctor_id);
                return `<tr><td>${pat?pat.name:'N/A'}</td><td>${doc?doc.name:'N/A'}</td><td>${a.date}</td><td>${a.time}</td><td><span class="badge bg-${a.status==='confirmed'?'primary':a.status==='completed'?'success':a.status==='cancelled'?'danger':'warning'}">${a.status}</span></td></tr>`;
            }).join('')}</tbody></table></div>`;
    }
    return statCards + quickActions + recentTable;
}

// ==================== PATIENTS ====================
async function renderPatients(user) {
    const patients = await API.get('/api/patients');
    return `
    <div class="d-flex justify-content-end mb-3"><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#patientModal"><i class="bi bi-plus-lg"></i> Register Patient</button></div>
    <div class="table-wrapper">
        <div class="table-header"><h6 class="mb-0">All Patients (${patients.length})</h6><input type="text" class="table-search" id="patientSearch" placeholder="Search patients..."></div>
        ${!patients.length ? '<div class="empty-state"><div class="empty-icon">👥</div><h3>No patients yet</h3><p>Register your first patient.</p></div>' : `
        <table class="table table-dark table-hover mb-0" id="patientsTable"><thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Blood Group</th><th>Reg. Date</th><th>Actions</th></tr></thead>
        <tbody>${patients.map(p => `<tr>
            <td><strong>${p.name}</strong></td><td>${p.age}</td><td>${p.gender}</td><td>${p.phone}</td>
            <td><span class="badge bg-info">${p.blood_group}</span></td><td>${p.date}</td>
            <td><div class="btn-group btn-group-sm">
                <button class="btn btn-outline-light viewPatient" data-id="${p.id}" title="View"><i class="bi bi-eye"></i></button>
                <button class="btn btn-outline-light editPatient" data-id="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger deletePatient" data-id="${p.id}" title="Delete"><i class="bi bi-trash"></i></button>
            </div></td></tr>`).join('')}</tbody></table>`}
    </div>
    <!-- Add Patient Modal -->
    <div class="modal fade" id="patientModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Register New Patient</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><form id="patientForm">
            <div class="mb-3"><label class="form-label">Full Name</label><input type="text" id="patName" class="form-control" required></div>
            <div class="row mb-3"><div class="col"><label class="form-label">Age</label><input type="number" id="patAge" class="form-control" required min="0" max="150"></div>
                <div class="col"><label class="form-label">Gender</label><select id="patGender" class="form-select" required><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div></div>
            <div class="row mb-3"><div class="col"><label class="form-label">Phone</label><input type="tel" id="patPhone" class="form-control" required></div>
                <div class="col"><label class="form-label">Blood Group</label><select id="patBlood" class="form-select" required><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div></div>
            <div class="mb-3"><label class="form-label">Address</label><input type="text" id="patAddress" class="form-control"></div>
            <div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Register</button></div>
        </form></div></div></div></div>
    <!-- View Patient Modal -->
    <div class="modal fade" id="viewPatientModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Patient Details</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body" id="viewPatientContent"></div></div></div></div>
    <!-- Edit Patient Modal -->
    <div class="modal fade" id="editPatientModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Edit Patient</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><form id="editPatientForm"><input type="hidden" id="editPatId">
            <div class="mb-3"><label class="form-label">Full Name</label><input type="text" id="editPatName" class="form-control" required></div>
            <div class="row mb-3"><div class="col"><label class="form-label">Age</label><input type="number" id="editPatAge" class="form-control" required></div>
                <div class="col"><label class="form-label">Gender</label><select id="editPatGender" class="form-select"><option>Male</option><option>Female</option><option>Other</option></select></div></div>
            <div class="row mb-3"><div class="col"><label class="form-label">Phone</label><input type="tel" id="editPatPhone" class="form-control" required></div>
                <div class="col"><label class="form-label">Blood Group</label><select id="editPatBlood" class="form-select"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div></div>
            <div class="mb-3"><label class="form-label">Address</label><input type="text" id="editPatAddress" class="form-control"></div>
            <div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Save Changes</button></div>
        </form></div></div></div></div>`;
}

// ==================== APPOINTMENTS ====================
async function renderAppointments(user) {
    const [appointments, patients, users] = await Promise.all([API.get('/api/appointments'), API.get('/api/patients'), API.get('/api/users')]);
    const doctors = users.filter(u => u.role === 'doctor');
    let filtered = appointments;
    if (user.role === 'doctor') filtered = appointments.filter(a => a.doctor_id === user.id);
    return `
    <div class="d-flex justify-content-end mb-3"><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#apptModal"><i class="bi bi-plus-lg"></i> Book Appointment</button></div>
    <div class="table-wrapper">
        <div class="table-header"><h6 class="mb-0">Appointments (${filtered.length})</h6></div>
        ${!filtered.length ? '<div class="empty-state"><div class="empty-icon">📅</div><h3>No appointments</h3><p>Book your first appointment.</p></div>' : `
        <table class="table table-dark table-hover mb-0"><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${filtered.map(a => {
            const pat = patients.find(p => p.id === a.patient_id);
            const doc = users.find(u => u.id === a.doctor_id);
            return `<tr><td>${pat?pat.name:'N/A'}</td><td>${doc?doc.name:'N/A'}</td><td>${a.date}</td><td>${a.time}</td>
            <td><span class="badge bg-${a.status==='confirmed'?'primary':a.status==='completed'?'success':a.status==='cancelled'?'danger':'warning'}">${a.status}</span></td>
            <td><div class="btn-group btn-group-sm">
                ${a.status==='pending'?`<button class="btn btn-outline-success confirmAppt" data-id="${a.id}"><i class="bi bi-check-lg"></i></button>`:''}
                ${a.status!=='completed'&&a.status!=='cancelled'?`<button class="btn btn-outline-warning cancelAppt" data-id="${a.id}"><i class="bi bi-x-lg"></i></button>`:''}
                <button class="btn btn-outline-danger deleteAppt" data-id="${a.id}"><i class="bi bi-trash"></i></button>
            </div></td></tr>`;
        }).join('')}</tbody></table>`}
    </div>
    <!-- Appointment Modal -->
    <div class="modal fade" id="apptModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Book Appointment</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><form id="apptForm">
            <div class="mb-3"><label class="form-label">Patient</label><select id="apptPatient" class="form-select" required><option value="">Select Patient</option>${patients.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
            <div class="mb-3"><label class="form-label">Doctor</label><select id="apptDoctor" class="form-select" required><option value="">Select Doctor</option>${doctors.map(d=>`<option value="${d.id}">${d.name}${d.specialization?' — '+d.specialization:''}</option>`).join('')}</select></div>
            <div class="row mb-3"><div class="col"><label class="form-label">Date</label><input type="date" id="apptDate" class="form-control" required></div>
                <div class="col"><label class="form-label">Time</label><input type="time" id="apptTime" class="form-control" required></div></div>
            <div class="mb-3"><label class="form-label">Notes</label><input type="text" id="apptNotes" class="form-control" placeholder="Optional notes"></div>
            <div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Book</button></div>
        </form></div></div></div></div>`;
}

// ==================== CONSULTATIONS ====================
async function renderConsultations(user) {
    const [appointments, prescriptions, patients, users] = await Promise.all([API.get('/api/appointments'), API.get('/api/prescriptions'), API.get('/api/patients'), API.get('/api/users')]);
    const confirmed = appointments.filter(a => (a.status==='confirmed'||a.status==='completed') && (user.role==='admin'||a.doctor_id===user.id));
    return `
    <div class="card bg-dark border-secondary mb-3"><div class="card-header"><h6 class="mb-0">Active Consultations</h6></div><div class="card-body">
        ${!confirmed.length ? '<div class="empty-state"><div class="empty-icon">💊</div><h3>No consultations</h3><p>Confirmed appointments will appear here.</p></div>' : confirmed.map(a => {
            const pat = patients.find(p => p.id === a.patient_id);
            const doc = users.find(u => u.id === a.doctor_id);
            const rx = prescriptions.find(r => r.appointment_id === a.id);
            return `<div class="prescription-card">
                <div class="rx-header"><h4>${pat?pat.name:'Unknown'} — ${a.date} at ${a.time}</h4><span class="badge bg-${a.status==='completed'?'success':'primary'}">${a.status}</span></div>
                <p class="mb-1"><strong>Doctor:</strong> ${doc?doc.name:'N/A'}</p>
                ${rx ? `<p class="mb-1"><strong>Diagnosis:</strong> ${rx.diagnosis}</p><p class="mb-1"><strong>Medicines:</strong> ${rx.medicines}</p><p class="mb-1"><strong>Notes:</strong> ${rx.notes||'—'}</p>
                    <button class="btn btn-outline-danger btn-sm mt-1 deleteRx" data-id="${rx.id}" data-appt-id="${a.id}"><i class="bi bi-trash"></i> Delete Prescription</button>`
                : (user.role==='doctor'&&a.status==='confirmed' ? `<button class="btn btn-success btn-sm addRx" data-appt-id="${a.id}">Write Prescription</button>` : '<p class="text-muted mb-0">No prescription yet</p>')}
            </div>`;
        }).join('')}
    </div></div>
    <!-- Prescription Modal -->
    <div class="modal fade" id="rxModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Write Prescription</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><form id="rxForm"><input type="hidden" id="rxApptId">
            <div class="mb-3"><label class="form-label">Diagnosis</label><input type="text" id="rxDiagnosis" class="form-control" required></div>
            <div class="mb-3"><label class="form-label">Medicines</label><input type="text" id="rxMedicines" class="form-control" required placeholder="e.g. Paracetamol 500mg"></div>
            <div class="mb-3"><label class="form-label">Notes</label><input type="text" id="rxNotes" class="form-control" placeholder="Optional"></div>
            <div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-success">Save Prescription</button></div>
        </form></div></div></div></div>`;
}

// ==================== BILLING ====================
async function renderBilling(user) {
    const [bills, patients] = await Promise.all([API.get('/api/bills'), API.get('/api/patients')]);
    return `
    <div class="d-flex justify-content-end mb-3"><button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#billModal"><i class="bi bi-plus-lg"></i> Generate Bill</button></div>
    ${bills.length ? `<div class="table-wrapper mb-3"><div class="table-header"><h6 class="mb-0">Billing History (${bills.length})</h6></div>
        <table class="table table-dark table-hover mb-0"><thead><tr><th>Invoice #</th><th>Patient</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${bills.map(b => {
            const pat = patients.find(p => p.id === b.patient_id);
            return `<tr><td><strong>#${b.id.slice(-6).toUpperCase()}</strong></td><td>${pat?pat.name:'N/A'}</td><td>${b.items.length} item(s)</td><td><strong>₹${Number(b.total).toLocaleString()}</strong></td><td>${b.date}</td>
            <td><div class="btn-group btn-group-sm"><button class="btn btn-outline-light viewBill" data-id="${b.id}"><i class="bi bi-eye"></i></button><button class="btn btn-outline-danger deleteBill" data-id="${b.id}"><i class="bi bi-trash"></i></button></div></td></tr>`;
        }).join('')}</tbody></table></div>` : '<div class="empty-state mb-3"><div class="empty-icon">💰</div><h3>No bills generated</h3><p>Create your first invoice.</p></div>'}
    <!-- Bill Modal -->
    <div class="modal fade" id="billModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Generate New Bill</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><form id="billForm">
            <div class="mb-3"><label class="form-label">Patient</label><select id="billPatient" class="form-select" required><option value="">Select</option>${patients.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
            <label class="form-label">Items</label>
            <div id="billItems"><div class="d-flex gap-2 mb-2"><input type="text" class="form-control billItemDesc" placeholder="Description" required style="flex:2"><input type="number" class="form-control billItemAmt" placeholder="Amount" required min="0" style="flex:1"></div></div>
            <button type="button" class="btn btn-outline-secondary btn-sm mb-3" id="addBillItem"><i class="bi bi-plus"></i> Add Item</button>
            <div class="d-flex justify-content-end gap-2"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Generate Invoice</button></div>
        </form></div></div></div></div>
    <!-- View Bill Modal -->
    <div class="modal fade" id="viewBillModal" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Invoice Preview</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body" id="billPreviewContent"></div>
        <div class="modal-footer"><button class="btn btn-primary" id="printBillBtn"><i class="bi bi-printer"></i> Print Invoice</button></div>
    </div></div></div>`;
}

// ==================== REPORTS ====================
async function renderReports(user) {
    const [stats, patients, appointments, prescriptions, users] = await Promise.all([
        API.get('/api/stats'), API.get('/api/patients'), API.get('/api/appointments'), API.get('/api/prescriptions'), API.get('/api/users')
    ]);
    const doctors = users.filter(u => u.role === 'doctor');
    const maxAppt = Math.max(stats.pendingCount, stats.confirmedCount, stats.completedCount, stats.cancelledCount, 1);
    return `
    <div class="row g-3 mb-4">
        <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon blue"><i class="bi bi-people"></i></div><div class="stat-value">${stats.patientCount}</div><div class="stat-label">Total Patients</div></div></div>
        <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon green"><i class="bi bi-calendar"></i></div><div class="stat-value">${stats.apptCount}</div><div class="stat-label">Total Appointments</div></div></div>
        <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon yellow"><i class="bi bi-capsule"></i></div><div class="stat-value">${stats.rxCount}</div><div class="stat-label">Prescriptions</div></div></div>
        <div class="col-sm-6 col-xl-3"><div class="stat-card"><div class="stat-icon red"><i class="bi bi-currency-rupee"></i></div><div class="stat-value">₹${Number(stats.totalRevenue).toLocaleString()}</div><div class="stat-label">Total Revenue</div></div></div>
    </div>
    <div class="chart-container">
        <div class="chart-title">Appointment Status Breakdown</div>
        <div class="chart-bar-row"><span class="chart-bar-label">Pending</span><div class="chart-bar"><div class="chart-bar-fill yellow" style="width:${(stats.pendingCount/maxAppt)*100}%">${stats.pendingCount}</div></div></div>
        <div class="chart-bar-row"><span class="chart-bar-label">Confirmed</span><div class="chart-bar"><div class="chart-bar-fill blue" style="width:${(stats.confirmedCount/maxAppt)*100}%">${stats.confirmedCount}</div></div></div>
        <div class="chart-bar-row"><span class="chart-bar-label">Completed</span><div class="chart-bar"><div class="chart-bar-fill green" style="width:${(stats.completedCount/maxAppt)*100}%">${stats.completedCount}</div></div></div>
        <div class="chart-bar-row"><span class="chart-bar-label">Cancelled</span><div class="chart-bar"><div class="chart-bar-fill red" style="width:${(stats.cancelledCount/maxAppt)*100}%">${stats.cancelledCount}</div></div></div>
    </div>
    <div class="table-wrapper"><div class="table-header"><h6 class="mb-0">Doctor Performance</h6></div>
        <table class="table table-dark table-hover mb-0"><thead><tr><th>Doctor</th><th>Specialization</th><th>Appointments</th><th>Completed</th><th>Prescriptions</th></tr></thead>
        <tbody>${doctors.map(d => {
            const dAppts = appointments.filter(a => a.doctor_id === d.id);
            const dComplete = dAppts.filter(a => a.status === 'completed').length;
            const dRx = prescriptions.filter(rx => { const a = appointments.find(ap => ap.id === rx.appointment_id); return a && a.doctor_id === d.id; }).length;
            return `<tr><td><strong>${d.name}</strong></td><td>${d.specialization||'—'}</td><td>${dAppts.length}</td><td>${dComplete}</td><td>${dRx}</td></tr>`;
        }).join('')}</tbody></table></div>`;
}

// ==================== PROFILE ====================
function renderProfile(user) {
    return `
    <div class="card bg-dark border-secondary" style="max-width:600px">
        <div class="card-body">
            <div class="profile-header">
                <div class="profile-avatar">${user.name.charAt(0)}</div>
                <div><h4 class="mb-0">${user.name}</h4><p class="text-muted mb-1">${user.email}</p><span class="badge bg-primary">${user.role.toUpperCase()}</span></div>
            </div>
            <div class="mb-3"><label class="form-label">Full Name</label><input type="text" id="profileName" class="form-control" value="${user.name}"></div>
            <div class="mb-3"><label class="form-label">Email</label><input type="email" class="form-control" value="${user.email}" disabled></div>
            ${user.role==='doctor'?`<div class="mb-3"><label class="form-label">Specialization</label><input type="text" id="profileSpec" class="form-control" value="${user.specialization||''}"></div>`:''}
            <button class="btn btn-primary" id="saveProfile">Save Changes</button>
            <hr class="border-secondary my-4">
            <h6>Change Password</h6>
            <div class="mb-3"><label class="form-label">Current Password</label><input type="password" id="profileCurrPass" class="form-control"></div>
            <div class="mb-3"><label class="form-label">New Password</label><input type="password" id="profileNewPass" class="form-control" minlength="6"></div>
            <div class="mb-3"><label class="form-label">Confirm</label><input type="password" id="profileConfPass" class="form-control"></div>
            <button class="btn btn-success" id="changePassword">Change Password</button>
        </div>
    </div>`;
}

// ==================== EVENT BINDING ====================
function bindEvents() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page);
            const sb = document.getElementById('sidebar'); if (sb) sb.classList.remove('open');
            const bd = document.getElementById('sidebarBackdrop'); if (bd) bd.classList.remove('active');
        });
    });
    // Mobile
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) mobileBtn.addEventListener('click', () => { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarBackdrop').classList.toggle('active'); });
    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) backdrop.addEventListener('click', () => { document.getElementById('sidebar').classList.remove('open'); backdrop.classList.remove('active'); });
    // Auth
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        const res = await API.post('/api/auth/login', { email: document.getElementById('loginEmail').value.trim(), password: document.getElementById('loginPassword').value });
        if (res.error) { showToast(res.error, 'error'); return; }
        Session.set(res); currentPage = 'dashboard'; showToast(`Welcome back, ${res.name}!`, 'success'); render();
    });
    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.addEventListener('submit', async e => {
        e.preventDefault();
        const data = { name: document.getElementById('signupName').value.trim(), email: document.getElementById('signupEmail').value.trim(), password: document.getElementById('signupPassword').value, role: document.getElementById('signupRole').value, specialization: document.getElementById('signupSpec')?.value.trim() || null };
        if (!data.role) { showToast('Select a role', 'error'); return; }
        const res = await API.post('/api/auth/signup', data);
        if (res.error) { showToast(res.error, 'error'); return; }
        Session.set(res); currentPage = 'dashboard'; showToast(`Account created! Welcome, ${res.name}!`, 'success'); render();
    });
    const goSignup = document.getElementById('goSignup'); if (goSignup) goSignup.addEventListener('click', e => { e.preventDefault(); navigate('signup'); });
    const goLogin = document.getElementById('goLogin'); if (goLogin) goLogin.addEventListener('click', e => { e.preventDefault(); navigate('login'); });
    const signupRole = document.getElementById('signupRole');
    if (signupRole) signupRole.addEventListener('change', () => { document.getElementById('specGroup').style.display = signupRole.value === 'doctor' ? 'block' : 'none'; });
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { Session.clear(); navigate('login'); showToast('Logged out', 'info'); });
    // Patients CRUD
    const patientForm = document.getElementById('patientForm');
    if (patientForm) patientForm.addEventListener('submit', async e => {
        e.preventDefault(); const user = Session.get();
        await API.post('/api/patients', { name: document.getElementById('patName').value.trim(), age: parseInt(document.getElementById('patAge').value), gender: document.getElementById('patGender').value, phone: document.getElementById('patPhone').value.trim(), blood_group: document.getElementById('patBlood').value, address: document.getElementById('patAddress').value.trim(), registered_by: user.id });
        bootstrap.Modal.getInstance(document.getElementById('patientModal')).hide();
        showToast('Patient registered!', 'success'); navigate('patients');
    });
    document.querySelectorAll('.viewPatient').forEach(btn => btn.addEventListener('click', async () => {
        const patients = await API.get('/api/patients'); const p = patients.find(x => x.id === btn.dataset.id); if (!p) return;
        const [appts, bills] = await Promise.all([API.get('/api/appointments'), API.get('/api/bills')]);
        document.getElementById('viewPatientContent').innerHTML = `
            <div class="profile-header mb-3"><div class="profile-avatar">${p.name.charAt(0)}</div><div><h5 class="mb-0">${p.name}</h5><p class="text-muted">${p.gender}, ${p.age} years old</p></div></div>
            <div class="row g-3 mb-3"><div class="col-6"><small class="text-muted">PHONE</small><p>${p.phone}</p></div><div class="col-6"><small class="text-muted">BLOOD GROUP</small><p><span class="badge bg-info">${p.blood_group}</span></p></div>
                <div class="col-6"><small class="text-muted">ADDRESS</small><p>${p.address||'—'}</p></div><div class="col-6"><small class="text-muted">REGISTERED</small><p>${p.date}</p></div></div>
            <div class="row g-3"><div class="col-6"><div class="stat-card text-center"><div class="stat-value">${appts.filter(a=>a.patient_id===p.id).length}</div><div class="stat-label">Appointments</div></div></div>
                <div class="col-6"><div class="stat-card text-center"><div class="stat-value">${bills.filter(b=>b.patient_id===p.id).length}</div><div class="stat-label">Bills</div></div></div></div>`;
        new bootstrap.Modal(document.getElementById('viewPatientModal')).show();
    }));
    document.querySelectorAll('.editPatient').forEach(btn => btn.addEventListener('click', async () => {
        const patients = await API.get('/api/patients'); const p = patients.find(x => x.id === btn.dataset.id); if (!p) return;
        document.getElementById('editPatId').value = p.id; document.getElementById('editPatName').value = p.name;
        document.getElementById('editPatAge').value = p.age; document.getElementById('editPatGender').value = p.gender;
        document.getElementById('editPatPhone').value = p.phone; document.getElementById('editPatBlood').value = p.blood_group;
        document.getElementById('editPatAddress').value = p.address || '';
        new bootstrap.Modal(document.getElementById('editPatientModal')).show();
    }));
    const editPatientForm = document.getElementById('editPatientForm');
    if (editPatientForm) editPatientForm.addEventListener('submit', async e => {
        e.preventDefault();
        await API.put('/api/patients/' + document.getElementById('editPatId').value, { name: document.getElementById('editPatName').value.trim(), age: parseInt(document.getElementById('editPatAge').value), gender: document.getElementById('editPatGender').value, phone: document.getElementById('editPatPhone').value.trim(), blood_group: document.getElementById('editPatBlood').value, address: document.getElementById('editPatAddress').value.trim() });
        bootstrap.Modal.getInstance(document.getElementById('editPatientModal')).hide();
        showToast('Patient updated!', 'success'); navigate('patients');
    });
    document.querySelectorAll('.deletePatient').forEach(btn => btn.addEventListener('click', async () => {
        if (confirm('Delete this patient and all related records?')) { await API.del('/api/patients/' + btn.dataset.id); showToast('Patient deleted', 'success'); navigate('patients'); }
    }));
    const patSearch = document.getElementById('patientSearch');
    if (patSearch) patSearch.addEventListener('input', () => { const q = patSearch.value.toLowerCase(); document.querySelectorAll('#patientsTable tbody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; }); });
    // Appointments CRUD
    const apptForm = document.getElementById('apptForm');
    if (apptForm) apptForm.addEventListener('submit', async e => {
        e.preventDefault();
        await API.post('/api/appointments', { patient_id: document.getElementById('apptPatient').value, doctor_id: document.getElementById('apptDoctor').value, date: document.getElementById('apptDate').value, time: document.getElementById('apptTime').value, notes: document.getElementById('apptNotes').value.trim() });
        bootstrap.Modal.getInstance(document.getElementById('apptModal')).hide();
        showToast('Appointment booked!', 'success'); navigate('appointments');
    });
    document.querySelectorAll('.confirmAppt').forEach(btn => btn.addEventListener('click', async () => { await API.put('/api/appointments/' + btn.dataset.id, { status: 'confirmed' }); showToast('Confirmed!', 'success'); navigate('appointments'); }));
    document.querySelectorAll('.cancelAppt').forEach(btn => btn.addEventListener('click', async () => { await API.put('/api/appointments/' + btn.dataset.id, { status: 'cancelled' }); showToast('Cancelled', 'info'); navigate('appointments'); }));
    document.querySelectorAll('.deleteAppt').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete this appointment?')) { await API.del('/api/appointments/' + btn.dataset.id); showToast('Deleted', 'success'); navigate('appointments'); } }));
    // Prescriptions
    document.querySelectorAll('.addRx').forEach(btn => btn.addEventListener('click', () => { document.getElementById('rxApptId').value = btn.dataset.apptId; new bootstrap.Modal(document.getElementById('rxModal')).show(); }));
    const rxForm = document.getElementById('rxForm');
    if (rxForm) rxForm.addEventListener('submit', async e => {
        e.preventDefault();
        await API.post('/api/prescriptions', { appointment_id: document.getElementById('rxApptId').value, diagnosis: document.getElementById('rxDiagnosis').value.trim(), medicines: document.getElementById('rxMedicines').value.trim(), notes: document.getElementById('rxNotes').value.trim() });
        bootstrap.Modal.getInstance(document.getElementById('rxModal')).hide();
        showToast('Prescription saved!', 'success'); navigate('consultations');
    });
    document.querySelectorAll('.deleteRx').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete this prescription?')) { await API.del('/api/prescriptions/' + btn.dataset.id); showToast('Deleted', 'success'); navigate('consultations'); } }));
    // Billing
    const addBillItem = document.getElementById('addBillItem');
    if (addBillItem) addBillItem.addEventListener('click', () => {
        const row = document.createElement('div'); row.className = 'd-flex gap-2 mb-2';
        row.innerHTML = '<input type="text" class="form-control billItemDesc" placeholder="Description" required style="flex:2"><input type="number" class="form-control billItemAmt" placeholder="Amount" required min="0" style="flex:1"><button type="button" class="btn btn-outline-danger btn-sm removeBillItem"><i class="bi bi-x"></i></button>';
        document.getElementById('billItems').appendChild(row);
        row.querySelector('.removeBillItem').addEventListener('click', () => row.remove());
    });
    const billForm = document.getElementById('billForm');
    if (billForm) billForm.addEventListener('submit', async e => {
        e.preventDefault(); const user = Session.get();
        const descs = document.querySelectorAll('.billItemDesc'); const amts = document.querySelectorAll('.billItemAmt');
        const items = []; let total = 0;
        descs.forEach((d, i) => { const amt = parseFloat(amts[i].value) || 0; items.push({ desc: d.value.trim(), amount: amt }); total += amt; });
        await API.post('/api/bills', { patient_id: document.getElementById('billPatient').value, items, total, generated_by: user.id });
        bootstrap.Modal.getInstance(document.getElementById('billModal')).hide();
        showToast(`Bill generated! Total: ₹${total.toLocaleString()}`, 'success'); navigate('billing');
    });
    document.querySelectorAll('.viewBill').forEach(btn => btn.addEventListener('click', async () => {
        const [bills, patients] = await Promise.all([API.get('/api/bills'), API.get('/api/patients')]);
        const bill = bills.find(b => b.id === btn.dataset.id); if (!bill) return;
        const pat = patients.find(p => p.id === bill.patient_id);
        document.getElementById('billPreviewContent').innerHTML = `<div class="bill-preview">
            <div class="bill-header"><h4>❤️‍🩹 LifeCare Hospital</h4><p>Invoice #${bill.id.slice(-6).toUpperCase()} | Date: ${bill.date}</p></div>
            <p><strong>Patient:</strong> ${pat?pat.name:'N/A'}</p>
            <table class="table table-dark table-sm"><thead><tr><th>#</th><th>Description</th><th>Amount</th></tr></thead>
            <tbody>${bill.items.map((item, i) => `<tr><td>${i+1}</td><td>${item.desc}</td><td>₹${Number(item.amount).toLocaleString()}</td></tr>`).join('')}</tbody></table>
            <div class="bill-total">Total: ₹${Number(bill.total).toLocaleString()}</div></div>`;
        new bootstrap.Modal(document.getElementById('viewBillModal')).show();
    }));
    document.querySelectorAll('.deleteBill').forEach(btn => btn.addEventListener('click', async () => { if (confirm('Delete this bill?')) { await API.del('/api/bills/' + btn.dataset.id); showToast('Deleted', 'success'); navigate('billing'); } }));
    const printBillBtn = document.getElementById('printBillBtn');
    if (printBillBtn) printBillBtn.addEventListener('click', () => {
        const content = document.getElementById('billPreviewContent').innerHTML;
        const win = window.open('', '_blank', 'width=700,height=500');
        win.document.write(`<html><head><title>Invoice</title><style>body{font-family:'Inter',sans-serif;padding:40px;color:#1a1a1a}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:10px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5}.bill-header{text-align:center;border-bottom:2px solid #000;padding-bottom:16px;margin-bottom:20px}.bill-total{text-align:right;font-size:18px;font-weight:700;padding-top:16px;border-top:2px solid #000}</style></head><body>${content}</body></html>`);
        win.document.close(); win.print();
    });
    // Profile
    const saveProfile = document.getElementById('saveProfile');
    if (saveProfile) saveProfile.addEventListener('click', async () => {
        const user = Session.get(); const spec = document.getElementById('profileSpec');
        await API.put('/api/users/' + user.id, { name: document.getElementById('profileName').value.trim(), specialization: spec ? spec.value.trim() : null });
        user.name = document.getElementById('profileName').value.trim();
        if (spec) user.specialization = spec.value.trim();
        Session.set(user); showToast('Profile updated!', 'success'); navigate('profile');
    });
    const changePasswordBtn = document.getElementById('changePassword');
    if (changePasswordBtn) changePasswordBtn.addEventListener('click', async () => {
        const curr = document.getElementById('profileCurrPass').value, np = document.getElementById('profileNewPass').value, cp = document.getElementById('profileConfPass').value;
        if (!curr || !np || !cp) { showToast('Fill all fields', 'error'); return; }
        if (np.length < 6) { showToast('Min 6 characters', 'error'); return; }
        if (np !== cp) { showToast('Passwords don\'t match', 'error'); return; }
        const res = await API.put('/api/users/' + Session.get().id + '/password', { currentPassword: curr, newPassword: np });
        if (res.error) { showToast(res.error, 'error'); return; }
        document.getElementById('profileCurrPass').value = ''; document.getElementById('profileNewPass').value = ''; document.getElementById('profileConfPass').value = '';
        showToast('Password changed!', 'success');
    });
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    const session = Session.get();
    currentPage = session ? 'dashboard' : 'login';
    render();
});

/* ============================================
   Hospital Management System — Application
   ============================================ */

// ==================== DATA LAYER ====================
const DB = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
    set(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
    genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
};

const KEYS = {
    users: 'hms_users',
    patients: 'hms_patients',
    appointments: 'hms_appointments',
    prescriptions: 'hms_prescriptions',
    bills: 'hms_bills'
};

// Session
const Session = {
    set(user) { sessionStorage.setItem('hms_session', JSON.stringify({ userId: user.id, role: user.role })); },
    get() { try { return JSON.parse(sessionStorage.getItem('hms_session')); } catch { return null; } },
    clear() { sessionStorage.removeItem('hms_session'); },
    getUser() {
        const s = this.get();
        if (!s) return null;
        return DB.get(KEYS.users).find(u => u.id === s.userId) || null;
    }
};

// ==================== TOAST ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(40px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==================== SEED DATA ====================
function seedData() {
    if (DB.get(KEYS.users).length === 0) {
        const users = [
            { id: 'admin1', name: 'Dr. Sarah Mitchell', email: 'admin@hospital.com', password: 'admin123', role: 'admin' },
            { id: 'doc1', name: 'Dr. James Wilson', email: 'doctor@hospital.com', password: 'doctor123', role: 'doctor', specialization: 'Cardiology' },
            { id: 'doc2', name: 'Dr. Emily Chen', email: 'emily@hospital.com', password: 'doctor123', role: 'doctor', specialization: 'Neurology' },
            { id: 'pat1', name: 'John Smith', email: 'patient@hospital.com', password: 'patient123', role: 'patient' }
        ];
        DB.set(KEYS.users, users);
        const patients = [
            { id: 'p1', name: 'John Smith', age: 45, gender: 'Male', phone: '555-0101', address: '123 Oak Ave', bloodGroup: 'O+', registeredBy: 'admin1', date: '2026-03-20' },
            { id: 'p2', name: 'Mary Johnson', age: 32, gender: 'Female', phone: '555-0102', address: '456 Elm St', bloodGroup: 'A+', registeredBy: 'admin1', date: '2026-03-21' },
            { id: 'p3', name: 'Robert Davis', age: 58, gender: 'Male', phone: '555-0103', address: '789 Pine Rd', bloodGroup: 'B-', registeredBy: 'admin1', date: '2026-03-22' }
        ];
        DB.set(KEYS.patients, patients);
        const appts = [
            { id: 'a1', patientId: 'p1', doctorId: 'doc1', date: '2026-03-24', time: '10:00', status: 'confirmed', notes: 'Follow-up checkup' },
            { id: 'a2', patientId: 'p2', doctorId: 'doc2', date: '2026-03-25', time: '14:30', status: 'pending', notes: 'Initial consultation' }
        ];
        DB.set(KEYS.appointments, appts);
    }
}

// ==================== APP ROUTER ====================
let currentPage = 'login';

function navigate(page) {
    currentPage = page;
    render();
}

function render() {
    const user = Session.getUser();
    const appRoot = document.getElementById('app');
    if (!user && currentPage !== 'login' && currentPage !== 'signup') {
        currentPage = 'login';
    }
    if (!user) {
        document.body.classList.remove('has-sidebar');
        if (currentPage === 'signup') appRoot.innerHTML = renderSignup();
        else appRoot.innerHTML = renderLogin();
    } else {
        document.body.classList.add('has-sidebar');
        appRoot.innerHTML = renderAppLayout(user);
    }
    bindEvents();
}

// ==================== AUTH PAGES ====================
function renderLogin() {
    return `
    <div class="auth-wrapper">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo">
                    <div class="logo-icon">❤️‍🩹</div>
                    <h1>LifeCare Hospital</h1>
                    <p>Sign in to your management portal</p>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="you@hospital.com" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block btn-lg">Sign In</button>
                </form>
                <div class="auth-link">
                    Don't have an account? <a href="#" id="goSignup">Create Account</a>
                </div>
                <div class="form-text text-center mt-2" style="color:var(--text-muted);font-size:0.75rem;">
                    Demo: admin@hospital.com / admin123
                </div>
            </div>
        </div>
    </div>`;
}

function renderSignup() {
    return `
    <div class="auth-wrapper">
        <div class="auth-container">
            <div class="auth-card">
                <div class="auth-logo">
                    <div class="logo-icon">❤️‍🩹</div>
                    <h1>Create Account</h1>
                    <p>Join the LifeCare Hospital Portal</p>
                </div>
                <form id="signupForm">
                    <div class="form-group">
                        <label for="signupName">Full Name</label>
                        <input type="text" id="signupName" class="form-control" placeholder="Dr. John Doe" required>
                    </div>
                    <div class="form-group">
                        <label for="signupEmail">Email Address</label>
                        <input type="email" id="signupEmail" class="form-control" placeholder="you@hospital.com" required>
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">Password</label>
                        <input type="password" id="signupPassword" class="form-control" placeholder="Min 6 characters" required minlength="6">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="signupRole">Role</label>
                            <select id="signupRole" class="form-control" required>
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="doctor">Doctor</option>
                                <option value="patient">Patient</option>
                            </select>
                        </div>
                        <div class="form-group" id="specGroup" style="display:none">
                            <label for="signupSpec">Specialization</label>
                            <input type="text" id="signupSpec" class="form-control" placeholder="e.g. Cardiology">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block btn-lg">Create Account</button>
                </form>
                <div class="auth-link">
                    Already have an account? <a href="#" id="goLogin">Sign In</a>
                </div>
            </div>
        </div>
    </div>`;
}

// ==================== APP LAYOUT ====================
function renderAppLayout(user) {
    return `
    <div class="app-layout">
        <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-logo">❤️‍🩹</div>
                <div class="sidebar-brand">
                    <h2>LifeCare</h2>
                    <small>Hospital Portal</small>
                </div>
            </div>
            <nav class="sidebar-nav">
                ${getSidebarNav(user.role)}
            </nav>
            <div class="sidebar-footer">
                <div class="sidebar-user" id="navProfile" data-page="profile">
                    <div class="user-avatar">${user.name.charAt(0)}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-role">${user.role}</div>
                    </div>
                </div>
            </div>
        </aside>
        <main class="main-content">
            <header class="content-header">
                <div style="display:flex;align-items:center;gap:12px;">
                    <button class="mobile-menu-btn" id="mobileMenuBtn">☰</button>
                    <h1>${getPageTitle()}</h1>
                </div>
                <div class="header-actions">
                    <button class="btn btn-outline btn-sm" id="logoutBtn">⬡ Logout</button>
                </div>
            </header>
            <div class="content-body" id="pageContent">
                ${renderPageContent(user)}
            </div>
        </main>
    </div>`;
}

function getSidebarNav(role) {
    const items = [
        { section: 'Main', items: [
            { icon: '📊', label: 'Dashboard', page: 'dashboard', roles: ['admin','doctor','patient'] },
        ]},
        { section: 'Management', items: [
            { icon: '👥', label: 'Patients', page: 'patients', roles: ['admin','doctor'] },
            { icon: '📅', label: 'Appointments', page: 'appointments', roles: ['admin','doctor','patient'] },
            { icon: '💊', label: 'Consultations', page: 'consultations', roles: ['admin','doctor'] },
            { icon: '💰', label: 'Billing', page: 'billing', roles: ['admin'] },
        ]},
        { section: 'Analytics', items: [
            { icon: '📈', label: 'Reports', page: 'reports', roles: ['admin'] },
        ]},
    ];
    let html = '';
    items.forEach(sec => {
        const vis = sec.items.filter(i => i.roles.includes(role));
        if (vis.length === 0) return;
        html += `<div class="nav-section"><div class="nav-section-title">${sec.section}</div>`;
        vis.forEach(item => {
            const active = currentPage === item.page ? 'active' : '';
            html += `<a class="nav-item ${active}" data-page="${item.page}"><span class="nav-icon">${item.icon}</span>${item.label}</a>`;
        });
        html += '</div>';
    });
    return html;
}

function getPageTitle() {
    const titles = { dashboard:'Dashboard', patients:'Patient Management', appointments:'Appointments', consultations:'Doctor Consultations', billing:'Billing & Invoices', reports:'Reports & Analytics', profile:'My Profile' };
    return titles[currentPage] || 'Dashboard';
}

function renderPageContent(user) {
    switch(currentPage) {
        case 'dashboard': return renderDashboard(user);
        case 'patients': return renderPatients(user);
        case 'appointments': return renderAppointments(user);
        case 'consultations': return renderConsultations(user);
        case 'billing': return renderBilling(user);
        case 'reports': return renderReports(user);
        case 'profile': return renderProfile(user);
        default: return renderDashboard(user);
    }
}

// ==================== DASHBOARD ====================
function renderDashboard(user) {
    const patients = DB.get(KEYS.patients);
    const appointments = DB.get(KEYS.appointments);
    const prescriptions = DB.get(KEYS.prescriptions);
    const bills = DB.get(KEYS.bills);
    const users = DB.get(KEYS.users);
    const doctors = users.filter(u => u.role === 'doctor');
    const pending = appointments.filter(a => a.status === 'pending').length;
    const totalRevenue = bills.reduce((s, b) => s + (b.total || 0), 0);

    let stats = '';
    if (user.role === 'admin') {
        stats = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-icon blue">👥</div><div class="stat-value">${patients.length}</div><div class="stat-label">Total Patients</div></div>
            <div class="stat-card"><div class="stat-icon green">👨‍⚕️</div><div class="stat-value">${doctors.length}</div><div class="stat-label">Active Doctors</div></div>
            <div class="stat-card"><div class="stat-icon yellow">📅</div><div class="stat-value">${pending}</div><div class="stat-label">Pending Appointments</div></div>
            <div class="stat-card"><div class="stat-icon red">💰</div><div class="stat-value">₹${totalRevenue.toLocaleString()}</div><div class="stat-label">Total Revenue</div></div>
        </div>`;
    } else if (user.role === 'doctor') {
        const myAppts = appointments.filter(a => a.doctorId === user.id);
        const myPending = myAppts.filter(a => a.status === 'pending').length;
        const myCompleted = myAppts.filter(a => a.status === 'completed').length;
        stats = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-icon blue">📅</div><div class="stat-value">${myAppts.length}</div><div class="stat-label">My Appointments</div></div>
            <div class="stat-card"><div class="stat-icon yellow">⏳</div><div class="stat-value">${myPending}</div><div class="stat-label">Pending</div></div>
            <div class="stat-card"><div class="stat-icon green">✓</div><div class="stat-value">${myCompleted}</div><div class="stat-label">Completed</div></div>
            <div class="stat-card"><div class="stat-icon red">💊</div><div class="stat-value">${prescriptions.length}</div><div class="stat-label">Prescriptions Written</div></div>
        </div>`;
    } else {
        stats = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-icon blue">📅</div><div class="stat-value">${appointments.length}</div><div class="stat-label">My Appointments</div></div>
            <div class="stat-card"><div class="stat-icon green">💊</div><div class="stat-value">${prescriptions.length}</div><div class="stat-label">My Prescriptions</div></div>
        </div>`;
    }

    const quickActions = user.role === 'patient' ? `
        <div class="quick-actions">
            <div class="quick-action-card" data-page="appointments"><div class="action-icon">📅</div><div class="action-title">Book Appointment</div><div class="action-desc">Schedule a new visit</div></div>
            <div class="quick-action-card" data-page="profile"><div class="action-icon">👤</div><div class="action-title">My Profile</div><div class="action-desc">View your details</div></div>
        </div>` : `
        <div class="quick-actions">
            ${user.role === 'admin' ? '<div class="quick-action-card" data-page="patients"><div class="action-icon">➕</div><div class="action-title">Register Patient</div><div class="action-desc">Add a new patient record</div></div>' : ''}
            <div class="quick-action-card" data-page="appointments"><div class="action-icon">📅</div><div class="action-title">Appointments</div><div class="action-desc">View & manage bookings</div></div>
            ${user.role === 'doctor' ? '<div class="quick-action-card" data-page="consultations"><div class="action-icon">💊</div><div class="action-title">Consultations</div><div class="action-desc">Write prescriptions</div></div>' : ''}
            ${user.role === 'admin' ? '<div class="quick-action-card" data-page="billing"><div class="action-icon">💰</div><div class="action-title">Generate Bill</div><div class="action-desc">Create patient invoice</div></div>' : ''}
            ${user.role === 'admin' ? '<div class="quick-action-card" data-page="reports"><div class="action-icon">📈</div><div class="action-title">Reports</div><div class="action-desc">Analytics & summaries</div></div>' : ''}
        </div>`;

    // Recent appointments table
    const recentAppts = appointments.slice(-5).reverse();
    let recentTable = '';
    if (recentAppts.length > 0) {
        recentTable = `
        <div class="data-table-wrapper mt-3">
            <div class="table-header"><h3>Recent Appointments</h3></div>
            <table class="data-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                <tbody>${recentAppts.map(a => {
                    const pat = patients.find(p => p.id === a.patientId);
                    const doc = users.find(u => u.id === a.doctorId);
                    return `<tr><td>${pat ? pat.name : 'N/A'}</td><td>${doc ? doc.name : 'N/A'}</td><td>${a.date}</td><td>${a.time}</td><td><span class="badge badge-${a.status}">${a.status}</span></td></tr>`;
                }).join('')}</tbody>
            </table>
        </div>`;
    }

    return stats + quickActions + recentTable;
}

// ==================== PATIENTS ====================
function renderPatients(user) {
    const patients = DB.get(KEYS.patients);
    return `
    <div class="flex-between mb-2">
        <div></div>
        <button class="btn btn-primary" id="addPatientBtn">➕ Register Patient</button>
    </div>
    <div class="data-table-wrapper">
        <div class="table-header">
            <h3>All Patients (${patients.length})</h3>
            <input type="text" class="table-search" id="patientSearch" placeholder="Search patients...">
        </div>
        ${patients.length === 0 ? '<div class="empty-state"><div class="empty-icon">👥</div><h3>No patients yet</h3><p>Register your first patient to get started.</p></div>' : `
        <table class="data-table" id="patientsTable">
            <thead><tr><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Blood Group</th><th>Reg. Date</th><th>Actions</th></tr></thead>
            <tbody>${patients.map(p => `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.age}</td>
                    <td>${p.gender}</td>
                    <td>${p.phone}</td>
                    <td><span class="badge badge-confirmed">${p.bloodGroup}</span></td>
                    <td>${p.date}</td>
                    <td style="display:flex;gap:6px;">
                        <button class="btn btn-outline btn-sm viewPatient" data-id="${p.id}" title="View Details">👁</button>
                        <button class="btn btn-outline btn-sm editPatient" data-id="${p.id}" title="Edit Patient">✏️</button>
                        <button class="btn btn-danger btn-sm deletePatient" data-id="${p.id}" title="Delete Patient">🗑</button>
                    </td>
                </tr>`).join('')}</tbody>
        </table>`}
    </div>

    <!-- Add Patient Modal -->
    <div class="modal-overlay" id="patientModal">
        <div class="modal">
            <div class="modal-header"><h3>Register New Patient</h3><button class="modal-close" id="closePatientModal">✕</button></div>
            <div class="modal-body">
                <form id="patientForm">
                    <div class="form-group"><label>Full Name</label><input type="text" id="patName" class="form-control" required placeholder="Patient full name"></div>
                    <div class="form-row">
                        <div class="form-group"><label>Age</label><input type="number" id="patAge" class="form-control" required min="0" max="150" placeholder="Age"></div>
                        <div class="form-group"><label>Gender</label><select id="patGender" class="form-control" required><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Phone</label><input type="tel" id="patPhone" class="form-control" required placeholder="Phone number"></div>
                        <div class="form-group"><label>Blood Group</label><select id="patBlood" class="form-control" required><option value="">Select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                    </div>
                    <div class="form-group"><label>Address</label><input type="text" id="patAddress" class="form-control" placeholder="Full address"></div>
                    <div class="modal-footer" style="padding:0;margin-top:16px;">
                        <button type="button" class="btn btn-outline" id="cancelPatientModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Register Patient</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- View Patient Modal -->
    <div class="modal-overlay" id="viewPatientModal">
        <div class="modal">
            <div class="modal-header"><h3>Patient Details</h3><button class="modal-close" id="closeViewPatientModal">✕</button></div>
            <div class="modal-body" id="viewPatientContent"></div>
        </div>
    </div>

    <!-- Edit Patient Modal -->
    <div class="modal-overlay" id="editPatientModal">
        <div class="modal">
            <div class="modal-header"><h3>Edit Patient</h3><button class="modal-close" id="closeEditPatientModal">✕</button></div>
            <div class="modal-body">
                <form id="editPatientForm">
                    <input type="hidden" id="editPatId">
                    <div class="form-group"><label>Full Name</label><input type="text" id="editPatName" class="form-control" required></div>
                    <div class="form-row">
                        <div class="form-group"><label>Age</label><input type="number" id="editPatAge" class="form-control" required min="0" max="150"></div>
                        <div class="form-group"><label>Gender</label><select id="editPatGender" class="form-control" required><option>Male</option><option>Female</option><option>Other</option></select></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Phone</label><input type="tel" id="editPatPhone" class="form-control" required></div>
                        <div class="form-group"><label>Blood Group</label><select id="editPatBlood" class="form-control" required><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                    </div>
                    <div class="form-group"><label>Address</label><input type="text" id="editPatAddress" class="form-control"></div>
                    <div class="modal-footer" style="padding:0;margin-top:16px;">
                        <button type="button" class="btn btn-outline" id="cancelEditPatientModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

// ==================== APPOINTMENTS ====================
function renderAppointments(user) {
    const appointments = DB.get(KEYS.appointments);
    const patients = DB.get(KEYS.patients);
    const users = DB.get(KEYS.users);
    const doctors = users.filter(u => u.role === 'doctor');
    let filtered = appointments;
    if (user.role === 'doctor') filtered = appointments.filter(a => a.doctorId === user.id);

    return `
    <div class="flex-between mb-2">
        <div></div>
        <button class="btn btn-primary" id="addApptBtn">➕ Book Appointment</button>
    </div>
    <div class="data-table-wrapper">
        <div class="table-header"><h3>Appointments (${filtered.length})</h3></div>
        ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-icon">📅</div><h3>No appointments</h3><p>Book your first appointment.</p></div>' : `
        <table class="data-table">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>${filtered.map(a => {
                const pat = patients.find(p => p.id === a.patientId);
                const doc = users.find(u => u.id === a.doctorId);
                return `<tr>
                    <td>${pat ? pat.name : 'N/A'}</td>
                    <td>${doc ? doc.name : 'N/A'}</td>
                    <td>${a.date}</td>
                    <td>${a.time}</td>
                    <td><span class="badge badge-${a.status}">${a.status}</span></td>
                    <td style="display:flex;gap:6px;flex-wrap:wrap;">
                        ${a.status === 'pending' ? `<button class="btn btn-success btn-sm confirmAppt" data-id="${a.id}">✓ Confirm</button>` : ''}
                        ${a.status !== 'completed' && a.status !== 'cancelled' ? `<button class="btn btn-outline btn-sm cancelAppt" data-id="${a.id}">✕ Cancel</button>` : ''}
                        <button class="btn btn-danger btn-sm deleteAppt" data-id="${a.id}" title="Delete">🗑</button>
                    </td>
                </tr>`;
            }).join('')}</tbody>
        </table>`}
    </div>

    <!-- Appointment Modal -->
    <div class="modal-overlay" id="apptModal">
        <div class="modal">
            <div class="modal-header"><h3>Book Appointment</h3><button class="modal-close" id="closeApptModal">✕</button></div>
            <div class="modal-body">
                <form id="apptForm">
                    <div class="form-group"><label>Patient</label>
                        <select id="apptPatient" class="form-control" required>
                            <option value="">Select Patient</option>
                            ${patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group"><label>Doctor</label>
                        <select id="apptDoctor" class="form-control" required>
                            <option value="">Select Doctor</option>
                            ${doctors.map(d => `<option value="${d.id}">${d.name}${d.specialization ? ' — ' + d.specialization : ''}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Date</label><input type="date" id="apptDate" class="form-control" required></div>
                        <div class="form-group"><label>Time</label><input type="time" id="apptTime" class="form-control" required></div>
                    </div>
                    <div class="form-group"><label>Notes</label><input type="text" id="apptNotes" class="form-control" placeholder="Optional notes"></div>
                    <div class="modal-footer" style="padding:0;margin-top:16px;">
                        <button type="button" class="btn btn-outline" id="cancelApptModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Book Appointment</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

// ==================== CONSULTATIONS ====================
function renderConsultations(user) {
    const appointments = DB.get(KEYS.appointments);
    const prescriptions = DB.get(KEYS.prescriptions);
    const patients = DB.get(KEYS.patients);
    const users = DB.get(KEYS.users);
    const confirmed = appointments.filter(a => (a.status === 'confirmed' || a.status === 'completed') && (user.role === 'admin' || a.doctorId === user.id));

    return `
    <div class="card mb-3">
        <div class="card-header"><h3>Active Consultations</h3></div>
        <div class="card-body">
            ${confirmed.length === 0 ? '<div class="empty-state"><div class="empty-icon">💊</div><h3>No consultations</h3><p>Confirmed appointments will appear here.</p></div>' : confirmed.map(a => {
                const pat = patients.find(p => p.id === a.patientId);
                const doc = users.find(u => u.id === a.doctorId);
                const rx = prescriptions.find(pr => pr.appointmentId === a.id);
                return `<div class="prescription-card">
                    <div class="rx-header">
                        <h4>${pat ? pat.name : 'Unknown'} — ${a.date} at ${a.time}</h4>
                        <span class="badge badge-${a.status}">${a.status}</span>
                    </div>
                    <div class="rx-body">
                        <p><strong>Doctor:</strong> ${doc ? doc.name : 'N/A'}</p>
                        ${rx ? `<p><strong>Diagnosis:</strong> ${rx.diagnosis}</p><p><strong>Medicines:</strong> ${rx.medicines}</p><p><strong>Notes:</strong> ${rx.notes || '—'}</p><div class="mt-1"><button class="btn btn-danger btn-sm deleteRx" data-id="${rx.id}" data-appt-id="${a.id}">🗑 Delete Prescription</button></div>` : (user.role === 'doctor' && a.status === 'confirmed' ? `<button class="btn btn-success btn-sm addRx" data-appt-id="${a.id}">Write Prescription</button>` : '<p style="color:var(--text-muted)">No prescription yet</p>')}
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>

    <!-- Prescription Modal -->
    <div class="modal-overlay" id="rxModal">
        <div class="modal">
            <div class="modal-header"><h3>Write Prescription</h3><button class="modal-close" id="closeRxModal">✕</button></div>
            <div class="modal-body">
                <form id="rxForm">
                    <input type="hidden" id="rxApptId">
                    <div class="form-group"><label>Diagnosis</label><input type="text" id="rxDiagnosis" class="form-control" required placeholder="Enter diagnosis"></div>
                    <div class="form-group"><label>Medicines</label><input type="text" id="rxMedicines" class="form-control" required placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"></div>
                    <div class="form-group"><label>Additional Notes</label><input type="text" id="rxNotes" class="form-control" placeholder="Optional notes"></div>
                    <div class="modal-footer" style="padding:0;margin-top:16px;">
                        <button type="button" class="btn btn-outline" id="cancelRxModal">Cancel</button>
                        <button type="submit" class="btn btn-success">Save Prescription</button>
                    </div>
                </form>
            </div>
        </div>
    </div>`;
}

// ==================== BILLING ====================
function renderBilling(user) {
    const bills = DB.get(KEYS.bills);
    const patients = DB.get(KEYS.patients);
    const users = DB.get(KEYS.users);

    return `
    <div class="flex-between mb-2">
        <div></div>
        <button class="btn btn-primary" id="addBillBtn">➕ Generate Bill</button>
    </div>
    ${bills.length > 0 ? `
    <div class="data-table-wrapper mb-3">
        <div class="table-header"><h3>Billing History (${bills.length})</h3></div>
        <table class="data-table">
            <thead><tr><th>Invoice #</th><th>Patient</th><th>Items</th><th>Total</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>${bills.map(b => {
                const pat = patients.find(p => p.id === b.patientId);
                return `<tr>
                    <td><strong>#${b.id.slice(-6).toUpperCase()}</strong></td>
                    <td>${pat ? pat.name : 'N/A'}</td>
                    <td>${b.items.length} item(s)</td>
                    <td><strong>₹${b.total.toLocaleString()}</strong></td>
                    <td>${b.date}</td>
                    <td style="display:flex;gap:6px;"><button class="btn btn-outline btn-sm viewBill" data-id="${b.id}">👁 View</button><button class="btn btn-danger btn-sm deleteBill" data-id="${b.id}" title="Delete">🗑</button></td>
                </tr>`;
            }).join('')}</tbody>
        </table>
    </div>` : '<div class="empty-state mb-3"><div class="empty-icon">💰</div><h3>No bills generated</h3><p>Create your first invoice.</p></div>'}

    <!-- Bill Modal -->
    <div class="modal-overlay" id="billModal">
        <div class="modal" style="max-width:620px">
            <div class="modal-header"><h3>Generate New Bill</h3><button class="modal-close" id="closeBillModal">✕</button></div>
            <div class="modal-body">
                <form id="billForm">
                    <div class="form-group"><label>Patient</label>
                        <select id="billPatient" class="form-control" required>
                            <option value="">Select Patient</option>
                            ${patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    <div id="billItems">
                        <label style="font-size:0.8125rem;font-weight:500;color:var(--text-secondary);margin-bottom:8px;display:block;">Items</label>
                        <div class="bill-item-row flex gap-1 mb-1">
                            <input type="text" class="form-control billItemDesc" placeholder="Description" required style="flex:2">
                            <input type="number" class="form-control billItemAmt" placeholder="Amount" required min="0" style="flex:1">
                        </div>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm mt-1" id="addBillItem">+ Add Item</button>
                    <div class="modal-footer" style="padding:0;margin-top:16px;">
                        <button type="button" class="btn btn-outline" id="cancelBillModal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Generate Invoice</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- View Bill Modal -->
    <div class="modal-overlay" id="viewBillModal">
        <div class="modal" style="max-width:620px">
            <div class="modal-header"><h3>Invoice Preview</h3><button class="modal-close" id="closeViewBillModal">✕</button></div>
            <div class="modal-body" id="billPreviewContent"></div>
            <div class="modal-footer"><button class="btn btn-primary" id="printBillBtn">🖨️ Print Invoice</button></div>
        </div>
    </div>`;
}

// ==================== REPORTS ====================
function renderReports(user) {
    const patients = DB.get(KEYS.patients);
    const appointments = DB.get(KEYS.appointments);
    const bills = DB.get(KEYS.bills);
    const prescriptions = DB.get(KEYS.prescriptions);
    const users = DB.get(KEYS.users);
    const doctors = users.filter(u => u.role === 'doctor');

    const totalRev = bills.reduce((s, b) => s + (b.total || 0), 0);
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const maxAppt = Math.max(pending, confirmed, completed, cancelled, 1);

    return `
    <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon blue">👥</div><div class="stat-value">${patients.length}</div><div class="stat-label">Total Patients</div></div>
        <div class="stat-card"><div class="stat-icon green">📅</div><div class="stat-value">${appointments.length}</div><div class="stat-label">Total Appointments</div></div>
        <div class="stat-card"><div class="stat-icon yellow">💊</div><div class="stat-value">${prescriptions.length}</div><div class="stat-label">Prescriptions</div></div>
        <div class="stat-card"><div class="stat-icon red">💰</div><div class="stat-value">₹${totalRev.toLocaleString()}</div><div class="stat-label">Total Revenue</div></div>
    </div>

    <div class="chart-container">
        <div class="chart-title">Appointment Status Breakdown</div>
        <div class="chart-bar-row"><span class="chart-bar-label">Pending</span><div class="chart-bar"><div class="chart-bar-fill yellow" style="width:${(pending/maxAppt)*100}%">${pending}</div></div></div>
        <div class="chart-bar-row"><span class="chart-bar-label">Confirmed</span><div class="chart-bar"><div class="chart-bar-fill blue" style="width:${(confirmed/maxAppt)*100}%">${confirmed}</div></div></div>
        <div class="chart-bar-row"><span class="chart-bar-label">Completed</span><div class="chart-bar"><div class="chart-bar-fill green" style="width:${(completed/maxAppt)*100}%">${completed}</div></div></div>
        <div class="chart-bar-row"><span class="chart-bar-label">Cancelled</span><div class="chart-bar"><div class="chart-bar-fill red" style="width:${(cancelled/maxAppt)*100}%">${cancelled}</div></div></div>
    </div>

    <div class="data-table-wrapper">
        <div class="table-header"><h3>Doctor Performance</h3></div>
        <table class="data-table">
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Appointments</th><th>Completed</th><th>Prescriptions</th></tr></thead>
            <tbody>${doctors.map(d => {
                const dAppts = appointments.filter(a => a.doctorId === d.id);
                const dComplete = dAppts.filter(a => a.status === 'completed').length;
                const dRx = prescriptions.filter(rx => {
                    const appt = appointments.find(a => a.id === rx.appointmentId);
                    return appt && appt.doctorId === d.id;
                }).length;
                return `<tr><td><strong>${d.name}</strong></td><td>${d.specialization || '—'}</td><td>${dAppts.length}</td><td>${dComplete}</td><td>${dRx}</td></tr>`;
            }).join('')}</tbody>
        </table>
    </div>`;
}

// ==================== PROFILE ====================
function renderProfile(user) {
    return `
    <div class="card" style="max-width:600px">
        <div class="card-body">
            <div class="profile-header">
                <div class="profile-avatar">${user.name.charAt(0)}</div>
                <div class="profile-details">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>
                    <span class="badge badge-${user.role}" style="margin-top:8px">${user.role.toUpperCase()}</span>
                </div>
            </div>
            <div class="form-group"><label>Full Name</label><input type="text" id="profileName" class="form-control" value="${user.name}"></div>
            <div class="form-group"><label>Email Address</label><input type="email" class="form-control" value="${user.email}" disabled></div>
            ${user.role === 'doctor' ? `<div class="form-group"><label>Specialization</label><input type="text" id="profileSpec" class="form-control" value="${user.specialization || ''}"></div>` : ''}
            <button class="btn btn-primary mt-2" id="saveProfile">Save Changes</button>
            <hr style="border-color:var(--border);margin:24px 0">
            <h3 style="font-size:1rem;margin-bottom:16px;">Change Password</h3>
            <div class="form-group"><label>Current Password</label><input type="password" id="profileCurrPass" class="form-control" placeholder="Enter current password"></div>
            <div class="form-group"><label>New Password</label><input type="password" id="profileNewPass" class="form-control" placeholder="Enter new password (min 6 chars)" minlength="6"></div>
            <div class="form-group"><label>Confirm New Password</label><input type="password" id="profileConfPass" class="form-control" placeholder="Confirm new password"></div>
            <button class="btn btn-success mt-1" id="changePassword">Change Password</button>
        </div>
    </div>`;
}

// ==================== EVENT BINDING ====================
function bindEvents() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const page = el.dataset.page;
            if (page) navigate(page);
            // close mobile sidebar
            const sidebar = document.getElementById('sidebar');
            if (sidebar) sidebar.classList.remove('open');
            const backdrop = document.getElementById('sidebarBackdrop');
            if (backdrop) backdrop.classList.remove('active');
        });
    });

    // Mobile menu
    const mobileBtn = document.getElementById('mobileMenuBtn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('sidebarBackdrop').classList.toggle('active');
        });
    }
    const backdrop = document.getElementById('sidebarBackdrop');
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('open');
            backdrop.classList.remove('active');
        });
    }

    // Auth
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    const goSignup = document.getElementById('goSignup');
    if (goSignup) goSignup.addEventListener('click', (e) => { e.preventDefault(); navigate('signup'); });

    const goLogin = document.getElementById('goLogin');
    if (goLogin) goLogin.addEventListener('click', (e) => { e.preventDefault(); navigate('login'); });

    const signupRole = document.getElementById('signupRole');
    if (signupRole) signupRole.addEventListener('change', () => {
        const sg = document.getElementById('specGroup');
        if (sg) sg.style.display = signupRole.value === 'doctor' ? 'block' : 'none';
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { Session.clear(); navigate('login'); showToast('Logged out successfully', 'info'); });

    // Patients
    const addPatientBtn = document.getElementById('addPatientBtn');
    if (addPatientBtn) addPatientBtn.addEventListener('click', () => document.getElementById('patientModal').classList.add('active'));
    const closePatientModal = document.getElementById('closePatientModal');
    if (closePatientModal) closePatientModal.addEventListener('click', () => document.getElementById('patientModal').classList.remove('active'));
    const cancelPatientModal = document.getElementById('cancelPatientModal');
    if (cancelPatientModal) cancelPatientModal.addEventListener('click', () => document.getElementById('patientModal').classList.remove('active'));
    const patientForm = document.getElementById('patientForm');
    if (patientForm) patientForm.addEventListener('submit', handlePatientSubmit);

    // View Patient
    document.querySelectorAll('.viewPatient').forEach(btn => {
        btn.addEventListener('click', () => {
            const patients = DB.get(KEYS.patients);
            const p = patients.find(x => x.id === btn.dataset.id);
            if (!p) return;
            const appointments = DB.get(KEYS.appointments).filter(a => a.patientId === p.id);
            const bills = DB.get(KEYS.bills).filter(b => b.patientId === p.id);
            document.getElementById('viewPatientContent').innerHTML = `
                <div class="profile-header mb-2">
                    <div class="profile-avatar">${p.name.charAt(0)}</div>
                    <div class="profile-details"><h2>${p.name}</h2><p>${p.gender}, ${p.age} years old</p></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                    <div><strong style="color:var(--text-secondary);font-size:0.75rem;">PHONE</strong><p>${p.phone}</p></div>
                    <div><strong style="color:var(--text-secondary);font-size:0.75rem;">BLOOD GROUP</strong><p><span class="badge badge-confirmed">${p.bloodGroup}</span></p></div>
                    <div><strong style="color:var(--text-secondary);font-size:0.75rem;">ADDRESS</strong><p>${p.address || '—'}</p></div>
                    <div><strong style="color:var(--text-secondary);font-size:0.75rem;">REGISTERED</strong><p>${p.date}</p></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div class="stat-card"><div class="stat-value">${appointments.length}</div><div class="stat-label">Appointments</div></div>
                    <div class="stat-card"><div class="stat-value">${bills.length}</div><div class="stat-label">Bills</div></div>
                </div>`;
            document.getElementById('viewPatientModal').classList.add('active');
        });
    });
    const closeViewPatientModal = document.getElementById('closeViewPatientModal');
    if (closeViewPatientModal) closeViewPatientModal.addEventListener('click', () => document.getElementById('viewPatientModal').classList.remove('active'));

    // Edit Patient
    document.querySelectorAll('.editPatient').forEach(btn => {
        btn.addEventListener('click', () => {
            const patients = DB.get(KEYS.patients);
            const p = patients.find(x => x.id === btn.dataset.id);
            if (!p) return;
            document.getElementById('editPatId').value = p.id;
            document.getElementById('editPatName').value = p.name;
            document.getElementById('editPatAge').value = p.age;
            document.getElementById('editPatGender').value = p.gender;
            document.getElementById('editPatPhone').value = p.phone;
            document.getElementById('editPatBlood').value = p.bloodGroup;
            document.getElementById('editPatAddress').value = p.address || '';
            document.getElementById('editPatientModal').classList.add('active');
        });
    });
    const closeEditPatientModal = document.getElementById('closeEditPatientModal');
    if (closeEditPatientModal) closeEditPatientModal.addEventListener('click', () => document.getElementById('editPatientModal').classList.remove('active'));
    const cancelEditPatientModal = document.getElementById('cancelEditPatientModal');
    if (cancelEditPatientModal) cancelEditPatientModal.addEventListener('click', () => document.getElementById('editPatientModal').classList.remove('active'));
    const editPatientForm = document.getElementById('editPatientForm');
    if (editPatientForm) editPatientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const patients = DB.get(KEYS.patients);
        const idx = patients.findIndex(p => p.id === document.getElementById('editPatId').value);
        if (idx === -1) return;
        patients[idx].name = document.getElementById('editPatName').value.trim();
        patients[idx].age = parseInt(document.getElementById('editPatAge').value);
        patients[idx].gender = document.getElementById('editPatGender').value;
        patients[idx].phone = document.getElementById('editPatPhone').value.trim();
        patients[idx].bloodGroup = document.getElementById('editPatBlood').value;
        patients[idx].address = document.getElementById('editPatAddress').value.trim();
        DB.set(KEYS.patients, patients);
        showToast('Patient updated successfully!', 'success');
        navigate('patients');
    });

    // Delete Patient (cascade: removes related appointments, prescriptions, bills)
    document.querySelectorAll('.deletePatient').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this patient and all related records (appointments, prescriptions, bills)?')) {
                const pid = btn.dataset.id;
                let patients = DB.get(KEYS.patients);
                patients = patients.filter(x => x.id !== pid);
                DB.set(KEYS.patients, patients);
                // Cascade: remove related appointments & their prescriptions
                let appts = DB.get(KEYS.appointments);
                const apptIds = appts.filter(a => a.patientId === pid).map(a => a.id);
                appts = appts.filter(a => a.patientId !== pid);
                DB.set(KEYS.appointments, appts);
                let rxs = DB.get(KEYS.prescriptions);
                rxs = rxs.filter(r => !apptIds.includes(r.appointmentId));
                DB.set(KEYS.prescriptions, rxs);
                // Cascade: remove related bills
                let bills = DB.get(KEYS.bills);
                bills = bills.filter(b => b.patientId !== pid);
                DB.set(KEYS.bills, bills);
                showToast('Patient and related records deleted', 'success');
                navigate('patients');
            }
        });
    });

    // Patient search
    const patSearch = document.getElementById('patientSearch');
    if (patSearch) {
        patSearch.addEventListener('input', () => {
            const q = patSearch.value.toLowerCase();
            const rows = document.querySelectorAll('#patientsTable tbody tr');
            rows.forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; });
        });
    }

    // Appointments
    const addApptBtn = document.getElementById('addApptBtn');
    if (addApptBtn) addApptBtn.addEventListener('click', () => document.getElementById('apptModal').classList.add('active'));
    const closeApptModal = document.getElementById('closeApptModal');
    if (closeApptModal) closeApptModal.addEventListener('click', () => document.getElementById('apptModal').classList.remove('active'));
    const cancelApptModal = document.getElementById('cancelApptModal');
    if (cancelApptModal) cancelApptModal.addEventListener('click', () => document.getElementById('apptModal').classList.remove('active'));
    const apptForm = document.getElementById('apptForm');
    if (apptForm) apptForm.addEventListener('submit', handleApptSubmit);

    document.querySelectorAll('.confirmAppt').forEach(btn => {
        btn.addEventListener('click', () => {
            let a = DB.get(KEYS.appointments);
            const idx = a.findIndex(x => x.id === btn.dataset.id);
            if (idx !== -1) { a[idx].status = 'confirmed'; DB.set(KEYS.appointments, a); showToast('Appointment confirmed', 'success'); navigate('appointments'); }
        });
    });
    document.querySelectorAll('.cancelAppt').forEach(btn => {
        btn.addEventListener('click', () => {
            let a = DB.get(KEYS.appointments);
            const idx = a.findIndex(x => x.id === btn.dataset.id);
            if (idx !== -1) { a[idx].status = 'cancelled'; DB.set(KEYS.appointments, a); showToast('Appointment cancelled', 'info'); navigate('appointments'); }
        });
    });

    // Delete Appointment (cascade: removes related prescriptions)
    document.querySelectorAll('.deleteAppt').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this appointment and any related prescriptions?')) {
                const aid = btn.dataset.id;
                let appts = DB.get(KEYS.appointments);
                appts = appts.filter(a => a.id !== aid);
                DB.set(KEYS.appointments, appts);
                let rxs = DB.get(KEYS.prescriptions);
                rxs = rxs.filter(r => r.appointmentId !== aid);
                DB.set(KEYS.prescriptions, rxs);
                showToast('Appointment deleted', 'success');
                navigate('appointments');
            }
        });
    });

    // Consultations
    document.querySelectorAll('.addRx').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('rxApptId').value = btn.dataset.apptId;
            document.getElementById('rxModal').classList.add('active');
        });
    });
    const closeRxModal = document.getElementById('closeRxModal');
    if (closeRxModal) closeRxModal.addEventListener('click', () => document.getElementById('rxModal').classList.remove('active'));
    const cancelRxModal = document.getElementById('cancelRxModal');
    if (cancelRxModal) cancelRxModal.addEventListener('click', () => document.getElementById('rxModal').classList.remove('active'));
    const rxForm = document.getElementById('rxForm');
    if (rxForm) rxForm.addEventListener('submit', handleRxSubmit);

    // Delete Prescription (reverts appointment to confirmed)
    document.querySelectorAll('.deleteRx').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this prescription?')) {
                const rxId = btn.dataset.id;
                const apptId = btn.dataset.apptId;
                let rxs = DB.get(KEYS.prescriptions);
                rxs = rxs.filter(r => r.id !== rxId);
                DB.set(KEYS.prescriptions, rxs);
                // Revert appointment status back to confirmed
                let appts = DB.get(KEYS.appointments);
                const idx = appts.findIndex(a => a.id === apptId);
                if (idx !== -1) { appts[idx].status = 'confirmed'; DB.set(KEYS.appointments, appts); }
                showToast('Prescription deleted', 'success');
                navigate('consultations');
            }
        });
    });

    // Billing
    const addBillBtn = document.getElementById('addBillBtn');
    if (addBillBtn) addBillBtn.addEventListener('click', () => document.getElementById('billModal').classList.add('active'));
    const closeBillModal = document.getElementById('closeBillModal');
    if (closeBillModal) closeBillModal.addEventListener('click', () => document.getElementById('billModal').classList.remove('active'));
    const cancelBillModal = document.getElementById('cancelBillModal');
    if (cancelBillModal) cancelBillModal.addEventListener('click', () => document.getElementById('billModal').classList.remove('active'));
    const addBillItem = document.getElementById('addBillItem');
    if (addBillItem) addBillItem.addEventListener('click', () => {
        const container = document.getElementById('billItems');
        const row = document.createElement('div');
        row.className = 'bill-item-row flex gap-1 mb-1';
        row.innerHTML = '<input type="text" class="form-control billItemDesc" placeholder="Description" required style="flex:2"><input type="number" class="form-control billItemAmt" placeholder="Amount" required min="0" style="flex:1"><button type="button" class="btn btn-outline btn-sm removeBillItem" style="flex-shrink:0">✕</button>';
        container.appendChild(row);
        row.querySelector('.removeBillItem').addEventListener('click', () => row.remove());
    });
    const billForm = document.getElementById('billForm');
    if (billForm) billForm.addEventListener('submit', handleBillSubmit);

    document.querySelectorAll('.viewBill').forEach(btn => {
        btn.addEventListener('click', () => {
            const bills = DB.get(KEYS.bills);
            const bill = bills.find(b => b.id === btn.dataset.id);
            if (!bill) return;
            const patients = DB.get(KEYS.patients);
            const pat = patients.find(p => p.id === bill.patientId);
            document.getElementById('billPreviewContent').innerHTML = `
                <div class="bill-preview">
                    <div class="bill-header"><h2>❤️‍🩹 LifeCare Hospital</h2><p>Invoice #${bill.id.slice(-6).toUpperCase()} | Date: ${bill.date}</p></div>
                    <p style="margin-bottom:16px;"><strong>Patient:</strong> ${pat ? pat.name : 'N/A'}</p>
                    <table><thead><tr><th>#</th><th>Description</th><th>Amount</th></tr></thead>
                    <tbody>${bill.items.map((item, i) => `<tr><td>${i+1}</td><td>${item.desc}</td><td>₹${item.amount.toLocaleString()}</td></tr>`).join('')}</tbody></table>
                    <div class="bill-total">Total: ₹${bill.total.toLocaleString()}</div>
                </div>`;
            document.getElementById('viewBillModal').classList.add('active');
        });
    });
    const closeViewBillModal = document.getElementById('closeViewBillModal');
    if (closeViewBillModal) closeViewBillModal.addEventListener('click', () => document.getElementById('viewBillModal').classList.remove('active'));

    // Delete Bill
    document.querySelectorAll('.deleteBill').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this bill/invoice?')) {
                let bills = DB.get(KEYS.bills);
                bills = bills.filter(b => b.id !== btn.dataset.id);
                DB.set(KEYS.bills, bills);
                showToast('Bill deleted', 'success');
                navigate('billing');
            }
        });
    });
    // Print Bill
    const printBillBtn = document.getElementById('printBillBtn');
    if (printBillBtn) printBillBtn.addEventListener('click', () => {
        const content = document.getElementById('billPreviewContent').innerHTML;
        const win = window.open('', '_blank', 'width=700,height=500');
        win.document.write(`<html><head><title>Invoice - LifeCare Hospital</title><style>
            body{font-family:'Inter',sans-serif;padding:40px;color:#1a1a1a}
            h2{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin:16px 0}
            th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e0e0e0;font-size:14px}
            th{background:#f5f5f5;font-weight:600}.bill-header{text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:16px;margin-bottom:24px}
            .bill-total{text-align:right;font-size:18px;font-weight:700;padding-top:16px;border-top:2px solid #1a1a1a}
        </style></head><body>${content}</body></html>`);
        win.document.close();
        win.print();
    });

    // Profile
    const saveProfile = document.getElementById('saveProfile');
    if (saveProfile) saveProfile.addEventListener('click', handleProfileSave);

    // Change Password
    const changePasswordBtn = document.getElementById('changePassword');
    if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => {
        const currPass = document.getElementById('profileCurrPass').value;
        const newPass = document.getElementById('profileNewPass').value;
        const confPass = document.getElementById('profileConfPass').value;
        if (!currPass || !newPass || !confPass) { showToast('Please fill all password fields', 'error'); return; }
        const user = Session.getUser();
        if (currPass !== user.password) { showToast('Current password is incorrect', 'error'); return; }
        if (newPass.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
        if (newPass !== confPass) { showToast('New passwords do not match', 'error'); return; }
        const users = DB.get(KEYS.users);
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx].password = newPass;
            DB.set(KEYS.users, users);
            document.getElementById('profileCurrPass').value = '';
            document.getElementById('profileNewPass').value = '';
            document.getElementById('profileConfPass').value = '';
            showToast('Password changed successfully!', 'success');
        }
    });
}

// ==================== FORM HANDLERS ====================
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = DB.get(KEYS.users);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { showToast('Invalid email or password', 'error'); return; }
    Session.set(user);
    currentPage = 'dashboard';
    showToast(`Welcome back, ${user.name}!`, 'success');
    render();
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;
    const spec = document.getElementById('signupSpec') ? document.getElementById('signupSpec').value.trim() : '';
    if (!name || !email || !password || !role) { showToast('Please fill all fields', 'error'); return; }
    const users = DB.get(KEYS.users);
    if (users.find(u => u.email === email)) { showToast('Email already registered', 'error'); return; }
    const newUser = { id: DB.genId(), name, email, password, role };
    if (role === 'doctor' && spec) newUser.specialization = spec;
    users.push(newUser);
    DB.set(KEYS.users, users);
    Session.set(newUser);
    currentPage = 'dashboard';
    showToast(`Account created! Welcome, ${name}!`, 'success');
    render();
}

function handlePatientSubmit(e) {
    e.preventDefault();
    const user = Session.getUser();
    const patient = {
        id: DB.genId(),
        name: document.getElementById('patName').value.trim(),
        age: parseInt(document.getElementById('patAge').value),
        gender: document.getElementById('patGender').value,
        phone: document.getElementById('patPhone').value.trim(),
        bloodGroup: document.getElementById('patBlood').value,
        address: document.getElementById('patAddress').value.trim(),
        registeredBy: user.id,
        date: new Date().toISOString().slice(0, 10)
    };
    const patients = DB.get(KEYS.patients);
    patients.push(patient);
    DB.set(KEYS.patients, patients);
    showToast('Patient registered successfully!', 'success');
    navigate('patients');
}

function handleApptSubmit(e) {
    e.preventDefault();
    const appt = {
        id: DB.genId(),
        patientId: document.getElementById('apptPatient').value,
        doctorId: document.getElementById('apptDoctor').value,
        date: document.getElementById('apptDate').value,
        time: document.getElementById('apptTime').value,
        status: 'pending',
        notes: document.getElementById('apptNotes').value.trim()
    };
    const appts = DB.get(KEYS.appointments);
    appts.push(appt);
    DB.set(KEYS.appointments, appts);
    showToast('Appointment booked!', 'success');
    navigate('appointments');
}

function handleRxSubmit(e) {
    e.preventDefault();
    const rx = {
        id: DB.genId(),
        appointmentId: document.getElementById('rxApptId').value,
        diagnosis: document.getElementById('rxDiagnosis').value.trim(),
        medicines: document.getElementById('rxMedicines').value.trim(),
        notes: document.getElementById('rxNotes').value.trim(),
        date: new Date().toISOString().slice(0, 10)
    };
    const prescriptions = DB.get(KEYS.prescriptions);
    prescriptions.push(rx);
    DB.set(KEYS.prescriptions, prescriptions);
    // Mark appointment as completed
    let appts = DB.get(KEYS.appointments);
    const idx = appts.findIndex(a => a.id === rx.appointmentId);
    if (idx !== -1) { appts[idx].status = 'completed'; DB.set(KEYS.appointments, appts); }
    showToast('Prescription saved & appointment completed!', 'success');
    navigate('consultations');
}

function handleBillSubmit(e) {
    e.preventDefault();
    const descs = document.querySelectorAll('.billItemDesc');
    const amts = document.querySelectorAll('.billItemAmt');
    const items = [];
    let total = 0;
    descs.forEach((d, i) => {
        const amount = parseFloat(amts[i].value) || 0;
        items.push({ desc: d.value.trim(), amount });
        total += amount;
    });
    const bill = {
        id: DB.genId(),
        patientId: document.getElementById('billPatient').value,
        items,
        total,
        date: new Date().toISOString().slice(0, 10),
        generatedBy: Session.getUser().id
    };
    const bills = DB.get(KEYS.bills);
    bills.push(bill);
    DB.set(KEYS.bills, bills);
    showToast(`Bill generated! Total: ₹${total.toLocaleString()}`, 'success');
    navigate('billing');
}

function handleProfileSave() {
    const user = Session.getUser();
    const users = DB.get(KEYS.users);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    users[idx].name = document.getElementById('profileName').value.trim();
    const specEl = document.getElementById('profileSpec');
    if (specEl) users[idx].specialization = specEl.value.trim();
    DB.set(KEYS.users, users);
    showToast('Profile updated!', 'success');
    navigate('profile');
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    seedData();
    const session = Session.get();
    if (session) currentPage = 'dashboard';
    else currentPage = 'login';
    render();
});

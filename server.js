/* ============================================
   LifeCare Hospital — Express + MySQL Server
   ============================================ */
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==================== MySQL Connection Pool ====================
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@nooP15062006',
    database: 'lifecare_hospital',
    waitForConnections: true,
    connectionLimit: 10
});

// Helper: generate short unique ID
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ==================== AUTH ROUTES ====================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
        const user = rows[0];
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role, specialization: user.specialization });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password, role, specialization } = req.body;
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email already registered' });
        const id = genId();
        await pool.query('INSERT INTO users (id, name, email, password, role, specialization) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, email, password, role, specialization || null]);
        res.json({ id, name, email, role, specialization: specialization || null });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== USERS ROUTES ====================
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, specialization FROM users');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, specialization } = req.body;
        await pool.query('UPDATE users SET name = ?, specialization = ? WHERE id = ?', [name, specialization || null, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        if (rows[0].password !== currentPassword) return res.status(403).json({ error: 'Current password is incorrect' });
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== PATIENTS ROUTES ====================
app.get('/api/patients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM patients ORDER BY date DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/patients', async (req, res) => {
    try {
        const { name, age, gender, phone, blood_group, address, registered_by } = req.body;
        const id = genId();
        const date = new Date().toISOString().slice(0, 10);
        await pool.query('INSERT INTO patients (id, name, age, gender, phone, blood_group, address, registered_by, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, age, gender, phone, blood_group, address || '', registered_by, date]);
        res.json({ id, name, age, gender, phone, blood_group, address, registered_by, date });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/patients/:id', async (req, res) => {
    try {
        const { name, age, gender, phone, blood_group, address } = req.body;
        await pool.query('UPDATE patients SET name=?, age=?, gender=?, phone=?, blood_group=?, address=? WHERE id=?',
            [name, age, gender, phone, blood_group, address || '', req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/patients/:id', async (req, res) => {
    try {
        // CASCADE handles appointments, prescriptions, bills automatically
        await pool.query('DELETE FROM patients WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== APPOINTMENTS ROUTES ====================
app.get('/api/appointments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM appointments ORDER BY date DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { patient_id, doctor_id, date, time, notes } = req.body;
        const id = genId();
        await pool.query('INSERT INTO appointments (id, patient_id, doctor_id, date, time, status, notes) VALUES (?, ?, ?, ?, ?, "pending", ?)',
            [id, patient_id, doctor_id, date, time, notes || null]);
        res.json({ id, patient_id, doctor_id, date, time, status: 'pending', notes });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== PRESCRIPTIONS ROUTES ====================
app.get('/api/prescriptions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM prescriptions');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/prescriptions', async (req, res) => {
    try {
        const { appointment_id, diagnosis, medicines, notes } = req.body;
        const id = genId();
        const date = new Date().toISOString().slice(0, 10);
        await pool.query('INSERT INTO prescriptions (id, appointment_id, diagnosis, medicines, notes, date) VALUES (?, ?, ?, ?, ?, ?)',
            [id, appointment_id, diagnosis, medicines, notes || null, date]);
        // Mark appointment as completed
        await pool.query('UPDATE appointments SET status = "completed" WHERE id = ?', [appointment_id]);
        res.json({ id, appointment_id, diagnosis, medicines, notes, date });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/prescriptions/:id', async (req, res) => {
    try {
        // Get appointment_id before deleting so we can revert status
        const [rx] = await pool.query('SELECT appointment_id FROM prescriptions WHERE id = ?', [req.params.id]);
        await pool.query('DELETE FROM prescriptions WHERE id = ?', [req.params.id]);
        if (rx.length > 0) {
            await pool.query('UPDATE appointments SET status = "confirmed" WHERE id = ?', [rx[0].appointment_id]);
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== BILLS ROUTES ====================
app.get('/api/bills', async (req, res) => {
    try {
        const [bills] = await pool.query('SELECT * FROM bills ORDER BY date DESC');
        // Fetch items for each bill
        for (let bill of bills) {
            const [items] = await pool.query('SELECT description as `desc`, amount FROM bill_items WHERE bill_id = ?', [bill.id]);
            bill.items = items;
        }
        res.json(bills);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bills', async (req, res) => {
    try {
        const { patient_id, items, total, generated_by } = req.body;
        const id = genId();
        const date = new Date().toISOString().slice(0, 10);
        await pool.query('INSERT INTO bills (id, patient_id, total, date, generated_by) VALUES (?, ?, ?, ?, ?)',
            [id, patient_id, total, date, generated_by]);
        for (const item of items) {
            await pool.query('INSERT INTO bill_items (bill_id, description, amount) VALUES (?, ?, ?)',
                [id, item.desc, item.amount]);
        }
        res.json({ id, patient_id, items, total, date, generated_by });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bills/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM bills WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== STATS ROUTE ====================
app.get('/api/stats', async (req, res) => {
    try {
        const [[{ patientCount }]] = await pool.query('SELECT COUNT(*) as patientCount FROM patients');
        const [[{ apptCount }]] = await pool.query('SELECT COUNT(*) as apptCount FROM appointments');
        const [[{ rxCount }]] = await pool.query('SELECT COUNT(*) as rxCount FROM prescriptions');
        const [[{ totalRevenue }]] = await pool.query('SELECT COALESCE(SUM(total), 0) as totalRevenue FROM bills');
        const [[{ pendingCount }]] = await pool.query("SELECT COUNT(*) as pendingCount FROM appointments WHERE status='pending'");
        const [[{ confirmedCount }]] = await pool.query("SELECT COUNT(*) as confirmedCount FROM appointments WHERE status='confirmed'");
        const [[{ completedCount }]] = await pool.query("SELECT COUNT(*) as completedCount FROM appointments WHERE status='completed'");
        const [[{ cancelledCount }]] = await pool.query("SELECT COUNT(*) as cancelledCount FROM appointments WHERE status='cancelled'");
        res.json({ patientCount, apptCount, rxCount, totalRevenue, pendingCount, confirmedCount, completedCount, cancelledCount });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== SERVE SPA ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
    console.log(`\n  ❤️‍🩹 LifeCare Hospital Server running at http://localhost:${PORT}\n`);
});

const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const db = require('./database');
const daemon = require('./lib/daemon');
const fm = require('./lib/fm');
const backups = require('./lib/backups');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

require('./lib/terminal')(io);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
    res.locals.siteName = config.siteName;
    res.locals.siteUrl = config.siteUrl;
    res.locals.displayTitle = config.displayTitle;
    res.locals.user = { id: 1, username: 'Admin', role: 'admin', email: 'admin@yotsu.com' }; 
    next();
});

const isAdmin = (req, res, next) => {
    if (res.locals.user && res.locals.user.role === 'admin') next();
    else res.status(403).render('errors/403');
};

app.get('/', (req, res) => res.render('login'));

app.get('/dash', async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE owner_id = $1', [res.locals.user.id]);
    res.render('dashboard', { servers: result.rows });
});

app.get('/admin', isAdmin, (req, res) => res.render('admin/index'));

app.get('/admin/nodes', isAdmin, async (req, res) => {
    const result = await db.query('SELECT * FROM nodes');
    res.render('admin/locations', { nodes: result.rows });
});

app.get('/server/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).render('errors/404');
        res.render('server/index', { server: result.rows[0] });
    } catch (err) {
        res.status(500).send("Error en la DB");
    }
});

app.get('/server/:id/files', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
        const serverData = result.rows[0];
        const files = await fm.getFiles(serverData.identifier);
        res.render('server/files', { server: serverData, files });
    } catch (err) {
        const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
        res.render('server/files', { server: result.rows[0], files: [] });
    }
});

app.get('/server/:id/startup', async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/startup', { server: result.rows[0] });
});

app.get('/server/:id/backups', async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/backups', { server: result.rows[0] });
});

app.get('/server/:id/settings', async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/settings', { server: result.rows[0] });
});

app.get('/profile', (req, res) => res.render('profile'));
app.get('/notifications', (req, res) => res.render('notifications'));
app.get('/logout', (req, res) => res.render('logout'));

app.post('/api/server/:id/power', async (req, res) => {
    const { action } = req.body;
    const result = await db.query('SELECT identifier FROM servers WHERE id = $1', [req.params.id]);
    const serverData = result.rows[0];
    try {
        if (action === 'start') await daemon.startServer(serverData.identifier);
        if (action === 'stop') await daemon.stopServer(serverData.identifier);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/server/:id/backup', async (req, res) => {
    const result = await db.query('SELECT identifier FROM servers WHERE id = $1', [req.params.id]);
    try {
        await backups.createBackup(result.rows[0].identifier);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `[YotsuDactyl] Operativo en puerto ${PORT}`);
});
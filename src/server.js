const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const session = require('express-session');
const db = require('./database');
const daemon = require('./lib/daemon');
const fm = require('./lib/fm');
const auth = require('./lib/auth');
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

app.use(session({
    secret: 'yotsudactyl_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(async (req, res, next) => {
    res.locals.siteName = config.siteName;
    res.locals.siteUrl = config.siteUrl;
    res.locals.displayTitle = config.displayTitle;
    next();
});

app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dash');
    res.render('login');
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length > 0) {
            req.session.userId = result.rows[0].id;
            res.redirect('/dash');
        } else {
            res.redirect('/?error=invalid');
        }
    } catch (err) {
        res.redirect('/?error=db');
    }
});

app.get('/dash', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE owner_id = $1', [res.locals.user.id]);
    res.render('dashboard', { servers: result.rows });
});

app.get('/server/:id', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.redirect('/dash');
    res.render('server/index', { server: result.rows[0] });
});

app.get('/server/:id/files', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    const serverData = result.rows[0];
    try {
        const files = await fm.getFiles(serverData.identifier);
        res.render('server/files', { server: serverData, files });
    } catch (err) {
        res.render('server/files', { server: serverData, files: [] });
    }
});

app.get('/server/:id/startup', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/startup', { server: result.rows[0] });
});

app.get('/server/:id/backups', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/backups', { server: result.rows[0] });
});

app.get('/server/:id/settings', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/settings', { server: result.rows[0] });
});

app.get('/profile', auth, (req, res) => res.render('profile'));
app.get('/notifications', auth, (req, res) => res.render('notifications'));

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.render('logout');
});

app.post('/api/server/:id/power', auth, async (req, res) => {
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `[YotsuDactyl] SISTEMA COMPLETO Y SEGURO`);
    console.log(`\x1b[33m%s\x1b[0m`, `Corriendo en: ${config.siteUrl}`);
});
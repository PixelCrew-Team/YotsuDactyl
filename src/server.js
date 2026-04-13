const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('./database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const generateServerId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

app.use(async (req, res, next) => {
    res.locals.siteName = config.siteName;
    res.locals.siteUrl = config.siteUrl;
    res.locals.displayTitle = config.displayTitle;
    res.locals.user = { id: 1, username: 'Admin', role: 'admin', email: 'admin@yotsu.com' }; 
    next();
});

const isAdmin = (req, res, next) => {
    if (res.locals.user && res.locals.user.role === 'admin') {
        next();
    } else {
        res.status(403).render('errors/403');
    }
};

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/dash', (req, res) => {
    res.render('dashboard', { servers: [] });
});

app.get('/admin', isAdmin, (req, res) => {
    res.render('admin/index');
});

app.get('/admin/servers', isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM servers ORDER BY created_at DESC');
        res.render('admin/servers', { servers: result.rows });
    } catch (err) {
        res.render('admin/servers', { servers: [] });
    }
});

app.post('/admin/servers/create', isAdmin, async (req, res) => {
    const { name, owner, node, ram, disk, cpu, egg } = req.body;
    const serverId = generateServerId();
    res.redirect('/admin/servers');
});

app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT username, email, role FROM users');
        res.render('admin/users', { users: result.rows });
    } catch (err) {
        res.render('admin/users', { users: [] });
    }
});

app.get('/admin/nodes', isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM nodes');
        res.render('admin/locations', { nodes: result.rows });
    } catch (err) {
        res.render('admin/locations', { nodes: [] });
    }
});

app.get('/admin/eggs', isAdmin, (req, res) => {
    res.render('admin/eggs');
});

app.use((req, res) => {
    res.status(404).render('errors/404');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`${config.siteName} OPERATIVO EN PUERTO ${PORT}`);
});
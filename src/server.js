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

// Generador de ID de 8 caracteres (Letras y Números)
const generateId = () => Math.random().toString(36).substring(2, 10).toUpperCase();

app.use((req, res, next) => {
    res.locals.siteName = config.siteName;
    res.locals.siteUrl = config.siteUrl;
    res.locals.displayTitle = config.displayTitle;
    res.locals.user = { username: 'Admin', role: 'admin' }; // Temporal
    next();
});

const isAdmin = (req, res, next) => {
    if (res.locals.user && res.locals.user.role === 'admin') next();
    else res.status(403).render('403');
};

app.get('/', (req, res) => res.render('login'));

app.get('/dash', (req, res) => res.render('dashboard', { servers: [] }));

app.get('/admin', isAdmin, (req, res) => res.render('admin/index'));

app.get('/admin/servers', isAdmin, async (req, res) => {
    // Aquí luego jalaremos de la DB real
    res.render('admin/servers', { servers: [] });
});

app.post('/admin/servers/create', isAdmin, async (req, res) => {
    const { name, owner, node, ram, disk, cpu, egg } = req.body;
    const serverId = generateId();
    // Lógica para guardar en DB y crear carpetas vendrá después
    console.log(`Creando servidor ${serverId} para ${owner}`);
    res.redirect('/admin/servers');
});

app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`${config.siteName} en puerto ${PORT}`));
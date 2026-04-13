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

const isAdmin = (req, res, next) => {
    if (res.locals.user && res.locals.user.role === 'admin') next();
    else res.status(403).render('403');
};

app.use((req, res, next) => {
    res.locals.siteName = config.siteName;
    res.locals.siteUrl = config.siteUrl;
    res.locals.displayTitle = config.displayTitle;
    res.locals.user = { username: 'Admin', role: 'admin' };
    next();
});

app.get('/', (req, res) => res.render('login'));
app.get('/dash', (req, res) => res.render('dashboard', { servers: [] }));

// RUTAS ADMIN
app.get('/admin', isAdmin, (req, res) => res.render('admin/index'));
app.get('/admin/servers', isAdmin, (req, res) => res.render('admin/servers', { servers: [] }));
app.get('/admin/users', isAdmin, (req, res) => res.render('admin/users'));
app.get('/admin/nodes', isAdmin, (req, res) => res.render('admin/locations'));
app.get('/admin/eggs', isAdmin, (req, res) => res.render('admin/eggs'));

app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`${config.siteName} operativo.`));
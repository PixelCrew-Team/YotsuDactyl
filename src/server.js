const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database');
const auth = require('./lib/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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
    if (req.session.userId) {
        try {
            const result = await db.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
            res.locals.user = result.rows[0];
        } catch (err) {
            console.error("Error cargando usuario:", err);
        }
    }
    next();
});

app.get('/', (req, res) => {
    if (req.session.userId) return res.redirect('/dash');
    res.render('login', { error: null });
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.userId = user.id;
                return res.redirect('/dash');
            }
        }
        res.render('login', { error: "Credenciales incorrectas" });
    } catch (err) {
        res.render('login', { error: "Error de conexión" });
    }
});

app.get('/dash', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE owner_id = $1', [res.locals.user.id]);
    res.render('dashboard', { servers: result.rows });
});

app.get('/perfil', auth, (req, res) => {
    res.render('perfil');
});

app.get('/ajustes', auth, (req, res) => {
    res.render('ajustes');
});

app.get('/server/:id', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.redirect('/dash');
    res.render('server/index', { server: result.rows[0] });
});

app.get('/server/:id/files', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/files', { server: result.rows[0] });
});

app.get('/server/:id/console', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/console', { server: result.rows[0] });
});

app.get('/server/:id/settings', auth, async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/settings', { server: result.rows[0] });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[YotsuDactyl] SISTEMA ONLINE EN PUERTO ${PORT}`);
});
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database');
const daemon = require('./lib/daemon');
const fm = require('./lib/fm');
const auth = require('./lib/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

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
    const error = req.session.errorMessage;
    delete req.session.errorMessage;
    res.render('login', { error });
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
        req.session.errorMessage = "Credenciales incorrectas";
        res.redirect('/');
    } catch (err) {
        req.session.errorMessage = "Error de conexión";
        res.redirect('/');
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

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[YotsuDactyl] SISTEMA ONLINE`);
});
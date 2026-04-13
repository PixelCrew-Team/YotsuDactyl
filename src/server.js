const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const socketIo = require('socket.io');
const db = require('./database');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

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
        
        const serverData = result.rows[0];
        res.render('server/index', { server: serverData });
    } catch (err) {
        res.status(500).send("Error interno");
    }
});

app.get('/server/:id/files', async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    const serverData = result.rows[0];
    
    const files = []; 
    res.render('server/files', { server: serverData, files });
});

app.get('/server/:id/startup', async (req, res) => {
    const result = await db.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    res.render('server/startup', { server: result.rows[0] });
});

io.on('connection', (socket) => {
    socket.on('server:join', (serverId) => {
        socket.join(`server_${serverId}`);
        console.log(`Cliente conectado al servidor: ${serverId}`);
    });

    socket.on('server:command', async (data) => {
        const { serverId, command } = data;
        io.to(`server_${serverId}`).emit('server:console', `\r\nusuario@yotsudactyl:~$ ${command}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`${config.siteName} OPERATIVO EN PUERTO ${PORT}`);
});
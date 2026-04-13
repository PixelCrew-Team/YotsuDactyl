const readline = require('readline');
const bcrypt = require('bcrypt');
const db = require('./database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[1;36m╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\x1b[0m');
console.log('\x1b[1;36m┃      CREAR ADMINISTRADOR INICIAL     ┃\x1b[0m');
console.log('\x1b[1;36m╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\x1b[0m');

rl.question('\x1b[1;34m┃\x1b[0m Nombre de usuario: ', (username) => {
    rl.question('\x1b[1;34m┃\x1b[0m Email: ', (email) => {
        rl.question('\x1b[1;34m┃\x1b[0m Contraseña: ', async (password) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query(
                    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
                    [username, email, hashedPassword, 'admin']
                );
                console.log('\x1b[1;32m\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\x1b[0m');
                console.log('\x1b[1;32m┃  Administrador creado con éxito.     ┃\x1b[0m');
                console.log('\x1b[1;32m╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\x1b[0m');
                process.exit(0);
            } catch (err) {
                console.error('\x1b[1;31m\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\x1b[0m');
                console.error(`\x1b[1;31m┃ Error: ${err.message} \x1b[0m`);
                console.error('\x1b[1;31m╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\x1b[0m');
                process.exit(1);
            }
        });
    });
});
const readline = require('readline');
const bcrypt = require('bcrypt');
const db = require('./database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n--- CREAR ADMINISTRADOR INICIAL ---');

rl.question('Nombre de usuario: ', (username) => {
    rl.question('Email: ', (email) => {
        rl.question('Contraseña: ', async (password) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await db.query(
                    'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
                    [username, email, hashedPassword, 'admin']
                );
                console.log('\n[!] Administrador creado con éxito.');
                process.exit(0);
            } catch (err) {
                console.error('\n[X] Error al crear usuario:', err.message);
                process.exit(1);
            }
        });
    });
});
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

module.exports = function(io) {
    io.on('connection', (socket) => {
        socket.on('server:join', async (serverId) => {
            socket.join(`server_${serverId}`);
            const container = docker.getContainer(`yotsu-${serverId}`);
            
            try {
                const stream = await container.attach({
                    stream: true, stdout: true, stderr: true, stdin: true
                });

                stream.on('data', (chunk) => {
                    io.to(`server_${serverId}`).emit('server:console', chunk.toString());
                });

                socket.on('server:command', (cmd) => {
                    stream.write(cmd + '\n');
                });
            } catch (err) {
                socket.emit('server:console', 'Error al conectar con la consola del contenedor.');
            }
        });
    });
};

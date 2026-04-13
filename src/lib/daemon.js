const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const createServerContainer = async (server) => {
    const container = await docker.createContainer({
        Image: 'node:20-slim',
        name: `yotsu-${server.identifier}`,
        WorkingDir: '/home/container',
        Cmd: server.startup_command.split(' '),
        HostConfig: {
            Memory: server.ram * 1024 * 1024,
            CpuQuota: server.cpu * 1000,
            Binds: [`/var/lib/yotsudactyl/volumes/${server.identifier}:/home/container`],
            RestartPolicy: { Name: 'on-failure', MaximumRetryCount: 5 }
        },
        ExposedPorts: { '3000/tcp': {} }
    });
    return container;
};

const startServer = async (identifier) => {
    const container = docker.getContainer(`yotsu-${identifier}`);
    await container.start();
};

const stopServer = async (identifier) => {
    const container = docker.getContainer(`yotsu-${identifier}`);
    await container.stop();
};

const getStats = async (identifier) => {
    const container = docker.getContainer(`yotsu-${identifier}`);
    const stats = await container.stats({ stream: false });
    return stats;
};

module.exports = { createServerContainer, startServer, stopServer, getStats };
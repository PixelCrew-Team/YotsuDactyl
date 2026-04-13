const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const createServerContainer = async (serverData, eggData) => {
    const container = await docker.createContainer({
        Image: eggData.docker_image,
        name: `yotsu-${serverData.identifier}`,
        Cmd: serverData.startup_command.split(' '),
        HostConfig: {
            Memory: serverData.ram * 1024 * 1024,
            CpuQuota: serverData.cpu * 1000,
            Binds: [`/var/lib/yotsudactyl/volumes/${serverData.identifier}:/home/container`]
        }
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

module.exports = { createServerContainer, startServer, stopServer };
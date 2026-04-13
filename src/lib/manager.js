const fs = require('fs-extra');
const path = require('path');
const { createServerContainer } = require('./daemon');

const deployServer = async (server) => {
    const serverPath = path.join('/var/lib/yotsudactyl/volumes', server.identifier);

    await fs.ensureDir(serverPath);

    await fs.writeFile(path.join(serverPath, 'yotsu.txt'), `Servidor ${server.name} creado correctamente.`);

    await createServerContainer(server);

    return true;
};

module.exports = { deployServer };
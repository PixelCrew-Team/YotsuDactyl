const tar = require('tar');
const fs = require('fs-extra');
const path = require('path');

const createBackup = async (identifier) => {
    const serverPath = path.join('/var/lib/yotsudactyl/volumes', identifier);
    const backupPath = path.join('/var/lib/yotsudactyl/backups', `${identifier}-${Date.now()}.tar.gz`);

    await fs.ensureDir('/var/lib/yotsudactyl/backups');

    await tar.c(
        {
            gzip: true,
            file: backupPath,
            cwd: serverPath
        },
        ['.']
    );

    return backupPath;
};

module.exports = { createBackup };
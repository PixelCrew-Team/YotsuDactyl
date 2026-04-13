const fs = require('fs-extra');
const path = require('path');

const getFiles = async (identifier, folderPath = '') => {
    const rootPath = path.join('/var/lib/yotsudactyl/volumes', identifier, folderPath);
    const items = await fs.readdir(rootPath, { withFileTypes: true });
    
    return items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        size: item.isDirectory() ? '--' : (fs.statSync(path.join(rootPath, item.name)).size / 1024).toFixed(2) + ' KB'
    }));
};

const deleteFile = async (identifier, fileName) => {
    const filePath = path.join('/var/lib/yotsudactyl/volumes', identifier, fileName);
    await fs.remove(filePath);
};

module.exports = { getFiles, deleteFile };

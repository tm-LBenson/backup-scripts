require('dotenv').config();
const SFTPClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs-extra');

const sftp = new SFTPClient();

const piDetails = {
  host: process.env.PI_HOST,
  username: process.env.PI_USERNAME,
  password: process.env.PI_PASSWORD,
  backupDir: process.env.PI_BACKUP_DIR,
};

//* Local WoW directories
const wowPaths = {
  keybindings:
    'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\WTF\\Account\\TIGYS\\bindings-cache.wtf',
  addons:
    'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\Interface\\AddOns',
  configs:
    'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\WTF\\Account\\TIGYS\\SavedVariables',
};

async function downloadFiles() {
  try {
    //* Connect to Raspberry Pi
    await sftp.connect({
      host: piDetails.host,
      username: piDetails.username,
      password: piDetails.password,
    });

    //* Ensure local directories exist
    fs.ensureDirSync(path.dirname(wowPaths.keybindings));
    fs.ensureDirSync(wowPaths.addons);
    fs.ensureDirSync(wowPaths.configs);

    //* Download keybindings
    await sftp.fastGet(
      `${piDetails.backupDir}/keybindings/bindings-cache.wtf`,
      wowPaths.keybindings,
    );
    console.log('Keybindings downloaded successfully.');

    //* Download addons
    await sftp.downloadDir(`${piDetails.backupDir}/addons`, wowPaths.addons);
    console.log('Addons downloaded successfully.');

    //* Download addon configs
    await sftp.downloadDir(`${piDetails.backupDir}/configs`, wowPaths.configs);
    console.log('Configs downloaded successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    sftp.end();
  }
}

downloadFiles();

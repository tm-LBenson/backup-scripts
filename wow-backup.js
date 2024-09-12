'use strict';
require('dotenv').config();
const { NodeSSH } = require('node-ssh');
const SFTPClient = require('ssh2-sftp-client');

const ssh = new NodeSSH();
const sftp = new SFTPClient();

//* Local WoW directories
const wowPaths = {
  keybindings:
    'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\WTF\\Account\\TIGYS\\bindings-cache.wtf',
  addons:
    'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\Interface\\AddOns',
  configs:
    'C:\\Program Files (x86)\\World of Warcraft\\_retail_\\WTF\\Account\\TIGYS\\SavedVariables',
};

const piDetails = {
  host: process.env.PI_HOST,
  username: process.env.PI_USERNAME,
  password: process.env.PI_PASSWORD,
  backupDir: process.env.PI_BACKUP_DIR,
};

async function backupFiles() {
  try {
    //* Connect to Raspberry Pi
    await ssh.connect({
      host: piDetails.host,
      username: piDetails.username,
      password: piDetails.password,
    });

    await sftp.connect({
      host: piDetails.host,
      username: piDetails.username,
      password: piDetails.password,
    });

    //* Create backup directories on Raspberry Pi if they don't exist
    await ssh.execCommand(
      `mkdir -p ${piDetails.backupDir}/{keybindings,addons,configs}`,
    );

    //* Transfer keybindings
    await sftp.fastPut(
      wowPaths.keybindings,
      `${piDetails.backupDir}/keybindings/bindings-cache.wtf`,
    );
    console.log('Keybindings transferred successfully.');

    //* Transfer addons
    await sftp.uploadDir(wowPaths.addons, `${piDetails.backupDir}/addons`);
    console.log('Addons transferred successfully.');

    //* Transfer addon configs
    await sftp.uploadDir(wowPaths.configs, `${piDetails.backupDir}/configs`);
    console.log('Configs transferred successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    sftp.end();
    ssh.dispose();
  }
}

backupFiles();

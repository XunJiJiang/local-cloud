const fs = require('fs');
const path = require('path');
const FOLDERS_JSON = path.join(__dirname, '../../json/folders.json');

function getAllowedFolders() {
  try {
    const data = fs.readFileSync(FOLDERS_JSON, 'utf-8');
    const json = JSON.parse(data);
    if (json && json.path && typeof json.path === 'object') {
      return json.path;
    }
    return {};
  } catch (e) {
    return {};
  }
}

function getExcludeFolders() {
  try {
    const data = fs.readFileSync(FOLDERS_JSON, 'utf-8');
    const json = JSON.parse(data);
    if (json && json.exclude && Array.isArray(json.exclude)) {
      return json.exclude;
    }
    return [];
  } catch (e) {
    return [];
  }
}

module.exports = {
  getAllowedFolders,
  getExcludeFolders,
};

// 文件夹页面渲染所需数据接口
// 返回指定目录下的文件夹/文件列表、根目录状态、面包屑等结构化数据
const fs = require('fs');
const path = require('path');
const { getAllowedFolders, getExcludeFolders } = require('../utils/readConfig.js');
const FOLDERS_JSON = path.join(__dirname, '../../json/folders.json');

/**
 * 获取文件夹页面渲染所需数据
 * @param {string} urlPath 形如 /别名/子路径
 * @returns {object}
 */
function getDirectoryData(urlPath) {
  const aliasToPath = getAllowedFolders();
  const aliasList = Object.keys(aliasToPath);
  const exclude = getExcludeFolders();
  let result = {
    urlPath,
    rootFoldersStatus: {},
    files: [],
    rootAlias: null,
    dirPath: '',
    exclude,
    breadcrumb: [],
  };
  if (urlPath === '/') {
    // 根目录，返回所有别名及其可用性
    for (const alias of aliasList) {
      const folderPath = aliasToPath[alias];
      result.rootFoldersStatus[alias] = fs.existsSync(folderPath);
    }
    result.dirPath = '';
    result.files = [];
    result.breadcrumb = [{ name: 'root', url: '/' }];
    return result;
  }
  // 匹配别名
  let rootAlias = aliasList.find(a => urlPath === '/' + a || urlPath.startsWith('/' + a + '/'));
  if (!rootAlias) return null;
  result.rootAlias = rootAlias;
  const relPath = urlPath.replace('/' + rootAlias, '').replace(/^\//, '');
  const dirPath = relPath ? path.join(aliasToPath[rootAlias], relPath) : aliasToPath[rootAlias];
  result.dirPath = dirPath;
  // 读取文件夹内容
  let files = [];
  try {
    files = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter(f => !exclude.includes(f.name))
      .map(f => ({
        name: f.name,
        isDirectory: f.isDirectory(),
        isFile: f.isFile(),
      }));
  } catch {
    files = [];
  }
  result.files = files;
  // 构建面包屑
  const parts = urlPath.split('/').filter(Boolean);
  let acc = '';
  result.breadcrumb = [{ name: 'root', url: '/' }];
  for (let i = 0; i < parts.length; i++) {
    acc += '/' + parts[i];
    result.breadcrumb.push({ name: parts[i], url: acc });
  }
  return result;
}

module.exports = { getDirectoryData };

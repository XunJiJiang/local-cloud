// 一个简单的 Node.js 静态文件服务器，只允许访问 json/folders.json 中列出的文件夹
// 不使用外部库
const http = require('http');
const fs = require('fs');
const path = require('path');
const { renderDirectory, getVideoDuration } = require('./render/directory');
const { renderPreview } = require('./render/preview');
const { execSync } = require('child_process');
const { getAllowedFolders, getExcludeFolders } = require('./src/utils/readConfig.js');

const PORT = 8080;

/**
 *
 * @param {string} requestPath 完整请求路径
 * @param {string} allowedFolders 完整的允许路径
 * @param {string} exclude 排除的文件夹、文件
 * @returns
 */
function isPathAllowed(requestPath, allowedFolders, exclude) {
  // 只允许访问在 allowedFolders 下的文件
  for (const folder of allowedFolders) {
    if (requestPath.startsWith(folder)) {
      if (exclude && Array.isArray(exclude)) {
        const relative = path.relative(folder, requestPath);
        const parts = relative.split(path.sep);
        for (const part of parts) {
          if (exclude.includes(part)) return false;
        }
      }
      return true;
    }
  }
  return false;
}

function serveDirectory(res, dirPath, urlPath) {
  const aliasToPath = getAllowedFolders();
  const aliasList = Object.keys(aliasToPath);
  let rootAlias = aliasList.find(a => urlPath === '/' + a || urlPath.startsWith('/' + a + '/'));
  // 读取 exclude
  let exclude = getExcludeFolders();
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDirectory({ dirPath, urlPath, rootAlias, files, exclude }));
  });
}

function serveFile(res, filePath, fileName) {
  // 根据扩展名决定 Content-Type
  const ext = path.extname(fileName || filePath).toLowerCase();
  const textTypes = ['.txt', '.md', '.log', '.json', '.js', '.css', '.html', '.py', '.c', '.cpp', '.java', '.sh'];
  let contentType = undefined;
  if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext))
    contentType = 'image/' + (ext === '.jpg' ? 'jpeg' : ext.slice(1));
  else if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) contentType = 'video/' + ext.slice(1);
  else if (textTypes.includes(ext)) contentType = 'text/plain; charset=utf-8';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    if (contentType) res.writeHead(200, { 'Content-Type': contentType });
    else res.writeHead(200);
    res.end(data);
  });
}

// 获取本机 en0 的 IP 地址作为 host
let HOST = '127.0.0.1';
try {
  HOST = execSync('ipconfig getifaddr en0').toString().trim() || HOST;
} catch {
  // 如果获取失败，使用默认
}

http
  .createServer((req, res) => {
    const aliasToPath = getAllowedFolders();
    const exclude = getExcludeFolders();
    const allowedFolders = Object.values(aliasToPath);
    const aliasList = Object.keys(aliasToPath);
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    console.log('Require in:', urlPath, '=======================================================');
    if (urlPath === '/') {
      // 展示所有可访问的根目录，调用 renderDirectory 并传递 rootFoldersStatus
      const rootFoldersStatus = {};
      for (const alias of aliasList) {
        const folderPath = aliasToPath[alias];
        rootFoldersStatus[alias] = fs.existsSync(folderPath);
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(
        renderDirectory({
          dirPath: '',
          urlPath: '/',
          files: [],
          rootFoldersStatus,
        })
      );
      return;
    }
    // 预览页面渲染
    if (urlPath.startsWith('/preview/')) {
      // 预览路径格式: /preview/别名/子路径
      const previewPath = urlPath.replace(/^\/preview\//, '');
      const aliasToPath = getAllowedFolders();
      const aliasList = Object.keys(aliasToPath);
      let matchedAlias = null;
      let relPath = '';
      for (const alias of aliasList) {
        if (previewPath === alias || previewPath.startsWith(alias + '/')) {
          matchedAlias = alias;
          relPath = previewPath.slice(alias.length);
          if (relPath.startsWith('/')) relPath = relPath.slice(1);
          break;
        }
      }
      if (!matchedAlias) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const matchedFolder = aliasToPath[matchedAlias];
      const absPath = relPath ? path.join(matchedFolder, relPath) : matchedFolder;
      if (!isPathAllowed(absPath, Object.values(aliasToPath), exclude)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.stat(absPath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        // 获取同级文件列表
        const parentDir = path.dirname(absPath);
        fs.readdir(parentDir, { withFileTypes: true }, (err, files) => {
          if (err) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          const filteredFiles = files.filter(f => !f.isDirectory() && !exclude.includes(f.name));
          const names = filteredFiles.map(f => f.name);
          const idx = names.indexOf(path.basename(absPath));
          const ext = path.extname(absPath).toLowerCase();
          const imgTypes = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
          const videoTypes = ['.mp4', '.webm', '.ogg', '.mov'];
          const audioTypes = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.opus'];
          const textTypes = [
            '.txt',
            '.md',
            '.log',
            '.json',
            '.js',
            '.css',
            '.html',
            '.py',
            '.c',
            '.cpp',
            '.java',
            '.sh',
          ];
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(
            renderPreview({
              urlPath,
              absPath,
              relPath,
              matchedAlias,
              matchedFolder,
              names,
              idx,
              ext,
              imgTypes,
              videoTypes,
              textTypes,
              audioTypes,
            })
          );
        });
      });
      return;
    }
    // 视频流式接口 /video/别名/子路径?start=秒
    if (urlPath.startsWith('/video/')) {
      const videoPath = urlPath.replace(/^\/video\//, '');
      const aliasToPath = getAllowedFolders();
      const aliasList = Object.keys(aliasToPath);
      let matchedAlias = null;
      let relPath = '';
      for (const alias of aliasList) {
        if (videoPath === alias || videoPath.startsWith(alias + '/')) {
          matchedAlias = alias;
          relPath = videoPath.slice(alias.length);
          if (relPath.startsWith('/')) relPath = relPath.slice(1);
          break;
        }
      }
      if (!matchedAlias) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const matchedFolder = aliasToPath[matchedAlias];
      const absPath = relPath ? path.join(matchedFolder, relPath) : matchedFolder;
      if (!isPathAllowed(absPath, Object.values(aliasToPath), exclude)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.stat(absPath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const range = req.headers.range;
        let start = 0;
        let end = stat.size - 1;
        if (range) {
          const match = range.match(/bytes=(\d+)-(\d*)/);
          if (match) {
            start = parseInt(match[1], 10);
            if (match[2]) end = parseInt(match[2], 10);
          }
        } else if (req.url.includes('?start=')) {
          // 支持 ?start=秒
          const urlObj = new URL(req.url, 'http://localhost');
          const startSec = parseFloat(urlObj.searchParams.get('start')) || 0;
          // 简单估算，假设码率恒定
          const duration = getVideoDuration(absPath);
          if (duration && duration > 0) {
            start = Math.floor((startSec / duration) * stat.size);
          }
        }
        if (start > end) start = 0;
        const chunkSize = end - start + 1;
        const contentType = getVideoMime(absPath);
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
        const stream = fs.createReadStream(absPath, { start, end });
        stream.pipe(res);
      });
      return;
    }
    // 音频流式接口 /audio/别名/子路径?start=秒
    if (urlPath.startsWith('/audio/')) {
      const audioPath = urlPath.replace(/^\/audio\//, '');
      const aliasToPath = getAllowedFolders();
      const aliasList = Object.keys(aliasToPath);
      let matchedAlias = null;
      let relPath = '';
      for (const alias of aliasList) {
        if (audioPath === alias || audioPath.startsWith(alias + '/')) {
          matchedAlias = alias;
          relPath = audioPath.slice(alias.length);
          if (relPath.startsWith('/')) relPath = relPath.slice(1);
          break;
        }
      }
      if (!matchedAlias) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      const matchedFolder = aliasToPath[matchedAlias];
      const absPath = relPath ? path.join(matchedFolder, relPath) : matchedFolder;
      if (!isPathAllowed(absPath, Object.values(aliasToPath), exclude)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.stat(absPath, (err, stat) => {
        if (err || !stat.isFile()) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        const range = req.headers.range;
        let start = 0;
        let end = stat.size - 1;
        if (range) {
          const match = range.match(/bytes=(\d+)-(\d*)/);
          if (match) {
            start = parseInt(match[1], 10);
            if (match[2]) end = parseInt(match[2], 10);
          }
        }
        if (start > end) start = 0;
        const chunkSize = end - start + 1;
        const contentType = getAudioMime(absPath);
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
        const stream = fs.createReadStream(absPath, { start, end });
        stream.pipe(res);
      });
      return;
    }
    // 匹配到哪个共享目录
    let relPath = '';
    const cleanUrl = urlPath.replace(/^\/+/, ''); // 去掉前导斜杠
    const parts = cleanUrl.split('/');
    parts[0] = aliasToPath[parts[0]] ?? parts[0];
    const matchedFolder = parts.join('/');

    console.log('实际', matchedFolder);

    if (!matchedFolder) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const absPath = relPath ? path.join(matchedFolder, relPath) : matchedFolder;
    if (!isPathAllowed(absPath, allowedFolders, exclude)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.stat(absPath, (err, stat) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      if (stat.isDirectory()) {
        serveDirectory(res, absPath, urlPath);
      } else {
        serveFile(res, absPath, path.basename(absPath));
      }
    });
  })
  .listen(PORT, HOST, () => {
    // TODO: 修改输出颜色
    console.log(`Server running at http://${HOST}:${PORT}/`);
  });

function getVideoMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.webm') return 'video/webm';
  if (ext === '.ogg') return 'video/ogg';
  if (ext === '.mov') return 'video/quicktime';
  return 'application/octet-stream';
}

function getAudioMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.mp3') return 'audio/mpeg';
  if (ext === '.wav') return 'audio/wav';
  if (ext === '.ogg') return 'audio/ogg';
  if (ext === '.aac') return 'audio/aac';
  if (ext === '.flac') return 'audio/flac';
  if (ext === '.m4a') return 'audio/mp4';
  if (ext === '.opus') return 'audio/ogg';
  return 'application/octet-stream';
}

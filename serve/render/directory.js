const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

function renderDirectory({ dirPath, urlPath, rootAlias, files, exclude = [], rootFoldersStatus }) {
  // 日志打印
  console.log('Rendering directory:', dirPath, 'as', urlPath);
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文件树</title><style>
    body { margin: 24px; }
    a { text-decoration: none; color: inherit; display: block; padding: 4px 16px; border-radius: 4px; transition: background 0.2s, border 0.2s; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { border-radius: 4px; margin-bottom: 4px; }
    li.inactive > a { color: #aaa !important; background: #f4f4f4 !important; cursor: not-allowed !important; pointer-events: none; }
    li:nth-child(2n) { background: #f0f0f0; }
    a.nav { display:inline;padding:4px 4px; }
    a.nav[href]:hover { background: #f0f0f0; }
    a.item { border: 1px solid transparent; }
    a.item:hover { border: 1px solid #3399ff; background: #e0eaff; }
    .back-btn { display:inline-block; margin: 0 0 4px 0; padding: 4px 16px; border-radius: 6px; border: 1px solid transparent; background: #f4f4f4; color: #333; font-size: 1em; cursor: pointer; transition: background .2s, border .2s;}
    .back-btn:hover { background: #e0eaff; border: 1px solid #3399ff; }
  </style></head><body>`;
  // 构建可点击的路径导航
  function buildBreadcrumb(urlPath) {
    const parts = urlPath.split('/').filter(Boolean);
    let html = '';
    let acc = '';
    if (parts.length === 0) {
      html = '<a class="nav">root/</a>';
    } else {
      html = '<a class="nav" href="/">root</a>/';
      for (let i = 0; i < parts.length; i++) {
        acc += '/' + parts[i];
        html +=
          i + 1 != parts.length
            ? '<a class="nav" href="' + acc + '">' + parts[i] + '</a>/ '
            : '<a class="nav">' + parts[i] + '</a>/ ';
      }
    }
    return html;
  }
  html += `<h2 style="font-size:1.2em;font-weight:normal;">${buildBreadcrumb(urlPath)}</h2>`;
  if (urlPath !== '/') {
    const parent = path.dirname(urlPath);
    html += `<button class="back-btn" onclick="location.href='${parent === '.' ? '/' : parent}'">上一级</button>`;
  }
  html += '<ul>';
  if (urlPath === '/') {
    // 根目录，显示所有别名及其可用性
    for (const alias in rootFoldersStatus) {
      const exists = rootFoldersStatus[alias];
      html += `<li${!exists ? ' class="inactive"' : ''}><a class="item" href="/${alias}"${
        !exists ? ' tabindex="-1"' : ''
      }>${alias}/</a></li>`;
    }
    html += '</ul>';
    return html;
  }

  for (const file of files) {
    if (exclude.includes(file.name)) continue;
    if (!rootAlias) rootAlias = path.basename(dirPath);
    let relPath = '';
    if (urlPath === '/' + rootAlias || urlPath === '/' + rootAlias + '/') {
      relPath = file.name;
    } else {
      relPath = urlPath.replace('/' + rootAlias, '').replace(/^\//, '');
      relPath = relPath ? relPath + '/' + file.name : file.name;
    }
    const fileUrl = '/' + rootAlias + '/' + relPath;
    if (file.isDirectory()) {
      html += `<li><a class="item" href="${fileUrl}">${file.name}/</a></li>`;
    } else {
      html += `<li><a class="item" href="${fileUrl}" data-path="${fileUrl}">${file.name}</a></li>`;
    }
  }
  html += '</ul>';
  html += `<script>
    document.querySelectorAll('[data-path]').forEach((el, idx) => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const filePath = el.getAttribute('data-path');
        window.open('/preview' + filePath, '_blank');
      });
    });
  </script>`;
  html += `</body></html>`;
  return html;
}

function getVideoDuration(filePath) {
  try {
    // 使用 ffprobe 获取视频时长（需本地已安装 ffprobe）
    const output = child_process.spawnSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath],
      { encoding: 'utf8' }
    );
    return parseFloat(output.trim());
  } catch {
    return 0;
  }
}

module.exports = { renderDirectory, getVideoDuration };

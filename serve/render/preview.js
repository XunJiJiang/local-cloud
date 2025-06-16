const path = require('path');
const fs = require('fs');

function renderPreview({
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
  videoLength, // 新增参数
}) {
  let html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文件预览</title><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f8f9fa;}' +
    '#nav-wrap{display:flex;align-items:center;gap:1em;margin:16px;}' +
    '#nav{display:flex;align-items:center;gap:0.5em;}' +
    '#nav button{width:2.5em;height:2.5em;min-width:2.5em;min-height:2.5em;max-width:2.5em;max-height:2.5em;display:flex;align-items:center;justify-content:center;margin:0;padding:0;border-radius:6px;border:1px solid #ddd;background:#f4f4f4;cursor:pointer;transition:background .2s,border .2s;}' +
    '#nav button:disabled{opacity:.5;cursor:not-allowed;}' +
    '#nav button:not(:disabled):hover{background:#e0eaff;border:1.5px solid #3399ff;}' +
    '#filename{font-weight:bold;font-size:1.1em;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#viewer{margin:0;padding:0;max-width:none;min-height:0;background:transparent;border-radius:0;box-shadow:none;display:flex;align-items:center;justify-content:center;}' +
    'pre{background:#f4f4f4;padding:1.2em;border-radius:6px;overflow-x:auto;font-size:1.05em;line-height:1.6;}' +
    'img,video{display:block;margin:0;box-shadow:0 2px 8px #0001;width:auto;height:auto;max-width:100vw;max-height:calc(100vh - 3.5em);background:transparent;border-radius:0;}' +
    '#viewer video{height:auto;max-height:calc(100vh - 3.5em);}' +
    '@media (max-width: 600px){#viewer{margin:0;padding:0;max-width:none;}#nav-wrap{margin:16px;}img,video{max-width:100vw;max-height:calc(100vh - 3.5em);}#viewer video{height:auto;max-height:calc(100vh - 3.5em);}}' +
    '</style></head><body>';
  html += '<div id="nav-wrap">';
  html += '<div id="nav">';
  html += `<button id="prev"${idx === 0 ? ' disabled' : ''}>&lt;</button>`;
  html += `<button id="next"${idx === names.length - 1 ? ' disabled' : ''}>&gt;</button>`;
  html += '</div>';
  html += `<h2 id="filename">${path.basename(absPath)}</h2>`;
  html += '</div><div id="viewer">';
  if (imgTypes.includes(ext)) {
    html += `<img src="${urlPath.replace('/preview', '')}">`;
  } else if (videoTypes.includes(ext)) {
    // 直接调用 renderVideoPreview，避免重复代码
    return renderVideoPreview({ urlPath, absPath, relPath, matchedAlias, matchedFolder, names, idx, videoLength });
  } else if (textTypes.includes(ext)) {
    const fileData = fs.readFileSync(absPath, 'utf-8');
    html += `<pre>${fileData.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</pre>`;
  } else {
    html += `<span>${path.basename(absPath)}（不支持预览）</span><a href="${urlPath.replace(
      '/preview',
      ''
    )}" download style="display:block;margin-top:1em;">下载</a>`;
  }
  html += '</div>';
  html += `<script>const list=${JSON.stringify(
    names
  )};let idx=${idx};function nav(i){if(i>=0&&i<list.length){location.href='/preview/${matchedAlias}'+parentPath+'/'+encodeURIComponent(list[i]);}}const parentPath='${
    relPath ? '/' + path.dirname(relPath) : ''
  }';document.getElementById('prev').onclick=function(){if(idx>0)nav(idx-1);};document.getElementById('next').onclick=function(){if(idx<list.length-1)nav(idx+1);};</script>`;
  html += '</body></html>';
  return html;
}

function renderVideoPreview({ urlPath, absPath, relPath, matchedAlias, matchedFolder, names, idx, videoLength }) {
  let html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>视频预览</title><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f8f9fa;}' +
    '#nav-wrap{display:flex;align-items:center;gap:1em;margin:16px;}' +
    '#nav{display:flex;align-items:center;gap:0.5em;}' +
    '#nav button{width:2.5em;height:2.5em;min-width:2.5em;min-height:2.5em;max-width:2.5em;max-height:2.5em;display:flex;align-items:center;justify-content:center;margin:0;padding:0;border-radius:6px;border:1px solid #ddd;background:#f4f4f4;cursor:pointer;transition:background .2s,border .2s;}' +
    '#nav button:disabled{opacity:.5;cursor:not-allowed;}' +
    '#nav button:not(:disabled):hover{background:#e0eaff;border:1.5px solid #3399ff;}' +
    '#filename{font-weight:bold;font-size:1.1em;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#viewer{margin:0;padding:0;max-width:none;min-height:0;background:transparent;border-radius:0;box-shadow:none;display:flex;align-items:center;justify-content:center;}' +
    'pre{background:#f4f4f4;padding:1.2em;border-radius:6px;overflow-x:auto;font-size:1.05em;line-height:1.6;}' +
    'img,video{display:block;margin:0;box-shadow:0 2px 8px #0001;width:auto;height:auto;max-width:100vw;max-height:calc(100vh - 3.5em);background:transparent;border-radius:0;}' +
    '#viewer video{height:auto;max-height:calc(100vh - 3.5em);}' +
    '@media (max-width: 600px){#viewer{margin:0;padding:0;max-width:none;}#nav-wrap{margin:16px;}img,video{max-width:100vw;max-height:calc(100vh - 3.5em);}#viewer video{height:auto;max-height:calc(100vh - 3.5em);}}' +
    '</style></head><body>';
  html += '<div id="nav-wrap">';
  html += '<div id="nav">';
  html += `<button id="prev"${idx === 0 ? ' disabled' : ''}>&lt;</button>`;
  html += `<button id="next"${idx === names.length - 1 ? ' disabled' : ''}>&gt;</button>`;
  html += '</div>';
  html += `<h2 id="filename">${require('path').basename(absPath)}</h2>`;
  html += '</div><div id="viewer">';
  html += `<div id="video-box">
    <video id="video" style="max-width:100%;max-height:70vh;display:block;margin:0 auto;box-shadow:0 2px 8px #0001;" controls src="${urlPath.replace(
      '/preview',
      '/video'
    )}"></video>
  </div>`;
  html += `</div>`;
  html += `<script>
    // 上下项跳转
    const list=${JSON.stringify(
      names
    )};let idx=${idx};function nav(i){if(i>=0&&i<list.length){location.href='/preview/${matchedAlias}'+parentPath+'/'+encodeURIComponent(list[i]);}}const parentPath='${
    relPath ? '/' + require('path').dirname(relPath) : ''
  }';document.getElementById('prev').onclick=function(){if(idx>0)nav(idx-1);};document.getElementById('next').onclick=function(){if(idx<list.length-1)nav(idx+1);};
  </script>`;
  html += '</body></html>';
  return html;
}

function formatTime(t) {
  t = Math.floor(t);
  return Math.floor(t / 60) + ':'.padEnd(2, '0') + (t % 60).toString().padStart(2, '0');
}
module.exports = { renderPreview, renderVideoPreview };

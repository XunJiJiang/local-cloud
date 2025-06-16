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
  audioTypes,
  videoLength, // 新增参数
}) {
  console.log('Rendering preview:', relPath, 'as', urlPath);
  // 侧边栏 HTML
  const sidebarHtml = `
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-title">同级文件</div>
      <ul class="sidebar-list">
        ${names
          .map((n, i) =>
            i === idx
              ? `<li class=\"active\"><a class=\"item\" tabindex=\"-1\">${n}</a></li>`
              : `<li><a class=\"item\" href=\"/preview/${matchedAlias}${
                  relPath ? '/' + path.dirname(relPath) : ''
                }/${encodeURIComponent(n)}\">${n}</a></li>`
          )
          .join('')}
      </ul>
    </aside>
  `;
  let html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>文件预览</title><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f8f9fa;}' +
    '#main-wrap{display:flex;flex-direction:row;box-sizing:border-box;width:100vw;max-width:100vw;overflow-x:hidden;}' +
    '.sidebar{width:220px;min-width:180px;max-width:260px;background:#fff;border-right:1px solid #eee;padding:12px 0;box-shadow:2px 0 8px #0001;position:relative;z-index:2;transition:transform .2s;box-sizing:border-box;overflow-y:auto;max-height:100vh;}' +
    '.sidebar-title{font-weight:bold;font-size:1.1em;padding:0 20px 8px 20px;color:#3399ff;}' +
    '.sidebar-list{list-style:none;padding:0 8px 0 8px;margin:0;}' +
    '.sidebar-list li{padding:2px 0;}' +
    '.sidebar-list a.item{display:block;padding:4px 16px;border-radius:4px;border:1px solid transparent;color:#333;text-decoration:none;transition:background 0.2s, border 0.2s;}' +
    '.sidebar-list a.item:hover{border:1px solid #3399ff;background:#e0eaff;}' +
    '.sidebar-list li.active>a.item{color:#fff;background:#3399ff;border-radius:4px;border:1px solid #3399ff;}' +
    '#sidebar-toggle{margin-right:0.5em;min-width:2.5em;min-height:2.5em;max-width:2.5em;max-height:2.5em;border-radius:6px;border:1px solid #ddd;background:#f4f4f4;cursor:pointer;transition:background .2s,border .2s;display:flex;align-items:center;justify-content:center;}' +
    '#sidebar-toggle:hover{background:#e0eaff;border:1.5px solid #3399ff;}' +
    '#viewer{margin:0;padding:0;max-width:none;min-height:0;background:transparent;border-radius:0;box-shadow:none;display:flex;align-items:flex-start;justify-content:center;flex:1;box-sizing:border-box;overflow-y:auto;overflow-x:auto;max-height:100vh;}' +
    'pre{background:#f4f4f4;padding:1.2em;border-radius:6px;overflow-x:auto;font-size:1.05em;line-height:1.6;}' +
    'img,video{display:block;margin:0;box-shadow:0 2px 8px #0001;width:auto;height:auto;max-width:calc(100vw - 260px);max-height:calc(100vh - 3.5em);background:transparent;border-radius:0;box-sizing:border-box;}' +
    '@media (max-width:600px){body.sidebar-open{overflow:hidden;} .sidebar{position:fixed;top:32px;left:50%;transform:translateX(-50%) scale(0);width:90vw;max-width:95vw;min-width:0;max-height:calc(100% - 96px);height:auto;box-shadow:0 4px 24px #0003;border-radius:12px;z-index:1001;transition:transform .2s;overflow-y:auto;} .sidebar.open{transform:translateX(-50%) scale(1);} #main-wrap{flex-direction:column;width:100vw;max-width:100vw;} #sidebar-mask{display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0005;z-index:1000;} #sidebar-mask.show{display:block;} #viewer,img,video{max-width:100vw!important;} }' +
    '@media (min-width:601px){.sidebar{display:block;transform:none;position:relative;left:0;top:0;border-radius:0;box-shadow:2px 0 8px #0001;overflow-y:auto;max-height:100vh;} .sidebar.closed{display:none;} #sidebar-mask{display:none;} #main-wrap{flex-direction:row;width:100vw;max-width:100vw;} #viewer{max-width:calc(100vw - 220px);overflow-y:auto;overflow-x:auto;max-height:100vh;} img,video{max-width:calc(100vw - 260px);} .sidebar.closed ~ div > #viewer{max-width:100vw;} .sidebar.closed ~ div img, .sidebar.closed ~ div video{max-width:100vw;}}' +
    '#nav-wrap{display:flex;align-items:center;gap:1em;margin:16px;}' +
    '#nav{display:flex;align-items:center;gap:0.5em;}' +
    '#nav button{width:2.5em;height:2.5em;min-width:2.5em;min-height:2.5em;max-width:2.5em;max-height:2.5em;display:flex;align-items:center;justify-content:center;margin:0;padding:0;border-radius:6px;border:1px solid #ddd;background:#f4f4f4;cursor:pointer;transition:background .2s,border .2s;}' +
    '#nav button:disabled{opacity:.5;cursor:not-allowed;}' +
    '#nav button:not(:disabled):hover{background:#e0eaff;border:1.5px solid #3399ff;}' +
    '#filename{font-weight:bold;font-size:1.1em;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '</style></head><body>';
  html += '<div id="sidebar-mask"></div>';
  html += '<div id="main-wrap">';
  html += sidebarHtml;
  html += '<div style="flex:1;display:flex;flex-direction:column;">';
  html += '<div id="nav-wrap">';
  html += '<button id="sidebar-toggle" title="显示/隐藏侧栏">☰</button>';
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
  } else if (audioTypes.includes(ext)) {
    // 音频渲染，UI与图片/视频一致，流式播放
    // TODO: 防抖
    html += `<div id="audio-box">
      <audio id="audio" style="max-width:100%;max-height:70vh;display:block;margin:0 auto;box-shadow:0 2px 8px #0001;" controls src="${urlPath.replace(
        '/preview',
        '/audio'
      )}"></audio>
    </div>`;
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
  html += '</div>';
  html += '</div>';
  html += `<script>const list=${JSON.stringify(
    names
  )};let idx=${idx};function nav(i){if(i>=0&&i<list.length){location.href='/preview/${matchedAlias}'+parentPath+'/'+encodeURIComponent(list[i]);}}const parentPath='${
    relPath ? '/' + path.dirname(relPath) : ''
  }';document.getElementById('prev').onclick=function(){if(idx>0)nav(idx-1);};document.getElementById('next').onclick=function(){if(idx<list.length-1)nav(idx+1);};
  // 侧栏控制
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarMask = document.getElementById('sidebar-mask');
  // 禁止当前项点击
  sidebar.querySelectorAll('li.active > a').forEach(a => { a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }); });
  function isMobile(){return window.innerWidth<=600;}
  function openSidebar(){
    if(isMobile()){
      sidebar.classList.add('open');
      sidebarMask.classList.add('show');
      document.body.classList.add('sidebar-open');
    }else{
      sidebar.classList.remove('closed');
    }
  }
  function closeSidebar(){
    if(isMobile()){
      sidebar.classList.remove('open');
      sidebarMask.classList.remove('show');
      document.body.classList.remove('sidebar-open');
    }else{
      sidebar.classList.add('closed');
    }
  }
  sidebarToggle.onclick=function(){
    if(isMobile()){
      if(sidebar.classList.contains('open')){closeSidebar();}else{openSidebar();}
    }else{
      if(sidebar.classList.contains('closed')){openSidebar();}else{closeSidebar();}
    }
  };
  sidebarMask.onclick=closeSidebar;
  window.addEventListener('resize',()=>{closeSidebar();});
  </script>`;
  html += '</body></html>';
  return html;
}

function renderVideoPreview({ urlPath, absPath, relPath, matchedAlias, matchedFolder, names, idx, videoLength }) {
  console.log('Rendering preview:', relPath, 'as', urlPath);
  // 侧边栏 HTML
  const sidebarHtml = `
    <aside id="sidebar" class="sidebar">
      <div class="sidebar-title">同级文件</div>
      <ul class="sidebar-list">
        ${names
          .map((n, i) =>
            i === idx
              ? `<li class="active"><a class="item" tabindex="-1">${n}</a></li>`
              : `<li><a class="item" href="/preview/${matchedAlias}${
                  relPath ? '/' + require('path').dirname(relPath) : ''
                }/${encodeURIComponent(n)}">${n}</a></li>`
          )
          .join('')}
      </ul>
    </aside>
  `;
  let html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>视频预览</title><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f8f9fa;}' +
    '#main-wrap{display:flex;flex-direction:row;box-sizing:border-box;width:100vw;max-width:100vw;overflow-x:hidden;}' +
    '.sidebar{width:220px;min-width:180px;max-width:260px;background:#fff;border-right:1px solid #eee;padding:12px 0;box-shadow:2px 0 8px #0001;position:relative;z-index:2;transition:transform .2s;box-sizing:border-box;overflow-y:auto;max-height:100vh;}' +
    '.sidebar-title{font-weight:bold;font-size:1.1em;padding:0 20px 8px 20px;color:#3399ff;}' +
    '.sidebar-list{list-style:none;padding:0 8px 0 8px;margin:0;}' +
    '.sidebar-list li{padding:2px 0;}' +
    '.sidebar-list a.item{display:block;padding:4px 16px;border-radius:4px;border:1px solid transparent;color:#333;text-decoration:none;transition:background 0.2s, border 0.2s;}' +
    '.sidebar-list a.item:hover{border:1px solid #3399ff;background:#e0eaff;}' +
    '.sidebar-list li.active>a.item{color:#fff;background:#3399ff;border-radius:4px;border:1px solid #3399ff;}' +
    '#sidebar-toggle{margin-right:0.5em;min-width:2.5em;min-height:2.5em;max-width:2.5em;max-height:2.5em;border-radius:6px;border:1px solid #ddd;background:#f4f4f4;cursor:pointer;transition:background .2s,border .2s;display:flex;align-items:center;justify-content:center;}' +
    '#sidebar-toggle:hover{background:#e0eaff;border:1.5px solid #3399ff;}' +
    '#viewer{margin:0;padding:0;max-width:none;min-height:0;background:transparent;border-radius:0;box-shadow:none;display:flex;align-items:flex-start;justify-content:center;flex:1;box-sizing:border-box;overflow-y:auto;overflow-x:auto;max-height:100vh;}' +
    'pre{background:#f4f4f4;padding:1.2em;border-radius:6px;overflow-x:auto;font-size:1.05em;line-height:1.6;}' +
    'img,video{display:block;margin:0;box-shadow:0 2px 8px #0001;width:auto;height:auto;max-width:calc(100vw - 260px);max-height:calc(100vh - 3.5em);background:transparent;border-radius:0;box-sizing:border-box;}' +
    '@media (max-width:600px){body.sidebar-open{overflow:hidden;} .sidebar{position:fixed;top:32px;left:50%;transform:translateX(-50%) scale(0);width:90vw;max-width:95vw;min-width:0;max-height:calc(100% - 96px);height:auto;box-shadow:0 4px 24px #0003;border-radius:12px;z-index:1001;transition:transform .2s;overflow-y:auto;} .sidebar.open{transform:translateX(-50%) scale(1);} #main-wrap{flex-direction:column;width:100vw;max-width:100vw;} #sidebar-mask{display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0005;z-index:1000;} #sidebar-mask.show{display:block;} #viewer,img,video{max-width:100vw!important;} }' +
    '@media (min-width:601px){.sidebar{display:block;transform:none;position:relative;left:0;top:0;border-radius:0;box-shadow:2px 0 8px #0001;overflow-y:auto;max-height:100vh;} .sidebar.closed{display:none;} #sidebar-mask{display:none;} #main-wrap{flex-direction:row;width:100vw;max-width:100vw;} #viewer{max-width:calc(100vw - 220px);overflow-y:auto;overflow-x:auto;max-height:100vh;} img,video{max-width:calc(100vw - 260px);} .sidebar.closed ~ div > #viewer{max-width:100vw;} .sidebar.closed ~ div img, .sidebar.closed ~ div video{max-width:100vw;}}' +
    '#nav-wrap{display:flex;align-items:center;gap:1em;margin:16px;}' +
    '#nav{display:flex;align-items:center;gap:0.5em;}' +
    '#nav button{width:2.5em;height:2.5em;min-width:2.5em;min-height:2.5em;max-width:2.5em;max-height:2.5em;display:flex;align-items:center;justify-content:center;margin:0;padding:0;border-radius:6px;border:1px solid #ddd;background:#f4f4f4;cursor:pointer;transition:background .2s,border .2s;}' +
    '#nav button:disabled{opacity:.5;cursor:not-allowed;}' +
    '#nav button:not(:disabled):hover{background:#e0eaff;border:1.5px solid #3399ff;}' +
    '#filename{font-weight:bold;font-size:1.1em;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '</style></head><body>';
  html += '<div id="sidebar-mask"></div>';
  html += '<div id="main-wrap">';
  html += sidebarHtml;
  html += '<div style="flex:1;display:flex;flex-direction:column;">';
  html += '<div id="nav-wrap">';
  html += '<button id="sidebar-toggle" title="显示/隐藏侧栏">☰</button>';
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
  html += '</div>';
  html += '</div>';
  html += `<script>
    // 上下项跳转
    const list=${JSON.stringify(
      names
    )};let idx=${idx};function nav(i){if(i>=0&&i<list.length){location.href='/preview/${matchedAlias}'+parentPath+'/'+encodeURIComponent(list[i]);}}const parentPath='${
    relPath ? '/' + require('path').dirname(relPath) : ''
  }';document.getElementById('prev').onclick=function(){if(idx>0)nav(idx-1);};document.getElementById('next').onclick=function(){if(idx<list.length-1)nav(idx+1);};
    // 侧栏控制
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarMask = document.getElementById('sidebar-mask');
    // 禁止当前项点击
    sidebar.querySelectorAll('li.active > a').forEach(a => { a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }); });
    function isMobile(){return window.innerWidth<=600;}
    function openSidebar(){
      if(isMobile()){
        sidebar.classList.add('open');
        sidebarMask.classList.add('show');
        document.body.classList.add('sidebar-open');
      }else{
        sidebar.classList.remove('closed');
      }
    }
    function closeSidebar(){
      if(isMobile()){
        sidebar.classList.remove('open');
        sidebarMask.classList.remove('show');
        document.body.classList.remove('sidebar-open');
      }else{
        sidebar.classList.add('closed');
      }
    }
    sidebarToggle.onclick=function(){
      if(isMobile()){
        if(sidebar.classList.contains('open')){closeSidebar();}else{openSidebar();}
      }else{
        if(sidebar.classList.contains('closed')){openSidebar();}else{closeSidebar();}
      }
    };
    sidebarMask.onclick=closeSidebar;
    window.addEventListener('resize',()=>{closeSidebar();});
    // 视频切换防抖
    let debounceTimer = null;
    sidebar.querySelectorAll('li:not(.active) > a.item').forEach(a => {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const href = a.getAttribute('href');
        if (!href) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          location.href = href;
        }, 250); // 250ms 防抖
      });
    });
  </script>`;
  html += '</body></html>';
  return html;
}

function formatTime(t) {
  t = Math.floor(t);
  return Math.floor(t / 60) + ':'.padEnd(2, '0') + (t % 60).toString().padStart(2, '0');
}

module.exports = { renderPreview, renderVideoPreview };

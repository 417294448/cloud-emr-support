const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function read(relPath) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      'Missing ' + relPath + ' — run from the repo root, and run scripts/build-data.js first.'
    );
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

// Keep this list in the same order as the <script> tags in index.html —
// each provider's data file must load before its queries/view files, and
// app.js (which wires up all providers) must load last, before theme.js.
const awsDataJs = read('data/aws-emr-data.js');
const azureDataJs = read('data/azure-hdinsight-data.js');
const gcpDataJs = read('data/gcp-dataproc-data.js');
const aliyunDataJs = read('data/aliyun-emr-data.js');
const css = read('style.css');
const domUtils = read('dom-utils.js');
const awsQueries = read('aws-emr-queries.js');
const awsView = read('aws-emr-view.js');
const azureQueries = read('azure-hdinsight-queries.js');
const azureView = read('azure-hdinsight-view.js');
const gcpQueries = read('gcp-dataproc-queries.js');
const gcpView = read('gcp-dataproc-view.js');
const aliyunQueries = read('aliyun-emr-queries.js');
const aliyunView = read('aliyun-emr-view.js');
const app = read('app.js');
const theme = read('theme.js');

const html = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8" />\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
'  <title>Cloud EMR Version Intelligence Console</title>\n' +
'  <script>\n' +
'    (function () {\n' +
"      var saved = localStorage.getItem('cloud-emr-theme');\n" +
"      if (saved === 'dark') {\n" +
"        document.documentElement.setAttribute('data-theme', 'dark');\n" +
'      }\n' +
'    })();\n' +
'  </script>\n' +
'  <style>\n' + css + '\n  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <header class="app-header">\n' +
'    <div class="header-titles">\n' +
'      <h1>Cloud EMR Version Intelligence Console</h1>\n' +
'    </div>\n' +
'    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle day and night theme"></button>\n' +
'  </header>\n' +
'  <nav id="provider-tab-bar" class="provider-tab-bar"></nav>\n' +
'  <main id="provider-panel" class="provider-panel"></main>\n' +
'\n' +
'  <script>\n' + awsDataJs + '\n  </script>\n' +
'  <script>\n' + azureDataJs + '\n  </script>\n' +
'  <script>\n' + gcpDataJs + '\n  </script>\n' +
'  <script>\n' + aliyunDataJs + '\n  </script>\n' +
'  <script>\n' + domUtils + '\n  </script>\n' +
'  <script>\n' + awsQueries + '\n  </script>\n' +
'  <script>\n' + awsView + '\n  </script>\n' +
'  <script>\n' + azureQueries + '\n  </script>\n' +
'  <script>\n' + azureView + '\n  </script>\n' +
'  <script>\n' + gcpQueries + '\n  </script>\n' +
'  <script>\n' + gcpView + '\n  </script>\n' +
'  <script>\n' + aliyunQueries + '\n  </script>\n' +
'  <script>\n' + aliyunView + '\n  </script>\n' +
'  <script>\n' + app + '\n  </script>\n' +
'  <script>\n' + theme + '\n  </script>\n' +
'</body>\n' +
'</html>\n';

const NEW_PATH = path.join(ROOT, 'index-new.html');
const LIVE_PATH = path.join(ROOT, 'index.html');
const OLD_PATH = path.join(ROOT, 'index-old.html');

fs.writeFileSync(NEW_PATH, html, 'utf-8');
console.log('Wrote ' + NEW_PATH + ' (' + html.length + ' bytes)');

// Promote: back up the current live index.html as index-old.html (overwriting
// any previous backup), then move the freshly built index-new.html into place
// as the new index.html. This intentionally replaces the live page — there is
// no separate review gate. If the result looks wrong, restore the backup:
//   node -e "require('fs').renameSync('index-old.html', 'index.html')"
// or simply copy index-old.html back over index.html by hand.
function replaceFile(srcPath, destPath) {
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath);
  }
  fs.renameSync(srcPath, destPath);
}

if (fs.existsSync(LIVE_PATH)) {
  replaceFile(LIVE_PATH, OLD_PATH);
  console.log('Backed up previous index.html -> ' + OLD_PATH);
}
replaceFile(NEW_PATH, LIVE_PATH);
console.log('Promoted the freshly built console to ' + LIVE_PATH);

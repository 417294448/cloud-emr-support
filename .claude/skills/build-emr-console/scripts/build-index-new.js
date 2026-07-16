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

const dataJs = read('data/aws-emr-data.js');
const css = read('style.css');
const domUtils = read('dom-utils.js');
const queries = read('aws-emr-queries.js');
const view = read('aws-emr-view.js');
const app = read('app.js');
const theme = read('theme.js');

const html = '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'  <meta charset="UTF-8" />\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
'  <title>Cloud EMR Version Intelligence Console (preview)</title>\n' +
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
'  <script>\n' + dataJs + '\n  </script>\n' +
'  <script>\n' + domUtils + '\n  </script>\n' +
'  <script>\n' + queries + '\n  </script>\n' +
'  <script>\n' + view + '\n  </script>\n' +
'  <script>\n' + app + '\n  </script>\n' +
'  <script>\n' + theme + '\n  </script>\n' +
'</body>\n' +
'</html>\n';

const OUTPUT = path.join(ROOT, 'index-new.html');
fs.writeFileSync(OUTPUT, html, 'utf-8');
console.log('Wrote ' + OUTPUT + ' (' + html.length + ' bytes)');
console.log('This is a disposable preview snapshot — it never touches index.html. Open it in a browser to review, then delete it once done.');

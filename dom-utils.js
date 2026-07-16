window.DomUtils = (function () {
  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (key) {
        const value = props[key];
        if (key === 'class') {
          node.className = value;
        } else if (key === 'onclick') {
          node.addEventListener('click', value);
        } else if (key === 'onchange') {
          node.addEventListener('change', value);
        } else {
          node.setAttribute(key, value);
        }
      });
    }
    (children || []).forEach(function (child) {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function formatCell(value) {
    if (value === null || value === undefined || value === '') {
      return el('span', { class: 'cell-empty' }, ['—']);
    }
    return String(value);
  }

  function renderTable(headers, rows, extraClass) {
    const thead = el('thead', null, [
      el('tr', null, headers.map(function (h) { return el('th', null, [h]); })),
    ]);
    const tbody = el('tbody', null, rows.map(function (row) {
      return el('tr', null, row.map(function (cell) { return el('td', null, [formatCell(cell)]); }));
    }));
    const tableClass = extraClass ? 'data-table ' + extraClass : 'data-table';
    return el('table', { class: tableClass }, [thead, tbody]);
  }

  return { el: el, clear: clear, renderTable: renderTable, formatCell: formatCell };
})();

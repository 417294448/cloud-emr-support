window.AwsEmrView = (function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;
  const renderTable = window.DomUtils.renderTable;
  const q = window.AwsEmrQueries;

  function renderSupportBanner(data) {
    const policy = data.standardSupportPolicy;
    if (!policy) return el('div');
    return el('div', { class: 'support-banner' }, [
      el('strong', null, ['支持政策：']),
      policy.initialReleaseDate + ' 发布的release —— ' + policy.standardSupportEndDate + '，',
      'EoS开始于 ' + policy.endOfSupportStartDate + '，EoL开始于 ' + policy.endOfLifeStartDate + '。',
      ' ',
      el('a', { href: policy.source, target: '_blank' }, ['查看官方文档来源']),
    ]);
  }

  function renderSeriesSelect(seriesKeys, onChange) {
    return el('select', { class: 'series-select', onchange: function (e) { onChange(e.target.value); } },
      seriesKeys.map(function (key) { return el('option', { value: key }, [key]); })
    );
  }

  // ---- Mode 1: 按Release查询 ----
  function renderByRelease(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0] };

    const releaseSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(release) {
      clear(resultWrap);
      const seriesData = data[state.series];
      resultWrap.appendChild(renderTable(['应用', '版本'], q.getReleaseRow(seriesData, release)));
    }

    function renderReleaseOptions() {
      clear(releaseSelectWrap);
      const seriesData = data[state.series];
      const releaseSelect = el('select', {
        class: 'release-select',
        onchange: function (e) { renderResult(e.target.value); },
      }, seriesData.releases.map(function (r) { return el('option', { value: r }, [r]); }));
      releaseSelectWrap.appendChild(el('label', null, ['Release: ', releaseSelect]));
      renderResult(seriesData.releases[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderReleaseOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'field' }, [el('label', null, ['系列: ', seriesSelect])]),
      releaseSelectWrap,
      resultWrap,
    ]));

    renderReleaseOptions();
  }

  // ---- Mode 2: 按应用查询 ----
  const HISTORY_PAGE_SIZE = 10;

  function renderByApp(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0], expanded: false };

    const appSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app) {
      clear(resultWrap);
      const seriesData = data[state.series];
      const history = q.getAppHistory(seriesData, app);
      const visible = state.expanded ? history : history.slice(0, HISTORY_PAGE_SIZE);
      resultWrap.appendChild(renderTable(['Release', '版本'], visible));
      if (history.length > HISTORY_PAGE_SIZE) {
        const toggleBtn = el('button', {
          class: 'toggle-btn',
          onclick: function () {
            state.expanded = !state.expanded;
            renderResult(app);
          },
        }, [state.expanded ? '收起' : ('展开全部历史（共' + history.length + '个release）')]);
        resultWrap.appendChild(toggleBtn);
      }
    }

    function renderAppOptions() {
      clear(appSelectWrap);
      const seriesData = data[state.series];
      const appNames = q.getAppNames(seriesData);
      const appSelect = el('select', {
        class: 'app-select',
        onchange: function (e) {
          state.expanded = false;
          renderResult(e.target.value);
        },
      }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));
      appSelectWrap.appendChild(el('label', null, ['应用: ', appSelect]));
      renderResult(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      state.expanded = false;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'field' }, [el('label', null, ['系列: ', seriesSelect])]),
      appSelectWrap,
      resultWrap,
    ]));

    renderAppOptions();
  }

  const MODES = [
    { id: 'by-release', label: '按Release查询', render: renderByRelease },
    { id: 'by-app', label: '按应用查询', render: renderByApp },
  ];

  function mount(container, data) {
    clear(container);
    container.appendChild(renderSupportBanner(data));

    const tabBar = el('div', { class: 'sub-tab-bar' });
    const panel = el('div', { class: 'sub-tab-panel' });

    function selectMode(modeId) {
      Array.prototype.forEach.call(tabBar.children, function (btn) {
        btn.classList.toggle('active', btn.dataset.modeId === modeId);
      });
      const mode = MODES.filter(function (m) { return m.id === modeId; })[0];
      mode.render(panel, data);
    }

    MODES.forEach(function (mode) {
      const btn = el('button', {
        class: 'sub-tab-btn',
        onclick: function () { selectMode(mode.id); },
      }, [mode.label]);
      btn.dataset.modeId = mode.id;
      tabBar.appendChild(btn);
    });

    container.appendChild(tabBar);
    container.appendChild(panel);

    selectMode(MODES[0].id);
  }

  return { mount: mount };
})();

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

  // ---- Mode 3: 按应用版本号反查 ----
  function renderByVersion(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0] };

    const appSelectWrap = el('div', { class: 'field' });
    const versionSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app, version) {
      clear(resultWrap);
      const seriesData = data[state.series];
      const releases = q.findReleasesByVersion(seriesData, app, version);
      if (releases.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['未找到包含该版本号的release。']));
        return;
      }
      resultWrap.appendChild(renderTable(['Release'], releases.map(function (r) { return [r]; })));
    }

    function renderVersionOptions(app) {
      clear(versionSelectWrap);
      const seriesData = data[state.series];
      const versions = q.getDistinctVersions(seriesData, app);
      if (versions.length === 0) {
        clear(resultWrap);
        resultWrap.appendChild(el('p', null, ['该应用在此系列下没有可反查的版本号。']));
        return;
      }
      const versionSelect = el('select', {
        class: 'version-select',
        onchange: function (e) { renderResult(app, e.target.value); },
      }, versions.map(function (v) { return el('option', { value: v }, [v]); }));
      versionSelectWrap.appendChild(el('label', null, ['版本号: ', versionSelect]));
      renderResult(app, versions[0]);
    }

    function renderAppOptions() {
      clear(appSelectWrap);
      const seriesData = data[state.series];
      const appNames = q.getAppNames(seriesData);
      const appSelect = el('select', {
        class: 'app-select',
        onchange: function (e) { renderVersionOptions(e.target.value); },
      }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));
      appSelectWrap.appendChild(el('label', null, ['应用: ', appSelect]));
      renderVersionOptions(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'field' }, [el('label', null, ['系列: ', seriesSelect])]),
      appSelectWrap,
      versionSelectWrap,
      resultWrap,
    ]));

    renderAppOptions();
  }

  // ---- Mode 4: 多Release对比（跨系列） ----
  function renderCompare(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const checkboxWrap = el('div', { class: 'compare-checkboxes' });
    const resultWrap = el('div', { class: 'result' });
    const selections = [];

    function renderResult() {
      clear(resultWrap);
      if (selections.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['请至少选择一个release进行对比。']));
        return;
      }
      const compared = q.compareReleases(data, selections);
      resultWrap.appendChild(renderTable(compared.headers, compared.rows));
    }

    seriesKeys.forEach(function (series) {
      data[series].releases.forEach(function (release) {
        const checkbox = el('input', {
          type: 'checkbox',
          onchange: function (e) {
            if (e.target.checked) {
              selections.push({ series: series, release: release });
            } else {
              const idx = selections.map(function (s) { return s.series + '|' + s.release; })
                .indexOf(series + '|' + release);
              if (idx !== -1) selections.splice(idx, 1);
            }
            renderResult();
          },
        });
        checkboxWrap.appendChild(el('label', { class: 'compare-item' }, [checkbox, ' ' + release]));
      });
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('p', { class: 'hint' }, ['勾选任意系列下的release进行对比（支持跨系列）：']),
      checkboxWrap,
      resultWrap,
    ]));

    renderResult();
  }

  const MODES = [
    { id: 'by-release', label: '按Release查询', render: renderByRelease },
    { id: 'by-app', label: '按应用查询', render: renderByApp },
    { id: 'by-version', label: '按版本号反查', render: renderByVersion },
    { id: 'compare', label: '多Release对比', render: renderCompare },
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

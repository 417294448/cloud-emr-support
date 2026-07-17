window.AwsEmrView = (function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;
  const renderTable = window.DomUtils.renderTable;
  const renderStatTiles = window.DomUtils.renderStatTiles;
  const q = window.AwsEmrQueries;

  function renderSupportBanner(data) {
    const policy = data.standardSupportPolicy;
    if (!policy) return el('div');

    const releaseBadges = policy.releases.map(function (release) {
      return el('span', { class: 'policy-badge' }, [release.replace(' (all versions)', '')]);
    });

    const stats = renderStatTiles([
      { label: 'Initial release', value: policy.initialReleaseDate },
      { label: 'Standard support end', value: policy.standardSupportEndDate },
      { label: 'End of support', value: policy.endOfSupportStartDate },
      { label: 'End of life', value: policy.endOfLifeStartDate },
    ]);

    return el('div', { class: 'support-banner' }, [
      el('div', { class: 'support-banner-head' }, [
        el('span', { class: 'support-banner-title' }, ['Support Policy']),
        el('a', { class: 'support-banner-link', href: policy.source, target: '_blank' }, ['View official documentation source']),
      ]),
      el('div', { class: 'policy-badges' }, releaseBadges),
      stats,
    ]);
  }

  function renderSeriesSelect(seriesKeys, onChange) {
    return el('select', { class: 'series-select', onchange: function (e) { onChange(e.target.value); } },
      seriesKeys.map(function (key) { return el('option', { value: key }, [key]); })
    );
  }

  // ---- Mode 1: query by release ----
  function renderByRelease(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0] };

    const releaseSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(release) {
      clear(resultWrap);
      const seriesData = data[state.series];
      const descriptions = data.applicationDescriptions || {};
      const rows = q.getReleaseRow(seriesData, release).map(function (row) {
        return [row[0], row[1], descriptions[row[0]] || ''];
      });
      resultWrap.appendChild(renderTable(['Application', 'Version', 'Description'], rows, 'release-table'));
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
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, ['Series: ', seriesSelect])]),
        releaseSelectWrap,
      ]),
      resultWrap,
    ]));

    renderReleaseOptions();
  }

  // ---- Mode 2: query by application ----
  function renderByApp(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const state = { series: seriesKeys[0] };

    const appSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app) {
      clear(resultWrap);
      const seriesData = data[state.series];
      const history = q.getAppHistory(seriesData, app);
      resultWrap.appendChild(renderTable(['Release', 'Version'], history));
    }

    function renderAppOptions() {
      clear(appSelectWrap);
      const seriesData = data[state.series];
      const appNames = q.getAppNames(seriesData);
      const appSelect = el('select', {
        class: 'app-select',
        onchange: function (e) { renderResult(e.target.value); },
      }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));
      appSelectWrap.appendChild(el('label', null, ['Application: ', appSelect]));
      renderResult(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, ['Series: ', seriesSelect])]),
        appSelectWrap,
      ]),
      resultWrap,
    ]));

    renderAppOptions();
  }

  // ---- Mode 3: reverse lookup by version ----
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
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['No releases found containing this version.']));
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
        resultWrap.appendChild(el('p', null, ['This application has no tracked versions in this series.']));
        return;
      }
      const versionSelect = el('select', {
        class: 'version-select',
        onchange: function (e) { renderResult(app, e.target.value); },
      }, versions.map(function (v) { return el('option', { value: v }, [v]); }));
      versionSelectWrap.appendChild(el('label', null, ['Version: ', versionSelect]));
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
      appSelectWrap.appendChild(el('label', null, ['Application: ', appSelect]));
      renderVersionOptions(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, ['Series: ', seriesSelect])]),
        appSelectWrap,
        versionSelectWrap,
      ]),
      resultWrap,
    ]));

    renderAppOptions();
  }

  // ---- Mode 4: compare releases (cross-series) ----
  const MAX_COMPARE = 4;

  function renderCompare(container, data) {
    clear(container);
    const seriesKeys = q.getSeriesKeys(data);
    const checkboxWrap = el('div', { class: 'compare-checkboxes' });
    const resultWrap = el('div', { class: 'result' });
    const hint = el('p', { class: 'hint' }, [
      'Check up to ' + MAX_COMPARE + ' releases from any series to compare (cross-series supported):',
    ]);
    const selections = [];
    const checkboxes = [];

    function updateCheckboxAvailability() {
      const atLimit = selections.length >= MAX_COMPARE;
      checkboxes.forEach(function (checkbox) {
        checkbox.disabled = atLimit && !checkbox.checked;
      });
    }

    function renderResult() {
      clear(resultWrap);
      if (selections.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['Select at least one release to compare.']));
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
            updateCheckboxAvailability();
            renderResult();
          },
        });
        checkboxes.push(checkbox);
        checkboxWrap.appendChild(el('label', { class: 'compare-item' }, [checkbox, ' ' + release]));
      });
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      hint,
      checkboxWrap,
      resultWrap,
    ]));

    renderResult();
  }

  const MODES = [
    { id: 'by-release', label: 'By Release', render: renderByRelease },
    { id: 'by-app', label: 'By Application', render: renderByApp },
    { id: 'by-version', label: 'By Version', render: renderByVersion },
    { id: 'compare', label: 'Compare Releases', render: renderCompare },
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

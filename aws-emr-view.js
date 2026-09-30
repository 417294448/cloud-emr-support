window.AwsEmrView = (function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;
  const renderTable = window.DomUtils.renderTable;
  const renderStatTiles = window.DomUtils.renderStatTiles;
  const q = window.AwsEmrQueries;
  const t = window.I18n.t;

  // 描述性文本已双语化（{en, zh}）：按当前语言取值，缺中文回退英文，兼容旧的纯字符串。
  function pickLang(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    return v[window.I18n.getLang()] || v.en || '';
  }
  function desc(descMap, app) {
    return pickLang(descMap[app]);
  }

  // 支持政策横幅只做“概览”：说明文字 + 覆盖的 release 徽标 + 数据截止日。
  // 各 release 具体的生命周期日期（首次发布/标准支持结束/停止支持/生命周期终止）
  // 随版本不同，因此在“按版本查询”的结果区按所选 release 单独渲染。
  function renderSupportBanner(data) {
    const policy = data.standardSupportPolicy;
    if (!policy) return el('div');

    // 概括介绍：只展示系列级徽标（7.x series … 2.x series），不罗列 73 个 release；
    // 各 release 的具体生命周期日期见“按版本查询”。
    const seriesBadges = q.getSeriesKeys(data).map(function (series) {
      return el('span', { class: 'policy-badge' }, [series + ' series']);
    });

    const children = [
      el('div', { class: 'support-banner-head' }, [
        el('span', { class: 'support-banner-title' }, [t('supportPolicy')]),
        el('a', { class: 'support-banner-link', href: policy.source, target: '_blank' }, [t('viewOfficialSource')]),
      ]),
    ];
    if (seriesBadges.length) {
      children.push(el('div', { class: 'policy-badges' }, seriesBadges));
    }
    if (policy.note) {
      children.push(el('p', { class: 'hint' }, [pickLang(policy.note)]));
    }
    children.push(renderStatTiles([{ label: t('statDataAsOf'), value: data.dataAsOf }]));

    return el('div', { class: 'support-banner' }, children);
  }

  // 按 release 渲染生命周期日期；该 release 无逐版本数据时提示未公布。
  function renderReleaseSupportTiles(data, release) {
    const info = q.getReleaseSupportInfo(data, release);
    if (!info) {
      return el('p', { class: 'hint' }, [t('lifecycleNotPublished')]);
    }
    return renderStatTiles([
      { label: t('statInitialRelease'), value: info.initialReleaseDate },
      { label: t('statStandardSupportEnd'), value: info.standardSupportEndDate },
      { label: t('statExtendedSupportEnd'), value: info.extendedSupportEndDate },
      { label: t('statEndOfSupport'), value: info.endOfSupportStartDate },
      { label: t('statEndOfLife'), value: info.endOfLifeStartDate },
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
      // 生命周期日期随所选 release 变化。
      resultWrap.appendChild(renderReleaseSupportTiles(data, release));
      const rows = q.getReleaseRow(seriesData, release).map(function (row) {
        return [row[0], row[1], desc(descriptions, row[0])];
      });
      resultWrap.appendChild(renderTable([t('colApplication'), t('colVersion'), t('colDescription')], rows, 'release-table'));
    }

    function renderReleaseOptions() {
      clear(releaseSelectWrap);
      const seriesData = data[state.series];
      const releaseSelect = el('select', {
        class: 'release-select',
        onchange: function (e) { renderResult(e.target.value); },
      }, seriesData.releases.map(function (r) { return el('option', { value: r }, [r]); }));
      releaseSelectWrap.appendChild(el('label', null, [t('releaseLabel'), releaseSelect]));
      renderResult(seriesData.releases[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderReleaseOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, [t('seriesLabel'), seriesSelect])]),
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
      resultWrap.appendChild(renderTable([t('colRelease'), t('colVersion')], history));
    }

    function renderAppOptions() {
      clear(appSelectWrap);
      const seriesData = data[state.series];
      const appNames = q.getAppNames(seriesData);
      const appSelect = el('select', {
        class: 'app-select',
        onchange: function (e) { renderResult(e.target.value); },
      }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));
      appSelectWrap.appendChild(el('label', null, [t('applicationLabel'), appSelect]));
      renderResult(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, [t('seriesLabel'), seriesSelect])]),
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
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, [t('noReleasesForVersion')]));
        return;
      }
      resultWrap.appendChild(renderTable([t('colRelease')], releases.map(function (r) { return [r]; })));
    }

    function renderVersionOptions(app) {
      clear(versionSelectWrap);
      const seriesData = data[state.series];
      const versions = q.getDistinctVersions(seriesData, app);
      if (versions.length === 0) {
        clear(resultWrap);
        resultWrap.appendChild(el('p', null, [t('noTrackedVersionsInSeries')]));
        return;
      }
      const versionSelect = el('select', {
        class: 'version-select',
        onchange: function (e) { renderResult(app, e.target.value); },
      }, versions.map(function (v) { return el('option', { value: v }, [v]); }));
      versionSelectWrap.appendChild(el('label', null, [t('versionLabel'), versionSelect]));
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
      appSelectWrap.appendChild(el('label', null, [t('applicationLabel'), appSelect]));
      renderVersionOptions(appNames[0]);
    }

    const seriesSelect = renderSeriesSelect(seriesKeys, function (value) {
      state.series = value;
      renderAppOptions();
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, [t('seriesLabel'), seriesSelect])]),
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
    const hint = el('p', { class: 'hint' }, [t('compareHintCrossSeries', { max: MAX_COMPARE })]);
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
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, [t('selectAtLeastOne')]));
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
    { id: 'by-release', labelKey: 'modeByRelease', render: renderByRelease },
    { id: 'by-app', labelKey: 'modeByApp', render: renderByApp },
    { id: 'by-version', labelKey: 'modeByVersion', render: renderByVersion },
    { id: 'compare', labelKey: 'modeCompare', render: renderCompare },
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
      }, [t(mode.labelKey)]);
      btn.dataset.modeId = mode.id;
      tabBar.appendChild(btn);
    });

    container.appendChild(tabBar);
    container.appendChild(panel);

    selectMode(MODES[0].id);
  }

  return { mount: mount };
})();

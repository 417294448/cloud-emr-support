window.AzureHdinsightView = (function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;
  const renderTable = window.DomUtils.renderTable;
  const renderStatTiles = window.DomUtils.renderStatTiles;
  const q = window.AzureHdinsightQueries;
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

  function renderSupportBanner(data) {
    const policy = data.standardSupportPolicy;
    if (!policy) return el('div');
    return el('div', { class: 'support-banner' }, [
      el('div', { class: 'support-banner-head' }, [
        el('span', { class: 'support-banner-title' }, [t('supportPolicy')]),
        el('a', { class: 'support-banner-link', href: policy.source, target: '_blank' }, [t('viewOfficialSource')]),
      ]),
      el('p', { class: 'hint' }, [pickLang(policy.note)]),
    ]);
  }

  function releaseSelectOptions(releases) {
    return releases.map(function (r) { return el('option', { value: r }, [r]); });
  }

  // ---- Mode 1: query by release ----
  function renderByRelease(container, data) {
    clear(container);
    const releases = q.getReleases(data);
    const infoWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(release) {
      clear(infoWrap);
      clear(resultWrap);
      const info = q.getReleaseInfo(data, release);
      infoWrap.appendChild(renderStatTiles([
        { label: t('statVmOs'), value: info.vmOs },
        { label: t('statReleaseDate'), value: info.releaseDate },
        { label: t('statSupportType'), value: info.supportType },
        { label: t('statSupportExpiration'), value: info.supportExpirationDate },
        { label: t('statRetirementDate'), value: info.retirementDate },
        { label: t('statHighAvailability'), value: info.highAvailability ? t('yes') : t('no') },
      ]));
      const descriptions = data.applicationDescriptions || {};
      const rows = q.getReleaseRow(data, release).map(function (row) {
        return [row[0], row[1], desc(descriptions, row[0])];
      });
      resultWrap.appendChild(renderTable([t('colApplication'), t('colVersion'), t('colDescription')], rows, 'release-table'));
    }

    const releaseSelect = el('select', {
      class: 'release-select',
      onchange: function (e) { renderResult(e.target.value); },
    }, releaseSelectOptions(releases));

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, [t('releaseLabel'), releaseSelect])]),
      ]),
      infoWrap,
      resultWrap,
    ]));

    renderResult(releases[0]);
  }

  // ---- Mode 2: query by application ----
  function renderByApp(container, data) {
    clear(container);
    const appNames = q.getAppNames(data);
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app) {
      clear(resultWrap);
      resultWrap.appendChild(renderTable([t('colRelease'), t('colVersion')], q.getAppHistory(data, app)));
    }

    const appSelect = el('select', {
      class: 'app-select',
      onchange: function (e) { renderResult(e.target.value); },
    }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, [t('applicationLabel'), appSelect])]),
      ]),
      resultWrap,
    ]));

    renderResult(appNames[0]);
  }

  // ---- Mode 3: reverse lookup by version ----
  function renderByVersion(container, data) {
    clear(container);
    const appNames = q.getAppNames(data);
    const versionSelectWrap = el('div', { class: 'field' });
    const resultWrap = el('div', { class: 'result' });

    function renderResult(app, version) {
      clear(resultWrap);
      const releases = q.findReleasesByVersion(data, app, version);
      if (releases.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, [t('noReleasesForVersion')]));
        return;
      }
      resultWrap.appendChild(renderTable([t('colRelease')], releases.map(function (r) { return [r]; })));
    }

    function renderVersionOptions(app) {
      clear(versionSelectWrap);
      const versions = q.getDistinctVersions(data, app);
      if (versions.length === 0) {
        clear(resultWrap);
        resultWrap.appendChild(el('p', null, [t('noTrackedVersions')]));
        return;
      }
      const versionSelect = el('select', {
        class: 'version-select',
        onchange: function (e) { renderResult(app, e.target.value); },
      }, versions.map(function (v) { return el('option', { value: v }, [v]); }));
      versionSelectWrap.appendChild(el('label', null, [t('versionLabel'), versionSelect]));
      renderResult(app, versions[0]);
    }

    const appSelect = el('select', {
      class: 'app-select',
      onchange: function (e) { renderVersionOptions(e.target.value); },
    }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, [t('applicationLabel'), appSelect])]),
        versionSelectWrap,
      ]),
      resultWrap,
    ]));

    renderVersionOptions(appNames[0]);
  }

  // ---- Mode 4: compare releases ----
  function renderCompare(container, data) {
    clear(container);
    const releases = q.getReleases(data);
    const checkboxWrap = el('div', { class: 'compare-checkboxes' });
    const resultWrap = el('div', { class: 'result' });
    const selections = [];

    function renderResult() {
      clear(resultWrap);
      if (selections.length === 0) {
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, [t('selectAtLeastOne')]));
        return;
      }
      const compared = q.compareReleases(data, selections);
      resultWrap.appendChild(renderTable(compared.headers, compared.rows));
    }

    releases.forEach(function (release) {
      const checkbox = el('input', {
        type: 'checkbox',
        onchange: function (e) {
          if (e.target.checked) {
            selections.push(release);
          } else {
            const idx = selections.indexOf(release);
            if (idx !== -1) selections.splice(idx, 1);
          }
          renderResult();
        },
      });
      checkboxWrap.appendChild(el('label', { class: 'compare-item' }, [checkbox, ' ' + release]));
    });

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('p', { class: 'hint' }, [t('compareHint')]),
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

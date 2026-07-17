window.GcpDataprocView = (function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;
  const renderTable = window.DomUtils.renderTable;
  const renderStatTiles = window.DomUtils.renderStatTiles;
  const q = window.GcpDataprocQueries;

  function renderSupportBanner(data) {
    const policy = data.standardSupportPolicy;
    if (!policy) return el('div');
    return el('div', { class: 'support-banner' }, [
      el('div', { class: 'support-banner-head' }, [
        el('span', { class: 'support-banner-title' }, ['Support Policy']),
        el('a', { class: 'support-banner-link', href: policy.source, target: '_blank' }, ['View official documentation source']),
      ]),
      el('p', { class: 'hint' }, [policy.note]),
    ]);
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
        { label: 'OS images', value: info.osImages.join(', ') },
        { label: 'Release stage', value: info.releaseStage },
        { label: 'Released on', value: info.releasedOn },
        { label: 'Last updated', value: info.lastUpdated },
        { label: 'Supported until', value: info.supportedUntil },
        { label: 'Available until', value: info.availableUntil },
      ]));
      if (info.additionalNotes) {
        infoWrap.appendChild(el('p', { class: 'hint' }, [info.additionalNotes]));
      }
      const descriptions = data.applicationDescriptions || {};
      const rows = q.getReleaseRow(data, release).map(function (row) {
        return [row[0], row[1], descriptions[row[0]] || ''];
      });
      resultWrap.appendChild(renderTable(['Application', 'Version', 'Description'], rows, 'release-table'));
    }

    const releaseSelect = el('select', {
      class: 'release-select',
      onchange: function (e) { renderResult(e.target.value); },
    }, releases.map(function (r) { return el('option', { value: r }, [r]); }));

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, ['Release: ', releaseSelect])]),
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
      resultWrap.appendChild(renderTable(['Release', 'Version'], q.getAppHistory(data, app)));
    }

    const appSelect = el('select', {
      class: 'app-select',
      onchange: function (e) { renderResult(e.target.value); },
    }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, ['Application: ', appSelect])]),
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
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['No releases found containing this version.']));
        return;
      }
      resultWrap.appendChild(renderTable(['Release'], releases.map(function (r) { return [r]; })));
    }

    function renderVersionOptions(app) {
      clear(versionSelectWrap);
      const versions = q.getDistinctVersions(data, app);
      if (versions.length === 0) {
        clear(resultWrap);
        resultWrap.appendChild(el('p', null, ['This application has no tracked versions.']));
        return;
      }
      const versionSelect = el('select', {
        class: 'version-select',
        onchange: function (e) { renderResult(app, e.target.value); },
      }, versions.map(function (v) { return el('option', { value: v }, [v]); }));
      versionSelectWrap.appendChild(el('label', null, ['Version: ', versionSelect]));
      renderResult(app, versions[0]);
    }

    const appSelect = el('select', {
      class: 'app-select',
      onchange: function (e) { renderVersionOptions(e.target.value); },
    }, appNames.map(function (a) { return el('option', { value: a }, [a]); }));

    container.appendChild(el('div', { class: 'query-panel' }, [
      el('div', { class: 'filters' }, [
        el('div', { class: 'field' }, [el('label', null, ['Application: ', appSelect])]),
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
        resultWrap.appendChild(el('p', { class: 'empty-msg' }, ['Select at least one release to compare.']));
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
      el('p', { class: 'hint' }, ['Check releases to compare:']),
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

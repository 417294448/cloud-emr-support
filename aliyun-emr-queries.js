(function (root) {
  function getSeriesKeys(data) {
    return Object.keys(data)
      .filter(function (k) { return /^EMR-\d+\.x$/.test(k); })
      .sort(function (a, b) { return parseFloat(b.replace('EMR-', '')) - parseFloat(a.replace('EMR-', '')); });
  }

  function getAppNames(seriesData) {
    return Object.keys(seriesData.applications).sort();
  }

  function getReleaseRow(seriesData, release) {
    return getAppNames(seriesData).map(function (app) {
      return [app, seriesData.applications[app][release]];
    });
  }

  function getAppHistory(seriesData, app) {
    return seriesData.releases.map(function (release) {
      return [release, seriesData.applications[app][release]];
    });
  }

  function getDistinctVersions(seriesData, app) {
    const versions = [];
    seriesData.releases.forEach(function (release) {
      const v = seriesData.applications[app][release];
      if (v && versions.indexOf(v) === -1) versions.push(v);
    });
    return versions;
  }

  function findReleasesByVersion(seriesData, app, version) {
    return seriesData.releases.filter(function (release) {
      return seriesData.applications[app][release] === version;
    });
  }

  function compareReleases(data, selections) {
    const appNamesSet = {};
    selections.forEach(function (selection) {
      getAppNames(data[selection.series]).forEach(function (app) {
        appNamesSet[app] = true;
      });
    });
    const apps = Object.keys(appNamesSet).sort();
    const headers = ['Application'].concat(selections.map(function (s) { return s.release; }));
    const rows = apps.map(function (app) {
      const row = [app];
      selections.forEach(function (selection) {
        const seriesData = data[selection.series];
        row.push(seriesData.applications[app] ? seriesData.applications[app][selection.release] : null);
      });
      return row;
    });
    return { headers: headers, rows: rows };
  }

  function getReleaseLifecycle(data, release) {
    return (data.releaseLifecycle && data.releaseLifecycle[release]) || null;
  }

  const AliyunEmrQueries = {
    getSeriesKeys: getSeriesKeys,
    getAppNames: getAppNames,
    getReleaseRow: getReleaseRow,
    getAppHistory: getAppHistory,
    getDistinctVersions: getDistinctVersions,
    findReleasesByVersion: findReleasesByVersion,
    compareReleases: compareReleases,
    getReleaseLifecycle: getReleaseLifecycle,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AliyunEmrQueries;
  } else {
    root.AliyunEmrQueries = AliyunEmrQueries;
  }
})(typeof window !== 'undefined' ? window : globalThis);

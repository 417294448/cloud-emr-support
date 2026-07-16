(function (root) {
  function getSeriesKeys(data) {
    return Object.keys(data)
      .filter(function (k) { return k !== 'standardSupportPolicy'; })
      .sort(function (a, b) { return parseFloat(b) - parseFloat(a); });
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
    const headers = ['应用'].concat(selections.map(function (s) { return s.release; }));
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

  const AwsEmrQueries = {
    getSeriesKeys: getSeriesKeys,
    getAppNames: getAppNames,
    getReleaseRow: getReleaseRow,
    getAppHistory: getAppHistory,
    getDistinctVersions: getDistinctVersions,
    findReleasesByVersion: findReleasesByVersion,
    compareReleases: compareReleases,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AwsEmrQueries;
  } else {
    root.AwsEmrQueries = AwsEmrQueries;
  }
})(typeof window !== 'undefined' ? window : globalThis);

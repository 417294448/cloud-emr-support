(function (root) {
  function getReleases(data) {
    return data.releases.slice();
  }

  function getAppNames(data) {
    return Object.keys(data.applications).sort();
  }

  function getReleaseRow(data, release) {
    return getAppNames(data).map(function (app) {
      return [app, data.applications[app][release]];
    });
  }

  function getReleaseInfo(data, release) {
    return data.releaseInfo[release];
  }

  function getAppHistory(data, app) {
    return data.releases.map(function (release) {
      return [release, data.applications[app][release]];
    });
  }

  function getDistinctVersions(data, app) {
    const versions = [];
    data.releases.forEach(function (release) {
      const v = data.applications[app][release];
      if (v && versions.indexOf(v) === -1) versions.push(v);
    });
    return versions;
  }

  function findReleasesByVersion(data, app, version) {
    return data.releases.filter(function (release) {
      return data.applications[app][release] === version;
    });
  }

  function compareReleases(data, releases) {
    const apps = getAppNames(data);
    const headers = ['Application'].concat(releases);
    const rows = apps.map(function (app) {
      const row = [app];
      releases.forEach(function (release) {
        row.push(data.applications[app][release]);
      });
      return row;
    });
    return { headers: headers, rows: rows };
  }

  const AzureHdinsightQueries = {
    getReleases: getReleases,
    getAppNames: getAppNames,
    getReleaseRow: getReleaseRow,
    getReleaseInfo: getReleaseInfo,
    getAppHistory: getAppHistory,
    getDistinctVersions: getDistinctVersions,
    findReleasesByVersion: findReleasesByVersion,
    compareReleases: compareReleases,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AzureHdinsightQueries;
  } else {
    root.AzureHdinsightQueries = AzureHdinsightQueries;
  }
})(typeof window !== 'undefined' ? window : globalThis);

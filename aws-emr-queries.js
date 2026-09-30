(function (root) {
  function getSeriesKeys(data) {
    return Object.keys(data)
      .filter(function (k) { return /^\d+\.x$/.test(k); })
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

  // ---- 逐版本支持生命周期 ----
  // standardSupportPolicy.releases 是 release -> {initialReleaseDate,
  // standardSupportEndDate, extendedSupportEndDate, endOfSupportStartDate,
  // endOfLifeStartDate} 的映射，各 release 日期不同（官方逐版本表）。

  function normalizePolicyKey(key) {
    return String(key).toLowerCase().replace(/\s*\[lts\]\s*$/, '').trim();
  }

  function buildPolicyMap(policy) {
    const map = {};
    const releases = policy && policy.releases;
    // 兼容早期把 releases 拍平成数组的旧结构。
    if (!releases || Array.isArray(releases)) return map;
    Object.keys(releases).forEach(function (key) {
      map[normalizePolicyKey(key)] = releases[key];
    });
    return map;
  }

  // 把 emr-7.13.0 / emr-spark-8.1 等 release 标签映射到政策表的候选键，
  // 从精确到宽泛依次尝试：全名 → 去掉 emr- 前缀 → 去掉补丁号 → 主版本 N.x。
  function releaseCandidates(release) {
    const r = String(release || '').toLowerCase();
    const candidates = [r];
    // 全名去掉补丁号：emr-7.13.0 -> emr-7.13，emr-spark-8.1.0 -> emr-spark-8.1
    const noPatchFull = r.replace(/\.\d+$/, '');
    if (noPatchFull !== r) candidates.push(noPatchFull);
    const stripped = r.replace(/^emr-/, '');
    if (stripped !== r) candidates.push(stripped);
    const noPatchStripped = stripped.replace(/\.\d+$/, '');
    if (noPatchStripped !== stripped) candidates.push(noPatchStripped);
    const major = stripped.split('.')[0];
    if (major) candidates.push(major + '.x');
    return candidates;
  }

  function getReleaseSupportInfo(data, release) {
    const map = buildPolicyMap(data && data.standardSupportPolicy);
    const candidates = releaseCandidates(release);
    for (let i = 0; i < candidates.length; i++) {
      if (map[candidates[i]]) return map[candidates[i]];
    }
    return null;
  }

  // 政策表中列出的 release 键（用于横幅徽标），保持官方顺序。
  function getSupportReleases(data) {
    const policy = data && data.standardSupportPolicy;
    const releases = policy && policy.releases;
    if (!releases || Array.isArray(releases)) return [];
    return Object.keys(releases);
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

  const AwsEmrQueries = {
    getSeriesKeys: getSeriesKeys,
    getAppNames: getAppNames,
    getReleaseRow: getReleaseRow,
    getAppHistory: getAppHistory,
    getDistinctVersions: getDistinctVersions,
    findReleasesByVersion: findReleasesByVersion,
    compareReleases: compareReleases,
    getReleaseSupportInfo: getReleaseSupportInfo,
    getSupportReleases: getSupportReleases,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AwsEmrQueries;
  } else {
    root.AwsEmrQueries = AwsEmrQueries;
  }
})(typeof window !== 'undefined' ? window : globalThis);

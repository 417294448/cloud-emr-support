// 界面文案的轻量 i18n：负责语言存取、字典查询，并在切换语言时通知 app 重渲染。
// 仅覆盖 UI 静态文案；组件名称、版本号、日期等数据值不做翻译。
window.I18n = (function () {
  var STORAGE_KEY = 'cloud-emr-lang';
  var LANGS = ['en', 'zh'];

  var DICT = {
    en: {
      docTitle: 'Cloud EMR Version Intelligence Console',
      headerTitle: 'Cloud EMR Version Intelligence Console',
      headerSubtitle: 'Version & Support Lifecycle Tracking for AWS EMR, Azure HDInsight, GCP Dataproc & Alibaba Cloud EMR',
      themeToggleAria: 'Toggle day and night theme',
      langToggleAria: 'Switch interface language',
      homeLinkAria: 'Back to home',
      comingSoon: 'Not yet supported. Coming soon.',
      supportPolicy: 'Support Policy',
      viewOfficialSource: 'View official documentation source',
      seriesLabel: 'Series: ',
      releaseLabel: 'Release: ',
      applicationLabel: 'Application: ',
      versionLabel: 'Version: ',
      colApplication: 'Application',
      colVersion: 'Version',
      colDescription: 'Description',
      colRelease: 'Release',
      modeByRelease: 'By Release',
      modeByApp: 'By Application',
      modeByVersion: 'By Version',
      modeCompare: 'Compare Releases',
      compareHintCrossSeries: 'Check up to {max} releases from any series to compare (cross-series supported):',
      compareHint: 'Check releases to compare:',
      selectAtLeastOne: 'Select at least one release to compare.',
      noReleasesForVersion: 'No releases found containing this version.',
      noTrackedVersionsInSeries: 'This application has no tracked versions in this series.',
      noTrackedVersions: 'This application has no tracked versions.',
      lifecycleNotPublished: 'Lifecycle dates not yet published for this release.',
      statInitialRelease: 'Initial release',
      statStandardSupportEnd: 'Standard support end',
      statEndOfSupport: 'End of support',
      statEndOfLife: 'End of life',
      statVmOs: 'VM OS',
      statReleaseDate: 'Release date',
      statSupportType: 'Support type',
      statSupportExpiration: 'Support expiration',
      statRetirementDate: 'Retirement date',
      statHighAvailability: 'High availability',
      statOsImages: 'OS images',
      statReleaseStage: 'Release stage',
      statReleasedOn: 'Released on',
      statLastUpdated: 'Last updated',
      statSupportedUntil: 'Supported until',
      statAvailableUntil: 'Available until',
      statDataAsOf: 'Data as of',
      yes: 'Yes',
      no: 'No',
    },
    zh: {
      docTitle: 'Cloud EMR 版本情报控制台',
      headerTitle: 'Cloud EMR 版本情报控制台',
      headerSubtitle: 'AWS EMR、Azure HDInsight、GCP Dataproc 与阿里云 EMR 的版本与支持生命周期跟踪',
      themeToggleAria: '切换昼夜主题',
      langToggleAria: '切换界面语言',
      homeLinkAria: '返回首页',
      comingSoon: '暂未支持，敬请期待。',
      supportPolicy: '支持策略',
      viewOfficialSource: '查看官方文档来源',
      seriesLabel: '系列：',
      releaseLabel: '版本：',
      applicationLabel: '组件：',
      versionLabel: '版本号：',
      colApplication: '组件',
      colVersion: '版本',
      colDescription: '描述',
      colRelease: '发行版本',
      modeByRelease: '按版本查询',
      modeByApp: '按组件查询',
      modeByVersion: '按版本号反查',
      modeCompare: '版本对比',
      compareHintCrossSeries: '最多可勾选 {max} 个版本进行对比（支持跨系列）：',
      compareHint: '勾选要对比的版本：',
      selectAtLeastOne: '请至少勾选一个版本进行对比。',
      noReleasesForVersion: '未找到包含该版本号的发行版本。',
      noTrackedVersionsInSeries: '该组件在此系列中没有已跟踪的版本。',
      noTrackedVersions: '该组件没有已跟踪的版本。',
      lifecycleNotPublished: '该版本的生命周期日期尚未公布。',
      statInitialRelease: '首次发布',
      statStandardSupportEnd: '标准支持结束',
      statEndOfSupport: '停止支持',
      statEndOfLife: '生命周期终止',
      statVmOs: '虚拟机操作系统',
      statReleaseDate: '发布日期',
      statSupportType: '支持类型',
      statSupportExpiration: '支持到期',
      statRetirementDate: '退役日期',
      statHighAvailability: '高可用',
      statOsImages: '操作系统镜像',
      statReleaseStage: '发布阶段',
      statReleasedOn: '发布时间',
      statLastUpdated: '最近更新',
      statSupportedUntil: '支持截止',
      statAvailableUntil: '可用截止',
      statDataAsOf: '数据截至',
      yes: '是',
      no: '否',
    },
  };

  var listeners = [];

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) { /* localStorage 不可用时退回浏览器语言探测 */ }
    var nav = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || 'en';
    return String(nav).toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  var current = detect();

  function getLang() {
    return current;
  }

  function t(key, vars) {
    var table = DICT[current] || DICT.en;
    var str = table[key];
    if (str === undefined) str = DICT.en[key];
    if (str === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split('{' + k + '}').join(vars[k]);
      });
    }
    return str;
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1 || lang === current) return;
    current = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* 忽略持久化失败 */ }
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    listeners.forEach(function (fn) { fn(lang); });
  }

  function toggle() {
    setLang(current === 'en' ? 'zh' : 'en');
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  // 初始化 <html lang>，与主题脚本同理尽早执行避免闪烁。
  document.documentElement.setAttribute('lang', current === 'zh' ? 'zh-CN' : 'en');

  return {
    t: t,
    getLang: getLang,
    setLang: setLang,
    toggle: toggle,
    onChange: onChange,
  };
})();

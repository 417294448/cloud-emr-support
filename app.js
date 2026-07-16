(function () {
  const el = window.DomUtils.el;
  const clear = window.DomUtils.clear;

  const PROVIDERS = [
    { id: 'aws', label: 'AWS EMR', dataKey: 'aws', view: window.AwsEmrView },
    { id: 'azure', label: 'Azure HDInsight', dataKey: 'azure', view: null },
    { id: 'gcp', label: 'GCP Dataproc', dataKey: 'gcp', view: null },
  ];

  function init() {
    const cloudData = window.CLOUD_DATA || {};
    const tabBar = document.getElementById('provider-tab-bar');
    const panel = document.getElementById('provider-panel');

    function selectProvider(providerId) {
      Array.prototype.forEach.call(tabBar.children, function (btn) {
        btn.classList.toggle('active', btn.dataset.providerId === providerId);
      });
      const provider = PROVIDERS.filter(function (p) { return p.id === providerId; })[0];
      const data = cloudData[provider.dataKey];
      clear(panel);
      if (!data || !provider.view) {
        panel.appendChild(el('p', { class: 'coming-soon' }, ['暂不支持，敬请期待。']));
        return;
      }
      provider.view.mount(panel, data);
    }

    PROVIDERS.forEach(function (provider) {
      const available = Boolean(cloudData[provider.dataKey]) && Boolean(provider.view);
      const btn = el('button', {
        class: available ? 'provider-tab-btn' : 'provider-tab-btn disabled',
        onclick: function () {
          if (!available) return;
          selectProvider(provider.id);
        },
      }, [provider.label]);
      btn.dataset.providerId = provider.id;
      tabBar.appendChild(btn);
    });

    const firstAvailable = PROVIDERS.filter(function (p) {
      return cloudData[p.dataKey] && p.view;
    })[0];
    if (firstAvailable) {
      selectProvider(firstAvailable.id);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

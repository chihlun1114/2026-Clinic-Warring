(function () {
  const root = document.getElementById('chart-4');
  if (!root) return;

  const data = [
    { key: 'other', name: '其他專業機構', growth: 129.9, start: 1082, end: 2487, delta: 1405 },
    { key: 'dental', name: '牙醫診所', growth: 69.4, start: 1003, end: 1699, delta: 696 },
    { key: 'hospital', name: '醫院', growth: 58.0, start: 4541, end: 7174, delta: 2633 },
    { key: 'chinese', name: '中醫診所', growth: 36.2, start: 232, end: 316, delta: 84 },
    { key: 'west', name: '西醫診所', growth: 32.0, start: 1206, end: 1592, delta: 386 }
  ];

  const panel = document.getElementById('chart4-panel');
  const detail = document.getElementById('chart4-detail');
  const mobileDetail = document.getElementById('chart4-mobile-detail');
  const fmt = n => n.toLocaleString('zh-TW');

  function getItem(key) {
    return data.find(d => d.key === key);
  }

  function showDesktopDetail(item, e) {
    detail.innerHTML =
      '<strong>' + item.name + '</strong>' +
      '2014：' + fmt(item.start) + ' 億<br>' +
      '2024：' + fmt(item.end) + ' 億<br>' +
      '增加：' + fmt(item.delta) + ' 億';
    detail.style.left = e.clientX + 'px';
    detail.style.top = e.clientY + 'px';
    detail.style.opacity = 1;
  }

  function moveDesktopDetail(e) {
    detail.style.left = e.clientX + 'px';
    detail.style.top = e.clientY + 'px';
  }

  function hideDesktopDetail() {
    detail.style.opacity = 0;
  }

  function showMobileDetail(item) {
    mobileDetail.innerHTML =
      '<strong>' + item.name + '</strong>' +
      '<span>2014：' + fmt(item.start) + ' 億</span>' +
      '<span>2024：' + fmt(item.end) + ' 億</span>' +
      '<span>增加：' + fmt(item.delta) + ' 億</span>';
  }

  root.querySelectorAll('.data-row').forEach(row => {
    const item = getItem(row.dataset.key);
    row.addEventListener('mouseenter', e => {
      if (window.matchMedia('(max-width:768px)').matches) return;
      showDesktopDetail(item, e);
    });
    row.addEventListener('mousemove', e => {
      if (window.matchMedia('(max-width:768px)').matches) return;
      moveDesktopDetail(e);
    });
    row.addEventListener('mouseleave', hideDesktopDetail);
    row.addEventListener('click', () => showMobileDetail(item));
  });

  let played = false;
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        panel.classList.add('is-visible');
      }
    });
  }, { threshold: 0.25 }).observe(panel);
})();

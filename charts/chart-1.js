(function () {
  const root = document.getElementById('chart-1');
  if (!root) return;

  const data = [
    { key: 'west', name: '西醫診所', growth: 25.2, start: 9948, end: 12454, delta: 2506 },
    { key: 'dental', name: '牙醫診所', growth: 17.7, start: 6029, end: 7097, delta: 1068 },
    { key: 'chinese', name: '中醫診所', growth: 46.5, start: 2900, end: 4249, delta: 1349 }
  ];

  const panel = document.getElementById('chart1-panel');
  const detail = document.getElementById('chart1-detail');
  const mobileDetail = document.getElementById('chart1-mobile-detail');
  const fmt = n => n.toLocaleString('zh-TW');

  function getItem(key) {
    return data.find(d => d.key === key);
  }

  function showDesktopDetail(item, e) {
    detail.innerHTML =
      '<strong>' + item.name + '</strong>' +
      '2005：' + fmt(item.start) + ' 家<br>' +
      '2024：' + fmt(item.end) + ' 家<br>' +
      '增加：' + fmt(item.delta) + ' 家';
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
      '<span>2005：' + fmt(item.start) + ' 家</span>' +
      '<span>2024：' + fmt(item.end) + ' 家</span>' +
      '<span>增加：' + fmt(item.delta) + ' 家</span>';
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

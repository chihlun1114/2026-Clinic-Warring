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

  const COIN_ORANGE = 'images/coin.png?v=5';
  const COIN_GRAY = 'images/coin2.png?v=5';
  const BASE_COINS = 6;
  const MAX_GROWTH = data[0].growth;
  const tracks = [...root.querySelectorAll('.coin-track')];

  function makeCoinRow(src) {
    const row = document.createElement('div');
    row.className = 'coin-row';
    for (let i = 0; i < BASE_COINS; i++) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      row.appendChild(img);
    }
    return row;
  }

  tracks.forEach(track => {
    const stack = document.createElement('div');
    stack.className = 'coin-stack';

    const gray = document.createElement('div');
    gray.className = 'coin-layer coin-layer-gray';
    gray.appendChild(makeCoinRow(COIN_GRAY));

    const orange = document.createElement('div');
    orange.className = 'coin-layer coin-layer-orange';
    orange.appendChild(makeCoinRow(COIN_ORANGE));

    stack.appendChild(gray);
    stack.appendChild(orange);
    track.appendChild(stack);
  });

  function setBarWidths() {
    const baseRow = tracks[0] && tracks[0].querySelector('.coin-layer-gray .coin-row');
    if (!baseRow) return;
    const fullW = baseRow.scrollWidth;
    if (!fullW) return;
    data.forEach((item, i) => {
      const fill = (item.growth / MAX_GROWTH) * fullW;
      tracks[i].style.setProperty('--stack', fullW + 'px');
      tracks[i].style.setProperty('--fill', fill + 'px');
      tracks[i].parentElement.style.setProperty('--stack', fullW + 'px');
      tracks[i].parentElement.style.setProperty('--fill', fill + 'px');
    });
  }

  function whenCoinsReady(cb) {
    const imgs = [...root.querySelectorAll('.coin-track img')];
    Promise.all(imgs.map(img => (img.decode ? img.decode() : Promise.resolve()).catch(() => {})))
      .then(cb);
  }

  whenCoinsReady(setBarWidths);
  window.addEventListener('resize', setBarWidths);

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

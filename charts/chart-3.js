(function () {
  const root = document.getElementById('chart-3');
  if (!root) return;

  const data = [
    { name: '精神科', start: 204, end: 426, change: 108.8, accent: true },
    { name: '泌尿科', start: 62, end: 120, change: 93.5, accent: true },
    { name: '神經科', start: 105, end: 179, change: 70.5 },
    { name: '復健科', start: 298, end: 499, change: 67.4, accent: true },
    { name: '骨科', start: 328, end: 503, change: 53.4 },
    { name: '整形外科', start: 213, end: 281, change: 31.9 },
    { name: '中醫一般科', start: 3380, end: 4207, change: 24.5 },
    { name: '皮膚科', start: 463, end: 540, change: 16.6 },
    { name: '內科', start: 1597, end: 1835, change: 14.9 },
    { name: '牙醫一般科', start: 6513, end: 7123, change: 9.4 },
    { name: '兒科', start: 1604, end: 1414, change: -11.8 },
    { name: '婦產科', start: 835, end: 713, change: -14.6 }
  ];

  const ORANGE = '#f55000';
  const GRAY_BAR = '#5d5d60';
  const GRAY_DOWN = '#77777a';
  const GRAY_NUM = '#4a4e52';
  const MIN = -24;
  const MAX = 120;
  const RANGE = MAX - MIN;
  const ZERO = (0 - MIN) / RANGE * 100;
  const panel = document.getElementById('chart3-panel');
  const bars = root.querySelector('.chart3-bars');
  const detail = document.getElementById('chart3-detail');
  const mobileDetail = document.getElementById('chart3-mobile-detail');
  const fmt = n => n.toLocaleString('zh-TW');

  function rowColor(d) {
    if (d.accent) return ORANGE;
    return d.change < 0 ? GRAY_DOWN : GRAY_BAR;
  }

  function valueColor(d) {
    return d.accent ? ORANGE : GRAY_NUM;
  }

  function barPct(change) {
    return Math.abs(change) / RANGE * 100;
  }

  function showDesktopDetail(d, e) {
    const diff = d.end - d.start;
    detail.innerHTML =
      '<strong>' + d.name + '</strong>' +
      '2012：' + fmt(d.start) + ' 家<br>' +
      '2024：' + fmt(d.end) + ' 家<br>' +
      (diff >= 0 ? '增加：' : '減少：') + fmt(Math.abs(diff)) + ' 家';
    detail.style.left = e.clientX + 'px';
    detail.style.top = e.clientY + 'px';
    detail.style.opacity = 1;
  }

  function hideDesktopDetail() {
    detail.style.opacity = 0;
  }

  function showMobileDetail(d) {
    const diff = d.end - d.start;
    mobileDetail.innerHTML =
      '<strong>' + d.name + '</strong>' +
      '<span>2012：' + fmt(d.start) + ' 家</span>' +
      '<span>2024：' + fmt(d.end) + ' 家</span>' +
      '<span>' + (diff >= 0 ? '增加：' : '減少：') + fmt(Math.abs(diff)) + ' 家</span>';
  }

  bars.style.setProperty('--zero', ZERO + '%');

  data.forEach((d, i) => {
    const negative = d.change < 0;
    const row = document.createElement('div');
    row.className = 'data-row row-' + (i + 1) + (negative ? ' is-negative' : '');
    row.style.setProperty('--bar', barPct(d.change) + '%');
    row.style.setProperty('--row-color', rowColor(d));
    row.style.setProperty('--delay', (0.08 + i * 0.06).toFixed(2) + 's');
    row.style.setProperty('--value-delay', (0.55 + i * 0.06).toFixed(2) + 's');

    const label = document.createElement('div');
    label.className = 'row-label';
    label.textContent = d.name;

    const zone = document.createElement('div');
    zone.className = 'measure-zone';

    const zero = document.createElement('span');
    zero.className = 'zero-line';
    zone.appendChild(zero);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'brush-svg');
    svg.setAttribute('viewBox', '0 0 1424.26 139.4');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#brush01');
    svg.appendChild(use);
    zone.appendChild(svg);

    const value = document.createElement('div');
    value.className = 'row-value';
    value.style.color = valueColor(d);
    value.textContent = (d.change > 0 ? '+' : '') + d.change.toFixed(1) + '%';

    row.append(label, zone, value);

    row.addEventListener('mouseenter', e => {
      if (window.matchMedia('(max-width:768px)').matches) return;
      showDesktopDetail(d, e);
    });
    row.addEventListener('mousemove', e => {
      if (window.matchMedia('(max-width:768px)').matches) return;
      showDesktopDetail(d, e);
    });
    row.addEventListener('mouseleave', hideDesktopDetail);
    row.addEventListener('click', () => showMobileDetail(d));

    bars.appendChild(row);
  });

  let played = false;
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        panel.classList.add('is-visible');
      }
    });
  }, { threshold: 0.2 }).observe(panel);
})();

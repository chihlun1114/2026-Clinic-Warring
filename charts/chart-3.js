(function () {
  const root = document.getElementById('chart-3');
  if (!root) return;

  const data = [
    { name: '精神科', start: 204, end: 426, change: 108.8, group: 'fast' },
    { name: '泌尿科', start: 62, end: 120, change: 93.5, group: 'fast' },
    { name: '神經科', start: 105, end: 179, change: 70.5, group: 'fast' },
    { name: '復健科', start: 298, end: 499, change: 67.4, group: 'fast' },
    { name: '骨科', start: 328, end: 503, change: 53.4, group: 'fast' },
    { name: '整形外科', start: 213, end: 281, change: 31.9, group: 'normal' },
    { name: '中醫一般科', start: 3380, end: 4207, change: 24.5, group: 'normal' },
    { name: '皮膚科', start: 463, end: 540, change: 16.6, group: 'normal' },
    { name: '內科', start: 1597, end: 1835, change: 14.9, group: 'normal' },
    { name: '牙醫一般科', start: 6513, end: 7123, change: 9.4, group: 'normal' },
    { name: '兒科', start: 1604, end: 1414, change: -11.8, group: 'down' },
    { name: '婦產科', start: 835, end: 713, change: -14.6, group: 'down' }
  ];

  const svg = document.getElementById('chart3-svg');
  const tooltip = document.getElementById('chart3-tooltip');
  const wrap = root.querySelector('.chart-wrap');
  const mobileDetail = document.getElementById('chart3-mobile-detail');

  const W = 1040;
  const H = 700;
  const m = { top: 36, right: 100, bottom: 54, left: 165 };
  const innerW = W - m.left - m.right;
  const min = -24;
  const max = 120;
  const rowH = 48;
  const barH = 23;
  const x = v => m.left + (v - min) / (max - min) * innerW;

  function el(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (text) e.textContent = text;
    return e;
  }

  function colorFor(d) {
    return d.group === 'fast' ? '#e2762b' : (d.group === 'down' ? '#d6453c' : '#3d7fb8');
  }

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function updateMobileDetail(d) {
    const diff = d.end - d.start;
    mobileDetail.style.setProperty('--detailColor', colorFor(d));
    mobileDetail.innerHTML =
      '<div class="title">' + d.name + '</div>' +
      '<div class="stats">' +
        '<div><span class="label">2012</span><span class="value">' + d.start.toLocaleString('zh-TW') + ' 家</span></div>' +
        '<div><span class="label">2024</span><span class="value">' + d.end.toLocaleString('zh-TW') + ' 家</span></div>' +
        '<div><span class="label">實際增減</span><span class="value">' + (diff > 0 ? '+' : '') + diff.toLocaleString('zh-TW') + ' 家</span></div>' +
      '</div>';
  }

  [-20, 0, 20, 40, 60, 80, 100, 120].forEach(v => {
    const xx = x(v);
    svg.appendChild(el('line', {
      x1: xx, y1: m.top - 10, x2: xx, y2: H - m.bottom,
      class: v === 0 ? 'zero' : 'grid'
    }));
    svg.appendChild(el('text', {
      x: xx, y: H - 20, 'text-anchor': 'middle', class: 'axis'
    }, (v > 0 ? '+' : '') + v + '%'));
  });

  data.forEach((d, i) => {
    const cy = m.top + i * rowH + 18;
    const color = colorFor(d);
    const x0 = x(Math.min(0, d.change));
    const x1 = x(Math.max(0, d.change));
    const w = Math.max(1, x1 - x0);

    svg.appendChild(el('text', {
      x: m.left - 18, y: cy + 5, 'text-anchor': 'end', class: 'name'
    }, d.name));

    svg.appendChild(el('rect', {
      x: x0, y: cy - barH / 2, width: w, height: barH, fill: color,
      class: 'bar ' + (d.change < 0 ? 'negative' : ''),
      style: '--delay:' + (i * 0.045).toFixed(2) + 's'
    }));

    svg.appendChild(el('text', {
      x: W - 14, y: cy + 6, 'text-anchor': 'end', class: 'change', fill: color
    }, (d.change > 0 ? '+' : '') + d.change.toFixed(1) + '%'));

    const hit = el('rect', {
      x: m.left - 155, y: cy - rowH / 2, width: W - m.left + 125, height: rowH,
      fill: 'transparent', style: 'cursor:pointer'
    });

    hit.addEventListener('mouseenter', () => {
      if (isMobile()) return;
      const diff = d.end - d.start;
      tooltip.innerHTML =
        '<strong>' + d.name + '</strong>' +
        '2012：' + d.start.toLocaleString('zh-TW') + ' 家<br>' +
        '2024：' + d.end.toLocaleString('zh-TW') + ' 家<br>' +
        '增減：' + (diff > 0 ? '+' : '') + diff.toLocaleString('zh-TW') + ' 家<br>' +
        '成長率：' + (d.change > 0 ? '+' : '') + d.change.toFixed(1) + '%';
      tooltip.style.opacity = 1;
    });

    hit.addEventListener('mousemove', e => {
      if (isMobile()) return;
      const r = wrap.getBoundingClientRect();
      tooltip.style.left = (e.clientX - r.left) + 'px';
      tooltip.style.top = (e.clientY - r.top) + 'px';
    });

    hit.addEventListener('mouseleave', () => {
      tooltip.style.opacity = 0;
    });

    hit.addEventListener('click', () => {
      updateMobileDetail(d);
    });

    svg.appendChild(hit);
  });

  let played = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        root.classList.add('is-visible');
      }
    });
  }, { threshold: 0.2 });
  obs.observe(root);
})();

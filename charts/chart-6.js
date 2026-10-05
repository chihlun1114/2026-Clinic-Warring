(function () {
  const root = document.getElementById('chart-6');
  if (!root) return;

  const points = [
    { city: '連江縣', value: 1.47 },
    { city: '金門縣', value: 4.26 },
    { city: '嘉義縣', value: 5.74 },
    { city: '苗栗縣', value: 7.0 },
    { city: '桃園市', value: 7.09 },
    { city: '臺南市', value: 10.26 },
    { city: '高雄市', value: 10.51 },
    { city: '臺中市', value: 11.68 },
    { city: '臺北市', value: 12.84 },
    { city: '嘉義市', value: 13.99 }
  ];
  const topNames = new Set(['嘉義市', '臺北市', '臺中市', '高雄市', '臺南市']);
  const avg = 9.38;

  const svg = document.getElementById('chart6-svg');
  const tooltip = document.getElementById('chart6-tooltip');
  const wrap = root.querySelector('.chart-wrap');

  const W = 1040;
  const H = 320;
  const m = { top: 54, right: 42, bottom: 62, left: 56 };
  const innerW = W - m.left - m.right;
  const min = 1;
  const max = 14.5;
  const x = v => m.left + (v - min) / (max - min) * innerW;

  const yMap = {
    '連江縣': 182,
    '金門縣': 198,
    '嘉義縣': 190,
    '苗栗縣': 142,
    '桃園市': 166,
    '臺南市': 176,
    '高雄市': 154,
    '臺中市': 170,
    '臺北市': 202,
    '嘉義市': 188
  };

  function el(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (text) e.textContent = text;
    return e;
  }

  for (let v = 2; v <= 14; v += 2) {
    const xx = x(v);
    svg.appendChild(el('line', { x1: xx, y1: m.top, x2: xx, y2: H - m.bottom, class: 'grid' }));
    svg.appendChild(el('text', { x: xx, y: H - 26, 'text-anchor': 'middle', class: 'axis' }, String(v)));
  }
  svg.appendChild(el('text', { x: m.left, y: H - 6, class: 'axis' }, '每萬人診所數'));

  const ax = x(avg);
  svg.appendChild(el('line', { x1: ax, y1: m.top - 12, x2: ax, y2: H - m.bottom + 12, class: 'avg-line' }));
  svg.appendChild(el('text', { x: ax + 8, y: m.top - 18, class: 'avg-label' }, '全國平均 ' + avg.toFixed(2)));

  svg.appendChild(el('text', { x: m.left + 2, y: m.top + 18, class: 'direction' }, '較低'));
  svg.appendChild(el('text', { x: W - m.right - 26, y: m.top + 18, 'text-anchor': 'end', class: 'direction' }, '較高'));

  points.forEach(d => {
    const xx = x(d.value);
    const yy = yMap[d.city];
    const isTop = topNames.has(d.city);
    const color = isTop ? '#f45500' : '#7ea9a3';

    const g = el('g', { class: 'dot' });
    g.appendChild(el('circle', {
      cx: xx, cy: yy, r: 11, fill: color, stroke: '#f6f4ef', 'stroke-width': 3
    }));

    let ty = yy - 16;
    if (d.city === '苗栗縣') ty = yy - 20;
    if (d.city === '桃園市') ty = yy + 24;
    if (d.city === '連江縣') ty = yy - 18;
    if (d.city === '臺北市') ty = yy - 18;

    g.appendChild(el('text', {
      x: xx, y: ty, 'text-anchor': 'middle', class: 'label ' + (isTop ? 'top' : 'bottom')
    }, d.city + ' ' + d.value.toFixed(2)));

    g.addEventListener('mouseenter', () => {
      tooltip.innerHTML = '<strong>' + d.city + '</strong>' + d.value.toFixed(2) + ' 間／每萬人<br>' + (isTop ? '前五名' : '倒數五名');
      tooltip.style.opacity = 1;
    });
    g.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      tooltip.style.left = (e.clientX - r.left) + 'px';
      tooltip.style.top = (e.clientY - r.top) + 'px';
    });
    g.addEventListener('mouseleave', () => {
      tooltip.style.opacity = 0;
    });

    svg.appendChild(g);
  });
})();

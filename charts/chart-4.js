(function () {
  const root = document.getElementById('chart-4');
  if (!root) return;

  const years = ['2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
  const hospital = [4541, 4727, 4983, 5306, 5585, 5712, 5947, 6543, 6411, 6762, 7174];
  const west = [1206, 1201, 1247, 1289, 1327, 1411, 1410, 1559, 1631, 1504, 1592];
  const dental = [1003, 1064, 1093, 1128, 1241, 1289, 1325, 1333, 1520, 1595, 1699];
  const chinese = [232, 229, 238, 248, 258, 267, 275, 267, 336, 311, 316];
  const other = [1082, 1106, 1184, 1353, 1508, 1753, 1951, 1998, 2049, 2249, 2487];
  const total = years.map((_, i) => hospital[i] + west[i] + dental[i] + chinese[i] + other[i]);

  const svg = document.getElementById('chart4-svg');
  const grid = document.getElementById('chart4-grid');
  const line = document.getElementById('chart4-line');
  const area = document.getElementById('chart4-area');
  const anno = document.getElementById('chart4-annotations');
  const hits = document.getElementById('chart4-hits');
  const guide = document.getElementById('chart4-guide');
  const hoverDot = document.getElementById('chart4-hoverDot');
  const tooltip = document.getElementById('chart4-tooltip');
  const trendWrap = root.querySelector('.chart-wrap');
  const section = document.getElementById('chart4-section');

  const W = 1000;
  const H = 450;
  const margin = { top: 28, right: 28, bottom: 52, left: 66 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  const yMin = 7500;
  const yMax = 13800;
  const compact = window.matchMedia('(max-width: 576px)').matches;

  const x = i => margin.left + i * (innerW / (years.length - 1));
  const y = v => margin.top + (yMax - v) / (yMax - yMin) * innerH;
  const fmt = n => n.toLocaleString('zh-TW');

  function svgEl(tag, attrs = {}, text = '') {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text) el.textContent = text;
    return el;
  }

  function buildGrid() {
    [8000, 10000, 12000].forEach(v => {
      const yy = y(v);
      grid.appendChild(svgEl('line', {
        x1: margin.left, y1: yy, x2: W - margin.right, y2: yy, class: 'grid'
      }));
      grid.appendChild(svgEl('text', {
        x: margin.left - 12, y: yy + 4, 'text-anchor': 'end', class: 'axis-label'
      }, fmt(v)));
    });

    ['2014', '2016', '2018', '2020', '2022', '2024'].forEach(yr => {
      const i = years.indexOf(yr);
      const anchor = yr === '2014' ? 'start' : (yr === '2024' ? 'end' : 'middle');
      grid.appendChild(svgEl('text', {
        x: x(i), y: H - 18, 'text-anchor': anchor, class: 'axis-label'
      }, yr));
    });
  }

  function buildTrend() {
    const pts = total.map((v, i) => [x(i), y(v)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
    line.setAttribute('d', d);
    area.setAttribute('d', d + ` L ${x(total.length - 1)},${H - margin.bottom} L ${x(0)},${H - margin.bottom} Z`);
  }

  function buildAnno() {
    const sx = x(0), sy = y(total[0]);
    const ex = x(total.length - 1), ey = y(total.at(-1));

    anno.appendChild(svgEl('circle', { cx: sx, cy: sy, r: 5, fill: '#e06b3d' }));
    anno.appendChild(svgEl('text', {
      x: sx + 12, y: sy + (compact ? 18 : -12), class: 'point-main'
    }, fmt(total[0])));
    anno.appendChild(svgEl('text', {
      x: sx + 12, y: sy + (compact ? 36 : 9), class: 'point-year'
    }, '2014 年'));

    anno.appendChild(svgEl('circle', { cx: ex, cy: ey, r: 6, fill: '#e06b3d' }));
    anno.appendChild(svgEl('text', {
      x: ex - 6, y: ey - (compact ? 18 : 22), 'text-anchor': 'end', class: 'point-main'
    }, fmt(total.at(-1))));
    anno.appendChild(svgEl('text', {
      x: ex - 6, y: ey - (compact ? 2 : 3), 'text-anchor': 'end', class: 'point-year'
    }, '2024 年'));

    const mx = x(5.35);
    const my = y(compact ? 11600 : 11150);
    anno.appendChild(svgEl('text', {
      x: mx, y: my, 'text-anchor': 'middle', class: 'growth-main'
    }, '+65%'));
    anno.appendChild(svgEl('text', {
      x: mx, y: my + (compact ? 32 : 24), 'text-anchor': 'middle', class: 'growth-sub'
    }, '10 年總支出成長'));
  }

  function buildHits() {
    years.forEach((yr, i) => {
      const left = i === 0 ? margin.left : (x(i - 1) + x(i)) / 2;
      const right = i === years.length - 1 ? W - margin.right : (x(i) + x(i + 1)) / 2;
      const rect = svgEl('rect', {
        x: left,
        y: margin.top,
        width: right - left,
        height: innerH,
        class: 'hit'
      });
      rect.addEventListener('mouseenter', () => showPoint(i));
      rect.addEventListener('mousemove', () => moveTip(i));
      rect.addEventListener('mouseleave', hidePoint);
      hits.appendChild(rect);
    });
  }

  function showPoint(i) {
    const px = x(i), py = y(total[i]);
    guide.setAttribute('x1', px);
    guide.setAttribute('x2', px);
    guide.setAttribute('y1', margin.top);
    guide.setAttribute('y2', H - margin.bottom);
    guide.style.opacity = 1;
    hoverDot.setAttribute('cx', px);
    hoverDot.setAttribute('cy', py);
    hoverDot.style.opacity = 1;

    tooltip.innerHTML = `
      <strong>${years[i]} 年</strong>
      <div class="total">總計 ${fmt(total[i])} 億元</div>
      <div>醫院 ${fmt(hospital[i])}</div>
      <div>西醫診所 ${fmt(west[i])}</div>
      <div>牙醫診所 ${fmt(dental[i])}</div>
      <div>中醫診所 ${fmt(chinese[i])}</div>
      <div>其他專業機構 ${fmt(other[i])}</div>
    `;
    tooltip.style.opacity = 1;
  }

  function moveTip(i) {
    const wrap = trendWrap.getBoundingClientRect();
    const box = svg.getBoundingClientRect();
    let left = x(i) * (box.width / W) + (box.left - wrap.left);
    const top = y(total[i]) * (box.height / H) + (box.top - wrap.top);
    left = Math.max(110, Math.min(wrap.width - 110, left));
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function hidePoint() {
    guide.style.opacity = 0;
    hoverDot.style.opacity = 0;
    tooltip.style.opacity = 0;
  }

  buildGrid();
  buildTrend();
  buildAnno();
  buildHits();

  let played = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        root.classList.add('is-visible');
        section.classList.add('is-visible');
      }
    });
  }, { threshold: .2 });

  observer.observe(section);
})();

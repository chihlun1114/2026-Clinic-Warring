(function () {
  const root = document.getElementById('chart-1');
  if (!root) return;

  const years = [
    2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
    2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024
  ];

  const west = [
    9948, 10064, 10197, 10326, 10361, 10599, 10815, 10997, 11105, 11277,
    11313, 11395, 11499, 11580, 11663, 11724, 11835, 11998, 12200, 12454
  ];

  const dental = [
    6029, 6065, 6104, 6173, 6214, 6295, 6402, 6476, 6565, 6630,
    6665, 6727, 6791, 6836, 6874, 6893, 6922, 6969, 7026, 7097
  ];

  const chinese = [
    2900, 3006, 3069, 3160, 3217, 3289, 3411, 3462, 3548, 3637,
    3705, 3772, 3839, 3917, 3975, 4036, 4043, 4131, 4194, 4249
  ];

  const total = years.map((_, i) => west[i] + dental[i] + chinese[i]);

  const svg = document.getElementById('chart1-svg');
  const grid = document.getElementById('chart1-grid');
  const line = document.getElementById('chart1-line');
  const area = document.getElementById('chart1-area');
  const hits = document.getElementById('chart1-hits');
  const annotations = document.getElementById('chart1-annotations');
  const guide = document.getElementById('chart1-guide');
  const hoverDot = document.getElementById('chart1-hoverDot');
  const tooltip = document.getElementById('chart1-tooltip');
  const chartWrap = root.querySelector('.chart-wrap');
  const section = document.getElementById('chart1-section');

  const W = 1000;
  const H = 500;
  const margin = { top: 26, right: 28, bottom: 52, left: 58 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;

  const yMin = 18000;
  const yMax = 24500;

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
    const ticks = [18000, 20000, 22000, 24000];

    ticks.forEach(v => {
      const yy = y(v);
      grid.appendChild(svgEl('line', {
        x1: margin.left, y1: yy, x2: W - margin.right, y2: yy, class: 'grid'
      }));
      grid.appendChild(svgEl('text', {
        x: margin.left - 12, y: yy + 4, 'text-anchor': 'end', class: 'axis-label'
      }, fmt(v)));
    });

    const yearTicks = [2005, 2010, 2015, 2020, 2024];
    yearTicks.forEach(yr => {
      const i = years.indexOf(yr);
      const anchor = yr === 2005 ? 'start' : (yr === 2024 ? 'end' : 'middle');
      grid.appendChild(svgEl('text', {
        x: x(i), y: H - 18, 'text-anchor': anchor, class: 'axis-label'
      }, String(yr)));
    });
  }

  function buildLine() {
    const points = total.map((v, i) => [x(i), y(v)]);
    const d = points.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
    line.setAttribute('d', d);

    const areaD = d +
      ` L ${x(years.length - 1)},${H - margin.bottom}` +
      ` L ${x(0)},${H - margin.bottom} Z`;
    area.setAttribute('d', areaD);
  }

  function buildPointTag(xPos, yPos, valueText, yearText, align) {
    const g = svgEl('g', { 'class': 'point-tag' });
    let textX = xPos + 14;
    let anchor = 'start';

    if (align === 'right') {
      textX = xPos - 14;
      anchor = 'end';
    }

    g.appendChild(svgEl('text', {
      x: textX, y: yPos + 30, 'text-anchor': anchor, class: 'point-value'
    }, valueText));
    g.appendChild(svgEl('text', {
      x: textX, y: yPos + 48, 'text-anchor': anchor, class: 'point-year'
    }, yearText));
    return g;
  }

  function buildAnnotations() {
    const firstX = x(0), firstY = y(total[0]);
    const lastX = x(total.length - 1), lastY = y(total.at(-1));

    annotations.appendChild(svgEl('circle', {
      cx: firstX, cy: firstY, r: 5, fill: '#e06b3d'
    }));
    annotations.appendChild(svgEl('circle', {
      cx: lastX, cy: lastY, r: 6, fill: '#e06b3d'
    }));

    const compact = window.matchMedia('(max-width: 576px)').matches;
    annotations.appendChild(buildPointTag(firstX + 8, firstY + (compact ? 10 : 4), fmt(total[0]), '2005 年', 'left'));
    annotations.appendChild(buildPointTag(lastX - 4, lastY - (compact ? 36 : 48), fmt(total.at(-1)), '2024 年', 'right'));

    const midX = x(10.1);
    const midY = y(compact ? 23400 : 22800);
    const badge = svgEl('g', { 'class': 'mid-badge' });
    badge.appendChild(svgEl('text', {
      x: midX, y: midY - 2, 'text-anchor': 'middle', class: 'big'
    }, '+4,923'));
    badge.appendChild(svgEl('text', {
      x: midX, y: midY + (compact ? 32 : 28), 'text-anchor': 'middle', class: 'small'
    }, '20 年新增診所'));
    annotations.appendChild(badge);
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
      rect.addEventListener('mousemove', (e) => showTooltipAtEvent(e, i));
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
      <div class="total">總計 ${fmt(total[i])} 家</div>
      <div>西醫 ${fmt(west[i])}</div>
      <div>牙醫 ${fmt(dental[i])}</div>
      <div>中醫 ${fmt(chinese[i])}</div>
    `;
    tooltip.style.opacity = 1;
  }

  function showTooltipAtEvent(e, i) {
    const wrap = chartWrap.getBoundingClientRect();
    const svgBox = svg.getBoundingClientRect();
    const pxRatio = svgBox.width / W;

    let left = x(i) * pxRatio + (svgBox.left - wrap.left);
    let top = y(total[i]) * (svgBox.height / H) + (svgBox.top - wrap.top);

    const minLeft = 95;
    const maxLeft = wrap.width - 95;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function hidePoint() {
    guide.style.opacity = 0;
    hoverDot.style.opacity = 0;
    tooltip.style.opacity = 0;
  }

  buildGrid();
  buildLine();
  buildAnnotations();
  buildHits();

  let played = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        section.classList.add('is-visible');
      }
    });
  }, { threshold: .2 });

  observer.observe(section);
})();

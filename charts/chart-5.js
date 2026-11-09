(function () {
  const root = document.getElementById('chart-5');
  if (!root) return;

  const data = [
    { name: '台北市', value: 818 },
    { name: '臺中市', value: 339 },
    { name: '高雄市', value: 193 },
    { name: '桃園市', value: 156 },
    { name: '臺南市', value: 113 },
    { name: '新北市', value: 101 },
    { name: '其他16縣市', value: 195 }
  ];

  const TAIPEI_COLOR = '#f55000';
  const GRAY_DARK = [93, 93, 96];
  const GRAY_LIGHT = [200, 200, 203];
  const others = data.filter(d => d.name !== '台北市');
  const minOther = Math.min.apply(null, others.map(d => d.value));
  const maxOther = Math.max.apply(null, others.map(d => d.value));

  function sliceStyle(d) {
    if (d.name === '台北市') {
      return { fill: TAIPEI_COLOR, onLight: false };
    }
    const t = maxOther === minOther ? 1 : (d.value - minOther) / (maxOther - minOther);
    const r = Math.round(GRAY_LIGHT[0] + (GRAY_DARK[0] - GRAY_LIGHT[0]) * t);
    const g = Math.round(GRAY_LIGHT[1] + (GRAY_DARK[1] - GRAY_LIGHT[1]) * t);
    const b = Math.round(GRAY_LIGHT[2] + (GRAY_DARK[2] - GRAY_LIGHT[2]) * t);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return { fill: 'rgb(' + r + ',' + g + ',' + b + ')', onLight: lum > 125 };
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const svg = document.getElementById('chart5-donut');
  const tooltip = document.getElementById('chart5-tooltip');
  const wrap = root.querySelector('.donut-wrap');
  const NS = 'http://www.w3.org/2000/svg';
  const PIE_SRC = 'images/Pie-chart.png?v=1';

  const cx = 260, cy = 260;
  const rOuter = 252, rInner = 84;
  const GAP = 0;

  function polar(r, a) {
    const rad = (a - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcPath(startAngle, endAngle) {
    const [x1, y1] = polar(rOuter, startAngle);
    const [x2, y2] = polar(rOuter, endAngle);
    const [ix2, iy2] = polar(rInner, endAngle);
    const [ix1, iy1] = polar(rInner, startAngle);
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return [
      'M ' + x1 + ' ' + y1,
      'A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2,
      'L ' + ix2 + ' ' + iy2,
      'A ' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + ix1 + ' ' + iy1,
      'Z'
    ].join(' ');
  }

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    Object.keys(attrs).forEach(k => node.setAttribute(k, attrs[k]));
    return node;
  }

  const defs = el('defs', {});
  const mask = el('mask', {
    id: 'chart5-brush-mask',
    maskUnits: 'userSpaceOnUse',
    'mask-type': 'luminance',
    x: '0',
    y: '0',
    width: '520',
    height: '520'
  });
  mask.appendChild(el('rect', {
    x: '0',
    y: '0',
    width: '520',
    height: '520',
    fill: '#000'
  }));
  const maskImage = el('image', {
    x: '0',
    y: '0',
    width: '520',
    height: '520',
    preserveAspectRatio: 'xMidYMid meet'
  });
  mask.appendChild(maskImage);
  defs.appendChild(mask);
  svg.appendChild(defs);

  const pieGroup = el('g', { class: 'pie-paint' });
  const slices = el('g', { class: 'slices' });
  pieGroup.appendChild(slices);
  const texture = el('image', {
    class: 'pie-texture',
    href: PIE_SRC,
    x: '0',
    y: '0',
    width: '520',
    height: '520',
    preserveAspectRatio: 'xMidYMid meet',
    'pointer-events': 'none'
  });
  pieGroup.appendChild(texture);
  svg.appendChild(pieGroup);
  const labels = el('g', { class: 'labels' });
  svg.appendChild(labels);

  let angle = 0;

  data.forEach(d => {
    const span = d.value / total * 360;
    const start = angle + GAP;
    const end = angle + span - GAP;
    if (end <= start) {
      angle += span;
      return;
    }

    const tone = sliceStyle(d);
    const path = el('path', {
      d: arcPath(start, end),
      fill: tone.fill,
      class: 'slice'
    });
    slices.appendChild(path);

    const mid = (start + end) / 2;
    const [lx, ly] = polar(168, mid);
    const shortName = d.name.replace('其他16縣市', '其他').replace('市', '');
    const isSmall = d.value < 130;

    if (d.value >= 100) {
      const text = el('text', {
        x: String(lx),
        y: String(ly - 4),
        class: [
          'slice-label',
          isSmall ? 'small' : '',
          tone.onLight ? 'on-light' : ''
        ].filter(Boolean).join(' ')
      });
      const t1 = el('tspan', { x: String(lx) });
      t1.textContent = shortName;
      const t2 = el('tspan', { x: String(lx), dy: isSmall ? '24' : '30' });
      t2.textContent = d.value.toLocaleString('zh-TW');
      text.append(t1, t2);
      labels.appendChild(text);
    }

    path.addEventListener('mouseenter', () => {
      tooltip.innerHTML = '<strong>' + d.name + '</strong>' +
        d.value.toLocaleString('zh-TW') + ' 家（' + (d.value / total * 100).toFixed(1) + '%）';
      tooltip.style.opacity = 1;
    });
    path.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      tooltip.style.left = (e.clientX - rect.left) + 'px';
      tooltip.style.top = (e.clientY - rect.top) + 'px';
    });
    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = 0;
    });

    angle += span;
  });

  function applyBrushMask(dataUrl) {
    maskImage.setAttribute('href', dataUrl);
    slices.setAttribute('mask', 'url(#chart5-brush-mask)');
  }

  function toAlphaMask(img) {
    const size = img.naturalWidth || 1254;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, size, size);
    const pixels = ctx.getImageData(0, 0, size, size);
    const d = pixels.data;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
      const v = a < 8 ? 0 : Math.round((255 - lum) * (a / 255));
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas.toDataURL('image/png');
  }

  const brush = new Image();
  brush.onload = function () {
    try {
      applyBrushMask(toAlphaMask(brush));
    } catch (err) {
      console.warn('chart-5 brush mask failed', err);
    }
  };
  brush.onerror = function () {
    console.warn('chart-5 could not load', PIE_SRC);
  };
  brush.src = PIE_SRC;
})();

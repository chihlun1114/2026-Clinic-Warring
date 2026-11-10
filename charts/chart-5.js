(function () {
  const root = document.getElementById('chart-5');
  if (!root) return;

  const data = [
    { name: '台北市', value: 818 },
    { name: '台中市', value: 339 },
    { name: '高雄市', value: 193 },
    { name: '桃園市', value: 156 },
    { name: '台南市', value: 113 },
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
  const center = root.querySelector('.center-total');
  const NS = 'http://www.w3.org/2000/svg';
  const PIE_SRC = 'images/Pie-chart.png?v=1';
  const ORIGIN = -90;
  const DURATION = 1.35;

  const cx = 260, cy = 260;
  const rOuter = 252, rInner = 84;
  const GAP = 0;

  function polar(r, a) {
    const rad = a * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcPath(startAngle, endAngle) {
    const end = endAngle < startAngle + 0.05 ? startAngle + 0.05 : endAngle;
    const [x1, y1] = polar(rOuter, startAngle);
    const [x2, y2] = polar(rOuter, end);
    const [ix2, iy2] = polar(rInner, end);
    const [ix1, iy1] = polar(rInner, startAngle);
    const large = end - startAngle > 180 ? 1 : 0;
    return [
      'M ' + x1 + ' ' + y1,
      'A ' + rOuter + ' ' + rOuter + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2,
      'L ' + ix2 + ' ' + iy2,
      'A ' + rInner + ' ' + rInner + ' 0 ' + large + ' 0 ' + ix1 + ' ' + iy1,
      'Z'
    ].join(' ');
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
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

  const sliceItems = [];
  let angle = ORIGIN;

  data.forEach(d => {
    const span = d.value / total * 360;
    const finalStart = angle + GAP;
    const finalEnd = angle + span - GAP;
    if (finalEnd <= finalStart) {
      angle += span;
      return;
    }

    const tone = sliceStyle(d);
    const path = el('path', {
      d: arcPath(ORIGIN, ORIGIN),
      fill: tone.fill,
      class: 'slice',
      'data-start': String(finalStart),
      'data-end': String(finalEnd)
    });
    slices.appendChild(path);

    const mid = (finalStart + finalEnd) / 2;
    const [lx, ly] = polar(168, mid);
    const shortName = d.name.replace('其他16縣市', '其他').replace('市', '');
    const isTaipei = d.name === '台北市';
    const isSmall = d.value < 130;
    let label = null;

    if (d.value >= 100) {
      label = el('text', {
        x: String(lx),
        y: String(ly - 4),
        class: [
          'slice-label',
          isTaipei ? 'is-taipei' : '',
          isSmall ? 'small' : ''
        ].filter(Boolean).join(' ')
      });
      const t1 = el('tspan', { x: String(lx) });
      t1.textContent = shortName;
      const t2 = el('tspan', {
        x: String(lx),
        dy: isTaipei ? '46' : (isSmall ? '26' : '32')
      });
      t2.textContent = d.value.toLocaleString('zh-TW');
      label.append(t1, t2);
      labels.appendChild(label);
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

    sliceItems.push({
      path: path,
      finalStart: finalStart,
      finalEnd: finalEnd,
      label: label
    });

    angle += span;
  });

  function renderSlices(progress) {
    sliceItems.forEach(item => {
      const start = lerp(ORIGIN, item.finalStart, progress);
      const end = lerp(ORIGIN, item.finalEnd, progress);
      item.path.setAttribute('d', arcPath(start, end));
    });
  }

  function showFinal() {
    renderSlices(1);
    const labelEls = sliceItems.map(item => item.label).filter(Boolean);
    if (typeof gsap !== 'undefined') {
      if (center) gsap.set(center.querySelectorAll('.num, .unit'), { opacity: 1, y: 0 });
      gsap.set(labelEls, { opacity: 1, y: 0 });
      gsap.set(texture, { opacity: 0.32 });
    } else {
      if (center) {
        center.querySelectorAll('.num, .unit').forEach(n => { n.style.opacity = '1'; });
      }
      labelEls.forEach(n => { n.style.opacity = '1'; });
      texture.style.opacity = '0.32';
    }
    slices.style.pointerEvents = '';
  }

  function playIntro() {
    if (typeof gsap === 'undefined') {
      showFinal();
      return;
    }

    slices.style.pointerEvents = 'none';
    const anim = { p: 0 };
    const centerBits = center ? center.querySelectorAll('.num, .unit') : [];
    const labelEls = sliceItems.map(item => item.label).filter(Boolean);

    gsap.set(centerBits, { opacity: 0, y: 8 });
    gsap.set(labelEls, { opacity: 0, y: 8 });
    gsap.set(texture, { opacity: 0 });

    gsap.to(anim, {
      p: 1,
      duration: DURATION,
      ease: 'power2.out',
      onUpdate: function () {
        renderSlices(anim.p);
      },
      onComplete: function () {
        renderSlices(1);
        slices.style.pointerEvents = '';
      }
    });

    gsap.to(centerBits, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      delay: DURATION * 0.75,
      ease: 'power2.out',
      stagger: 0.04
    });

    gsap.to(texture, {
      opacity: 0.32,
      duration: 0.4,
      delay: DURATION * 0.8,
      ease: 'power2.out'
    });

    gsap.to(labelEls, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      delay: DURATION + 0.2,
      ease: 'power2.out'
    });
  }

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

  let played = false;
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        playIntro();
      }
    });
  }, { threshold: 0.28 }).observe(root);
})();

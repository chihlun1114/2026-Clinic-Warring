(function () {
  const root = document.getElementById('chart-5');
  if (!root) return;

  const data = [
    { name: '臺北市', value: 818, color: '#E2762B' },
    { name: '臺中市', value: 339, color: '#2C6FB0' },
    { name: '高雄市', value: 193, color: '#15998C' },
    { name: '桃園市', value: 156, color: '#6F9A1F' },
    { name: '臺南市', value: 113, color: '#C94F8A' },
    { name: '新北市', value: 101, color: '#5DADE2' },
    { name: '其他16縣市', value: 195, color: '#AEB4BA' }
  ];

  const total = data.reduce((s, d) => s + d.value, 0);
  const svg = document.getElementById('chart5-donut');
  const tooltip = document.getElementById('chart5-tooltip');
  const wrap = root.querySelector('.donut-wrap');

  const cx = 260, cy = 260;
  const rOuter = 205, rInner = 118;

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
      `M ${x1} ${y1}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${ix1} ${iy1}`,
      'Z'
    ].join(' ');
  }

  let angle = 0;

  data.forEach(d => {
    const span = d.value / total * 360;
    const start = angle;
    const end = angle + span;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', arcPath(start, end));
    path.setAttribute('fill', d.color);
    path.setAttribute('stroke', '#f6f4ef');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('class', 'slice');
    svg.appendChild(path);

    const mid = (start + end) / 2;
    const labelR = (rOuter + rInner) / 2 + 4;
    const [lx, ly] = polar(labelR, mid);

    if (d.value >= 100) {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx);
      text.setAttribute('y', ly - 2);
      text.setAttribute('class', 'slice-label' + (d.value < 130 ? ' small' : ''));

      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      t1.setAttribute('x', lx);
      t1.textContent = d.name.replace('市', '').replace('其他16縣市', '其他');

      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      t2.setAttribute('x', lx);
      t2.setAttribute('dy', '18');
      t2.textContent = d.value.toLocaleString('zh-TW');

      text.append(t1, t2);
      svg.appendChild(text);
    }

    path.addEventListener('mouseenter', () => {
      tooltip.innerHTML = `<strong>${d.name}</strong>${d.value.toLocaleString('zh-TW')} 家（${(d.value / total * 100).toFixed(1)}%）`;
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

    angle = end;
  });
})();

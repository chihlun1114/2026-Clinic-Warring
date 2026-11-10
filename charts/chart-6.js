(function () {
  const root = document.getElementById('chart-6');
  if (!root) return;

  const top = [
    { city: '嘉義市', value: 13.99 },
    { city: '台北市', value: 12.84 },
    { city: '台中市', value: 11.68 },
    { city: '高雄市', value: 10.51 },
    { city: '台南市', value: 10.26 }
  ];
  const bottom = [
    { city: '桃園市', value: 7.09 },
    { city: '苗栗縣', value: 7.00 },
    { city: '嘉義縣', value: 5.74 },
    { city: '金門縣', value: 4.26 },
    { city: '連江縣', value: 1.47 }
  ];

  const CLINIC_COLOR = 'images/Clinic.png?v=2';
  const CLINIC_GRAY = 'images/Clinic2.png?v=2';
  const panel = document.getElementById('chart6-panel');
  const topWrap = document.getElementById('chart6-top');
  const bottomWrap = document.getElementById('chart6-bottom');
  const detail = document.getElementById('chart6-detail');
  const mobileDetail = document.getElementById('chart6-mobile-detail');
  const rows = [];

  function iconCount(value) {
    return Math.max(1, Math.ceil(value - 1e-6));
  }

  function makeIconRow(src, count) {
    const row = document.createElement('div');
    row.className = 'clinic-row';
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      row.appendChild(img);
    }
    return row;
  }

  function showDesktopDetail(d, e) {
    detail.innerHTML =
      '<strong>' + d.city + '</strong>' +
      d.value.toFixed(2) + ' 間／每萬人';
    detail.style.left = e.clientX + 'px';
    detail.style.top = e.clientY + 'px';
    detail.style.opacity = 1;
  }

  function hideDesktopDetail() {
    detail.style.opacity = 0;
  }

  function showMobileDetail(d) {
    mobileDetail.innerHTML =
      '<strong>' + d.city + '</strong>' +
      '<span>每萬人 ' + d.value.toFixed(2) + ' 間診所</span>';
  }

  function buildRow(d, i) {
    const count = iconCount(d.value);
    const row = document.createElement('div');
    row.className = 'data-row row-' + (i + 1);
    row.style.setProperty('--delay', (0.08 + i * 0.08).toFixed(2) + 's');
    row.style.setProperty('--value-delay', (0.55 + i * 0.08).toFixed(2) + 's');

    const label = document.createElement('div');
    label.className = 'row-label';
    label.textContent = d.city;

    const zone = document.createElement('div');
    zone.className = 'measure-zone';

    const track = document.createElement('div');
    track.className = 'clinic-track';
    track.setAttribute('aria-hidden', 'true');

    const stack = document.createElement('div');
    stack.className = 'clinic-stack';

    const gray = document.createElement('div');
    gray.className = 'clinic-layer clinic-layer-gray';
    gray.appendChild(makeIconRow(CLINIC_GRAY, count));

    const color = document.createElement('div');
    color.className = 'clinic-layer clinic-layer-color';
    color.appendChild(makeIconRow(CLINIC_COLOR, count));

    stack.append(gray, color);
    track.appendChild(stack);

    const value = document.createElement('div');
    value.className = 'row-value';
    value.textContent = d.value.toFixed(2);

    zone.appendChild(track);
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

    rows.push({ row: row, value: d.value, count: count, track: track });
    return row;
  }

  top.forEach((d, i) => topWrap.appendChild(buildRow(d, i)));
  bottom.forEach((d, i) => bottomWrap.appendChild(buildRow(d, i + top.length)));

  function setRowWidths() {
    rows.forEach(item => {
      const base = item.row.querySelector('.clinic-layer-gray .clinic-row');
      if (!base) return;
      const fullW = base.scrollWidth;
      if (!fullW) return;
      const fill = (item.value / item.count) * fullW;
      item.row.style.setProperty('--stack', fullW + 'px');
      item.row.style.setProperty('--fill', fill + 'px');
    });
  }

  function whenIconsReady(cb) {
    const imgs = [...root.querySelectorAll('.clinic-track img')];
    Promise.all(imgs.map(img => (img.decode ? img.decode() : Promise.resolve()).catch(() => {})))
      .then(cb);
  }

  whenIconsReady(setRowWidths);
  window.addEventListener('resize', setRowWidths);

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

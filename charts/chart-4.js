(function () {
  const root = document.getElementById('chart-4');
  if (!root) return;

  let played = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        root.classList.add('is-visible');
      }
    });
  }, { threshold: .2 });

  observer.observe(root);
})();

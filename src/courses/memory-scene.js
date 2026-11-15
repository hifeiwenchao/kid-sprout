const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderMemoryScene(scene) {
  if (!scene) return '';
  return `<section class="memory-scene" data-memory-scene aria-label="${escape(scene.symbol)}记忆小剧场">
    <div class="memory-scene-heading"><span>✦ 记忆小剧场</span><button type="button" data-memory-replay aria-label="重播${escape(scene.symbol)}记忆动画">再看一次 ↻</button></div>
    <div class="memory-scene-art" aria-hidden="true">${scene.art}</div>
    <h3>${escape(scene.title)}</h3><p>${escape(scene.description)}</p>
    <span class="memory-motion-note">跟着图形记一记，再用小手比划一下。</span>
  </section>`;
}

export function createMemoryScene(root) {
  if (!root) return { destroy() {} };
  const button = root.querySelector('[data-memory-replay]');
  const note = root.querySelector('.memory-motion-note');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let alive = true;
  let frame = null;
  let timer = null;
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    clearTimeout(timer);
    frame = timer = null;
    root.classList.remove('memory-playing');
  }
  function play() {
    stop();
    if (!alive) return;
    if (media.matches) {
      note.textContent = '图形安静地陪你记一记，也可以用手指比划一下。';
      return;
    }
    note.textContent = '跟着图形记一记，再用小手比划一下。';
    // Two frames give the browser a static frame before restarting CSS motion.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        frame = null;
        if (!alive) return;
        root.classList.add('memory-playing');
        timer = setTimeout(() => { timer = null; root.classList.remove('memory-playing'); }, 4600);
      });
    });
  }
  button.addEventListener('click', play);
  media.addEventListener('change', play);
  play();
  return {
    destroy() {
      if (!alive) return;
      alive = false;
      stop();
      button.removeEventListener('click', play);
      media.removeEventListener('change', play);
    },
  };
}

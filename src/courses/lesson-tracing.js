import { getTracingTemplate, drawTracingGuide } from '../drawing-tracing.js';
import { createDrawingHistory } from '../drawing-history.js';

const WIDTH = 1200;
const HEIGHT = 900;

export function renderLessonTracing({ groupId, character }) {
  const template = getTracingTemplate(groupId, character);
  if (!template) return '';
  return `<section class="lesson-tracing" data-lesson-tracing aria-label="${template.label}练写">
    <div class="lesson-tracing-heading"><h3>小手写一写 <span>${character}</span></h3><span>沿着虚线，慢慢描一描</span></div>
    <div class="lesson-tracing-paper"><canvas data-lesson-guide width="1200" height="900" aria-hidden="true"></canvas><canvas data-lesson-ink width="1200" height="900" tabindex="0" aria-label="${template.label}临摹练写区域">浏览器暂不支持临摹，可以照着底稿在纸上练习。</canvas></div>
    <div class="lesson-tracing-actions"><button type="button" data-lesson-undo disabled>撤销一笔</button><button type="button" data-lesson-clear disabled>重新写</button><button type="button" data-lesson-finish disabled>我练好啦 ✓</button></div>
    <p class="lesson-tracing-status" data-lesson-tracing-status role="status">用手指或鼠标描一描，再请大人看看你的线条。</p>
  </section>`;
}

function paint(context, stroke) {
  context.beginPath();
  const [first, ...rest] = stroke.points;
  if (!rest.length) {
    context.arc(first.x, first.y, stroke.size / 2, 0, Math.PI * 2);
    context.fill();
    return;
  }
  context.lineWidth = stroke.size;
  context.moveTo(first.x, first.y);
  for (const point of rest) context.lineTo(point.x, point.y);
  context.stroke();
}

export function createLessonTracing(root, { groupId, character }) {
  const template = getTracingTemplate(groupId, character);
  if (!root || !template) return { destroy() {} };
  const canvas = root.querySelector('[data-lesson-ink]');
  const guide = root.querySelector('[data-lesson-guide]');
  const context = canvas.getContext('2d');
  const guideContext = guide.getContext('2d');
  const undo = root.querySelector('[data-lesson-undo]');
  const clear = root.querySelector('[data-lesson-clear]');
  const finish = root.querySelector('[data-lesson-finish]');
  const status = root.querySelector('[data-lesson-tracing-status]');
  if (!context || !guideContext) {
    status.textContent = '这个浏览器暂不支持临摹，可以和大人一起在纸上练习。';
    return { destroy() {} };
  }
  drawTracingGuide(guideContext, template, WIDTH, HEIGHT);
  const history = createDrawingHistory({ limit: 40 });
  const listeners = new AbortController();
  let active = true;
  let stroke = null;
  let pointer = null;
  let frame = null;

  function render() {
    frame = null;
    if (!active) return;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.strokeStyle = context.fillStyle = '#52775e';
    context.lineCap = context.lineJoin = 'round';
    history.strokes.forEach(item => paint(context, item));
    if (stroke) paint(context, stroke);
    undo.disabled = !history.canUndo && !stroke;
    clear.disabled = finish.disabled = !history.strokes.length && !stroke;
  }
  function requestRender() {
    if (frame === null) frame = requestAnimationFrame(render);
  }
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: Math.min(WIDTH, Math.max(0, (event.clientX - bounds.left) * WIDTH / bounds.width)),
      y: Math.min(HEIGHT, Math.max(0, (event.clientY - bounds.top) * HEIGHT / bounds.height)),
    };
  }
  function append(event) {
    const samples = event.getCoalescedEvents?.();
    for (const sample of samples?.length ? samples : [event]) {
      const next = point(sample);
      const previous = stroke.points.at(-1);
      if (next.x !== previous.x || next.y !== previous.y) stroke.points.push(next);
    }
  }
  function releasePointer() {
    const previous = pointer;
    pointer = null;
    if (previous !== null && canvas.hasPointerCapture?.(previous)) canvas.releasePointerCapture(previous);
  }
  function finishStroke() {
    if (!stroke) return;
    history.addStroke(stroke);
    stroke = null;
    releasePointer();
    if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    render();
  }
  const on = (target, event, handler) => target.addEventListener(event, handler, { signal: listeners.signal });
  on(canvas, 'pointerdown', event => {
    if (!active || stroke || event.button !== 0 || event.isPrimary === false) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    pointer = event.pointerId;
    stroke = { size: 5 * WIDTH / bounds.width, points: [point(event)] };
    canvas.setPointerCapture(pointer);
    status.textContent = '顺着虚线慢慢写，不着急，每一笔都是练习。';
    requestRender();
  });
  on(canvas, 'pointermove', event => {
    if (!active || !stroke || pointer !== event.pointerId) return;
    event.preventDefault();
    append(event);
    requestRender();
  });
  on(canvas, 'pointerup', event => {
    if (!active || !stroke || pointer !== event.pointerId) return;
    append(event);
    finishStroke();
  });
  for (const event of ['pointercancel', 'lostpointercapture']) on(canvas, event, value => {
    if (active && pointer === value.pointerId) finishStroke();
  });
  on(window, 'resize', finishStroke);
  on(undo, 'click', () => {
    finishStroke();
    if (!history.undo()) return;
    render();
    status.textContent = '退回一笔啦，再慢慢写一写。';
  });
  on(clear, 'click', () => {
    finishStroke();
    history.clear();
    render();
    status.textContent = '笔迹清空啦，再练一次；点“撤销一笔”还能找回。';
  });
  on(finish, 'click', () => {
    finishStroke();
    if (!history.strokes.length) return;
    status.textContent = '认真练习，真棒！请大人一起看看字形，再试着在纸上写一写。';
  });
  render();
  return {
    destroy() {
      if (!active) return;
      active = false;
      listeners.abort();
      stroke = null;
      releasePointer();
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    },
  };
}

import { createDrawingHistory } from './drawing-history.js';
import { TRACING_GROUPS, getTracingTemplate, drawTracingGuide } from './drawing-tracing.js';

const WIDTH = 1200;
const HEIGHT = 900;

function paintStroke(context, stroke) {
  const { points, size, color, tool } = stroke;
  if (!points.length) return;
  context.save();
  context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  context.globalAlpha = tool === 'marker' ? .32 : 1;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = size;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  if (points.length === 1) {
    context.arc(points[0].x, points[0].y, size / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1];
      const point = points[i];
      context.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) / 2, (previous.y + point.y) / 2);
    }
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
    context.stroke();
  }
  context.restore();
}

export function createDrawingBoard(root, { toast = () => {} } = {}) {
  const canvas = root.querySelector('#drawing-canvas');
  const context = canvas.getContext('2d');
  const stage = root.querySelector('#drawing-stage');
  const status = root.querySelector('#drawing-status');
  const sizeInput = root.querySelector('#drawing-size');
  const customColor = root.querySelector('#drawing-custom-color');
  const clearConfirm = root.querySelector('#drawing-clear-confirm');
  const undoButton = root.querySelector('#drawing-undo');
  const redoButton = root.querySelector('#drawing-redo');
  const preview = root.querySelector('#drawing-brush-preview');
  const fullscreenButton = root.querySelector('#drawing-fullscreen');
  const tracingCanvas = root.querySelector('#drawing-tracing-guide');
  const tracingContext = tracingCanvas.getContext('2d');
  const tracingControls = root.querySelector('#drawing-tracing-controls');
  const tracingPicker = root.querySelector('#drawing-tracing-picker');
  const tracingChooser = root.querySelector('#drawing-tracing-chooser');
  const tracingPrevious = root.querySelector('#drawing-tracing-previous');
  const tracingNext = root.querySelector('#drawing-tracing-next');
  const history = createDrawingHistory();
  const paper = document.createElement('canvas');
  paper.width = canvas.width = WIDTH;
  paper.height = canvas.height = HEIGHT;
  const paperContext = paper.getContext('2d');
  let active = false;
  let currentStroke = null;
  let pointerId = null;
  let frame = null;
  let tool = 'pen';
  let fullscreen = false;
  let nativeFullscreen = false;
  let scrollBeforeFullscreen = 0;
  let tracingGroup = 'free';
  let tracingTemplate = null;
  const tracingCharacters = Object.fromEntries(TRACING_GROUPS.map(group => [group.id, group.characters[0]]));
  const firstColor = root.querySelector('[data-drawing-color]');
  let color = firstColor.dataset.drawingColor;
  let colorName = firstColor.getAttribute('aria-label');
  const sizes = { pen: 8, marker: 24, eraser: 32 };
  const toolNames = { pen: '画笔', marker: '荧光笔', eraser: '橡皮擦' };

  function render() {
    frame = null;
    if (!context || !paperContext) return;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.drawImage(paper, 0, 0);
    if (currentStroke) paintStroke(context, currentStroke);
  }

  function requestRender() {
    if (frame === null) frame = requestAnimationFrame(render);
  }

  function refreshArtwork() {
    if (!paperContext) return;
    paperContext.clearRect(0, 0, WIDTH, HEIGHT);
    history.strokes.forEach(stroke => paintStroke(paperContext, stroke));
    render();
    undoButton.disabled = !history.canUndo;
    redoButton.disabled = !history.canRedo;
    root.querySelector('#drawing-empty').hidden = Boolean(tracingTemplate) || history.strokes.length > 0;
  }

  function selectTracing(groupId, character = tracingCharacters[groupId]) {
    const group = TRACING_GROUPS.find(item => item.id === groupId);
    const template = group ? getTracingTemplate(groupId, character) : null;
    if (groupId !== 'free' && !template) return;
    const changed = tracingTemplate !== template;
    finishStroke();
    clearConfirm.hidden = true;
    tracingChooser.open = false;
    if (changed) history.clear();
    tracingGroup = groupId;
    tracingTemplate = template;
    if (group) tracingCharacters[groupId] = character;
    root.querySelectorAll('[data-tracing-group]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.tracingGroup === groupId));
    });
    tracingControls.hidden = !template;
    canvas.setAttribute('aria-label', template ? `${template.label}临摹区域` : '自由涂画区域');
    if (template) {
      const index = group.characters.indexOf(character);
      root.querySelector('#drawing-tracing-current').textContent = character;
      tracingPrevious.disabled = index === 0;
      tracingNext.disabled = index === group.characters.length - 1;
      tracingPrevious.setAttribute('aria-label', index > 0 ? `临摹上一个：${group.characters[index - 1]}` : '已经是第一个');
      tracingNext.setAttribute('aria-label', index < group.characters.length - 1 ? `临摹下一个：${group.characters[index + 1]}` : '已经是最后一个');
      tracingPicker.innerHTML = group.characters.map(item => `<button type="button" data-tracing-character="${item}" aria-label="临摹${group.label}中的 ${item}" aria-pressed="${item === character}">${item}</button>`).join('');
    }
    drawTracingGuide(tracingContext, template, WIDTH, HEIGHT);
    refreshArtwork();
    status.textContent = template ? `一起描一描${template.label}吧！切换字符会自动清空笔迹，点“撤销”可以找回。` : '回到自由画画啦，点“撤销”可以找回刚才的笔迹。';
  }

  root.querySelectorAll('[data-tracing-group]').forEach(button => {
    button.onclick = () => selectTracing(button.dataset.tracingGroup);
  });
  tracingPicker.addEventListener('click', event => {
    const button = event.target.closest('[data-tracing-character]');
    if (!button) return;
    selectTracing(tracingGroup, button.dataset.tracingCharacter);
    tracingChooser.querySelector('summary').focus({ preventScroll: true });
  });
  function moveTracing(direction) {
    const group = TRACING_GROUPS.find(item => item.id === tracingGroup);
    if (!group) return;
    const index = group.characters.indexOf(tracingCharacters[tracingGroup]);
    const character = group.characters[index + direction];
    if (character !== undefined) selectTracing(tracingGroup, character);
  }
  tracingPrevious.onclick = () => moveTracing(-1);
  tracingNext.onclick = () => moveTracing(1);
  root.addEventListener('pointerdown', event => {
    if (!tracingChooser.contains(event.target)) tracingChooser.open = false;
  });

  function refreshBrush() {
    root.querySelectorAll('[data-drawing-tool]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.drawingTool === tool));
    });
    root.querySelectorAll('[data-drawing-color]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.drawingColor.toLowerCase() === color.toLowerCase()));
    });
    customColor.value = color;
    root.querySelector('#drawing-color-name').textContent = colorName;
    sizeInput.value = sizes[tool];
    root.querySelector('#drawing-size-value').textContent = `${sizes[tool]} px`;
    preview.style.width = `${sizes[tool]}px`;
    preview.style.height = `${sizes[tool]}px`;
    preview.style.background = tool === 'eraser' ? '#fff' : color;
    preview.style.opacity = tool === 'marker' ? '.4' : '1';
    preview.style.border = tool === 'eraser' ? '1px solid #a5ac9d' : 'none';
    stage.dataset.tool = tool;
    const cursorSize = Math.max(12, sizes[tool] + 4);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}"><circle cx="${cursorSize / 2}" cy="${cursorSize / 2}" r="${cursorSize / 2 - 2}" fill="none" stroke="white" stroke-width="3"/><circle cx="${cursorSize / 2}" cy="${cursorSize / 2}" r="${cursorSize / 2 - 2}" fill="none" stroke="${tool === 'eraser' ? '#737e6d' : color}" stroke-width="1.5"/></svg>`;
    canvas.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${cursorSize / 2} ${cursorSize / 2}, crosshair`;
  }

  function pointFromEvent(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) * WIDTH / bounds.width, y: (event.clientY - bounds.top) * HEIGHT / bounds.height };
  }

  function appendPoints(event) {
    const events = event.getCoalescedEvents?.();
    for (const sample of events?.length ? events : [event]) {
      const point = pointFromEvent(sample);
      const previous = currentStroke.points.at(-1);
      if (point.x !== previous.x || point.y !== previous.y) currentStroke.points.push(point);
    }
  }

  function finishStroke() {
    if (!currentStroke) return;
    const finished = currentStroke;
    const finishedPointer = pointerId;
    currentStroke = null;
    pointerId = null;
    if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    stage.classList.remove('drawing-is-drawing');
    if (canvas.hasPointerCapture?.(finishedPointer)) canvas.releasePointerCapture(finishedPointer);
    history.addStroke(finished);
    refreshArtwork();
    status.textContent = '每一笔都是小小的发现，继续画吧！';
  }

  const hasNativeFullscreen = () => (document.fullscreenElement || document.webkitFullscreenElement) === root;
  function updateFullscreen(enabled) {
    if (fullscreen === enabled) return;
    finishStroke();
    if (enabled) scrollBeforeFullscreen = window.scrollY;
    fullscreen = enabled;
    root.classList.toggle('drawing-is-fullscreen', enabled);
    document.body.classList.toggle('drawing-fullscreen-open', enabled);
    fullscreenButton.setAttribute('aria-pressed', String(enabled));
    fullscreenButton.setAttribute('aria-label', enabled ? '退出全屏' : '全屏画画');
    fullscreenButton.querySelector('[data-drawing-fullscreen-label]').textContent = enabled ? '退出全屏' : '全屏';
    fullscreenButton.querySelector('[data-drawing-fullscreen-enter]').hidden = enabled;
    fullscreenButton.querySelector('[data-drawing-fullscreen-exit]').hidden = !enabled;
    status.textContent = enabled ? '画纸变大啦，尽情画吧！按 Esc 或点“退出全屏”返回。' : '回到小画板啦，刚才的画都在。';
    if (!enabled && active) window.scrollTo({ top: scrollBeforeFullscreen, behavior: 'instant' });
  }

  function exitNativeFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (hasNativeFullscreen() && exit) {
      try { return Promise.resolve(exit.call(document)).catch(() => {}); } catch {}
    }
    return Promise.resolve();
  }

  function leaveFullscreen() {
    updateFullscreen(false);
    return exitNativeFullscreen();
  }

  fullscreenButton.onclick = async () => {
    if (fullscreen) { await leaveFullscreen(); return; }
    if (!active) return;
    updateFullscreen(true);
    const request = root.requestFullscreen || root.webkitRequestFullscreen;
    if (!request) return;
    try {
      await request.call(root);
      if (!active || !fullscreen) await exitNativeFullscreen();
    } catch {
      // Keep the page-filling layout when a browser or embedded view does not
      // provide native fullscreen. The same exit button and Esc still work.
    }
  };

  function syncFullscreen() {
    finishStroke();
    if (hasNativeFullscreen()) {
      nativeFullscreen = true;
      if (!active || !fullscreen) void exitNativeFullscreen();
    } else if (nativeFullscreen) {
      nativeFullscreen = false;
      updateFullscreen(false);
    }
  }
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('webkitfullscreenchange', syncFullscreen);
  window.addEventListener('resize', () => { if (active) finishStroke(); });

  canvas.addEventListener('pointerdown', event => {
    if (!active || !context || currentStroke || event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    clearConfirm.hidden = true;
    canvas.focus({ preventScroll: true });
    pointerId = event.pointerId;
    currentStroke = {
      tool, color, size: sizes[tool] * WIDTH / canvas.getBoundingClientRect().width,
      points: [pointFromEvent(event)],
    };
    canvas.setPointerCapture(event.pointerId);
    stage.classList.add('drawing-is-drawing');
    root.querySelector('#drawing-empty').hidden = true;
    requestRender();
  });
  canvas.addEventListener('pointermove', event => {
    if (!currentStroke || event.pointerId !== pointerId) return;
    event.preventDefault();
    appendPoints(event);
    requestRender();
  });
  canvas.addEventListener('pointerup', event => {
    if (!currentStroke || event.pointerId !== pointerId) return;
    appendPoints(event);
    finishStroke();
  });
  for (const name of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(name, event => { if (event.pointerId === pointerId) finishStroke(); });
  }

  root.querySelectorAll('[data-drawing-tool]').forEach(button => {
    button.onclick = () => {
      finishStroke();
      tool = button.dataset.drawingTool;
      refreshBrush();
      status.textContent = `换上${toolNames[tool]}啦，试着画一画吧！`;
    };
  });
  root.querySelectorAll('[data-drawing-color]').forEach(button => {
    button.onclick = () => {
      color = button.dataset.drawingColor;
      colorName = button.getAttribute('aria-label');
      if (tool === 'eraser') tool = 'pen';
      refreshBrush();
      status.textContent = `选好了${colorName}，画一点喜欢的东西吧！`;
    };
  });
  customColor.addEventListener('input', () => {
    color = customColor.value;
    colorName = '我的专属颜色';
    if (tool === 'eraser') tool = 'pen';
    refreshBrush();
  });
  sizeInput.addEventListener('input', () => {
    sizes[tool] = Number(sizeInput.value);
    refreshBrush();
  });

  function undo() {
    finishStroke();
    if (!history.undo()) return;
    refreshArtwork();
    status.textContent = '退回一步啦，换个想法再试试。';
  }
  function redo() {
    finishStroke();
    if (!history.redo()) return;
    refreshArtwork();
    status.textContent = '刚才的那一笔，又回来啦！';
  }
  undoButton.onclick = undo;
  redoButton.onclick = redo;
  root.querySelector('#drawing-grid').onclick = event => {
    const visible = stage.classList.toggle('drawing-show-grid');
    event.currentTarget.setAttribute('aria-pressed', String(visible));
    event.currentTarget.setAttribute('aria-label', visible ? '隐藏网格' : '显示网格');
    status.textContent = visible ? '小格子来帮忙啦，保存的画作里不会有格子哦。' : '小格子藏起来啦，自由地画吧！';
  };
  root.querySelector('#drawing-clear').onclick = () => {
    finishStroke();
    if (!history.strokes.length) { status.textContent = '画纸还是干净的，来画第一笔吧！'; return; }
    clearConfirm.hidden = false;
    root.querySelector('#drawing-clear-cancel').focus();
  };
  root.querySelector('#drawing-clear-cancel').onclick = () => {
    clearConfirm.hidden = true;
    root.querySelector('#drawing-clear').focus();
  };
  root.querySelector('#drawing-clear-accept').onclick = () => {
    history.clear();
    refreshArtwork();
    clearConfirm.hidden = true;
    status.textContent = '换上一张干净画纸啦，点“撤销”还能找回刚才的画。';
    root.querySelector('#drawing-clear').focus();
  };

  root.querySelector('#drawing-save').onclick = () => {
    finishStroke();
    if (!paperContext) return;
    const image = document.createElement('canvas');
    image.width = WIDTH;
    image.height = HEIGHT;
    const imageContext = image.getContext('2d');
    imageContext.fillStyle = '#ffffff';
    imageContext.fillRect(0, 0, WIDTH, HEIGHT);
    // Keep the tracing character in the saved practice, without guide lines.
    // The guide stays separate from the ink so erasing never removes it.
    if (tracingTemplate) {
      const guide = document.createElement('canvas');
      guide.width = WIDTH;
      guide.height = HEIGHT;
      drawTracingGuide(guide.getContext('2d'), tracingTemplate, WIDTH, HEIGHT, { guides: false });
      imageContext.drawImage(guide, 0, 0);
    }
    imageContext.drawImage(paper, 0, 0);
    image.toBlob(blob => {
      if (!blob) { toast('图片暂时没有保存成功，请再试一次'); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date();
      const date = [today.getFullYear(), today.getMonth() + 1, today.getDate()].map((part, index) => index === 0 ? part : String(part).padStart(2, '0')).join('-');
      link.download = `萌芽画作-${date}.png`;
      link.href = url;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      status.textContent = '画作已导出为 PNG 图片，把小小创意收藏起来吧！';
      toast('画作已导出，快去下载里找找吧');
    }, 'image/png');
  };

  root.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape' && tracingChooser.open) {
      event.preventDefault();
      tracingChooser.open = false;
      tracingChooser.querySelector('summary').focus({ preventScroll: true });
      return;
    }
    if (event.key === 'Escape' && !clearConfirm.hidden) {
      event.preventDefault();
      clearConfirm.hidden = true;
      root.querySelector('#drawing-clear').focus();
      return;
    }
    if (!(event.metaKey || event.ctrlKey) || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
    } else if (event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redo();
    }
  });

  document.addEventListener('keydown', event => {
    if (!active || !fullscreen || event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    void leaveFullscreen();
    fullscreenButton.focus({ preventScroll: true });
  });

  refreshBrush();
  refreshArtwork();
  return {
    activate() {
      active = true;
      if (!context) toast('这个浏览器暂不支持画板，请换个浏览器试试');
      render();
    },
    deactivate() {
      finishStroke();
      active = false;
      void leaveFullscreen();
      clearConfirm.hidden = true;
      tracingChooser.open = false;
    },
  };
}

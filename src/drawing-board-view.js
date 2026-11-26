export const DRAWING_COLORS = [
  { value: '#52775e', name: '森林绿' },
  { value: '#91ad73', name: '嫩芽绿' },
  { value: '#e2b755', name: '阳光黄' },
  { value: '#e99958', name: '橘子橙' },
  { value: '#dc7c79', name: '珊瑚红' },
  { value: '#e3a0b2', name: '花瓣粉' },
  { value: '#ad90c5', name: '葡萄紫' },
  { value: '#7f95c8', name: '蓝莓蓝' },
  { value: '#74a9bf', name: '天空蓝' },
  { value: '#8bc5bc', name: '薄荷青' },
  { value: '#a78265', name: '小熊棕' },
  { value: '#414c48', name: '石墨黑' },
];

const drawingIcon = (name, size = 20) => {
  const paths = {
    pen: '<path d="m15 4 5 5M4 16 16 4a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3L8 20l-5 1 1-5Z"/><path d="m4 16 4 4"/>',
    marker: '<path d="m14 3 7 7-8 8-7-7 8-8Z"/><path d="m6 11-3 7 3 3 7-3M3 21h6"/>',
    eraser: '<path d="m9 20-5-5a2 2 0 0 1 0-3l8-8a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-8 8H9ZM8 8l8 8M12 20h9"/>',
    undo: '<path d="m8 4-5 5 5 5M3 9h11a6 6 0 0 1 0 12h-3"/>',
    redo: '<path d="m16 4 5 5-5 5m5-5H10a6 6 0 0 0 0 12h3"/>',
    grid: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16M4 15h16M10 4v16M15 4v16"/>',
    clear: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
    save: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
    fullscreen: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    shrink: '<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5"/>',
    palette: '<path d="M21 11a9 9 0 1 0-9 10h1a2.5 2.5 0 0 0 2.2-3.7 1.8 1.8 0 0 1 1.6-2.7h.7A3.5 3.5 0 0 0 21 11Z"/><circle cx="7.5" cy="10" r=".8"/><circle cx="11" cy="6.5" r=".8"/><circle cx="16" cy="8" r=".8"/><circle cx="6.5" cy="15" r=".8"/>',
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};

export function renderDrawingBoard({ icon } = {}) {
  return `
    <header class="drawing-heading">
      <div><span class="drawing-eyebrow">LITTLE ARTIST · 自由创作</span><h1 id="drawing-page-title" tabindex="-1">小小画板 <span aria-hidden="true">✧</span></h1><p>让想象力，跟着小手自由生长。</p></div>
      <div class="drawing-heading-actions"><button type="button" id="drawing-fullscreen" aria-label="全屏画画" aria-pressed="false"><span data-drawing-fullscreen-enter aria-hidden="true">${drawingIcon('fullscreen', 19)}</span><span data-drawing-fullscreen-exit aria-hidden="true" hidden>${drawingIcon('shrink', 19)}</span><span data-drawing-fullscreen-label>全屏</span></button><button type="button" id="drawing-save" class="drawing-save">${drawingIcon('save', 19)}<span>保存我的画</span></button></div>
    </header>
    <div class="drawing-workspace">
      <aside class="drawing-tools" aria-label="画画工具箱">
        <div class="drawing-toolbox-title">${drawingIcon('palette', 21)}<strong>我的小工具箱</strong><span aria-hidden="true">✦</span></div>
        <fieldset class="drawing-tool-group drawing-pens"><legend>选一支画笔</legend><div class="drawing-pen-options">
          <button type="button" data-drawing-tool="pen" aria-pressed="true">${drawingIcon('pen', 22)}<span>画笔</span></button>
          <button type="button" data-drawing-tool="marker" aria-pressed="false">${drawingIcon('marker', 22)}<span>荧光笔</span></button>
          <button type="button" data-drawing-tool="eraser" aria-pressed="false">${drawingIcon('eraser', 22)}<span>橡皮擦</span></button>
        </div></fieldset>
        <button type="button" id="drawing-tools-toggle" class="drawing-tools-toggle" aria-expanded="false" aria-controls="drawing-advanced-tools">颜色与粗细 · 展开</button>
        <div id="drawing-advanced-tools" class="drawing-advanced-tools">
        <fieldset class="drawing-tool-group drawing-colors"><legend>给想象一点颜色 <span id="drawing-color-name">森林绿</span></legend><div class="drawing-color-options">
          ${DRAWING_COLORS.map((color, index) => `<button type="button" data-drawing-color="${color.value}" data-color-name="${color.name}" aria-label="${color.name}" aria-pressed="${index === 0}" title="${color.name}" style="--swatch:${color.value}"><span aria-hidden="true"></span></button>`).join('')}
        </div><label class="drawing-custom-color" for="drawing-custom-color"><span class="drawing-color-wheel" aria-hidden="true">＋</span><span>调一个自己的颜色</span><input type="color" id="drawing-custom-color" value="${DRAWING_COLORS[0].value}" aria-label="选择自定义画笔颜色"/></label></fieldset>
        <fieldset class="drawing-tool-group drawing-size"><legend><label for="drawing-size">画笔粗细</label><output id="drawing-size-value" for="drawing-size">8</output></legend><div class="drawing-size-control"><span aria-hidden="true">细</span><input type="range" id="drawing-size" min="2" max="48" step="1" value="8" aria-label="画笔粗细"/><span aria-hidden="true">粗</span></div><div class="drawing-preview"><span id="drawing-brush-preview" style="width:8px;height:8px;background:${DRAWING_COLORS[0].value}"></span><span>试试大大小小的线条</span></div></fieldset>
        </div>
        <div class="drawing-toolbox-note">${icon ? icon('heart', 14) : drawingIcon('spark', 14)}<span>每一笔，都是独一无二的你。</span></div>
      </aside>
      <div class="drawing-paper-area">
        <section class="drawing-tracing-panel" aria-label="选择临摹底稿">
          <div class="drawing-tracing-groups" role="group" aria-label="临摹类型">
            <button type="button" data-tracing-group="free" aria-pressed="true">自由画画</button>
            <button type="button" data-tracing-group="numbers" aria-pressed="false">数字 0–10</button>
            <button type="button" data-tracing-group="alphabet" aria-pressed="false">字母 Aa–Zz</button>
          </div>
          <div id="drawing-tracing-controls" class="drawing-tracing-controls" hidden>
            <div class="drawing-tracing-stepper" role="group" aria-label="切换临摹字符">
              <button type="button" id="drawing-tracing-previous" aria-label="上一个临摹字符" title="上一个">‹</button>
              <span class="drawing-tracing-selection"><span>正在临摹</span><strong id="drawing-tracing-current">0</strong></span>
              <button type="button" id="drawing-tracing-next" aria-label="下一个临摹字符" title="下一个">›</button>
            </div>
            <details class="drawing-tracing-chooser" id="drawing-tracing-chooser">
              <summary>选择字符 <span aria-hidden="true">⌄</span></summary>
              <div id="drawing-tracing-picker" class="drawing-tracing-picker" role="group" aria-label="选择要临摹的字符"></div>
            </details>
            <p id="drawing-tracing-hint">沿着虚线描一描；切换字符会自动清空笔迹。</p>
          </div>
        </section>
        <div class="drawing-paper-toolbar"><span class="drawing-paper-label"><i aria-hidden="true"></i>我的画纸</span><div class="drawing-paper-actions"><button type="button" id="drawing-undo" aria-label="撤销上一笔" title="撤销上一笔（Ctrl / ⌘ Z）" disabled>${drawingIcon('undo', 18)}<span>撤销</span></button><button type="button" id="drawing-redo" aria-label="重做上一笔" title="重做上一笔（Ctrl / ⌘ Shift Z）" disabled>${drawingIcon('redo', 18)}<span>重做</span></button><span class="drawing-toolbar-divider" aria-hidden="true"></span><button type="button" id="drawing-grid" aria-pressed="false" aria-label="显示网格" title="显示或隐藏网格">${drawingIcon('grid', 18)}<span>网格</span></button><button type="button" id="drawing-clear" aria-label="清空画纸" title="清空画纸">${drawingIcon('clear', 18)}<span>清空</span></button></div></div>
        <div class="drawing-clear-confirm" id="drawing-clear-confirm" role="group" aria-label="确认清空画纸" hidden><div><strong>换一张空白画纸？</strong><span>清空后可以撤销，找回刚才的画。</span></div><div><button type="button" id="drawing-clear-cancel">再画一会</button><button type="button" id="drawing-clear-accept">清空画纸</button></div></div>
        <div class="drawing-paper-mat"><div class="drawing-paper-tape drawing-tape-left" aria-hidden="true"></div><div class="drawing-paper-tape drawing-tape-right" aria-hidden="true"></div><div id="drawing-stage" class="drawing-stage"><canvas id="drawing-tracing-guide" width="1200" height="900" aria-hidden="true"></canvas><canvas id="drawing-canvas" width="1200" height="900" tabindex="0" aria-label="自由涂画区域">浏览器暂不支持画板，请换一个支持 Canvas 的浏览器。</canvas><div id="drawing-empty" class="drawing-empty" aria-hidden="true"><svg width="77" height="67" viewBox="0 0 77 67" fill="none"><path d="M8 47c-8-11 8-29 19-18s-10 28 0 32c11 4 37-29 40-18" stroke="#dce5d5" stroke-width="4" stroke-linecap="round"/><path d="m39 15 8-8 10 10-8 8-10-10Z" fill="#e9c785"/><path d="m38 16-7 18 18-8-11-10Z" fill="#f4e7c8"/><path d="m31 34 3-8 5 5-8 3Z" fill="#a3b495"/><path d="m64 4 1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4Z" fill="#d3bc8f"/></svg><strong>这里，装得下所有奇思妙想</strong><span>点一点，画一画，开始你的创作吧</span></div></div></div>
        <div class="drawing-paper-footer"><p id="drawing-status" role="status">选一支喜欢的颜色，画下第一个小灵感吧</p><span class="drawing-paper-doodle" aria-hidden="true">✷ <i>made with imagination</i></span></div>
      </div>
    </div>`;
}

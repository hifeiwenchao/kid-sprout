const methods = [
  { id: 'wechat', name: '微信', image: '/support/wechat-pay.jpg', width: 374, height: 373 },
  { id: 'alipay', name: '支付宝', image: '/support/alipay.jpg', width: 1118, height: 1128 },
];

export function showSupport({ openModal, dialogContent, icon }) {
  openModal(`
    <span class="support-seed" aria-hidden="true">${icon('leaf', 28)}</span>
    <span class="modal-kicker">写给愿意支持的大朋友</span>
    <h2 id="dialog-title">给小芽一点支持</h2>
    <p class="support-intro">如果这里的小练习帮到了您，<br>欢迎支持萌芽启蒙，陪伴更多小发现。</p>
    <div class="support-methods" role="group" aria-label="选择打赏方式">
      ${methods.map((method, index) => `<button type="button" class="support-method support-${method.id}" data-support-method="${method.id}" aria-controls="support-${method.id}-panel" aria-pressed="${index === 0}"><span aria-hidden="true">${method.id === 'wechat' ? '微' : '支'}</span>${method.name}</button>`).join('')}
    </div>
    ${methods.map((method, index) => `<section id="support-${method.id}-panel" data-support-panel="${method.id}" aria-labelledby="support-${method.id}-caption" ${index === 0 ? '' : 'hidden'}>
      <figure class="support-code">
        <img src="${method.image}" width="${method.width}" height="${method.height}" alt="${method.name}打赏收款二维码" decoding="async">
        <figcaption id="support-${method.id}-caption">${method.name}收款码</figcaption>
      </figure>
      <p class="support-instructions">打开${method.name}扫一扫，即可自愿打赏</p>
      <a class="button secondary support-save" href="${method.image}" download="萌芽启蒙-${method.name}收款码.jpg">保存${method.name}收款码</a>
    </section>`).join('')}
    <p class="support-phone-tip">手机上可保存或长按收款码，<br>再打开对应 App 的扫一扫，从相册中识别。</p>
    <p class="support-note">仅供家长操作 · 金额随心，打赏完全自愿<br>所有学习内容均可免费使用，感谢您的陪伴。</p>
  `, 'support-modal');

  const buttons = dialogContent.querySelectorAll('[data-support-method]');
  const panels = dialogContent.querySelectorAll('[data-support-panel]');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      panels.forEach(panel => { panel.hidden = panel.dataset.supportPanel !== button.dataset.supportMethod; });
    });
  });
}

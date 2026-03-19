const { applyResponsiveDialogLayout } = require('./utils');

function createDialog() {
  const dialog = document.createElement('div');
  Object.assign(dialog.style, {
    position: 'fixed', left: 0, top: 0, display: 'none', pointerEvents: 'auto',
    background: 'rgba(8, 10, 20, 0.95)', backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
    boxSizing: 'border-box', zIndex: '30', color: '#f0f2f5', fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none', overflow: 'hidden', webkitTapHighlightColor: 'transparent'
  });

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.innerHTML = '&times;';
  Object.assign(closeButton.style, {
    position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', border: 'none',
    borderRadius: '50%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)',
    fontSize: '28px', lineHeight: '1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, zIndex: '3', transition: 'background 0.2s ease, transform 0.2s ease'
  });
  closeButton.addEventListener('mouseenter', () => { closeButton.style.background = 'rgba(255,255,255,0.15)'; closeButton.style.transform = 'scale(1.06)'; });
  closeButton.addEventListener('mouseleave', () => { closeButton.style.background = 'rgba(255,255,255,0.08)'; closeButton.style.transform = 'scale(1)'; });
  dialog.appendChild(closeButton);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, { display: 'flex', width: '100%', height: '100%' });
  dialog.appendChild(wrap);

  const previewBox = document.createElement('div');
  Object.assign(previewBox.style, {
    overflow: 'hidden', background: 'rgba(0,0,0,0.3)', cursor: 'grab', borderRadius: '12px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)', touchAction: 'none'
  });
  const previewCanvas = document.createElement('canvas');
  Object.assign(previewCanvas.style, { width: '100%', height: '100%', display: 'block' });
  previewBox.appendChild(previewCanvas);
  wrap.appendChild(previewBox);

  const text = document.createElement('div');
  text.className = 'dialog-scroll';
  Object.assign(text.style, { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: 0, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' });
  if (!document.getElementById('dialog-scrollbar-style')) {
    const style = document.createElement('style');
    style.id = 'dialog-scrollbar-style';
    style.textContent = `.dialog-scroll{scrollbar-width:none;-ms-overflow-style:none}.dialog-scroll::-webkit-scrollbar{display:none}@media(max-width:768px){.dialog-scroll{scrollbar-width:thin;scrollbar-color:rgba(120,140,200,0.5) rgba(8,12,24,0.8)}.dialog-scroll::-webkit-scrollbar{display:block;width:8px}.dialog-scroll::-webkit-scrollbar-track{background:rgba(8,12,24,0.6);border-radius:4px}.dialog-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(100,130,220,0.4),rgba(80,100,180,0.5));border-radius:4px}.dialog-scroll::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgba(120,150,240,0.5),rgba(100,120,200,0.6))}}`;
    document.head.appendChild(style);
  }

  const els = { title: {}, subtitle: {}, controls: {}, stat1: {}, stat2: {}, extra: {} };
  const mk = (tag, style) => {
    const el = document.createElement(tag === 'div' ? 'div' : 'div');
    Object.assign(el.style, style || {});
    text.appendChild(el);
    return el;
  };
  const title = mk('div', { fontWeight: '600', lineHeight: '1.2', marginBottom: '4px', letterSpacing: '-0.02em' });
  const subtitle = mk('div', { fontWeight: '500' });
  const controls = mk('div', { lineHeight: '1.4', color: 'rgba(255,255,255,0.5)' });
  controls.innerHTML = 'Drag to rotate · Scroll to zoom';
  const stat1 = mk('div', { fontWeight: '500', color: 'rgba(255,255,255,0.92)', lineHeight: '1.35' });
  const stat2 = mk('div', { fontWeight: '500', color: 'rgba(255,255,255,0.92)', lineHeight: '1.35' });
  const extra = mk('div', { lineHeight: '1.4', color: 'rgba(255,255,255,0.58)' });
  wrap.appendChild(text);

  document.body.appendChild(dialog);
  const ui = { dialog, wrap, closeButton, previewBox, previewCanvas, text, title, subtitle, controls, stat1, stat2, extra };
  applyResponsiveDialogLayout(ui);
  return ui;
}

module.exports = { createDialog };

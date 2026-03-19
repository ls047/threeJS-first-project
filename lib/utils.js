function hexToRgba(hex, alpha) {
  const v = hex.replace('#', '');
  return `rgba(${parseInt(v.slice(0,2),16)}, ${parseInt(v.slice(2,4),16)}, ${parseInt(v.slice(4,6),16)}, ${alpha})`;
}

function getResponsiveDialogMetrics() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw <= 768;
  const isSmallMobile = vw <= 520;
  const margin = Math.max(8, Math.min(16, vw * 0.025));
  const width = Math.min(400, vw - margin * 2);
  const maxHeight = vh - margin * 2;
  let previewSize, height;
  if (isSmallMobile) { previewSize = Math.min(120, width - 32); height = Math.min(maxHeight, previewSize + 175); }
  else if (isMobile) { previewSize = Math.min(140, width - 36); height = Math.min(maxHeight, previewSize + 180); }
  else { previewSize = Math.max(120, Math.min(160, width * 0.42)); height = Math.min(maxHeight, Math.max(260, previewSize + 100)); }
  return { vw, vh, isMobile, isSmallMobile, margin, width, height, previewSize };
}

function applyResponsiveDialogLayout(dialogUI) {
  const { isMobile, width, height, previewSize } = getResponsiveDialogMetrics();
  dialogUI.dialog.style.width = `${width}px`;
  dialogUI.dialog.style.height = `${height}px`;
  dialogUI.dialog.style.padding = isMobile ? '12px' : '16px';
  dialogUI.dialog.style.borderRadius = isMobile ? '14px' : '16px';
  dialogUI.closeButton.style.top = isMobile ? '6px' : '8px';
  dialogUI.closeButton.style.right = isMobile ? '6px' : '8px';
  dialogUI.closeButton.style.width = isMobile ? '28px' : '30px';
  dialogUI.closeButton.style.height = isMobile ? '28px' : '30px';
  dialogUI.closeButton.style.fontSize = isMobile ? '18px' : '20px';
  dialogUI.wrap.style.flexDirection = isMobile ? 'column' : 'row';
  dialogUI.wrap.style.gap = isMobile ? '10px' : '14px';
  dialogUI.previewBox.style.width = dialogUI.previewBox.style.height = `${previewSize}px`;
  dialogUI.previewBox.style.flex = `0 0 ${previewSize}px`;
  dialogUI.previewBox.style.alignSelf = isMobile ? 'center' : 'stretch';
  dialogUI.previewBox.style.borderRadius = isMobile ? '10px' : '12px';
  dialogUI.text.style.paddingTop = isMobile ? '20px' : '4px';
  ['title','subtitle','controls','stat1','stat2','extra'].forEach((k, i) => {
    const el = dialogUI[k];
    el.style.fontSize = isMobile ? [20,11,11,13,13,11][i] + 'px' : [26,13,12,14,14,12][i] + 'px';
  });
  dialogUI.subtitle.style.marginBottom = isMobile ? '6px' : '8px';
  dialogUI.controls.style.marginBottom = isMobile ? '8px' : '10px';
  dialogUI.stat1.style.marginBottom = isMobile ? '4px' : '6px';
  dialogUI.stat2.style.marginBottom = isMobile ? '6px' : '8px';
  return getResponsiveDialogMetrics();
}

module.exports = { hexToRgba, getResponsiveDialogMetrics, applyResponsiveDialogLayout };

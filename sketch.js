const canvasSketch = require('canvas-sketch');
const { preloadAssets } = require('./lib/preload');
const { createLoaderUI } = require('./lib/loader-ui');
const createSketch = require('./lib/sketch-scene');

document.title = '🌌 SPACE';
document.documentElement.style.webkitTapHighlightColor = 'transparent';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = '#000';
document.body.style.touchAction = 'none';
document.body.style.webkitTapHighlightColor = 'transparent';

const settings = { animate: true, context: 'webgl', attributes: { antialias: true } };

function runAfterPreload() {
  const loader = createLoaderUI();
  loader.btn.addEventListener('click', () => {
    loader.done();
    canvasSketch(createSketch(), settings);
  });

  preloadAssets((p) => loader.setProgress(p))
    .then(() => {
      loader.setProgress(100);
      loader.setStatus('100% · Ready');
      loader.ready();
    })
    .catch(() => {
      loader.setProgress(100);
      loader.setStatus('100% · Ready');
      loader.ready();
    });
}

runAfterPreload();

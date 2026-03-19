const THREE = require('three');

const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

function createStarBackgroundTexture(w, h) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 350 }, () => ({
    x: Math.random(), y: Math.random(),
    size: 0.2 + Math.random() * 0.5,
    alpha: 0.35 + Math.random() * 0.4
  }));
  function draw(dw, dh) {
    const pw = Math.pow(2, Math.ceil(Math.log2(Math.max(1, dw))));
    const ph = Math.pow(2, Math.ceil(Math.log2(Math.max(1, dh))));
    canvas.width = Math.min(pw, 2048);
    canvas.height = Math.min(ph, 1024);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      const x = s.x * canvas.width, y = s.y * canvas.height;
      const size = Math.max(0.5, s.size * (Math.min(canvas.width, canvas.height) / 1000));
      const g = ctx.createRadialGradient(x, y, 0, x, y, size);
      g.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
      g.addColorStop(0.4, `rgba(255,255,255,${s.alpha * 0.3})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  draw(w || 1920, h || 1080);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return { texture, draw };
}

module.exports = { loadTexture, createStarBackgroundTexture };

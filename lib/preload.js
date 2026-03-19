const { planets } = require('./planets');

function getPreloadUrls() {
  const urls = [...planets.map((p) => p.texture)];
  planets.filter((p) => p.ring).forEach((p) => urls.push(p.ringTexture));
  urls.push('images/lebron-sunshine.png', 'audio/Lebron James flashbang.mp3');
  return [...new Set(urls)];
}

function preloadAssets(onProgress) {
  const urls = getPreloadUrls();
  const total = urls.length;
  let loaded = 0;

  return new Promise((resolve) => {
    if (total === 0) {
      onProgress(100);
      resolve();
      return;
    }

    let resolved = false;
    const finish = () => { if (!resolved) { resolved = true; resolve(); } };
    const tick = () => {
      loaded++;
      onProgress(Math.min(100, Math.round((loaded / total) * 100)));
      if (loaded >= total) finish();
    };

    setTimeout(finish, 15000);

    urls.forEach((url) => {
      const ext = url.split('.').pop().toLowerCase();
      if (ext === 'mp3' || ext === 'ogg' || ext === 'wav') {
        const a = new Audio();
        let done = false;
        const doneTick = () => { if (!done) { done = true; tick(); } };
        a.addEventListener('canplaythrough', doneTick, { once: true });
        a.addEventListener('loadeddata', doneTick, { once: true });
        a.addEventListener('error', doneTick);
        a.src = url;
        setTimeout(doneTick, 8000);
      } else {
        const img = new Image();
        img.onload = tick;
        img.onerror = tick;
        img.src = url;
      }
    });
  });
}

module.exports = { preloadAssets };
